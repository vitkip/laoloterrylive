-- =================================================================
-- Demo Betting System — Wallets, Payout Rates, Betting Rounds, Bets
-- Database: lao_lottery_pro  (ຕໍ່ເຂົ້າ database ເກົ່າ)
-- Run once: mysql -u root lao_lottery_pro < schema_betting.sql
--
-- Virtual/demo currency only — no real money, no payment gateway.
-- Depends on: users, lottery_types, lottery_draws (schema.sql)
-- =================================================================

USE lao_lottery_pro;

-- ── 1. Per-user virtual wallet ─────────────────────────────────────
CREATE TABLE IF NOT EXISTS wallets (
    wallet_id   INT AUTO_INCREMENT PRIMARY KEY,
    user_id     INT NOT NULL UNIQUE,
    balance     DECIMAL(14,2) NOT NULL DEFAULT 0.00,
    updated_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ── 2. Wallet ledger — append-only source of truth for balance ────
CREATE TABLE IF NOT EXISTS wallet_transactions (
    tx_id         INT AUTO_INCREMENT PRIMARY KEY,
    user_id       INT NOT NULL,
    type          ENUM('signup_bonus','bet_placed','bet_won','bet_void_refund','admin_adjustment') NOT NULL,
    amount        DECIMAL(14,2) NOT NULL,       -- signed: negative for bet_placed
    balance_after DECIMAL(14,2) NOT NULL,
    ref_bet_id    INT NULL,
    note          VARCHAR(255) NULL,
    created_by    INT NULL,                     -- admin user_id for adjustments; NULL = system
    created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (created_by) REFERENCES users(user_id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
CREATE INDEX idx_wt_user_created ON wallet_transactions(user_id, created_at DESC);
CREATE INDEX idx_wt_ref_bet ON wallet_transactions(ref_bet_id);

-- ── 3. Payout multiplier per prize_type (admin-configurable) ──────
CREATE TABLE IF NOT EXISTS bet_payout_rates (
    prize_type ENUM('6_digits','5_digits','4_digits','3_digits','2_digits') PRIMARY KEY,
    multiplier DECIMAL(10,2) NOT NULL,
    is_active  TINYINT(1) NOT NULL DEFAULT 1,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
INSERT INTO bet_payout_rates (prize_type, multiplier) VALUES
  ('2_digits', 70.00), ('3_digits', 500.00), ('4_digits', 3000.00),
  ('5_digits', 20000.00), ('6_digits', 100000.00)
ON DUPLICATE KEY UPDATE multiplier = multiplier;

-- ── 4. Betting rounds — container users bet into before a result exists ──
CREATE TABLE IF NOT EXISTS betting_rounds (
    round_id     INT AUTO_INCREMENT PRIMARY KEY,
    type_id      INT NOT NULL,
    draw_date    DATE NOT NULL,
    draw_number  INT NOT NULL,
    status       ENUM('open','closed','settled','void') NOT NULL DEFAULT 'open',
    draw_id      INT NULL,               -- linked to lottery_draws once matched at settle time
    opened_by    INT NULL,
    closed_at    DATETIME NULL,
    settled_at   DATETIME NULL,
    settled_by   INT NULL,
    created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uniq_round (type_id, draw_date, draw_number),
    FOREIGN KEY (type_id) REFERENCES lottery_types(type_id),
    FOREIGN KEY (draw_id) REFERENCES lottery_draws(draw_id) ON DELETE SET NULL,
    FOREIGN KEY (opened_by) REFERENCES users(user_id) ON DELETE SET NULL,
    FOREIGN KEY (settled_by) REFERENCES users(user_id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
CREATE INDEX idx_br_type_date ON betting_rounds(type_id, draw_date DESC);
CREATE INDEX idx_br_status ON betting_rounds(status);

-- ── 5. Bets ─────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS bets (
    bet_id              INT AUTO_INCREMENT PRIMARY KEY,
    round_id            INT NOT NULL,
    user_id             INT NOT NULL,
    prize_type          ENUM('6_digits','5_digits','4_digits','3_digits','2_digits') NOT NULL,
    chosen_number       VARCHAR(6) NOT NULL,     -- zero-padded, length must match prize_type digit count
    stake               DECIMAL(14,2) NOT NULL,
    multiplier_snapshot DECIMAL(10,2) NOT NULL,  -- copied from bet_payout_rates at placement time
    potential_payout    DECIMAL(14,2) NOT NULL,  -- stake * multiplier_snapshot
    status              ENUM('pending','won','lost','void') NOT NULL DEFAULT 'pending',
    payout_amount       DECIMAL(14,2) NULL,
    settled_at          DATETIME NULL,
    created_at          TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (round_id) REFERENCES betting_rounds(round_id),
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
CREATE INDEX idx_bets_round_status ON bets(round_id, status);
CREATE INDEX idx_bets_user_created ON bets(user_id, created_at DESC);
