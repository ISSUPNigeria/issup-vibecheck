-- Migration 003: Allow expires_at to be NULL in screening_sessions
-- NULL means no expiry — used for registered users (permanent storage)
-- Existing guest rows with a timestamp are unaffected
-- Run with: Get-Content "database/migrations/003_make_expires_at_nullable.sql" | mysql -u root -p mental_health_db

ALTER TABLE screening_sessions
    MODIFY COLUMN expires_at DATETIME NULL;
