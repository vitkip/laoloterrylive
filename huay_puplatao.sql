-- =====================================================================
-- ຖານຂໍ້ມູນສະຖິຕິ ຫວຍ "ປູປາເຕົ້າມະຫາໂຊກ" (Hoo Hey How)
-- ໝາກ 6 ໜ່ວຍ: ນ້ຳເຕົ້າ, ປູ, ປາ, ກຸ້ງ, ໄກ່, ເສືອ
-- MySQL 8.0+
-- =====================================================================

DROP DATABASE IF EXISTS huay_db;
CREATE DATABASE huay_db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;
USE huay_db;

-- ---------------------------------------------------------------------
-- 1. ຕາຕະລາງ ໝາກ (symbols)
-- ---------------------------------------------------------------------
CREATE TABLE symbols (
  symbol_id   TINYINT UNSIGNED NOT NULL PRIMARY KEY,
  code        VARCHAR(10)  NOT NULL UNIQUE,   -- ລະຫັດພາສາອັງກິດ
  name_lo     VARCHAR(30)  NOT NULL,          -- ຊື່ພາສາລາວ
  emoji       VARCHAR(10)  NULL
) ENGINE=InnoDB;

INSERT INTO symbols (symbol_id, code, name_lo, emoji) VALUES
  (1, 'GOURD',   'ນ້ຳເຕົ້າ', '🍐'),
  (2, 'CRAB',    'ປູ',      '🦀'),
  (3, 'FISH',    'ປາ',      '🐟'),
  (4, 'SHRIMP',  'ກຸ້ງ',     '🦐'),
  (5, 'ROOSTER', 'ໄກ່',     '🐓'),
  (6, 'TIGER',   'ເສືອ',    '🐅');

-- ---------------------------------------------------------------------
-- 2. ຕາຕະລາງ ງວດ (draws)
-- ---------------------------------------------------------------------
CREATE TABLE draws (
  draw_no     BIGINT UNSIGNED NOT NULL PRIMARY KEY,  -- ງວດທີ: 36260044
  draw_at     DATETIME     NOT NULL,                 -- ວັນ-ເວລາອອກຜົນ
  market      VARCHAR(50)  NOT NULL DEFAULT 'ປູປາເຕົ້າມະຫາໂຊກ',
  created_at  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  draw_date   DATE AS (DATE(draw_at)) STORED,
  draw_hour   TINYINT AS (HOUR(draw_at)) STORED,
  INDEX idx_draw_at (draw_at),
  INDEX idx_draw_date (draw_date)
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- 3. ຕາຕະລາງ ຜົນອອກ (draw_results) — 3 ໜ່ວຍຕໍ່ 1 ງວດ
-- ---------------------------------------------------------------------
CREATE TABLE draw_results (
  draw_no   BIGINT UNSIGNED  NOT NULL,
  position  TINYINT UNSIGNED NOT NULL,  -- 1, 2, 3
  symbol_id TINYINT UNSIGNED NOT NULL,
  PRIMARY KEY (draw_no, position),
  CONSTRAINT fk_res_draw   FOREIGN KEY (draw_no)   REFERENCES draws(draw_no) ON DELETE CASCADE,
  CONSTRAINT fk_res_symbol FOREIGN KEY (symbol_id) REFERENCES symbols(symbol_id),
  CONSTRAINT chk_position  CHECK (position BETWEEN 1 AND 3),
  INDEX idx_symbol (symbol_id)
) ENGINE=InnoDB;

-- =====================================================================
-- ຂໍ້ມູນຈິງຈາກຮູບ  (20/08/2026 – 28/08/2026)  ລວມ 56 ງວດ
-- ໝາຍເຫດ: ງວດ 36260066–36260068 (27/08 ເວລາ 14:05, 16:05, 17:05)
--          ຍັງບໍ່ມີໃນຮູບ — ໃຫ້ເພີ່ມພາຍຫຼັງດ້ວຍ CALL add_draw(...)
-- =====================================================================
-- ງວດ (draws)
INSERT INTO draws (draw_no, draw_at) VALUES
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
INSERT INTO draw_results (draw_no, position, symbol_id) VALUES
  -- ໄກ່, ນ້ຳເຕົ້າ, ກຸ້ງ
  (36260018,1,5),(36260018,2,1),(36260018,3,4),
  -- ເສືອ, ປູ, ນ້ຳເຕົ້າ
  (36260019,1,6),(36260019,2,2),(36260019,3,1),
  -- ປູ, ໄກ່, ເສືອ
  (36260020,1,2),(36260020,2,5),(36260020,3,6),
  -- ປາ, ໄກ່, ປາ
  (36260021,1,3),(36260021,2,5),(36260021,3,3),
  -- ເສືອ, ປາ, ນ້ຳເຕົ້າ
  (36260022,1,6),(36260022,2,3),(36260022,3,1),
  -- ເສືອ, ນ້ຳເຕົ້າ, ນ້ຳເຕົ້າ
  (36260023,1,6),(36260023,2,1),(36260023,3,1),
  -- ໄກ່, ເສືອ, ເສືອ
  (36260024,1,5),(36260024,2,6),(36260024,3,6),
  -- ນ້ຳເຕົ້າ, ປາ, ປູ
  (36260025,1,1),(36260025,2,3),(36260025,3,2),
  -- ເສືອ, ເສືອ, ໄກ່
  (36260026,1,6),(36260026,2,6),(36260026,3,5),
  -- ກຸ້ງ, ໄກ່, ນ້ຳເຕົ້າ
  (36260027,1,4),(36260027,2,5),(36260027,3,1),
  -- ປາ, ນ້ຳເຕົ້າ, ກຸ້ງ
  (36260028,1,3),(36260028,2,1),(36260028,3,4),
  -- ໄກ່, ເສືອ, ກຸ້ງ
  (36260029,1,5),(36260029,2,6),(36260029,3,4),
  -- ກຸ້ງ, ນ້ຳເຕົ້າ, ກຸ້ງ
  (36260030,1,4),(36260030,2,1),(36260030,3,4),
  -- ເສືອ, ເສືອ, ກຸ້ງ
  (36260031,1,6),(36260031,2,6),(36260031,3,4),
  -- ນ້ຳເຕົ້າ, ໄກ່, ກຸ້ງ
  (36260032,1,1),(36260032,2,5),(36260032,3,4),
  -- ປາ, ນ້ຳເຕົ້າ, ເສືອ
  (36260033,1,3),(36260033,2,1),(36260033,3,6),
  -- ນ້ຳເຕົ້າ, ເສືອ, ໄກ່
  (36260034,1,1),(36260034,2,6),(36260034,3,5),
  -- ນ້ຳເຕົ້າ, ກຸ້ງ, ປາ
  (36260035,1,1),(36260035,2,4),(36260035,3,3),
  -- ປູ, ປາ, ໄກ່
  (36260036,1,2),(36260036,2,3),(36260036,3,5),
  -- ປູ, ປາ, ປາ
  (36260037,1,2),(36260037,2,3),(36260037,3,3),
  -- ເສືອ, ກຸ້ງ, ກຸ້ງ
  (36260038,1,6),(36260038,2,4),(36260038,3,4),
  -- ກຸ້ງ, ປາ, ປາ
  (36260039,1,4),(36260039,2,3),(36260039,3,3),
  -- ປູ, ໄກ່, ກຸ້ງ
  (36260040,1,2),(36260040,2,5),(36260040,3,4),
  -- ປາ, ປູ, ນ້ຳເຕົ້າ
  (36260041,1,3),(36260041,2,2),(36260041,3,1),
  -- ນ້ຳເຕົ້າ, ປູ, ນ້ຳເຕົ້າ
  (36260042,1,1),(36260042,2,2),(36260042,3,1),
  -- ນ້ຳເຕົ້າ, ເສືອ, ປາ
  (36260043,1,1),(36260043,2,6),(36260043,3,3),
  -- ປາ, ປູ, ເສືອ
  (36260044,1,3),(36260044,2,2),(36260044,3,6),
  -- ນ້ຳເຕົ້າ, ເສືອ, ປາ
  (36260045,1,1),(36260045,2,6),(36260045,3,3),
  -- ໄກ່, ປາ, ກຸ້ງ
  (36260046,1,5),(36260046,2,3),(36260046,3,4),
  -- ເສືອ, ເສືອ, ເສືອ
  (36260047,1,6),(36260047,2,6),(36260047,3,6),
  -- ປູ, ໄກ່, ນ້ຳເຕົ້າ
  (36260048,1,2),(36260048,2,5),(36260048,3,1),
  -- ໄກ່, ນ້ຳເຕົ້າ, ນ້ຳເຕົ້າ
  (36260049,1,5),(36260049,2,1),(36260049,3,1),
  -- ເສືອ, ກຸ້ງ, ກຸ້ງ
  (36260050,1,6),(36260050,2,4),(36260050,3,4),
  -- ກຸ້ງ, ເສືອ, ນ້ຳເຕົ້າ
  (36260051,1,4),(36260051,2,6),(36260051,3,1),
  -- ເສືອ, ໄກ່, ປູ
  (36260052,1,6),(36260052,2,5),(36260052,3,2),
  -- ໄກ່, ກຸ້ງ, ເສືອ
  (36260053,1,5),(36260053,2,4),(36260053,3,6),
  -- ນ້ຳເຕົ້າ, ປາ, ໄກ່
  (36260054,1,1),(36260054,2,3),(36260054,3,5),
  -- ປູ, ກຸ້ງ, ປາ
  (36260055,1,2),(36260055,2,4),(36260055,3,3),
  -- ກຸ້ງ, ໄກ່, ປູ
  (36260056,1,4),(36260056,2,5),(36260056,3,2),
  -- ປາ, ໄກ່, ກຸ້ງ
  (36260057,1,3),(36260057,2,5),(36260057,3,4),
  -- ປູ, ເສືອ, ປາ
  (36260058,1,2),(36260058,2,6),(36260058,3,3),
  -- ກຸ້ງ, ເສືອ, ເສືອ
  (36260059,1,4),(36260059,2,6),(36260059,3,6),
  -- ໄກ່, ປູ, ໄກ່
  (36260060,1,5),(36260060,2,2),(36260060,3,5),
  -- ປູ, ເສືອ, ນ້ຳເຕົ້າ
  (36260061,1,2),(36260061,2,6),(36260061,3,1),
  -- ເສືອ, ໄກ່, ກຸ້ງ
  (36260062,1,6),(36260062,2,5),(36260062,3,4),
  -- ກຸ້ງ, ປາ, ນ້ຳເຕົ້າ
  (36260063,1,4),(36260063,2,3),(36260063,3,1),
  -- ໄກ່, ເສືອ, ໄກ່
  (36260064,1,5),(36260064,2,6),(36260064,3,5),
  -- ປາ, ປູ, ປູ
  (36260065,1,3),(36260065,2,2),(36260065,3,2),
  -- ໄກ່, ປາ, ປາ
  (36260069,1,5),(36260069,2,3),(36260069,3,3),
  -- ປູ, ໄກ່, ເສືອ
  (36260070,1,2),(36260070,2,5),(36260070,3,6),
  -- ເສືອ, ປາ, ໄກ່
  (36260071,1,6),(36260071,2,3),(36260071,3,5),
  -- ໄກ່, ນ້ຳເຕົ້າ, ໄກ່
  (36260072,1,5),(36260072,2,1),(36260072,3,5),
  -- ປາ, ນ້ຳເຕົ້າ, ເສືອ
  (36260073,1,3),(36260073,2,1),(36260073,3,6),
  -- ໄກ່, ກຸ້ງ, ປາ
  (36260074,1,5),(36260074,2,4),(36260074,3,3),
  -- ເສືອ, ກຸ້ງ, ປາ
  (36260075,1,6),(36260075,2,4),(36260075,3,3),
  -- ປູ, ປູ, ກຸ້ງ
  (36260076,1,2),(36260076,2,2),(36260076,3,4);

-- =====================================================================
-- VIEWS ສຳລັບເບິ່ງສະຖິຕິ
-- =====================================================================

-- ຜົນອອກແບບແຖວດຽວ (ອ່ານງ່າຍຄືໃນແອັບ)
CREATE OR REPLACE VIEW v_draw_flat AS
SELECT
  d.draw_no,
  d.draw_at,
  MAX(CASE WHEN r.position = 1 THEN s.name_lo END) AS pos1,
  MAX(CASE WHEN r.position = 2 THEN s.name_lo END) AS pos2,
  MAX(CASE WHEN r.position = 3 THEN s.name_lo END) AS pos3,
  COUNT(DISTINCT r.symbol_id) AS distinct_symbols   -- 1=ຕອງ, 2=ຄູ່, 3=ຄີກ
FROM draws d
JOIN draw_results r ON r.draw_no = d.draw_no
JOIN symbols s      ON s.symbol_id = r.symbol_id
GROUP BY d.draw_no, d.draw_at;

-- ຄວາມຖີ່ລວມ ຂອງແຕ່ລະໝາກ
CREATE OR REPLACE VIEW v_symbol_frequency AS
SELECT
  s.symbol_id,
  s.name_lo,
  COUNT(r.symbol_id) AS total_hits,
  ROUND(100 * COUNT(r.symbol_id) / (SELECT COUNT(*) FROM draw_results), 2) AS pct_of_all,
  COUNT(DISTINCT r.draw_no) AS draws_appeared,
  ROUND(100 * COUNT(DISTINCT r.draw_no) / (SELECT COUNT(*) FROM draws), 2) AS pct_of_draws
FROM symbols s
LEFT JOIN draw_results r ON r.symbol_id = s.symbol_id
GROUP BY s.symbol_id, s.name_lo;

-- ຄວາມຖີ່ ແຍກຕາມຕຳແໜ່ງ (ໜ່ວຍ 1 / 2 / 3)
CREATE OR REPLACE VIEW v_symbol_by_position AS
SELECT
  s.name_lo,
  SUM(r.position = 1) AS pos1,
  SUM(r.position = 2) AS pos2,
  SUM(r.position = 3) AS pos3,
  COUNT(*)            AS total
FROM symbols s
LEFT JOIN draw_results r ON r.symbol_id = s.symbol_id
GROUP BY s.symbol_id, s.name_lo;

-- ໝາກໃດອອກຫຼ້າສຸດເມື່ອໃດ + ຂາດມາແລ້ວກີ່ງວດ (gap)
CREATE OR REPLACE VIEW v_symbol_gap AS
SELECT
  s.name_lo,
  MAX(d.draw_no) AS last_draw_no,
  MAX(d.draw_at) AS last_seen_at,
  (SELECT COUNT(*) FROM draws x WHERE x.draw_no > IFNULL(MAX(d.draw_no), 0)) AS draws_since
FROM symbols s
LEFT JOIN draw_results r ON r.symbol_id = s.symbol_id
LEFT JOIN draws d        ON d.draw_no  = r.draw_no
GROUP BY s.symbol_id, s.name_lo;

-- ນັບ ຄູ່ / ຕອງ (pair / triple)
CREATE OR REPLACE VIEW v_pair_triple AS
SELECT
  s.name_lo,
  SUM(t.cnt = 2) AS times_pair,
  SUM(t.cnt = 3) AS times_triple
FROM symbols s
LEFT JOIN (
  SELECT draw_no, symbol_id, COUNT(*) AS cnt
  FROM draw_results
  GROUP BY draw_no, symbol_id
) t ON t.symbol_id = s.symbol_id
GROUP BY s.symbol_id, s.name_lo;

-- ສະຫຼຸບຕໍ່ວັນ
CREATE OR REPLACE VIEW v_daily_summary AS
SELECT
  d.draw_date,
  COUNT(*) AS total_draws,
  MIN(d.draw_at) AS first_draw,
  MAX(d.draw_at) AS last_draw
FROM draws d
GROUP BY d.draw_date;

-- =====================================================================
-- ຕົວຢ່າງຄຳສັ່ງໃຊ້ງານ
-- =====================================================================
-- ເບິ່ງຜົນ 10 ງວດຫຼ້າສຸດ:
--   SELECT * FROM v_draw_flat ORDER BY draw_no DESC LIMIT 10;
--
-- ໝາກໃດອອກຫຼາຍສຸດ:
--   SELECT * FROM v_symbol_frequency ORDER BY total_hits DESC;
--
-- ໝາກໃດຫາຍໄປດົນສຸດ:
--   SELECT * FROM v_symbol_gap ORDER BY draws_since DESC;
--
-- ຄູ່ໝາກທີ່ອອກພ້ອມກັນເລື້ອຍໆ:
--   SELECT a.name_lo AS s1, b.name_lo AS s2, COUNT(*) AS times
--   FROM draw_results r1
--   JOIN draw_results r2 ON r1.draw_no = r2.draw_no AND r1.symbol_id < r2.symbol_id
--   JOIN symbols a ON a.symbol_id = r1.symbol_id
--   JOIN symbols b ON b.symbol_id = r2.symbol_id
--   GROUP BY a.name_lo, b.name_lo ORDER BY times DESC;
--
-- ຄວາມຖີ່ ແຍກຕາມຊົ່ວໂມງອອກຜົນ:
--   SELECT d.draw_hour, s.name_lo, COUNT(*) c
--   FROM draws d JOIN draw_results r ON r.draw_no = d.draw_no
--   JOIN symbols s ON s.symbol_id = r.symbol_id
--   GROUP BY d.draw_hour, s.name_lo ORDER BY d.draw_hour, c DESC;

-- =====================================================================
-- ເພີ່ມງວດໃໝ່ໄດ້ງ່າຍໆດ້ວຍ procedure ນີ້
-- ຕົວຢ່າງ: CALL add_draw(36260045, '2026-08-24 14:05', 'FISH','TIGER','CRAB');
-- =====================================================================
DELIMITER $$
CREATE PROCEDURE add_draw(
  IN p_draw_no BIGINT UNSIGNED,
  IN p_draw_at DATETIME,
  IN p_s1 VARCHAR(10),
  IN p_s2 VARCHAR(10),
  IN p_s3 VARCHAR(10)
)
BEGIN
  INSERT INTO draws (draw_no, draw_at) VALUES (p_draw_no, p_draw_at);
  INSERT INTO draw_results (draw_no, position, symbol_id)
  SELECT p_draw_no, 1, symbol_id FROM symbols WHERE code = p_s1
  UNION ALL
  SELECT p_draw_no, 2, symbol_id FROM symbols WHERE code = p_s2
  UNION ALL
  SELECT p_draw_no, 3, symbol_id FROM symbols WHERE code = p_s3;
END$$
DELIMITER ;
