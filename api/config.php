<?php
// ================================================================
// ການຕັ້ງຄ່າ Production — ປ່ຽນຄ່າເຫຼົ່ານີ້ກ່ອນ deploy ຂຶ້ນ server ຈິງ
// ================================================================

// Database
define('DB_HOST', 'localhost');
define('DB_USER', 'laolycfc_laolots');
define('DB_PASS', '@DKvon0328117');
define('DB_NAME', 'laolycfc_lao_lottery_pro');

define('JWT_SECRET', '4f075fc0dc9480ff4d6f70a8facb5b586f9deb0f6f95a89dfdfef64a81274ae7');

// ຍອມຮັບທັງ www ແລະ non-www
define('ALLOWED_ORIGINS', ['https://laolots.com', 'https://www.laolots.com']);

// Production mode: true = ປິດ PHP error display
define('PRODUCTION', true);
