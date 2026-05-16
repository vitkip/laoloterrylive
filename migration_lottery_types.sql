-- =================================================================
-- Migration: Add missing columns to lottery_types
-- Date: 2026-05-16
-- Database: lao_lottery_pro (local) / laolycfc_lao_lottery_pro (prod)
-- Run once on production server via phpMyAdmin / cPanel SQL tab
-- =================================================================

ALTER TABLE lottery_types
    ADD COLUMN IF NOT EXISTS schedule   VARCHAR(100) NOT NULL DEFAULT '' AFTER type_name,
    ADD COLUMN IF NOT EXISTS color      VARCHAR(20)  NOT NULL DEFAULT '#003fb1' AFTER schedule,
    ADD COLUMN IF NOT EXISTS is_active  TINYINT(1)   NOT NULL DEFAULT 1 AFTER color;
