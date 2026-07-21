<?php
/**
 * betting.php — Demo betting system (virtual currency only, no real money)
 * for "ຫວຍພັດທະນາ" (lottery_types.type_id, usually 1).
 *
 * Router style mirrors index.php: ?action=... switch, mysqli prepared
 * statements, JWT auth via requireAuth() (copied from index.php since
 * this file is loaded standalone).
 */

require_once __DIR__ . '/config.php';

if (PRODUCTION) {
    error_reporting(0);
    ini_set('display_errors', '0');
}

$origin = isset($_SERVER['HTTP_ORIGIN']) ? $_SERVER['HTTP_ORIGIN'] : '';
$allowedOrigin = in_array($origin, ALLOWED_ORIGINS, true) ? $origin : ALLOWED_ORIGINS[0];
header("Access-Control-Allow-Origin: " . $allowedOrigin);
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

define('SECRET_KEY', JWT_SECRET);

function getAuthorizationHeader()
{
    if (function_exists('apache_request_headers')) {
        $apacheHeaders = apache_request_headers();
        if (is_array($apacheHeaders)) {
            foreach ($apacheHeaders as $key => $value) {
                if (strtolower($key) === 'authorization') {
                    return $value;
                }
            }
        }
    }
    if (!empty($_SERVER['HTTP_AUTHORIZATION'])) {
        return $_SERVER['HTTP_AUTHORIZATION'];
    }
    if (!empty($_SERVER['REDIRECT_HTTP_AUTHORIZATION'])) {
        return $_SERVER['REDIRECT_HTTP_AUTHORIZATION'];
    }
    return '';
}

function verifyToken()
{
    $authHeader = getAuthorizationHeader();
    if (!$authHeader || !preg_match('/Bearer\s(\S+)/i', $authHeader, $matches)) {
        return false;
    }
    $token = $matches[1];
    $parts = explode('.', $token);
    if (count($parts) !== 3) return false;

    $signature = hash_hmac('sha256', $parts[0] . '.' . $parts[1], SECRET_KEY, true);
    $expected   = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($signature));
    if (!hash_equals($expected, $parts[2])) return false;

    $payload = json_decode(base64_decode(str_replace(['-', '_'], ['+', '/'], $parts[1])), true);
    if (!is_array($payload)) return false;

    if (empty($payload['exp']) || $payload['exp'] < time()) {
        return 'expired';
    }

    return $payload;
}

/**
 * $role: 'admin' | 'staff' | null (any authenticated user)
 */
function requireAuth($role = null)
{
    $payload = verifyToken();
    if ($payload === 'expired') {
        http_response_code(401);
        echo json_encode(["error" => "ໝົດເວລາ session — ກະລຸນາ login ໃໝ່", "code" => "TOKEN_EXPIRED"]);
        exit();
    }
    if (!$payload || !is_array($payload)) {
        http_response_code(401);
        echo json_encode(["error" => "Unauthorized — token invalid or missing", "code" => "TOKEN_INVALID"]);
        exit();
    }
    if ($role === 'admin' && $payload['role'] !== 'admin') {
        http_response_code(403);
        echo json_encode(["error" => "ສິດທິ Admin ເທົ່ານັ້ນ", "code" => "FORBIDDEN"]);
        exit();
    }
    if ($role === 'staff' && !in_array($payload['role'], ['admin', 'staff'], true)) {
        http_response_code(403);
        echo json_encode(["error" => "Forbidden", "code" => "FORBIDDEN"]);
        exit();
    }
    return $payload;
}

$conn = new mysqli(DB_HOST, DB_USER, DB_PASS, DB_NAME);
if ($conn->connect_error) {
    http_response_code(500);
    echo json_encode(["error" => "Database connection failed"]);
    exit();
}
$conn->set_charset("utf8mb4");

// ── Domain constants ────────────────────────────────────────────────
$PRIZE_DIGIT_LEN = [
    '6_digits' => 6, '5_digits' => 5, '4_digits' => 4, '3_digits' => 3, '2_digits' => 2,
];

/**
 * On Monday–Friday, betting closes at 20:00 Laos time regardless of a
 * round's own status. This rule doesn't say anything about weekends —
 * whether betting is possible then is left entirely to the round's status.
 * Uses an explicit timezone rather than the server default so the cutoff
 * is correct no matter how the host is configured.
 */
function isWithinDailyBettingWindow(): bool
{
    $now = new DateTime('now', new DateTimeZone('Asia/Vientiane'));
    $dayOfWeek = (int)$now->format('N'); // 1 = Monday ... 7 = Sunday
    if ($dayOfWeek > 5) return true;
    $cutoff = (clone $now)->setTime(20, 0, 0);
    return $now < $cutoff;
}

// ── Wallet helpers ───────────────────────────────────────────────────

/** Read-only balance lookup; lazily creates a zero-balance wallet row for
 *  accounts that predate this feature. No locking — safe for GET reads. */
function getOrCreateWalletBalance(mysqli $conn, int $userId): float
{
    $stmt = $conn->prepare("SELECT balance FROM wallets WHERE user_id = ?");
    $stmt->bind_param('i', $userId);
    $stmt->execute();
    $row = $stmt->get_result()->fetch_assoc();
    $stmt->close();
    if ($row) return (float)$row['balance'];

    $ins = $conn->prepare("INSERT IGNORE INTO wallets (user_id, balance) VALUES (?, 0)");
    $ins->bind_param('i', $userId);
    $ins->execute();
    $ins->close();
    return 0.0;
}

/**
 * Apply a signed delta to a user's wallet and record the ledger entry.
 * MUST be called inside an open $conn->begin_transaction() — uses
 * SELECT ... FOR UPDATE to serialize concurrent debits/credits per user.
 * Throws on insufficient balance (negative amount driving balance < 0).
 * Returns the new balance.
 */
function applyWalletTx(mysqli $conn, int $userId, float $amount, string $type, ?int $refBetId, ?string $note, ?int $createdBy): float
{
    $stmt = $conn->prepare("SELECT balance FROM wallets WHERE user_id = ? FOR UPDATE");
    $stmt->bind_param('i', $userId);
    $stmt->execute();
    $row = $stmt->get_result()->fetch_assoc();
    $stmt->close();

    if ($row) {
        $current = (float)$row['balance'];
    } else {
        $ins = $conn->prepare("INSERT INTO wallets (user_id, balance) VALUES (?, 0)");
        $ins->bind_param('i', $userId);
        $ins->execute();
        $ins->close();
        $current = 0.0;
    }

    $newBalance = round($current + $amount, 2);
    if ($newBalance < 0) {
        throw new Exception('ຍອດເງິນໃນກະເປົາບໍ່ພຽງພໍ');
    }

    $upd = $conn->prepare("UPDATE wallets SET balance = ? WHERE user_id = ?");
    $upd->bind_param('di', $newBalance, $userId);
    $upd->execute();
    $upd->close();

    $tx = $conn->prepare("INSERT INTO wallet_transactions (user_id, type, amount, balance_after, ref_bet_id, note, created_by) VALUES (?, ?, ?, ?, ?, ?, ?)");
    $tx->bind_param('isddisi', $userId, $type, $amount, $newBalance, $refBetId, $note, $createdBy);
    $tx->execute();
    $tx->close();

    return $newBalance;
}

$action = isset($_GET['action']) ? $_GET['action'] : '';

switch ($action) {

    // ── Member: wallet ──────────────────────────────────────────────

    case 'get_wallet':
        $payload = requireAuth();
        $balance = getOrCreateWalletBalance($conn, (int)$payload['user_id']);
        echo json_encode(["balance" => $balance]);
        break;

    case 'wallet_history':
        $payload = requireAuth();
        $userId = (int)$payload['user_id'];
        $limit  = isset($_GET['limit'])  ? max(1, min(100, (int)$_GET['limit'])) : 20;
        $offset = isset($_GET['offset']) ? max(0, (int)$_GET['offset']) : 0;

        $stmt = $conn->prepare("SELECT tx_id, type, amount, balance_after, note, created_at
                                 FROM wallet_transactions WHERE user_id = ?
                                 ORDER BY created_at DESC LIMIT ? OFFSET ?");
        $stmt->bind_param('iii', $userId, $limit, $offset);
        $stmt->execute();
        $rows = $stmt->get_result()->fetch_all(MYSQLI_ASSOC);
        $stmt->close();
        echo json_encode($rows);
        break;

    // ── Member: rounds & rates ───────────────────────────────────────

    case 'list_open_rounds':
        requireAuth();
        $type_id = isset($_GET['type_id']) ? (int)$_GET['type_id'] : 1;
        $stmt = $conn->prepare("SELECT round_id, type_id, draw_date, draw_number, status
                                 FROM betting_rounds WHERE type_id = ? AND status = 'open'
                                 ORDER BY draw_date ASC, draw_number ASC");
        $stmt->bind_param('i', $type_id);
        $stmt->execute();
        $rows = $stmt->get_result()->fetch_all(MYSQLI_ASSOC);
        $stmt->close();
        echo json_encode($rows);
        break;

    case 'get_payout_rates':
        requireAuth();
        $result = $conn->query("SELECT prize_type, multiplier FROM bet_payout_rates WHERE is_active = 1");
        echo json_encode($result->fetch_all(MYSQLI_ASSOC));
        break;

    // ── Member: place & view bets ────────────────────────────────────

    case 'place_bet':
        if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
            http_response_code(405);
            echo json_encode(["error" => "Only POST allowed for this action"]);
            break;
        }
        $payload = requireAuth();
        $userId = (int)$payload['user_id'];

        $input = json_decode(file_get_contents('php://input'), true);
        if (!$input) {
            http_response_code(400);
            echo json_encode(["error" => "Invalid JSON payload"]);
            break;
        }

        $round_id      = isset($input['round_id']) ? (int)$input['round_id'] : 0;
        $prize_type    = trim($input['prize_type'] ?? '');
        $chosen_number = trim($input['chosen_number'] ?? '');
        $stake         = isset($input['stake']) ? (float)$input['stake'] : 0;

        if ($round_id <= 0) {
            http_response_code(400); echo json_encode(["error" => "round_id ບໍ່ຖືກຕ້ອງ"]); break;
        }
        if (!isset($PRIZE_DIGIT_LEN[$prize_type])) {
            http_response_code(400); echo json_encode(["error" => "prize_type ບໍ່ຖືກຕ້ອງ"]); break;
        }
        $len = $PRIZE_DIGIT_LEN[$prize_type];
        if (!preg_match('/^\d{' . $len . '}$/', $chosen_number)) {
            http_response_code(400); echo json_encode(["error" => "ເລກທີ່ເລືອກຕ້ອງເປັນຕົວເລກ {$len} ໂຕເທົ່ານັ້ນ"]); break;
        }
        if ($stake <= 0) {
            http_response_code(400); echo json_encode(["error" => "ຈຳນວນເງິນເດີມພັນຕ້ອງຫຼາຍກວ່າ 0"]); break;
        }
        if (!isWithinDailyBettingWindow()) {
            http_response_code(400);
            echo json_encode(["error" => "ປິດຮັບແທງແລ້ວ — ຮັບແທງໄດ້ວັນຈັນ-ສຸກ ກ່ອນເວລາ 20:00 ໂມງ ເທົ່ານັ້ນ"]);
            break;
        }

        $conn->begin_transaction();
        try {
            $stmt = $conn->prepare("SELECT status FROM betting_rounds WHERE round_id = ? FOR UPDATE");
            $stmt->bind_param('i', $round_id);
            $stmt->execute();
            $round = $stmt->get_result()->fetch_assoc();
            $stmt->close();
            if (!$round) throw new Exception('ບໍ່ພົບຮອບແທງ');
            if ($round['status'] !== 'open') throw new Exception('ຮອບນີ້ປິດຮັບແທງແລ້ວ');

            $stmt = $conn->prepare("SELECT multiplier FROM bet_payout_rates WHERE prize_type = ? AND is_active = 1");
            $stmt->bind_param('s', $prize_type);
            $stmt->execute();
            $rate = $stmt->get_result()->fetch_assoc();
            $stmt->close();
            if (!$rate) throw new Exception('ປະເພດການແທງນີ້ປິດຊົ່ວຄາວ');

            $multiplier = (float)$rate['multiplier'];
            $potential  = round($stake * $multiplier, 2);

            $stmt = $conn->prepare("INSERT INTO bets (round_id, user_id, prize_type, chosen_number, stake, multiplier_snapshot, potential_payout, status)
                                     VALUES (?, ?, ?, ?, ?, ?, ?, 'pending')");
            $stmt->bind_param('iissddd', $round_id, $userId, $prize_type, $chosen_number, $stake, $multiplier, $potential);
            $stmt->execute();
            $betId = $conn->insert_id;
            $stmt->close();

            $note = "ແທງ {$prize_type} ເລກ {$chosen_number} (ຮອບ #{$round_id})";
            $newBalance = applyWalletTx($conn, $userId, -$stake, 'bet_placed', $betId, $note, null);

            $conn->commit();
            echo json_encode(["success" => true, "bet_id" => $betId, "new_balance" => $newBalance]);
        } catch (Exception $e) {
            $conn->rollback();
            error_log('[place_bet] ' . $e->getMessage());
            http_response_code(400);
            echo json_encode(["error" => $e->getMessage()]);
        }
        break;

    case 'my_bets':
        $payload = requireAuth();
        $userId = (int)$payload['user_id'];
        $status = trim($_GET['status'] ?? '');
        $limit  = isset($_GET['limit'])  ? max(1, min(100, (int)$_GET['limit'])) : 20;
        $offset = isset($_GET['offset']) ? max(0, (int)$_GET['offset']) : 0;

        $sql = "SELECT b.bet_id, b.round_id, b.prize_type, b.chosen_number, b.stake, b.multiplier_snapshot,
                       b.potential_payout, b.status, b.payout_amount, b.created_at, b.settled_at,
                       r.type_id, r.draw_date, r.draw_number
                FROM bets b JOIN betting_rounds r ON r.round_id = b.round_id
                WHERE b.user_id = ?";
        $types = 'i'; $params = [$userId];
        if (in_array($status, ['pending', 'won', 'lost', 'void'], true)) {
            $sql .= " AND b.status = ?"; $types .= 's'; $params[] = $status;
        }
        $sql .= " ORDER BY b.created_at DESC LIMIT ? OFFSET ?";
        $types .= 'ii'; $params[] = $limit; $params[] = $offset;

        $stmt = $conn->prepare($sql);
        $stmt->bind_param($types, ...$params);
        $stmt->execute();
        $rows = $stmt->get_result()->fetch_all(MYSQLI_ASSOC);
        $stmt->close();
        echo json_encode($rows);
        break;

    // ── Staff/Admin: rounds ──────────────────────────────────────────

    case 'list_rounds':
        requireAuth('staff');
        $type_id = isset($_GET['type_id']) && $_GET['type_id'] !== '' ? (int)$_GET['type_id'] : null;
        $status  = trim($_GET['status'] ?? '');

        $sql = "SELECT r.round_id, r.type_id, r.draw_date, r.draw_number, r.status,
                       r.opened_by, r.closed_at, r.settled_at,
                       COUNT(b.bet_id) AS bet_count,
                       COALESCE(SUM(b.stake), 0) AS total_staked,
                       COALESCE(SUM(CASE WHEN b.status = 'pending' THEN b.potential_payout ELSE 0 END), 0) AS total_liability
                FROM betting_rounds r
                LEFT JOIN bets b ON b.round_id = r.round_id
                WHERE 1=1";
        $types = ''; $params = [];
        if ($type_id) { $sql .= " AND r.type_id = ?"; $types .= 'i'; $params[] = $type_id; }
        if (in_array($status, ['open', 'closed', 'settled', 'void'], true)) {
            $sql .= " AND r.status = ?"; $types .= 's'; $params[] = $status;
        }
        $sql .= " GROUP BY r.round_id ORDER BY r.draw_date DESC, r.draw_number DESC";

        if ($types) {
            $stmt = $conn->prepare($sql);
            $stmt->bind_param($types, ...$params);
            $stmt->execute();
            $rows = $stmt->get_result()->fetch_all(MYSQLI_ASSOC);
            $stmt->close();
        } else {
            $rows = $conn->query($sql)->fetch_all(MYSQLI_ASSOC);
        }
        echo json_encode($rows);
        break;

    case 'open_round':
        if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
            http_response_code(405); echo json_encode(["error" => "Only POST allowed for this action"]); break;
        }
        $payload = requireAuth('staff');
        $input = json_decode(file_get_contents('php://input'), true);
        if (!$input) { http_response_code(400); echo json_encode(["error" => "Invalid JSON payload"]); break; }

        $type_id     = isset($input['type_id']) ? (int)$input['type_id'] : 0;
        $draw_number = isset($input['draw_number']) ? (int)$input['draw_number'] : 0;
        $draw_date   = trim($input['draw_date'] ?? '');

        if ($type_id <= 0) { http_response_code(400); echo json_encode(["error" => "type_id ບໍ່ຖືກຕ້ອງ"]); break; }
        if ($draw_number <= 0) { http_response_code(400); echo json_encode(["error" => "draw_number ຕ້ອງເປັນຕົວເລກບວກ"]); break; }
        $dt = DateTime::createFromFormat('Y-m-d', $draw_date);
        if (!$dt || $dt->format('Y-m-d') !== $draw_date) {
            http_response_code(400); echo json_encode(["error" => "draw_date ຣູບແບບຕ້ອງເປັນ YYYY-MM-DD"]); break;
        }

        $openerId = (int)$payload['user_id'];
        $stmt = $conn->prepare("INSERT INTO betting_rounds (type_id, draw_date, draw_number, status, opened_by)
                                 VALUES (?, ?, ?, 'open', ?)");
        $stmt->bind_param('isii', $type_id, $draw_date, $draw_number, $openerId);
        if ($stmt->execute()) {
            echo json_encode(["success" => true, "round_id" => $conn->insert_id]);
        } else {
            $isDup = $conn->errno === 1062;
            http_response_code($isDup ? 409 : 500);
            echo json_encode(["error" => $isDup ? "ມີຮອບແທງງວດນີ້ຢູ່ແລ້ວ" : "ບໍ່ສາມາດເປີດຮອບໄດ້"]);
        }
        $stmt->close();
        break;

    case 'close_round':
        if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
            http_response_code(405); echo json_encode(["error" => "Only POST allowed for this action"]); break;
        }
        requireAuth('staff');
        $input = json_decode(file_get_contents('php://input'), true);
        $round_id = isset($input['round_id']) ? (int)$input['round_id'] : 0;
        if ($round_id <= 0) { http_response_code(400); echo json_encode(["error" => "round_id ບໍ່ຖືກຕ້ອງ"]); break; }

        $stmt = $conn->prepare("UPDATE betting_rounds SET status='closed', closed_at=NOW() WHERE round_id=? AND status='open'");
        $stmt->bind_param('i', $round_id);
        $stmt->execute();
        $affected = $stmt->affected_rows;
        $stmt->close();

        if ($affected > 0) {
            echo json_encode(["success" => true]);
        } else {
            http_response_code(400);
            echo json_encode(["error" => "ຮອບນີ້ບໍ່ໄດ້ຢູ່ໃນສະຖານະເປີດ"]);
        }
        break;

    case 'settle_round':
        if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
            http_response_code(405); echo json_encode(["error" => "Only POST allowed for this action"]); break;
        }
        $payload = requireAuth('admin');
        $adminId = (int)$payload['user_id'];
        $input = json_decode(file_get_contents('php://input'), true);
        $round_id = isset($input['round_id']) ? (int)$input['round_id'] : 0;
        if ($round_id <= 0) { http_response_code(400); echo json_encode(["error" => "round_id ບໍ່ຖືກຕ້ອງ"]); break; }

        $conn->begin_transaction();
        $alreadySettled = false;
        $wonCount = 0;
        $totalPaid = 0.0;
        try {
            $stmt = $conn->prepare("SELECT type_id, draw_date, draw_number, status FROM betting_rounds WHERE round_id = ? FOR UPDATE");
            $stmt->bind_param('i', $round_id);
            $stmt->execute();
            $round = $stmt->get_result()->fetch_assoc();
            $stmt->close();

            if (!$round) throw new Exception('ບໍ່ພົບຮອບແທງ');

            if ($round['status'] === 'settled') {
                $alreadySettled = true;
            } elseif ($round['status'] !== 'closed') {
                throw new Exception('ຕ້ອງປິດຮອບກ່ອນຈຶ່ງຄິດໄລ່ຜົນໄດ້');
            } else {
                $stmt = $conn->prepare("SELECT draw_id FROM lottery_draws WHERE type_id=? AND draw_date=? AND draw_number=? AND status='published'");
                $stmt->bind_param('isi', $round['type_id'], $round['draw_date'], $round['draw_number']);
                $stmt->execute();
                $draw = $stmt->get_result()->fetch_assoc();
                $stmt->close();
                if (!$draw) throw new Exception('ຍັງບໍ່ທັນມີຜົນຫວຍສຳລັບງວດນີ້ ກະລຸນາປ້ອນຜົນກ່ອນ');
                $drawId = (int)$draw['draw_id'];

                $stmt = $conn->prepare("SELECT prize_type, result_value FROM draw_results_detail WHERE draw_id = ?");
                $stmt->bind_param('i', $drawId);
                $stmt->execute();
                $detailRows = $stmt->get_result()->fetch_all(MYSQLI_ASSOC);
                $stmt->close();
                $resultMap = [];
                foreach ($detailRows as $d) { $resultMap[$d['prize_type']] = $d['result_value']; }

                $stmt = $conn->prepare("SELECT bet_id, user_id, prize_type, chosen_number, potential_payout FROM bets WHERE round_id = ? AND status = 'pending' FOR UPDATE");
                $stmt->bind_param('i', $round_id);
                $stmt->execute();
                $pendingBets = $stmt->get_result()->fetch_all(MYSQLI_ASSOC);
                $stmt->close();

                $updBet = $conn->prepare("UPDATE bets SET status=?, payout_amount=?, settled_at=NOW() WHERE bet_id=?");
                foreach ($pendingBets as $bet) {
                    $winning = $resultMap[$bet['prize_type']] ?? null;
                    $isWin = $winning !== null && $winning === $bet['chosen_number'];
                    $betStatus = $isWin ? 'won' : 'lost';
                    $payout = $isWin ? (float)$bet['potential_payout'] : 0.0;

                    $updBet->bind_param('sdi', $betStatus, $payout, $bet['bet_id']);
                    $updBet->execute();

                    if ($isWin) {
                        $wonCount++;
                        $totalPaid += $payout;
                        applyWalletTx(
                            $conn, (int)$bet['user_id'], $payout, 'bet_won', (int)$bet['bet_id'],
                            "ຖືກລາງວັນ {$bet['prize_type']} ເລກ {$bet['chosen_number']}", $adminId
                        );
                    }
                }
                $updBet->close();

                $stmt = $conn->prepare("UPDATE betting_rounds SET status='settled', draw_id=?, settled_at=NOW(), settled_by=? WHERE round_id=?");
                $stmt->bind_param('iii', $drawId, $adminId, $round_id);
                $stmt->execute();
                $stmt->close();
            }

            $conn->commit();
            if ($alreadySettled) {
                echo json_encode(["success" => true, "already_settled" => true]);
            } else {
                echo json_encode(["success" => true, "won_count" => $wonCount, "total_paid" => $totalPaid]);
            }
        } catch (Exception $e) {
            $conn->rollback();
            error_log('[settle_round] ' . $e->getMessage());
            http_response_code(400);
            echo json_encode(["error" => $e->getMessage()]);
        }
        break;

    case 'void_round':
        if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
            http_response_code(405); echo json_encode(["error" => "Only POST allowed for this action"]); break;
        }
        $payload = requireAuth('admin');
        $adminId = (int)$payload['user_id'];
        $input = json_decode(file_get_contents('php://input'), true);
        $round_id = isset($input['round_id']) ? (int)$input['round_id'] : 0;
        $reason = trim($input['reason'] ?? '');
        if ($round_id <= 0) { http_response_code(400); echo json_encode(["error" => "round_id ບໍ່ຖືກຕ້ອງ"]); break; }

        $conn->begin_transaction();
        try {
            $stmt = $conn->prepare("SELECT status FROM betting_rounds WHERE round_id = ? FOR UPDATE");
            $stmt->bind_param('i', $round_id);
            $stmt->execute();
            $round = $stmt->get_result()->fetch_assoc();
            $stmt->close();
            if (!$round) throw new Exception('ບໍ່ພົບຮອບແທງ');
            if (in_array($round['status'], ['settled', 'void'], true)) {
                throw new Exception('ຮອບນີ້ຖືກຄິດໄລ່ ຫຼື ຍົກເລີກໄປແລ້ວ');
            }

            $stmt = $conn->prepare("SELECT bet_id, user_id, stake FROM bets WHERE round_id = ? AND status = 'pending' FOR UPDATE");
            $stmt->bind_param('i', $round_id);
            $stmt->execute();
            $pendingBets = $stmt->get_result()->fetch_all(MYSQLI_ASSOC);
            $stmt->close();

            $updBet = $conn->prepare("UPDATE bets SET status='void', settled_at=NOW() WHERE bet_id=?");
            $refundedCount = 0;
            foreach ($pendingBets as $bet) {
                $updBet->bind_param('i', $bet['bet_id']);
                $updBet->execute();
                applyWalletTx(
                    $conn, (int)$bet['user_id'], (float)$bet['stake'], 'bet_void_refund', (int)$bet['bet_id'],
                    $reason !== '' ? $reason : 'ຍົກເລີກຮອບແທງ', $adminId
                );
                $refundedCount++;
            }
            $updBet->close();

            $stmt = $conn->prepare("UPDATE betting_rounds SET status='void' WHERE round_id=?");
            $stmt->bind_param('i', $round_id);
            $stmt->execute();
            $stmt->close();

            $conn->commit();
            echo json_encode(["success" => true, "refunded_count" => $refundedCount]);
        } catch (Exception $e) {
            $conn->rollback();
            error_log('[void_round] ' . $e->getMessage());
            http_response_code(400);
            echo json_encode(["error" => $e->getMessage()]);
        }
        break;

    case 'round_detail':
        requireAuth('staff');
        $round_id = isset($_GET['round_id']) ? (int)$_GET['round_id'] : 0;
        if ($round_id <= 0) { http_response_code(400); echo json_encode(["error" => "round_id ບໍ່ຖືກຕ້ອງ"]); break; }

        $stmt = $conn->prepare("SELECT round_id, type_id, draw_date, draw_number, status, opened_by, closed_at, settled_at
                                 FROM betting_rounds WHERE round_id = ?");
        $stmt->bind_param('i', $round_id);
        $stmt->execute();
        $round = $stmt->get_result()->fetch_assoc();
        $stmt->close();
        if (!$round) { http_response_code(404); echo json_encode(["error" => "ບໍ່ພົບຮອບແທງ"]); break; }

        $stmt = $conn->prepare("SELECT b.bet_id, b.user_id, u.username, b.prize_type, b.chosen_number,
                                        b.stake, b.potential_payout, b.status, b.payout_amount
                                 FROM bets b JOIN users u ON u.user_id = b.user_id
                                 WHERE b.round_id = ? ORDER BY b.created_at DESC");
        $stmt->bind_param('i', $round_id);
        $stmt->execute();
        $round['bets'] = $stmt->get_result()->fetch_all(MYSQLI_ASSOC);
        $stmt->close();

        echo json_encode($round);
        break;

    // ── Admin: payout rates ──────────────────────────────────────────

    case 'list_payout_rates':
        requireAuth('staff');
        $result = $conn->query(
            "SELECT prize_type, multiplier, is_active, updated_at FROM bet_payout_rates
             ORDER BY FIELD(prize_type,'2_digits','3_digits','4_digits','5_digits','6_digits')"
        );
        echo json_encode($result->fetch_all(MYSQLI_ASSOC));
        break;

    case 'update_payout_rate':
        if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
            http_response_code(405); echo json_encode(["error" => "Only POST allowed for this action"]); break;
        }
        requireAuth('admin');
        $input = json_decode(file_get_contents('php://input'), true);
        $prize_type = trim($input['prize_type'] ?? '');
        $multiplier = isset($input['multiplier']) ? (float)$input['multiplier'] : 0;
        $is_active  = isset($input['is_active']) ? (int)(bool)$input['is_active'] : 1;

        if (!isset($PRIZE_DIGIT_LEN[$prize_type])) {
            http_response_code(400); echo json_encode(["error" => "prize_type ບໍ່ຖືກຕ້ອງ"]); break;
        }
        if ($multiplier <= 0) {
            http_response_code(400); echo json_encode(["error" => "ອັດຕາຈ່າຍຕ້ອງຫຼາຍກວ່າ 0"]); break;
        }

        $stmt = $conn->prepare("UPDATE bet_payout_rates SET multiplier=?, is_active=? WHERE prize_type=?");
        $stmt->bind_param('dis', $multiplier, $is_active, $prize_type);
        $stmt->execute();
        $stmt->close();
        echo json_encode(["success" => true]);
        break;

    // ── Admin: wallets ────────────────────────────────────────────────

    case 'admin_adjust_wallet':
        if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
            http_response_code(405); echo json_encode(["error" => "Only POST allowed for this action"]); break;
        }
        $payload = requireAuth('admin');
        $adminId = (int)$payload['user_id'];
        $input = json_decode(file_get_contents('php://input'), true);
        $target_user_id = isset($input['user_id']) ? (int)$input['user_id'] : 0;
        $amount = isset($input['amount']) ? (float)$input['amount'] : 0;
        $note = trim($input['note'] ?? '');

        if ($target_user_id <= 0) { http_response_code(400); echo json_encode(["error" => "user_id ບໍ່ຖືກຕ້ອງ"]); break; }
        if ($amount == 0) { http_response_code(400); echo json_encode(["error" => "amount ຕ້ອງບໍ່ເປັນ 0"]); break; }

        $conn->begin_transaction();
        try {
            $newBalance = applyWalletTx($conn, $target_user_id, $amount, 'admin_adjustment', null, $note !== '' ? $note : null, $adminId);
            $conn->commit();
            echo json_encode(["success" => true, "new_balance" => $newBalance]);
        } catch (Exception $e) {
            $conn->rollback();
            http_response_code(400);
            echo json_encode(["error" => $e->getMessage()]);
        }
        break;

    case 'list_wallets':
        requireAuth('staff');
        $search = trim($_GET['search'] ?? '');
        $limit  = isset($_GET['limit'])  ? max(1, min(100, (int)$_GET['limit'])) : 20;
        $offset = isset($_GET['offset']) ? max(0, (int)$_GET['offset']) : 0;

        $sql = "SELECT u.user_id, u.username, u.full_name, COALESCE(w.balance, 0) AS balance
                FROM users u LEFT JOIN wallets w ON w.user_id = u.user_id
                WHERE u.deleted_at IS NULL";
        $types = ''; $params = [];
        if ($search !== '') {
            $sql .= " AND (u.username LIKE ? OR u.full_name LIKE ?)";
            $like = "%$search%";
            $types .= 'ss'; $params[] = $like; $params[] = $like;
        }
        $sql .= " ORDER BY u.user_id DESC LIMIT ? OFFSET ?";
        $types .= 'ii'; $params[] = $limit; $params[] = $offset;

        $stmt = $conn->prepare($sql);
        $stmt->bind_param($types, ...$params);
        $stmt->execute();
        $rows = $stmt->get_result()->fetch_all(MYSQLI_ASSOC);
        $stmt->close();
        echo json_encode($rows);
        break;

    default:
        http_response_code(404);
        echo json_encode(["error" => "Unknown action"]);
}
