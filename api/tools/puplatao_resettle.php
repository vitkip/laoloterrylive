<?php
/**
 * puplatao_resettle.php — ຄິດຜົນບິນ ປູປາເຕົ້າ ຄືນໃໝ່ ຕາມກົດປັດຈຸບັນ
 *
 * ໃຊ້ຫຼັງປ່ຽນເງື່ອນໄຂຊະນະ (avoid_pair ຊະນະເມື່ອອອກທັງສອງລູກ ຄືກັນກັບ predict_pair)
 * ເພື່ອແປງບິນທີ່ຄິດໄວ້ດ້ວຍກົດເກົ່າ ພ້ອມປັບຍອດກະເປົາ demo ໃຫ້ຖືກຕ້ອງ.
 *
 * CLI ເທົ່ານັ້ນ — ບໍ່ເປີດຜ່ານ browser.
 *
 *   ເບິ່ງກ່ອນ (ບໍ່ຂຽນຫຍັງ):  php api/tools/puplatao_resettle.php
 *   ລົງມືແກ້ຈິງ:              php api/tools/puplatao_resettle.php --apply
 *
 * ປອດໄພ: ແກ້ສະເພາະບິນທີ່ status ບໍ່ຕົງກັບ result_symbols ທີ່ບັນທຶກໄວ້ ·
 * ແລ່ນຊ້ຳໄດ້ (ຮອບທີສອງຈະບໍ່ພົບຫຍັງ) · ທຸກການປັບຍອດລົງ ledger ຄົບ.
 */

if (PHP_SAPI !== 'cli') {
    http_response_code(403);
    exit("CLI only\n");
}

require_once __DIR__ . '/../config.php';
require_once __DIR__ . '/../lib/puplatao_bets.php';

$apply = in_array('--apply', $argv, true);

$pdo = new PDO(
    'mysql:host=' . DB_HOST . ';dbname=' . DB_NAME . ';charset=utf8mb4',
    DB_USER,
    DB_PASS,
    [
        PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES   => false,
    ]
);

$names = [];
foreach ($pdo->query('SELECT symbol_id, name_lo FROM puplatao_symbols') as $r) {
    $names[(int)$r['symbol_id']] = $r['name_lo'];
}
$nm = fn(int $id): string => $names[$id] ?? ('#' . $id);

$rows = $pdo->query(
    "SELECT bet_id, user_id, bet_kind, target_draw_no, symbol_a, symbol_b,
            stake, potential_payout, payout_amount, profit_loss, status, result_symbols
       FROM puplatao_bets
      WHERE status IN ('won','lost') AND result_symbols IS NOT NULL
      ORDER BY bet_id"
)->fetchAll();

$fix = [];
foreach ($rows as $r) {
    $result   = array_map('intval', explode(',', $r['result_symbols']));
    $expected = puplatao_bet_is_win($r['bet_kind'], $result, (int)$r['symbol_a'], (int)$r['symbol_b'])
        ? 'won' : 'lost';
    if ($expected !== $r['status']) {
        $r['expected'] = $expected;
        $r['result']   = $result;
        $fix[] = $r;
    }
}

printf("ບິນທີ່ຄິດຜົນແລ້ວ: %d ບິນ · ຕ້ອງແກ້: %d ບິນ%s\n\n",
    count($rows), count($fix), $apply ? '' : '   [ເບິ່ງກ່ອນ — ຍັງບໍ່ໄດ້ຂຽນ]');

if (!$fix) {
    echo "ບໍ່ມີຫຍັງຕ້ອງແກ້ — ທຸກບິນຕົງກັບກົດປັດຈຸບັນແລ້ວ.\n";
    exit(0);
}

$netByUser = [];
foreach ($fix as $r) {
    $delta = $r['expected'] === 'won'
        ? round((float)$r['potential_payout'], 2)     // ຈ່າຍລາງວັນທີ່ຍັງບໍ່ໄດ້ຈ່າຍ
        : -round((float)$r['payout_amount'], 2);      // ດຶງລາງວັນທີ່ຈ່າຍເກີນຄືນ
    $r['delta'] = $delta;
    $netByUser[(int)$r['user_id']] = ($netByUser[(int)$r['user_id']] ?? 0) + $delta;

    printf("ບິນ #%-5d ງວດ %s · %s %s+%s · ຜົນ %s · %s → %s · ກະເປົາ %+.2f\n",
        $r['bet_id'], $r['target_draw_no'],
        $r['bet_kind'] === 'avoid_pair' ? 'ຄູ່ຫຼີກ' : 'ຄູ່ແທງ',
        $nm((int)$r['symbol_a']), $nm((int)$r['symbol_b']),
        implode(',', array_map($nm, $r['result'])),
        $r['status'], $r['expected'], $delta);
}

echo "\nຜົນລວມຕໍ່ຜູ້ໃຊ້:\n";
foreach ($netByUser as $uid => $net) {
    printf("  user %-5d %+.2f\n", $uid, $net);
}

if (!$apply) {
    echo "\nຕ້ອງການແກ້ຈິງ ໃຫ້ແລ່ນຄືນດ້ວຍ --apply\n";
    exit(0);
}

// ── ລົງມືແກ້ ─────────────────────────────────────────────────────
$upd = $pdo->prepare(
    'UPDATE puplatao_bets
        SET status = :s, payout_amount = :p, profit_loss = :pl, settled_at = NOW()
      WHERE bet_id = :id AND status = :old'
);

$done = 0;
$failed = 0;
foreach ($fix as $r) {
    $betId  = (int)$r['bet_id'];
    $stake  = (float)$r['stake'];
    $isWin  = $r['expected'] === 'won';
    $payout = $isWin ? round((float)$r['potential_payout'], 2) : 0.0;
    $delta  = $isWin ? $payout : -round((float)$r['payout_amount'], 2);

    $pdo->beginTransaction();
    try {
        $upd->execute([
            ':s'   => $r['expected'],
            ':p'   => $payout,
            ':pl'  => round($payout - $stake, 2),
            ':id'  => $betId,
            ':old' => $r['status'],
        ]);
        if ($upd->rowCount() !== 1) {
            throw new RuntimeException('ບິນຖືກແກ້ໄປແລ້ວໂດຍຄົນອື່ນ — ຂ້າມ');
        }

        if (abs($delta) > 0.004) {
            puplatao_wallet_apply(
                $pdo,
                (int)$r['user_id'],
                $delta,
                $isWin ? 'bet_won' : 'admin_adjustment',
                $betId,
                "ຄິດຜົນຄືນໃໝ່ ງວດ {$r['target_draw_no']} — {$r['status']} → {$r['expected']}",
                null
            );
        }

        $pdo->commit();
        $done++;
    } catch (Throwable $e) {
        if ($pdo->inTransaction()) $pdo->rollBack();
        $failed++;
        printf("!! ບິນ #%d ບໍ່ສຳເລັດ: %s\n", $betId, $e->getMessage());
    }
}

printf("\nແກ້ສຳເລັດ %d ບິນ · ບໍ່ສຳເລັດ %d ບິນ\n", $done, $failed);
