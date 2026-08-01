<?php
/**
 * ai-betting-insights.php — AI ວິເຄາະຮູບແບບການແທງສ່ວນຕົວ ດ້ວຍ Claude
 * GET /api/ai-betting-insights.php  (ຕ້ອງ login — ວິເຄາະສະເພາະ bets ຂອງຕົນເອງ)
 *
 * Pulls the logged-in user's own bet history, aggregates it in PHP
 * (deterministic — Claude never sees raw rows, only computed totals),
 * then asks Claude to narrate the pattern + a responsible-gambling note.
 */
require_once __DIR__ . '/config.php';
require_once __DIR__ . '/lib/auth.php';
require_once __DIR__ . '/lib/claude.php';

$origin = isset($_SERVER['HTTP_ORIGIN']) ? $_SERVER['HTTP_ORIGIN'] : '';
$allowedOrigin = in_array($origin, ALLOWED_ORIGINS, true) ? $origin : ALLOWED_ORIGINS[0];
header("Access-Control-Allow-Origin: " . $allowedOrigin);
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}
if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit();
}

$payload = requireAuth();
$userId  = (int) $payload['user_id'];

$conn = new mysqli(DB_HOST, DB_USER, DB_PASS, DB_NAME);
if ($conn->connect_error) {
    http_response_code(500);
    echo json_encode(["error" => "Database connection failed"]);
    exit();
}
$conn->set_charset("utf8mb4");

$stmt = $conn->prepare(
    "SELECT prize_type, chosen_number, stake, potential_payout, status, payout_amount, created_at
     FROM bets WHERE user_id = ? ORDER BY created_at DESC LIMIT 200"
);
$stmt->bind_param('i', $userId);
$stmt->execute();
$bets = $stmt->get_result()->fetch_all(MYSQLI_ASSOC);
$stmt->close();

if (empty($bets)) {
    http_response_code(400);
    echo json_encode(['error' => 'ຍັງບໍ່ມີປະຫວັດການແທງ']);
    exit();
}

// ── Deterministic aggregation (PHP, not AI) ─────────────────────────
$totalBets    = count($bets);
$totalStake   = 0.0;
$totalPayout  = 0.0;
$wonCount     = 0;
$lostCount    = 0;
$pendingCount = 0;
$numberFreq   = [];
$prizeTypeFreq = [];

foreach ($bets as $b) {
    $totalStake += (float) $b['stake'];
    $prizeTypeFreq[$b['prize_type']] = ($prizeTypeFreq[$b['prize_type']] ?? 0) + 1;
    $numberFreq[$b['chosen_number']] = ($numberFreq[$b['chosen_number']] ?? 0) + 1;
    if ($b['status'] === 'won') {
        $wonCount++;
        $totalPayout += (float) $b['payout_amount'];
    } elseif ($b['status'] === 'lost') {
        $lostCount++;
    } elseif ($b['status'] === 'pending') {
        $pendingCount++;
    }
}
arsort($numberFreq);
arsort($prizeTypeFreq);
$favoriteNumbers = array_slice(array_keys($numberFreq), 0, 5);
$topPrizeTypes   = array_slice(array_keys($prizeTypeFreq), 0, 3);
$settledCount    = $wonCount + $lostCount;
$winRate         = $settledCount > 0 ? round($wonCount / $settledCount * 100, 1) : 0;
$netResult       = round($totalPayout - $totalStake, 2);

$factSheet = sprintf(
    "ຈຳນວນບິນທັງໝົດ: %d (ຊະນະ %d, ແພ້ %d, ລໍຖ້າຜົນ %d)\n"
    . "ອັດຕາຊະນະ (ໃນບິນທີ່ຮູ້ຜົນແລ້ວ): %s%%\n"
    . "ຍອດແທງລວມ: %s ກີບ | ຍອດຮັບຄືນລວມ: %s ກີບ | ກຳໄລ/ຂາດທຶນສຸດທິ: %s ກີບ\n"
    . "ເລກທີ່ມັກແທງເລື້ອຍທີ່ສຸດ: %s\n"
    . "ປະເພດລາງວັນທີ່ແທງເລື້ອຍທີ່ສຸດ: %s",
    $totalBets, $wonCount, $lostCount, $pendingCount,
    $winRate,
    number_format($totalStake, 2), number_format($totalPayout, 2), number_format($netResult, 2),
    implode(', ', $favoriteNumbers),
    implode(', ', $topPrizeTypes)
);

$systemPrompt = "ທ່ານແມ່ນຜູ້ຊ່ວຍວິເຄາະພຶດຕິກຳການແທງຫວຍແບບຮັບຜິດຊອບ (responsible gambling)."
    . "\nຫ້າມແຕ່ງຕົວເລກ ຫຼື ຈຳນວນເງິນຂຶ້ນເອງ — ໃຊ້ສະເພາະຂໍ້ມູນທີ່ໃຫ້ມາ."
    . "\nຂຽນເປັນຄວາມຮຽງພາສາລາວ 1 ຫຍໍ້ໜ້າ (100-160 ຄຳ) ນ້ຳສຽງເປັນມິດ ບໍ່ຕັດສິນ, ສະຫຼຸບຮູບແບບການແທງຂອງຜູ້ໃຊ້"
    . " (ອັດຕາຊະນະ, ກຳໄລ/ຂາດທຶນ, ເລກທີ່ມັກແທງ)."
    . "\nຫ້າມແນະນຳວິທີ 'ຊະນະແນ່ນອນ' ຫຼືກະຕຸ້ນໃຫ້ແທງເພີ່ມ/ໄລ່ຄືນທຶນ (chasing losses)."
    . "\nຖ້າຂາດທຶນສຸດທິ ຫຼືແທງຖີ່ຫຼາຍ ໃຫ້ເຕືອນສະຕິເລື່ອງການຄຸ້ມຄອງງົບປະມານຢ່າງສຸພາບ."
    . "\nປິດທ້າຍດ້ວຍປະໂຫຍກເຕືອນສັ້ນໆວ່າຫວຍເປັນການສຸ່ມ ຄວນຫຼິ້ນຢ່າງມີສະຕິ ແລະ ບໍ່ເກີນຄວາມສາມາດ."
    . "\nຕອບເປັນຂໍ້ຄວາມທຳມະດາເທົ່ານັ້ນ ບໍ່ຕ້ອງມີ JSON, markdown, ຫົວຂໍ້, ຫຼື bullet list.";

try {
    $insight = callClaudeText($systemPrompt, [
        ['role' => 'user', 'content' => $factSheet],
    ], 450);
    echo json_encode([
        'insight' => $insight,
        'stats' => [
            'total_bets'    => $totalBets,
            'won'           => $wonCount,
            'lost'          => $lostCount,
            'pending'       => $pendingCount,
            'win_rate'      => $winRate,
            'total_stake'   => round($totalStake, 2),
            'total_payout'  => round($totalPayout, 2),
            'net_result'    => $netResult,
            'favorite_numbers' => $favoriteNumbers,
        ],
    ]);
} catch (Exception $e) {
    http_response_code(502);
    echo json_encode(['error' => $e->getMessage()]);
}
