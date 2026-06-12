<?php
/**
 * happy545.php — REST API for Happy 545 lottery (numbers + draws + stats)
 *
 * Routes (via ?r= query param):
 *   GET  ?r=numbers           — list all 45 master numbers
 *   GET  ?r=draws             — list all draws (newest first)
 *   POST ?r=draws             — add a draw result
 *   DELETE ?r=draws&id={n}   — delete draw by id
 *   GET  ?r=stats/last-digit  — pos5 frequency stats (all 45 numbers)
 */

require_once __DIR__ . '/config.php';

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

function validatePos(mixed $v, string $field): int {
    $n = filter_var($v, FILTER_VALIDATE_INT);
    if ($n === false || $n < 1 || $n > 45) {
        respond(422, ['error' => "$field ຕ້ອງເປັນຕົວເລກ 1–45"]);
    }
    return (int)$n;
}

// ── Router ────────────────────────────────────────────────────────────
$resource = trim($_GET['r'] ?? '', '/');
$method   = $_SERVER['REQUEST_METHOD'];

// ── GET /numbers ──────────────────────────────────────────────────────
if ($resource === 'numbers' && $method === 'GET') {
    $stmt = $pdo->query('SELECT num, label FROM h545_numbers ORDER BY num');
    respond(200, $stmt->fetchAll());
}

// ── GET /draws ────────────────────────────────────────────────────────
if ($resource === 'draws' && $method === 'GET') {
    $stmt = $pdo->query(
        'SELECT id, draw_date, pos1, pos2, pos3, pos4, pos5, created_at
           FROM h545_draws
          ORDER BY draw_date DESC'
    );
    respond(200, $stmt->fetchAll());
}

// ── POST /draws ───────────────────────────────────────────────────────
if ($resource === 'draws' && $method === 'POST') {
    $body = json_decode(file_get_contents('php://input'), true);
    if (!is_array($body)) {
        respond(400, ['error' => 'JSON body ບໍ່ຖືກຕ້ອງ']);
    }

    $drawDate = trim($body['draw_date'] ?? '');
    if (!preg_match('/^\d{4}-\d{2}-\d{2}$/', $drawDate) ||
        !checkdate((int)explode('-', $drawDate)[1],
                   (int)explode('-', $drawDate)[2],
                   (int)explode('-', $drawDate)[0])) {
        respond(422, ['error' => 'draw_date ຕ້ອງເປັນຮູບແບບ YYYY-MM-DD']);
    }

    $pos1 = validatePos($body['pos1'] ?? null, 'pos1');
    $pos2 = validatePos($body['pos2'] ?? null, 'pos2');
    $pos3 = validatePos($body['pos3'] ?? null, 'pos3');
    $pos4 = validatePos($body['pos4'] ?? null, 'pos4');
    $pos5 = validatePos($body['pos5'] ?? null, 'pos5');

    try {
        $stmt = $pdo->prepare(
            'INSERT INTO h545_draws (draw_date, pos1, pos2, pos3, pos4, pos5)
             VALUES (:draw_date, :pos1, :pos2, :pos3, :pos4, :pos5)'
        );
        $stmt->execute([
            ':draw_date' => $drawDate,
            ':pos1' => $pos1, ':pos2' => $pos2,
            ':pos3' => $pos3, ':pos4' => $pos4,
            ':pos5' => $pos5,
        ]);
        respond(201, ['id' => (int)$pdo->lastInsertId(), 'message' => 'ເພີ່ມຜົນເລກສຳເລັດ']);
    } catch (PDOException $e) {
        if (str_contains($e->getMessage(), 'Duplicate')) {
            respond(409, ['error' => 'ວັນທີນີ້ມີຜົນເລກຢູ່ແລ້ວ']);
        }
        respond(500, ['error' => 'ບໍ່ສາມາດເພີ່ມຂໍ້ມູນໄດ້']);
    }
}

// ── DELETE /draws?id={n} ──────────────────────────────────────────────
if ($resource === 'draws' && $method === 'DELETE') {
    $id = filter_var($_GET['id'] ?? null, FILTER_VALIDATE_INT);
    if (!$id || $id < 1) {
        respond(422, ['error' => 'id ບໍ່ຖືກຕ້ອງ']);
    }
    $stmt = $pdo->prepare('DELETE FROM h545_draws WHERE id = :id');
    $stmt->execute([':id' => $id]);
    if ($stmt->rowCount() === 0) {
        respond(404, ['error' => 'ບໍ່ພົບ draw id=' . $id]);
    }
    respond(200, ['message' => 'ລຶບສຳເລັດ']);
}

// ── GET /stats/last-digit ─────────────────────────────────────────────
if ($resource === 'stats/last-digit' && $method === 'GET') {
    // Left-join so numbers that never appeared get count = 0
    $sql = "
        SELECT
            n.num                                              AS number,
            n.label,
            COUNT(d.id)                                        AS `count`,
            ROUND(COUNT(d.id) * 100.0 / NULLIF((SELECT COUNT(*) FROM h545_draws),0), 2) AS percentage,
            MAX(d.draw_date)                                   AS last_seen_date,
            DATEDIFF(CURDATE(), MAX(d.draw_date))              AS gap
        FROM  h545_numbers n
        LEFT JOIN h545_draws d ON d.pos5 = n.num
        GROUP BY n.num, n.label
        ORDER BY `count` DESC, n.num ASC
    ";
    $stmt = $pdo->query($sql);
    $rows = $stmt->fetchAll();

    // Cast types for JSON
    foreach ($rows as &$row) {
        $row['number']     = (int)$row['number'];
        $row['count']      = (int)$row['count'];
        $row['percentage'] = $row['percentage'] !== null ? (float)$row['percentage'] : 0.0;
        $row['gap']        = $row['gap'] !== null ? (int)$row['gap'] : null;
    }
    unset($row);

    respond(200, $rows);
}

// ── 404 fallback ──────────────────────────────────────────────────────
respond(404, ['error' => "ບໍ່ພົບ resource '$resource'"]);
