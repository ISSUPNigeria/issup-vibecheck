-- Migration: Add chat_feedback table
-- Description: Stores user feedback (thumbs up/down) on AI chatbot responses
-- Created: 2026-01-22

CREATE TABLE IF NOT EXISTS chat_feedback (
    id INT AUTO_INCREMENT PRIMARY KEY,
    session_id VARCHAR(36) NOT NULL,
    message_index INT NOT NULL,
    rating TINYINT NOT NULL,          -- 1 = thumbs up, 0 = thumbs down
    comment TEXT,                      -- Optional comment (typically on thumbs down)
    user_message TEXT,                 -- The user's message that triggered the AI response
    ai_message TEXT,                   -- The AI response that was rated
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Verify table was created
SELECT 'chat_feedback table created successfully' AS status;