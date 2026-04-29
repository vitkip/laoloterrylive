<?php
require_once __DIR__ . '/config.php';

if (PRODUCTION) {
    error_reporting(0);
    ini_set('display_errors', '0');
}

$origin = isset($_SERVER['HTTP_ORIGIN']) ? $_SERVER['HTTP_ORIGIN'] : '';
$allowedOrigin = in_array($origin, ALLOWED_ORIGINS, true) ? $origin : ALLOWED_ORIGINS[0];
header("Access-Control-Allow-Origin: " . $allowedOrigin);
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

define('SECRET_KEY', JWT_SECRET);

function getAuthorizationHeader()
{
    // 1. Try apache_request_headers() with case-insensitive search
    if (function_exists('apache_request_headers')) {
        $apacheHeaders = apache_request_headers();
        if (is_array($apacheHeaders)) {
            foreach ($apacheHeaders as $key => $value) {
                if (strtolower($key) === 'authorization') {
                    return $value;
                }
            }
        }
    }
    // 2. mod_rewrite pass-through (set in api/.htaccess)
    if (!empty($_SERVER['HTTP_AUTHORIZATION'])) {
        return $_SERVER['HTTP_AUTHORIZATION'];
    }
    // 3. CGI / suPHP redirect variant
    if (!empty($_SERVER['REDIRECT_HTTP_AUTHORIZATION'])) {
        return $_SERVER['REDIRECT_HTTP_AUTHORIZATION'];
    }
    return '';
}

function verifyToken()
{
    $authHeader = getAuthorizationHeader();
    if (!$authHeader || !preg_match('/Bearer\s(\S+)/i', $authHeader, $matches)) {
        return false;
    }
    $token = $matches[1];
    $parts = explode('.', $token);
    if (count($parts) !== 3) return false;

    // Verify signature
    $signature = hash_hmac('sha256', $parts[0] . '.' . $parts[1], SECRET_KEY, true);
    $expected   = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($signature));
    if (!hash_equals($expected, $parts[2])) return false;

    // Decode payload
    $payload = json_decode(base64_decode(str_replace(['-', '_'], ['+', '/'], $parts[1])), true);
    if (!is_array($payload)) return false;

    // Check expiry
    if (empty($payload['exp']) || $payload['exp'] < time()) {
        return 'expired'; // distinct value so caller can give better error
    }

    return $payload;
}

/**
 * Verify token and optionally check role.
 * Exits with JSON error if auth fails. Returns payload on success.
 * $role: 'admin' | 'staff' | null (any authenticated user)
 */
function requireAuth($role = null)
{
    $payload = verifyToken();
    if ($payload === 'expired') {
        http_response_code(401);
        echo json_encode(["error" => "ໝົດເວລາ session — ກະລຸນາ login ໃໝ່", "code" => "TOKEN_EXPIRED"]);
        exit();
    }
    if (!$payload || !is_array($payload)) {
        http_response_code(401);
        echo json_encode(["error" => "Unauthorized — token invalid or missing", "code" => "TOKEN_INVALID"]);
        exit();
    }
    if ($role === 'admin' && $payload['role'] !== 'admin') {
        http_response_code(403);
        echo json_encode(["error" => "ສິດທິ Admin ເທົ່ານັ້ນ", "code" => "FORBIDDEN"]);
        exit();
    }
    if ($role === 'staff' && !in_array($payload['role'], ['admin', 'staff'], true)) {
        http_response_code(403);
        echo json_encode(["error" => "Forbidden", "code" => "FORBIDDEN"]);
        exit();
    }
    return $payload;
}

$conn = new mysqli(DB_HOST, DB_USER, DB_PASS, DB_NAME);
if ($conn->connect_error) {
    http_response_code(500);
    echo json_encode(["error" => "Database connection failed"]);
    exit();
}
$conn->set_charset("utf8mb4");

$action = isset($_GET['action']) ? $_GET['action'] : '';

switch ($action) {
    case 'animals':
        $result = $conn->query("SELECT * FROM animals ORDER BY animal_id ASC");
        $data = $result->fetch_all(MYSQLI_ASSOC);
        echo json_encode($data);
        break;

    case 'draws':
        // Get draws with their details nested
        $drawsResult = $conn->query("SELECT * FROM lottery_draws ORDER BY draw_date DESC, draw_number DESC");
        $draws = [];
        $detailStmt = $conn->prepare("SELECT * FROM draw_results_detail WHERE draw_id = ?");
        while ($row = $drawsResult->fetch_assoc()) {
            $drawId = (int) $row['draw_id'];
            $detailStmt->bind_param("i", $drawId);
            $detailStmt->execute();
            $row['results_detail'] = $detailStmt->get_result()->fetch_all(MYSQLI_ASSOC);
            $draws[] = $row;
        }
        $detailStmt->close();
        echo json_encode($draws);
        break;

    case 'types':
        $result = $conn->query("SELECT * FROM lottery_types");
        $data = $result->fetch_all(MYSQLI_ASSOC);
        echo json_encode($data);
        break;

    case 'create_draw':
        if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
            http_response_code(405);
            echo json_encode(["error" => "Only POST allowed for this action"]);
            break;
        }

        $userPayload = requireAuth('staff');
        $userId = (int) $userPayload['user_id'];

        $input = json_decode(file_get_contents('php://input'), true);
        if (!$input) {
            http_response_code(400);
            echo json_encode(["error" => "Invalid JSON payload"]);
            break;
        }

        $type_id = isset($input['type_id']) ? (int) $input['type_id'] : 1;
        $draw_number = isset($input['draw_number']) ? (int) $input['draw_number'] : 0;
        $draw_date = isset($input['draw_date']) ? $conn->real_escape_string($input['draw_date']) : '';
        $full_result = isset($input['full_result']) ? $conn->real_escape_string($input['full_result']) : '';
        $animal_id = isset($input['animal_id']) && $input['animal_id'] ? (int) $input['animal_id'] : null;
        $youtube_url = isset($input['youtube_url']) && $input['youtube_url'] !== '' ? $conn->real_escape_string($input['youtube_url']) : null;

        if (!$draw_number || !$draw_date || strlen($full_result) !== 6) {
            http_response_code(400);
            echo json_encode(["error" => "Missing required fields or full_result length is not 6"]);
            break;
        }

        $conn->begin_transaction();
        try {
            // 1. Insert into lottery_draws
            $stmt = $conn->prepare("INSERT INTO lottery_draws (type_id, draw_number, draw_date, full_result, status, created_by, youtube_url) VALUES (?, ?, ?, ?, 'published', ?, ?)");
            $stmt->bind_param("iissis", $type_id, $draw_number, $draw_date, $full_result, $userId, $youtube_url);
            $stmt->execute();
            $draw_id = $conn->insert_id;
            $stmt->close();

            // 2. Insert details
            $stmt_detail = $conn->prepare("INSERT INTO draw_results_detail (draw_id, prize_type, result_value, animal_id) VALUES (?, ?, ?, ?)");

            $prizes = [
                "6_digits" => $full_result,
                "5_digits" => substr($full_result, 1, 5),
                "4_digits" => substr($full_result, 2, 4),
                "3_digits" => substr($full_result, 3, 3),
                "2_digits" => substr($full_result, 4, 2)
            ];

            foreach ($prizes as $ptype => $val) {
                $a_id = ($ptype === '2_digits') ? $animal_id : null;
                $stmt_detail->bind_param("issi", $draw_id, $ptype, $val, $a_id);
                $stmt_detail->execute();
            }
            $stmt_detail->close();

            $conn->commit();
            echo json_encode(["success" => true, "message" => "Draw added successfully"]);
        } catch (Exception $e) {
            $conn->rollback();
            http_response_code(500);
            echo json_encode(["error" => "Database error: " . $e->getMessage()]);
        }
        break;

    case 'update_draw':
        if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
            http_response_code(405);
            echo json_encode(["error" => "Only POST allowed for this action"]);
            break;
        }

        requireAuth('staff');

        $input = json_decode(file_get_contents('php://input'), true);
        if (!$input || !isset($input['draw_id'])) {
            http_response_code(400);
            echo json_encode(["error" => "Invalid JSON payload or missing draw_id"]);
            break;
        }

        $draw_id = (int) $input['draw_id'];
        $type_id = isset($input['type_id']) ? (int) $input['type_id'] : 1;
        $draw_number = isset($input['draw_number']) ? (int) $input['draw_number'] : 0;
        $draw_date = isset($input['draw_date']) ? $conn->real_escape_string($input['draw_date']) : '';
        $full_result = isset($input['full_result']) ? $conn->real_escape_string($input['full_result']) : '';
        $animal_id = isset($input['animal_id']) && $input['animal_id'] ? (int) $input['animal_id'] : null;
        $youtube_url = isset($input['youtube_url']) && $input['youtube_url'] !== '' ? $conn->real_escape_string($input['youtube_url']) : null;

        if (!$draw_number || !$draw_date || strlen($full_result) !== 6) {
            http_response_code(400);
            echo json_encode(["error" => "Missing required fields or full_result length is not 6"]);
            break;
        }

        $conn->begin_transaction();
        try {
            // 1. Update lottery_draws
            $stmt = $conn->prepare("UPDATE lottery_draws SET type_id=?, draw_number=?, draw_date=?, full_result=?, youtube_url=? WHERE draw_id=?");
            $stmt->bind_param("iisssi", $type_id, $draw_number, $draw_date, $full_result, $youtube_url, $draw_id);
            $stmt->execute();
            $stmt->close();

            // 2. Delete existing details
            $stmt_del = $conn->prepare("DELETE FROM draw_results_detail WHERE draw_id=?");
            $stmt_del->bind_param("i", $draw_id);
            $stmt_del->execute();
            $stmt_del->close();

            // 3. Re-insert details
            $stmt_detail = $conn->prepare("INSERT INTO draw_results_detail (draw_id, prize_type, result_value, animal_id) VALUES (?, ?, ?, ?)");
            $prizes = [
                "6_digits" => $full_result,
                "5_digits" => substr($full_result, 1, 5),
                "4_digits" => substr($full_result, 2, 4),
                "3_digits" => substr($full_result, 3, 3),
                "2_digits" => substr($full_result, 4, 2)
            ];

            foreach ($prizes as $ptype => $val) {
                $a_id = ($ptype === '2_digits') ? $animal_id : null;
                $stmt_detail->bind_param("issi", $draw_id, $ptype, $val, $a_id);
                $stmt_detail->execute();
            }
            $stmt_detail->close();

            $conn->commit();
            echo json_encode(["success" => true, "message" => "Draw updated successfully"]);
        } catch (Exception $e) {
            $conn->rollback();
            http_response_code(500);
            echo json_encode(["error" => "Database error: " . $e->getMessage()]);
        }
        break;

    case 'upload_animal_image':
        if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
            http_response_code(405);
            echo json_encode(["error" => "Only POST allowed for this action"]);
            break;
        }

        requireAuth('staff');

        $animal_id = isset($_POST['animal_id']) ? (int) $_POST['animal_id'] : 0;
        if (!$animal_id || !isset($_FILES['image']) || $_FILES['image']['error'] !== UPLOAD_ERR_OK) {
            http_response_code(400);
            echo json_encode(["error" => "Missing or invalid animal ID or image file"]);
            break;
        }

        $uploadDir = __DIR__ . '/../uploads/animals/';
        if (!is_dir($uploadDir)) {
            mkdir($uploadDir, 0777, true);
        }

        $ext = strtolower(pathinfo($_FILES['image']['name'], PATHINFO_EXTENSION));
        $allowed = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
        if (!in_array($ext, $allowed)) {
            http_response_code(400);
            echo json_encode(["error" => "Invalid file type"]);
            break;
        }

        $fileName = 'animal_' . $animal_id . '_' . time() . '.' . $ext;
        $dest = $uploadDir . $fileName;

        if (move_uploaded_file($_FILES['image']['tmp_name'], $dest)) {
            $imageUrl = '/uploads/animals/' . $fileName;

            $stmt = $conn->prepare("UPDATE animals SET image_url=? WHERE animal_id=?");
            $stmt->bind_param("si", $imageUrl, $animal_id);
            $stmt->execute();
            $stmt->close();

            echo json_encode(["status" => "success", "image_url" => $imageUrl]);
        } else {
            http_response_code(500);
            echo json_encode(["error" => "Failed to move uploaded file"]);
        }
        break;

    case 'list_users':
        $userPayload = requireAuth('admin');
        $res = $conn->query("SELECT user_id, username, full_name, role, is_active, created_at FROM users");
        if (!$res) {
            http_response_code(500);
            echo json_encode(["error" => $conn->error]);
            break;
        }
        echo json_encode($res->fetch_all(MYSQLI_ASSOC));
        break;

    case 'create_user':
        requireAuth('admin');
        $input = json_decode(file_get_contents('php://input'), true);
        $username  = trim($input['username'] ?? '');
        $password  = $input['password'] ?? '';
        $full_name = trim($input['full_name'] ?? '');
        $role      = $input['role'] ?? 'staff';

        if (!in_array($role, ['admin', 'staff'], true)) {
            http_response_code(400);
            echo json_encode(["error" => "Invalid role"]);
            break;
        }
        if (strlen($username) < 4) {
            http_response_code(400);
            echo json_encode(["error" => "Username must be at least 4 characters"]);
            break;
        }
        if (strlen($password) < 6) {
            http_response_code(400);
            echo json_encode(["error" => "Password must be at least 6 characters"]);
            break;
        }

        $password_hash = password_hash($password, PASSWORD_DEFAULT);
        $stmt = $conn->prepare("INSERT INTO users (username, password_hash, full_name, role) VALUES (?, ?, ?, ?)");
        $stmt->bind_param("ssss", $username, $password_hash, $full_name, $role);
        if ($stmt->execute())
            echo json_encode(["success" => true]);
        else {
            http_response_code(500);
            echo json_encode(["error" => "Username already exists or database error"]);
        }
        $stmt->close();
        break;

    case 'update_user':
        $userPayload = requireAuth('admin');
        $input     = json_decode(file_get_contents('php://input'), true);
        $user_id   = (int) ($input['user_id'] ?? 0);
        $full_name = trim($input['full_name'] ?? '');
        $role      = $input['role'] ?? 'staff';
        $is_active = (int) ($input['is_active'] ?? 1);

        if ($user_id <= 0) {
            http_response_code(400);
            echo json_encode(["error" => "Invalid user_id"]);
            break;
        }
        if (!in_array($role, ['admin', 'staff'], true)) {
            http_response_code(400);
            echo json_encode(["error" => "Invalid role"]);
            break;
        }

        // Protect last active admin from being demoted or disabled
        $currentRow = $conn->query("SELECT role FROM users WHERE user_id={$user_id}")->fetch_assoc();
        if ($currentRow && $currentRow['role'] === 'admin') {
            if ($role !== 'admin' || $is_active === 0) {
                $adminCount = (int) $conn->query("SELECT COUNT(*) AS cnt FROM users WHERE role='admin' AND is_active=1")->fetch_assoc()['cnt'];
                if ($adminCount <= 1) {
                    http_response_code(400);
                    echo json_encode(["error" => "ບໍ່ສາມາດ demote/disable Admin ຄົນສຸດທ້າຍໄດ້"]);
                    break;
                }
            }
        }

        $sql = "UPDATE users SET full_name=?, role=?, is_active=? WHERE user_id=?";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param("ssii", $full_name, $role, $is_active, $user_id);
        if ($stmt->execute())
            echo json_encode(["success" => true]);
        else {
            http_response_code(500);
            echo json_encode(["error" => $conn->error]);
        }
        $stmt->close();
        break;

    case 'delete_user':
        $userPayload = requireAuth('admin');
        $input = json_decode(file_get_contents('php://input'), true);
        $user_id = (int) ($input['user_id'] ?? 0);
        if ($user_id <= 0) {
            http_response_code(400);
            echo json_encode(["error" => "Invalid user_id"]);
            break;
        }
        if ($user_id === $userPayload['user_id']) {
            http_response_code(400);
            echo json_encode(["error" => "ບໍ່ສາມາດລຶບຕົນເອງໄດ້"]);
            break;
        }
        // Protect last active admin
        $targetRole = $conn->query("SELECT role FROM users WHERE user_id={$user_id}")->fetch_assoc()['role'] ?? '';
        if ($targetRole === 'admin') {
            $adminCount = (int) $conn->query("SELECT COUNT(*) AS cnt FROM users WHERE role='admin' AND is_active=1")->fetch_assoc()['cnt'];
            if ($adminCount <= 1) {
                http_response_code(400);
                echo json_encode(["error" => "ບໍ່ສາມາດລຶບ Admin ຄົນສຸດທ້າຍໄດ້"]);
                break;
            }
        }
        $stmt = $conn->prepare("DELETE FROM users WHERE user_id=?");
        $stmt->bind_param("i", $user_id);
        if ($stmt->execute())
            echo json_encode(["success" => true]);
        else {
            http_response_code(500);
            echo json_encode(["error" => $conn->error]);
        }
        $stmt->close();
        break;

    case 'change_password':
        $userPayload = requireAuth();
        $input = json_decode(file_get_contents('php://input'), true);
        // Admin can change anyone's password if they provide target_user_id. Otherwise, change own.
        $target_id = (isset($input['target_user_id']) && $userPayload['role'] === 'admin') ? (int) $input['target_user_id'] : $userPayload['user_id'];

        if ($target_id === $userPayload['user_id'] && $userPayload['role'] !== 'admin') {
            // Normal user must provide current password
            $current_pass = $input['current_password'] ?? '';
            $hash_stmt = $conn->prepare("SELECT password_hash FROM users WHERE user_id=?");
            $hash_stmt->bind_param("i", $target_id);
            $hash_stmt->execute();
            $row = $hash_stmt->get_result()->fetch_assoc();
            $hash_stmt->close();
            if (!$row || !password_verify($current_pass, $row['password_hash'])) {
                http_response_code(400);
                echo json_encode(["error" => "ລະຫັດຜ່ານເກົ່າບໍ່ຖືກຕ້ອງ"]);
                break;
            }
        }

        $new_pass_hash = password_hash($input['new_password'], PASSWORD_DEFAULT);
        $stmt = $conn->prepare("UPDATE users SET password_hash=? WHERE user_id=?");
        $stmt->bind_param("si", $new_pass_hash, $target_id);
        if ($stmt->execute())
            echo json_encode(["success" => true]);
        else {
            http_response_code(500);
            echo json_encode(["error" => "Database error"]);
        }
        break;

    case 'live_settings':
        $res = $conn->query("SELECT setting_key, setting_value FROM system_settings WHERE setting_key IN ('youtube_live_url', 'is_live', 'live_source')");
        $settings = [];
        while ($row = $res->fetch_assoc()) {
            $settings[$row['setting_key']] = $row['setting_value'];
        }
        if (!isset($settings['live_source'])) $settings['live_source'] = 'youtube';
        echo json_encode($settings);
        break;

    case 'update_live_settings':
        requireAuth('staff');
        $input = json_decode(file_get_contents('php://input'), true);
        $url     = isset($input['youtube_live_url']) ? substr($input['youtube_live_url'], 0, 500) : '';
        $is_live = isset($input['is_live']) && $input['is_live'] === '1' ? '1' : '0';
        $source  = isset($input['live_source']) && in_array($input['live_source'], ['youtube', 'facebook', 'web']) ? $input['live_source'] : 'youtube';

        $stmt1 = $conn->prepare("UPDATE system_settings SET setting_value=? WHERE setting_key='youtube_live_url'");
        $stmt1->bind_param("s", $url);
        $stmt1->execute();
        $stmt1->close();

        $stmt2 = $conn->prepare("UPDATE system_settings SET setting_value=? WHERE setting_key='is_live'");
        $stmt2->bind_param("s", $is_live);
        $stmt2->execute();
        $stmt2->close();

        $stmt3 = $conn->prepare("INSERT INTO system_settings (setting_key, setting_value) VALUES ('live_source', ?) ON DUPLICATE KEY UPDATE setting_value=?");
        $stmt3->bind_param("ss", $source, $source);
        $stmt3->execute();
        $stmt3->close();

        echo json_encode(["success" => true]);
        break;

    case 'track_visit':
        if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
            http_response_code(405);
            echo json_encode(["error" => "Only POST allowed"]);
            break;
        }
        $input = json_decode(file_get_contents('php://input'), true);
        $page_path = isset($input['page']) ? substr($conn->real_escape_string($input['page']), 0, 255) : '/';
        $session_id = isset($input['session_id']) ? substr($conn->real_escape_string($input['session_id']), 0, 64) : '';

        // Get real IP
        $ip = '';
        if (!empty($_SERVER['HTTP_X_FORWARDED_FOR'])) {
            $ip = explode(',', $_SERVER['HTTP_X_FORWARDED_FOR'])[0];
        } elseif (!empty($_SERVER['HTTP_CLIENT_IP'])) {
            $ip = $_SERVER['HTTP_CLIENT_IP'];
        } else {
            $ip = $_SERVER['REMOTE_ADDR'] ?? '';
        }
        $ip = substr(filter_var(trim($ip), FILTER_VALIDATE_IP) ?: '', 0, 45);
        $ua = substr($_SERVER['HTTP_USER_AGENT'] ?? '', 0, 500);

        $stmt = $conn->prepare("INSERT INTO visitor_stats (ip_address, page_path, user_agent, session_id) VALUES (?, ?, ?, ?)");
        $stmt->bind_param("ssss", $ip, $page_path, $ua, $session_id);
        $stmt->execute();
        $stmt->close();
        echo json_encode(["success" => true]);
        break;

    case 'visitor_stats':
        requireAuth('admin');

        // Total visits all time
        $total = $conn->query("SELECT COUNT(*) AS cnt FROM visitor_stats")->fetch_assoc()['cnt'];

        // Unique sessions all time
        $unique = $conn->query("SELECT COUNT(DISTINCT session_id) AS cnt FROM visitor_stats WHERE session_id != ''")->fetch_assoc()['cnt'];

        // Today
        $today = $conn->query("SELECT COUNT(*) AS cnt FROM visitor_stats WHERE DATE(visited_at) = CURDATE()")->fetch_assoc()['cnt'];
        $today_unique = $conn->query("SELECT COUNT(DISTINCT session_id) AS cnt FROM visitor_stats WHERE DATE(visited_at) = CURDATE() AND session_id != ''")->fetch_assoc()['cnt'];

        // This week
        $week = $conn->query("SELECT COUNT(*) AS cnt FROM visitor_stats WHERE visited_at >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)")->fetch_assoc()['cnt'];

        // This month
        $month = $conn->query("SELECT COUNT(*) AS cnt FROM visitor_stats WHERE YEAR(visited_at)=YEAR(CURDATE()) AND MONTH(visited_at)=MONTH(CURDATE())")->fetch_assoc()['cnt'];

        // Last 7 days daily breakdown
        $daily_res = $conn->query("
            SELECT DATE(visited_at) AS day,
                   COUNT(*) AS visits,
                   COUNT(DISTINCT session_id) AS unique_visitors
            FROM visitor_stats
            WHERE visited_at >= DATE_SUB(CURDATE(), INTERVAL 6 DAY)
            GROUP BY DATE(visited_at)
            ORDER BY day ASC
        ");
        $daily = [];
        while ($row = $daily_res->fetch_assoc()) $daily[] = $row;

        // Top pages
        $pages_res = $conn->query("
            SELECT page_path, COUNT(*) AS visits
            FROM visitor_stats
            GROUP BY page_path
            ORDER BY visits DESC
            LIMIT 10
        ");
        $top_pages = [];
        while ($row = $pages_res->fetch_assoc()) $top_pages[] = $row;

        echo json_encode([
            "total" => (int)$total,
            "unique_sessions" => (int)$unique,
            "today" => (int)$today,
            "today_unique" => (int)$today_unique,
            "this_week" => (int)$week,
            "this_month" => (int)$month,
            "daily" => $daily,
            "top_pages" => $top_pages,
        ]);
        break;

    default:
        http_response_code(400);
        echo json_encode(["error" => "Unknown action"]);
        break;
}

$conn->close();
?>