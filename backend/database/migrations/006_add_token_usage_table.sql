-- Migration 006: Add token_usage table for AI engine token tracking
-- Run on production: mysql -u root -p mental_health_db < database/migrations/006_add_token_usage_table.sql

CREATE TABLE IF NOT EXISTS token_usage (
    id INT AUTO_INCREMENT PRIMARY KEY,
    session_id VARCHAR(255) NOT NULL,
    user_id INT NULL,
    input_tokens INT NOT NULL,
    output_tokens INT NOT NULL,
    total_tokens INT NOT NULL,
    model_name VARCHAR(50) NOT NULL,
    estimated_cost_usd DECIMAL(10, 6) NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_token_session (session_id),
    INDEX idx_token_user (user_id),
    INDEX idx_token_created (created_at)
);
