-- =================================================================
-- Lao Lottery Pro — Full Schema (Single File)
-- Generated: 2026-05-29
-- Merges: lao_lottery_pro.sql + migration_lottery_types.sql
--       + migration_performance_indexes.sql + migration_registration.sql
--
-- Changes vs. originals:
--   • visitor_stats   — table was MISSING; derived from API usage (added)
--   • system_settings — table was MISSING; derived from API usage (added)
--   • lottery_types   — schedule / color / is_active added inline
--   • lottery_draws   — youtube_url added inline
--   • idx_drd_draw_id dropped (redundant; covered by idx_drd_draw_prize)
--   • All indexes consolidated; IF NOT EXISTS used throughout
--   • system_settings seeded with default live-settings rows
-- =================================================================

CREATE DATABASE IF NOT EXISTS lao_lottery_pro
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE lao_lottery_pro;

-- =================================================================
-- CORE TABLES  (FK-safe creation order)
-- =================================================================

-- ── 1. Users ──────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
    user_id       INT          AUTO_INCREMENT PRIMARY KEY,
    username      VARCHAR(50)  NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    full_name     VARCHAR(100),
    role          ENUM('admin','staff','member') DEFAULT 'member',
    email         VARCHAR(100),
    phone_number  VARCHAR(20),
    is_active     BOOLEAN DEFAULT TRUE,
    created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ── 2. Animals (static reference — 40 species) ───────────────────
CREATE TABLE IF NOT EXISTS animals (
    animal_id        INT          PRIMARY KEY,   -- 1–40
    animal_name_lao  VARCHAR(50)  NOT NULL,
    animal_numbers   TEXT         NOT NULL,       -- e.g. "01,41,81"
    image_url        VARCHAR(255),
    category         VARCHAR(50)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ── 3. Lottery Types ──────────────────────────────────────────────
--    Includes columns added by migration_lottery_types.sql:
--    schedule, color, is_active
CREATE TABLE IF NOT EXISTS lottery_types (
    type_id    INT          AUTO_INCREMENT PRIMARY KEY,
    type_name  VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    schedule   VARCHAR(100) NOT NULL DEFAULT '',
    color      VARCHAR(20)  NOT NULL DEFAULT '#003fb1',
    is_active  TINYINT(1)   NOT NULL DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ── 4. System Settings ────────────────────────────────────────────
--    Was MISSING from all SQL files; required by live_settings /
--    update_live_settings API actions.
CREATE TABLE IF NOT EXISTS system_settings (
    setting_id    INT          AUTO_INCREMENT PRIMARY KEY,
    setting_key   VARCHAR(100) NOT NULL UNIQUE,
    setting_value TEXT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ── 5. Visitor Stats ─────────────────────────────────────────────
--    Was MISSING from all SQL files; required by track_visit /
--    visitor_stats API actions.
CREATE TABLE IF NOT EXISTS visitor_stats (
    stat_id    INT           AUTO_INCREMENT PRIMARY KEY,
    ip_address VARCHAR(45),
    page_path  VARCHAR(255),
    user_agent VARCHAR(500),
    session_id VARCHAR(64),
    visited_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ── 6. Lottery Draws ─────────────────────────────────────────────
--    Includes youtube_url added by migration_performance_indexes.sql
CREATE TABLE IF NOT EXISTS lottery_draws (
    draw_id     INT           AUTO_INCREMENT PRIMARY KEY,
    type_id     INT,
    draw_number INT           NOT NULL,
    draw_date   DATE          NOT NULL,
    full_result VARCHAR(6),
    status      ENUM('pending','published') DEFAULT 'pending',
    created_by  INT,
    youtube_url VARCHAR(500)  NULL,
    FOREIGN KEY (type_id)    REFERENCES lottery_types(type_id),
    FOREIGN KEY (created_by) REFERENCES users(user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ── 7. Draw Results Detail ───────────────────────────────────────
CREATE TABLE IF NOT EXISTS draw_results_detail (
    detail_id    INT AUTO_INCREMENT PRIMARY KEY,
    draw_id      INT,
    prize_type   ENUM('6_digits','5_digits','4_digits','3_digits','2_digits') NOT NULL,
    result_value VARCHAR(6) NOT NULL,
    animal_id    INT NULL,
    FOREIGN KEY (draw_id)   REFERENCES lottery_draws(draw_id) ON DELETE CASCADE,
    FOREIGN KEY (animal_id) REFERENCES animals(animal_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ── 8. User Logs ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS user_logs (
    log_id     INT          AUTO_INCREMENT PRIMARY KEY,
    user_id    INT,
    action     VARCHAR(255),
    ip_address VARCHAR(45),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =================================================================
-- REGISTRATION / AUTH TABLES  (from migration_registration.sql)
-- =================================================================

-- ── 9. Email Verifications ───────────────────────────────────────
CREATE TABLE IF NOT EXISTS email_verifications (
    verification_id INT          AUTO_INCREMENT PRIMARY KEY,
    user_id         INT          NOT NULL,
    token           VARCHAR(255) NOT NULL,
    expires_at      DATETIME     NOT NULL,
    verified_at     DATETIME     NULL,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ── 10. Password Resets ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS password_resets (
    reset_id   INT          AUTO_INCREMENT PRIMARY KEY,
    user_id    INT          NOT NULL,
    token      VARCHAR(255) NOT NULL,
    expires_at DATETIME     NOT NULL,
    used_at    DATETIME     NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ── 11. OTP Codes ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS otp_codes (
    otp_id        INT          AUTO_INCREMENT PRIMARY KEY,
    user_id       INT          NOT NULL,
    otp_code      VARCHAR(10)  NOT NULL,
    purpose       ENUM('register','login','reset_password') NOT NULL,
    expires_at    DATETIME     NOT NULL,
    used_at       DATETIME     NULL,
    attempt_count TINYINT UNSIGNED DEFAULT 0,
    created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ── 12. Refresh Tokens ───────────────────────────────────────────
--    Used by auth.php: issueRefreshToken() + rotate on refresh.
--    Stores SHA-256 hash of raw token (raw token sent to client only).
--    Token rotation: old token revoked_at set, new token issued.
CREATE TABLE IF NOT EXISTS refresh_tokens (
    rt_id       INT           AUTO_INCREMENT PRIMARY KEY,
    user_id     INT           NOT NULL,
    token_hash  VARCHAR(64)   NOT NULL UNIQUE,   -- SHA-256 hex (64 chars)
    expires_at  DATETIME      NOT NULL,
    ip_address  VARCHAR(45),
    user_agent  VARCHAR(255),
    revoked_at  DATETIME      NULL DEFAULT NULL,  -- NULL = active
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =================================================================
-- INDEXES  (all consolidated; duplicates removed)
-- =================================================================

-- lottery_draws
CREATE INDEX IF NOT EXISTS idx_draw_date     ON lottery_draws(draw_date);
CREATE INDEX IF NOT EXISTS idx_ld_type_date  ON lottery_draws(type_id, draw_date DESC);
CREATE INDEX IF NOT EXISTS idx_ld_status_date ON lottery_draws(status, draw_date DESC);
CREATE INDEX IF NOT EXISTS idx_ld_date_num   ON lottery_draws(draw_date DESC, draw_number DESC);

-- draw_results_detail
--   idx_drd_draw_id (draw_id) DROPPED — covered by idx_drd_draw_prize(draw_id, prize_type)
CREATE INDEX IF NOT EXISTS idx_result_value   ON draw_results_detail(result_value);
CREATE INDEX IF NOT EXISTS idx_drd_draw_prize ON draw_results_detail(draw_id, prize_type);

-- user_logs
CREATE INDEX IF NOT EXISTS idx_ul_action_date ON user_logs(action(50), created_at);
CREATE INDEX IF NOT EXISTS idx_ul_uid_action  ON user_logs(user_id, action(50), created_at);

-- users
CREATE INDEX IF NOT EXISTS idx_u_role_active  ON users(role, is_active);

-- visitor_stats
CREATE INDEX IF NOT EXISTS idx_vs_visited_at  ON visitor_stats(visited_at);
CREATE INDEX IF NOT EXISTS idx_vs_session_id  ON visitor_stats(session_id(32));
CREATE INDEX IF NOT EXISTS idx_vs_page_visits ON visitor_stats(page_path(100), visited_at);

-- email_verifications / password_resets / otp_codes / refresh_tokens
CREATE INDEX IF NOT EXISTS idx_ev_token  ON email_verifications(token);
CREATE INDEX IF NOT EXISTS idx_ev_user   ON email_verifications(user_id);
CREATE INDEX IF NOT EXISTS idx_pr_token  ON password_resets(token);
CREATE INDEX IF NOT EXISTS idx_pr_user   ON password_resets(user_id);
CREATE INDEX IF NOT EXISTS idx_otp_user_purpose ON otp_codes(user_id, purpose);
-- refresh_tokens: token_hash is UNIQUE (fast lookup); compound for cleanup queries
CREATE INDEX IF NOT EXISTS idx_rt_user_expires ON refresh_tokens(user_id, expires_at);
CREATE INDEX IF NOT EXISTS idx_rt_expires      ON refresh_tokens(expires_at);

-- =================================================================
-- SEED DATA
-- =================================================================

-- Default live-settings rows required by live_settings API action
-- (ON DUPLICATE KEY UPDATE is a no-op to keep existing values safe)
INSERT INTO system_settings (setting_key, setting_value) VALUES
    ('youtube_live_url', ''),
    ('is_live',          '0'),
    ('live_source',      'youtube')
ON DUPLICATE KEY UPDATE setting_value = setting_value;
