-- =================================================================
-- Migration: User Registration & Verification System
-- Date: 2026-05-13
-- Database: lao_lottery_pro (local) / laolycfc_lao_lottery_pro (prod)
-- Run once on both environments
-- =================================================================

-- 1. Email Verification Tokens
CREATE TABLE IF NOT EXISTS email_verifications (
    verification_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id         INT NOT NULL,
    token           VARCHAR(255) NOT NULL,
    expires_at      DATETIME NOT NULL,
    verified_at     DATETIME NULL,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    INDEX idx_ev_token  (token),
    INDEX idx_ev_user   (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Password Reset Tokens
CREATE TABLE IF NOT EXISTS password_resets (
    reset_id    INT AUTO_INCREMENT PRIMARY KEY,
    user_id     INT NOT NULL,
    token       VARCHAR(255) NOT NULL,
    expires_at  DATETIME NOT NULL,
    used_at     DATETIME NULL,
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    INDEX idx_pr_token  (token),
    INDEX idx_pr_user   (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. OTP Verification Codes
CREATE TABLE IF NOT EXISTS otp_codes (
    otp_id        INT AUTO_INCREMENT PRIMARY KEY,
    user_id       INT NOT NULL,
    otp_code      VARCHAR(10) NOT NULL,
    purpose       ENUM('register','login','reset_password') NOT NULL,
    expires_at    DATETIME NOT NULL,
    used_at       DATETIME NULL,
    attempt_count TINYINT UNSIGNED DEFAULT 0,
    created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    INDEX idx_otp_user_purpose (user_id, purpose)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
