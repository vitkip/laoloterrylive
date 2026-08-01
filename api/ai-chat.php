<?php
/**
 * ai-chat.php — AI ແຊັດບອດ ດ້ວຍ Claude (ຖາມ-ຕອບກ່ຽວກັບເລກ, ສະຖິຕິ, ວິທີຫຼິ້ນ)
 * POST /api/ai-chat.php  (ຕ້ອງ login)
 * Body: { "messages": [{ "role": "user"|"assistant", "content": "..." }, ...] }
 * (ສົ່ງມາໄດ້ສູງສຸດ 20 ຂໍ້ຄວາມ — history ຝັ່ງ client ຄຸ້ມຄອງເອງ)
 */
require_once __DIR__ . '/config.php';
require_once __DIR__ . '/lib/auth.php';
require_once __DIR__ . '/lib/claude.php';

$origin = isset($_SERVER['HTTP_ORIGIN']) ? $_SERVER['HTTP_ORIGIN'] : '';
$allowedOrigin = in_array($origin, ALLOWED_ORIGINS, true) ? $origin : ALLOWED_ORIGINS[0];
header("Access-Control-Allow-Origin: " . $allowedOrigin);
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit();
}

requireAuth();

$conn = new mysqli(DB_HOST, DB_USER, DB_PASS, DB_NAME);
if ($conn->connect_error) {
    http_response_code(500);
    echo json_encode(["error" => "Database connection failed"]);
    exit();
}
$conn->set_charset("utf8mb4");

$body     = json_decode(file_get_contents('php://input'), true);
$messages = is_array($body['messages'] ?? null) ? $body['messages'] : [];

if (empty($messages)) {
    http_response_code(400);
    echo json_encode(['error' => 'ກະລຸນາພິມຂໍ້ຄວາມ']);
    exit();
}
if (count($messages) > 20) {
    $messages = array_slice($messages, -20);
}

// ── Sanitize + cap conversation payload ──────────────────────────────
$clean = [];
$totalLen = 0;
foreach ($messages as $m) {
    $role = ($m['role'] ?? '') === 'assistant' ? 'assistant' : 'user';
    $content = trim((string) ($m['content'] ?? ''));
    if ($content === '') continue;
    if (mb_strlen($content) > 1000) {
        $content = mb_substr($content, 0, 1000);
    }
    $totalLen += mb_strlen($content);
    $clean[] = ['role' => $role, 'content' => $content];
}
if (empty($clean)) {
    http_response_code(400);
    echo json_encode(['error' => 'ຂໍ້ຄວາມຫວ່າງເປົ່າ']);
    exit();
}
if ($totalLen > 6000) {
    http_response_code(400);
    echo json_encode(['error' => 'ບົດສົນທະນາຍາວເກີນໄປ ກະລຸນາເລີ່ມແຊັດໃໝ່']);
    exit();
}
// Claude requires the message list to start with role=user
while (!empty($clean) && $clean[0]['role'] !== 'user') {
    array_shift($clean);
}
if (empty($clean)) {
    http_response_code(400);
    echo json_encode(['error' => 'ຂໍ້ຄວາມບໍ່ຖືກຕ້ອງ']);
    exit();
}

// ── Ground the bot with the latest real draw (avoid hallucinated results) ──
$latest = $conn->query(
    "SELECT draw_number, draw_date, full_result FROM lottery_draws
     WHERE status = 'published' ORDER BY draw_date DESC, draw_number DESC LIMIT 1"
)->fetch_assoc();
$latestFact = $latest
    ? "ງວດຫຼ້າສຸດ: #{$latest['draw_number']} ວັນທີ {$latest['draw_date']} ຜົນ {$latest['full_result']}"
    : "ຍັງບໍ່ມີຂໍ້ມູນງວດຫຼ້າສຸດ";

$systemPrompt = "ທ່ານແມ່ນ AI ຜູ້ຊ່ວຍຂອງເວັບໄຊ Lao Lottery Live (laolots.com) — ເວັບກວດຫວຍລາວ ແລະ ວິເຄາະສະຖິຕິ."
    . "\nຫນ້າທີ່: ຕອບຄຳຖາມກ່ຽວກັບຫວຍລາວ, ວິທີອ່ານສະຖິຕິ (ເລກຮ້ອນ/ຄ້າງ/momentum), ວິທີໃຊ້ເວັບໄຊ, ແລະ ວິທີການແທງ."
    . "\nຂໍ້ເທັດຈິງທີ່ຮູ້: {$latestFact}"
    . "\nກົດລະບຽບສຳຄັນ:"
    . "\n- ຫ້າມທຳນາຍ ຫຼື ຮັບປະກັນວ່າເລກໃດຈະອອກ — ຫວຍແມ່ນການສຸ່ມ 100%"
    . "\n- ຖ້າຖືກຖາມເລກທຳນາຍ ໃຫ້ແນະນຳໄປໜ້າ /prediction ຫຼື /analytics ແທນ"
    . "\n- ຖ້າຖືກຖາມຄວາມຝັນ ໃຫ້ແນະນຳໄປໜ້າ /search (ແທັບ ຝັນ)"
    . "\n- ເຕືອນສະຕິການຫຼິ້ນຢ່າງມີຄວາມຮັບຜິດຊອບສະເໝີເມື່ອກ່ຽວຂ້ອງກັບການແທງ/ໃຊ້ເງິນ"
    . "\n- ຕອບສັ້ນ ກະທັດຮັດ ເປັນມິດ ເປັນພາສາລາວ (ຍົກເວັ້ນຜູ້ໃຊ້ຖາມເປັນພາສາອື່ນ)"
    . "\n- ຕອບເປັນຂໍ້ຄວາມທຳມະດາເທົ່ານັ້ນ ບໍ່ຕ້ອງມີ JSON ຫຼື markdown ຫົວຂໍ້ໃຫຍ່";

try {
    $reply = callClaudeText($systemPrompt, $clean, 500);
    echo json_encode(['reply' => $reply]);
} catch (Exception $e) {
    http_response_code(502);
    echo json_encode(['error' => $e->getMessage()]);
}
