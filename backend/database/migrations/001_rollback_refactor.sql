-- ============================================================================
-- ROLLBACK SCRIPT: Revert to Original Custom Screening
-- ============================================================================
-- Description: Rollback from validated instruments to original custom screening
-- Date: January 7, 2025
-- Version: 1.0
-- WARNING: This will delete all ASSIST/PHQ-9/Triggers data and restore old data
-- ============================================================================

USE mental_health_db;

-- ============================================================================
-- STEP 1: VERIFY LEGACY TABLES EXIST
-- ============================================================================

-- Check if legacy tables exist
SELECT
    TABLE_NAME,
    TABLE_ROWS
FROM information_schema.TABLES
WHERE TABLE_SCHEMA = 'mental_health_db'
AND TABLE_NAME IN ('screening_questions_legacy', 'screening_sessions_legacy');

-- If legacy tables don't exist, STOP and investigate before proceeding!

-- ============================================================================
-- STEP 2: DROP CURRENT (NEW) TABLES
-- ============================================================================

DROP TABLE IF EXISTS screening_questions;
DROP TABLE IF EXISTS screening_sessions;

-- ============================================================================
-- STEP 3: RESTORE FROM LEGACY TABLES
-- ============================================================================

-- Restore screening_questions from legacy
CREATE TABLE screening_questions AS
SELECT
    id,
    category,
    question_text,
    question_type,
    options,
    scoring_weight,
    order_index,
    created_at,
    updated_at
FROM screening_questions_legacy;

-- Restore screening_sessions from legacy
CREATE TABLE screening_sessions AS
SELECT
    session_id,
    demographics,
    responses,
    results,
    created_at,
    expires_at
FROM screening_sessions_legacy;

-- ============================================================================
-- STEP 4: RE-ADD INDEXES
-- ============================================================================

-- Add indexes to screening_questions
ALTER TABLE screening_questions
ADD INDEX idx_category (category),
ADD INDEX idx_order (order_index);

-- Add indexes to screening_sessions
ALTER TABLE screening_sessions
ADD INDEX idx_created_at (created_at),
ADD INDEX idx_expires_at (expires_at);

-- ============================================================================
-- STEP 5: VERIFY RESTORATION
-- ============================================================================

-- Verify data counts match legacy
SELECT
    'screening_questions' AS table_name,
    COUNT(*) AS current_count,
    (SELECT COUNT(*) FROM screening_questions_legacy) AS legacy_count
FROM screening_questions

UNION ALL

SELECT
    'screening_sessions' AS table_name,
    COUNT(*) AS current_count,
    (SELECT COUNT(*) FROM screening_sessions_legacy) AS legacy_count
FROM screening_sessions;

-- Verify table structures
DESCRIBE screening_questions;
DESCRIBE screening_sessions;

-- ============================================================================
-- STEP 6: OPTIONAL - REMOVE LEGACY TABLES
-- ============================================================================

-- UNCOMMENT BELOW TO DELETE LEGACY TABLES AFTER VERIFICATION
-- WARNING: This permanently removes the ability to rollback again!

-- DROP TABLE IF EXISTS screening_questions_legacy;
-- DROP TABLE IF EXISTS screening_sessions_legacy;

-- ============================================================================
-- ROLLBACK COMPLETE
-- ============================================================================
-- Next steps:
-- 1. Restart backend and AI engine services
-- 2. Test with old screening flow
-- 3. Investigate why rollback was needed
-- 4. Document issues in REFACTO_PROGRESS.md
-- ============================================================================