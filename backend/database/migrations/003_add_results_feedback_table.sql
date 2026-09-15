-- Migration: Add results_feedback table
-- Purpose: Store user feedback (thumbs up/down) on Results page tabs
-- Date: 2026-01-23

CREATE TABLE IF NOT EXISTS results_feedback (
    id INT AUTO_INCREMENT PRIMARY KEY,
    session_id VARCHAR(36) NOT NULL,
    tab_name VARCHAR(50) NOT NULL,  -- overview, assist, phq9, triggers, next-steps
    rating TINYINT NOT NULL,  -- 1 = thumbs up, 0 = thumbs down
    comment TEXT,  -- Optional feedback comment (typically on thumbs down)
    tab_content_summary JSON,  -- Snapshot of key data shown (scores, risk levels, AI feedback)
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    -- Index for quick lookups by session
    INDEX idx_session_id (session_id),

    -- Index for analytics queries
    INDEX idx_tab_rating (tab_name, rating),

    -- Unique constraint to allow only one feedback per session per tab
    -- But we allow updates (re-rating) via the updated_at field
    UNIQUE KEY unique_session_tab (session_id, tab_name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Example tab_content_summary for each tab type:
--
-- Overview tab:
-- {
--   "tab": "overview",
--   "overall_severity": "moderate",
--   "assist_risk": "moderate",
--   "phq9_severity": "mild",
--   "triggers_count": 5,
--   "ai_overall_message_shown": true
-- }
--
-- ASSIST tab:
-- {
--   "tab": "assist",
--   "overall_risk": "moderate",
--   "substances_assessed": ["alcohol", "cannabis"],
--   "scores": {"alcohol": 15, "cannabis": 8},
--   "ai_feedback_shown": true
-- }
--
-- PHQ-9 tab:
-- {
--   "tab": "phq9",
--   "total_score": 12,
--   "severity": "moderate",
--   "suicidal_ideation": false,
--   "ai_feedback_shown": true
-- }
--
-- Triggers tab:
-- {
--   "tab": "triggers",
--   "total_triggers": 8,
--   "external_count": 5,
--   "internal_count": 3,
--   "trigger_pattern": "moderate",
--   "ai_feedback_shown": true
-- }
--
-- Next Steps tab:
-- {
--   "tab": "next-steps",
--   "steps_count": 4,
--   "ai_steps_shown": true
-- }
