<?php
// ກວດວ່າເປັນ local dev ຫຼື production
$isLocal = in_array($_SERVER['SERVER_NAME'] ?? '', ['localhost', '127.0.0.1', '']);

if ($isLocal) {
    define('DB_HOST', 'localhost');
    define('DB_USER', 'root');
    define('DB_PASS', '');
    define('DB_NAME', 'lao_lottery_pro');
    define('ALLOWED_ORIGINS', ['http://localhost:5173', 'http://localhost:5174', 'http://localhost']);
    define('PRODUCTION', false);
} else {
    define('DB_HOST', 'localhost');
    define('DB_USER', 'laolycfc_laolots');
    define('DB_PASS', '@DKvon0328117');
    define('DB_NAME', 'laolycfc_lao_lottery_pro');
    define('ALLOWED_ORIGINS', ['https://laolots.com', 'https://www.laolots.com']);
    define('PRODUCTION', true);
}

define('JWT_SECRET', '4f075fc0dc9480ff4d6f70a8facb5b586f9deb0f6f95a89dfdfef64a81274ae7');
