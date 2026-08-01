<?php
/**
 * lib/auth.php — Shared JWT auth helpers for standalone AI endpoints
 * (ai-explain-prediction.php, ai-summarize-stats.php, ai-chat.php,
 * ai-betting-insights.php). Identical logic to the block duplicated in
 * index.php / betting.php — extracted here since these are new files
 * with no other reason to duplicate it a 4th/5th/6th time.
 *
 * Usage: require_once __DIR__ . '/config.php'; require_once __DIR__ . '/lib/auth.php';
 */

if (!defined('SECRET_KEY')) {
    define('SECRET_KEY', JWT_SECRET);
}

if (!function_exists('getAuthorizationHeader')) {
    function getAuthorizationHeader()
    {
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
        if (!empty($_SERVER['HTTP_AUTHORIZATION'])) {
            return $_SERVER['HTTP_AUTHORIZATION'];
        }
        if (!empty($_SERVER['REDIRECT_HTTP_AUTHORIZATION'])) {
            return $_SERVER['REDIRECT_HTTP_AUTHORIZATION'];
        }
        return '';
    }
}

if (!function_exists('verifyToken')) {
    function verifyToken()
    {
        $authHeader = getAuthorizationHeader();
        if (!$authHeader || !preg_match('/Bearer\s(\S+)/i', $authHeader, $matches)) {
            return false;
        }
        $token = $matches[1];
        $parts = explode('.', $token);
        if (count($parts) !== 3) return false;

        $signature = hash_hmac('sha256', $parts[0] . '.' . $parts[1], SECRET_KEY, true);
        $expected  = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($signature));
        if (!hash_equals($expected, $parts[2])) return false;

        $payload = json_decode(base64_decode(str_replace(['-', '_'], ['+', '/'], $parts[1])), true);
        if (!is_array($payload)) return false;

        if (empty($payload['exp']) || $payload['exp'] < time()) {
            return 'expired';
        }

        return $payload;
    }
}

if (!function_exists('requireAuth')) {
    /**
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
}
