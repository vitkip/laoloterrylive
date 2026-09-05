<?php
/**
 * puplatao-bets.php — ແທງເດີມພັນ (demo) ຕາມສູດ ຄູ່ລູກ ປູປາເຕົ້າ
 *   · ຄູ່ລູກ ງວດຖັດໄປ      → bet_kind = predict_pair (ຊະນະເມື່ອອອກທັງສອງລູກ)
 *   · ຄູ່ລູກ ທີ່ຄວນຫຼີກ     → bet_kind = avoid_pair   (ຊະນະເມື່ອບໍ່ອອກທັງສອງລູກ)
 *
 * ໃຊ້ເງິນ demo ຮ່ວມກະເປົາດຽວກັບ ຫວຍພັດທະນາ (betting.php) — ບໍ່ມີເງິນຈິງ.
 *
 * Routes (?r=):
 *   GET  ?r=config                 — ອັດຕາຈ່າຍ + ງວດຖັດໄປ (ບໍ່ຕ້ອງ login)
 *   GET  ?r=wallet                 — ຍອດເງິນ demo ຂອງຕົນ
 *   POST ?r=bets                   — ວາງເດີມພັນ
 *   GET  ?r=bets                   — ບິນຂອງຕົນ (?status= &kind= &limit= &offset=)
 *   GET  ?r=pl                     — ກຳໄລ-ຂາດທຶນສະສົມ (ສະຫຼຸບ + ເສັ້ນສະສົມ + ຕໍ່ຄູ່)
 *   POST ?r=settle                 — ຄິດຜົນບິນຄ້າງດ້ວຍມື (staff/admin)
 */

require_once __DIR__ . '/config.php';
require_once __DIR__ . '/lib/auth.php';
require_once __DIR__ . '/lib/puplatao_bets.php';

// ── CORS ──────────────────────────────────────────────────────────────
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
$allowedOrigin = in_array($origin, ALLOWED_ORIGINS, true) ? $origin : (ALLOWED_ORIGINS[0] ?? '*');
header("Access-Control-Allow-Origin: $allowedOrigin");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

if (PRODUCTION) {
    error_reporting(0);
    ini_set('display_errors', '0');
}

// ຕັດຂີ້ຝຸ່ນທົດນິຍົມ float ໃນ JSON (0.1389 ບໍ່ແມ່ນ 0.13889999999…)
ini_set('serialize_precision', '-1');

try {
    $pdo = new PDO(
        sprintf('mysql:host=%s;dbname=%s;charset=utf8mb4', DB_HOST, DB_NAME),
        DB_USER, DB_PASS,
        [
            PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES   => false,
        ]
    );
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Database connection failed']);
    exit();
}

function reply(int $code, mixed $data): void
{
    http_response_code($code);
    echo json_encode($data, JSON_UNESCAPED_UNICODE);
    exit();
}

/** ງວດຖັດໄປ = ງວດຫຼ້າສຸດ + 1 (ຄືກັບ puplatao.php) */
function puplatao_next_draw_no(PDO $pdo): int
{
    $max = (int)$pdo->query('SELECT IFNULL(MAX(draw_no), 0) FROM puplatao_draws')->fetchColumn();
    return $max > 0 ? $max + 1 : 36260001;
}

/**
 * 1 ງວດ ແທງໄດ້ຫຼາຍຄູ່ — ຈຳກັດພຽງຈຳນວນບິນສູງສຸດ ເພື່ອກັນການກົດຮົວ / ສົ່ງຊ້ຳ
 * ບໍ່ແມ່ນເພື່ອຫ້າມການແທງຫຼາຍຄູ່.
 */
const PUPLATAO_MAX_PENDING_PER_DRAW = 12;

$resource = trim($_GET['r'] ?? '', '/');
$method   = $_SERVER['REQUEST_METHOD'];

// ── GET /config — ບໍ່ຕ້ອງ login ເພື່ອໃຫ້ໜ້າສູດສະແດງອັດຕາຈ່າຍໄດ້ເລີຍ ──
if ($resource === 'config' && $method === 'GET') {
    $rates = puplatao_bet_rates($pdo);
    $last  = $pdo->query(
        'SELECT draw_no, draw_at FROM puplatao_draws ORDER BY draw_no DESC LIMIT 1'
    )->fetch();

    foreach ($rates as $k => $r) {
        // ອັດຕາຊະນະທີ່ຕ້ອງໄດ້ ຈຶ່ງຄຸ້ມທຶນ = 1 / ຕົວຄູນ
        $rates[$k]['breakeven_rate'] = $r['multiplier'] > 0 ? round(1 / $r['multiplier'], 4) : null;
    }

    reply(200, [
        'next_draw_no' => puplatao_next_draw_no($pdo),
        'last_draw'    => $last ? ['draw_no' => (int)$last['draw_no'], 'draw_at' => $last['draw_at']] : null,
        'rates'        => array_values($rates),
    ]);
}

// ── GET /wallet ──────────────────────────────────────────────────────
if ($resource === 'wallet' && $method === 'GET') {
    $payload = requireAuth();
    reply(200, ['balance' => puplatao_wallet_balance($pdo, (int)$payload['user_id'])]);
}

// ── POST /bets — ວາງເດີມພັນ ─────────────────────────────────────────
if ($resource === 'bets' && $method === 'POST') {
    $payload = requireAuth();
    $userId  = (int)$payload['user_id'];

    $body = json_decode(file_get_contents('php://input'), true);
    if (!is_array($body)) reply(400, ['error' => 'JSON body ບໍ່ຖືກຕ້ອງ']);

    $kind = trim((string)($body['bet_kind'] ?? ''));
    if (!in_array($kind, PUPLATAO_BET_KINDS, true)) {
        reply(422, ['error' => 'bet_kind ຕ້ອງເປັນ predict_pair ຫຼື avoid_pair']);
    }

    $a = filter_var($body['symbol_a'] ?? null, FILTER_VALIDATE_INT);
    $b = filter_var($body['symbol_b'] ?? null, FILTER_VALIDATE_INT);
    if ($a === false || $b === false || $a < 1 || $a > 6 || $b < 1 || $b > 6) {
        reply(422, ['error' => 'ລະຫັດລູກຕ້ອງຢູ່ລະຫວ່າງ 1–6']);
    }
    if ($a === $b) reply(422, ['error' => 'ຕ້ອງເລືອກ 2 ລູກທີ່ຕ່າງກັນ']);
    if ($a > $b) { [$a, $b] = [$b, $a]; }

    $stake = filter_var($body['stake'] ?? null, FILTER_VALIDATE_FLOAT);
    if ($stake === false || $stake <= 0) reply(422, ['error' => 'ຈຳນວນເງິນເດີມພັນຕ້ອງຫຼາຍກວ່າ 0']);
    $stake = round($stake, 2);

    $rank  = filter_var($body['rank'] ?? null, FILTER_VALIDATE_INT);
    // 1–15 = ອັນດັບຄູ່ທີ່ສູດແນະນຳ (ໜ້າສູດສະແດງ 3 ຄູ່, ໜ້າສະຖິຕິຈັດອັນດັບ 7 ຄູ່ ຕໍ່ບັດ)
    $rank  = ($rank !== false && $rank >= 1 && $rank <= 15) ? $rank : null;
    $score = filter_var($body['score'] ?? null, FILTER_VALIDATE_FLOAT);
    $prob  = filter_var($body['prob'] ?? null, FILTER_VALIDATE_FLOAT);
    $score = ($score !== false && $score >= 0 && $score <= 1) ? round($score, 4) : null;
    $prob  = ($prob  !== false && $prob  >= 0 && $prob  <= 1) ? round($prob, 4)  : null;

    $rates = puplatao_bet_rates($pdo);
    if (!isset($rates[$kind]) || !$rates[$kind]['is_active']) {
        reply(422, ['error' => 'ປະເພດການແທງນີ້ປິດຢູ່']);
    }
    $rate = $rates[$kind];
    if ($stake < $rate['min_stake']) {
        reply(422, ['error' => 'ຂັ້ນຕ່ຳ ' . number_format($rate['min_stake']) . ' ກີບ']);
    }
    if ($stake > $rate['max_stake']) {
        reply(422, ['error' => 'ສູງສຸດ ' . number_format($rate['max_stake']) . ' ກີບ']);
    }

    // ຄິດຜົນບິນເກົ່າກ່ອນ ເພື່ອໃຫ້ເລກງວດ ແລະ ຍອດເງິນ ເປັນປັດຈຸບັນ
    puplatao_settle_pending($pdo);

    // ງວດເປົ້າໝາຍ ຄິດຈາກ server ສະເໝີ — ບໍ່ເຊື່ອຄ່າຈາກ client
    $targetDrawNo = puplatao_next_draw_no($pdo);
    $expected = filter_var($body['expected_draw_no'] ?? null, FILTER_VALIDATE_INT);
    if ($expected && $expected !== $targetDrawNo) {
        reply(409, [
            'error'        => 'ມີຜົນງວດໃໝ່ເຂົ້າມາແລ້ວ — ກະລຸນາໂຫຼດໜ້ານີ້ໃໝ່',
            'next_draw_no' => $targetDrawNo,
        ]);
    }

    $multiplier = $rate['multiplier'];
    $potential  = round($stake * $multiplier, 2);

    $pdo->beginTransaction();
    try {
        $cnt = $pdo->prepare(
            'SELECT COUNT(*) FROM puplatao_bets
              WHERE user_id = :u AND target_draw_no = :n AND status = \'pending\''
        );
        $cnt->execute([':u' => $userId, ':n' => $targetDrawNo]);
        if ((int)$cnt->fetchColumn() >= PUPLATAO_MAX_PENDING_PER_DRAW) {
            throw new RuntimeException(
                'ງວດນີ້ວາງເດີມພັນຄົບ ' . PUPLATAO_MAX_PENDING_PER_DRAW . ' ບິນແລ້ວ'
            );
        }

        $ins = $pdo->prepare(
            'INSERT INTO puplatao_bets
               (user_id, bet_kind, target_draw_no, symbol_a, symbol_b, rank_at_bet,
                score_at_bet, prob_at_bet, stake, multiplier_snapshot, potential_payout)
             VALUES (:u, :k, :n, :a, :b, :rk, :sc, :pr, :st, :mu, :po)'
        );
        $ins->execute([
            ':u' => $userId, ':k' => $kind, ':n' => $targetDrawNo, ':a' => $a, ':b' => $b,
            ':rk' => $rank, ':sc' => $score, ':pr' => $prob,
            ':st' => $stake, ':mu' => $multiplier, ':po' => $potential,
        ]);
        $betId = (int)$pdo->lastInsertId();

        $kindLo    = $kind === 'avoid_pair' ? 'ຄູ່ຫຼີກ' : 'ຄູ່ແທງ';
        $note      = "ແທງ {$kindLo} ປູປາເຕົ້າ ງວດ {$targetDrawNo}";
        $newBalance = puplatao_wallet_apply($pdo, $userId, -$stake, 'bet_placed', $betId, $note, null);

        $pdo->commit();
        reply(201, [
            'success'          => true,
            'bet_id'           => $betId,
            'target_draw_no'   => $targetDrawNo,
            'multiplier'       => $multiplier,
            'potential_payout' => $potential,
            'new_balance'      => $newBalance,
        ]);
    } catch (Throwable $e) {
        if ($pdo->inTransaction()) $pdo->rollBack();
        error_log('[puplatao place_bet] ' . $e->getMessage());

        $msg = $e instanceof RuntimeException ? $e->getMessage() : 'ວາງເດີມພັນບໍ່ສຳເລັດ';
        reply(400, ['error' => $msg]);
    }
}

// ── GET /bets — ບິນຂອງຕົນ ────────────────────────────────────────────
if ($resource === 'bets' && $method === 'GET') {
    $payload = requireAuth();
    $userId  = (int)$payload['user_id'];

    puplatao_settle_pending($pdo);

    $status = trim((string)($_GET['status'] ?? ''));
    $kind   = trim((string)($_GET['kind'] ?? ''));
    $limit  = max(1, min(100, (int)($_GET['limit'] ?? 30)));
    $offset = max(0, (int)($_GET['offset'] ?? 0));

    $sql = 'SELECT b.bet_id, b.bet_kind, b.target_draw_no, b.symbol_a, b.symbol_b,
                   sa.name_lo AS name_a, sa.emoji AS emoji_a,
                   sb.name_lo AS name_b, sb.emoji AS emoji_b,
                   b.rank_at_bet, b.score_at_bet, b.prob_at_bet,
                   b.stake, b.multiplier_snapshot, b.potential_payout,
                   b.status, b.payout_amount, b.profit_loss, b.result_symbols,
                   b.created_at, b.settled_at, d.draw_at
              FROM puplatao_bets b
              JOIN puplatao_symbols sa ON sa.symbol_id = b.symbol_a
              JOIN puplatao_symbols sb ON sb.symbol_id = b.symbol_b
              LEFT JOIN puplatao_draws d ON d.draw_no = b.target_draw_no
             WHERE b.user_id = :u';
    $params = [':u' => $userId];

    if (in_array($status, ['pending', 'won', 'lost', 'void'], true)) {
        $sql .= ' AND b.status = :s';
        $params[':s'] = $status;
    }
    if (in_array($kind, PUPLATAO_BET_KINDS, true)) {
        $sql .= ' AND b.bet_kind = :k';
        $params[':k'] = $kind;
    }
    $sql .= ' ORDER BY b.bet_id DESC LIMIT :lim OFFSET :off';

    $stmt = $pdo->prepare($sql);
    foreach ($params as $k => $v) $stmt->bindValue($k, $v);
    $stmt->bindValue(':lim', $limit, PDO::PARAM_INT);
    $stmt->bindValue(':off', $offset, PDO::PARAM_INT);
    $stmt->execute();

    $rows = array_map(static function (array $r): array {
        foreach (['bet_id', 'target_draw_no', 'symbol_a', 'symbol_b'] as $k) $r[$k] = (int)$r[$k];
        $r['rank_at_bet'] = $r['rank_at_bet'] !== null ? (int)$r['rank_at_bet'] : null;
        foreach (['score_at_bet', 'prob_at_bet'] as $k) {
            $r[$k] = $r[$k] !== null ? (float)$r[$k] : null;
        }
        foreach (['stake', 'multiplier_snapshot', 'potential_payout'] as $k) $r[$k] = (float)$r[$k];
        foreach (['payout_amount', 'profit_loss'] as $k) {
            $r[$k] = $r[$k] !== null ? (float)$r[$k] : null;
        }
        $r['result'] = $r['result_symbols']
            ? array_map('intval', explode(',', $r['result_symbols']))
            : null;
        unset($r['result_symbols']);
        return $r;
    }, $stmt->fetchAll());

    $total = $pdo->prepare('SELECT COUNT(*) FROM puplatao_bets WHERE user_id = :u');
    $total->execute([':u' => $userId]);

    reply(200, ['bets' => $rows, 'total' => (int)$total->fetchColumn()]);
}

// ── GET /pl — ກຳໄລ-ຂາດທຶນສະສົມ ──────────────────────────────────────
if ($resource === 'pl' && $method === 'GET') {
    $payload = requireAuth();
    $userId  = (int)$payload['user_id'];

    puplatao_settle_pending($pdo);

    $rates = puplatao_bet_rates($pdo);

    // ສະຫຼຸບ ຕໍ່ສູດ
    $stmt = $pdo->prepare('SELECT * FROM puplatao_v_bet_pl WHERE user_id = :u');
    $stmt->execute([':u' => $userId]);
    $byKindRaw = [];
    foreach ($stmt->fetchAll() as $r) $byKindRaw[$r['bet_kind']] = $r;

    $byKind  = [];
    $overall = [
        'total_bets' => 0, 'pending_bets' => 0, 'settled_bets' => 0, 'won_bets' => 0,
        'lost_bets' => 0, 'void_bets' => 0, 'total_staked' => 0.0, 'settled_staked' => 0.0,
        'pending_staked' => 0.0, 'total_returned' => 0.0, 'net_pl' => 0.0,
    ];

    foreach (PUPLATAO_BET_KINDS as $kind) {
        $r = $byKindRaw[$kind] ?? null;
        $row = [
            'bet_kind'       => $kind,
            'label_lo'       => $rates[$kind]['label_lo']   ?? $kind,
            'multiplier'     => $rates[$kind]['multiplier']  ?? null,
            'fair_prob'      => $rates[$kind]['fair_prob']   ?? null,
            'breakeven_rate' => !empty($rates[$kind]['multiplier']) ? round(1 / $rates[$kind]['multiplier'], 4) : null,
            'total_bets'     => (int)($r['total_bets']   ?? 0),
            'pending_bets'   => (int)($r['pending_bets'] ?? 0),
            'settled_bets'   => (int)($r['settled_bets'] ?? 0),
            'won_bets'       => (int)($r['won_bets']     ?? 0),
            'lost_bets'      => (int)($r['lost_bets']    ?? 0),
            'void_bets'      => (int)($r['void_bets']    ?? 0),
            'total_staked'   => (float)($r['total_staked']   ?? 0),
            'settled_staked' => (float)($r['settled_staked'] ?? 0),
            'pending_staked' => (float)($r['pending_staked'] ?? 0),
            'total_returned' => (float)($r['total_returned'] ?? 0),
            'net_pl'         => (float)($r['net_pl'] ?? 0),
        ];
        $row['win_rate'] = $row['settled_bets'] > 0
            ? round($row['won_bets'] / $row['settled_bets'], 4) : null;
        $row['roi'] = $row['settled_staked'] > 0
            ? round($row['net_pl'] / $row['settled_staked'], 4) : null;

        foreach (array_keys($overall) as $k) $overall[$k] += $row[$k];
        $byKind[] = $row;
    }

    foreach (['total_staked', 'settled_staked', 'pending_staked', 'total_returned', 'net_pl'] as $k) {
        $overall[$k] = round($overall[$k], 2);
    }
    $overall['win_rate'] = $overall['settled_bets'] > 0
        ? round($overall['won_bets'] / $overall['settled_bets'], 4) : null;
    $overall['roi'] = $overall['settled_staked'] > 0
        ? round($overall['net_pl'] / $overall['settled_staked'], 4) : null;
    $overall['balance'] = puplatao_wallet_balance($pdo, $userId);

    // ເສັ້ນສະສົມ — ໄລ່ຈາກງວດເກົ່າ → ໃໝ່
    $stmt = $pdo->prepare(
        'SELECT target_draw_no, draw_at, bets, predict_bets, avoid_bets, won_bets,
                staked, returned, net_pl, predict_pl, avoid_pl
           FROM puplatao_v_bet_ledger
          WHERE user_id = :u
          ORDER BY target_draw_no ASC'
    );
    $stmt->execute([':u' => $userId]);

    $series = [];
    $cum = 0.0; $cumP = 0.0; $cumA = 0.0; $cumStake = 0.0;
    foreach ($stmt->fetchAll() as $r) {
        $cum      = round($cum  + (float)$r['net_pl'], 2);
        $cumP     = round($cumP + (float)$r['predict_pl'], 2);
        $cumA     = round($cumA + (float)$r['avoid_pl'], 2);
        $cumStake = round($cumStake + (float)$r['staked'], 2);
        $series[] = [
            'draw_no'      => (int)$r['target_draw_no'],
            'draw_at'      => $r['draw_at'],
            'bets'         => (int)$r['bets'],
            'predict_bets' => (int)$r['predict_bets'],
            'avoid_bets'   => (int)$r['avoid_bets'],
            'won_bets'     => (int)$r['won_bets'],
            'staked'       => (float)$r['staked'],
            'returned'     => (float)$r['returned'],
            'net_pl'       => (float)$r['net_pl'],
            'cum_pl'       => $cum,
            'cum_predict_pl' => $cumP,
            'cum_avoid_pl'   => $cumA,
            'cum_staked'     => $cumStake,
        ];
    }

    // ຄູ່ລູກ ໄດ້/ເສຍ ຫຼາຍສຸດ (ສະເພາະບິນຂອງຕົນ)
    $stmt = $pdo->prepare(
        'SELECT b.bet_kind, b.symbol_a, b.symbol_b,
                sa.name_lo AS name_a, sa.emoji AS emoji_a,
                sb.name_lo AS name_b, sb.emoji AS emoji_b,
                COUNT(*) AS total_bets, SUM(b.status = \'won\') AS won_bets,
                ROUND(SUM(b.stake), 2) AS total_staked,
                ROUND(SUM(IFNULL(b.profit_loss, 0)), 2) AS net_pl
           FROM puplatao_bets b
           JOIN puplatao_symbols sa ON sa.symbol_id = b.symbol_a
           JOIN puplatao_symbols sb ON sb.symbol_id = b.symbol_b
          WHERE b.user_id = :u AND b.status IN (\'won\',\'lost\')
          GROUP BY b.bet_kind, b.symbol_a, b.symbol_b, sa.name_lo, sa.emoji, sb.name_lo, sb.emoji
          ORDER BY net_pl DESC'
    );
    $stmt->execute([':u' => $userId]);
    $pairs = array_map(static function (array $r): array {
        foreach (['symbol_a', 'symbol_b', 'total_bets', 'won_bets'] as $k) $r[$k] = (int)$r[$k];
        foreach (['total_staked', 'net_pl'] as $k) $r[$k] = (float)$r[$k];
        return $r;
    }, $stmt->fetchAll());

    reply(200, [
        'overall'      => $overall,
        'by_kind'      => $byKind,
        'series'       => $series,
        'pairs'        => $pairs,
        'next_draw_no' => puplatao_next_draw_no($pdo),
    ]);
}

// ── POST /settle — ຄິດຜົນດ້ວຍມື (staff/admin) ───────────────────────
if ($resource === 'settle' && $method === 'POST') {
    $payload = requireAuth('staff');
    $summary = puplatao_settle_pending($pdo, (int)$payload['user_id']);
    reply(200, ['success' => true] + $summary);
}

reply(404, ['error' => "ບໍ່ພົບ resource '$resource'"]);
