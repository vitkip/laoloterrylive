<?php
/**
 * One-time migration: fix FK constraints blocking user deletion.
 * Run once on production, then DELETE this file immediately.
 * Access: https://laolots.com/api/migrate_fk_fix.php?key=run_fk_fix_2026
 */

if (($_GET['key'] ?? '') !== 'run_fk_fix_2026') {
    http_response_code(403);
    die(json_encode(['error' => 'Forbidden']));
}

require_once __DIR__ . '/config.php';
$conn = new mysqli(DB_HOST, DB_USER, DB_PASS, DB_NAME);
if ($conn->connect_error) {
    http_response_code(500);
    die(json_encode(['error' => 'DB connect failed: ' . $conn->connect_error]));
}

$results = [];

$migrations = [
    'user_logs FK → SET NULL' => [
        "ALTER TABLE user_logs DROP FOREIGN KEY user_logs_ibfk_1",
        "ALTER TABLE user_logs ADD CONSTRAINT user_logs_ibfk_1 FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE SET NULL",
    ],
    'lottery_draws FK → SET NULL' => [
        "ALTER TABLE lottery_draws DROP FOREIGN KEY lottery_draws_ibfk_2",
        "ALTER TABLE lottery_draws ADD CONSTRAINT lottery_draws_ibfk_2 FOREIGN KEY (created_by) REFERENCES users(user_id) ON DELETE SET NULL",
    ],
];

foreach ($migrations as $label => $sqls) {
    foreach ($sqls as $sql) {
        if ($conn->query($sql)) {
            $results[] = ['sql' => $sql, 'status' => 'OK'];
        } else {
            $results[] = ['sql' => $sql, 'status' => 'ERROR', 'error' => $conn->error];
        }
    }
}

// Verify final state
$verify = $conn->query("
    SELECT kcu.TABLE_NAME, kcu.COLUMN_NAME, rc.DELETE_RULE
    FROM information_schema.REFERENTIAL_CONSTRAINTS rc
    JOIN information_schema.KEY_COLUMN_USAGE kcu
        ON rc.CONSTRAINT_NAME = kcu.CONSTRAINT_NAME AND rc.CONSTRAINT_SCHEMA = kcu.TABLE_SCHEMA
    WHERE kcu.REFERENCED_TABLE_NAME = 'users'
    AND rc.CONSTRAINT_SCHEMA = DATABASE()
");
$fk_state = [];
while ($row = $verify->fetch_assoc()) {
    $fk_state[] = $row;
}

$conn->close();

header('Content-Type: application/json');
echo json_encode([
    'migrations' => $results,
    'fk_state'   => $fk_state,
    'note'       => 'DELETE this file from server after running!',
], JSON_PRETTY_PRINT);
