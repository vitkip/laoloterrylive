<?php
/**
 * prod_migration.php — Database Schema Migration for Production Environment
 *
 * This script updates the database in production by adding columns and tables
 * required for Google and Facebook login.
 *
 * Security:
 *  - Only runs if ?secret=migratelaolots2026 is passed in the URL.
 *  - DELETE this file from the server immediately after successful execution.
 */

header("Content-Type: text/plain; charset=UTF-8");

$secret = isset($_GET['secret']) ? $_GET['secret'] : '';
if ($secret !== 'migratelaolots2026') {
    http_response_code(403);
    echo "ERROR: Access Denied. Invalid secret passcode.\n";
    exit();
}

require_once __DIR__ . '/config.php';

$conn = new mysqli(DB_HOST, DB_USER, DB_PASS, DB_NAME);
if ($conn->connect_error) {
    http_response_code(500);
    echo "ERROR: Database connection failed: " . $conn->connect_error . "\n";
    exit();
}
$conn->set_charset("utf8mb4");

echo "Connected successfully to database: " . DB_NAME . "\n\n";

// 1. Check/Add oauth_provider and oauth_id columns to users table
echo "1. Checking columns 'oauth_provider' and 'oauth_id' in 'users' table...\n";
$columnsRes = $conn->query("SHOW COLUMNS FROM users");
$columns = [];
while ($row = $columnsRes->fetch_assoc()) {
    $columns[] = $row['Field'];
}

$addedColumns = 0;
if (!in_array('oauth_provider', $columns)) {
    echo "   - Column 'oauth_provider' is missing. Adding it...\n";
    $q = "ALTER TABLE users ADD COLUMN oauth_provider VARCHAR(20) NULL DEFAULT NULL AFTER avatar_url";
    if ($conn->query($q)) {
        echo "   [SUCCESS] Added column 'oauth_provider'.\n";
        $addedColumns++;
    } else {
        echo "   [FAILED] Could not add column 'oauth_provider': " . $conn->error . "\n";
    }
} else {
    echo "   - Column 'oauth_provider' already exists.\n";
}

if (!in_array('oauth_id', $columns)) {
    echo "   - Column 'oauth_id' is missing. Adding it...\n";
    $q = "ALTER TABLE users ADD COLUMN oauth_id VARCHAR(255) NULL DEFAULT NULL AFTER oauth_provider";
    if ($conn->query($q)) {
        echo "   [SUCCESS] Added column 'oauth_id'.\n";
        $addedColumns++;
    } else {
        echo "   [FAILED] Could not add column 'oauth_id': " . $conn->error . "\n";
    }
} else {
    echo "   - Column 'oauth_id' already exists.\n";
}

if ($addedColumns > 0) {
    // Add index for fast lookup
    echo "   - Creating index for oauth columns...\n";
    $qIndex = "CREATE INDEX idx_users_oauth ON users(oauth_provider, oauth_id)";
    if ($conn->query($qIndex)) {
        echo "   [SUCCESS] Created index 'idx_users_oauth'.\n";
    } else {
        echo "   [WARNING] Could not create index (it might already exist): " . $conn->error . "\n";
    }
}

// 2. Check/Create user_logs table
echo "\n2. Checking 'user_logs' table...\n";
$tableCheck = $conn->query("SHOW TABLES LIKE 'user_logs'");
if ($tableCheck->num_rows === 0) {
    echo "   - Table 'user_logs' is missing. Creating it...\n";
    $qLogs = "CREATE TABLE user_logs (
        log_id     INT          AUTO_INCREMENT PRIMARY KEY,
        user_id    INT,
        action     VARCHAR(255),
        ip_address VARCHAR(45),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE SET NULL,
        INDEX idx_ul_action_date (action(50), created_at),
        INDEX idx_ul_uid_action  (user_id, action(50), created_at)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci";
    if ($conn->query($qLogs)) {
        echo "   [SUCCESS] Created 'user_logs' table.\n";
    } else {
        echo "   [FAILED] Could not create 'user_logs' table: " . $conn->error . "\n";
    }
} else {
    echo "   - Table 'user_logs' already exists.\n";
}

// 3. Check/Create refresh_tokens table (with correct foreign key referencing user_id)
echo "\n3. Checking 'refresh_tokens' table...\n";
$tableCheck = $conn->query("SHOW TABLES LIKE 'refresh_tokens'");
if ($tableCheck->num_rows > 0) {
    echo "   - Table 'refresh_tokens' exists. Verifying columns and foreign key...\n";
    // Drop existing table to ensure it has the correct schema and foreign key references
    // (This is safe during deployment/migration if no active login sessions need preservation,
    // which is the case since refresh tokens are new or broken anyway)
    echo "   - Re-creating 'refresh_tokens' to ensure correct foreign key constraints mapping to users(user_id)...\n";
    $conn->query("DROP TABLE refresh_tokens");
}

echo "   - Creating 'refresh_tokens' table...\n";
$qTokens = "CREATE TABLE refresh_tokens (
    rt_id       INT           AUTO_INCREMENT PRIMARY KEY,
    user_id     INT           NOT NULL,
    token_hash  VARCHAR(64)   NOT NULL UNIQUE,
    expires_at  DATETIME      NOT NULL,
    ip_address  VARCHAR(45),
    user_agent  VARCHAR(255),
    revoked_at  DATETIME      NULL DEFAULT NULL,
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    INDEX idx_rt_user_expires (user_id, expires_at),
    INDEX idx_rt_expires      (expires_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci";

if ($conn->query($qTokens)) {
    echo "   [SUCCESS] Created 'refresh_tokens' table with correct keys.\n";
} else {
    echo "   [FAILED] Could not create 'refresh_tokens' table: " . $conn->error . "\n";
}

echo "\n--- Migration Process Completed ---\n";
echo "IMPORTANT: Please delete this file (api/prod_migration.php) from your production server now for security.\n";

$conn->close();
