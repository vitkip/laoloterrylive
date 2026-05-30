<?php
/**
 * env.php — Minimal .env file parser
 *
 * Reads api/.env, parses KEY=VALUE pairs, and defines constants
 * used by the rest of the API.
 *
 * Security:
 *  - .env is blocked by api/.htaccess (deny from all)
 *  - Never expose this file or .env through the web
 *
 * Usage: require_once __DIR__ . '/env.php';
 */

function loadEnv(string $path): void
{
    if (!file_exists($path)) {
        // Fall back to hardcoded dev defaults if .env missing
        // (dev only — production MUST have .env)
        return;
    }

    $lines = file($path, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    foreach ($lines as $line) {
        $line = trim($line);
        // Skip comments and section headers
        if ($line === '' || $line[0] === ';' || $line[0] === '#') {
            continue;
        }
        if (!str_contains($line, '=')) {
            continue;
        }
        [$key, $value] = explode('=', $line, 2);
        $key   = trim($key);
        $value = trim($value);
        // Strip inline comments (value = foo ; comment)
        if (($pos = strpos($value, ' ;')) !== false) {
            $value = trim(substr($value, 0, $pos));
        }
        // Strip surrounding quotes
        if (strlen($value) >= 2 &&
            (($value[0] === '"' && substr($value, -1) === '"') ||
             ($value[0] === "'" && substr($value, -1) === "'"))) {
            $value = substr($value, 1, -1);
        }
        $_ENV[$key] = $value;
        // Do NOT call putenv() — avoid leaking to child processes
    }
}

// ── Load .env ──────────────────────────────────────────────────────
$envPath = __DIR__ . '/.env';
loadEnv($envPath);

// ── Helper: read env var with fallback ─────────────────────────────
function env(string $key, $default = null)
{
    return $_ENV[$key] ?? $default;
}

// ── Determine environment ──────────────────────────────────────────
$_isLocal = in_array(
    $_SERVER['SERVER_NAME'] ?? '',
    ['localhost', '127.0.0.1', ''],
    true
);

// If .env says PRODUCTION=true, trust it regardless of server name
$_envProduction = filter_var(env('PRODUCTION', $_isLocal ? 'false' : 'true'), FILTER_VALIDATE_BOOLEAN);

// ── Database ───────────────────────────────────────────────────────
define('DB_HOST', env('DB_HOST', 'localhost'));
define('DB_USER', env('DB_USER', 'root'));
define('DB_PASS', env('DB_PASS', ''));
define('DB_NAME', env('DB_NAME', 'lao_lottery_pro'));

// ── JWT ────────────────────────────────────────────────────────────
define('JWT_SECRET',      env('JWT_SECRET',      'dev-insecure-secret-change-me'));
define('JWT_ACCESS_TTL',  (int) env('JWT_ACCESS_TTL',  900));    // 15 minutes
define('JWT_REFRESH_TTL', (int) env('JWT_REFRESH_TTL', 604800)); // 7 days

// ── SMTP ───────────────────────────────────────────────────────────
define('SMTP_HOST',      env('SMTP_HOST',      'localhost'));
define('SMTP_PORT',      (int) env('SMTP_PORT', 587));
define('SMTP_USER',      env('SMTP_USER',      ''));
define('SMTP_PASS',      env('SMTP_PASS',      ''));
define('SMTP_FROM',      env('SMTP_FROM',      'noreply@laolots.com'));
define('SMTP_FROM_NAME', env('SMTP_FROM_NAME', 'Lao Lottery Live'));

// ── App ────────────────────────────────────────────────────────────
define('PRODUCTION', $_envProduction);
define('APP_URL', env('APP_URL', 'http://localhost:5173'));

// ── CORS origins ───────────────────────────────────────────────────
$_rawOrigins = env('ALLOWED_ORIGINS', 'http://localhost:3000,http://localhost:5173,http://localhost:5174,http://localhost');
define('ALLOWED_ORIGINS', array_map('trim', explode(',', $_rawOrigins)));

// ── Cleanup ─────────────────────────────────────────────────────────
unset($_isLocal, $_envProduction, $_rawOrigins, $envPath);
