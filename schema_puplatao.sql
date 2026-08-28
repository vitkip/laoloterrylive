-- =====================================================================
-- ຫວຍ "ປູປາເຕົ້າມະຫາໂຊກ" (Hoo Hey How)  —  puplatao_*
-- ໝາກ 6 ໜ່ວຍ: ນ້ຳເຕົ້າ, ປູ, ປາ, ກຸ້ງ, ໄກ່, ເສືອ · 3 ໜ່ວຍ / ງວດ
-- Database: lao_lottery_pro  (ຕໍ່ເຂົ້າ database ເກົ່າ — ອີງຕາມ h545_*)
-- Run once: mysql -u root lao_lottery_pro < schema_puplatao.sql
-- =====================================================================

USE lao_lottery_pro;

-- ---------------------------------------------------------------------
-- 1. ຕາຕະລາງ ໝາກ (symbols)
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS puplatao_symbols (
  symbol_id  TINYINT UNSIGNED NOT NULL PRIMARY KEY,
  code       VARCHAR(10)  NOT NULL UNIQUE,   -- ລະຫັດພາສາອັງກິດ
  name_lo    VARCHAR(30)  NOT NULL,          -- ຊື່ພາສາລາວ
  emoji      VARCHAR(10)  NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT IGNORE INTO puplatao_symbols (symbol_id, code, name_lo, emoji) VALUES
  (1, 'GOURD',   'ນ້ຳເຕົ້າ', '🍐'),
  (2, 'CRAB',    'ປູ',      '🦀'),
  (3, 'FISH',    'ປາ',      '🐟'),
  (4, 'SHRIMP',  'ກຸ້ງ',     '🦐'),
  (5, 'ROOSTER', 'ໄກ່',     '🐓'),
  (6, 'TIGER',   'ເສືອ',    '🐅');

-- ---------------------------------------------------------------------
-- 2. ຕາຕະລາງ ງວດ (draws)
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS puplatao_draws (
  draw_no    BIGINT UNSIGNED NOT NULL PRIMARY KEY,   -- ງວດທີ: 36260044
  draw_at    DATETIME     NOT NULL,                  -- ວັນ-ເວລາອອກຜົນ
  market     VARCHAR(50)  NOT NULL DEFAULT 'ປູປາເຕົ້າມະຫາໂຊກ',
  created_at TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  draw_date  DATE    AS (DATE(draw_at)) STORED,
  draw_hour  TINYINT AS (HOUR(draw_at)) STORED,
  INDEX idx_puplatao_draw_at (draw_at),
  INDEX idx_puplatao_draw_date (draw_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
-- 3. ຕາຕະລາງ ຜົນອອກ (draw_results) — 3 ໜ່ວຍຕໍ່ 1 ງວດ
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS puplatao_draw_results (
  draw_no   BIGINT UNSIGNED  NOT NULL,
  position  TINYINT UNSIGNED NOT NULL,   -- 1, 2, 3
  symbol_id TINYINT UNSIGNED NOT NULL,
  PRIMARY KEY (draw_no, position),
  CONSTRAINT fk_puplatao_res_draw   FOREIGN KEY (draw_no)   REFERENCES puplatao_draws(draw_no)   ON DELETE CASCADE,
  CONSTRAINT fk_puplatao_res_symbol FOREIGN KEY (symbol_id) REFERENCES puplatao_symbols(symbol_id),
  CONSTRAINT chk_puplatao_position  CHECK (position BETWEEN 1 AND 3),
  INDEX idx_puplatao_symbol (symbol_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================================
-- ຂໍ້ມູນຈິງ (20/08/2026 – 28/08/2026)  ລວມ 56 ງວດ
-- =====================================================================
-- ງວດ (draws)
INSERT IGNORE INTO puplatao_draws (draw_no, draw_at) VALUES
  (36260018, '2026-08-20 16:10'),
  (36260019, '2026-08-20 17:10'),
  (36260020, '2026-08-20 18:10'),
  (36260021, '2026-08-20 20:10'),
  (36260022, '2026-08-21 12:05'),
  (36260023, '2026-08-21 13:05'),
  (36260024, '2026-08-21 14:05'),
  (36260025, '2026-08-21 16:05'),
  (36260026, '2026-08-21 17:05'),
  (36260027, '2026-08-21 18:05'),
  (36260028, '2026-08-21 20:05'),
  (36260029, '2026-08-22 12:05'),
  (36260030, '2026-08-22 13:05'),
  (36260031, '2026-08-22 14:05'),
  (36260032, '2026-08-22 16:05'),
  (36260033, '2026-08-22 17:05'),
  (36260034, '2026-08-22 18:05'),
  (36260035, '2026-08-22 20:05'),
  (36260036, '2026-08-23 12:05'),
  (36260037, '2026-08-23 13:05'),
  (36260038, '2026-08-23 14:05'),
  (36260039, '2026-08-23 16:05'),
  (36260040, '2026-08-23 17:05'),
  (36260041, '2026-08-23 18:05'),
  (36260042, '2026-08-23 20:05'),
  (36260043, '2026-08-24 12:05'),
  (36260044, '2026-08-24 13:05'),
  (36260045, '2026-08-24 14:05'),
  (36260046, '2026-08-24 16:05'),
  (36260047, '2026-08-24 17:05'),
  (36260048, '2026-08-24 18:05'),
  (36260049, '2026-08-24 20:05'),
  (36260050, '2026-08-25 12:05'),
  (36260051, '2026-08-25 13:05'),
  (36260052, '2026-08-25 14:05'),
  (36260053, '2026-08-25 16:05'),
  (36260054, '2026-08-25 17:05'),
  (36260055, '2026-08-25 18:05'),
  (36260056, '2026-08-25 20:05'),
  (36260057, '2026-08-26 12:05'),
  (36260058, '2026-08-26 13:05'),
  (36260059, '2026-08-26 14:05'),
  (36260060, '2026-08-26 16:05'),
  (36260061, '2026-08-26 17:05'),
  (36260062, '2026-08-26 18:05'),
  (36260063, '2026-08-26 20:05'),
  (36260064, '2026-08-27 12:05'),
  (36260065, '2026-08-27 13:05'),
  (36260069, '2026-08-27 18:05'),
  (36260070, '2026-08-27 20:05'),
  (36260071, '2026-08-28 12:05'),
  (36260072, '2026-08-28 13:05'),
  (36260073, '2026-08-28 14:05'),
  (36260074, '2026-08-28 16:05'),
  (36260075, '2026-08-28 17:05'),
  (36260076, '2026-08-28 18:05');

-- ຜົນອອກ 3 ໜ່ວຍ (draw_results)
-- 1=ນ້ຳເຕົ້າ 2=ປູ 3=ປາ 4=ກຸ້ງ 5=ໄກ່ 6=ເສືອ
INSERT IGNORE INTO puplatao_draw_results (draw_no, position, symbol_id) VALUES
  (36260018,1,5),(36260018,2,1),(36260018,3,4),
  (36260019,1,6),(36260019,2,2),(36260019,3,1),
  (36260020,1,2),(36260020,2,5),(36260020,3,6),
  (36260021,1,3),(36260021,2,5),(36260021,3,3),
  (36260022,1,6),(36260022,2,3),(36260022,3,1),
  (36260023,1,6),(36260023,2,1),(36260023,3,1),
  (36260024,1,5),(36260024,2,6),(36260024,3,6),
  (36260025,1,1),(36260025,2,3),(36260025,3,2),
  (36260026,1,6),(36260026,2,6),(36260026,3,5),
  (36260027,1,4),(36260027,2,5),(36260027,3,1),
  (36260028,1,3),(36260028,2,1),(36260028,3,4),
  (36260029,1,5),(36260029,2,6),(36260029,3,4),
  (36260030,1,4),(36260030,2,1),(36260030,3,4),
  (36260031,1,6),(36260031,2,6),(36260031,3,4),
  (36260032,1,1),(36260032,2,5),(36260032,3,4),
  (36260033,1,3),(36260033,2,1),(36260033,3,6),
  (36260034,1,1),(36260034,2,6),(36260034,3,5),
  (36260035,1,1),(36260035,2,4),(36260035,3,3),
  (36260036,1,2),(36260036,2,3),(36260036,3,5),
  (36260037,1,2),(36260037,2,3),(36260037,3,3),
  (36260038,1,6),(36260038,2,4),(36260038,3,4),
  (36260039,1,4),(36260039,2,3),(36260039,3,3),
  (36260040,1,2),(36260040,2,5),(36260040,3,4),
  (36260041,1,3),(36260041,2,2),(36260041,3,1),
  (36260042,1,1),(36260042,2,2),(36260042,3,1),
  (36260043,1,1),(36260043,2,6),(36260043,3,3),
  (36260044,1,3),(36260044,2,2),(36260044,3,6),
  (36260045,1,1),(36260045,2,6),(36260045,3,3),
  (36260046,1,5),(36260046,2,3),(36260046,3,4),
  (36260047,1,6),(36260047,2,6),(36260047,3,6),
  (36260048,1,2),(36260048,2,5),(36260048,3,1),
  (36260049,1,5),(36260049,2,1),(36260049,3,1),
  (36260050,1,6),(36260050,2,4),(36260050,3,4),
  (36260051,1,4),(36260051,2,6),(36260051,3,1),
  (36260052,1,6),(36260052,2,5),(36260052,3,2),
  (36260053,1,5),(36260053,2,4),(36260053,3,6),
  (36260054,1,1),(36260054,2,3),(36260054,3,5),
  (36260055,1,2),(36260055,2,4),(36260055,3,3),
  (36260056,1,4),(36260056,2,5),(36260056,3,2),
  (36260057,1,3),(36260057,2,5),(36260057,3,4),
  (36260058,1,2),(36260058,2,6),(36260058,3,3),
  (36260059,1,4),(36260059,2,6),(36260059,3,6),
  (36260060,1,5),(36260060,2,2),(36260060,3,5),
  (36260061,1,2),(36260061,2,6),(36260061,3,1),
  (36260062,1,6),(36260062,2,5),(36260062,3,4),
  (36260063,1,4),(36260063,2,3),(36260063,3,1),
  (36260064,1,5),(36260064,2,6),(36260064,3,5),
  (36260065,1,3),(36260065,2,2),(36260065,3,2),
  (36260069,1,5),(36260069,2,3),(36260069,3,3),
  (36260070,1,2),(36260070,2,5),(36260070,3,6),
  (36260071,1,6),(36260071,2,3),(36260071,3,5),
  (36260072,1,5),(36260072,2,1),(36260072,3,5),
  (36260073,1,3),(36260073,2,1),(36260073,3,6),
  (36260074,1,5),(36260074,2,4),(36260074,3,3),
  (36260075,1,6),(36260075,2,4),(36260075,3,3),
  (36260076,1,2),(36260076,2,2),(36260076,3,4);

-- =====================================================================
-- VIEWS ສຳລັບເບິ່ງສະຖິຕິ
-- =====================================================================

-- ຜົນອອກແບບແຖວດຽວ (ອ່ານງ່າຍຄືໃນແອັບ)
CREATE OR REPLACE VIEW puplatao_v_draw_flat AS
SELECT
  d.draw_no,
  d.draw_at,
  MAX(CASE WHEN r.position = 1 THEN s.name_lo END) AS pos1,
  MAX(CASE WHEN r.position = 2 THEN s.name_lo END) AS pos2,
  MAX(CASE WHEN r.position = 3 THEN s.name_lo END) AS pos3,
  COUNT(DISTINCT r.symbol_id) AS distinct_symbols   -- 1=ຕອງ, 2=ຄູ່, 3=ຄີກ
FROM puplatao_draws d
JOIN puplatao_draw_results r ON r.draw_no = d.draw_no
JOIN puplatao_symbols s      ON s.symbol_id = r.symbol_id
GROUP BY d.draw_no, d.draw_at;

-- ຄວາມຖີ່ລວມ ຂອງແຕ່ລະໝາກ
CREATE OR REPLACE VIEW puplatao_v_symbol_frequency AS
SELECT
  s.symbol_id,
  s.name_lo,
  s.emoji,
  COUNT(r.symbol_id) AS total_hits,
  ROUND(100 * COUNT(r.symbol_id) / NULLIF((SELECT COUNT(*) FROM puplatao_draw_results), 0), 2) AS pct_of_all,
  COUNT(DISTINCT r.draw_no) AS draws_appeared,
  ROUND(100 * COUNT(DISTINCT r.draw_no) / NULLIF((SELECT COUNT(*) FROM puplatao_draws), 0), 2) AS pct_of_draws
FROM puplatao_symbols s
LEFT JOIN puplatao_draw_results r ON r.symbol_id = s.symbol_id
GROUP BY s.symbol_id, s.name_lo, s.emoji;

-- ຄວາມຖີ່ ແຍກຕາມຕຳແໜ່ງ (ໜ່ວຍ 1 / 2 / 3)
CREATE OR REPLACE VIEW puplatao_v_symbol_by_position AS
SELECT
  s.symbol_id,
  s.name_lo,
  s.emoji,
  SUM(r.position = 1) AS pos1,
  SUM(r.position = 2) AS pos2,
  SUM(r.position = 3) AS pos3,
  COUNT(*)            AS total
FROM puplatao_symbols s
LEFT JOIN puplatao_draw_results r ON r.symbol_id = s.symbol_id
GROUP BY s.symbol_id, s.name_lo, s.emoji;

-- ໝາກໃດອອກຫຼ້າສຸດເມື່ອໃດ + ຂາດມາແລ້ວກີ່ງວດ (gap)
CREATE OR REPLACE VIEW puplatao_v_symbol_gap AS
SELECT
  s.symbol_id,
  s.name_lo,
  s.emoji,
  MAX(d.draw_no) AS last_draw_no,
  MAX(d.draw_at) AS last_seen_at,
  (SELECT COUNT(*) FROM puplatao_draws x WHERE x.draw_no > IFNULL(MAX(d.draw_no), 0)) AS draws_since
FROM puplatao_symbols s
LEFT JOIN puplatao_draw_results r ON r.symbol_id = s.symbol_id
LEFT JOIN puplatao_draws d        ON d.draw_no  = r.draw_no
GROUP BY s.symbol_id, s.name_lo, s.emoji;

-- ນັບ ຄູ່ / ຕອງ (pair / triple)
CREATE OR REPLACE VIEW puplatao_v_pair_triple AS
SELECT
  s.symbol_id,
  s.name_lo,
  s.emoji,
  SUM(t.cnt = 2) AS times_pair,
  SUM(t.cnt = 3) AS times_triple
FROM puplatao_symbols s
LEFT JOIN (
  SELECT draw_no, symbol_id, COUNT(*) AS cnt
  FROM puplatao_draw_results
  GROUP BY draw_no, symbol_id
) t ON t.symbol_id = s.symbol_id
GROUP BY s.symbol_id, s.name_lo, s.emoji;

-- ສະຫຼຸບຕໍ່ວັນ
CREATE OR REPLACE VIEW puplatao_v_daily_summary AS
SELECT
  d.draw_date,
  COUNT(*) AS total_draws,
  MIN(d.draw_at) AS first_draw,
  MAX(d.draw_at) AS last_draw
FROM puplatao_draws d
GROUP BY d.draw_date;

-- =====================================================================
-- ເພີ່ມງວດໃໝ່: ໃຊ້ຜ່ານ API  POST /api/puplatao.php?r=draws
--   body: { "draw_no":36260077, "draw_at":"2026-08-28 20:05",
--           "pos1":3, "pos2":6, "pos3":2 }     (pos = symbol_id 1–6)
--
-- ໝາຍເຫດ: ບໍ່ໃຊ້ stored procedure ຍ້ອນ mysql.proc ຂອງ XAMPP MariaDB ນີ້
--          ຍັງບໍ່ໄດ້ run mysql_upgrade. ຖ້າຕ້ອງການ procedure ໃຫ້ແກ້ກ່ອນ
--          ແລ້ວ CREATE PROCEDURE puplatao_add_draw(...) ຕາມແບບ add_draw ເດີມ.
-- =====================================================================
