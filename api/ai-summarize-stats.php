<?php
/**
 * ai-summarize-stats.php — AI ສະຫຼຸບສະຖິຕິເປັນພາສາທຳມະດາ ດ້ວຍ Claude
 * POST /api/ai-summarize-stats.php  (ຕ້ອງ login)
 * Body: { "context": "dashboard" | "history" | "h545stats" | "h545sets", "payload": {...pre-computed stats...} }
 *
 * Claude only narrates numbers we already computed client-side (analytics.js /
 * useStatistics.jsx / Happy545 pages) — it never invents frequencies or dates itself.
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

$body    = json_decode(file_get_contents('php://input'), true);
$context = trim((string) ($body['context'] ?? ''));
$payload = is_array($body['payload'] ?? null) ? $body['payload'] : [];

if (!in_array($context, ['dashboard', 'history', 'h545stats', 'h545sets'], true)) {
    http_response_code(400);
    echo json_encode(['error' => 'context ບໍ່ຖືກຕ້ອງ']);
    exit();
}

$numOnly = fn($s) => preg_replace('/[^0-9]/', '', (string) $s);
$intOnly = fn($v) => is_numeric($v) ? (int) $v : 0;

if ($context === 'dashboard') {
    $hot   = array_slice((array) ($payload['hot']   ?? []), 0, 4);
    $cold  = array_slice((array) ($payload['cold']  ?? []), 0, 3);
    $pairs = array_slice((array) ($payload['pairs'] ?? []), 0, 5);
    $rising = array_slice((array) ($payload['rising'] ?? []), 0, 4);
    $doubles = array_slice((array) ($payload['doubles'] ?? []), 0, 3);
    $totalDraws = $intOnly($payload['totalDraws'] ?? 0);
    $typeName   = trim((string) ($payload['typeName'] ?? 'ຫວຍລາວ'));
    $timeframeLabel = trim((string) ($payload['timeframeLabel'] ?? 'ທັງໝົດ'));

    $hotTxt  = implode(', ', array_map(fn($h) => $numOnly($h['number'] ?? '') . ' (' . $intOnly($h['count'] ?? 0) . ' ຄັ້ງ)', $hot));
    $coldTxt = implode(', ', array_map(fn($c) => $numOnly($c['number'] ?? '') . ' (ຄ້າງ ' . $intOnly($c['missedRounds'] ?? 0) . ' ງວດ)', $cold));
    $pairTxt = implode(', ', array_map(fn($p) => $numOnly($p['currentNum'] ?? '') . '→' . $numOnly($p['nextNum'] ?? '') . ' (' . $intOnly($p['count'] ?? 0) . ' ຄັ້ງ)', $pairs));
    $riseTxt = implode(', ', array_map(fn($r) => $numOnly($r['number'] ?? ''), $rising));
    $dblTxt  = implode(', ', array_map(fn($d) => $numOnly($d['number'] ?? '') . ' (' . $intOnly($d['count'] ?? 0) . ' ຄັ້ງ)', $doubles));

    if ($hotTxt === '' && $coldTxt === '') {
        http_response_code(400);
        echo json_encode(['error' => 'ຂໍ້ມູນສະຖິຕິບໍ່ພຽງພໍ']);
        exit();
    }

    $systemPrompt = "ທ່ານແມ່ນນັກວິເຄາະສະຖິຕິຫວຍລາວ. ຫ້າມແຕ່ງຕົວເລກ ຫຼື ຈຳນວນຂຶ້ນເອງ — ໃຊ້ສະເພາະຂໍ້ມູນທີ່ໃຫ້ມາ."
        . "\nຂຽນເປັນຄວາມຮຽງພາສາລາວ 1 ຫຍໍ້ໜ້າ (100-150 ຄຳ) ສະຫຼຸບພາບລວມສະຖິຕິແບບເຂົ້າໃຈງ່າຍ ບໍ່ໃຊ້ສັບເຕັກນິກ"
        . " ໂດຍກ່າວເຖິງເລກຮ້ອນ, ເລກຄ້າງ, ຄູ່ເລກທີ່ອອກຕໍ່ກັນເລື້ອຍ, ແລະ ແນວໂນ້ມ ຖ້າມີຂໍ້ມູນ."
        . "\nປິດທ້າຍດ້ວຍປະໂຫຍກເຕືອນສັ້ນໆວ່ານີ້ແມ່ນສະຖິຕິຍ້ອນຫຼັງ ບໍ່ແມ່ນການຮັບປະກັນຜົນ."
        . "\nຕອບເປັນຂໍ້ຄວາມທຳມະດາເທົ່ານັ້ນ ບໍ່ຕ້ອງມີ JSON, markdown, ຫົວຂໍ້, ຫຼື bullet list.";

    $userMsg = "ປະເພດ: {$typeName} | ຊ່ວງເວລາ: {$timeframeLabel} | ວິເຄາະຈາກ {$totalDraws} ງວດ\n"
        . "ເລກຮ້ອນ (ອອກຫຼາຍສຸດ): {$hotTxt}\n"
        . "ເລກຄ້າງ (ບໍ່ອອກດົນສຸດ): {$coldTxt}\n"
        . ($pairTxt !== '' ? "ຄູ່ເລກທີ່ອອກຕໍ່ກັນເລື້ອຍ: {$pairTxt}\n" : '')
        . ($riseTxt !== '' ? "ເລກກຳລັງມາແຮງ (momentum ບວກ): {$riseTxt}\n" : '')
        . ($dblTxt !== '' ? "ເລກໂຕນຄູ່ (00,11,...99) ທີ່ອອກຫຼາຍ: {$dblTxt}\n" : '');
} elseif ($context === 'h545stats') {
    $p5Hot  = array_slice((array) ($payload['p5Hot']  ?? []), 0, 5);
    $p5Cold = array_slice((array) ($payload['p5Cold'] ?? []), 0, 5);
    $p5Overdue = array_slice((array) ($payload['p5Overdue'] ?? []), 0, 5);
    $regHot = array_slice((array) ($payload['regHot'] ?? []), 0, 5);
    $totalDraws = $intOnly($payload['totalDraws'] ?? 0);

    $p5HotTxt  = implode(', ', array_map(fn($h) => $numOnly($h['number'] ?? '') . ' (' . $intOnly($h['count'] ?? 0) . ' ຄັ້ງ)', $p5Hot));
    $p5ColdTxt = implode(', ', array_map(fn($c) => $numOnly($c['number'] ?? ''), $p5Cold));
    $p5OverdueTxt = implode(', ', array_map(fn($o) => $numOnly($o['number'] ?? '') . ' (ຄ້າງ ' . $intOnly($o['gap'] ?? 0) . ' ວັນ)', $p5Overdue));
    $regHotTxt = implode(', ', array_map(fn($r) => $numOnly($r['number'] ?? '') . ' (' . $intOnly($r['count'] ?? 0) . ' ຄັ້ງ)', $regHot));

    if ($p5HotTxt === '' && $regHotTxt === '') {
        http_response_code(400);
        echo json_encode(['error' => 'ຂໍ້ມູນສະຖິຕິບໍ່ພຽງພໍ']);
        exit();
    }

    $systemPrompt = "ທ່ານແມ່ນນັກວິເຄາະສະຖິຕິຫວຍ Happy 545 (ຫວຍ 5 ຕຳແໜ່ງ P1-P5, ແຕ່ລະຕຳແໜ່ງມີເລກ 1-45)."
        . " ຕຳແໜ່ງ P5 ★ ແມ່ນຕົວທີ່ຄົນສ່ວນຫຼາຍສົນໃຈທີ່ສຸດ."
        . "\nຫ້າມແຕ່ງຕົວເລກຂຶ້ນເອງ — ໃຊ້ສະເພາະຂໍ້ມູນທີ່ໃຫ້ມາ."
        . "\nຂຽນເປັນຄວາມຮຽງພາສາລາວ 1 ຫຍໍ້ໜ້າ (100-150 ຄຳ) ສະຫຼຸບພາບລວມສະຖິຕິແບບເຂົ້າໃຈງ່າຍ"
        . " ໂດຍກ່າວເຖິງເລກ P5 ຮ້ອນ, ເລກ P5 ຄ້າງ/overdue, ແລະ ເລກ P1-P4 ທີ່ອອກຫຼາຍ."
        . "\nປິດທ້າຍດ້ວຍປະໂຫຍກເຕືອນສັ້ນໆວ່າແຕ່ລະງວດເປັນເອກະລາດ ບໍ່ແມ່ນການຮັບປະກັນຜົນ."
        . "\nຕອບເປັນຂໍ້ຄວາມທຳມະດາເທົ່ານັ້ນ ບໍ່ຕ້ອງມີ JSON, markdown, ຫົວຂໍ້, ຫຼື bullet list.";

    $userMsg = "Happy 545 — ວິເຄາະຈາກ {$totalDraws} ງວດ\n"
        . "ເລກ P5 ★ ຮ້ອນສຸດ: {$p5HotTxt}\n"
        . ($p5ColdTxt !== '' ? "ເລກ P5 ★ ເຢັນສຸດ: {$p5ColdTxt}\n" : '')
        . ($p5OverdueTxt !== '' ? "ເລກ P5 ★ ຄ້າງນານສຸດ: {$p5OverdueTxt}\n" : '')
        . ($regHotTxt !== '' ? "ເລກ P1-P4 ອອກຫຼາຍສຸດ: {$regHotTxt}\n" : '');
} elseif ($context === 'h545sets') {
    $sets = array_slice((array) ($payload['sets'] ?? []), 0, 5);
    $totalDraws = $intOnly($payload['totalDraws'] ?? 0);

    $setLines = [];
    foreach ($sets as $s) {
        $star = $numOnly($s['star'] ?? '');
        if ($star === '') continue;
        $pool = implode(',', array_map($numOnly, array_slice((array) ($s['pool'] ?? []), 0, 10)));
        $bt = (array) ($s['backtest'] ?? []);
        $setLines[] = sprintf(
            "ຊຸດທີ %s — P5★ %s, Pool P1-P4 [%s] | Backtest %s ງວດ: ອອກ P5★ ນີ້ %s ຄັ້ງ, ຖືກ≥1 ໂຕ %s ຄັ້ງ, ຖືກ≥2 ໂຕ %s ຄັ້ງ, ຖືກ≥3 ໂຕ %s ຄັ້ງ, ຖືກທັງ 4 ໂຕ %s ຄັ້ງ",
            $numOnly($s['rank'] ?? ''), $star, $pool,
            $intOnly($bt['btN'] ?? 0), $intOnly($bt['starHits'] ?? 0),
            $intOnly($bt['h4'] ?? 0), $intOnly($bt['h3'] ?? 0), $intOnly($bt['h2'] ?? 0), $intOnly($bt['h1'] ?? 0)
        );
    }
    if (empty($setLines)) {
        http_response_code(400);
        echo json_encode(['error' => 'ຂໍ້ມູນຊຸດເລກບໍ່ພຽງພໍ']);
        exit();
    }
    $setsTxt = implode("\n", $setLines);

    $systemPrompt = "ທ່ານແມ່ນນັກວິເຄາະຫວຍ Happy 545 ອະທິບາຍຊຸດເລກທີ່ລະບົບຄິດໄລ່ໄວ້ແລ້ວ (P5★ = ຕົວດາວ, Pool P1-P4 = ກຸ່ມ 10 ເລກໃຫ້ເລືອກ 4)."
        . "\nຫ້າມແຕ່ງຕົວເລກ ຫຼື ຈຳນວນຄັ້ງຂຶ້ນເອງ — ໃຊ້ສະເພາະຂໍ້ມູນທີ່ໃຫ້ມາ."
        . "\nຂຽນເປັນຄວາມຮຽງພາສາລາວ 1 ຫຍໍ້ໜ້າ (100-160 ຄຳ) ອະທິບາຍວ່າຊຸດອັນດັບຕົ້ນໆເປັນແນວໃດ"
        . " ໂດຍອ້າງອີງຜົນ backtest (ອັດຕາຖືກ) ຂອງແຕ່ລະຊຸດ."
        . "\nປິດທ້າຍດ້ວຍປະໂຫຍກເຕືອນສັ້ນໆວ່າ backtest ອີງອະດີດເທົ່ານັ້ນ ບໍ່ຮັບປະກັນຜົນອະນາຄົດ."
        . "\nຕອບເປັນຂໍ້ຄວາມທຳມະດາເທົ່ານັ້ນ ບໍ່ຕ້ອງມີ JSON, markdown, ຫົວຂໍ້, ຫຼື bullet list.";

    $userMsg = "Happy 545 — ຄິດໄລ່ຈາກ {$totalDraws} ງວດ, backtest ຫຼ້າສຸດ 100 ງວດ\n\n{$setsTxt}";
} else {
    // context === 'history'
    $recent = array_slice((array) ($payload['recentDraws'] ?? []), 0, 12);
    $total     = $intOnly($payload['total'] ?? 0);
    $latestNum = trim((string) ($payload['latestNum'] ?? ''));
    $firstYear = trim((string) ($payload['firstYear'] ?? ''));
    $latestYear = trim((string) ($payload['latestYear'] ?? ''));

    $recentTxt = implode("; ", array_map(function ($d) use ($numOnly) {
        $date = preg_replace('/[^0-9\-]/', '', (string) ($d['date'] ?? ''));
        $num  = $numOnly($d['drawNumber'] ?? '');
        $res  = $numOnly($d['result'] ?? '');
        return "ງວດ#{$num} {$date}: {$res}";
    }, $recent));

    if ($recentTxt === '') {
        http_response_code(400);
        echo json_encode(['error' => 'ຂໍ້ມູນປະຫວັດບໍ່ພຽງພໍ']);
        exit();
    }

    $systemPrompt = "ທ່ານແມ່ນນັກວິເຄາະສະຖິຕິຫວຍລາວ. ຫ້າມແຕ່ງຕົວເລກຂຶ້ນເອງ — ໃຊ້ສະເພາະຂໍ້ມູນທີ່ໃຫ້ມາ."
        . "\nຂຽນເປັນຄວາມຮຽງພາສາລາວ 1 ຫຍໍ້ໜ້າ (80-130 ຄຳ) ສະຫຼຸບຮູບແບບ/ແນວໂນ້ມຂອງຜົນຫວຍງວດຫຼ້າສຸດທີ່ໃຫ້ມາ"
        . " ເຊັ່ນ ເລກທ້າຍຊ້ຳ, ເລກຄູ່/ຄີກ, ຫຼືຮູບແບບອື່ນທີ່ສັງເກດເຫັນ."
        . "\nປິດທ້າຍດ້ວຍປະໂຫຍກເຕືອນສັ້ນໆວ່າຫວຍລາວເປັນການສຸ່ມ ຂໍ້ມູນນີ້ເປັນພຽງການສັງເກດຍ້ອນຫຼັງ."
        . "\nຕອບເປັນຂໍ້ຄວາມທຳມະດາເທົ່ານັ້ນ ບໍ່ຕ້ອງມີ JSON, markdown, ຫົວຂໍ້, ຫຼື bullet list.";

    $recentCount = count($recent);
    $userMsg = "ຂໍ້ມູນທັງໝົດ {$total} ງວດ (ປີ {$firstYear}-{$latestYear}), ງວດຫຼ້າສຸດ #{$latestNum}\n"
        . "ຜົນ {$recentCount} ງວດຫຼ້າສຸດ:\n{$recentTxt}";
}

try {
    $summary = callClaudeText($systemPrompt, [
        ['role' => 'user', 'content' => $userMsg],
    ], 450);
    echo json_encode(['summary' => $summary]);
} catch (Exception $e) {
    http_response_code(502);
    echo json_encode(['error' => $e->getMessage()]);
}
