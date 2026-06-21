<?php
require_once __DIR__ . '/config.php';
require_once __DIR__ . '/lib/Exception.php';
require_once __DIR__ . '/lib/PHPMailer.php';
require_once __DIR__ . '/lib/SMTP.php';

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\SMTP;
use PHPMailer\PHPMailer\Exception;

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

// Ensure refresh_tokens table exists (idempotent — safe to run every request)
$conn->query("CREATE TABLE IF NOT EXISTS refresh_tokens (
    rt_id       INT           AUTO_INCREMENT PRIMARY KEY,
    user_id     BIGINT UNSIGNED NOT NULL,
    token_hash  VARCHAR(64)   NOT NULL UNIQUE,
    expires_at  DATETIME      NOT NULL,
    ip_address  VARCHAR(45),
    user_agent  VARCHAR(255),
    revoked_at  DATETIME      NULL DEFAULT NULL,
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_rt_user_expires (user_id, expires_at),
    INDEX idx_rt_expires      (expires_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci");

define('SECRET_KEY', JWT_SECRET);

// ── JWT helpers ────────────────────────────────────────────────────

/**
 * Generate a short-lived access token (15 minutes by default).
 * Access token contains: user_id, role, type=access, exp
 */
function generateToken($user)
{
    $header  = json_encode(['typ' => 'JWT', 'alg' => 'HS256']);
    $payload = json_encode([
        'user_id' => (int)$user['user_id'],
        'role'    => $user['role'],
        'type'    => 'access',
        'exp'     => time() + JWT_ACCESS_TTL,
    ]);
    $b64h = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($header));
    $b64p = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($payload));
    $sig  = hash_hmac('sha256', "$b64h.$b64p", SECRET_KEY, true);
    $b64s = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($sig));
    return "$b64h.$b64p.$b64s";
}

/**
 * Issue a refresh token, store its hash in refresh_tokens, return raw token.
 */
function issueRefreshToken($conn, int $userId): string
{
    $raw    = bin2hex(random_bytes(32));  // 64-char hex — sent to client
    $hashed = hash('sha256', $raw);       // stored in DB
    $expiry = date('Y-m-d H:i:s', time() + JWT_REFRESH_TTL);
    $ip     = substr($_SERVER['REMOTE_ADDR'] ?? '', 0, 45);
    $ua     = substr($_SERVER['HTTP_USER_AGENT'] ?? '', 0, 255);

    $stmt = $conn->prepare(
        "INSERT INTO refresh_tokens (user_id, token_hash, expires_at, ip_address, user_agent)
         VALUES (?, ?, ?, ?, ?)"
    );
    $stmt->bind_param("issss", $userId, $hashed, $expiry, $ip, $ua);
    $stmt->execute();
    $stmt->close();
    return $raw;
}

// ── Crypto helpers ─────────────────────────────────────────────────

function generateOTP(): string
{
    return str_pad((string)random_int(0, 999999), 6, '0', STR_PAD_LEFT);
}

/** Returns the raw token (for email) — caller must store hash('sha256', $token) in DB */
function generateSecureToken(): string
{
    return bin2hex(random_bytes(32));
}

// ── Email helpers (dev: OTP in response; prod: SMTP via PHPMailer) ─

function createMailer()
{
    $mail = new PHPMailer(true);
    $mail->CharSet = 'UTF-8';
    $mail->setFrom(SMTP_FROM, SMTP_FROM_NAME);

    // If no SMTP credentials → use server's sendmail (cPanel default, always works)
    if (SMTP_USER === '' || SMTP_HOST === 'localhost' || SMTP_HOST === '127.0.0.1') {
        $mail->isSendmail();
        return $mail;
    }

    // External SMTP (e.g. Gmail, Mailgun, Brevo)
    $mail->isSMTP();
    $mail->Host       = SMTP_HOST;
    $mail->SMTPAuth   = true;
    $mail->Username   = SMTP_USER;
    $mail->Password   = SMTP_PASS;
    $mail->SMTPSecure = (SMTP_PORT === 465)
        ? PHPMailer::ENCRYPTION_SMTPS
        : PHPMailer::ENCRYPTION_STARTTLS;
    $mail->Port = SMTP_PORT;

    if (!PRODUCTION) {
        $mail->SMTPOptions = [
            'ssl' => [
                'verify_peer'       => false,
                'verify_peer_name'  => false,
                'allow_self_signed' => true,
            ],
        ];
    }
    return $mail;
}

function sendOTPEmail($email, $fullName, $otp)
{
    if (!PRODUCTION) return true;
    try {
        $mail = createMailer();
        $mail->addAddress($email, $fullName);
        $mail->Subject = 'ລະຫັດ OTP ຢືນຢັນຕົວຕົນ - Lao Lottery Live';
        $mail->isHTML(true);
        $mail->Body    = "<p>ສະບາຍດີ <b>$fullName</b>,</p><p>ລະຫັດ OTP ຂອງທ່ານ:</p><h2 style='letter-spacing:8px;color:#003fb1;'>$otp</h2><p>ໝົດອາຍຸ: 10 ນາທີ</p><p>Lao Lottery Live</p>";
        $mail->AltBody = "ສະບາຍດີ $fullName,\n\nລະຫັດ OTP: $otp\n\nໝົດອາຍຸ: 10 ນາທີ";
        return $mail->send();
    } catch (\Exception $e) {
        error_log('[SMTP][sendOTPEmail] ' . $e->getMessage());
        return false;
    }
}

function sendPasswordResetEmail($email, $fullName, $token)
{
    if (!PRODUCTION) return true;
    try {
        $mail = createMailer();
        $mail->addAddress($email, $fullName);
        $mail->Subject = 'ລີເຊັດລະຫັດຜ່ານ - Lao Lottery Live';
        $url = APP_URL . "/reset-password?token=$token";
        $mail->isHTML(true);
        $mail->Body    = "<p>ສະບາຍດີ <b>$fullName</b>,</p><p><a href='$url' style='background:#003fb1;color:#fff;padding:10px 20px;border-radius:6px;text-decoration:none;'>ລີເຊັດລະຫັດຜ່ານ</a></p><p>ຫຼື copy ລິ້ງ: $url</p><p>ໝົດອາຍຸ: 1 ຊົ່ວໂມງ</p>";
        $mail->AltBody = "ສະບາຍດີ $fullName,\n\nລິ້ງລີເຊັດ: $url\n\nໝົດອາຍຸ: 1 ຊົ່ວໂມງ";
        return $mail->send();
    } catch (\Exception $e) {
        error_log('[SMTP][sendPasswordResetEmail] ' . $e->getMessage());
        return false;
    }
}

function sendVerificationEmail($email, $fullName, $token)
{
    if (!PRODUCTION) return true;
    try {
        $mail = createMailer();
        $mail->addAddress($email, $fullName);
        $mail->Subject = 'ຢືນຢັນ Email - Lao Lottery Live';
        $url = APP_URL . "/verify-email?token=$token";
        $mail->isHTML(true);
        $mail->Body    = "<p>ສະບາຍດີ <b>$fullName</b>,</p><p><a href='$url' style='background:#003fb1;color:#fff;padding:10px 20px;border-radius:6px;text-decoration:none;'>ຢືນຢັນ Email</a></p><p>ຫຼື copy ລິ້ງ: $url</p><p>ໝົດອາຍຸ: 24 ຊົ່ວໂມງ</p>";
        $mail->AltBody = "ສະບາຍດີ $fullName,\n\nລິ້ງຢືນຢັນ: $url\n\nໝົດອາຍຸ: 24 ຊົ່ວໂມງ";
        return $mail->send();
    } catch (\Exception $e) {
        error_log('[SMTP][sendVerificationEmail] ' . $e->getMessage());
        return false;
    }
}

// ── Client IP ──────────────────────────────────────────────────────

function clientIP()
{
    return substr($_SERVER['REMOTE_ADDR'] ?? '127.0.0.1', 0, 45);
}

function fetchUrl(string $url): string|false
{
    if (function_exists('curl_init')) {
        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, $url);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
        curl_setopt($ch, CURLOPT_TIMEOUT, 15);
        if (!PRODUCTION) {
            curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
            curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, false);
        }
        $result = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);
        if ($httpCode >= 400) {
            return false;
        }
        return $result;
    }
    
    $opts = [
        "http" => [
            "method" => "GET",
            "timeout" => 15
        ]
    ];
    if (!PRODUCTION) {
        $opts["ssl"] = [
            "verify_peer" => false,
            "verify_peer_name" => false
        ];
    }
    $context = stream_context_create($opts);
    return @file_get_contents($url, false, $context);
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
    $count = 0;
    $stmt->bind_result($count);
    $stmt->fetch();
    $stmt->close();
    return $count < $max;
}

// ── Router ─────────────────────────────────────────────────────────

$action = isset($_GET['action']) ? $_GET['action'] : '';

switch ($action) {

    // ================================================================
    // SOCIAL LOGIN (GOOGLE / FACEBOOK)
    // ================================================================
    case 'social_login':
        if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
            http_response_code(405);
            echo json_encode(["error" => "Only POST allowed"]);
            break;
        }

        $ip = clientIP();

        // Rate limit: max 20 login attempts per IP per 15 minutes
        if (!checkIPRateLimit($conn, 'Social login failed', $ip, 20, 900)) {
            http_response_code(429);
            echo json_encode(["error" => "ລອງເຂົ້າສູ່ລະບົບຫຼາຍເກີນໄປ ກະລຸນາລໍຖ້າ 15 ນາທີ"]);
            break;
        }

        $input       = json_decode(file_get_contents('php://input'), true);
        $provider    = trim($input['provider'] ?? '');
        $accessToken = trim($input['access_token'] ?? '');

        if (!$provider || !$accessToken) {
            http_response_code(400);
            echo json_encode(["error" => "Provider and access token are required"]);
            break;
        }

        $oauthId = '';
        $email   = '';
        $name    = '';
        $avatar  = null;

        if ($provider === 'google') {
            $googleClientId = env('GOOGLE_CLIENT_ID');
            if (!$googleClientId) {
                http_response_code(500);
                echo json_encode(["error" => "Google Login is not configured on the server."]);
                break;
            }

            // Verify Google token
            $verifyUrl = "https://oauth2.googleapis.com/tokeninfo?access_token=" . urlencode($accessToken);
            $verifyRes = fetchUrl($verifyUrl);
            if ($verifyRes === false) {
                http_response_code(401);
                echo json_encode(["error" => "ລະຫັດຢືນຢັນຕົວຕົນ Google ບໍ່ຖືກຕ້ອງ ຫຼື ໝົດອາຍຸ"]);
                break;
            }

            $tokenInfo = json_decode($verifyRes, true);
            if (!isset($tokenInfo['sub']) || ($tokenInfo['aud'] !== $googleClientId && $tokenInfo['azp'] !== $googleClientId)) {
                http_response_code(401);
                echo json_encode(["error" => "ການຢືນຢັນຕົວຕົນ Google Mismatch client ID"]);
                break;
            }

            $oauthId = $tokenInfo['sub'];
            $email   = strtolower(trim($tokenInfo['email'] ?? ''));

            // Fetch profile info (name, picture)
            $profileUrl = "https://www.googleapis.com/oauth2/v3/userinfo?access_token=" . urlencode($accessToken);
            $profileRes = fetchUrl($profileUrl);
            if ($profileRes) {
                $profile = json_decode($profileRes, true);
                $name    = trim($profile['name'] ?? '');
                $avatar  = trim($profile['picture'] ?? '');
            }
            if (!$name) {
                $name = $email ? strstr($email, '@', true) : 'Google User';
            }

        } elseif ($provider === 'facebook') {
            $fbAppId = env('FACEBOOK_APP_ID');
            if (!$fbAppId) {
                http_response_code(500);
                echo json_encode(["error" => "Facebook Login is not configured on the server."]);
                break;
            }

            // Verify Facebook Token and fetch profile info in one Graph API request
            $profileUrl = "https://graph.facebook.com/v18.0/me?fields=id,name,email,picture.type(large)&access_token=" . urlencode($accessToken);
            $profileRes = fetchUrl($profileUrl);
            if ($profileRes === false) {
                http_response_code(401);
                echo json_encode(["error" => "ລະຫັດຢືນຢັນຕົວຕົນ Facebook ບໍ່ຖືກຕ້ອງ ຫຼື ໝົດອາຍຸ"]);
                break;
            }

            $profile = json_decode($profileRes, true);
            if (!isset($profile['id'])) {
                http_response_code(401);
                echo json_encode(["error" => "ບໍ່ສາມາດຢືນຢັນຕົວຕົນ Facebook ໄດ້"]);
                break;
            }

            // Verify App ID if App Secret is configured
            $fbAppSecret = env('FACEBOOK_APP_SECRET');
            if ($fbAppSecret) {
                $debugUrl = "https://graph.facebook.com/debug_token?input_token=" . urlencode($accessToken) . "&access_token=" . urlencode("$fbAppId|$fbAppSecret");
                $debugRes = fetchUrl($debugUrl);
                if ($debugRes) {
                    $debugData = json_decode($debugRes, true);
                    if (isset($debugData['data']['app_id']) && $debugData['data']['app_id'] != $fbAppId) {
                        http_response_code(401);
                        echo json_encode(["error" => "ການຢືນຢັນຕົວຕົນ Facebook App ID ບໍ່ຖືກຕ້ອງ"]);
                        break;
                    }
                }
            }

            $oauthId = $profile['id'];
            $email   = strtolower(trim($profile['email'] ?? ''));
            $name    = trim($profile['name'] ?? 'Facebook User');
            $avatar  = trim($profile['picture']['data']['url'] ?? '');

        } else {
            http_response_code(400);
            echo json_encode(["error" => "Unsupported social provider"]);
            break;
        }

        // Find user by provider credentials
        $stmt = $conn->prepare("SELECT * FROM users WHERE oauth_provider = ? AND oauth_id = ? LIMIT 1");
        $stmt->bind_param("ss", $provider, $oauthId);
        $stmt->execute();
        $result = $stmt->get_result();
        $stmt->close();

        $user = ($result && $result->num_rows > 0) ? $result->fetch_assoc() : null;

        if (!$user) {
            // User not found by social ID, check by email if we got one
            if ($email) {
                $stmt = $conn->prepare("SELECT * FROM users WHERE email = ? LIMIT 1");
                $stmt->bind_param("s", $email);
                $stmt->execute();
                $result = $stmt->get_result();
                $stmt->close();

                $user = ($result && $result->num_rows > 0) ? $result->fetch_assoc() : null;

                if ($user) {
                    // Email exists, link this social provider to this user
                    $stmt = $conn->prepare("UPDATE users SET oauth_provider = ?, oauth_id = ?, avatar_url = COALESCE(avatar_url, ?), is_active = 1 WHERE user_id = ?");
                    $stmt->bind_param("sssi", $provider, $oauthId, $avatar, $user['user_id']);
                    $stmt->execute();
                    $stmt->close();

                    // Refresh user info
                    $user['oauth_provider'] = $provider;
                    $user['oauth_id']       = $oauthId;
                    $user['is_active']      = 1;
                    if (!$user['avatar_url']) {
                        $user['avatar_url'] = $avatar;
                    }
                }
            }
        }

        // If user still not found, register new user automatically
        if (!$user) {
            // Generate unique username
            $baseUsername = $email ? strstr($email, '@', true) : ($provider . '_' . substr($oauthId, -6));
            $baseUsername = preg_replace('/[^a-zA-Z0-9_]/', '', $baseUsername);
            if (strlen($baseUsername) < 4) {
                $baseUsername = $baseUsername . rand(100, 999);
            }
            $baseUsername = substr($baseUsername, 0, 15);

            // Loop to ensure username is unique
            $username = $baseUsername;
            $isUnique = false;
            $attempts = 0;
            while (!$isUnique && $attempts < 10) {
                $stmt = $conn->prepare("SELECT user_id FROM users WHERE username = ? LIMIT 1");
                $stmt->bind_param("s", $username);
                $stmt->execute();
                $stmt->store_result();
                if ($stmt->num_rows == 0) {
                    $isUnique = true;
                } else {
                    $username = $baseUsername . '_' . rand(100, 999);
                }
                $stmt->close();
                $attempts++;
            }

            // Create random password hash as placeholder
            $randPass     = bin2hex(random_bytes(16));
            $passwordHash = password_hash($randPass, PASSWORD_BCRYPT, ['cost' => 12]);

            // Insert new user
            $role     = 'member';
            $isActive = 1;
            $stmt     = $conn->prepare(
                "INSERT INTO users (username, password_hash, full_name, email, role, is_active, oauth_provider, oauth_id, avatar_url)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)"
            );
            $stmt->bind_param("sssssisss", $username, $passwordHash, $name, $email, $role, $isActive, $provider, $oauthId, $avatar);
            $stmt->execute();
            
            if ($stmt->affected_rows < 1) {
                $stmt->close();
                http_response_code(500);
                echo json_encode(["error" => "ບໍ່ສາມາດສ້າງບັນຊີໃໝ່ໄດ້"]);
                break;
            }
            $newUserId = $conn->insert_id;
            $stmt->close();

            // Fetch newly created user
            $stmt = $conn->prepare("SELECT * FROM users WHERE user_id = ? LIMIT 1");
            $stmt->bind_param("i", $newUserId);
            $stmt->execute();
            $user = $stmt->get_result()->fetch_assoc();
            $stmt->close();
        }

        // Check if account is active
        if (!$user['is_active']) {
            http_response_code(403);
            echo json_encode(["error" => "ບັນຊີຍັງບໍ່ໄດ້ຢືນຢັນ ຫຼື ຖືກລະງັບການໃຊ້ງານ"]);
            break;
        }

        // Login the user (generate JWT access token + refresh token)
        $accessToken  = generateToken($user);
        $refreshToken = issueRefreshToken($conn, (int)$user['user_id']);
        
        $act  = 'Social Login success (' . $provider . ')';
        $logS = $conn->prepare('INSERT INTO user_logs (user_id, action, ip_address) VALUES (?, ?, ?)');
        $logS->bind_param('iss', $user['user_id'], $act, $ip);
        $logS->execute();
        $logS->close();

        echo json_encode([
            'token'         => $accessToken,
            'refresh_token' => $refreshToken,
            'expires_in'    => JWT_ACCESS_TTL,
            'user'          => [
                'id'         => $user['user_id'],
                'username'   => $user['username'],
                'name'       => $user['full_name'],
                'role'       => $user['role'],
                'avatar_url' => $user['avatar_url']
            ],
        ]);
        break;

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
            $accessToken  = generateToken($user);
            $refreshToken = issueRefreshToken($conn, (int)$user['user_id']);
            $act = 'Login success';
            $logS = $conn->prepare('INSERT INTO user_logs (user_id, action, ip_address) VALUES (?, ?, ?)');
            $logS->bind_param('iss', $user['user_id'], $act, $ip);
            $logS->execute();
            $logS->close();

            echo json_encode([
                'token'         => $accessToken,
                'refresh_token' => $refreshToken,
                'expires_in'    => JWT_ACCESS_TTL,
                'user'          => [
                    'id'       => $user['user_id'],
                    'username' => $user['username'],
                    'name'     => $user['full_name'],
                    'role'     => $user['role'],
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
        $otp       = generateOTP();                          // raw — sent in email / dev response
        $otpHash   = hash('sha256', $otp);                   // stored in DB
        $otpExpiry = date('Y-m-d H:i:s', time() + 600);
        $purpose   = 'register';
        $stmt = $conn->prepare(
            "INSERT INTO otp_codes (user_id, otp_code_hash, purpose, expires_at) VALUES (?, ?, ?, ?)"
        );
        $stmt->bind_param('isss', $userId, $otpHash, $purpose, $otpExpiry);
        $stmt->execute();
        $stmt->close();

        // ── Email verification token ────────────────────────────────
        $evToken     = generateSecureToken();                // raw — sent in email
        $evTokenHash = hash('sha256', $evToken);             // stored in DB
        $evExpiry    = date('Y-m-d H:i:s', time() + 86400);
        $stmt = $conn->prepare(
            "INSERT INTO email_verifications (user_id, token_hash, expires_at) VALUES (?, ?, ?)"
        );
        $stmt->bind_param('iss', $userId, $evTokenHash, $evExpiry);
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
            "SELECT otp_id, otp_code_hash, expires_at, attempt_count
             FROM otp_codes
             WHERE user_id = ? AND purpose = 'register' AND used_at IS NULL
             ORDER BY created_at DESC LIMIT 1"
        );
        $stmt->bind_param('i', $userId);
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
        $upd   = $conn->prepare('UPDATE otp_codes SET attempt_count = attempt_count + 1 WHERE otp_id = ?');
        $upd->bind_param('i', $otpId);
        $upd->execute();
        $upd->close();

        // Check expiry
        if (strtotime($row['expires_at']) < time()) {
            http_response_code(400);
            echo json_encode(["error" => "OTP ໝົດອາຍຸແລ້ວ ກະລຸນາຂໍ OTP ໃໝ່"]);
            break;
        }

        // Compare hash (constant-time)
        $inputHash = hash('sha256', $otpCode);
        if (!hash_equals($row['otp_code_hash'], $inputHash)) {
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

        // New OTP — store hash
        $newOtp     = generateOTP();
        $newOtpHash = hash('sha256', $newOtp);
        $expiry     = date('Y-m-d H:i:s', time() + 600);
        $purpose    = 'register';
        $stmt       = $conn->prepare(
            'INSERT INTO otp_codes (user_id, otp_code_hash, purpose, expires_at) VALUES (?,?,?,?)'
        );
        $stmt->bind_param('isss', $userId, $newOtpHash, $purpose, $expiry);
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

        $ip = clientIP();

        // IP rate limit: max 5 forgot_password requests per IP per day
        if (!checkIPRateLimit($conn, 'Password reset request', $ip, 5, 86400)) {
            http_response_code(429);
            echo json_encode([
                "error" => "ຂໍ reset ລະຫັດຜ່ານຫຼາຍເກີນໄປ ກະລຸນາລໍຖ້າ 24 ຊົ່ວໂມງ",
                "code"  => "RATE_LIMIT",
            ]);
            break;
        }

        // Always return success (don't reveal whether email exists)
        $stmt = $conn->prepare("SELECT user_id, full_name FROM users WHERE email = ? AND is_active = 1 LIMIT 1");
        $stmt->bind_param("s", $email);
        $stmt->execute();
        $userRes = $stmt->get_result()->fetch_assoc();
        $stmt->close();

        $resp      = ["success" => true, "message" => "ຖ້າ Email ດັ່ງກ່າວມີຢູ່ ທ່ານຈະໄດ້ຮັບ Email ເດ"];
        $logUserId = null;

        if ($userRes) {
            $logUserId = $userRes['user_id'];

            // User-level rate limit: max 5 resets per calendar day (UTC)
            $todayStart = date('Y-m-d') . ' 00:00:00';
            $rlStmt = $conn->prepare(
                "SELECT COUNT(*) FROM password_resets WHERE user_id = ? AND created_at >= ?"
            );
            $rlStmt->bind_param('is', $userRes['user_id'], $todayStart);
            $rlStmt->execute();
            $rlCount = 0;
            $rlStmt->bind_result($rlCount);
            $rlStmt->fetch();
            $rlStmt->close();

            if ($rlCount < 5) {
                // Invalidate old tokens
                $del = $conn->prepare("UPDATE password_resets SET used_at = NOW() WHERE user_id = ? AND used_at IS NULL");
                $del->bind_param("i", $userRes['user_id']);
                $del->execute();
                $del->close();

                $resetToken     = generateSecureToken();          // raw — sent in email URL
                $resetTokenHash = hash('sha256', $resetToken);    // stored in DB
                $expiry         = date('Y-m-d H:i:s', time() + 3600);
                $stmt = $conn->prepare(
                    'INSERT INTO password_resets (user_id, token_hash, expires_at) VALUES (?,?,?)'
                );
                $stmt->bind_param('iss', $userRes['user_id'], $resetTokenHash, $expiry);
                $stmt->execute();
                $stmt->close();

                sendPasswordResetEmail($email, $userRes['full_name'], $resetToken);

                if (!PRODUCTION) $resp['dev_token'] = $resetToken;
            }
            // else: silently skip — don't reveal rate limit to requester
        }

        // Log every attempt (drives IP rate limit counter for future requests)
        $rlAction = 'Password reset request';
        $logS = $conn->prepare('INSERT INTO user_logs (user_id, action, ip_address) VALUES (?,?,?)');
        $logS->bind_param('iss', $logUserId, $rlAction, $ip);
        $logS->execute();
        $logS->close();

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

        // Find valid token — lookup by SHA-256 hash
        $tokenLookupHash = hash('sha256', $token);
        $stmt = $conn->prepare(
            'SELECT reset_id, user_id, expires_at FROM password_resets
             WHERE token_hash = ? AND used_at IS NULL LIMIT 1'
        );
        $stmt->bind_param('s', $tokenLookupHash);
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

        $tokenLookupHash = hash('sha256', $token);
        $stmt = $conn->prepare(
            'SELECT verification_id, user_id, expires_at, verified_at
             FROM email_verifications WHERE token_hash = ? LIMIT 1'
        );
        $stmt->bind_param('s', $tokenLookupHash);
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
    // REFRESH TOKEN — issue new access token using a valid refresh token
    // POST: { "refresh_token": "<raw 64-char token>" }
    // ================================================================
    case 'refresh_token':
        if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
            http_response_code(405);
            echo json_encode(['error' => 'Only POST allowed']);
            break;
        }

        $input        = json_decode(file_get_contents('php://input'), true);
        $rawRefresh   = trim($input['refresh_token'] ?? '');

        if (!$rawRefresh) {
            http_response_code(400);
            echo json_encode(['error' => 'refresh_token ຫວ່າງ']);
            break;
        }

        $refreshHash = hash('sha256', $rawRefresh);

        $stmt = $conn->prepare(
            'SELECT rt_id, user_id, expires_at, revoked_at
             FROM refresh_tokens WHERE token_hash = ? LIMIT 1'
        );
        $stmt->bind_param('s', $refreshHash);
        $stmt->execute();
        $rtRow = $stmt->get_result()->fetch_assoc();
        $stmt->close();

        if (!$rtRow || $rtRow['revoked_at'] !== null) {
            http_response_code(401);
            echo json_encode(['error' => 'Refresh token ບໍ່ຖືກຕ້ອງ ຫຼື ຖືກຍົກເລີກແລ້ວ', 'code' => 'REFRESH_INVALID']);
            break;
        }

        if (strtotime($rtRow['expires_at']) < time()) {
            http_response_code(401);
            echo json_encode(['error' => 'Refresh token ໝົດອາຍຸ ກະລຸນາ login ໃໝ່', 'code' => 'REFRESH_EXPIRED']);
            break;
        }

        // Rotate refresh token (revoke old, issue new)
        $now = date('Y-m-d H:i:s');
        $revokeStmt = $conn->prepare('UPDATE refresh_tokens SET revoked_at = ? WHERE rt_id = ?');
        $revokeStmt->bind_param('si', $now, $rtRow['rt_id']);
        $revokeStmt->execute();
        $revokeStmt->close();

        // Fetch user
        $userId = (int)$rtRow['user_id'];
        $uStmt  = $conn->prepare('SELECT user_id, username, full_name, role, is_active FROM users WHERE user_id = ? AND deleted_at IS NULL');
        $uStmt->bind_param('i', $userId);
        $uStmt->execute();
        $userRow = $uStmt->get_result()->fetch_assoc();
        $uStmt->close();

        if (!$userRow || !$userRow['is_active']) {
            http_response_code(403);
            echo json_encode(['error' => 'ບັນຊີຖືກລະງັບ']);
            break;
        }

        $newAccessToken  = generateToken($userRow);
        $newRefreshToken = issueRefreshToken($conn, $userId);

        echo json_encode([
            'token'         => $newAccessToken,
            'refresh_token' => $newRefreshToken,
            'expires_in'    => JWT_ACCESS_TTL,
        ]);
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
