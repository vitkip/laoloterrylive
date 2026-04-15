<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

$conn = new mysqli("localhost", "root", "", "lao_lottery_pro");
if ($conn->connect_error) {
    http_response_code(500);
    echo json_encode(["error" => "Database connection failed"]);
    exit();
}
$conn->set_charset("utf8mb4");

// A very simplified JWT-like mechanism for this project's scope
define('SECRET_KEY', 'lao_lottery_super_secret_key');

function generateToken($user) {
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

        $result = $conn->query("SELECT * FROM users WHERE username = '$username' LIMIT 1");
        if ($result && $result->num_rows > 0) {
            $user = $result->fetch_assoc();
            if (password_verify($password, $user['password_hash'])) {
                if (!$user['is_active']) {
                    http_response_code(403);
                    echo json_encode(["error" => "User account is disabled"]);
                    break;
                }
                $token = generateToken($user);
                
                // Logging login
                $ip = $_SERVER['REMOTE_ADDR'];
                $conn->query("INSERT INTO user_logs (user_id, action, ip_address) VALUES ({$user['user_id']}, 'Login success', '$ip')");

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
                echo json_encode(["error" => "Invalid password"]);
            }
        } else {
            http_response_code(401);
            echo json_encode(["error" => "Invalid username"]);
        }
        break;

    default:
        http_response_code(404);
        echo json_encode(["error" => "Unknown action"]);
        break;
}

$conn->close();
?>
