-- ============================================================================
-- SEED DATA: WHO ASSIST V3.0 Questions
-- ============================================================================
-- Description: 80+ questions for WHO ASSIST (Alcohol, Smoking and Substance
--              Involvement Screening Test) Version 3.0
-- Structure: Q1 (lifetime use) + Q2-Q7 (per substance × 10) + Q8 (injection)
-- Total: 1 + (6-7 × 10 substances) + 1 = 80 questions
-- Date: January 7, 2025
-- ============================================================================

USE mental_health_db_test;

-- ============================================================================
-- Q1: LIFETIME USE (Checkbox for 10 substances)
-- ============================================================================

INSERT INTO screening_questions (instrument, category, question_number, question_text, question_type, options, order_index) VALUES
('ASSIST', 'lifetime_use', 1,
'In your life, which of the following substances have you ever used? (NON-MEDICAL USE ONLY)',
'lifetime_use',
JSON_ARRAY(
    JSON_OBJECT('value', 'tobacco', 'label', 'Tobacco products (cigarettes, chewing tobacco, cigars, etc.)'),
    JSON_OBJECT('value', 'alcohol', 'label', 'Alcoholic beverages (beer, wine, spirits, etc.)'),
    JSON_OBJECT('value', 'cannabis', 'label', 'Cannabis (marijuana, pot, grass, hash, etc.)'),
    JSON_OBJECT('value', 'cocaine', 'label', 'Cocaine (coke, crack, etc.)'),
    JSON_OBJECT('value', 'amphetamines', 'label', 'Amphetamine type stimulants (speed, diet pills, ecstasy, etc.)'),
    JSON_OBJECT('value', 'inhalants', 'label', 'Inhalants (nitrous, glue, petrol, paint thinner, etc.)'),
    JSON_OBJECT('value', 'sedatives', 'label', 'Sedatives or sleeping pills (Valium, Serepax, Rohypnol, etc.)'),
    JSON_OBJECT('value', 'hallucinogens', 'label', 'Hallucinogens (LSD, acid, mushrooms, PCP, Special K, etc.)'),
    JSON_OBJECT('value', 'opioids', 'label', 'Opioids (heroin, morphine, methadone, codeine, etc.)'),
    JSON_OBJECT('value', 'other', 'label', 'Other - please specify')
),
100);

-- ============================================================================
-- Q2: FREQUENCY OF USE (In the past 3 months)
-- Scoring: 0, 2, 3, 4, 6
-- ============================================================================

-- Tobacco
INSERT INTO screening_questions (instrument, category, question_number, question_text, question_type, options, order_index) VALUES
('ASSIST', 'tobacco', 2,
'In the past 3 months, how often have you used tobacco products (cigarettes, chewing tobacco, cigars, etc.)?',
'frequency',
JSON_ARRAY(
    JSON_OBJECT('value', 0, 'label', 'Never', 'score', 0),
    JSON_OBJECT('value', 1, 'label', 'Once or twice', 'score', 2),
    JSON_OBJECT('value', 2, 'label', 'Monthly', 'score', 3),
    JSON_OBJECT('value', 3, 'label', 'Weekly', 'score', 4),
    JSON_OBJECT('value', 4, 'label', 'Daily or almost daily', 'score', 6)
),
200);

-- Alcohol
INSERT INTO screening_questions (instrument, category, question_number, question_text, question_type, options, order_index) VALUES
('ASSIST', 'alcohol', 2,
'In the past 3 months, how often have you had a drink containing alcohol?',
'frequency',
JSON_ARRAY(
    JSON_OBJECT('value', 0, 'label', 'Never', 'score', 0),
    JSON_OBJECT('value', 1, 'label', 'Once or twice', 'score', 2),
    JSON_OBJECT('value', 2, 'label', 'Monthly', 'score', 3),
    JSON_OBJECT('value', 3, 'label', 'Weekly', 'score', 4),
    JSON_OBJECT('value', 4, 'label', 'Daily or almost daily', 'score', 6)
),
210);

-- Cannabis
INSERT INTO screening_questions (instrument, category, question_number, question_text, question_type, options, order_index) VALUES
('ASSIST', 'cannabis', 2,
'In the past 3 months, how often have you used cannabis (marijuana, pot, grass, hash, etc.)?',
'frequency',
JSON_ARRAY(
    JSON_OBJECT('value', 0, 'label', 'Never', 'score', 0),
    JSON_OBJECT('value', 1, 'label', 'Once or twice', 'score', 2),
    JSON_OBJECT('value', 2, 'label', 'Monthly', 'score', 3),
    JSON_OBJECT('value', 3, 'label', 'Weekly', 'score', 4),
    JSON_OBJECT('value', 4, 'label', 'Daily or almost daily', 'score', 6)
),
220);

-- Cocaine
INSERT INTO screening_questions (instrument, category, question_number, question_text, question_type, options, order_index) VALUES
('ASSIST', 'cocaine', 2,
'In the past 3 months, how often have you used cocaine (coke, crack, etc.)?',
'frequency',
JSON_ARRAY(
    JSON_OBJECT('value', 0, 'label', 'Never', 'score', 0),
    JSON_OBJECT('value', 1, 'label', 'Once or twice', 'score', 2),
    JSON_OBJECT('value', 2, 'label', 'Monthly', 'score', 3),
    JSON_OBJECT('value', 3, 'label', 'Weekly', 'score', 4),
    JSON_OBJECT('value', 4, 'label', 'Daily or almost daily', 'score', 6)
),
230);

-- Amphetamines
INSERT INTO screening_questions (instrument, category, question_number, question_text, question_type, options, order_index) VALUES
('ASSIST', 'amphetamines', 2,
'In the past 3 months, how often have you used amphetamine type stimulants (speed, diet pills, ecstasy, etc.)?',
'frequency',
JSON_ARRAY(
    JSON_OBJECT('value', 0, 'label', 'Never', 'score', 0),
    JSON_OBJECT('value', 1, 'label', 'Once or twice', 'score', 2),
    JSON_OBJECT('value', 2, 'label', 'Monthly', 'score', 3),
    JSON_OBJECT('value', 3, 'label', 'Weekly', 'score', 4),
    JSON_OBJECT('value', 4, 'label', 'Daily or almost daily', 'score', 6)
),
240);

-- Inhalants
INSERT INTO screening_questions (instrument, category, question_number, question_text, question_type, options, order_index) VALUES
('ASSIST', 'inhalants', 2,
'In the past 3 months, how often have you used inhalants (nitrous, glue, petrol, paint thinner, etc.)?',
'frequency',
JSON_ARRAY(
    JSON_OBJECT('value', 0, 'label', 'Never', 'score', 0),
    JSON_OBJECT('value', 1, 'label', 'Once or twice', 'score', 2),
    JSON_OBJECT('value', 2, 'label', 'Monthly', 'score', 3),
    JSON_OBJECT('value', 3, 'label', 'Weekly', 'score', 4),
    JSON_OBJECT('value', 4, 'label', 'Daily or almost daily', 'score', 6)
),
250);

-- Sedatives
INSERT INTO screening_questions (instrument, category, question_number, question_text, question_type, options, order_index) VALUES
('ASSIST', 'sedatives', 2,
'In the past 3 months, how often have you used sedatives or sleeping pills (Valium, Serepax, Rohypnol, etc.)?',
'frequency',
JSON_ARRAY(
    JSON_OBJECT('value', 0, 'label', 'Never', 'score', 0),
    JSON_OBJECT('value', 1, 'label', 'Once or twice', 'score', 2),
    JSON_OBJECT('value', 2, 'label', 'Monthly', 'score', 3),
    JSON_OBJECT('value', 3, 'label', 'Weekly', 'score', 4),
    JSON_OBJECT('value', 4, 'label', 'Daily or almost daily', 'score', 6)
),
260);

-- Hallucinogens
INSERT INTO screening_questions (instrument, category, question_number, question_text, question_type, options, order_index) VALUES
('ASSIST', 'hallucinogens', 2,
'In the past 3 months, how often have you used hallucinogens (LSD, acid, mushrooms, PCP, Special K, etc.)?',
'frequency',
JSON_ARRAY(
    JSON_OBJECT('value', 0, 'label', 'Never', 'score', 0),
    JSON_OBJECT('value', 1, 'label', 'Once or twice', 'score', 2),
    JSON_OBJECT('value', 2, 'label', 'Monthly', 'score', 3),
    JSON_OBJECT('value', 3, 'label', 'Weekly', 'score', 4),
    JSON_OBJECT('value', 4, 'label', 'Daily or almost daily', 'score', 6)
),
270);

-- Opioids
INSERT INTO screening_questions (instrument, category, question_number, question_text, question_type, options, order_index) VALUES
('ASSIST', 'opioids', 2,
'In the past 3 months, how often have you used opioids (heroin, morphine, methadone, codeine, etc.)?',
'frequency',
JSON_ARRAY(
    JSON_OBJECT('value', 0, 'label', 'Never', 'score', 0),
    JSON_OBJECT('value', 1, 'label', 'Once or twice', 'score', 2),
    JSON_OBJECT('value', 2, 'label', 'Monthly', 'score', 3),
    JSON_OBJECT('value', 3, 'label', 'Weekly', 'score', 4),
    JSON_OBJECT('value', 4, 'label', 'Daily or almost daily', 'score', 6)
),
280);

-- Other
INSERT INTO screening_questions (instrument, category, question_number, question_text, question_type, options, order_index) VALUES
('ASSIST', 'other', 2,
'In the past 3 months, how often have you used other drugs?',
'frequency',
JSON_ARRAY(
    JSON_OBJECT('value', 0, 'label', 'Never', 'score', 0),
    JSON_OBJECT('value', 1, 'label', 'Once or twice', 'score', 2),
    JSON_OBJECT('value', 2, 'label', 'Monthly', 'score', 3),
    JSON_OBJECT('value', 3, 'label', 'Weekly', 'score', 4),
    JSON_OBJECT('value', 4, 'label', 'Daily or almost daily', 'score', 6)
),
290);

-- ============================================================================
-- Q3: STRONG DESIRE OR URGE TO USE
-- Scoring: 0, 3, 4, 5, 6
-- ============================================================================

-- Tobacco
INSERT INTO screening_questions (instrument, category, question_number, question_text, question_type, options, order_index) VALUES
('ASSIST', 'tobacco', 3,
'During the past 3 months, how often have you had a strong desire or urge to use tobacco products?',
'frequency',
JSON_ARRAY(
    JSON_OBJECT('value', 0, 'label', 'Never', 'score', 0),
    JSON_OBJECT('value', 1, 'label', 'Once or twice', 'score', 3),
    JSON_OBJECT('value', 2, 'label', 'Monthly', 'score', 4),
    JSON_OBJECT('value', 3, 'label', 'Weekly', 'score', 5),
    JSON_OBJECT('value', 4, 'label', 'Daily or almost daily', 'score', 6)
),
300);

-- Alcohol
INSERT INTO screening_questions (instrument, category, question_number, question_text, question_type, options, order_index) VALUES
('ASSIST', 'alcohol', 3,
'During the past 3 months, how often have you had a strong desire or urge to use alcohol?',
'frequency',
JSON_ARRAY(
    JSON_OBJECT('value', 0, 'label', 'Never', 'score', 0),
    JSON_OBJECT('value', 1, 'label', 'Once or twice', 'score', 3),
    JSON_OBJECT('value', 2, 'label', 'Monthly', 'score', 4),
    JSON_OBJECT('value', 3, 'label', 'Weekly', 'score', 5),
    JSON_OBJECT('value', 4, 'label', 'Daily or almost daily', 'score', 6)
),
310);

-- Cannabis
INSERT INTO screening_questions (instrument, category, question_number, question_text, question_type, options, order_index) VALUES
('ASSIST', 'cannabis', 3,
'During the past 3 months, how often have you had a strong desire or urge to use cannabis?',
'frequency',
JSON_ARRAY(
    JSON_OBJECT('value', 0, 'label', 'Never', 'score', 0),
    JSON_OBJECT('value', 1, 'label', 'Once or twice', 'score', 3),
    JSON_OBJECT('value', 2, 'label', 'Monthly', 'score', 4),
    JSON_OBJECT('value', 3, 'label', 'Weekly', 'score', 5),
    JSON_OBJECT('value', 4, 'label', 'Daily or almost daily', 'score', 6)
),
320);

-- Cocaine
INSERT INTO screening_questions (instrument, category, question_number, question_text, question_type, options, order_index) VALUES
('ASSIST', 'cocaine', 3,
'During the past 3 months, how often have you had a strong desire or urge to use cocaine?',
'frequency',
JSON_ARRAY(
    JSON_OBJECT('value', 0, 'label', 'Never', 'score', 0),
    JSON_OBJECT('value', 1, 'label', 'Once or twice', 'score', 3),
    JSON_OBJECT('value', 2, 'label', 'Monthly', 'score', 4),
    JSON_OBJECT('value', 3, 'label', 'Weekly', 'score', 5),
    JSON_OBJECT('value', 4, 'label', 'Daily or almost daily', 'score', 6)
),
330);

-- Amphetamines
INSERT INTO screening_questions (instrument, category, question_number, question_text, question_type, options, order_index) VALUES
('ASSIST', 'amphetamines', 3,
'During the past 3 months, how often have you had a strong desire or urge to use amphetamine type stimulants?',
'frequency',
JSON_ARRAY(
    JSON_OBJECT('value', 0, 'label', 'Never', 'score', 0),
    JSON_OBJECT('value', 1, 'label', 'Once or twice', 'score', 3),
    JSON_OBJECT('value', 2, 'label', 'Monthly', 'score', 4),
    JSON_OBJECT('value', 3, 'label', 'Weekly', 'score', 5),
    JSON_OBJECT('value', 4, 'label', 'Daily or almost daily', 'score', 6)
),
340);

-- Inhalants
INSERT INTO screening_questions (instrument, category, question_number, question_text, question_type, options, order_index) VALUES
('ASSIST', 'inhalants', 3,
'During the past 3 months, how often have you had a strong desire or urge to use inhalants?',
'frequency',
JSON_ARRAY(
    JSON_OBJECT('value', 0, 'label', 'Never', 'score', 0),
    JSON_OBJECT('value', 1, 'label', 'Once or twice', 'score', 3),
    JSON_OBJECT('value', 2, 'label', 'Monthly', 'score', 4),
    JSON_OBJECT('value', 3, 'label', 'Weekly', 'score', 5),
    JSON_OBJECT('value', 4, 'label', 'Daily or almost daily', 'score', 6)
),
350);

-- Sedatives
INSERT INTO screening_questions (instrument, category, question_number, question_text, question_type, options, order_index) VALUES
('ASSIST', 'sedatives', 3,
'During the past 3 months, how often have you had a strong desire or urge to use sedatives or sleeping pills?',
'frequency',
JSON_ARRAY(
    JSON_OBJECT('value', 0, 'label', 'Never', 'score', 0),
    JSON_OBJECT('value', 1, 'label', 'Once or twice', 'score', 3),
    JSON_OBJECT('value', 2, 'label', 'Monthly', 'score', 4),
    JSON_OBJECT('value', 3, 'label', 'Weekly', 'score', 5),
    JSON_OBJECT('value', 4, 'label', 'Daily or almost daily', 'score', 6)
),
360);

-- Hallucinogens
INSERT INTO screening_questions (instrument, category, question_number, question_text, question_type, options, order_index) VALUES
('ASSIST', 'hallucinogens', 3,
'During the past 3 months, how often have you had a strong desire or urge to use hallucinogens?',
'frequency',
JSON_ARRAY(
    JSON_OBJECT('value', 0, 'label', 'Never', 'score', 0),
    JSON_OBJECT('value', 1, 'label', 'Once or twice', 'score', 3),
    JSON_OBJECT('value', 2, 'label', 'Monthly', 'score', 4),
    JSON_OBJECT('value', 3, 'label', 'Weekly', 'score', 5),
    JSON_OBJECT('value', 4, 'label', 'Daily or almost daily', 'score', 6)
),
370);

-- Opioids
INSERT INTO screening_questions (instrument, category, question_number, question_text, question_type, options, order_index) VALUES
('ASSIST', 'opioids', 3,
'During the past 3 months, how often have you had a strong desire or urge to use opioids?',
'frequency',
JSON_ARRAY(
    JSON_OBJECT('value', 0, 'label', 'Never', 'score', 0),
    JSON_OBJECT('value', 1, 'label', 'Once or twice', 'score', 3),
    JSON_OBJECT('value', 2, 'label', 'Monthly', 'score', 4),
    JSON_OBJECT('value', 3, 'label', 'Weekly', 'score', 5),
    JSON_OBJECT('value', 4, 'label', 'Daily or almost daily', 'score', 6)
),
380);

-- Other
INSERT INTO screening_questions (instrument, category, question_number, question_text, question_type, options, order_index) VALUES
('ASSIST', 'other', 3,
'During the past 3 months, how often have you had a strong desire or urge to use other drugs?',
'frequency',
JSON_ARRAY(
    JSON_OBJECT('value', 0, 'label', 'Never', 'score', 0),
    JSON_OBJECT('value', 1, 'label', 'Once or twice', 'score', 3),
    JSON_OBJECT('value', 2, 'label', 'Monthly', 'score', 4),
    JSON_OBJECT('value', 3, 'label', 'Weekly', 'score', 5),
    JSON_OBJECT('value', 4, 'label', 'Daily or almost daily', 'score', 6)
),
390);

-- ============================================================================
-- NOTE: This file is getting long. I'll continue with Q4-Q8 in the next part
-- to keep it manageable. The pattern continues similarly for:
-- - Q4: Health, social, legal, or financial problems (0, 4, 5, 6, 7)
-- - Q5: Failed to do what was expected (0, 5, 6, 7, 8) - NOT for tobacco
-- - Q6: Concern from friend/relative/others (0, 3, 6)
-- - Q7: Tried and failed to control, cut down, or stop (0, 3, 6)
-- - Q8: Injected drugs (0, 1, 2)
-- ============================================================================

-- Total questions so far: 1 + (3 × 10) = 31 questions
-- Remaining: Q4-Q7 for 10 substances + Q8 = ~50 more questions
-- ============================================================================