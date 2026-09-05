<?php
/**
 * puplatao.php — REST API for ຫວຍ "ປູປາເຕົ້າມະຫາໂຊກ" (Hoo Hey How)
 *   6 symbols · 3 per draw · tables puplatao_*
 *
 * Routes (via ?r= query param):
 *   GET  ?r=symbols              — list all 6 symbols
 *   GET  ?r=draws                — list all draws (newest first) with 3 results
 *   POST ?r=draws                — add a draw  { draw_no, draw_at, pos1, pos2, pos3 }
 *   DELETE ?r=draws&draw_no={n}  — delete draw (results cascade)
 *   POST ?r=draws&action=delete  — delete draw  { draw_no }  (fallback for blocked DELETE verb)
 *   GET  ?r=stats/frequency      — total hit frequency per symbol
 *   GET  ?r=stats/by-position    — frequency split by position 1/2/3
 *   GET  ?r=stats/gap            — last-seen + draws-since (gap) per symbol
 *   GET  ?r=stats/pairs          — pair / triple counts per symbol + co-occurrence pairs
 *   GET  ?r=stats/daily          — draws per day
 *
 * ໝາຍເຫດ: ການແທງເດີມພັນ demo ຕາມສູດຄູ່ລູກ ຢູ່ໃນ puplatao-bets.php —
 *          ໄຟລ໌ນີ້ພຽງແຕ່ເອີ້ນ puplatao_settle_pending() ຫຼັງເພີ່ມຜົນງວດ.
 */

require_once __DIR__ . '/config.php';
require_once __DIR__ . '/lib/puplatao_bets.php';

// ── CORS ──────────────────────────────────────────────────────────────
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
$allowedOrigin = in_array($origin, ALLOWED_ORIGINS, true) ? $origin : (ALLOWED_ORIGINS[0] ?? '*');
header("Access-Control-Allow-Origin: $allowedOrigin");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: GET, POST, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

if (!PRODUCTION) {
    error_reporting(E_ALL);
    ini_set('display_errors', '0'); // keep errors in JSON, not raw HTML
}

// ── PDO connection ────────────────────────────────────────────────────
try {
    $dsn = sprintf('mysql:host=%s;dbname=%s;charset=utf8mb4', DB_HOST, DB_NAME);
    $pdo = new PDO($dsn, DB_USER, DB_PASS, [
        PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES   => false,
    ]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Database connection failed']);
    exit();
}

// ── Helpers ───────────────────────────────────────────────────────────
function respond(int $code, mixed $data): void {
    http_response_code($code);
    echo json_encode($data, JSON_UNESCAPED_UNICODE);
    exit();
}

function validateSymbol(mixed $v, string $field): int {
    $n = filter_var($v, FILTER_VALIDATE_INT);
    if ($n === false || $n < 1 || $n > 6) {
        respond(422, ['error' => "$field ຕ້ອງເປັນລະຫັດລູກ 1–6"]);
    }
    return (int)$n;
}

// ເລກງວດເລີ່ມຕົ້ນ ຖ້າຕາຕະລາງຍັງຫວ່າງ
const PUPLATAO_BASE_DRAW_NO = 36260001;

function nextDrawNo(PDO $pdo): int {
    $max = $pdo->query('SELECT MAX(draw_no) FROM puplatao_draws')->fetchColumn();
    return $max ? (int)$max + 1 : PUPLATAO_BASE_DRAW_NO;
}

// ── Router ────────────────────────────────────────────────────────────
$resource = trim($_GET['r'] ?? '', '/');
$method   = $_SERVER['REQUEST_METHOD'];

// ── GET /next ───────────────────────────────────────────────────────
// ເລກງວດຕໍ່ໄປ (ໃຊ້ pre-fill ຟອມ admin) = MAX(draw_no) + 1
if ($resource === 'next' && $method === 'GET') {
    respond(200, ['next_draw_no' => nextDrawNo($pdo)]);
}

// ── GET /symbols ─────────────────────────────────────────────────────
if ($resource === 'symbols' && $method === 'GET') {
    $stmt = $pdo->query('SELECT symbol_id, code, name_lo, emoji FROM puplatao_symbols ORDER BY symbol_id');
    $rows = $stmt->fetchAll();
    foreach ($rows as &$row) { $row['symbol_id'] = (int)$row['symbol_id']; }
    unset($row);
    respond(200, $rows);
}

// ── GET /draws ───────────────────────────────────────────────────────
if ($resource === 'draws' && $method === 'GET') {
    $draws = $pdo->query(
        'SELECT draw_no, draw_at, market, draw_date, draw_hour, created_at
           FROM puplatao_draws
          ORDER BY draw_no DESC'
    )->fetchAll();

    $res = $pdo->query(
        'SELECT r.draw_no, r.position, r.symbol_id, s.name_lo, s.emoji, s.code
           FROM puplatao_draw_results r
           JOIN puplatao_symbols s ON s.symbol_id = r.symbol_id'
    )->fetchAll();

    $byDraw = [];
    foreach ($res as $r) {
        $byDraw[$r['draw_no']][(int)$r['position']] = [
            'symbol_id' => (int)$r['symbol_id'],
            'code'      => $r['code'],
            'name_lo'   => $r['name_lo'],
            'emoji'     => $r['emoji'],
        ];
    }

    $out = [];
    foreach ($draws as $d) {
        $parts = $byDraw[$d['draw_no']] ?? [];
        $out[] = [
            'draw_no'    => (int)$d['draw_no'],
            'draw_at'    => $d['draw_at'],
            'market'     => $d['market'],
            'draw_date'  => $d['draw_date'],
            'draw_hour'  => $d['draw_hour'] !== null ? (int)$d['draw_hour'] : null,
            'created_at' => $d['created_at'],
            'pos1'       => $parts[1]['symbol_id'] ?? null,
            'pos2'       => $parts[2]['symbol_id'] ?? null,
            'pos3'       => $parts[3]['symbol_id'] ?? null,
            'results'    => [$parts[1] ?? null, $parts[2] ?? null, $parts[3] ?? null],
        ];
    }
    respond(200, $out);
}

// ── POST /draws&action=delete ───────────────────────────────────────
if ($resource === 'draws' && $method === 'POST' && ($_GET['action'] ?? '') === 'delete') {
    $body = json_decode(file_get_contents('php://input'), true);
    $drawNo = filter_var(is_array($body) ? ($body['draw_no'] ?? null) : null, FILTER_VALIDATE_INT);
    if (!$drawNo || $drawNo < 1) {
        respond(422, ['error' => 'draw_no ບໍ່ຖືກຕ້ອງ']);
    }
    $stmt = $pdo->prepare('DELETE FROM puplatao_draws WHERE draw_no = :n');
    $stmt->execute([':n' => $drawNo]);
    if ($stmt->rowCount() === 0) {
        respond(404, ['error' => 'ບໍ່ພົບງວດ ' . $drawNo]);
    }
    respond(200, ['message' => 'ລຶບສຳເລັດ']);
}

// ── POST /draws ─────────────────────────────────────────────────────
if ($resource === 'draws' && $method === 'POST') {
    $body = json_decode(file_get_contents('php://input'), true);
    if (!is_array($body)) {
        respond(400, ['error' => 'JSON body ບໍ່ຖືກຕ້ອງ']);
    }

    // draw_no ບໍ່ບັງຄັບ — ຖ້າບໍ່ສົ່ງມາ (ຫຼື = 0/auto) ໃຫ້ລັນອັດຕະໂນມັດ MAX+1
    $rawNo  = $body['draw_no'] ?? null;
    $autoNo = $rawNo === null || $rawNo === '' || $rawNo === 'auto';
    $drawNo = $autoNo ? nextDrawNo($pdo) : filter_var($rawNo, FILTER_VALIDATE_INT);
    if (!$drawNo || $drawNo < 1) {
        respond(422, ['error' => 'draw_no ຕ້ອງເປັນຕົວເລກ']);
    }

    $drawAt = trim($body['draw_at'] ?? '');
    if (!preg_match('/^(\d{4})-(\d{2})-(\d{2})[ T](\d{2}):(\d{2})(:\d{2})?$/', $drawAt, $m) ||
        !checkdate((int)$m[2], (int)$m[3], (int)$m[1]) ||
        (int)$m[4] > 23 || (int)$m[5] > 59) {
        respond(422, ['error' => 'draw_at ຕ້ອງເປັນຮູບແບບ YYYY-MM-DD HH:MM']);
    }
    $drawAt = sprintf('%s-%s-%s %s:%s:00', $m[1], $m[2], $m[3], $m[4], $m[5]);

    $pos1 = validateSymbol($body['pos1'] ?? null, 'pos1');
    $pos2 = validateSymbol($body['pos2'] ?? null, 'pos2');
    $pos3 = validateSymbol($body['pos3'] ?? null, 'pos3');

    // ລອງໃສ່ຂໍ້ມູນ — ຖ້າເປັນ auto ແລ້ວຊົນເລກງວດ (race) ໃຫ້ລອງເລກຖັດໄປອີກຄັ້ງ
    for ($attempt = 0; $attempt < ($autoNo ? 3 : 1); $attempt++) {
        try {
            $pdo->beginTransaction();
            $pdo->prepare('INSERT INTO puplatao_draws (draw_no, draw_at) VALUES (:n, :at)')
                ->execute([':n' => $drawNo, ':at' => $drawAt]);
            $ins = $pdo->prepare(
                'INSERT INTO puplatao_draw_results (draw_no, position, symbol_id) VALUES (:n, :p, :s)'
            );
            foreach ([1 => $pos1, 2 => $pos2, 3 => $pos3] as $p => $s) {
                $ins->execute([':n' => $drawNo, ':p' => $p, ':s' => $s]);
            }
            $pdo->commit();

            // ຜົນງວດເຂົ້າມາແລ້ວ → ຄິດຜົນບິນເດີມພັນທີ່ຄ້າງໄວ້ ແລະ ຈ່າຍເງິນ demo
            $settled = puplatao_settle_pending($pdo);

            respond(201, [
                'draw_no' => $drawNo,
                'message' => 'ເພີ່ມຜົນງວດສຳເລັດ',
                'bets_settled' => $settled,
            ]);
        } catch (PDOException $e) {
            if ($pdo->inTransaction()) { $pdo->rollBack(); }
            $dup = str_contains($e->getMessage(), 'Duplicate') || str_contains($e->getMessage(), '1062');
            if ($dup && $autoNo && $attempt < 2) {
                $drawNo = nextDrawNo($pdo);
                continue;
            }
            if ($dup) {
                respond(409, ['error' => 'ງວດ ' . $drawNo . ' ມີຢູ່ແລ້ວ']);
            }
            respond(500, ['error' => 'ບໍ່ສາມາດເພີ່ມຂໍ້ມູນໄດ້']);
        }
    }
}

// ── DELETE /draws?draw_no={n} ───────────────────────────────────────
if ($resource === 'draws' && $method === 'DELETE') {
    $drawNo = filter_var($_GET['draw_no'] ?? null, FILTER_VALIDATE_INT);
    if (!$drawNo || $drawNo < 1) {
        respond(422, ['error' => 'draw_no ບໍ່ຖືກຕ້ອງ']);
    }
    $stmt = $pdo->prepare('DELETE FROM puplatao_draws WHERE draw_no = :n');
    $stmt->execute([':n' => $drawNo]);
    if ($stmt->rowCount() === 0) {
        respond(404, ['error' => 'ບໍ່ພົບງວດ ' . $drawNo]);
    }
    respond(200, ['message' => 'ລຶບສຳເລັດ']);
}

// ── GET /stats/frequency ───────────────────────────────────────────
if ($resource === 'stats/frequency' && $method === 'GET') {
    $rows = $pdo->query(
        'SELECT symbol_id, name_lo, emoji, total_hits, pct_of_all, draws_appeared, pct_of_draws
           FROM puplatao_v_symbol_frequency
          ORDER BY total_hits DESC, symbol_id ASC'
    )->fetchAll();
    foreach ($rows as &$r) {
        $r['symbol_id']      = (int)$r['symbol_id'];
        $r['total_hits']     = (int)$r['total_hits'];
        $r['draws_appeared'] = (int)$r['draws_appeared'];
        $r['pct_of_all']     = $r['pct_of_all']   !== null ? round((float)$r['pct_of_all'], 2)   : 0.0;
        $r['pct_of_draws']   = $r['pct_of_draws'] !== null ? round((float)$r['pct_of_draws'], 2) : 0.0;
    }
    unset($r);
    respond(200, $rows);
}

// ── GET /stats/by-position ─────────────────────────────────────────
if ($resource === 'stats/by-position' && $method === 'GET') {
    $rows = $pdo->query(
        'SELECT symbol_id, name_lo, emoji, pos1, pos2, pos3, total
           FROM puplatao_v_symbol_by_position
          ORDER BY total DESC, symbol_id ASC'
    )->fetchAll();
    foreach ($rows as &$r) {
        foreach (['symbol_id', 'pos1', 'pos2', 'pos3', 'total'] as $k) {
            $r[$k] = (int)$r[$k];
        }
    }
    unset($r);
    respond(200, $rows);
}

// ── GET /stats/gap ─────────────────────────────────────────────────
if ($resource === 'stats/gap' && $method === 'GET') {
    $rows = $pdo->query(
        'SELECT symbol_id, name_lo, emoji, last_draw_no, last_seen_at, draws_since
           FROM puplatao_v_symbol_gap
          ORDER BY draws_since DESC, symbol_id ASC'
    )->fetchAll();
    foreach ($rows as &$r) {
        $r['symbol_id']    = (int)$r['symbol_id'];
        $r['last_draw_no'] = $r['last_draw_no'] !== null ? (int)$r['last_draw_no'] : null;
        $r['draws_since']  = (int)$r['draws_since'];
    }
    unset($r);
    respond(200, $rows);
}

// ── GET /stats/pairs ───────────────────────────────────────────────
if ($resource === 'stats/pairs' && $method === 'GET') {
    $perSymbol = $pdo->query(
        'SELECT symbol_id, name_lo, emoji, times_pair, times_triple
           FROM puplatao_v_pair_triple
          ORDER BY symbol_id ASC'
    )->fetchAll();
    foreach ($perSymbol as &$r) {
        $r['symbol_id']    = (int)$r['symbol_id'];
        $r['times_pair']   = (int)$r['times_pair'];
        $r['times_triple'] = (int)$r['times_triple'];
    }
    unset($r);

    $pairs = $pdo->query(
        'SELECT a.name_lo AS s1, b.name_lo AS s2,
                a.emoji AS e1, b.emoji AS e2,
                COUNT(*) AS times
           FROM puplatao_draw_results r1
           JOIN puplatao_draw_results r2
             ON r1.draw_no = r2.draw_no AND r1.symbol_id < r2.symbol_id
           JOIN puplatao_symbols a ON a.symbol_id = r1.symbol_id
           JOIN puplatao_symbols b ON b.symbol_id = r2.symbol_id
          GROUP BY a.symbol_id, b.symbol_id, a.name_lo, b.name_lo, a.emoji, b.emoji
          ORDER BY times DESC'
    )->fetchAll();
    foreach ($pairs as &$p) { $p['times'] = (int)$p['times']; }
    unset($p);

    respond(200, ['per_symbol' => $perSymbol, 'pairs' => $pairs]);
}

// ── GET /stats/daily ───────────────────────────────────────────────
if ($resource === 'stats/daily' && $method === 'GET') {
    $rows = $pdo->query(
        'SELECT draw_date, total_draws, first_draw, last_draw
           FROM puplatao_v_daily_summary
          ORDER BY draw_date DESC'
    )->fetchAll();
    foreach ($rows as &$r) { $r['total_draws'] = (int)$r['total_draws']; }
    unset($r);
    respond(200, $rows);
}

// ── 404 fallback ──────────────────────────────────────────────────────
respond(404, ['error' => "ບໍ່ພົບ resource '$resource'"]);
