-- ============================================================================
-- MIGRATION SCRIPT: Refactor to Validated Instruments
-- ============================================================================
-- Description: Migrate from custom screening questions to WHO ASSIST V3.0,
--              PHQ-9, and Triggers Assessment
-- Date: January 7, 2025
-- Version: 1.0
-- ============================================================================

USE mental_health_db;

-- ============================================================================
-- STEP 1: BACKUP EXISTING DATA (Archive as Legacy)
-- ============================================================================

-- Create legacy tables to preserve old data
CREATE TABLE IF NOT EXISTS screening_questions_legacy AS
SELECT * FROM screening_questions;

CREATE TABLE IF NOT EXISTS screening_sessions_legacy AS
SELECT * FROM screening_sessions;

-- Add metadata to legacy tables
ALTER TABLE screening_questions_legacy
ADD COLUMN archived_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

ALTER TABLE screening_sessions_legacy
ADD COLUMN archived_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

-- ============================================================================
-- STEP 2: DROP AND RECREATE screening_questions TABLE
-- ============================================================================

-- Drop existing screening_questions table
DROP TABLE IF EXISTS screening_questions;

-- Create new screening_questions table with instrument support
CREATE TABLE screening_questions (
    id INT AUTO_INCREMENT PRIMARY KEY,

    -- Instrument identification
    instrument ENUM('ASSIST', 'PHQ9', 'EXTERNAL_TRIGGERS', 'INTERNAL_TRIGGERS') NOT NULL,

    -- Category/Substance name (for ASSIST)
    -- For ASSIST: 'tobacco', 'alcohol', 'cannabis', 'cocaine', 'amphetamines',
    --             'inhalants', 'sedatives', 'hallucinogens', 'opioids', 'other'
    -- For PHQ9: 'depression'
    -- For TRIGGERS: 'external', 'internal'
    category VARCHAR(100),

    -- Question number within instrument
    -- ASSIST: 1-8 (Q1=lifetime, Q2-Q7=substance-specific, Q8=injection)
    -- PHQ9: 1-9 (Q1-Q9=depression symptoms)
    -- TRIGGERS: NULL (checklist items)
    question_number INT,

    -- Question text
    question_text TEXT NOT NULL,

    -- Question type
    question_type ENUM(
        'lifetime_use',      -- ASSIST Q1
        'frequency',         -- ASSIST Q2, Q3, Q4, Q5, Q6, Q7
        'injection',         -- ASSIST Q8
        'depression_scale',  -- PHQ9 Q1-Q9 (0-3 scale)
        'functional_scale',  -- PHQ9 functional impairment
        'trigger_checkbox'   -- Triggers (checklist)
    ) NOT NULL,

    -- Response options with scores (JSON)
    -- Example for ASSIST Q2:
    -- [
    --   {"value": 0, "label": "Never", "score": 0},
    --   {"value": 1, "label": "Once or twice", "score": 2},
    --   {"value": 2, "label": "Monthly", "score": 3},
    --   {"value": 3, "label": "Weekly", "score": 4},
    --   {"value": 4, "label": "Daily or almost daily", "score": 6}
    -- ]
    options JSON,

    -- Display order
    order_index INT NOT NULL,

    -- Additional metadata
    is_crisis_question BOOLEAN DEFAULT FALSE,  -- PHQ9 Q9
    skip_for_substances JSON,  -- ASSIST Q5 skipped for tobacco

    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    -- Indexes for performance
    INDEX idx_instrument (instrument),
    INDEX idx_category (category),
    INDEX idx_question_number (question_number),
    INDEX idx_order (order_index)

) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- STEP 3: UPDATE screening_sessions TABLE STRUCTURE
-- ============================================================================

-- Note: We keep the existing table structure, but document the new JSON formats
-- The JSON structure will be enforced in the application layer

-- Add comment to screening_sessions table documenting new structure
ALTER TABLE screening_sessions
COMMENT = 'Responses and results now use new JSON structure for ASSIST, PHQ-9, and Triggers';

-- ============================================================================
-- STEP 4: CLEAR OLD DATA (Clean Slate Approach)
-- ============================================================================

-- Truncate screening_questions (old custom questions)
TRUNCATE TABLE screening_questions;

-- Truncate screening_sessions (old sessions)
-- Note: All old sessions are archived in screening_sessions_legacy
TRUNCATE TABLE screening_sessions;

-- ============================================================================
-- STEP 5: VERIFICATION
-- ============================================================================

-- Verify legacy tables were created and populated
SELECT
    'screening_questions_legacy' AS table_name,
    COUNT(*) AS row_count
FROM screening_questions_legacy

UNION ALL

SELECT
    'screening_sessions_legacy' AS table_name,
    COUNT(*) AS row_count
FROM screening_sessions_legacy;

-- Verify new screening_questions structure
DESCRIBE screening_questions;

-- ============================================================================
-- MIGRATION COMPLETE
-- ============================================================================
-- Next steps:
-- 1. Run seed scripts to populate:
--    - database/seeds/assist_questions.sql (80 ASSIST questions)
--    - database/seeds/phq9_questions.sql (10 PHQ-9 questions)
--    - database/seeds/trigger_items.sql (80+ trigger items)
-- 2. Test with sample screening submission
-- 3. Verify scoring calculations
-- ============================================================================