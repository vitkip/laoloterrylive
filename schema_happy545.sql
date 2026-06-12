-- =================================================================
-- Happy 545 — Numbers Master + Draws Schema
-- Database: lao_lottery_pro  (ຕໍ່ເຂົ້າ database ເກົ່າ)
-- Run once: mysql -u root lao_lottery_pro < schema_happy545.sql
-- =================================================================

USE lao_lottery_pro;

-- ── 1. Master numbers 01–45 ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS h545_numbers (
    num   TINYINT UNSIGNED NOT NULL,
    label CHAR(2)          NOT NULL COMMENT '01–45 zero-padded',
    PRIMARY KEY (num)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ── Seed 01–45 (idempotent) ───────────────────────────────────────
INSERT IGNORE INTO h545_numbers (num, label) VALUES
( 1,'01'),( 2,'02'),( 3,'03'),( 4,'04'),( 5,'05'),
( 6,'06'),( 7,'07'),( 8,'08'),( 9,'09'),(10,'10'),
(11,'11'),(12,'12'),(13,'13'),(14,'14'),(15,'15'),
(16,'16'),(17,'17'),(18,'18'),(19,'19'),(20,'20'),
(21,'21'),(22,'22'),(23,'23'),(24,'24'),(25,'25'),
(26,'26'),(27,'27'),(28,'28'),(29,'29'),(30,'30'),
(31,'31'),(32,'32'),(33,'33'),(34,'34'),(35,'35'),
(36,'36'),(37,'37'),(38,'38'),(39,'39'),(40,'40'),
(41,'41'),(42,'42'),(43,'43'),(44,'44'),(45,'45');

-- ── 2. Draw results per round ─────────────────────────────────────
--   pos1–pos4 = ເລກຕຳແໜ່ງ 1–4, pos5 = ເລກທ້າຍ (ໃຊ້ວິເຄາະ)
CREATE TABLE IF NOT EXISTS h545_draws (
    id         INT UNSIGNED     NOT NULL AUTO_INCREMENT,
    draw_date  DATE             NOT NULL,
    pos1       TINYINT UNSIGNED NOT NULL,
    pos2       TINYINT UNSIGNED NOT NULL,
    pos3       TINYINT UNSIGNED NOT NULL,
    pos4       TINYINT UNSIGNED NOT NULL,
    pos5       TINYINT UNSIGNED NOT NULL,
    created_at TIMESTAMP        NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (id),
    UNIQUE KEY  uq_h545_draw_date (draw_date),
    INDEX       idx_h545_pos5 (pos5),

    CONSTRAINT fk_h545_pos1 FOREIGN KEY (pos1) REFERENCES h545_numbers(num),
    CONSTRAINT fk_h545_pos2 FOREIGN KEY (pos2) REFERENCES h545_numbers(num),
    CONSTRAINT fk_h545_pos3 FOREIGN KEY (pos3) REFERENCES h545_numbers(num),
    CONSTRAINT fk_h545_pos4 FOREIGN KEY (pos4) REFERENCES h545_numbers(num),
    CONSTRAINT fk_h545_pos5 FOREIGN KEY (pos5) REFERENCES h545_numbers(num)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
