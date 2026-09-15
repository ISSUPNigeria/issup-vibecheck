-- ============================================================================
-- SEED DATA: WHO ASSIST V3.0 Questions (Part 2)
-- ============================================================================
-- Description: Continuation of ASSIST questions (Q4-Q8)
-- Date: January 7, 2025
-- ============================================================================

USE mental_health_db_test;

-- ============================================================================
-- Q4: HEALTH, SOCIAL, LEGAL, OR FINANCIAL PROBLEMS
-- Scoring: 0, 4, 5, 6, 7
-- ============================================================================

-- Tobacco through Other (10 substances)
INSERT INTO screening_questions (instrument, category, question_number, question_text, question_type, options, order_index) VALUES
('ASSIST', 'tobacco', 4, 'During the past 3 months, how often has your use of tobacco products led to health, social, legal or financial problems?', 'frequency', JSON_ARRAY(JSON_OBJECT('value', 0, 'label', 'Never', 'score', 0), JSON_OBJECT('value', 1, 'label', 'Once or twice', 'score', 4), JSON_OBJECT('value', 2, 'label', 'Monthly', 'score', 5), JSON_OBJECT('value', 3, 'label', 'Weekly', 'score', 6), JSON_OBJECT('value', 4, 'label', 'Daily or almost daily', 'score', 7)), 400),
('ASSIST', 'alcohol', 4, 'During the past 3 months, how often has your use of alcohol led to health, social, legal or financial problems?', 'frequency', JSON_ARRAY(JSON_OBJECT('value', 0, 'label', 'Never', 'score', 0), JSON_OBJECT('value', 1, 'label', 'Once or twice', 'score', 4), JSON_OBJECT('value', 2, 'label', 'Monthly', 'score', 5), JSON_OBJECT('value', 3, 'label', 'Weekly', 'score', 6), JSON_OBJECT('value', 4, 'label', 'Daily or almost daily', 'score', 7)), 410),
('ASSIST', 'cannabis', 4, 'During the past 3 months, how often has your use of cannabis led to health, social, legal or financial problems?', 'frequency', JSON_ARRAY(JSON_OBJECT('value', 0, 'label', 'Never', 'score', 0), JSON_OBJECT('value', 1, 'label', 'Once or twice', 'score', 4), JSON_OBJECT('value', 2, 'label', 'Monthly', 'score', 5), JSON_OBJECT('value', 3, 'label', 'Weekly', 'score', 6), JSON_OBJECT('value', 4, 'label', 'Daily or almost daily', 'score', 7)), 420),
('ASSIST', 'cocaine', 4, 'During the past 3 months, how often has your use of cocaine led to health, social, legal or financial problems?', 'frequency', JSON_ARRAY(JSON_OBJECT('value', 0, 'label', 'Never', 'score', 0), JSON_OBJECT('value', 1, 'label', 'Once or twice', 'score', 4), JSON_OBJECT('value', 2, 'label', 'Monthly', 'score', 5), JSON_OBJECT('value', 3, 'label', 'Weekly', 'score', 6), JSON_OBJECT('value', 4, 'label', 'Daily or almost daily', 'score', 7)), 430),
('ASSIST', 'amphetamines', 4, 'During the past 3 months, how often has your use of amphetamine type stimulants led to health, social, legal or financial problems?', 'frequency', JSON_ARRAY(JSON_OBJECT('value', 0, 'label', 'Never', 'score', 0), JSON_OBJECT('value', 1, 'label', 'Once or twice', 'score', 4), JSON_OBJECT('value', 2, 'label', 'Monthly', 'score', 5), JSON_OBJECT('value', 3, 'label', 'Weekly', 'score', 6), JSON_OBJECT('value', 4, 'label', 'Daily or almost daily', 'score', 7)), 440),
('ASSIST', 'inhalants', 4, 'During the past 3 months, how often has your use of inhalants led to health, social, legal or financial problems?', 'frequency', JSON_ARRAY(JSON_OBJECT('value', 0, 'label', 'Never', 'score', 0), JSON_OBJECT('value', 1, 'label', 'Once or twice', 'score', 4), JSON_OBJECT('value', 2, 'label', 'Monthly', 'score', 5), JSON_OBJECT('value', 3, 'label', 'Weekly', 'score', 6), JSON_OBJECT('value', 4, 'label', 'Daily or almost daily', 'score', 7)), 450),
('ASSIST', 'sedatives', 4, 'During the past 3 months, how often has your use of sedatives or sleeping pills led to health, social, legal or financial problems?', 'frequency', JSON_ARRAY(JSON_OBJECT('value', 0, 'label', 'Never', 'score', 0), JSON_OBJECT('value', 1, 'label', 'Once or twice', 'score', 4), JSON_OBJECT('value', 2, 'label', 'Monthly', 'score', 5), JSON_OBJECT('value', 3, 'label', 'Weekly', 'score', 6), JSON_OBJECT('value', 4, 'label', 'Daily or almost daily', 'score', 7)), 460),
('ASSIST', 'hallucinogens', 4, 'During the past 3 months, how often has your use of hallucinogens led to health, social, legal or financial problems?', 'frequency', JSON_ARRAY(JSON_OBJECT('value', 0, 'label', 'Never', 'score', 0), JSON_OBJECT('value', 1, 'label', 'Once or twice', 'score', 4), JSON_OBJECT('value', 2, 'label', 'Monthly', 'score', 5), JSON_OBJECT('value', 3, 'label', 'Weekly', 'score', 6), JSON_OBJECT('value', 4, 'label', 'Daily or almost daily', 'score', 7)), 470),
('ASSIST', 'opioids', 4, 'During the past 3 months, how often has your use of opioids led to health, social, legal or financial problems?', 'frequency', JSON_ARRAY(JSON_OBJECT('value', 0, 'label', 'Never', 'score', 0), JSON_OBJECT('value', 1, 'label', 'Once or twice', 'score', 4), JSON_OBJECT('value', 2, 'label', 'Monthly', 'score', 5), JSON_OBJECT('value', 3, 'label', 'Weekly', 'score', 6), JSON_OBJECT('value', 4, 'label', 'Daily or almost daily', 'score', 7)), 480),
('ASSIST', 'other', 4, 'During the past 3 months, how often has your use of other drugs led to health, social, legal or financial problems?', 'frequency', JSON_ARRAY(JSON_OBJECT('value', 0, 'label', 'Never', 'score', 0), JSON_OBJECT('value', 1, 'label', 'Once or twice', 'score', 4), JSON_OBJECT('value', 2, 'label', 'Monthly', 'score', 5), JSON_OBJECT('value', 3, 'label', 'Weekly', 'score', 6), JSON_OBJECT('value', 4, 'label', 'Daily or almost daily', 'score', 7)), 490);

-- ============================================================================
-- Q5: FAILED TO DO WHAT WAS EXPECTED
-- Scoring: 0, 5, 6, 7, 8
-- NOTE: NOT ASKED FOR TOBACCO (skip_for_substances includes 'tobacco')
-- ============================================================================

INSERT INTO screening_questions (instrument, category, question_number, question_text, question_type, options, order_index, skip_for_substances) VALUES
('ASSIST', 'alcohol', 5, 'During the past 3 months, how often have you failed to do what was normally expected of you because of your use of alcohol?', 'frequency', JSON_ARRAY(JSON_OBJECT('value', 0, 'label', 'Never', 'score', 0), JSON_OBJECT('value', 1, 'label', 'Once or twice', 'score', 5), JSON_OBJECT('value', 2, 'label', 'Monthly', 'score', 6), JSON_OBJECT('value', 3, 'label', 'Weekly', 'score', 7), JSON_OBJECT('value', 4, 'label', 'Daily or almost daily', 'score', 8)), 510, NULL),
('ASSIST', 'cannabis', 5, 'During the past 3 months, how often have you failed to do what was normally expected of you because of your use of cannabis?', 'frequency', JSON_ARRAY(JSON_OBJECT('value', 0, 'label', 'Never', 'score', 0), JSON_OBJECT('value', 1, 'label', 'Once or twice', 'score', 5), JSON_OBJECT('value', 2, 'label', 'Monthly', 'score', 6), JSON_OBJECT('value', 3, 'label', 'Weekly', 'score', 7), JSON_OBJECT('value', 4, 'label', 'Daily or almost daily', 'score', 8)), 520, NULL),
('ASSIST', 'cocaine', 5, 'During the past 3 months, how often have you failed to do what was normally expected of you because of your use of cocaine?', 'frequency', JSON_ARRAY(JSON_OBJECT('value', 0, 'label', 'Never', 'score', 0), JSON_OBJECT('value', 1, 'label', 'Once or twice', 'score', 5), JSON_OBJECT('value', 2, 'label', 'Monthly', 'score', 6), JSON_OBJECT('value', 3, 'label', 'Weekly', 'score', 7), JSON_OBJECT('value', 4, 'label', 'Daily or almost daily', 'score', 8)), 530, NULL),
('ASSIST', 'amphetamines', 5, 'During the past 3 months, how often have you failed to do what was normally expected of you because of your use of amphetamine type stimulants?', 'frequency', JSON_ARRAY(JSON_OBJECT('value', 0, 'label', 'Never', 'score', 0), JSON_OBJECT('value', 1, 'label', 'Once or twice', 'score', 5), JSON_OBJECT('value', 2, 'label', 'Monthly', 'score', 6), JSON_OBJECT('value', 3, 'label', 'Weekly', 'score', 7), JSON_OBJECT('value', 4, 'label', 'Daily or almost daily', 'score', 8)), 540, NULL),
('ASSIST', 'inhalants', 5, 'During the past 3 months, how often have you failed to do what was normally expected of you because of your use of inhalants?', 'frequency', JSON_ARRAY(JSON_OBJECT('value', 0, 'label', 'Never', 'score', 0), JSON_OBJECT('value', 1, 'label', 'Once or twice', 'score', 5), JSON_OBJECT('value', 2, 'label', 'Monthly', 'score', 6), JSON_OBJECT('value', 3, 'label', 'Weekly', 'score', 7), JSON_OBJECT('value', 4, 'label', 'Daily or almost daily', 'score', 8)), 550, NULL),
('ASSIST', 'sedatives', 5, 'During the past 3 months, how often have you failed to do what was normally expected of you because of your use of sedatives or sleeping pills?', 'frequency', JSON_ARRAY(JSON_OBJECT('value', 0, 'label', 'Never', 'score', 0), JSON_OBJECT('value', 1, 'label', 'Once or twice', 'score', 5), JSON_OBJECT('value', 2, 'label', 'Monthly', 'score', 6), JSON_OBJECT('value', 3, 'label', 'Weekly', 'score', 7), JSON_OBJECT('value', 4, 'label', 'Daily or almost daily', 'score', 8)), 560, NULL),
('ASSIST', 'hallucinogens', 5, 'During the past 3 months, how often have you failed to do what was normally expected of you because of your use of hallucinogens?', 'frequency', JSON_ARRAY(JSON_OBJECT('value', 0, 'label', 'Never', 'score', 0), JSON_OBJECT('value', 1, 'label', 'Once or twice', 'score', 5), JSON_OBJECT('value', 2, 'label', 'Monthly', 'score', 6), JSON_OBJECT('value', 3, 'label', 'Weekly', 'score', 7), JSON_OBJECT('value', 4, 'label', 'Daily or almost daily', 'score', 8)), 570, NULL),
('ASSIST', 'opioids', 5, 'During the past 3 months, how often have you failed to do what was normally expected of you because of your use of opioids?', 'frequency', JSON_ARRAY(JSON_OBJECT('value', 0, 'label', 'Never', 'score', 0), JSON_OBJECT('value', 1, 'label', 'Once or twice', 'score', 5), JSON_OBJECT('value', 2, 'label', 'Monthly', 'score', 6), JSON_OBJECT('value', 3, 'label', 'Weekly', 'score', 7), JSON_OBJECT('value', 4, 'label', 'Daily or almost daily', 'score', 8)), 580, NULL),
('ASSIST', 'other', 5, 'During the past 3 months, how often have you failed to do what was normally expected of you because of your use of other drugs?', 'frequency', JSON_ARRAY(JSON_OBJECT('value', 0, 'label', 'Never', 'score', 0), JSON_OBJECT('value', 1, 'label', 'Once or twice', 'score', 5), JSON_OBJECT('value', 2, 'label', 'Monthly', 'score', 6), JSON_OBJECT('value', 3, 'label', 'Weekly', 'score', 7), JSON_OBJECT('value', 4, 'label', 'Daily or almost daily', 'score', 8)), 590, NULL);

-- ============================================================================
-- Q6: CONCERN FROM FRIEND, RELATIVE OR OTHERS
-- Scoring: 0, 3, 6
-- ============================================================================

INSERT INTO screening_questions (instrument, category, question_number, question_text, question_type, options, order_index) VALUES
('ASSIST', 'tobacco', 6, 'Has a friend or relative or anyone else ever expressed concern about your use of tobacco products?', 'frequency', JSON_ARRAY(JSON_OBJECT('value', 0, 'label', 'No, never', 'score', 0), JSON_OBJECT('value', 1, 'label', 'Yes, in the past 3 months', 'score', 6), JSON_OBJECT('value', 2, 'label', 'Yes, but not in the past 3 months', 'score', 3)), 600),
('ASSIST', 'alcohol', 6, 'Has a friend or relative or anyone else ever expressed concern about your use of alcohol?', 'frequency', JSON_ARRAY(JSON_OBJECT('value', 0, 'label', 'No, never', 'score', 0), JSON_OBJECT('value', 1, 'label', 'Yes, in the past 3 months', 'score', 6), JSON_OBJECT('value', 2, 'label', 'Yes, but not in the past 3 months', 'score', 3)), 610),
('ASSIST', 'cannabis', 6, 'Has a friend or relative or anyone else ever expressed concern about your use of cannabis?', 'frequency', JSON_ARRAY(JSON_OBJECT('value', 0, 'label', 'No, never', 'score', 0), JSON_OBJECT('value', 1, 'label', 'Yes, in the past 3 months', 'score', 6), JSON_OBJECT('value', 2, 'label', 'Yes, but not in the past 3 months', 'score', 3)), 620),
('ASSIST', 'cocaine', 6, 'Has a friend or relative or anyone else ever expressed concern about your use of cocaine?', 'frequency', JSON_ARRAY(JSON_OBJECT('value', 0, 'label', 'No, never', 'score', 0), JSON_OBJECT('value', 1, 'label', 'Yes, in the past 3 months', 'score', 6), JSON_OBJECT('value', 2, 'label', 'Yes, but not in the past 3 months', 'score', 3)), 630),
('ASSIST', 'amphetamines', 6, 'Has a friend or relative or anyone else ever expressed concern about your use of amphetamine type stimulants?', 'frequency', JSON_ARRAY(JSON_OBJECT('value', 0, 'label', 'No, never', 'score', 0), JSON_OBJECT('value', 1, 'label', 'Yes, in the past 3 months', 'score', 6), JSON_OBJECT('value', 2, 'label', 'Yes, but not in the past 3 months', 'score', 3)), 640),
('ASSIST', 'inhalants', 6, 'Has a friend or relative or anyone else ever expressed concern about your use of inhalants?', 'frequency', JSON_ARRAY(JSON_OBJECT('value', 0, 'label', 'No, never', 'score', 0), JSON_OBJECT('value', 1, 'label', 'Yes, in the past 3 months', 'score', 6), JSON_OBJECT('value', 2, 'label', 'Yes, but not in the past 3 months', 'score', 3)), 650),
('ASSIST', 'sedatives', 6, 'Has a friend or relative or anyone else ever expressed concern about your use of sedatives or sleeping pills?', 'frequency', JSON_ARRAY(JSON_OBJECT('value', 0, 'label', 'No, never', 'score', 0), JSON_OBJECT('value', 1, 'label', 'Yes, in the past 3 months', 'score', 6), JSON_OBJECT('value', 2, 'label', 'Yes, but not in the past 3 months', 'score', 3)), 660),
('ASSIST', 'hallucinogens', 6, 'Has a friend or relative or anyone else ever expressed concern about your use of hallucinogens?', 'frequency', JSON_ARRAY(JSON_OBJECT('value', 0, 'label', 'No, never', 'score', 0), JSON_OBJECT('value', 1, 'label', 'Yes, in the past 3 months', 'score', 6), JSON_OBJECT('value', 2, 'label', 'Yes, but not in the past 3 months', 'score', 3)), 670),
('ASSIST', 'opioids', 6, 'Has a friend or relative or anyone else ever expressed concern about your use of opioids?', 'frequency', JSON_ARRAY(JSON_OBJECT('value', 0, 'label', 'No, never', 'score', 0), JSON_OBJECT('value', 1, 'label', 'Yes, in the past 3 months', 'score', 6), JSON_OBJECT('value', 2, 'label', 'Yes, but not in the past 3 months', 'score', 3)), 680),
('ASSIST', 'other', 6, 'Has a friend or relative or anyone else ever expressed concern about your use of other drugs?', 'frequency', JSON_ARRAY(JSON_OBJECT('value', 0, 'label', 'No, never', 'score', 0), JSON_OBJECT('value', 1, 'label', 'Yes, in the past 3 months', 'score', 6), JSON_OBJECT('value', 2, 'label', 'Yes, but not in the past 3 months', 'score', 3)), 690);

-- ============================================================================
-- Q7: TRIED AND FAILED TO CONTROL, CUT DOWN, OR STOP
-- Scoring: 0, 3, 6
-- ============================================================================

INSERT INTO screening_questions (instrument, category, question_number, question_text, question_type, options, order_index) VALUES
('ASSIST', 'tobacco', 7, 'Have you ever tried and failed to control, cut down or stop using tobacco products?', 'frequency', JSON_ARRAY(JSON_OBJECT('value', 0, 'label', 'No, never', 'score', 0), JSON_OBJECT('value', 1, 'label', 'Yes, in the past 3 months', 'score', 6), JSON_OBJECT('value', 2, 'label', 'Yes, but not in the past 3 months', 'score', 3)), 700),
('ASSIST', 'alcohol', 7, 'Have you ever tried and failed to control, cut down or stop using alcohol?', 'frequency', JSON_ARRAY(JSON_OBJECT('value', 0, 'label', 'No, never', 'score', 0), JSON_OBJECT('value', 1, 'label', 'Yes, in the past 3 months', 'score', 6), JSON_OBJECT('value', 2, 'label', 'Yes, but not in the past 3 months', 'score', 3)), 710),
('ASSIST', 'cannabis', 7, 'Have you ever tried and failed to control, cut down or stop using cannabis?', 'frequency', JSON_ARRAY(JSON_OBJECT('value', 0, 'label', 'No, never', 'score', 0), JSON_OBJECT('value', 1, 'label', 'Yes, in the past 3 months', 'score', 6), JSON_OBJECT('value', 2, 'label', 'Yes, but not in the past 3 months', 'score', 3)), 720),
('ASSIST', 'cocaine', 7, 'Have you ever tried and failed to control, cut down or stop using cocaine?', 'frequency', JSON_ARRAY(JSON_OBJECT('value', 0, 'label', 'No, never', 'score', 0), JSON_OBJECT('value', 1, 'label', 'Yes, in the past 3 months', 'score', 6), JSON_OBJECT('value', 2, 'label', 'Yes, but not in the past 3 months', 'score', 3)), 730),
('ASSIST', 'amphetamines', 7, 'Have you ever tried and failed to control, cut down or stop using amphetamine type stimulants?', 'frequency', JSON_ARRAY(JSON_OBJECT('value', 0, 'label', 'No, never', 'score', 0), JSON_OBJECT('value', 1, 'label', 'Yes, in the past 3 months', 'score', 6), JSON_OBJECT('value', 2, 'label', 'Yes, but not in the past 3 months', 'score', 3)), 740),
('ASSIST', 'inhalants', 7, 'Have you ever tried and failed to control, cut down or stop using inhalants?', 'frequency', JSON_ARRAY(JSON_OBJECT('value', 0, 'label', 'No, never', 'score', 0), JSON_OBJECT('value', 1, 'label', 'Yes, in the past 3 months', 'score', 6), JSON_OBJECT('value', 2, 'label', 'Yes, but not in the past 3 months', 'score', 3)), 750),
('ASSIST', 'sedatives', 7, 'Have you ever tried and failed to control, cut down or stop using sedatives or sleeping pills?', 'frequency', JSON_ARRAY(JSON_OBJECT('value', 0, 'label', 'No, never', 'score', 0), JSON_OBJECT('value', 1, 'label', 'Yes, in the past 3 months', 'score', 6), JSON_OBJECT('value', 2, 'label', 'Yes, but not in the past 3 months', 'score', 3)), 760),
('ASSIST', 'hallucinogens', 7, 'Have you ever tried and failed to control, cut down or stop using hallucinogens?', 'frequency', JSON_ARRAY(JSON_OBJECT('value', 0, 'label', 'No, never', 'score', 0), JSON_OBJECT('value', 1, 'label', 'Yes, in the past 3 months', 'score', 6), JSON_OBJECT('value', 2, 'label', 'Yes, but not in the past 3 months', 'score', 3)), 770),
('ASSIST', 'opioids', 7, 'Have you ever tried and failed to control, cut down or stop using opioids?', 'frequency', JSON_ARRAY(JSON_OBJECT('value', 0, 'label', 'No, never', 'score', 0), JSON_OBJECT('value', 1, 'label', 'Yes, in the past 3 months', 'score', 6), JSON_OBJECT('value', 2, 'label', 'Yes, but not in the past 3 months', 'score', 3)), 780),
('ASSIST', 'other', 7, 'Have you ever tried and failed to control, cut down or stop using other drugs?', 'frequency', JSON_ARRAY(JSON_OBJECT('value', 0, 'label', 'No, never', 'score', 0), JSON_OBJECT('value', 1, 'label', 'Yes, in the past 3 months', 'score', 6), JSON_OBJECT('value', 2, 'label', 'Yes, but not in the past 3 months', 'score', 3)), 790);

-- ============================================================================
-- Q8: INJECTION DRUG USE
-- Scoring: 0, 1, 2 (Not included in substance-specific scores)
-- ============================================================================

INSERT INTO screening_questions (instrument, category, question_number, question_text, question_type, options, order_index) VALUES
('ASSIST', 'injection', 8,
'Have you ever used any drug by injection? (NON-MEDICAL USE ONLY)',
'injection',
JSON_ARRAY(
    JSON_OBJECT('value', 0, 'label', 'No, never', 'score', 0),
    JSON_OBJECT('value', 1, 'label', 'Yes, in the past 3 months', 'score', 2),
    JSON_OBJECT('value', 2, 'label', 'Yes, but not in the past 3 months', 'score', 1)
),
800);

-- ============================================================================
-- ASSIST QUESTIONS COMPLETE
-- ============================================================================
-- Total ASSIST questions: 71 questions
-- - Q1: 1 question (lifetime use for 10 substances)
-- - Q2-Q4: 10 questions each = 30 questions
-- - Q5: 9 questions (skips tobacco)
-- - Q6-Q7: 10 questions each = 20 questions
-- - Q8: 1 question (injection)
-- Total: 1 + 30 + 9 + 20 + 1 = 71 questions
-- ============================================================================