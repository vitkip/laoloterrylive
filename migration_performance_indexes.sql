-- =================================================================
-- Migration: Performance Indexes + Query Optimization Fixes
-- Date: 2026-05-22
-- Database: lao_lottery_pro (local) / laolycfc_lao_lottery_pro (prod)
-- Run once on both environments via phpMyAdmin / cPanel SQL tab
-- =================================================================

-- 1. visitor_stats — enable indexes that were commented out in original schema
--    These are critical: table grows by 1 row per pageview
ALTER TABLE visitor_stats
    ADD INDEX IF NOT EXISTS idx_vs_visited_at   (visited_at),
    ADD INDEX IF NOT EXISTS idx_vs_session_id   (session_id(32)),
    ADD INDEX IF NOT EXISTS idx_vs_page_visits  (page_path(100), visited_at);

-- 2. user_logs — composite index for action filter + date sort
--    Fixes slow search in user_logs_list action
ALTER TABLE user_logs
    ADD INDEX IF NOT EXISTS idx_ul_action_date  (action(50), created_at),
    ADD INDEX IF NOT EXISTS idx_ul_uid_action   (user_id, action(50), created_at);

-- 3. lottery_draws — composite index for ORDER BY (draw_date, draw_number)
--    Eliminates filesort in draws query (most-called endpoint)
ALTER TABLE lottery_draws
    ADD INDEX IF NOT EXISTS idx_ld_date_num     (draw_date DESC, draw_number DESC);

-- 4. lottery_types — enforce uniqueness at DB level
--    Prevents race condition when two concurrent create_type requests slip past PHP check
ALTER TABLE lottery_types
    ADD UNIQUE INDEX IF NOT EXISTS idx_lt_name_unique (type_name);

-- 5. draw_results_detail — covering index for JOIN + prize_type filter
--    Helps statistics queries that filter by prize_type
ALTER TABLE draw_results_detail
    ADD INDEX IF NOT EXISTS idx_drd_draw_prize  (draw_id, prize_type);

-- 6. users — composite index for role+is_active (admin count checks)
ALTER TABLE users
    ADD INDEX IF NOT EXISTS idx_u_role_active   (role, is_active);

-- 7. Add youtube_url column to lottery_draws if missing
--    (code references this column but it may not exist in older installs)
ALTER TABLE lottery_draws
    ADD COLUMN IF NOT EXISTS youtube_url VARCHAR(500) NULL AFTER status;

-- 8. system_settings — unique key on setting_key (required for ON DUPLICATE KEY UPDATE)
ALTER TABLE system_settings
    ADD UNIQUE INDEX IF NOT EXISTS idx_ss_key   (setting_key);

-- =================================================================
-- VERIFY: Run SHOW INDEX FROM <table> to confirm indexes were added
-- =================================================================
-- SHOW INDEX FROM visitor_stats;
-- SHOW INDEX FROM user_logs;
-- SHOW INDEX FROM lottery_draws;
-- SHOW INDEX FROM draw_results_detail;
-- SHOW INDEX FROM users;
-- SHOW INDEX FROM lottery_types;
