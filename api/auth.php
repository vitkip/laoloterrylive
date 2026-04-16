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

$conn = new mysqli(DB_HOST, DB_USER, DB_PASS, DB_NAME);
if ($conn->connect_error) {
    http_response_code(500);
    echo json_encode(["error" => "Database connection failed"]);
    exit();
}
$conn->set_charset("utf8mb4");

define('SECRET_KEY', JWT_SECRET);

function generateToken($user)
{
    $header = json_encode(['typ' => 'JWT', 'alg' => 'HS256']);
    $payload = json_encode(['user_id' => $user['user_id'], 'role' => $user['role'], 'exp' => time() + 86400]);
    $base64UrlHeader = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($header));
    $base64UrlPayload = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($payload));
    $signature = hash_hmac('sha256', $base64UrlHeader . "." . $base64UrlPayload, SECRET_KEY, true);
    $base64UrlSignature = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($signature));
    return $base64UrlHeader . "." . $base64UrlPayload . "." . $base64UrlSignature;
}

$action = isset($_GET['action']) ? $_GET['action'] : '';

switch ($action) {
    case 'login':
        if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
            http_response_code(405);
            echo json_encode(["error" => "Only POST allowed"]);
            break;
        }

        $input = json_decode(file_get_contents('php://input'), true);
        $username = isset($input['username']) ? $conn->real_escape_string($input['username']) : '';
        $password = isset($input['password']) ? $input['password'] : '';

        if (!$username || !$password) {
            http_response_code(400);
            echo json_encode(["error" => "Username and password required"]);
            break;
        }

        $stmt = $conn->prepare("SELECT * FROM users WHERE username = ? LIMIT 1");
        $stmt->bind_param("s", $username);
        $stmt->execute();
        $result = $stmt->get_result();
        $stmt->close();

        $user = ($result && $result->num_rows > 0) ? $result->fetch_assoc() : null;

        // Always run password_verify to prevent timing-based user enumeration
        $dummyHash = '$2y$10$invalidhashfortimingprotectiononly00000000000000000000000';
        $passwordOk = $user ? password_verify($password, $user['password_hash']) : password_verify($password, $dummyHash);

        if ($user && $passwordOk) {
            if (!$user['is_active']) {
                http_response_code(403);
                echo json_encode(["error" => "ບັນຊີຜູ້ໃຊ້ຖືກລະງັບການໃຊ້ງານ"]);
                break;
            }
            $token = generateToken($user);

            // Log successful login using prepared statement
            $ip = substr($_SERVER['REMOTE_ADDR'] ?? '', 0, 45);
            $action_log = 'Login success';
            $log_stmt = $conn->prepare("INSERT INTO user_logs (user_id, action, ip_address) VALUES (?, ?, ?)");
            $log_stmt->bind_param("iss", $user['user_id'], $action_log, $ip);
            $log_stmt->execute();
            $log_stmt->close();

            echo json_encode([
                "token" => $token,
                "user" => [
                    "id" => $user['user_id'],
                    "username" => $user['username'],
                    "name" => $user['full_name'],
                    "role" => $user['role']
                ]
            ]);
        } else {
            http_response_code(401);
            // Same error message regardless of whether username or password is wrong
            echo json_encode(["error" => "ຊື່ຜູ້ໃຊ້ ຫຼື ລະຫັດຜ່ານບໍ່ຖືກຕ້ອງ"]);
        }
        break;

    default:
        http_response_code(404);
        echo json_encode(["error" => "Unknown action"]);
        break;
}

$conn->close();
?>