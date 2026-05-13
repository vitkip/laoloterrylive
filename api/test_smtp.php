<?php
// ── SMTP Test Tool ─────────────────────────────────────────────────
// ລົບໄຟລ໌ນີ້ຫຼັງຈາກທົດສອບສຳເລັດ
// DELETE THIS FILE after testing is complete

require_once __DIR__ . '/config.php';

// Secret key — change before uploading
define('TEST_KEY', 'laolots_smtp_test_2026');

header('Content-Type: text/plain; charset=UTF-8');

// ── Auth ───────────────────────────────────────────────────────────
if (($_GET['key'] ?? '') !== TEST_KEY) {
    http_response_code(403);
    echo "Access denied. Use: ?key=laolots_smtp_test_2026&to=your@email.com";
    exit();
}

$to = trim($_GET['to'] ?? '');
if (!$to || !filter_var($to, FILTER_VALIDATE_EMAIL)) {
    echo "Usage: ?key=laolots_smtp_test_2026&to=your@email.com";
    exit();
}

// ── Environment info ───────────────────────────────────────────────
echo "=== SMTP Test Tool ===\n\n";
echo "Server: " . ($_SERVER['SERVER_NAME'] ?? 'unknown') . "\n";
echo "PRODUCTION: " . (PRODUCTION ? 'true' : 'false') . "\n";
echo "SMTP_HOST: " . SMTP_HOST . "\n";
echo "SMTP_PORT: " . SMTP_PORT . "\n";
echo "SMTP_USER: " . SMTP_USER . "\n";
echo "SMTP_FROM: " . SMTP_FROM . "\n";
echo "Send to:   $to\n\n";

// ── Check PHPMailer files ──────────────────────────────────────────
$libPath = __DIR__ . '/lib/';
$files   = ['Exception.php', 'PHPMailer.php', 'SMTP.php'];
$missing = false;

echo "=== Checking lib files ===\n";
foreach ($files as $f) {
    $exists = file_exists($libPath . $f);
    echo ($exists ? "[OK] " : "[MISSING] ") . $f . "\n";
    if (!$exists) $missing = true;
}
echo "\n";

if ($missing) {
    echo "ERROR: PHPMailer files missing. Upload api/lib/ folder to server.\n";
    exit();
}

require_once $libPath . 'Exception.php';
require_once $libPath . 'PHPMailer.php';
require_once $libPath . 'SMTP.php';

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\SMTP;

// ── Test TCP connection first ──────────────────────────────────────
echo "=== Testing TCP connection ===\n";
$sock = @fsockopen(SMTP_HOST, SMTP_PORT, $errno, $errstr, 10);
if ($sock) {
    fclose($sock);
    echo "[OK] Connected to " . SMTP_HOST . ":" . SMTP_PORT . "\n\n";
} else {
    echo "[FAIL] Cannot connect to " . SMTP_HOST . ":" . SMTP_PORT . "\n";
    echo "Error: $errno - $errstr\n";
    echo "\nTrying alternative port...\n";
    $altPort = (SMTP_PORT === 465) ? 587 : 465;
    $sock2   = @fsockopen(SMTP_HOST, $altPort, $errno2, $errstr2, 10);
    if ($sock2) {
        fclose($sock2);
        echo "[OK] Alternative port $altPort works!\n";
        echo "=> Change SMTP_PORT to $altPort in config.php\n\n";
    } else {
        echo "[FAIL] Port $altPort also failed: $errstr2\n\n";
    }
}

// ── Send test email via PHPMailer ──────────────────────────────────
echo "=== Sending test email ===\n";

$mail = new PHPMailer(true);
try {
    $mail->SMTPDebug   = SMTP::DEBUG_SERVER;
    $mail->Debugoutput = 'echo';
    $mail->isSMTP();
    $mail->Host       = SMTP_HOST;
    $mail->SMTPAuth   = true;
    $mail->Username   = SMTP_USER;
    $mail->Password   = SMTP_PASS;
    $mail->SMTPSecure = (SMTP_PORT === 465)
        ? PHPMailer::ENCRYPTION_SMTPS
        : PHPMailer::ENCRYPTION_STARTTLS;
    $mail->Port       = SMTP_PORT;
    $mail->CharSet    = 'UTF-8';
    // Disable SSL peer verification (cPanel self-signed cert)
    $mail->SMTPOptions = [
        'ssl' => [
            'verify_peer'       => false,
            'verify_peer_name'  => false,
            'allow_self_signed' => true,
        ],
    ];
    $mail->setFrom(SMTP_FROM, SMTP_FROM_NAME);
    $mail->addAddress($to);
    $mail->Subject = 'SMTP Test - Lao Lottery Live';
    $mail->Body    = "SMTP test successful!\nSent from: " . SMTP_FROM . "\nTime: " . date('Y-m-d H:i:s');
    $mail->send();
    echo "\n[SUCCESS] Email sent to $to — ກວດ inbox (ແລະ spam folder)\n";
} catch (\Exception $e) {
    echo "\n[FAIL] " . $mail->ErrorInfo . "\n";
}
