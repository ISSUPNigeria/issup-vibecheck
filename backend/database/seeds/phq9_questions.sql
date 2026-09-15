-- ============================================================================
-- SEED DATA: PHQ-9 (Patient Health Questionnaire-9)
-- ============================================================================
-- Description: 9 depression questions + 1 functional impairment question
-- Scoring: Each question 0-3, Total 0-27
-- Date: January 7, 2025
-- ============================================================================

USE mental_health_db_test;

-- ============================================================================
-- PHQ-9 QUESTIONS (Q1-Q9)
-- Scoring: 0 = Not at all, 1 = Several days, 2 = More than half the days,
--          3 = Nearly every day
-- ============================================================================

INSERT INTO screening_questions (instrument, category, question_number, question_text, question_type, options, order_index, is_crisis_question) VALUES

-- Q1: Anhedonia (loss of interest or pleasure)
('PHQ9', 'depression', 1,
'Over the last 2 weeks, how often have you been bothered by little interest or pleasure in doing things?',
'depression_scale',
JSON_ARRAY(
    JSON_OBJECT('value', 0, 'label', 'Not at all', 'score', 0),
    JSON_OBJECT('value', 1, 'label', 'Several days', 'score', 1),
    JSON_OBJECT('value', 2, 'label', 'More than half the days', 'score', 2),
    JSON_OBJECT('value', 3, 'label', 'Nearly every day', 'score', 3)
),
1000, FALSE),

-- Q2: Depressed mood
('PHQ9', 'depression', 2,
'Over the last 2 weeks, how often have you been bothered by feeling down, depressed, or hopeless?',
'depression_scale',
JSON_ARRAY(
    JSON_OBJECT('value', 0, 'label', 'Not at all', 'score', 0),
    JSON_OBJECT('value', 1, 'label', 'Several days', 'score', 1),
    JSON_OBJECT('value', 2, 'label', 'More than half the days', 'score', 2),
    JSON_OBJECT('value', 3, 'label', 'Nearly every day', 'score', 3)
),
1010, FALSE),

-- Q3: Sleep problems
('PHQ9', 'depression', 3,
'Over the last 2 weeks, how often have you been bothered by trouble falling or staying asleep, or sleeping too much?',
'depression_scale',
JSON_ARRAY(
    JSON_OBJECT('value', 0, 'label', 'Not at all', 'score', 0),
    JSON_OBJECT('value', 1, 'label', 'Several days', 'score', 1),
    JSON_OBJECT('value', 2, 'label', 'More than half the days', 'score', 2),
    JSON_OBJECT('value', 3, 'label', 'Nearly every day', 'score', 3)
),
1020, FALSE),

-- Q4: Fatigue/low energy
('PHQ9', 'depression', 4,
'Over the last 2 weeks, how often have you been bothered by feeling tired or having little energy?',
'depression_scale',
JSON_ARRAY(
    JSON_OBJECT('value', 0, 'label', 'Not at all', 'score', 0),
    JSON_OBJECT('value', 1, 'label', 'Several days', 'score', 1),
    JSON_OBJECT('value', 2, 'label', 'More than half the days', 'score', 2),
    JSON_OBJECT('value', 3, 'label', 'Nearly every day', 'score', 3)
),
1030, FALSE),

-- Q5: Appetite problems
('PHQ9', 'depression', 5,
'Over the last 2 weeks, how often have you been bothered by poor appetite or overeating?',
'depression_scale',
JSON_ARRAY(
    JSON_OBJECT('value', 0, 'label', 'Not at all', 'score', 0),
    JSON_OBJECT('value', 1, 'label', 'Several days', 'score', 1),
    JSON_OBJECT('value', 2, 'label', 'More than half the days', 'score', 2),
    JSON_OBJECT('value', 3, 'label', 'Nearly every day', 'score', 3)
),
1040, FALSE),

-- Q6: Low self-esteem/guilt
('PHQ9', 'depression', 6,
'Over the last 2 weeks, how often have you been bothered by feeling bad about yourself - or that you are a failure or have let yourself or your family down?',
'depression_scale',
JSON_ARRAY(
    JSON_OBJECT('value', 0, 'label', 'Not at all', 'score', 0),
    JSON_OBJECT('value', 1, 'label', 'Several days', 'score', 1),
    JSON_OBJECT('value', 2, 'label', 'More than half the days', 'score', 2),
    JSON_OBJECT('value', 3, 'label', 'Nearly every day', 'score', 3)
),
1050, FALSE),

-- Q7: Concentration problems
('PHQ9', 'depression', 7,
'Over the last 2 weeks, how often have you been bothered by trouble concentrating on things, such as reading the newspaper or watching television?',
'depression_scale',
JSON_ARRAY(
    JSON_OBJECT('value', 0, 'label', 'Not at all', 'score', 0),
    JSON_OBJECT('value', 1, 'label', 'Several days', 'score', 1),
    JSON_OBJECT('value', 2, 'label', 'More than half the days', 'score', 2),
    JSON_OBJECT('value', 3, 'label', 'Nearly every day', 'score', 3)
),
1060, FALSE),

-- Q8: Psychomotor agitation/retardation
('PHQ9', 'depression', 8,
'Over the last 2 weeks, how often have you been bothered by moving or speaking so slowly that other people could have noticed? Or the opposite - being so fidgety or restless that you have been moving around a lot more than usual?',
'depression_scale',
JSON_ARRAY(
    JSON_OBJECT('value', 0, 'label', 'Not at all', 'score', 0),
    JSON_OBJECT('value', 1, 'label', 'Several days', 'score', 1),
    JSON_OBJECT('value', 2, 'label', 'More than half the days', 'score', 2),
    JSON_OBJECT('value', 3, 'label', 'Nearly every day', 'score', 3)
),
1070, FALSE),

-- Q9: Suicidal ideation (CRISIS QUESTION)
('PHQ9', 'depression', 9,
'Over the last 2 weeks, how often have you been bothered by thoughts that you would be better off dead or of hurting yourself in some way?',
'depression_scale',
JSON_ARRAY(
    JSON_OBJECT('value', 0, 'label', 'Not at all', 'score', 0),
    JSON_OBJECT('value', 1, 'label', 'Several days', 'score', 1),
    JSON_OBJECT('value', 2, 'label', 'More than half the days', 'score', 2),
    JSON_OBJECT('value', 3, 'label', 'Nearly every day', 'score', 3)
),
1080, TRUE);

-- ============================================================================
-- FUNCTIONAL IMPAIRMENT QUESTION
-- Not scored in PHQ-9 total, but important for clinical assessment
-- ============================================================================

INSERT INTO screening_questions (instrument, category, question_number, question_text, question_type, options, order_index) VALUES
('PHQ9', 'functional_impairment', 10,
'If you checked off any problems, how difficult have these problems made it for you to do your work, take care of things at home, or get along with other people?',
'functional_scale',
JSON_ARRAY(
    JSON_OBJECT('value', 0, 'label', 'Not difficult at all'),
    JSON_OBJECT('value', 1, 'label', 'Somewhat difficult'),
    JSON_OBJECT('value', 2, 'label', 'Very difficult'),
    JSON_OBJECT('value', 3, 'label', 'Extremely difficult')
),
1090);

-- ============================================================================
-- PHQ-9 COMPLETE
-- ============================================================================
-- Total PHQ-9 questions: 10 questions
-- - Q1-Q9: Depression symptoms (scored 0-27)
-- - Q10: Functional impairment (not scored, clinical assessment)
--
-- Scoring Interpretation:
-- - 0-4: Minimal depression
-- - 5-9: Mild depression
-- - 10-14: Moderate depression (clinical threshold)
-- - 15-19: Moderately severe depression
-- - 20-27: Severe depression
--
-- Crisis Detection: Q9 > 0 indicates suicidal ideation
-- ============================================================================