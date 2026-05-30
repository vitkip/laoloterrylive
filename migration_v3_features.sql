-- =================================================================
-- Lao Lottery Pro — New Features Migration v3
-- Generated: 2026-05-30
--
-- New tables for:
--   1.  user_favorite_numbers  — Favorite Numbers feature
--   2.  search_history         — Search History per user
--   3.  user_preferences       — User settings (theme, locale, notify)
--   4.  notifications          — Notification templates
--   5.  user_notifications     — Per-user notification inbox
--   6.  draw_subscriptions     — User subscribes to lottery type
--   7.  api_keys               — Public API key management
-- =================================================================

USE lao_lottery_pro;

-- =================================================================
-- 1. Favorite Numbers
--    Users can save up to 20 favourite 2-digit numbers
-- =================================================================

CREATE TABLE IF NOT EXISTS user_favorite_numbers (
    fav_id     INT          AUTO_INCREMENT PRIMARY KEY,
    user_id    INT          NOT NULL,
    number     CHAR(2)      NOT NULL,            -- "00"–"99"
    label      VARCHAR(100) NULL,                -- optional note e.g. "ເລກເກີດ"
    created_at TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    UNIQUE KEY uk_fav_user_number (user_id, number)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX IF NOT EXISTS idx_fav_user ON user_favorite_numbers(user_id);

-- =================================================================
-- 2. Search History
--    Stores user's number search queries for autocomplete & history
-- =================================================================

CREATE TABLE IF NOT EXISTS search_history (
    sh_id      INT          AUTO_INCREMENT PRIMARY KEY,
    user_id    INT          NOT NULL,
    query      VARCHAR(20)  NOT NULL,            -- searched number/string
    result_count INT        UNSIGNED DEFAULT 0,  -- how many results found
    searched_at  TIMESTAMP  DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX IF NOT EXISTS idx_sh_user_date  ON search_history(user_id, searched_at DESC);
CREATE INDEX IF NOT EXISTS idx_sh_query      ON search_history(query(10));

-- =================================================================
-- 3. User Preferences
--    Key-value store per user for UI preferences
-- =================================================================

CREATE TABLE IF NOT EXISTS user_preferences (
    pref_id    INT          AUTO_INCREMENT PRIMARY KEY,
    user_id    INT          NOT NULL,
    pref_key   VARCHAR(60)  NOT NULL,
    pref_value TEXT         NOT NULL,
    updated_at TIMESTAMP    DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    UNIQUE KEY uk_pref_user_key (user_id, pref_key)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Seed default preference keys (documentation purposes only)
-- Actual rows created on first user login:
--   theme             : 'system' | 'dark' | 'light'
--   locale            : 'lo' | 'en' | 'th'
--   notify_new_draw   : '1' | '0'
--   notify_email      : '1' | '0'
--   default_type_id   : '1' | '2' | 'all'

-- =================================================================
-- 4. Notification Templates
--    Admin creates notification templates (e.g. "New draw published")
-- =================================================================

CREATE TABLE IF NOT EXISTS notifications (
    notif_id   INT          AUTO_INCREMENT PRIMARY KEY,
    type       ENUM(
                 'new_draw',        -- new lottery result
                 'system',          -- system announcement
                 'promo',           -- promotion / marketing
                 'account'          -- account-level (e.g. password changed)
               ) NOT NULL DEFAULT 'system',
    title      VARCHAR(200) NOT NULL,
    body       TEXT         NOT NULL,
    icon       VARCHAR(100) NULL DEFAULT 'notifications',  -- material icon name
    action_url VARCHAR(500) NULL,                          -- link when clicked
    draw_id    INT          NULL,                          -- if type = new_draw
    created_by INT          NULL,
    created_at TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (draw_id)    REFERENCES lottery_draws(draw_id) ON DELETE SET NULL,
    FOREIGN KEY (created_by) REFERENCES users(user_id)         ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX IF NOT EXISTS idx_notif_type_date ON notifications(type, created_at DESC);

-- =================================================================
-- 5. User Notification Inbox
--    Each user gets a copy of relevant notifications
-- =================================================================

CREATE TABLE IF NOT EXISTS user_notifications (
    un_id      INT          AUTO_INCREMENT PRIMARY KEY,
    user_id    INT          NOT NULL,
    notif_id   INT          NOT NULL,
    is_read    TINYINT(1)   NOT NULL DEFAULT 0,
    read_at    DATETIME     NULL,
    created_at TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id)  REFERENCES users(user_id)   ON DELETE CASCADE,
    FOREIGN KEY (notif_id) REFERENCES notifications(notif_id) ON DELETE CASCADE,
    UNIQUE KEY uk_un_user_notif (user_id, notif_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX IF NOT EXISTS idx_un_user_unread ON user_notifications(user_id, is_read);
CREATE INDEX IF NOT EXISTS idx_un_user_date   ON user_notifications(user_id, created_at DESC);

-- =================================================================
-- 6. Draw Subscriptions
--    Users subscribe to specific lottery types to receive
--    auto-notifications when a new draw is published.
-- =================================================================

CREATE TABLE IF NOT EXISTS draw_subscriptions (
    sub_id     INT          AUTO_INCREMENT PRIMARY KEY,
    user_id    INT          NOT NULL,
    type_id    INT          NOT NULL,       -- NULL = all types
    created_at TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id)          ON DELETE CASCADE,
    FOREIGN KEY (type_id) REFERENCES lottery_types(type_id)  ON DELETE CASCADE,
    UNIQUE KEY uk_sub_user_type (user_id, type_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =================================================================
-- 7. Public API Keys
--    External developers can request API keys to access public data
-- =================================================================

CREATE TABLE IF NOT EXISTS api_keys (
    key_id       INT          AUTO_INCREMENT PRIMARY KEY,
    user_id      INT          NOT NULL,
    key_hash     VARCHAR(64)  NOT NULL,       -- SHA-256 of the raw key
    key_prefix   CHAR(8)      NOT NULL,       -- First 8 chars for display: "lll_xxxx"
    label        VARCHAR(100) NULL,           -- "My App", "Bot v2", etc.
    scopes       SET('read_draws','read_types','read_animals') DEFAULT 'read_draws',
    rate_limit   INT          UNSIGNED DEFAULT 1000,  -- requests per day
    is_active    TINYINT(1)   NOT NULL DEFAULT 1,
    last_used_at DATETIME     NULL,
    created_at   TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
    expires_at   DATETIME     NULL,           -- NULL = never expires
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE UNIQUE INDEX IF NOT EXISTS uk_apikey_hash   ON api_keys(key_hash);
CREATE INDEX        IF NOT EXISTS idx_apikey_prefix ON api_keys(key_prefix);
CREATE INDEX        IF NOT EXISTS idx_apikey_user   ON api_keys(user_id);

-- =================================================================
-- 8. API Usage Log (for public API rate limiting & analytics)
-- =================================================================

CREATE TABLE IF NOT EXISTS api_usage_log (
    usage_id   INT          AUTO_INCREMENT PRIMARY KEY,
    key_id     INT          NOT NULL,
    endpoint   VARCHAR(100) NOT NULL,
    ip_address VARCHAR(45)  NULL,
    status_code SMALLINT    UNSIGNED DEFAULT 200,
    called_at  TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (key_id) REFERENCES api_keys(key_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX IF NOT EXISTS idx_alu_key_date ON api_usage_log(key_id, called_at DESC);

-- =================================================================
-- 9. Data Maintenance Events
--    ⚠️  EVENTS ຖືກຍ້າຍໄປໃສ່ migration_v3_events.sql ແລ້ວ
--    ເພາະຕ້ອງການ privilege SUPER ແລະ event_scheduler = ON
--    ໃຫ້ run ແຍກຕ່າງຫາກໃນ environment ທີ່ຮອງຮັບ (VPS ຫຼື root MySQL)
-- =================================================================

