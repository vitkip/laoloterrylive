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

// ── JWT helpers ────────────────────────────────────────────────────

function generateToken($user)
{
    $header  = json_encode(['typ' => 'JWT', 'alg' => 'HS256']);
    $payload = json_encode([
        'user_id' => $user['user_id'],
        'role'    => $user['role'],
        'exp'     => time() + 86400,
    ]);
    $b64h = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($header));
    $b64p = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($payload));
    $sig  = hash_hmac('sha256', "$b64h.$b64p", SECRET_KEY, true);
    $b64s = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($sig));
    return "$b64h.$b64p.$b64s";
}

// ── Crypto helpers ─────────────────────────────────────────────────

function generateOTP()
{
    return str_pad(random_int(0, 999999), 6, '0', STR_PAD_LEFT);
}

function generateSecureToken()
{
    return bin2hex(random_bytes(32));
}

// ── Email helpers (dev: return in response; prod: PHP mail) ────────

function sendOTPEmail($email, $fullName, $otp)
{
    if (!PRODUCTION) return true; // returned in response for dev
    $subject = '=?UTF-8?B?' . base64_encode('ລະຫັດ OTP ຢືນຢັນຕົວຕົນ - Lao Lottery Live') . '?=';
    $msg     = "ສະບາຍດີ $fullName,\n\nລະຫັດ OTP ຂອງທ່ານ: $otp\n\nໝົດອາຍຸ: 10 ນາທີ\n\nLao Lottery Live";
    $headers = "From: noreply@laolots.com\r\nContent-Type: text/plain; charset=UTF-8";
    return @mail($email, $subject, $msg, $headers);
}

function sendPasswordResetEmail($email, $fullName, $token)
{
    if (!PRODUCTION) return true;
    $url     = "https://laolots.com/reset-password?token=$token";
    $subject = '=?UTF-8?B?' . base64_encode('ລີເຊັດລະຫັດຜ່ານ - Lao Lottery Live') . '?=';
    $msg     = "ສະບາຍດີ $fullName,\n\nຄລິກລິ້ງດ້ານລຸ່ມ:\n$url\n\nໝົດອາຍຸ: 1 ຊົ່ວໂມງ\n\nLao Lottery Live";
    $headers = "From: noreply@laolots.com\r\nContent-Type: text/plain; charset=UTF-8";
    return @mail($email, $subject, $msg, $headers);
}

function sendVerificationEmail($email, $fullName, $token)
{
    if (!PRODUCTION) return true;
    $url     = "https://laolots.com/verify-email?token=$token";
    $subject = '=?UTF-8?B?' . base64_encode('ຢືນຢັນ Email - Lao Lottery Live') . '?=';
    $msg     = "ສະບາຍດີ $fullName,\n\nຄລິກລິ້ງດ້ານລຸ່ມ:\n$url\n\nໝົດອາຍຸ: 24 ຊົ່ວໂມງ\n\nLao Lottery Live";
    $headers = "From: noreply@laolots.com\r\nContent-Type: text/plain; charset=UTF-8";
    return @mail($email, $subject, $msg, $headers);
}

// ── Client IP ──────────────────────────────────────────────────────

function clientIP()
{
    return substr($_SERVER['REMOTE_ADDR'] ?? '127.0.0.1', 0, 45);
}

// ── Rate-limit helper: max N actions per IP per window ─────────────

function checkIPRateLimit($conn, $action, $ip, $max, $windowSeconds)
{
    $cutoff = date('Y-m-d H:i:s', time() - $windowSeconds);
    $stmt   = $conn->prepare(
        "SELECT COUNT(*) FROM user_logs WHERE action = ? AND ip_address = ? AND created_at > ?"
    );
    $stmt->bind_param("sss", $action, $ip, $cutoff);
    $stmt->execute();
    $stmt->bind_result($count);
    $stmt->fetch();
    $stmt->close();
    return $count < $max;
}

// ── Router ─────────────────────────────────────────────────────────

$action = isset($_GET['action']) ? $_GET['action'] : '';

switch ($action) {

    // ================================================================
    // LOGIN
    // ================================================================
    case 'login':
        if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
            http_response_code(405);
            echo json_encode(["error" => "Only POST allowed"]);
            break;
        }

        $ip = clientIP();

        // IP rate limit: max 20 login attempts per IP per 15 minutes
        if (!checkIPRateLimit($conn, 'Login failed', $ip, 20, 900)) {
            http_response_code(429);
            echo json_encode(["error" => "ລອງເຂົ້າສູ່ລະບົບຫຼາຍເກີນໄປ ກະລຸນາລໍຖ້າ 15 ນາທີ"]);
            break;
        }

        $input    = json_decode(file_get_contents('php://input'), true);
        $username = trim($input['username'] ?? '');
        $password = $input['password'] ?? '';

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

        $dummyHash = '$2y$12$5B5tv/fQpyPHnvTsRnvbcOxZUxIMdvwb2bp9L1xOzaLScpyCFALqe';
        $passwordOk = $user
            ? password_verify($password, $user['password_hash'])
            : password_verify($password, $dummyHash);

        if ($user && $passwordOk) {
            if (!$user['is_active']) {
                http_response_code(403);
                echo json_encode(["error" => "ບັນຊີຍັງບໍ່ໄດ້ຢືນຢັນ ຫຼື ຖືກລະງັບການໃຊ້ງານ"]);
                break;
            }
            $token = generateToken($user);
            $act = 'Login success';
            $logS = $conn->prepare("INSERT INTO user_logs (user_id, action, ip_address) VALUES (?, ?, ?)");
            $logS->bind_param("iss", $user['user_id'], $act, $ip);
            $logS->execute();
            $logS->close();

            echo json_encode([
                "token" => $token,
                "user"  => [
                    "id"       => $user['user_id'],
                    "username" => $user['username'],
                    "name"     => $user['full_name'],
                    "role"     => $user['role'],
                ],
            ]);
        } else {
            $act  = 'Login failed';
            $logS = $conn->prepare("INSERT INTO user_logs (user_id, action, ip_address) VALUES (?, ?, ?)");
            $uid  = $user ? (int)$user['user_id'] : null;
            $logS->bind_param("iss", $uid, $act, $ip);
            $logS->execute();
            $logS->close();
            http_response_code(401);
            echo json_encode(["error" => "ຊື່ຜູ້ໃຊ້ ຫຼື ລະຫັດຜ່ານບໍ່ຖືກຕ້ອງ"]);
        }
        break;

    // ================================================================
    // LOGOUT
    // ================================================================
    case 'logout':
        if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
            http_response_code(405);
            echo json_encode(["error" => "Only POST allowed"]);
            break;
        }
        $authHeader = '';
        if (function_exists('apache_request_headers')) {
            foreach (apache_request_headers() as $k => $v) {
                if (strtolower($k) === 'authorization') { $authHeader = $v; break; }
            }
        }
        if (!$authHeader) $authHeader = $_SERVER['HTTP_AUTHORIZATION'] ?? $_SERVER['REDIRECT_HTTP_AUTHORIZATION'] ?? '';
        if ($authHeader && preg_match('/Bearer\s(\S+)/i', $authHeader, $m)) {
            $parts = explode('.', $m[1]);
            if (count($parts) === 3) {
                $payload = json_decode(base64_decode(str_replace(['-', '_'], ['+', '/'], $parts[1])), true);
                if (is_array($payload) && !empty($payload['user_id'])) {
                    $uid = (int)$payload['user_id'];
                    $ip  = clientIP();
                    $act = 'Logout';
                    $logS = $conn->prepare("INSERT INTO user_logs (user_id, action, ip_address) VALUES (?,?,?)");
                    $logS->bind_param("iss", $uid, $act, $ip);
                    $logS->execute();
                    $logS->close();
                }
            }
        }
        echo json_encode(["success" => true]);
        break;

    // ================================================================
    // REGISTER
    // ================================================================
    case 'register':
        if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
            http_response_code(405);
            echo json_encode(["error" => "Only POST allowed"]);
            break;
        }

        $ip = clientIP();

        // IP rate limit: max 5 registrations per IP per hour
        if (!checkIPRateLimit($conn, 'Registration', $ip, 5, 3600)) {
            http_response_code(429);
            echo json_encode(["error" => "ລົງທະບຽນຫຼາຍເກີນໄປ ກະລຸນາລໍຖ້າ 1 ຊົ່ວໂມງ"]);
            break;
        }

        $input    = json_decode(file_get_contents('php://input'), true);
        $username = trim($input['username'] ?? '');
        $fullName = trim($input['full_name'] ?? '');
        $email    = strtolower(trim($input['email'] ?? ''));
        $phone    = trim($input['phone_number'] ?? '') ?: null;
        $password = $input['password'] ?? '';

        // ── Server-side validation ──────────────────────────────────
        if (!$username || !$fullName || !$email || !$password) {
            http_response_code(400);
            echo json_encode(["error" => "ກະລຸນາປ້ອນຂໍ້ມູນໃຫ້ຄົບຖ້ວນ"]);
            break;
        }
        if (!preg_match('/^[a-zA-Z0-9_]{4,20}$/', $username)) {
            http_response_code(400);
            echo json_encode(["error" => "Username ໃຊ້ໄດ້ສະເພາະ a-z A-Z 0-9 _ (4-20 ຕົວ)", "field" => "username"]);
            break;
        }
        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            http_response_code(400);
            echo json_encode(["error" => "ຮູບແບບ Email ບໍ່ຖືກຕ້ອງ", "field" => "email"]);
            break;
        }
        if (strlen($password) < 8 ||
            !preg_match('/[A-Z]/', $password) ||
            !preg_match('/[a-z]/', $password) ||
            !preg_match('/[0-9]/', $password) ||
            !preg_match('/[^A-Za-z0-9]/', $password)
        ) {
            http_response_code(400);
            echo json_encode(["error" => "ລະຫັດຜ່ານຕ້ອງມີ 8+ ຕົວ, ໂຕໃຫຍ່, ໂຕນ້ອຍ, ຕົວເລກ ແລະ ໂຕພິເສດ", "field" => "password"]);
            break;
        }

        // ── Uniqueness checks ───────────────────────────────────────
        $stmt = $conn->prepare("SELECT user_id FROM users WHERE username = ? LIMIT 1");
        $stmt->bind_param("s", $username);
        $stmt->execute();
        $stmt->store_result();
        $exists = $stmt->num_rows > 0;
        $stmt->close();
        if ($exists) {
            http_response_code(409);
            echo json_encode(["error" => "Username ນີ້ຖືກໃຊ້ງານແລ້ວ", "field" => "username"]);
            break;
        }

        $stmt = $conn->prepare("SELECT user_id FROM users WHERE email = ? LIMIT 1");
        $stmt->bind_param("s", $email);
        $stmt->execute();
        $stmt->store_result();
        $exists = $stmt->num_rows > 0;
        $stmt->close();
        if ($exists) {
            http_response_code(409);
            echo json_encode(["error" => "Email ນີ້ຖືກໃຊ້ງານແລ້ວ", "field" => "email"]);
            break;
        }

        // ── Insert user ─────────────────────────────────────────────
        $hash     = password_hash($password, PASSWORD_BCRYPT, ['cost' => 12]);
        $role     = 'member';
        $isActive = 0;

        $stmt = $conn->prepare(
            "INSERT INTO users (username, password_hash, full_name, email, phone_number, role, is_active)
             VALUES (?, ?, ?, ?, ?, ?, ?)"
        );
        $stmt->bind_param("ssssssi", $username, $hash, $fullName, $email, $phone, $role, $isActive);
        $stmt->execute();
        if ($stmt->affected_rows < 1) {
            $stmt->close();
            http_response_code(500);
            echo json_encode(["error" => "ບໍ່ສາມາດສ້າງບັນຊີໄດ້"]);
            break;
        }
        $userId = $conn->insert_id;
        $stmt->close();

        // ── OTP ─────────────────────────────────────────────────────
        $otp       = generateOTP();
        $otpExpiry = date('Y-m-d H:i:s', time() + 600);
        $purpose   = 'register';
        $stmt = $conn->prepare(
            "INSERT INTO otp_codes (user_id, otp_code, purpose, expires_at) VALUES (?, ?, ?, ?)"
        );
        $stmt->bind_param("isss", $userId, $otp, $purpose, $otpExpiry);
        $stmt->execute();
        $stmt->close();

        // ── Email verification token ────────────────────────────────
        $evToken  = generateSecureToken();
        $evExpiry = date('Y-m-d H:i:s', time() + 86400);
        $stmt = $conn->prepare(
            "INSERT INTO email_verifications (user_id, token, expires_at) VALUES (?, ?, ?)"
        );
        $stmt->bind_param("iss", $userId, $evToken, $evExpiry);
        $stmt->execute();
        $stmt->close();

        // ── Send emails ─────────────────────────────────────────────
        sendOTPEmail($email, $fullName, $otp);
        sendVerificationEmail($email, $fullName, $evToken);

        // ── Audit log ────────────────────────────────────────────────
        $act  = 'Registration';
        $logS = $conn->prepare("INSERT INTO user_logs (user_id, action, ip_address) VALUES (?, ?, ?)");
        $logS->bind_param("iss", $userId, $act, $ip);
        $logS->execute();
        $logS->close();

        $resp = [
            "success" => true,
            "user_id" => $userId,
            "message" => "ສ້າງບັນຊີສຳເລັດ ກະລຸນາຢືນຢັນ OTP",
        ];
        if (!PRODUCTION) {
            $resp['dev_otp']   = $otp;
            $resp['dev_token'] = $evToken;
        }
        echo json_encode($resp);
        break;

    // ================================================================
    // CHECK AVAILABILITY (username or email)
    // ================================================================
    case 'check_availability':
        $field = isset($_GET['field']) ? $_GET['field'] : '';
        $value = isset($_GET['value']) ? trim($_GET['value']) : '';

        if (!in_array($field, ['username', 'email'], true) || !$value) {
            http_response_code(400);
            echo json_encode(["error" => "Invalid request"]);
            break;
        }

        if ($field === 'email') $value = strtolower($value);

        $col  = ($field === 'username') ? 'username' : 'email';
        $stmt = $conn->prepare("SELECT user_id FROM users WHERE $col = ? LIMIT 1");
        $stmt->bind_param("s", $value);
        $stmt->execute();
        $stmt->store_result();
        $taken = $stmt->num_rows > 0;
        $stmt->close();

        echo json_encode(["available" => !$taken]);
        break;

    // ================================================================
    // VERIFY OTP
    // ================================================================
    case 'verify_otp':
        if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
            http_response_code(405);
            echo json_encode(["error" => "Only POST allowed"]);
            break;
        }

        $input   = json_decode(file_get_contents('php://input'), true);
        $userId  = (int)($input['user_id'] ?? 0);
        $otpCode = trim($input['otp_code'] ?? '');

        if (!$userId || !$otpCode) {
            http_response_code(400);
            echo json_encode(["error" => "ຂໍ້ມູນບໍ່ຄົບຖ້ວນ"]);
            break;
        }

        // Fetch latest unused register OTP for this user
        $stmt = $conn->prepare(
            "SELECT otp_id, otp_code, expires_at, attempt_count
             FROM otp_codes
             WHERE user_id = ? AND purpose = 'register' AND used_at IS NULL
             ORDER BY created_at DESC LIMIT 1"
        );
        $stmt->bind_param("i", $userId);
        $stmt->execute();
        $res = $stmt->get_result();
        $stmt->close();

        if (!$res || $res->num_rows === 0) {
            http_response_code(400);
            echo json_encode(["error" => "ບໍ່ພົບ OTP ສຳລັບບັນຊີນີ້"]);
            break;
        }

        $row = $res->fetch_assoc();

        // Check attempt limit (max 5)
        if ($row['attempt_count'] >= 5) {
            http_response_code(429);
            echo json_encode(["error" => "ລອງ OTP ຫຼາຍເກີນໄປ ກະລຸນາຂໍ OTP ໃໝ່"]);
            break;
        }

        // Increment attempt
        $otpId = (int)$row['otp_id'];
        $upd   = $conn->prepare("UPDATE otp_codes SET attempt_count = attempt_count + 1 WHERE otp_id = ?");
        $upd->bind_param("i", $otpId);
        $upd->execute();
        $upd->close();

        // Check expiry
        if (strtotime($row['expires_at']) < time()) {
            http_response_code(400);
            echo json_encode(["error" => "OTP ໝົດອາຍຸແລ້ວ ກະລຸນາຂໍ OTP ໃໝ່"]);
            break;
        }

        // Check code
        if ($row['otp_code'] !== $otpCode) {
            $remaining = 4 - (int)$row['attempt_count'];
            http_response_code(400);
            echo json_encode(["error" => "OTP ບໍ່ຖືກຕ້ອງ (ຍັງເຫຼືອ $remaining ຄັ້ງ)"]);
            break;
        }

        // Mark OTP used
        $now  = date('Y-m-d H:i:s');
        $upd  = $conn->prepare("UPDATE otp_codes SET used_at = ? WHERE otp_id = ?");
        $upd->bind_param("si", $now, $otpId);
        $upd->execute();
        $upd->close();

        // Activate user
        $upd = $conn->prepare("UPDATE users SET is_active = 1, updated_at = NOW() WHERE user_id = ?");
        $upd->bind_param("i", $userId);
        $upd->execute();
        $upd->close();

        // Fetch user for JWT
        $stmt = $conn->prepare("SELECT * FROM users WHERE user_id = ? LIMIT 1");
        $stmt->bind_param("i", $userId);
        $stmt->execute();
        $userRes = $stmt->get_result()->fetch_assoc();
        $stmt->close();

        $token = generateToken($userRes);

        // Audit log
        $ip  = clientIP();
        $act = 'OTP verified - account activated';
        $logS = $conn->prepare("INSERT INTO user_logs (user_id, action, ip_address) VALUES (?,?,?)");
        $logS->bind_param("iss", $userId, $act, $ip);
        $logS->execute();
        $logS->close();

        echo json_encode([
            "success" => true,
            "token"   => $token,
            "user"    => [
                "id"       => $userRes['user_id'],
                "username" => $userRes['username'],
                "name"     => $userRes['full_name'],
                "role"     => $userRes['role'],
            ],
        ]);
        break;

    // ================================================================
    // RESEND OTP
    // ================================================================
    case 'resend_otp':
        if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
            http_response_code(405);
            echo json_encode(["error" => "Only POST allowed"]);
            break;
        }

        $ip = clientIP();

        // IP rate limit: max 5 resends per IP per 10 minutes
        if (!checkIPRateLimit($conn, 'OTP resent', $ip, 5, 600)) {
            http_response_code(429);
            echo json_encode(["error" => "ຂໍ OTP ໃໝ່ຫຼາຍເກີນໄປ ກະລຸນາລໍຖ້າ 10 ນາທີ"]);
            break;
        }

        $input  = json_decode(file_get_contents('php://input'), true);
        $userId = (int)($input['user_id'] ?? 0);

        if (!$userId) {
            http_response_code(400);
            echo json_encode(["error" => "ຂໍ້ມູນບໍ່ຄົບຖ້ວນ"]);
            break;
        }

        // Fetch user — must be inactive (pending verification)
        $stmt = $conn->prepare("SELECT user_id, email, full_name, is_active FROM users WHERE user_id = ? LIMIT 1");
        $stmt->bind_param("i", $userId);
        $stmt->execute();
        $userRes = $stmt->get_result()->fetch_assoc();
        $stmt->close();

        if (!$userRes) {
            http_response_code(404);
            echo json_encode(["error" => "ບໍ່ພົບບັນຊີ"]);
            break;
        }
        if ($userRes['is_active']) {
            http_response_code(400);
            echo json_encode(["error" => "ບັນຊີນີ້ຢືນຢັນແລ້ວ"]);
            break;
        }

        // Invalidate old OTPs
        $del = $conn->prepare(
            "UPDATE otp_codes SET used_at = NOW()
             WHERE user_id = ? AND purpose = 'register' AND used_at IS NULL"
        );
        $del->bind_param("i", $userId);
        $del->execute();
        $del->close();

        // New OTP
        $newOtp  = generateOTP();
        $expiry  = date('Y-m-d H:i:s', time() + 600);
        $purpose = 'register';
        $stmt    = $conn->prepare(
            "INSERT INTO otp_codes (user_id, otp_code, purpose, expires_at) VALUES (?,?,?,?)"
        );
        $stmt->bind_param("isss", $userId, $newOtp, $purpose, $expiry);
        $stmt->execute();
        $stmt->close();

        sendOTPEmail($userRes['email'], $userRes['full_name'], $newOtp);

        $act  = 'OTP resent';
        $logS = $conn->prepare("INSERT INTO user_logs (user_id, action, ip_address) VALUES (?,?,?)");
        $logS->bind_param("iss", $userId, $act, $ip);
        $logS->execute();
        $logS->close();

        $resp = ["success" => true, "message" => "ສົ່ງ OTP ໃໝ່ສຳເລັດ"];
        if (!PRODUCTION) $resp['dev_otp'] = $newOtp;
        echo json_encode($resp);
        break;

    // ================================================================
    // FORGOT PASSWORD
    // ================================================================
    case 'forgot_password':
        if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
            http_response_code(405);
            echo json_encode(["error" => "Only POST allowed"]);
            break;
        }

        $input = json_decode(file_get_contents('php://input'), true);
        $email = strtolower(trim($input['email'] ?? ''));

        if (!$email || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
            http_response_code(400);
            echo json_encode(["error" => "ຮູບແບບ Email ບໍ່ຖືກຕ້ອງ"]);
            break;
        }

        // Always return success (don't reveal whether email exists)
        $stmt = $conn->prepare("SELECT user_id, full_name FROM users WHERE email = ? AND is_active = 1 LIMIT 1");
        $stmt->bind_param("s", $email);
        $stmt->execute();
        $userRes = $stmt->get_result()->fetch_assoc();
        $stmt->close();

        $resp = ["success" => true, "message" => "ຖ້າ Email ດັ່ງກ່າວມີຢູ່ ທ່ານຈະໄດ້ຮັບ Email ເດ"];
        if ($userRes) {
            // Invalidate old tokens
            $del = $conn->prepare("UPDATE password_resets SET used_at = NOW() WHERE user_id = ? AND used_at IS NULL");
            $del->bind_param("i", $userRes['user_id']);
            $del->execute();
            $del->close();

            $resetToken = generateSecureToken();
            $expiry     = date('Y-m-d H:i:s', time() + 3600);
            $stmt = $conn->prepare(
                "INSERT INTO password_resets (user_id, token, expires_at) VALUES (?,?,?)"
            );
            $stmt->bind_param("iss", $userRes['user_id'], $resetToken, $expiry);
            $stmt->execute();
            $stmt->close();

            sendPasswordResetEmail($email, $userRes['full_name'], $resetToken);

            if (!PRODUCTION) $resp['dev_token'] = $resetToken;
        }
        echo json_encode($resp);
        break;

    // ================================================================
    // RESET PASSWORD
    // ================================================================
    case 'reset_password':
        if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
            http_response_code(405);
            echo json_encode(["error" => "Only POST allowed"]);
            break;
        }

        $input    = json_decode(file_get_contents('php://input'), true);
        $token    = trim($input['token'] ?? '');
        $password = $input['password'] ?? '';

        if (!$token || !$password) {
            http_response_code(400);
            echo json_encode(["error" => "ຂໍ້ມູນບໍ່ຄົບຖ້ວນ"]);
            break;
        }

        if (strlen($password) < 8 ||
            !preg_match('/[A-Z]/', $password) ||
            !preg_match('/[a-z]/', $password) ||
            !preg_match('/[0-9]/', $password) ||
            !preg_match('/[^A-Za-z0-9]/', $password)
        ) {
            http_response_code(400);
            echo json_encode(["error" => "ລະຫັດຜ່ານບໍ່ຜ່ານເງື່ອນໄຂຄວາມປອດໄພ"]);
            break;
        }

        // Find valid token
        $stmt = $conn->prepare(
            "SELECT reset_id, user_id, expires_at FROM password_resets
             WHERE token = ? AND used_at IS NULL LIMIT 1"
        );
        $stmt->bind_param("s", $token);
        $stmt->execute();
        $row = $stmt->get_result()->fetch_assoc();
        $stmt->close();

        if (!$row) {
            http_response_code(400);
            echo json_encode(["error" => "Token ບໍ່ຖືກຕ້ອງ ຫຼື ໃຊ້ໄປແລ້ວ"]);
            break;
        }
        if (strtotime($row['expires_at']) < time()) {
            http_response_code(400);
            echo json_encode(["error" => "Token ໝົດອາຍຸແລ້ວ ກະລຸນາຂໍ Reset ໃໝ່"]);
            break;
        }

        $newHash = password_hash($password, PASSWORD_BCRYPT, ['cost' => 12]);
        $userId  = (int)$row['user_id'];
        $resetId = (int)$row['reset_id'];

        // Update password
        $upd = $conn->prepare("UPDATE users SET password_hash = ?, updated_at = NOW() WHERE user_id = ?");
        $upd->bind_param("si", $newHash, $userId);
        $upd->execute();
        $upd->close();

        // Mark token used
        $now = date('Y-m-d H:i:s');
        $upd = $conn->prepare("UPDATE password_resets SET used_at = ? WHERE reset_id = ?");
        $upd->bind_param("si", $now, $resetId);
        $upd->execute();
        $upd->close();

        // Audit log
        $ip  = clientIP();
        $act = 'Password reset';
        $logS = $conn->prepare("INSERT INTO user_logs (user_id, action, ip_address) VALUES (?,?,?)");
        $logS->bind_param("iss", $userId, $act, $ip);
        $logS->execute();
        $logS->close();

        echo json_encode(["success" => true, "message" => "ລີເຊັດລະຫັດຜ່ານສຳເລັດ"]);
        break;

    // ================================================================
    // VERIFY EMAIL (via link)
    // ================================================================
    case 'verify_email':
        if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
            http_response_code(405);
            echo json_encode(["error" => "Only POST allowed"]);
            break;
        }

        $input = json_decode(file_get_contents('php://input'), true);
        $token = trim($input['token'] ?? '');

        if (!$token) {
            http_response_code(400);
            echo json_encode(["error" => "Token ຫວ່າງ"]);
            break;
        }

        $stmt = $conn->prepare(
            "SELECT verification_id, user_id, expires_at, verified_at
             FROM email_verifications WHERE token = ? LIMIT 1"
        );
        $stmt->bind_param("s", $token);
        $stmt->execute();
        $row = $stmt->get_result()->fetch_assoc();
        $stmt->close();

        if (!$row) {
            http_response_code(400);
            echo json_encode(["error" => "Token ບໍ່ຖືກຕ້ອງ"]);
            break;
        }
        if ($row['verified_at'] !== null) {
            echo json_encode(["success" => true, "message" => "Email ຢືນຢັນແລ້ວ"]);
            break;
        }
        if (strtotime($row['expires_at']) < time()) {
            http_response_code(400);
            echo json_encode(["error" => "Token ໝົດອາຍຸແລ້ວ"]);
            break;
        }

        $now    = date('Y-m-d H:i:s');
        $veId   = (int)$row['verification_id'];
        $userId = (int)$row['user_id'];

        $upd = $conn->prepare("UPDATE email_verifications SET verified_at = ? WHERE verification_id = ?");
        $upd->bind_param("si", $now, $veId);
        $upd->execute();
        $upd->close();

        // Activate user account (same as OTP verification path)
        $upd = $conn->prepare("UPDATE users SET is_active = 1, updated_at = NOW() WHERE user_id = ? AND is_active = 0");
        $upd->bind_param("i", $userId);
        $upd->execute();
        $upd->close();

        echo json_encode(["success" => true, "message" => "ຢືນຢັນ Email ສຳເລັດ"]);
        break;

    // ================================================================
    // DEFAULT
    // ================================================================
    default:
        http_response_code(404);
        echo json_encode(["error" => "Unknown action"]);
        break;
}

$conn->close();
?>
