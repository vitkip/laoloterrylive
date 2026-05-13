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

    // Local dev: SMTP not used (OTP returned in API response)
    define('SMTP_HOST', 'localhost');
    define('SMTP_PORT', 587);
    define('SMTP_USER', '');
    define('SMTP_PASS', '');
    define('SMTP_FROM', 'noreply@laolots.com');
    define('SMTP_FROM_NAME', 'Lao Lottery Live');
} else {
    define('DB_HOST', 'localhost');
    define('DB_USER', 'laolycfc_laolots');
    define('DB_PASS', '@DKvon0328117');
    define('DB_NAME', 'laolycfc_lao_lottery_pro');
    define('ALLOWED_ORIGINS', ['https://laolots.com', 'https://www.laolots.com']);
    define('PRODUCTION', true);

    // cPanel SMTP — ສ້າງ Email Account ໃນ cPanel ກ່ອນ (noreply@laolots.com)
    define('SMTP_HOST', 'mail.laolots.com');
    define('SMTP_PORT', 465);
    define('SMTP_USER', 'noreply@laolots.com');
    define('SMTP_PASS', '@DKvon0328117');
    define('SMTP_FROM', 'noreply@laolots.com');
    define('SMTP_FROM_NAME', 'Lao Lottery Live');
}

define('JWT_SECRET', '4f075fc0dc9480ff4d6f70a8facb5b586f9deb0f6f95a89dfdfef64a81274ae7');
