-- =====================================================================
-- ການແທງເດີມພັນ (demo) ຫວຍ "ປູປາເຕົ້າມະຫາໂຊກ" — puplatao_bets
--
--   ຕິດຕາມ ກຳໄລ-ຂາດທຶນສະສົມ ຂອງ 2 ສູດ:
--     · predict_pair — ຄູ່ລູກ ງວດຖັດໄປ   (ຊະນະ ເມື່ອ ອອກ "ທັງສອງລູກ")
--     · avoid_pair   — ຄູ່ລູກ ທີ່ຄວນຫຼີກ (ຊະນະ ເມື່ອ "ບໍ່ອອກທັງສອງລູກ")
--
--   ໃຊ້ເງິນ demo ຮ່ວມກະເປົາດຽວກັບ ຫວຍພັດທະນາ (wallets / wallet_transactions
--   ຈາກ schema_betting.sql) — ບໍ່ມີເງິນຈິງ ແລະ ບໍ່ມີ payment gateway.
--
-- Database: lao_lottery_pro
-- Run once: mysql -u root lao_lottery_pro < schema_puplatao_bets.sql
-- Depends on: users (schema.sql) · wallets, wallet_transactions (schema_betting.sql)
--             puplatao_symbols, puplatao_draws, puplatao_draw_results (schema_puplatao.sql)
-- =====================================================================

USE lao_lottery_pro;

-- ---------------------------------------------------------------------
-- 0. ແຍກແຫຼ່ງທີ່ມາຂອງ ref_bet_id ໃນບັນຊີກະເປົາ
--    wallet_transactions.ref_bet_id ເດີມຊີ້ໄປຫາ bets (ຫວຍພັດທະນາ) ຢ່າງດຽວ.
--    ຕອນນີ້ puplatao_bets ໃຊ້ກະເປົາອັນດຽວກັນ ຈຶ່ງຕ້ອງມີຄໍລຳບອກວ່າ id ນັ້ນ
--    ເປັນຂອງຕາຕະລາງໃດ. ແຖວເກົ່າທັງໝົດ = 'huay' ຕາມຄ່າ default.
-- ---------------------------------------------------------------------
ALTER TABLE wallet_transactions
  ADD COLUMN IF NOT EXISTS ref_source ENUM('huay','puplatao') NOT NULL DEFAULT 'huay'
  AFTER ref_bet_id;

-- ---------------------------------------------------------------------
-- 1. ອັດຕາຈ່າຍ ຕໍ່ປະເພດການແທງ (admin ປັບໄດ້)
--
--    ໂອກາດຕາມທິດສະດີ (6 ລູກ · 3 ໜ່ວຍ/ງວດ · ອິດສະຫຼະ):
--      predict_pair  P(ອອກທັງ a ແລະ b) = 1 − 2(5/6)³ + (4/6)³ ≈ 13.89%  → fair 7.20×
--      avoid_pair    P(ບໍ່ອອກທັງສອງ)   = (4/6)³            ≈ 29.63%  → fair 3.375×
--
--    ອັດຕາຈ່າຍຈິງ = 6× ທັງສອງສູດ ຕາມທີ່ເຈົ້າຂອງເກມກຳນົດ:
--      predict_pair 6× — ແທງ 1,000 ຖືກແລ້ວໄດ້ຄືນ 6,000 ກີບ (ກຳໄລ 5,000)
--      avoid_pair   6× — ແທງ 1,000 ຖືກແລ້ວໄດ້ຄືນ 6,000 ກີບ (ກຳໄລ 5,000)
--
--    ⚠ ໝາຍເຫດ: predict_pair 6× ຕ່ຳກວ່າ fair 7.20× (ເຈົ້າຂອງເກມໄດ້ປຽບ),
--    ແຕ່ avoid_pair 6× ສູງກວ່າ fair 3.375× ຫຼາຍ — ຄ່າຄາດຫວັງ = 0.2963 × 6 ≈ 1.78
--    ຄື ຜູ້ແທງໄດ້ປຽບ +78% ຕໍ່ບິນ ເຖິງແມ່ນແທງມົ້ວກໍ່ຕາມ. ດ້ວຍເຫດນີ້ ເສັ້ນຄຸ້ມທຶນ
--    ໃນໜ້າ /puplatao/bets ຂອງ avoid_pair (1÷6 ≈ 16.7%) ຈຶ່ງຕ່ຳກວ່າອັດຕາຖືກແບບສຸ່ມ
--    (29.6%) — ໝາຍຄວາມວ່າ ກຳໄລສະສົມທີ່ເປັນບວກ ບໍ່ໄດ້ພິສູດວ່າ "ສູດດີ" ອີກຕໍ່ໄປ.
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS puplatao_bet_rates (
  bet_kind    ENUM('predict_pair','avoid_pair') NOT NULL PRIMARY KEY,
  label_lo    VARCHAR(60)   NOT NULL,
  multiplier  DECIMAL(10,2) NOT NULL,
  fair_prob   DECIMAL(6,4)  NOT NULL,   -- ໂອກາດຕາມທິດສະດີ (ໃຊ້ສະແດງເສັ້ນຖານ)
  min_stake   DECIMAL(14,2) NOT NULL DEFAULT 1000.00,
  max_stake   DECIMAL(14,2) NOT NULL DEFAULT 500000.00,
  is_active   TINYINT(1)    NOT NULL DEFAULT 1,
  updated_at  TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO puplatao_bet_rates (bet_kind, label_lo, multiplier, fair_prob) VALUES
  ('predict_pair', 'ຄູ່ລູກ ງວດຖັດໄປ — ອອກທັງສອງ',   6.00, 0.1389),
  ('avoid_pair',   'ຄູ່ລູກ ຄວນຫຼີກ — ບໍ່ອອກທັງສອງ', 6.00, 0.2963)
ON DUPLICATE KEY UPDATE
  label_lo = VALUES(label_lo), fair_prob = VALUES(fair_prob), multiplier = VALUES(multiplier);

-- ---------------------------------------------------------------------
-- 2. ບິນແທງ
--
--    target_draw_no = ງວດທີ່ຍັງບໍ່ທັນອອກ (MAX(draw_no)+1 ຕອນວາງເດີມພັນ)
--    ຈຶ່ງບໍ່ມີ FK ໄປ puplatao_draws — ແຖວງວດນັ້ນຈະຖືກສ້າງພາຍຫຼັງ.
--
--    profit_loss ເກັບໄວ້ຕອນ settle (payout − stake) ເພື່ອໃຫ້ການລວມ
--    ກຳໄລ-ຂາດທຶນສະສົມ ເປັນການ SUM ຄໍລຳດຽວ ບໍ່ຕ້ອງ CASE ທຸກຄັ້ງ.
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS puplatao_bets (
  bet_id              INT AUTO_INCREMENT PRIMARY KEY,
  user_id             INT NOT NULL,
  bet_kind            ENUM('predict_pair','avoid_pair') NOT NULL,
  target_draw_no      BIGINT UNSIGNED  NOT NULL,
  symbol_a            TINYINT UNSIGNED NOT NULL,   -- ສະເໝີ symbol_a < symbol_b
  symbol_b            TINYINT UNSIGNED NOT NULL,
  rank_at_bet         TINYINT UNSIGNED NULL,       -- ອັນດັບຄູ່ (1–15) ທີ່ສູດແນະນຳ ຕອນແທງ
  score_at_bet        DECIMAL(6,4) NULL,           -- ຄະແນນຈັດອັນດັບ 0–1 ຕອນແທງ
  prob_at_bet         DECIMAL(6,4) NULL,           -- ໂອກາດທີ່ສູດຄາດ 0–1 ຕອນແທງ
  stake               DECIMAL(14,2) NOT NULL,
  multiplier_snapshot DECIMAL(10,2) NOT NULL,
  potential_payout    DECIMAL(14,2) NOT NULL,
  status              ENUM('pending','won','lost','void') NOT NULL DEFAULT 'pending',
  payout_amount       DECIMAL(14,2) NULL,
  profit_loss         DECIMAL(14,2) NULL,          -- won: payout−stake · lost: −stake · void: 0
  result_symbols      VARCHAR(11) NULL,            -- ຜົນຈິງ ຕອນ settle ເຊັ່ນ "3,2,6"
  settled_at          DATETIME NULL,
  created_at          TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT chk_ppb_pair  CHECK (symbol_a BETWEEN 1 AND 6 AND symbol_b BETWEEN 1 AND 6 AND symbol_a < symbol_b),
  CONSTRAINT chk_ppb_stake CHECK (stake > 0),
  CONSTRAINT fk_ppb_user  FOREIGN KEY (user_id)  REFERENCES users(user_id) ON DELETE CASCADE,
  CONSTRAINT fk_ppb_kind  FOREIGN KEY (bet_kind) REFERENCES puplatao_bet_rates(bet_kind),
  CONSTRAINT fk_ppb_sym_a FOREIGN KEY (symbol_a) REFERENCES puplatao_symbols(symbol_id),
  CONSTRAINT fk_ppb_sym_b FOREIGN KEY (symbol_b) REFERENCES puplatao_symbols(symbol_id),
  INDEX idx_ppb_user_created (user_id, created_at DESC),
  INDEX idx_ppb_pending (status, target_draw_no),
  INDEX idx_ppb_user_kind (user_id, bet_kind, status),
  INDEX idx_ppb_draw (target_draw_no)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
-- 3. ສະຫຼຸບ ກຳໄລ-ຂາດທຶນ ຕໍ່ user ຕໍ່ສູດ
-- ---------------------------------------------------------------------
CREATE OR REPLACE VIEW puplatao_v_bet_pl AS
SELECT
  user_id,
  bet_kind,
  COUNT(*)                                                   AS total_bets,
  SUM(status = 'pending')                                    AS pending_bets,
  SUM(status IN ('won','lost'))                              AS settled_bets,
  SUM(status = 'won')                                        AS won_bets,
  SUM(status = 'lost')                                       AS lost_bets,
  SUM(status = 'void')                                       AS void_bets,
  ROUND(SUM(stake), 2)                                       AS total_staked,
  ROUND(SUM(CASE WHEN status IN ('won','lost') THEN stake ELSE 0 END), 2) AS settled_staked,
  ROUND(SUM(CASE WHEN status = 'pending' THEN stake ELSE 0 END), 2)       AS pending_staked,
  ROUND(SUM(IFNULL(payout_amount, 0)), 2)                    AS total_returned,
  ROUND(SUM(IFNULL(profit_loss, 0)), 2)                      AS net_pl
FROM puplatao_bets
GROUP BY user_id, bet_kind;

-- ---------------------------------------------------------------------
-- 4. ບັນຊີແຍກຕາມງວດ — ວັດຖຸດິບຂອງ "ເສັ້ນກຳໄລສະສົມ"
--    (ຄ່າສະສົມແທ້ຄິດຕໍ່ໃນ API ໂດຍໄລ່ຈາກງວດເກົ່າ → ໃໝ່)
-- ---------------------------------------------------------------------
CREATE OR REPLACE VIEW puplatao_v_bet_ledger AS
SELECT
  b.user_id,
  b.target_draw_no,
  d.draw_at,
  COUNT(*)                                  AS bets,
  SUM(b.bet_kind = 'predict_pair')          AS predict_bets,
  SUM(b.bet_kind = 'avoid_pair')            AS avoid_bets,
  SUM(b.status = 'won')                     AS won_bets,
  ROUND(SUM(b.stake), 2)                    AS staked,
  ROUND(SUM(IFNULL(b.payout_amount, 0)), 2) AS returned,
  ROUND(SUM(IFNULL(b.profit_loss, 0)), 2)   AS net_pl,
  ROUND(SUM(CASE WHEN b.bet_kind = 'predict_pair' THEN IFNULL(b.profit_loss, 0) ELSE 0 END), 2) AS predict_pl,
  ROUND(SUM(CASE WHEN b.bet_kind = 'avoid_pair'   THEN IFNULL(b.profit_loss, 0) ELSE 0 END), 2) AS avoid_pl
FROM puplatao_bets b
LEFT JOIN puplatao_draws d ON d.draw_no = b.target_draw_no
WHERE b.status IN ('won','lost','void')
GROUP BY b.user_id, b.target_draw_no, d.draw_at;

-- ---------------------------------------------------------------------
-- 5. ຄູ່ລູກໃດ ໄດ້/ເສຍ ຫຼາຍສຸດ (ທຸກ user ລວມກັນ — ໃຊ້ປະເມີນສູດ)
-- ---------------------------------------------------------------------
CREATE OR REPLACE VIEW puplatao_v_bet_pair_pl AS
SELECT
  b.bet_kind,
  b.symbol_a,
  b.symbol_b,
  sa.name_lo AS name_a,
  sb.name_lo AS name_b,
  sa.emoji   AS emoji_a,
  sb.emoji   AS emoji_b,
  COUNT(*)                                  AS total_bets,
  SUM(b.status = 'won')                     AS won_bets,
  ROUND(SUM(b.stake), 2)                    AS total_staked,
  ROUND(SUM(IFNULL(b.profit_loss, 0)), 2)   AS net_pl
FROM puplatao_bets b
JOIN puplatao_symbols sa ON sa.symbol_id = b.symbol_a
JOIN puplatao_symbols sb ON sb.symbol_id = b.symbol_b
WHERE b.status IN ('won','lost')
GROUP BY b.bet_kind, b.symbol_a, b.symbol_b, sa.name_lo, sb.name_lo, sa.emoji, sb.emoji;
