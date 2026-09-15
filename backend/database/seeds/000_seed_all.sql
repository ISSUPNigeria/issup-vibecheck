-- ============================================================================
-- MASTER SEED SCRIPT: Load All Validated Instrument Questions
-- ============================================================================
-- Description: Executes all seed scripts in correct order
-- Date: January 7, 2025
-- Usage: mysql -u root -p mental_health_db < database/seeds/000_seed_all.sql
-- ============================================================================

USE mental_health_db;

-- ============================================================================
-- VERIFICATION: Ensure tables are empty before seeding
-- ============================================================================

SELECT 'Checking screening_questions table...' AS status;
SELECT COUNT(*) AS current_question_count FROM screening_questions;

-- ============================================================================
-- STEP 1: Load ASSIST Questions (Part 1 & Part 2)
-- ============================================================================

SELECT 'Loading ASSIST questions (Part 1: Q1-Q3)...' AS status;
SOURCE database/seeds/assist_questions.sql;

SELECT 'Loading ASSIST questions (Part 2: Q4-Q8)...' AS status;
SOURCE database/seeds/assist_questions_part2.sql;

-- Verify ASSIST loaded
SELECT 'ASSIST questions loaded:' AS status;
SELECT instrument, COUNT(*) AS question_count
FROM screening_questions
WHERE instrument = 'ASSIST'
GROUP BY instrument;

-- ============================================================================
-- STEP 2: Load PHQ-9 Questions
-- ============================================================================

SELECT 'Loading PHQ-9 questions...' AS status;
SOURCE database/seeds/phq9_questions.sql;

-- Verify PHQ-9 loaded
SELECT 'PHQ-9 questions loaded:' AS status;
SELECT instrument, COUNT(*) AS question_count
FROM screening_questions
WHERE instrument = 'PHQ9'
GROUP BY instrument;

-- ============================================================================
-- STEP 3: Load Triggers Items
-- ============================================================================

SELECT 'Loading Triggers assessment items...' AS status;
SOURCE database/seeds/trigger_items.sql;

-- Verify Triggers loaded
SELECT 'Triggers items loaded:' AS status;
SELECT instrument, COUNT(*) AS question_count
FROM screening_questions
WHERE instrument IN ('EXTERNAL_TRIGGERS', 'INTERNAL_TRIGGERS')
GROUP BY instrument;

-- ============================================================================
-- FINAL VERIFICATION
-- ============================================================================

SELECT '=== SEED DATA COMPLETE ===' AS status;
SELECT
    instrument,
    COUNT(*) AS total_questions,
    MIN(order_index) AS first_order,
    MAX(order_index) AS last_order
FROM screening_questions
GROUP BY instrument
ORDER BY MIN(order_index);

-- Expected counts:
-- ASSIST: ~71 questions
-- PHQ9: 10 questions
-- EXTERNAL_TRIGGERS: ~43 items
-- INTERNAL_TRIGGERS: ~40 items
-- TOTAL: ~164 questions/items

SELECT 'Total questions in database:' AS status;
SELECT COUNT(*) AS grand_total FROM screening_questions;

-- ============================================================================
-- SEED COMPLETE - Ready for Phase 2 Backend Implementation
-- ============================================================================