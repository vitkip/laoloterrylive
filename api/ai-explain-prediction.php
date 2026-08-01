<?php
/**
 * ai-explain-prediction.php — AI ອະທິບາຍເຫດຜົນທຳນາຍເລກ ດ້ວຍ Claude
 * POST /api/ai-explain-prediction.php  (ຕ້ອງ login)
 * Body: {
 *   "n": 50, "drawNum": "1234", "dateStr": "1 ສິງຫາ 2026", "digitLen": 2,
 *   "top": [{ "num":"23", "total":78.4, "probability":100,
 *             "freqW":10.2, "overdueW":12.1, "momentumW":8.0, "decisionW":6,
 *             "monthlyW":9.5, "weekdayW":11.0, "pairW":5.2, "mirrorW":3.5,
 *             "freq":7, "gap":4, "overdue":1.3, "momentum":0.15 }, ...]  (max 6)
 * }
 * Claude only writes the NATURAL-LANGUAGE explanation — every number/score
 * fed in is already computed deterministically by analytics.js (RAG-style:
 * we ground the model in real stats instead of letting it invent numbers).
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

$body = json_decode(file_get_contents('php://input'), true);
$top      = is_array($body['top'] ?? null) ? $body['top'] : [];
$n        = (int) ($body['n'] ?? 0);
$drawNum  = trim((string) ($body['drawNum'] ?? ''));
$dateStr  = trim((string) ($body['dateStr'] ?? ''));
$digitLen = (int) ($body['digitLen'] ?? 2);

if (empty($top)) {
    http_response_code(400);
    echo json_encode(['error' => 'ຂໍ້ມູນ top ຫວ່າງເປົ່າ']);
    exit();
}
if (count($top) > 6) {
    $top = array_slice($top, 0, 6);
}
$digitLen = $digitLen === 3 ? 3 : 2;

// ── Sanitize + build a compact fact sheet for Claude (no free-form injection) ──
$lines = [];
foreach ($top as $i => $row) {
    $num = preg_replace('/[^0-9]/', '', (string) ($row['num'] ?? ''));
    if ($num === '' || strlen($num) > 3) continue;
    $fmt = fn($v) => is_numeric($v) ? round((float) $v, 2) : 0;
    $lines[] = sprintf(
        "%d. ເລກ %s — ຄະແນນລວມ %s/100 (ຄວາມຖີ່ %s, ຄ້າງງວດ %s, momentum %s, ສັນຍານ %s, ເດືອນ %s, ວັນອອກ %s, ຕໍ່ຈາກ %s, ສະລັບ %s) | ອອກແລ້ວ %s ຄັ້ງ, ຄ້າງມາ %s ງວດ, overdue ratio %s",
        $i + 1,
        $num,
        $fmt($row['total'] ?? $row['probability'] ?? 0),
        $fmt($row['freqW'] ?? 0), $fmt($row['overdueW'] ?? 0), $fmt($row['momentumW'] ?? 0), $fmt($row['decisionW'] ?? 0),
        $fmt($row['monthlyW'] ?? 0), $fmt($row['weekdayW'] ?? 0), $fmt($row['pairW'] ?? 0), $fmt($row['mirrorW'] ?? 0),
        $fmt($row['freq'] ?? 0), $fmt($row['gap'] ?? 0), $fmt($row['overdue'] ?? 0)
    );
}
if (empty($lines)) {
    http_response_code(400);
    echo json_encode(['error' => 'ຂໍ້ມູນ top ບໍ່ຖືກຕ້ອງ']);
    exit();
}
$factSheet = implode("\n", $lines);

$systemPrompt = "ທ່ານແມ່ນນັກວິເຄາະສະຖິຕິຫວຍລາວ ມີໜ້າທີ່ອະທິບາຍຜົນການວິເຄາະທີ່ຄິດໄລ່ໄວ້ແລ້ວໃຫ້ຜູ້ໃຊ້ເຂົ້າໃຈງ່າຍ."
    . "\nຫ້າມແຕ່ງຕົວເລກ ຫຼື ຄະແນນຂຶ້ນມາເອງ — ໃຫ້ໃຊ້ສະເພາະຂໍ້ມູນທີ່ໃຫ້ມາເທົ່ານັ້ນ."
    . "\nຂຽນເປັນຄວາມຮຽງພາສາລາວ 1 ຫຍໍ້ໜ້າ (ປະມານ 100-160 ຄຳ) ອະທິບາຍວ່າເປັນຫຍັງເລກອັນດັບຕົ້ນໆຈຶ່ງໄດ້ຄະແນນສູງ"
    . " ໂດຍອ້າງອີງສັນຍານທີ່ເດັ່ນທີ່ສຸດຂອງແຕ່ລະເລກ (ເຊັ່ນ: ຄ້າງງວດ, momentum, ຄວາມຖີ່)."
    . "\nປິດທ້າຍດ້ວຍປະໂຫຍກເຕືອນສັ້ນໆວ່ານີ້ແມ່ນການວິເຄາະສະຖິຕິ ບໍ່ແມ່ນການຮັບປະກັນຜົນ."
    . "\nຕອບເປັນຂໍ້ຄວາມທຳມະດາ (plain text) ເທົ່ານັ້ນ ບໍ່ຕ້ອງມີ JSON, markdown, ຫົວຂໍ້, ຫຼື bullet list.";

$userMsg = "ງວດ #{$drawNum} ({$dateStr}) — ວິເຄາະຈາກ {$n} ງວດຫຼ້າສຸດ, ເລກ {$digitLen} ຕົວ\n\nອັນດັບຄະແນນ:\n{$factSheet}";

try {
    $explanation = callClaudeText($systemPrompt, [
        ['role' => 'user', 'content' => $userMsg],
    ], 500);
    echo json_encode(['explanation' => $explanation]);
} catch (Exception $e) {
    http_response_code(502);
    echo json_encode(['error' => $e->getMessage()]);
}
