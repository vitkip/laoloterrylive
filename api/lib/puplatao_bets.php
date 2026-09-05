<?php
/**
 * lib/puplatao_bets.php — ຕົວຄິດໄລ່ຜົນ + ກະເປົາເງິນ demo ຂອງການແທງ ປູປາເຕົ້າ
 *
 * ຮ່ວມກັນລະຫວ່າງ puplatao-bets.php (ວາງເດີມພັນ / ເບິ່ງ P/L) ແລະ
 * puplatao.php (ເພີ່ມຜົນງວດ → ຄິດຜົນບິນທີ່ຄ້າງອັດຕະໂນມັດ).
 *
 * ໃຊ້ PDO ຕາມ puplatao.php (betting.php ໃຊ້ mysqli — ຄົນລະ connection,
 * ແຕ່ຂຽນລົງ wallets / wallet_transactions ຊຸດດຽວກັນ ໂດຍລັອກແຖວດ້ວຍ
 * SELECT ... FOR UPDATE ຄືກັນ).
 */

if (!defined('PUPLATAO_BET_KINDS')) {
    define('PUPLATAO_BET_KINDS', ['predict_pair', 'avoid_pair']);
}

/** ອັດຕາຈ່າຍທັງໝົດ, key = bet_kind */
function puplatao_bet_rates(PDO $pdo): array
{
    $rows = $pdo->query(
        'SELECT bet_kind, label_lo, multiplier, fair_prob, min_stake, max_stake, is_active
           FROM puplatao_bet_rates'
    )->fetchAll();
    $out = [];
    foreach ($rows as $r) {
        $out[$r['bet_kind']] = [
            'bet_kind'   => $r['bet_kind'],
            'label_lo'   => $r['label_lo'],
            'multiplier' => (float)$r['multiplier'],
            'fair_prob'  => (float)$r['fair_prob'],
            'min_stake'  => (float)$r['min_stake'],
            'max_stake'  => (float)$r['max_stake'],
            'is_active'  => (int)$r['is_active'] === 1,
        ];
    }
    return $out;
}

/** ຍອດເງິນປັດຈຸບັນ — ສ້າງກະເປົາຍອດ 0 ໃຫ້ບັນຊີເກົ່າທີ່ຍັງບໍ່ມີ */
function puplatao_wallet_balance(PDO $pdo, int $userId): float
{
    $stmt = $pdo->prepare('SELECT balance FROM wallets WHERE user_id = :u');
    $stmt->execute([':u' => $userId]);
    $row = $stmt->fetch();
    if ($row) return (float)$row['balance'];

    $pdo->prepare('INSERT IGNORE INTO wallets (user_id, balance) VALUES (:u, 0)')
        ->execute([':u' => $userId]);
    return 0.0;
}

/**
 * ບວກ/ລົບຍອດກະເປົາ ພ້ອມບັນທຶກລົງ ledger.
 * ຕ້ອງເອີ້ນພາຍໃນ transaction ທີ່ເປີດໄວ້ແລ້ວ — ໃຊ້ FOR UPDATE ກັນການແຂ່ງກັນ.
 * ຖິ້ມ exception ເມື່ອຍອດຈະຕິດລົບ. ຄືນຄ່າຍອດໃໝ່.
 */
function puplatao_wallet_apply(
    PDO $pdo, int $userId, float $amount, string $type,
    ?int $refBetId, ?string $note, ?int $createdBy
): float {
    $stmt = $pdo->prepare('SELECT balance FROM wallets WHERE user_id = :u FOR UPDATE');
    $stmt->execute([':u' => $userId]);
    $row = $stmt->fetch();

    if ($row) {
        $current = (float)$row['balance'];
    } else {
        $pdo->prepare('INSERT INTO wallets (user_id, balance) VALUES (:u, 0)')
            ->execute([':u' => $userId]);
        $current = 0.0;
    }

    $newBalance = round($current + $amount, 2);
    if ($newBalance < 0) {
        throw new RuntimeException('ຍອດເງິນໃນກະເປົາບໍ່ພຽງພໍ');
    }

    $pdo->prepare('UPDATE wallets SET balance = :b WHERE user_id = :u')
        ->execute([':b' => $newBalance, ':u' => $userId]);

    $pdo->prepare(
        'INSERT INTO wallet_transactions
           (user_id, type, amount, balance_after, ref_bet_id, ref_source, note, created_by)
         VALUES (:u, :t, :a, :b, :r, \'puplatao\', :n, :c)'
    )->execute([
        ':u' => $userId, ':t' => $type, ':a' => $amount, ':b' => $newBalance,
        ':r' => $refBetId, ':n' => $note, ':c' => $createdBy,
    ]);

    return $newBalance;
}

/**
 * ບິນນີ້ຊະນະບໍ່?
 *   predict_pair — ຕ້ອງອອກ "ທັງສອງລູກ" ໃນ 3 ໜ່ວຍ
 *   avoid_pair   — ຕ້ອງ "ບໍ່ອອກທັງສອງລູກ" ເລີຍ
 * $result = symbol_id 3 ໜ່ວຍຂອງງວດນັ້ນ
 */
function puplatao_bet_is_win(string $kind, array $result, int $a, int $b): bool
{
    $hasA = in_array($a, $result, true);
    $hasB = in_array($b, $result, true);
    return $kind === 'avoid_pair' ? (!$hasA && !$hasB) : ($hasA && $hasB);
}

/**
 * ຄິດຜົນບິນທີ່ຍັງຄ້າງທັງໝົດ ທີ່ງວດເປົ້າໝາຍມີຜົນອອກແລ້ວ.
 *
 * ບິນທີ່ງວດເປົ້າໝາຍ "ຖືກຂ້າມ" (ມີງວດໃໝ່ກວ່າແລ້ວ ແຕ່ງວດນັ້ນບໍ່ເຄີຍຖືກບັນທຶກ
 * — ເຊັ່ນ ຖືກລຶບ ຫຼື ຂາດຊ່ວງ) ຈະຖືກຍົກເລີກ ແລະ ຄືນເງິນເຕັມຈຳນວນ.
 *
 * Idempotent: ບິນທີ່ຄິດແລ້ວຈະບໍ່ຖືກຄິດຊ້ຳ ຍ້ອນ WHERE status = 'pending'
 * ບວກກັບການລັອກແຖວດ້ວຍ FOR UPDATE.
 *
 * @return array{settled:int, won:int, lost:int, voided:int, paid:float}
 */
function puplatao_settle_pending(PDO $pdo, ?int $adminId = null): array
{
    $summary = ['settled' => 0, 'won' => 0, 'lost' => 0, 'voided' => 0, 'paid' => 0.0];

    $pending = $pdo->query(
        'SELECT DISTINCT target_draw_no FROM puplatao_bets WHERE status = \'pending\''
    )->fetchAll(PDO::FETCH_COLUMN);
    if (!$pending) return $summary;

    $maxDrawNo = (int)$pdo->query('SELECT IFNULL(MAX(draw_no), 0) FROM puplatao_draws')->fetchColumn();

    $resStmt = $pdo->prepare(
        'SELECT symbol_id FROM puplatao_draw_results WHERE draw_no = :n ORDER BY position'
    );
    $betStmt = $pdo->prepare(
        'SELECT bet_id, user_id, bet_kind, symbol_a, symbol_b, stake, potential_payout
           FROM puplatao_bets
          WHERE target_draw_no = :n AND status = \'pending\'
          FOR UPDATE'
    );
    $updStmt = $pdo->prepare(
        'UPDATE puplatao_bets
            SET status = :s, payout_amount = :p, profit_loss = :pl,
                result_symbols = :r, settled_at = NOW()
          WHERE bet_id = :id AND status = \'pending\''
    );

    foreach ($pending as $drawNo) {
        $drawNo = (int)$drawNo;
        $resStmt->execute([':n' => $drawNo]);
        $result = array_map('intval', $resStmt->fetchAll(PDO::FETCH_COLUMN));

        $hasResult = count($result) === 3;
        $skipped   = !$hasResult && $maxDrawNo > $drawNo;
        if (!$hasResult && !$skipped) continue;   // ງວດຍັງບໍ່ທັນອອກ — ປ່ອຍຄ້າງໄວ້

        $resultStr = $hasResult ? implode(',', $result) : null;

        $pdo->beginTransaction();
        try {
            $betStmt->execute([':n' => $drawNo]);
            foreach ($betStmt->fetchAll() as $bet) {
                $betId = (int)$bet['bet_id'];
                $stake = (float)$bet['stake'];

                if ($skipped) {
                    $updStmt->execute([
                        ':s' => 'void', ':p' => 0, ':pl' => 0, ':r' => null, ':id' => $betId,
                    ]);
                    puplatao_wallet_apply(
                        $pdo, (int)$bet['user_id'], $stake, 'bet_void_refund', $betId,
                        "ຄືນເງິນ — ງວດ {$drawNo} ບໍ່ມີຜົນອອກ", $adminId
                    );
                    $summary['voided']++;
                    continue;
                }

                $isWin  = puplatao_bet_is_win($bet['bet_kind'], $result, (int)$bet['symbol_a'], (int)$bet['symbol_b']);
                $payout = $isWin ? round((float)$bet['potential_payout'], 2) : 0.0;
                $pl     = round($payout - $stake, 2);

                $updStmt->execute([
                    ':s'  => $isWin ? 'won' : 'lost',
                    ':p'  => $payout,
                    ':pl' => $pl,
                    ':r'  => $resultStr,
                    ':id' => $betId,
                ]);

                if ($isWin) {
                    puplatao_wallet_apply(
                        $pdo, (int)$bet['user_id'], $payout, 'bet_won', $betId,
                        "ຖືກຄູ່ ປູປາເຕົ້າ ງວດ {$drawNo}", $adminId
                    );
                    $summary['won']++;
                    $summary['paid'] += $payout;
                } else {
                    $summary['lost']++;
                }
                $summary['settled']++;
            }
            $pdo->commit();
        } catch (Throwable $e) {
            if ($pdo->inTransaction()) $pdo->rollBack();
            error_log('[puplatao_settle_pending] draw ' . $drawNo . ': ' . $e->getMessage());
        }
    }

    $summary['paid'] = round($summary['paid'], 2);
    return $summary;
}
