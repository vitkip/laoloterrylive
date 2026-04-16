<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

define('SECRET_KEY', 'lao_lottery_super_secret_key');

function verifyToken()
{
    $headers = apache_request_headers();
    $authHeader = isset($headers['Authorization']) ? $headers['Authorization'] : (isset($_SERVER['HTTP_AUTHORIZATION']) ? $_SERVER['HTTP_AUTHORIZATION'] : '');
    if (!$authHeader || !preg_match('/Bearer\s(\S+)/', $authHeader, $matches)) {
        return false;
    }
    $token = $matches[1];
    $parts = explode('.', $token);
    if (count($parts) !== 3)
        return false;

    $signature = hash_hmac('sha256', $parts[0] . "." . $parts[1], SECRET_KEY, true);
    $base64UrlSignature = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($signature));

    if ($base64UrlSignature !== $parts[2])
        return false;

    $payload = json_decode(base64_decode(str_replace(['-', '_'], ['+', '/'], $parts[1])), true);
    if ($payload['exp'] < time())
        return false;

    return $payload;
}

$conn = new mysqli("localhost", "root", "", "lao_lottery_pro");
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
        $drawsResult = $conn->query("SELECT * FROM lottery_draws ORDER BY draw_number DESC");
        $draws = [];
        while ($row = $drawsResult->fetch_assoc()) {
            $drawId = $row['draw_id'];
            $detailsResult = $conn->query("SELECT * FROM draw_results_detail WHERE draw_id = $drawId");
            $row['results_detail'] = $detailsResult->fetch_all(MYSQLI_ASSOC);
            $draws[] = $row;
        }
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

        $userPayload = verifyToken();
        if (!$userPayload || !in_array($userPayload['role'], ['admin', 'staff'])) {
            http_response_code(401);
            echo json_encode(["error" => "Unauthorized. Admin or Staff access required."]);
            break;
        }
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

        $userPayload = verifyToken();
        if (!$userPayload || !in_array($userPayload['role'], ['admin', 'staff'])) {
            http_response_code(401);
            echo json_encode(["error" => "Unauthorized. Admin or Staff access required."]);
            break;
        }

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

        $userPayload = verifyToken();
        if (!$userPayload || !in_array($userPayload['role'], ['admin', 'staff'])) {
            http_response_code(401);
            echo json_encode(["error" => "Unauthorized"]);
            break;
        }

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
            $imageUrl = '/laoloterylive/uploads/animals/' . $fileName;

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
        $userPayload = verifyToken();
        if (!$userPayload || $userPayload['role'] !== 'admin') {
            http_response_code(401);
            echo json_encode(["error" => "Unauthorized. Admin only."]);
            break;
        }
        $res = $conn->query("SELECT user_id, username, full_name, role, is_active, created_at FROM users");
        if (!$res) {
            http_response_code(500);
            echo json_encode(["error" => $conn->error]);
            break;
        }
        echo json_encode($res->fetch_all(MYSQLI_ASSOC));
        break;

    case 'create_user':
        $userPayload = verifyToken();
        if (!$userPayload || $userPayload['role'] !== 'admin') {
            http_response_code(401);
            echo json_encode(["error" => "Unauthorized"]);
            break;
        }
        $input = json_decode(file_get_contents('php://input'), true);
        $username = $conn->real_escape_string($input['username']);
        $password_hash = password_hash($input['password'], PASSWORD_DEFAULT);
        $full_name = $conn->real_escape_string($input['full_name']);
        $role = $conn->real_escape_string($input['role']);
        $stmt = $conn->prepare("INSERT INTO users (username, password_hash, full_name, role) VALUES (?, ?, ?, ?)");
        $stmt->bind_param("ssss", $username, $password_hash, $full_name, $role);
        if ($stmt->execute())
            echo json_encode(["success" => true]);
        else {
            http_response_code(500);
            echo json_encode(["error" => $conn->error]);
        }
        break;

    case 'update_user':
        $userPayload = verifyToken();
        if (!$userPayload || $userPayload['role'] !== 'admin') {
            http_response_code(401);
            echo json_encode(["error" => "Unauthorized"]);
            break;
        }
        $input = json_decode(file_get_contents('php://input'), true);
        $user_id = (int) $input['user_id'];
        $full_name = $conn->real_escape_string($input['full_name']);
        $role = $conn->real_escape_string($input['role']);
        $is_active = (int) $input['is_active'];

        $sql = "UPDATE users SET full_name=?, role=?, is_active=? WHERE user_id=?";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param("ssii", $full_name, $role, $is_active, $user_id);
        if ($stmt->execute())
            echo json_encode(["success" => true]);
        else {
            http_response_code(500);
            echo json_encode(["error" => $conn->error]);
        }
        break;

    case 'delete_user':
        $userPayload = verifyToken();
        if (!$userPayload || $userPayload['role'] !== 'admin') {
            http_response_code(401);
            echo json_encode(["error" => "Unauthorized"]);
            break;
        }
        $input = json_decode(file_get_contents('php://input'), true);
        $user_id = (int) $input['user_id'];
        if ($user_id === $userPayload['user_id']) {
            http_response_code(400);
            echo json_encode(["error" => "Cannot delete yourself"]);
            break;
        }
        $stmt = $conn->prepare("DELETE FROM users WHERE user_id=?");
        $stmt->bind_param("i", $user_id);
        if ($stmt->execute())
            echo json_encode(["success" => true]);
        else {
            http_response_code(500);
            echo json_encode(["error" => $conn->error]);
        }
        break;

    case 'change_password':
        $userPayload = verifyToken();
        if (!$userPayload) {
            http_response_code(401);
            echo json_encode(["error" => "Unauthorized"]);
            break;
        }
        $input = json_decode(file_get_contents('php://input'), true);
        // Admin can change anyone's password if they provide target_user_id. Otherwise, change own.
        $target_id = (isset($input['target_user_id']) && $userPayload['role'] === 'admin') ? (int) $input['target_user_id'] : $userPayload['user_id'];

        if ($target_id === $userPayload['user_id'] && $userPayload['role'] !== 'admin') {
            // Normal user must provide current password
            $current_pass = $input['current_password'];
            $res = $conn->query("SELECT password_hash FROM users WHERE user_id={$target_id}");
            $row = $res->fetch_assoc();
            if (!password_verify($current_pass, $row['password_hash'])) {
                http_response_code(400);
                echo json_encode(["error" => "Current password incorrect"]);
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
        $res = $conn->query("SELECT setting_key, setting_value FROM system_settings WHERE setting_key IN ('youtube_live_url', 'is_live')");
        $settings = [];
        while ($row = $res->fetch_assoc()) {
            $settings[$row['setting_key']] = $row['setting_value'];
        }
        echo json_encode($settings);
        break;

    case 'update_live_settings':
        $userPayload = verifyToken();
        if (!$userPayload || !in_array($userPayload['role'], ['admin', 'staff'])) {
            http_response_code(401);
            echo json_encode(["error" => "Unauthorized"]);
            break;
        }
        $input = json_decode(file_get_contents('php://input'), true);
        $url = $conn->real_escape_string($input['youtube_live_url']);
        $is_live = $conn->real_escape_string($input['is_live']);

        $conn->query("UPDATE system_settings SET setting_value='$url' WHERE setting_key='youtube_live_url'");
        $conn->query("UPDATE system_settings SET setting_value='$is_live' WHERE setting_key='is_live'");

        echo json_encode(["success" => true]);
        break;

    default:
        http_response_code(400);
        echo json_encode(["error" => "Unknown action"]);
        break;
}

$conn->close();
?>