-- =================================================================
-- Lao Lottery Pro — Security Migration v2
-- Generated: 2026-05-30
-- Run this BEFORE deploying to production.
--
-- Changes:
--   1. OTP: rename otp_code → otp_code_hash (store SHA-256)
--   2. Password Resets: rename token → token_hash
--   3. Email Verifications: rename token → token_hash
--   4. Users: add UNIQUE constraint on email
--   5. Users: add UNIQUE constraint on phone_number (nullable unique)
--   6. Users: add email_verified_at column
--   7. Users: add deleted_at column (soft delete)
--   8. refresh_tokens table (Refresh Token support)
--   9. rate_limit_store table (fast in-DB rate limiting)
--  10. Additional performance indexes
--
-- IMPORTANT: Back up the database BEFORE running this script.
--   mysqldump -u root lao_lottery_pro > backup_before_v2.sql
-- =================================================================

USE lao_lottery_pro;

-- =================================================================
-- 1. OTP: Store hash instead of plaintext
--    STEP 1: Add new column
--    STEP 2: Populate hash for any existing unused rows (optional)
--    STEP 3: Drop old column
-- =================================================================

-- Add hash column first (allows zero-downtime migration if needed)
ALTER TABLE otp_codes
    ADD COLUMN otp_code_hash VARCHAR(64) NOT NULL DEFAULT '' AFTER otp_id;

-- Backfill existing rows: SHA2 of existing plaintext OTP
-- (These rows are likely already expired — this is a safety measure)
UPDATE otp_codes
    SET otp_code_hash = SHA2(otp_code, 256)
    WHERE otp_code_hash = '' AND otp_code IS NOT NULL;

-- Drop old plaintext column
ALTER TABLE otp_codes DROP COLUMN otp_code;

-- =================================================================
-- 2. Password Resets: Store hash instead of plaintext
-- =================================================================

ALTER TABLE password_resets
    ADD COLUMN token_hash VARCHAR(64) NOT NULL DEFAULT '' AFTER reset_id;

UPDATE password_resets
    SET token_hash = SHA2(token, 256)
    WHERE token_hash = '' AND token IS NOT NULL;

ALTER TABLE password_resets DROP COLUMN token;

-- Update index to use new column name
DROP INDEX IF EXISTS idx_pr_token ON password_resets;
CREATE INDEX IF NOT EXISTS idx_pr_token_hash ON password_resets(token_hash);

-- =================================================================
-- 3. Email Verifications: Store hash instead of plaintext
-- =================================================================

ALTER TABLE email_verifications
    ADD COLUMN token_hash VARCHAR(64) NOT NULL DEFAULT '' AFTER verification_id;

UPDATE email_verifications
    SET token_hash = SHA2(token, 256)
    WHERE token_hash = '' AND token IS NOT NULL;

ALTER TABLE email_verifications DROP COLUMN token;

-- Update index
DROP INDEX IF EXISTS idx_ev_token ON email_verifications;
CREATE INDEX IF NOT EXISTS idx_ev_token_hash ON email_verifications(token_hash);

-- =================================================================
-- 4 & 5. Users: UNIQUE constraints on email & phone_number
--
-- NOTE: If there are already duplicate emails/phones in the DB,
--       this ALTER will FAIL. Clean duplicates first:
--
--   -- Find duplicates:
--   SELECT email, COUNT(*) c FROM users GROUP BY email HAVING c > 1;
--   SELECT phone_number, COUNT(*) c FROM users GROUP BY phone_number HAVING c > 1;
-- =================================================================

-- Email must be unique (non-NULL only — allow NULLs to be non-unique)
-- MySQL treats multiple NULLs as distinct for UNIQUE indexes
ALTER TABLE users
    MODIFY COLUMN email VARCHAR(100) DEFAULT NULL,
    ADD CONSTRAINT uk_users_email UNIQUE (email);

-- Phone: unique but nullable (users may not have a phone)
ALTER TABLE users
    MODIFY COLUMN phone_number VARCHAR(20) DEFAULT NULL;

-- Partial unique index: unique only when phone_number is NOT NULL
-- MySQL does not support filtered indexes natively.
-- We use a UNIQUE index — MySQL allows multiple NULLs in a UNIQUE column.
CREATE UNIQUE INDEX IF NOT EXISTS uk_users_phone
    ON users(phone_number);

-- =================================================================
-- 6. Users: Add email_verified_at tracking column
-- =================================================================

ALTER TABLE users
    ADD COLUMN email_verified_at DATETIME NULL DEFAULT NULL
        AFTER is_active;

-- =================================================================
-- 7. Users: Soft-delete support
-- =================================================================

ALTER TABLE users
    ADD COLUMN deleted_at DATETIME NULL DEFAULT NULL
        AFTER updated_at;

CREATE INDEX IF NOT EXISTS idx_u_deleted ON users(deleted_at);

-- =================================================================
-- 8. Refresh Tokens table
--    Access token:  15 minutes (JWT exp = now + 900)
--    Refresh token: 7 days (stored hashed in this table)
-- =================================================================

CREATE TABLE IF NOT EXISTS refresh_tokens (
    rt_id        INT          AUTO_INCREMENT PRIMARY KEY,
    user_id      INT          NOT NULL,
    token_hash   VARCHAR(64)  NOT NULL,   -- SHA-256 of the raw token
    issued_at    TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
    expires_at   DATETIME     NOT NULL,
    revoked_at   DATETIME     NULL,
    ip_address   VARCHAR(45)  NULL,
    user_agent   VARCHAR(255) NULL,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE UNIQUE INDEX IF NOT EXISTS uk_rt_token_hash ON refresh_tokens(token_hash);
CREATE INDEX        IF NOT EXISTS idx_rt_user_id    ON refresh_tokens(user_id);
CREATE INDEX        IF NOT EXISTS idx_rt_expires    ON refresh_tokens(expires_at);

-- =================================================================
-- 9. Rate Limit Store (fast in-DB rate limiting)
--    Replaces the slow user_logs COUNT(*) approach for hot paths
--    like login, register, OTP resend.
--    Key: "{action}:{ip}" | "{action}:{user_id}"
-- =================================================================

CREATE TABLE IF NOT EXISTS rate_limits (
    rl_id      INT          AUTO_INCREMENT PRIMARY KEY,
    rl_key     VARCHAR(120) NOT NULL,   -- e.g. "login:192.168.1.1"
    hits       INT          UNSIGNED DEFAULT 1,
    window_start TIMESTAMP  DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uk_rl_key (rl_key)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Event to clean up expired rate limit windows every 5 minutes
-- (Requires event_scheduler = ON)
-- CREATE EVENT IF NOT EXISTS ev_cleanup_rate_limits
--     ON SCHEDULE EVERY 5 MINUTE
--     DO DELETE FROM rate_limits WHERE window_start < DATE_SUB(NOW(), INTERVAL 30 MINUTE);

-- =================================================================
-- 10. Additional performance indexes
-- =================================================================

-- Rate-limit query in auth.php: action + ip + created_at — needs composite
-- Current index idx_ul_action_date covers (action, created_at) which is good.
-- Add ip_address to help further:
CREATE INDEX IF NOT EXISTS idx_ul_ip_action_date
    ON user_logs(ip_address, action(50), created_at);

-- Refresh token cleanup by expiry
-- Already covered by idx_rt_expires above.

-- Users: lookup by email (for login-by-email future feature)
CREATE INDEX IF NOT EXISTS idx_u_email ON users(email);

-- =================================================================
-- Verification: expected final state
-- =================================================================
-- otp_codes:            otp_code_hash  VARCHAR(64) NOT NULL
-- password_resets:      token_hash     VARCHAR(64) NOT NULL
-- email_verifications:  token_hash     VARCHAR(64) NOT NULL
-- users:                UNIQUE(email), UNIQUE(phone_number)
--                       email_verified_at DATETIME NULL
--                       deleted_at        DATETIME NULL
-- refresh_tokens:       NEW TABLE
-- rate_limits:          NEW TABLE
-- =================================================================
