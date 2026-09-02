<?php
/**
 * ai-summarize-stats.php — AI ສະຫຼຸບສະຖິຕິເປັນພາສາທຳມະດາ ດ້ວຍ Claude
 * POST /api/ai-summarize-stats.php  (ຕ້ອງ login)
 * Body: { "context": "dashboard" | "history" | "h545stats" | "h545sets" | "puplatao" | "puplataopredict", "payload": {...pre-computed stats...} }
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

if (!in_array($context, ['dashboard', 'history', 'h545stats', 'h545sets', 'puplatao', 'puplataopredict', 'puplataobehavior'], true)) {
    http_response_code(400);
    echo json_encode(['error' => 'context ບໍ່ຖືກຕ້ອງ']);
    exit();
}

$numOnly = fn($s) => preg_replace('/[^0-9]/', '', (string) $s);
$intOnly = fn($v) => is_numeric($v) ? (int) $v : 0;

// ຄ່າ default ຂອງ Claude call — ແຕ່ລະ context override ໄດ້
$maxTokens = 450;
$model     = 'claude-haiku-4-5';

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
} elseif ($context === 'puplatao') {
    $clean = fn($s) => trim(preg_replace('/[\x00-\x1F<>]/u', '', (string) $s));

    $totalDraws = $intOnly($payload['totalDraws'] ?? 0);
    $freq       = array_slice((array) ($payload['frequency'] ?? []), 0, 6);
    $gap        = array_slice((array) ($payload['gap'] ?? []), 0, 6);
    $byPos      = array_slice((array) ($payload['byPosition'] ?? []), 0, 6);
    $pairs      = array_slice((array) ($payload['pairs'] ?? []), 0, 5);
    $pairTriple = array_slice((array) ($payload['pairTriple'] ?? []), 0, 6);

    $freqTxt = implode(', ', array_map(
        fn($f) => $clean($f['name_lo'] ?? '') . ' (' . $intOnly($f['total_hits'] ?? 0) . ' ຄັ້ງ, ' . $clean($f['pct_of_all'] ?? 0) . '%)',
        $freq
    ));
    $gapTxt = implode(', ', array_map(
        fn($g) => $clean($g['name_lo'] ?? '') . ' (ຄ້າງ ' . $intOnly($g['draws_since'] ?? 0) . ' ງວດ)',
        $gap
    ));
    $posTxt = implode('; ', array_map(
        fn($p) => $clean($p['name_lo'] ?? '') . ' → ໜ່ວຍ1:' . $intOnly($p['pos1'] ?? 0) . ' ໜ່ວຍ2:' . $intOnly($p['pos2'] ?? 0) . ' ໜ່ວຍ3:' . $intOnly($p['pos3'] ?? 0),
        $byPos
    ));
    $pairTxt = implode(', ', array_map(
        fn($p) => $clean($p['s1'] ?? '') . '+' . $clean($p['s2'] ?? '') . ' (' . $intOnly($p['times'] ?? 0) . ' ຄັ້ງ)',
        $pairs
    ));
    $ptTxt = implode(', ', array_map(
        fn($p) => $clean($p['name_lo'] ?? '') . ' (ຄູ່ ' . $intOnly($p['times_pair'] ?? 0) . '×, ຕອງ ' . $intOnly($p['times_triple'] ?? 0) . '×)',
        $pairTriple
    ));

    if ($freqTxt === '') {
        http_response_code(400);
        echo json_encode(['error' => 'ຂໍ້ມູນສະຖິຕິບໍ່ພຽງພໍ']);
        exit();
    }

    $systemPrompt = "ທ່ານແມ່ນນັກວິເຄາະສະຖິຕິຫວຍປູປາເຕົ້າມະຫາໂຊກ (Hoo Hey How) ທີ່ມີລູກ 6 ໜ່ວຍ: ນ້ຳເຕົ້າ, ປູ, ປາ, ກຸ້ງ, ໄກ່, ເສືອ — ແຕ່ລະງວດອອກ 3 ໜ່ວຍ."
        . "\nຫ້າມແຕ່ງລູກ ຫຼື ຈຳນວນຄັ້ງຂຶ້ນເອງ — ໃຊ້ສະເພາະຂໍ້ມູນທີ່ໃຫ້ມາ."
        . "\nຂຽນເປັນຄວາມຮຽງພາສາລາວ 1 ຫຍໍ້ໜ້າ (100-150 ຄຳ) ສະຫຼຸບພາບລວມສະຖິຕິແບບເຂົ້າໃຈງ່າຍ ບໍ່ໃຊ້ສັບເຕັກນິກ"
        . " ໂດຍກ່າວເຖິງລູກທີ່ອອກຫຼາຍ, ລູກທີ່ຄ້າງນານ, ລູກທີ່ມັກອອກຄູ່ນຳກັນ, ແລະ ຂໍ້ສັງເກດເລື່ອງຕຳແໜ່ງ ຖ້າມີ."
        . "\nປິດທ້າຍດ້ວຍປະໂຫຍກເຕືອນສັ້ນໆວ່ານີ້ແມ່ນສະຖິຕິຍ້ອນຫຼັງ ແຕ່ລະງວດເປັນເອກະລາດ ບໍ່ແມ່ນການຮັບປະກັນຜົນ."
        . "\nຕອບເປັນຂໍ້ຄວາມທຳມະດາເທົ່ານັ້ນ ບໍ່ຕ້ອງມີ JSON, markdown, ຫົວຂໍ້, ຫຼື bullet list.";

    $userMsg = "ຫວຍປູປາເຕົ້າ — ວິເຄາະຈາກ {$totalDraws} ງວດ\n"
        . "ຄວາມຖີ່ລູກ (ອອກຫຼາຍ→ໜ້ອຍ): {$freqTxt}\n"
        . ($gapTxt !== '' ? "ລູກຄ້າງ (ບໍ່ອອກດົນສຸດ): {$gapTxt}\n" : '')
        . ($posTxt !== '' ? "ແຍກຕາມຕຳແໜ່ງ: {$posTxt}\n" : '')
        . ($pairTxt !== '' ? "ຄູ່ລູກທີ່ອອກພ້ອມກັນເລື້ອຍ: {$pairTxt}\n" : '')
        . ($ptTxt !== '' ? "ນັບ ຄູ່/ຕອງ ຕໍ່ລູກ: {$ptTxt}\n" : '');
} elseif ($context === 'puplataopredict') {
    $clean = fn($s) => trim(preg_replace('/[\x00-\x1F<>]/u', '', (string) $s));

    $totalDraws = $intOnly($payload['totalDraws'] ?? 0);
    $btN        = $intOnly($payload['backtestN'] ?? 0);
    $pairs      = array_slice((array) ($payload['pairs'] ?? []), 0, 3);
    $ranked     = array_slice((array) ($payload['symbolRanked'] ?? []), 0, 6);

    $pairLines = [];
    foreach ($pairs as $p) {
        $a = $clean($p['a'] ?? '');
        $b = $clean($p['b'] ?? '');
        if ($a === '' || $b === '') continue;
        $third = $clean($p['third'] ?? '');
        $bt = (array) ($p['backtest'] ?? []);
        $pairLines[] = sprintf(
            "ຄູ່ທີ %s: %s + %s (ລູກທີ 3 ແນະນຳ: %s) — ຄະແນນ %s%% | ຍ້ອນຫຼັງ %s ງວດ: ອອກພ້ອມກັນ %s ຄັ້ງ (%s%%), ອອກຢ່າງໜ້ອຍ 1 ໜ່ວຍ %s ຄັ້ງ (%s%%)",
            $intOnly($p['rank'] ?? 0), $a, $b, $third,
            $intOnly($p['scorePct'] ?? 0), $intOnly($bt['n'] ?? 0),
            $intOnly($bt['both'] ?? 0), $intOnly($bt['pctBoth'] ?? 0),
            $intOnly($bt['either'] ?? 0), $intOnly($bt['pctEither'] ?? 0)
        );
    }
    if (empty($pairLines)) {
        http_response_code(400);
        echo json_encode(['error' => 'ຂໍ້ມູນຄູ່ລູກບໍ່ພຽງພໍ']);
        exit();
    }
    $rankTxt = implode(', ', array_map(
        fn($r) => $clean($r['name'] ?? '') . ' (' . $intOnly($r['scorePct'] ?? 0) . '%)',
        $ranked
    ));

    // ── ໂມເດລເສີມ: hazard / Monte-Carlo / Brier (ຖ້າ frontend ສົ່ງມາ) ──
    $hazard = is_array($payload['hazard'] ?? null) ? $payload['hazard'] : [];
    $brier  = is_array($payload['brier'] ?? null) ? $payload['brier'] : [];
    $mc     = is_array($payload['monteCarlo'] ?? null) ? $payload['monteCarlo'] : [];
    $extraLines = [];
    if (array_key_exists('informative', $hazard)) {
        $extraLines[] = $hazard['informative']
            ? 'ໂມເດລ gap/hazard: ລູກຄ້າງມີສັນຍານ (χ²=' . $intOnly($hazard['chi2'] ?? 0) . ', df ' . $intOnly($hazard['df'] ?? 0) . ') — ລູກຄ້າງໄດ້ນ້ຳໜັກເພີ່ມ'
            : 'ໂມເດລ gap/hazard: ລູກຄ້າງບໍ່ມີສັນຍານ — ບໍ່ໄດ້ເພີ່ມໂອກາດ';
    }
    if (!empty($mc['topPairs'])) {
        $mcTxt = implode(', ', array_map(
            fn($p) => $clean($p['a'] ?? '') . '+' . $clean($p['b'] ?? '') . ' (' . $intOnly($p['pct'] ?? 0) . '%)',
            array_slice((array) $mc['topPairs'], 0, 3)
        ));
        $extraLines[] = 'Monte-Carlo ' . $intOnly($mc['iters'] ?? 0) . ' ຮອບ, ຄູ່ເດັ່ນ: ' . $mcTxt;
    }
    if (isset($brier['skillPct'])) {
        $extraLines[] = 'ຄວາມແມ່ນຍຳ backtest (Brier skill): ' . $intOnly($brier['skillPct']) . '% (ບວກ = ດີກວ່າການເດົາ)';
    }
    $extraTxt = $extraLines ? "\n" . implode("\n", $extraLines) : '';

    $systemPrompt = "ທ່ານແມ່ນນັກວິເຄາະຫວຍປູປາເຕົ້າມະຫາໂຊກ (6 ລູກ: ນ້ຳເຕົ້າ, ປູ, ປາ, ກຸ້ງ, ໄກ່, ເສືອ; ອອກ 3 ໜ່ວຍ/ງວດ) ອະທິບາຍ 3 ຄູ່ລູກທີ່ລະບົບຄິດໄລ່ໄວ້ວ່າໜ້າຈະອອກໃນງວດຖັດໄປ."
        . "\nສູດຄິດຈາກ: ຄວາມຖີ່ 20 ງວດຫຼ້າສຸດ (ປັບ Bayesian) + ລູກຄ້າງ/hazard (overdue) + ຄວາມຖີ່ອອກຄູ່ນຳກັນ (co-occurrence); ມີ Monte-Carlo ແລະ Brier calibration ປະກອບ."
        . "\nຖ້າມີຂໍ້ມູນ hazard, Monte-Carlo ຫຼື Brier ໃຫ້ກ່າວເຖິງສັ້ນໆ ວ່າມັນໜູນ ຫຼື ຄ້ານ ກັບ 3 ຄູ່ນັ້ນ."
        . "\nຫ້າມແຕ່ງລູກ ຫຼື ຈຳນວນຄັ້ງຂຶ້ນເອງ — ໃຊ້ສະເພາະຂໍ້ມູນທີ່ໃຫ້ມາ."
        . "\nຂຽນເປັນຄວາມຮຽງພາສາລາວ 1 ຫຍໍ້ໜ້າ (110-160 ຄຳ) ອະທິບາຍວ່າແຕ່ລະຄູ່ເດັ່ນຍ້ອນຫຍັງ ໂດຍອ້າງອີງຜົນ backtest (ອັດຕາອອກພ້ອມກັນ) ຂອງແຕ່ລະຄູ່."
        . "\nປິດທ້າຍດ້ວຍປະໂຫຍກເຕືອນສັ້ນໆວ່າແຕ່ລະງວດເປັນເອກະລາດ backtest ອີງອະດີດເທົ່ານັ້ນ ບໍ່ຮັບປະກັນຜົນອະນາຄົດ."
        . "\nຕອບເປັນຂໍ້ຄວາມທຳມະດາເທົ່ານັ້ນ ບໍ່ຕ້ອງມີ JSON, markdown, ຫົວຂໍ້, ຫຼື bullet list.";

    $userMsg = "ຫວຍປູປາເຕົ້າ — ຄິດໄລ່ຈາກ {$totalDraws} ງວດ, backtest ຫຼ້າສຸດ {$btN} ງວດ\n"
        . "ອັນດັບຄວາມແຮງຂອງລູກ (ຄະແນນລວມ): {$rankTxt}\n\n"
        . implode("\n", $pairLines)
        . $extraTxt;
} elseif ($context === 'puplataobehavior') {
    // AI ອ່ານ "ລຳດັບຜົນອອກຈິງ" ແລ້ວວິເຄາະພຶດຕິກຳດ້ວຍຕົນເອງ — ບໍ່ສົ່ງສະຖິຕິຄິດໄວ້ໃຫ້
    $clean = fn($s) => trim(preg_replace('/[\x00-\x1F<>]/u', '', (string) $s));

    $totalDraws = $intOnly($payload['totalDraws'] ?? 0);
    $syms = array_slice((array) ($payload['symbols'] ?? []), 0, 6);
    $rows = array_slice((array) ($payload['recentDraws'] ?? []), 0, 60);

    $symMap = [];
    foreach ($syms as $s) {
        $sid = $intOnly($s['id'] ?? 0);
        if ($sid) {
            $symMap[$sid] = $clean(($s['emoji'] ?? '') . ($s['name_lo'] ?? ''));
        }
    }
    $legend = implode(', ', array_map(
        fn($s) => $clean(($s['emoji'] ?? '') . ' ' . ($s['name_lo'] ?? '')),
        $syms
    ));

    $lines = [];
    foreach ($rows as $d) {
        $trip = array_map(
            fn($x) => $symMap[$intOnly($x)] ?? '?',
            array_slice((array) ($d['s'] ?? []), 0, 3)
        );
        if (count($trip) < 3 || in_array('?', $trip, true)) {
            continue;
        }
        $when = $clean($d['at'] ?? '');
        $dow  = $clean($d['dow'] ?? '');
        $lines[] = 'ງວດ ' . $intOnly($d['n'] ?? 0)
            . ($when !== '' ? ' (' . $when . ($dow !== '' ? ' ' . $dow : '') . ')' : '')
            . ': ' . implode('  ', $trip);
    }
    if (count($lines) < 8) {
        http_response_code(400);
        echo json_encode(['error' => 'ຂໍ້ມູນປະຫວັດບໍ່ພຽງພໍ (ຕ້ອງມີຢ່າງໜ້ອຍ 8 ງວດ)']);
        exit();
    }
    $shown  = count($lines);
    $seqTxt = implode("\n", $lines);

    $systemPrompt = "ທ່ານແມ່ນນັກວິເຄາະຫວຍປູປາເຕົ້າມະຫາໂຊກ (6 ລູກ: ນ້ຳເຕົ້າ, ປູ, ປາ, ກຸ້ງ, ໄກ່, ເສືອ; ແຕ່ລະງວດອອກ 3 ໜ່ວຍ ຕາມລຳດັບ ໜ່ວຍ1 ໜ່ວຍ2 ໜ່ວຍ3)."
        . "\nຂ້າງລຸ່ມນີ້ແມ່ນລຳດັບຜົນອອກຈິງ (ໃໝ່→ເກົ່າ). ບໍ່ມີສະຖິຕິຄິດໄວ້ໃຫ້ — ໃຫ້ທ່ານ 'ອ່ານ ແລະ ວິເຄາະດ້ວຍຕົນເອງ'."
        . "\nຈົ່ງເບິ່ງພຶດຕິກຳການອອກ ເຊັ່ນ: ລູກທີ່ອອກຕິດຕໍ່ຫຼາຍງວດ (streak) ຫຼື ຫາຍໄປເປັນຊ່ວງ, ການສະຫຼັບໄປມາ, ການຈັບກຸ່ມກັນ, ຄູ່ລູກທີ່ມັກມາພ້ອມກັນ, ຄວາມແຕກຕ່າງລະຫວ່າງ ໜ່ວຍ 1/2/3, ແລະ ຮູບແບບຕາມເວລາ/ວັນ ຖ້າພໍສັງເກດເຫັນ."
        . "\nຫ້າມແຕ່ງເລກງວດ, ວັນທີ ຫຼື ລູກ ທີ່ບໍ່ມີໃນລາຍການ. ຖ້າບໍ່ພົບຮູບແບບຊັດເຈນ ໃຫ້ບອກກົງໆວ່າ 'ເບິ່ງຄ້າຍການສຸ່ມ ບໍ່ມີຮູບແບບເດັ່ນ'."
        . "\nຂຽນເປັນພາສາລາວ 2 ຫຍໍ້ໜ້າ (ລວມ 130-200 ຄຳ): ຫຍໍ້ໜ້າ 1 = ພຶດຕິກຳ/ຮູບແບບ ທີ່ສັງເກດເຫັນຈາກລຳດັບ; ຫຍໍ້ໜ້າ 2 = ຄວາມເຫັນສ່ວນຕົວຕໍ່ແນວໂນ້ມງວດຖັດໄປ (ລູກ ຫຼື ຄູ່ ທີ່ໜ້າຈັບຕາ) ພ້ອມບອກລະດັບຄວາມໝັ້ນໃຈ (ຕ່ຳ/ກາງ/ສູງ)."
        . "\nປິດທ້າຍດ້ວຍປະໂຫຍກເຕືອນສັ້ນໆວ່າ ແຕ່ລະງວດເປັນເອກະລາດ ເປັນການສຸ່ມ ການວິເຄາະນີ້ບໍ່ຮັບປະກັນຜົນ."
        . "\nຕອບເປັນຂໍ້ຄວາມທຳມະດາເທົ່ານັ້ນ ບໍ່ຕ້ອງມີ JSON, markdown, ຫົວຂໍ້, ຫຼື bullet list.";

    $userMsg = "ລູກທັງ 6: {$legend}\n"
        . "ຂໍ້ມູນທັງໝົດ {$totalDraws} ງວດ · ສະແດງ {$shown} ງວດຫຼ້າສຸດ (ໃໝ່→ເກົ່າ):\n\n"
        . $seqTxt;

    $maxTokens = 900;
    // ໃຊ້ໂມເດລ default (haiku 4.5). ຢາກໃຫ້ວິເຄາະເລິກຂຶ້ນ ປ່ຽນເປັນ 'claude-sonnet-5' ຫຼື 'claude-opus-5'.
    $model = 'claude-haiku-4-5';
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
    ], $maxTokens, $model);
    echo json_encode(['summary' => $summary]);
} catch (Exception $e) {
    http_response_code(502);
    echo json_encode(['error' => $e->getMessage()]);
}
