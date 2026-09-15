-- ============================================================
-- WARNING: THIS FILE IS OUTDATED — DO NOT RUN FOR DEPLOYMENT
-- For fresh deployment, use: cd backend && python migrate.py
-- This file is kept as historical reference only.
-- It represents the original schema before any migrations.
-- ============================================================

-- Mental Health Screening and Support Database Schema

CREATE DATABASE IF NOT EXISTS mental_health_db;
USE mental_health_db;

-- Drop existing tables to recreate with new structure
DROP TABLE IF EXISTS screening_sessions;
DROP TABLE IF EXISTS screening_questions;

-- Screening Questions Table
CREATE TABLE IF NOT EXISTS screening_questions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    category ENUM('substance_use', 'mental_health', 'trauma', 'physical', 'crisis') NOT NULL,
    question_text TEXT NOT NULL,
    question_type ENUM('multiple_choice', 'scale', 'yes_no') NOT NULL,
    options JSON,
    scoring_weight INT DEFAULT 1,
    order_index INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_category (category),
    INDEX idx_order (order_index)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Screening Sessions Table
CREATE TABLE IF NOT EXISTS screening_sessions (
    session_id VARCHAR(255) PRIMARY KEY,
    demographics JSON,
    responses JSON NOT NULL,
    results JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP NOT NULL,
    INDEX idx_created_at (created_at),
    INDEX idx_expires_at (expires_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

