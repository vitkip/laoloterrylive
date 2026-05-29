<?php
require_once __DIR__ . '/config.php';

if (PRODUCTION) {
    error_reporting(0);
    ini_set('display_errors', '0');
}

$origin = isset($_SERVER['HTTP_ORIGIN']) ? $_SERVER['HTTP_ORIGIN'] : '';
$allowedOrigin = in_array($origin, ALLOWED_ORIGINS, true) ? $origin : ALLOWED_ORIGINS[0];
header("Access-Control-Allow-Origin: " . $allowedOrigin);
header("Access-Control-Allow-Credentials: true");
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
        // Static data — cache for 5 minutes
        header('Cache-Control: public, max-age=300');
        $result = $conn->query("
            SELECT animal_id, animal_name_lao, animal_numbers, image_url
            FROM   animals
            ORDER  BY animal_id ASC
        ");
        echo json_encode($result->fetch_all(MYSQLI_ASSOC));
        break;

    case 'draws':
        // ETag: cheap COUNT+MAX query → if nothing changed, return 304 (no body)
        $etag_res = $conn->query("SELECT MAX(draw_id) as mid, COUNT(*) as cnt FROM lottery_draws");
        $etag_row = $etag_res->fetch_assoc();
        $etag = '"' . md5($etag_row['mid'] . '_' . $etag_row['cnt']) . '"';
        header("ETag: $etag");
        header('Vary: Accept-Encoding');
        if (
            isset($_SERVER['HTTP_IF_NONE_MATCH']) &&
            $_SERVER['HTTP_IF_NONE_MATCH'] === $etag
        ) {
            http_response_code(304);
            exit();
        }

        // Cache 60s — most users see cached response; new draws invalidate within 1 min
        header('Cache-Control: public, max-age=60, stale-while-revalidate=300');

        // ?year=YYYY — fetch all draws for a specific year (no LIMIT; a year has ~150 draws max)
        $yearFilter = isset($_GET['year']) ? (int)$_GET['year'] : 0;

        // Limit rows to prevent unbounded growth as DB accumulates years of data.
        // Default 600 draws (~2 years of 3x/week), max 2000. Pass ?limit=N to override.
        $limit = isset($_GET['limit']) ? min(max((int)$_GET['limit'], 1), 2000) : 600;

        // Check if youtube_url column exists (not in base schema — added by migration)
        $hasYoutubeCol = $conn->query(
            "SELECT COUNT(*) AS c FROM information_schema.COLUMNS
             WHERE TABLE_SCHEMA = DATABASE()
               AND TABLE_NAME   = 'lottery_draws'
               AND COLUMN_NAME  = 'youtube_url'"
        )->fetch_assoc()['c'] > 0;

        // Single JOIN query instead of N+1 — explicit columns, prepared statement
        // youtube_url is optional: degrade gracefully if column not yet migrated
        $ytInner = $hasYoutubeCol ? ', youtube_url' : '';
        $ytOuter = $hasYoutubeCol ? 'd.youtube_url,' : 'NULL AS youtube_url,';

        if ($yearFilter > 0) {
            // Fetch ALL draws for the requested year (used by frontend lazy-loading)
            $sql = "
                SELECT
                    d.draw_id, d.type_id, d.draw_number, d.draw_date,
                    d.full_result, d.status, d.created_by, {$ytOuter}
                    dr.detail_id, dr.prize_type, dr.result_value,
                    dr.animal_id AS detail_animal_id
                FROM (
                    SELECT draw_id, type_id, draw_number, draw_date,
                           full_result, status, created_by{$ytInner}
                    FROM   lottery_draws
                    WHERE  YEAR(draw_date) = ?
                    ORDER  BY draw_date DESC, draw_number DESC
                ) d
                LEFT JOIN draw_results_detail dr ON dr.draw_id = d.draw_id
                ORDER BY d.draw_date DESC, d.draw_number DESC, dr.detail_id ASC
            ";
            $drawStmt = $conn->prepare($sql);
            $drawStmt->bind_param('i', $yearFilter);
        } else {
            $sql = "
                SELECT
                    d.draw_id, d.type_id, d.draw_number, d.draw_date,
                    d.full_result, d.status, d.created_by, {$ytOuter}
                    dr.detail_id, dr.prize_type, dr.result_value,
                    dr.animal_id AS detail_animal_id
                FROM (
                    SELECT draw_id, type_id, draw_number, draw_date,
                           full_result, status, created_by{$ytInner}
                    FROM   lottery_draws
                    ORDER  BY draw_date DESC, draw_number DESC
                    LIMIT  ?
                ) d
                LEFT JOIN draw_results_detail dr ON dr.draw_id = d.draw_id
                ORDER BY d.draw_date DESC, d.draw_number DESC, dr.detail_id ASC
            ";
            $drawStmt = $conn->prepare($sql);
            $drawStmt->bind_param('i', $limit);
        }
        $drawStmt->execute();
        $result = $drawStmt->get_result();
        $drawsMap = [];
        $drawOrder = [];
        while ($row = $result->fetch_assoc()) {
            $did = (int) $row['draw_id'];
            if (!isset($drawsMap[$did])) {
                $drawsMap[$did] = [
                    'draw_id' => $row['draw_id'],
                    'type_id' => $row['type_id'],
                    'draw_number' => $row['draw_number'],
                    'draw_date' => $row['draw_date'],
                    'full_result' => $row['full_result'],
                    'status' => $row['status'],
                    'created_by' => $row['created_by'],
                    'youtube_url' => $row['youtube_url'] ?? null,
                    'results_detail' => [],
                ];
                $drawOrder[] = $did;
            }
            if ($row['detail_id'] !== null) {
                $drawsMap[$did]['results_detail'][] = [
                    'detail_id' => $row['detail_id'],
                    'draw_id' => $row['draw_id'],
                    'prize_type' => $row['prize_type'],
                    'result_value' => $row['result_value'],
                    'animal_id' => $row['detail_animal_id'],
                ];
            }
        }
        $draws = [];
        foreach ($drawOrder as $did) {
            $draws[] = $drawsMap[$did];
        }
        $drawStmt->close();
        echo json_encode($draws);
        break;

    case 'types':
        // Static data — cache for 10 minutes
        header('Cache-Control: public, max-age=600');
        $result = $conn->query("
            SELECT type_id, type_name, schedule, color, is_active
            FROM   lottery_types
            ORDER  BY type_id ASC
        ");
        $typeRows = $result->fetch_all(MYSQLI_ASSOC);
        foreach ($typeRows as &$tr) {
            $tr['type_id']   = (int) $tr['type_id'];
            $tr['is_active'] = (int) $tr['is_active'];
        }
        unset($tr);
        echo json_encode($typeRows);
        break;

    case 'draw_years':
        // Returns distinct years grouped by type_id from the full table
        // Response: { "1": ["2026","2025",...], "2": ["2026",...], ..., "all": ["2026","2025",...] }
        header('Cache-Control: public, max-age=60, stale-while-revalidate=300');
        $res = $conn->query(
            "SELECT type_id, YEAR(draw_date) AS y
             FROM lottery_draws
             GROUP BY type_id, y
             ORDER BY type_id ASC, y DESC"
        );
        $byType = [];
        $allSet = [];
        while ($row = $res->fetch_assoc()) {
            $tid = (string)(int) $row['type_id'];
            $yr  = (string)(int) $row['y'];
            $byType[$tid][] = $yr;
            $allSet[$yr]    = true;
        }
        krsort($allSet);
        $byType['all'] = array_keys($allSet);
        echo json_encode($byType);
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
        requireAuth('staff');

        $search   = trim($_GET['search'] ?? '');
        $roleF    = $_GET['role'] ?? '';
        $activeF  = $_GET['is_active'] ?? '';
        $page     = max(1, (int)($_GET['page'] ?? 1));
        $perPage  = min(100, max(5, (int)($_GET['per_page'] ?? 20)));
        $sortBy   = in_array($_GET['sort'] ?? '', ['username','full_name','role','created_at','is_active']) ? $_GET['sort'] : 'created_at';
        $sortDir  = strtoupper($_GET['dir'] ?? 'DESC') === 'ASC' ? 'ASC' : 'DESC';
        $offset   = ($page - 1) * $perPage;

        $where  = [];
        $params = [];
        $types  = '';

        if ($search !== '') {
            $where[]  = "(username LIKE ? OR full_name LIKE ? OR email LIKE ?)";
            $like     = '%' . $search . '%';
            $params   = array_merge($params, [$like, $like, $like]);
            $types   .= 'sss';
        }
        if ($roleF !== '' && in_array($roleF, ['admin','staff','member'], true)) {
            $where[]  = "role = ?";
            $params[] = $roleF;
            $types   .= 's';
        }
        if ($activeF !== '') {
            $where[]  = "is_active = ?";
            $params[] = (int)$activeF;
            $types   .= 'i';
        }

        $whereSql = $where ? 'WHERE ' . implode(' AND ', $where) : '';
        $orderSql = "ORDER BY {$sortBy} {$sortDir}";

        // Count total
        $countSql  = "SELECT COUNT(*) AS total FROM users {$whereSql}";
        $countStmt = $conn->prepare($countSql);
        if ($types && $params) {
            $countStmt->bind_param($types, ...$params);
        }
        $countStmt->execute();
        $total = (int)$countStmt->get_result()->fetch_assoc()['total'];
        $countStmt->close();

        // Fetch page
        $sql  = "SELECT user_id, username, full_name, role, email, phone_number, is_active, created_at, updated_at FROM users {$whereSql} {$orderSql} LIMIT ? OFFSET ?";
        $stmt = $conn->prepare($sql);
        if ($types && $params) {
            $allTypes  = $types . 'ii';
            $allParams = array_merge($params, [$perPage, $offset]);
            $stmt->bind_param($allTypes, ...$allParams);
        } else {
            $stmt->bind_param('ii', $perPage, $offset);
        }
        $stmt->execute();
        $users = $stmt->get_result()->fetch_all(MYSQLI_ASSOC);
        $stmt->close();

        echo json_encode([
            'data'        => $users,
            'total'       => $total,
            'page'        => $page,
            'per_page'    => $perPage,
            'total_pages' => (int)ceil($total / $perPage),
        ]);
        break;

    case 'get_user':
        requireAuth('staff');
        $uid = (int)($_GET['user_id'] ?? 0);
        if ($uid <= 0) { http_response_code(400); echo json_encode(["error" => "Invalid user_id"]); break; }
        $stmt = $conn->prepare("SELECT user_id, username, full_name, role, email, phone_number, is_active, created_at, updated_at FROM users WHERE user_id = ?");
        $stmt->bind_param("i", $uid);
        $stmt->execute();
        $row = $stmt->get_result()->fetch_assoc();
        $stmt->close();
        if (!$row) { http_response_code(404); echo json_encode(["error" => "User not found"]); break; }

        // Last login from logs
        $logStmt = $conn->prepare("SELECT created_at, ip_address FROM user_logs WHERE user_id = ? AND action = 'Login success' ORDER BY created_at DESC LIMIT 1");
        $logStmt->bind_param("i", $uid);
        $logStmt->execute();
        $lastLogin = $logStmt->get_result()->fetch_assoc();
        $logStmt->close();
        $row['last_login'] = $lastLogin;
        echo json_encode($row);
        break;

    case 'user_stats':
        requireAuth('staff');
        $row = $conn->query("
            SELECT
                COUNT(*) AS total_users,
                SUM(is_active = 1) AS active_users,
                SUM(is_active = 0) AS inactive_users,
                SUM(role = 'admin') AS admin_count,
                SUM(role = 'staff') AS staff_count,
                SUM(role = 'member') AS member_count
            FROM users
        ")->fetch_assoc();

        $recent = $conn->query("
            SELECT u.user_id, u.username, u.full_name, u.role, l.created_at AS logged_at, l.ip_address
            FROM user_logs l
            JOIN users u ON u.user_id = l.user_id
            WHERE l.action = 'Login success'
            ORDER BY l.created_at DESC
            LIMIT 5
        ")->fetch_all(MYSQLI_ASSOC);

        $newUsers = $conn->query("
            SELECT user_id, username, full_name, role, created_at
            FROM users
            ORDER BY created_at DESC
            LIMIT 5
        ")->fetch_all(MYSQLI_ASSOC);

        echo json_encode([
            'total_users'   => (int)$row['total_users'],
            'active_users'  => (int)$row['active_users'],
            'inactive_users'=> (int)$row['inactive_users'],
            'admin_count'   => (int)$row['admin_count'],
            'staff_count'   => (int)$row['staff_count'],
            'member_count'  => (int)$row['member_count'],
            'recent_logins' => $recent,
            'new_users'     => $newUsers,
        ]);
        break;

    case 'user_logs_list':
        requireAuth('staff');
        $search   = trim($_GET['search'] ?? '');
        $actionF  = trim($_GET['action_filter'] ?? '');
        $dateFrom = trim($_GET['date_from'] ?? '');
        $dateTo   = trim($_GET['date_to'] ?? '');
        $page     = max(1, (int)($_GET['page'] ?? 1));
        $perPage  = min(100, max(5, (int)($_GET['per_page'] ?? 20)));
        $offset   = ($page - 1) * $perPage;

        $where  = [];
        $params = [];
        $types  = '';

        if ($search !== '') {
            $like     = '%' . $search . '%';
            $where[]  = "(u.username LIKE ? OR l.action LIKE ? OR l.ip_address LIKE ?)";
            $params   = array_merge($params, [$like, $like, $like]);
            $types   .= 'sss';
        }
        if ($actionF !== '') {
            $where[]  = "l.action LIKE ?";
            $params[] = '%' . $actionF . '%';
            $types   .= 's';
        }
        if ($dateFrom !== '') {
            $where[]  = "DATE(l.created_at) >= ?";
            $params[] = $dateFrom;
            $types   .= 's';
        }
        if ($dateTo !== '') {
            $where[]  = "DATE(l.created_at) <= ?";
            $params[] = $dateTo;
            $types   .= 's';
        }

        $whereSql = $where ? 'WHERE ' . implode(' AND ', $where) : '';

        $countSql  = "SELECT COUNT(*) AS total FROM user_logs l LEFT JOIN users u ON u.user_id = l.user_id {$whereSql}";
        $countStmt = $conn->prepare($countSql);
        if ($types && $params) $countStmt->bind_param($types, ...$params);
        $countStmt->execute();
        $total = (int)$countStmt->get_result()->fetch_assoc()['total'];
        $countStmt->close();

        $sql  = "SELECT l.log_id, l.user_id, u.username, u.full_name, u.role, l.action, l.ip_address, l.created_at
                 FROM user_logs l LEFT JOIN users u ON u.user_id = l.user_id
                 {$whereSql} ORDER BY l.created_at DESC LIMIT ? OFFSET ?";
        $stmt = $conn->prepare($sql);
        if ($types && $params) {
            $stmt->bind_param($types . 'ii', ...[...$params, $perPage, $offset]);
        } else {
            $stmt->bind_param('ii', $perPage, $offset);
        }
        $stmt->execute();
        $logs = $stmt->get_result()->fetch_all(MYSQLI_ASSOC);
        $stmt->close();

        echo json_encode([
            'data'        => $logs,
            'total'       => $total,
            'page'        => $page,
            'per_page'    => $perPage,
            'total_pages' => (int)ceil($total / $perPage),
        ]);
        break;

    case 'get_profile':
        $p = requireAuth();
        $stmt = $conn->prepare("SELECT user_id, username, full_name, role, email, phone_number, is_active, created_at, updated_at FROM users WHERE user_id = ?");
        $stmt->bind_param("i", $p['user_id']);
        $stmt->execute();
        $row = $stmt->get_result()->fetch_assoc();
        $stmt->close();
        if (!$row) { http_response_code(404); echo json_encode(["error" => "User not found"]); break; }
        // Last 5 activity logs
        $logStmt = $conn->prepare("SELECT log_id, action, ip_address, created_at FROM user_logs WHERE user_id = ? ORDER BY created_at DESC LIMIT 10");
        $logStmt->bind_param("i", $p['user_id']);
        $logStmt->execute();
        $row['recent_activity'] = $logStmt->get_result()->fetch_all(MYSQLI_ASSOC);
        $logStmt->close();
        echo json_encode($row);
        break;

    case 'update_profile':
        $p          = requireAuth();
        $input      = json_decode(file_get_contents('php://input'), true);
        $full_name  = trim($input['full_name'] ?? '');
        $email      = trim($input['email'] ?? '');
        $phone      = trim($input['phone_number'] ?? '');

        if ($full_name === '') { http_response_code(400); echo json_encode(["error" => "ຊື່ເຕັມຫ້າງຫວ່າງ"]); break; }
        if ($email !== '' && !filter_var($email, FILTER_VALIDATE_EMAIL)) {
            http_response_code(400); echo json_encode(["error" => "Email ບໍ່ຖືກຕ້ອງ"]); break;
        }

        $stmt = $conn->prepare("UPDATE users SET full_name=?, email=?, phone_number=? WHERE user_id=?");
        $stmt->bind_param("sssi", $full_name, $email, $phone, $p['user_id']);
        if ($stmt->execute()) {
            $ip = substr($_SERVER['REMOTE_ADDR'] ?? '', 0, 45);
            $act = 'Update profile';
            $logStmt = $conn->prepare("INSERT INTO user_logs (user_id, action, ip_address) VALUES (?,?,?)");
            $logStmt->bind_param("iss", $p['user_id'], $act, $ip);
            $logStmt->execute();
            $logStmt->close();
            echo json_encode(["success" => true]);
        } else {
            http_response_code(500); echo json_encode(["error" => $conn->error]);
        }
        $stmt->close();
        break;

    case 'create_user':
        $creator = requireAuth('admin');
        $input = json_decode(file_get_contents('php://input'), true);
        $username  = trim($input['username'] ?? '');
        $password  = $input['password'] ?? '';
        $full_name = trim($input['full_name'] ?? '');
        $email     = trim($input['email'] ?? '');
        $phone     = trim($input['phone_number'] ?? '');
        $role      = $input['role'] ?? 'staff';

        if (!in_array($role, ['admin', 'staff', 'member'], true)) {
            http_response_code(400); echo json_encode(["error" => "Invalid role"]); break;
        }
        if (strlen($username) < 4) {
            http_response_code(400); echo json_encode(["error" => "Username ຕ້ອງມີຢ່າງໜ້ອຍ 4 ຕົວ"]); break;
        }
        if (strlen($password) < 6) {
            http_response_code(400); echo json_encode(["error" => "Password ຕ້ອງມີຢ່າງໜ້ອຍ 6 ຕົວ"]); break;
        }
        if ($email !== '' && !filter_var($email, FILTER_VALIDATE_EMAIL)) {
            http_response_code(400); echo json_encode(["error" => "Email ບໍ່ຖືກຕ້ອງ"]); break;
        }

        $password_hash = password_hash($password, PASSWORD_DEFAULT);
        $stmt = $conn->prepare("INSERT INTO users (username, password_hash, full_name, role, email, phone_number) VALUES (?, ?, ?, ?, ?, ?)");
        $stmt->bind_param("ssssss", $username, $password_hash, $full_name, $role, $email, $phone);
        if ($stmt->execute()) {
            $newId = $conn->insert_id;
            $ip    = substr($_SERVER['REMOTE_ADDR'] ?? '', 0, 45);
            $act   = "Create user: {$username}";
            $logS  = $conn->prepare("INSERT INTO user_logs (user_id, action, ip_address) VALUES (?,?,?)");
            $logS->bind_param("iss", $creator['user_id'], $act, $ip);
            $logS->execute(); $logS->close();
            echo json_encode(["success" => true, "user_id" => $newId]);
        } else {
            http_response_code(500);
            echo json_encode(["error" => "Username ນີ້ມີຢູ່ແລ້ວ ຫຼື ເກີດຂໍ້ຜິດພາດ"]);
        }
        $stmt->close();
        break;

    case 'update_user':
        $editor    = requireAuth('admin');
        $input     = json_decode(file_get_contents('php://input'), true);
        $user_id   = (int)($input['user_id'] ?? 0);
        $full_name = trim($input['full_name'] ?? '');
        $email     = trim($input['email'] ?? '');
        $phone     = trim($input['phone_number'] ?? '');
        $role      = $input['role'] ?? 'staff';
        $is_active = (int)($input['is_active'] ?? 1);

        if ($user_id <= 0) { http_response_code(400); echo json_encode(["error" => "Invalid user_id"]); break; }
        if (!in_array($role, ['admin', 'staff', 'member'], true)) {
            http_response_code(400); echo json_encode(["error" => "Invalid role"]); break;
        }
        if ($email !== '' && !filter_var($email, FILTER_VALIDATE_EMAIL)) {
            http_response_code(400); echo json_encode(["error" => "Email ບໍ່ຖືກຕ້ອງ"]); break;
        }

        // Protect last active admin from being demoted or disabled
        $roleStmt = $conn->prepare("SELECT role, username FROM users WHERE user_id = ?");
        $roleStmt->bind_param("i", $user_id);
        $roleStmt->execute();
        $currentRow = $roleStmt->get_result()->fetch_assoc();
        $roleStmt->close();
        if ($currentRow && $currentRow['role'] === 'admin') {
            if ($role !== 'admin' || $is_active === 0) {
                $acStmt = $conn->prepare("SELECT COUNT(*) FROM users WHERE role='admin' AND is_active=1");
                $acStmt->execute();
                $acStmt->bind_result($adminCount);
                $acStmt->fetch();
                $acStmt->close();
                if ((int)$adminCount <= 1) {
                    http_response_code(400);
                    echo json_encode(["error" => "ບໍ່ສາມາດ demote/disable Admin ຄົນສຸດທ້າຍໄດ້"]);
                    break;
                }
            }
        }

        $sql  = "UPDATE users SET full_name=?, role=?, is_active=?, email=?, phone_number=? WHERE user_id=?";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param("ssissi", $full_name, $role, $is_active, $email, $phone, $user_id);
        if ($stmt->execute()) {
            $ip  = substr($_SERVER['REMOTE_ADDR'] ?? '', 0, 45);
            $act = "Update user: " . ($currentRow['username'] ?? $user_id);
            $logS = $conn->prepare("INSERT INTO user_logs (user_id, action, ip_address) VALUES (?,?,?)");
            $logS->bind_param("iss", $editor['user_id'], $act, $ip);
            $logS->execute(); $logS->close();
            echo json_encode(["success" => true]);
        } else {
            http_response_code(500); echo json_encode(["error" => $conn->error]);
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
        // Protect last active admin (prepared statement to prevent SQL injection)
        $roleStmt = $conn->prepare("SELECT role FROM users WHERE user_id = ?");
        $roleStmt->bind_param("i", $user_id);
        $roleStmt->execute();
        $roleRow = $roleStmt->get_result()->fetch_assoc();
        $roleStmt->close();
        $targetRole = $roleRow['role'] ?? '';
        if ($targetRole === 'admin') {
            $acStmt2 = $conn->prepare("SELECT COUNT(*) FROM users WHERE role='admin' AND is_active=1");
            $acStmt2->execute();
            $acStmt2->bind_result($adminCount2);
            $acStmt2->fetch();
            $acStmt2->close();
            if ((int)$adminCount2 <= 1) {
                http_response_code(400);
                echo json_encode(["error" => "ບໍ່ສາມາດລຶບ Admin ຄົນສຸດທ້າຍໄດ້"]);
                break;
            }
        }
        // Fetch username for log before deleting
        $nameStmt = $conn->prepare("SELECT username FROM users WHERE user_id=?");
        $nameStmt->bind_param("i", $user_id);
        $nameStmt->execute();
        $nameRow = $nameStmt->get_result()->fetch_assoc();
        $nameStmt->close();
        $deletedUsername = $nameRow['username'] ?? $user_id;

        $stmt = $conn->prepare("DELETE FROM users WHERE user_id=?");
        $stmt->bind_param("i", $user_id);
        if ($stmt->execute()) {
            $ip  = substr($_SERVER['REMOTE_ADDR'] ?? '', 0, 45);
            $act = "Delete user: {$deletedUsername}";
            $logS = $conn->prepare("INSERT INTO user_logs (user_id, action, ip_address) VALUES (?,?,?)");
            $logS->bind_param("iss", $userPayload['user_id'], $act, $ip);
            $logS->execute(); $logS->close();
            echo json_encode(["success" => true]);
        } else {
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

        // Consolidated: 6 COUNT queries → 1 query with conditional aggregation
        // Range conditions on visited_at allow index usage (idx_vs_visited_at)
        // DATE_FORMAT for month-start avoids YEAR()/MONTH() functions on column
        $summaryRow = $conn->query("
            SELECT
                COUNT(*) AS total,
                COUNT(DISTINCT NULLIF(session_id, '')) AS unique_sessions,
                SUM(visited_at >= CURDATE()) AS today,
                COUNT(DISTINCT CASE WHEN visited_at >= CURDATE()
                                    THEN NULLIF(session_id, '') END) AS today_unique,
                SUM(visited_at >= CURDATE() - INTERVAL 7 DAY) AS this_week,
                SUM(visited_at >= DATE_FORMAT(CURDATE(), '%Y-%m-01')) AS this_month
            FROM visitor_stats
        ")->fetch_assoc();

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
            "total" => (int)$summaryRow['total'],
            "unique_sessions" => (int)$summaryRow['unique_sessions'],
            "today" => (int)$summaryRow['today'],
            "today_unique" => (int)$summaryRow['today_unique'],
            "this_week" => (int)$summaryRow['this_week'],
            "this_month" => (int)$summaryRow['this_month'],
            "daily" => $daily,
            "top_pages" => $top_pages,
        ]);
        break;

    // ══════════════════════════════════════════════
    // ── LOTTERY TYPE MANAGEMENT (CRUD) ────────────
    // ══════════════════════════════════════════════

    case 'list_types':
        requireAuth('staff');
        // Single LEFT JOIN + GROUP BY replaces N+1 loop
        $result = $conn->query("
            SELECT
                lt.type_id,
                lt.type_name,
                lt.schedule,
                lt.color,
                lt.is_active,
                lt.description,
                COUNT(ld.draw_id) AS draw_count
            FROM lottery_types lt
            LEFT JOIN lottery_draws ld ON ld.type_id = lt.type_id
            GROUP BY lt.type_id, lt.type_name, lt.schedule, lt.color, lt.is_active, lt.description
            ORDER BY lt.type_id ASC
        ");
        echo json_encode($result->fetch_all(MYSQLI_ASSOC));
        break;

    case 'get_type':
        requireAuth('staff');
        $tid = (int)($_GET['type_id'] ?? 0);
        if ($tid <= 0) { http_response_code(400); echo json_encode(["error" => "Invalid type_id"]); break; }
        // Single query with subquery draw_count — no N+1
        $stmt = $conn->prepare("
            SELECT lt.*,
                   (SELECT COUNT(*) FROM lottery_draws WHERE type_id = lt.type_id) AS draw_count
            FROM lottery_types lt
            WHERE lt.type_id = ?
        ");
        $stmt->bind_param("i", $tid);
        $stmt->execute();
        $row = $stmt->get_result()->fetch_assoc();
        $stmt->close();
        if (!$row) { http_response_code(404); echo json_encode(["error" => "ບໍ່ພົບປະເພດຫວຍ"]); break; }
        echo json_encode($row);
        break;

    case 'create_type':
        if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
            http_response_code(405); echo json_encode(["error" => "Only POST allowed"]); break;
        }
        requireAuth('admin');
        $input     = json_decode(file_get_contents('php://input'), true);
        $type_name = trim($input['type_name'] ?? '');
        $schedule  = trim($input['schedule']  ?? '');
        $color     = trim($input['color']     ?? '#003fb1');
        $is_active = isset($input['is_active']) ? (int)$input['is_active'] : 1;

        if (strlen($type_name) < 2) {
            http_response_code(400); echo json_encode(["error" => "ຊື່ປະເພດຫວຍຕ້ອງມີຢ່າງໜ້ອຍ 2 ຕົວອັກສອນ"]); break;
        }
        // Check duplicate name
        $chk = $conn->prepare("SELECT type_id FROM lottery_types WHERE type_name = ?");
        $chk->bind_param("s", $type_name);
        $chk->execute();
        if ($chk->get_result()->num_rows > 0) {
            http_response_code(400); echo json_encode(["error" => "ຊື່ປະເພດຫວຍນີ້ມີຢູ່ແລ້ວ"]); break;
        }
        $chk->close();

        $stmt = $conn->prepare("INSERT INTO lottery_types (type_name, schedule, color, is_active) VALUES (?, ?, ?, ?)");
        $stmt->bind_param("sssi", $type_name, $schedule, $color, $is_active);
        if ($stmt->execute()) {
            $newId = $conn->insert_id;
            echo json_encode(["success" => true, "type_id" => $newId, "message" => "ເພີ່ມປະເພດຫວຍສຳເລັດ"]);
        } else {
            http_response_code(500); echo json_encode(["error" => "ເກີດຂໍ້ຜິດພາດໃນການບັນທຶກ: " . $conn->error]);
        }
        $stmt->close();
        break;

    case 'update_type':
        if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
            http_response_code(405); echo json_encode(["error" => "Only POST allowed"]); break;
        }
        requireAuth('admin');
        $input     = json_decode(file_get_contents('php://input'), true);
        $tid       = (int)($input['type_id']  ?? 0);
        $type_name = trim($input['type_name'] ?? '');
        $schedule  = trim($input['schedule']  ?? '');
        $color     = trim($input['color']     ?? '#003fb1');
        $is_active = isset($input['is_active']) ? (int)$input['is_active'] : 1;

        if ($tid <= 0) { http_response_code(400); echo json_encode(["error" => "Invalid type_id"]); break; }
        if (strlen($type_name) < 2) {
            http_response_code(400); echo json_encode(["error" => "ຊື່ປະເພດຫວຍຕ້ອງມີຢ່າງໜ້ອຍ 2 ຕົວອັກສອນ"]); break;
        }
        // Check duplicate name (exclude self)
        $chk = $conn->prepare("SELECT type_id FROM lottery_types WHERE type_name = ? AND type_id != ?");
        $chk->bind_param("si", $type_name, $tid);
        $chk->execute();
        if ($chk->get_result()->num_rows > 0) {
            http_response_code(400); echo json_encode(["error" => "ຊື່ປະເພດຫວຍນີ້ມີຢູ່ແລ້ວ"]); break;
        }
        $chk->close();

        $stmt = $conn->prepare("UPDATE lottery_types SET type_name=?, schedule=?, color=?, is_active=? WHERE type_id=?");
        $stmt->bind_param("sssii", $type_name, $schedule, $color, $is_active, $tid);
        if ($stmt->execute()) {
            echo json_encode(["success" => true, "message" => "ອັບເດດປະເພດຫວຍສຳເລັດ"]);
        } else {
            http_response_code(500); echo json_encode(["error" => "ເກີດຂໍ້ຜິດພາດ: " . $conn->error]);
        }
        $stmt->close();
        break;

    case 'delete_type':
        if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
            http_response_code(405); echo json_encode(["error" => "Only POST allowed"]); break;
        }
        requireAuth('admin');
        $input = json_decode(file_get_contents('php://input'), true);
        $tid   = (int)($input['type_id'] ?? 0);
        if ($tid <= 0) { http_response_code(400); echo json_encode(["error" => "Invalid type_id"]); break; }

        // Prevent deleting if draws exist for this type — prepared statement
        $cntStmt = $conn->prepare("SELECT COUNT(*) FROM lottery_draws WHERE type_id = ?");
        $cntStmt->bind_param('i', $tid);
        $cntStmt->execute();
        $cntStmt->bind_result($drawCnt);
        $cntStmt->fetch();
        $cntStmt->close();
        if ($drawCnt > 0) {
            http_response_code(400);
            echo json_encode(["error" => "ບໍ່ສາມາດລຶບໄດ້ — ມີງວດຫວຍ {$drawCnt} ງວດຢູ່ໃນປະເພດນີ້"]);
            break;
        }
        // Prevent deleting the last type
        $ttStmt = $conn->prepare("SELECT COUNT(*) FROM lottery_types");
        $ttStmt->execute();
        $ttStmt->bind_result($totalTypes);
        $ttStmt->fetch();
        $ttStmt->close();
        if ($totalTypes <= 1) {
            http_response_code(400);
            echo json_encode(["error" => "ບໍ່ສາມາດລຶບໄດ້ — ຕ້ອງມີຢ່າງໜ້ອຍ 1 ປະເພດຫວຍ"]);
            break;
        }

        $stmt = $conn->prepare("DELETE FROM lottery_types WHERE type_id=?");
        $stmt->bind_param("i", $tid);
        if ($stmt->execute()) {
            echo json_encode(["success" => true, "message" => "ລຶບປະເພດຫວຍສຳເລັດ"]);
        } else {
            http_response_code(500); echo json_encode(["error" => "ເກີດຂໍ້ຜິດພາດ: " . $conn->error]);
        }
        $stmt->close();
        break;

    default:
        http_response_code(400);
        echo json_encode(["error" => "Unknown action"]);
        break;
}

$conn->close();
?>