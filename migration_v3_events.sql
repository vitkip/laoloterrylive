-- =================================================================
-- Lao Lottery Pro — Scheduled Cleanup Events
-- Generated: 2026-05-30
--
-- ⚠️  ຕ້ອງການ: MySQL SUPER privilege ແລະ event_scheduler = ON
--
-- ວິທີ enable event scheduler:
--   A) ຊົ່ວຄາວ (ຈົນ restart):
--      SET GLOBAL event_scheduler = ON;
--
--   B) ຖາວອນ — ເພີ່ມໃສ່ my.cnf / my.ini:
--      [mysqld]
--      event_scheduler = ON
--
--   C) XAMPP local: ແກ້ C:\xampp\mysql\bin\my.ini ຫຼື
--      /Applications/XAMPP/etc/my.cnf  ເພີ່ມ event_scheduler=ON
--      ແລ້ວ restart MySQL
--
--   D) cPanel shared hosting: event scheduler ມັກຖືກປິດໂດຍ host
--      ໃຫ້ໃຊ້ cPanel Cron Jobs ແທນ (ເບິ່ງ comment ລຸ່ມ)
-- =================================================================

USE lao_lottery_pro;

-- Enable event scheduler (requires SUPER privilege)
-- Uncomment only if running as root / admin user:
-- SET GLOBAL event_scheduler = ON;

-- -----------------------------------------------------------------
-- Auto-clean visitor_stats older than 90 days
-- -----------------------------------------------------------------
DROP EVENT IF EXISTS ev_cleanup_visitor_stats;
CREATE EVENT ev_cleanup_visitor_stats
    ON SCHEDULE EVERY 1 DAY
    STARTS CURRENT_TIMESTAMP
    COMMENT 'ລຶບ visitor_stats ເກົ່າກວ່າ 90 ວັນ'
    DO DELETE FROM visitor_stats WHERE visited_at < DATE_SUB(NOW(), INTERVAL 90 DAY);

-- -----------------------------------------------------------------
-- Auto-clean user_logs older than 180 days (keep 6-month audit trail)
-- -----------------------------------------------------------------
DROP EVENT IF EXISTS ev_cleanup_user_logs;
CREATE EVENT ev_cleanup_user_logs
    ON SCHEDULE EVERY 1 DAY
    STARTS CURRENT_TIMESTAMP
    COMMENT 'ລຶບ user_logs ເກົ່າກວ່າ 180 ວັນ'
    DO DELETE FROM user_logs WHERE created_at < DATE_SUB(NOW(), INTERVAL 180 DAY);

-- -----------------------------------------------------------------
-- Auto-clean expired OTPs older than 1 day
-- -----------------------------------------------------------------
DROP EVENT IF EXISTS ev_cleanup_expired_otps;
CREATE EVENT ev_cleanup_expired_otps
    ON SCHEDULE EVERY 1 HOUR
    STARTS CURRENT_TIMESTAMP
    COMMENT 'ລຶບ OTP ທີ່ໝົດອາຍຸ'
    DO DELETE FROM otp_codes WHERE expires_at < DATE_SUB(NOW(), INTERVAL 1 DAY);

-- -----------------------------------------------------------------
-- Auto-clean expired refresh tokens
-- -----------------------------------------------------------------
DROP EVENT IF EXISTS ev_cleanup_refresh_tokens;
CREATE EVENT ev_cleanup_refresh_tokens
    ON SCHEDULE EVERY 1 HOUR
    STARTS CURRENT_TIMESTAMP
    COMMENT 'ລຶບ refresh tokens ທີ່ໝົດອາຍຸ'
    DO DELETE FROM refresh_tokens WHERE expires_at < NOW();

-- -----------------------------------------------------------------
-- Auto-clean search history older than 30 days
-- -----------------------------------------------------------------
DROP EVENT IF EXISTS ev_cleanup_search_history;
CREATE EVENT ev_cleanup_search_history
    ON SCHEDULE EVERY 1 DAY
    STARTS CURRENT_TIMESTAMP
    COMMENT 'ລຶບ search_history ເກົ່າກວ່າ 30 ວັນ'
    DO DELETE FROM search_history WHERE searched_at < DATE_SUB(NOW(), INTERVAL 30 DAY);

-- =================================================================
-- ⚡ ທາງເລືອກ: cPanel Cron Job (ສຳລັບ shared hosting)
-- ຖ້າ event scheduler ໃຊ້ບໍ່ໄດ້ ໃຫ້ຕັ້ງ cron ໃນ cPanel:
--
--   ທຸກ 1 ວັນ (00:00):
--   mysql -u laolycfc_user -pPASSWORD laolycfc_lao_lottery_pro \
--     -e "DELETE FROM visitor_stats WHERE visited_at < DATE_SUB(NOW(), INTERVAL 90 DAY); \
--         DELETE FROM user_logs WHERE created_at < DATE_SUB(NOW(), INTERVAL 180 DAY); \
--         DELETE FROM search_history WHERE searched_at < DATE_SUB(NOW(), INTERVAL 30 DAY);"
--
--   ທຸກ 1 ຊົ່ວໂມງ:
--   mysql -u laolycfc_user -pPASSWORD laolycfc_lao_lottery_pro \
--     -e "DELETE FROM otp_codes WHERE expires_at < DATE_SUB(NOW(), INTERVAL 1 DAY); \
--         DELETE FROM refresh_tokens WHERE expires_at < NOW();"
-- =================================================================
