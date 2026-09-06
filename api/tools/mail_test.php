<?php
/**
 * mail_test.php — ກວດການສົ່ງອີເມວ (OTP / reset password) ວ່າຕິດບ່ອນໃດ
 *
 * auth.php ກືນ error ຂອງ PHPMailer ໄວ້ໃນ error_log ຢ່າງດຽວ ແລະ PRODUCTION=true
 * ຍັງປິດ display_errors ນຳ — ເລີຍບໍ່ເຫັນສາເຫດຈິງ. ສະຄຣິບນີ້ພິມ SMTP debug ອອກມາໝົດ.
 *
 * CLI ເທົ່ານັ້ນ — ບໍ່ເປີດຜ່ານ browser.
 *
 *   ສົ່ງທົດສອບ (ໃຊ້ຄ່າໃນ .env):   php api/tools/mail_test.php me@gmail.com
 *   ລອງ port ອື່ນ:                 php api/tools/mail_test.php me@gmail.com --port=465
 *   ຂ້າມການກວດ SSL cert:           php api/tools/mail_test.php me@gmail.com --insecure
 *   ລອງທາງ sendmail ຂອງ server:    php api/tools/mail_test.php me@gmail.com --sendmail
 *
 * ບໍ່ແກ້ໄຂຫຍັງໃນຖານຂໍ້ມູນ — ສົ່ງເມວທົດສອບຢ່າງດຽວ.
 */

if (PHP_SAPI !== 'cli') {
    http_response_code(403);
    exit("CLI only\n");
}

require_once __DIR__ . '/../config.php';
require_once __DIR__ . '/../lib/Exception.php';
require_once __DIR__ . '/../lib/PHPMailer.php';
require_once __DIR__ . '/../lib/SMTP.php';

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\SMTP;

$to = null;
$port = SMTP_PORT;
$insecure = false;
$useSendmail = false;

foreach (array_slice($argv, 1) as $arg) {
    if ($arg === '--insecure')            { $insecure = true; continue; }
    if ($arg === '--sendmail')            { $useSendmail = true; continue; }
    if (str_starts_with($arg, '--port=')) { $port = (int) substr($arg, 7); continue; }
    if ($to === null)                     { $to = $arg; continue; }
}

if ($to === null) {
    exit("ໃຊ້: php api/tools/mail_test.php <ອີເມວປາຍທາງ> [--port=465] [--insecure] [--sendmail]\n");
}

// ── ຄ່າທີ່ env.php ອ່ານໄດ້ຈິງ (ລະຫັດຜ່ານພິມແຕ່ຄວາມຍາວ) ─────────────
echo "=== ຄ່າທີ່ອ່ານໄດ້ຈາກ .env ===\n";
printf("  SMTP_HOST      = %s\n", SMTP_HOST);
printf("  SMTP_PORT      = %d%s\n", $port, $port === SMTP_PORT ? '' : ' (override)');
printf("  SMTP_USER      = %s\n", SMTP_USER === '' ? '(ຫວ່າງ)' : SMTP_USER);
printf("  SMTP_PASS      = %s (ຍາວ %d ຕົວ)\n",
    SMTP_PASS === '' ? '(ຫວ່າງ)' : str_repeat('*', strlen(SMTP_PASS)), strlen(SMTP_PASS));
printf("  SMTP_FROM      = %s\n", SMTP_FROM);
printf("  PRODUCTION     = %s\n", PRODUCTION ? 'true' : 'false');
echo "\n";

if (!PRODUCTION) {
    echo "ໝາຍເຫດ: PRODUCTION=false → ໃນ auth.php ຈິງມັນ 'ບໍ່ສົ່ງເມວ' ເລີຍ (return true ທັນທີ)\n";
    echo "        ແລະສົ່ງ OTP ກັບຄືນທາງ API ເປັນ dev_otp ແທນ. ສະຄຣິບນີ້ຈະຍັງລອງສົ່ງຈິງໃຫ້ເບິ່ງ.\n\n";
}

// ── ເລືອກທາງສົ່ງ ຄືກັນກັບ createMailer() ໃນ auth.php ────────────────
$mail = new PHPMailer(true);
$mail->CharSet = 'UTF-8';
$mail->setFrom(SMTP_FROM, SMTP_FROM_NAME);
$mail->addAddress($to);
$mail->Subject = 'ທົດສອບການສົ່ງເມວ - Lao Lottery Live';
$mail->isHTML(true);
$mail->Body    = '<p>ຖ້າທ່ານໄດ້ຮັບເມວນີ້ ແປວ່າ SMTP ໃຊ້ງານໄດ້ແລ້ວ.</p><p>ສົ່ງເມື່ອ: '
               . date('Y-m-d H:i:s') . '</p>';
$mail->AltBody = 'ຖ້າທ່ານໄດ້ຮັບເມວນີ້ ແປວ່າ SMTP ໃຊ້ງານໄດ້ແລ້ວ. ສົ່ງເມື່ອ: ' . date('Y-m-d H:i:s');

$sendmailPath = $useSendmail || SMTP_USER === ''
             || SMTP_HOST === 'localhost' || SMTP_HOST === '127.0.0.1';

if ($sendmailPath) {
    echo "ທາງທີ່ໃຊ້: sendmail ຂອງ server (isSendmail)\n";
    echo "  ເຫດຜົນ: " . ($useSendmail ? '--sendmail' : 'SMTP_USER ຫວ່າງ ຫຼື host ເປັນ localhost') . "\n\n";
    $mail->isSendmail();
} else {
    echo "ທາງທີ່ໃຊ້: SMTP ພາຍນອກ (" . SMTP_HOST . ":" . $port . ")\n\n";
    $mail->isSMTP();
    $mail->Host       = SMTP_HOST;
    $mail->SMTPAuth   = true;
    $mail->Username   = SMTP_USER;
    $mail->Password   = SMTP_PASS;
    $mail->SMTPSecure = ($port === 465) ? PHPMailer::ENCRYPTION_SMTPS : PHPMailer::ENCRYPTION_STARTTLS;
    $mail->Port       = $port;
    $mail->Timeout    = 20;

    if ($insecure) {
        echo "!! --insecure: ປິດການກວດ SSL certificate (ໃຊ້ວິນິດໄສເທົ່ານັ້ນ)\n\n";
        $mail->SMTPOptions = ['ssl' => [
            'verify_peer'       => false,
            'verify_peer_name'  => false,
            'allow_self_signed' => true,
        ]];
    }

    // ພິມບົດສົນທະນາ SMTP ທັງໝົດ — ນີ້ຄືສ່ວນທີ່ auth.php ເຊື່ອງໄວ້
    $mail->SMTPDebug   = SMTP::DEBUG_CONNECTION;
    $mail->Debugoutput = function ($str, $level) { echo "  [smtp] " . rtrim($str) . "\n"; };
}

echo "=== ກຳລັງສົ່ງຫາ $to ===\n";
try {
    $mail->send();
    echo "\nສຳເລັດ: ສົ່ງອອກແລ້ວ. ກວດ inbox ແລະ junk/spam ຂອງ $to\n";
} catch (\Throwable $e) {
    echo "\nລົ້ມເຫລວ: " . $e->getMessage() . "\n";
    if ($mail->ErrorInfo !== '') {
        echo "ລາຍລະອຽດ: " . $mail->ErrorInfo . "\n";
    }
    exit(1);
}
