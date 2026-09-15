-- Migration 002: Add users table, chat_messages table, and user_id FK to screening_sessions
-- Run with: mysql -u root -p mental_health_db < database/migrations/002_add_users_and_chat_history.sql

-- ============================================================
-- 1. Create users table
-- ============================================================
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nickname VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    hashed_password VARCHAR(255) NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_users_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ============================================================
-- 2. Add user_id FK to screening_sessions (nullable — guests stay NULL)
-- ============================================================
ALTER TABLE screening_sessions
    ADD COLUMN user_id INT NULL,
    ADD CONSTRAINT fk_screening_sessions_user
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL;

CREATE INDEX idx_screening_sessions_user_id ON screening_sessions(user_id);


-- ============================================================
-- 3. Create chat_messages table
-- ============================================================
CREATE TABLE IF NOT EXISTS chat_messages (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    session_id VARCHAR(255) NOT NULL,
    role ENUM('user', 'assistant') NOT NULL,
    content TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_chat_messages_user
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_chat_messages_session
        FOREIGN KEY (session_id) REFERENCES screening_sessions(session_id) ON DELETE CASCADE,
    INDEX idx_chat_messages_user_session (user_id, session_id),
    INDEX idx_chat_messages_session (session_id),
    INDEX idx_chat_messages_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
