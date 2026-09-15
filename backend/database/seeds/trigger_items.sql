-- ============================================================================
-- SEED DATA: Triggers Assessment (External & Internal)
-- ============================================================================
-- Description: Checklist items for external and internal triggers
-- Source: External_and_Internal_Triggers_forms.pdf
-- Date: January 7, 2025
-- ============================================================================

USE mental_health_db_test;

-- ============================================================================
-- EXTERNAL TRIGGERS (Situational/Environmental)
-- ============================================================================

INSERT INTO screening_questions (instrument, category, question_number, question_text, question_type, options, order_index) VALUES

-- External Triggers Checklist
('EXTERNAL_TRIGGERS', 'external', NULL,
'Place a checkmark next to activities, situations, or settings in which you frequently used substances; place a zero next to activities, situations, or settings in which you never have used substances.',
'trigger_checkbox',
JSON_ARRAY(
    JSON_OBJECT('value', 'home_alone', 'label', 'Home alone'),
    JSON_OBJECT('value', 'home_with_friends', 'label', 'Home with friends'),
    JSON_OBJECT('value', 'friends_home', 'label', 'Friend''s home'),
    JSON_OBJECT('value', 'parties', 'label', 'Parties'),
    JSON_OBJECT('value', 'sporting_events', 'label', 'Sporting events'),
    JSON_OBJECT('value', 'movies', 'label', 'Movies'),
    JSON_OBJECT('value', 'bars_clubs', 'label', 'Bars/clubs'),
    JSON_OBJECT('value', 'beach', 'label', 'Beach'),
    JSON_OBJECT('value', 'concerts', 'label', 'Concerts'),
    JSON_OBJECT('value', 'with_friends_who_use', 'label', 'With friends who use drugs'),
    JSON_OBJECT('value', 'when_gaining_weight', 'label', 'When gaining weight'),
    JSON_OBJECT('value', 'vacations_holidays', 'label', 'Vacations/holidays'),
    JSON_OBJECT('value', 'when_raining', 'label', 'When it''s raining'),
    JSON_OBJECT('value', 'before_date', 'label', 'Before a date'),
    JSON_OBJECT('value', 'during_date', 'label', 'During a date'),
    JSON_OBJECT('value', 'before_sexual_activities', 'label', 'Before sexual activities'),
    JSON_OBJECT('value', 'during_sexual_activities', 'label', 'During sexual activities'),
    JSON_OBJECT('value', 'after_sexual_activities', 'label', 'After sexual activities'),
    JSON_OBJECT('value', 'before_work', 'label', 'Before work'),
    JSON_OBJECT('value', 'when_carrying_money', 'label', 'When carrying money'),
    JSON_OBJECT('value', 'after_going_past_dealers', 'label', 'After going past dealer''s residence'),
    JSON_OBJECT('value', 'driving', 'label', 'Driving'),
    JSON_OBJECT('value', 'liquor_store', 'label', 'Liquor store'),
    JSON_OBJECT('value', 'during_work', 'label', 'During work'),
    JSON_OBJECT('value', 'talking_on_phone', 'label', 'Talking on the phone'),
    JSON_OBJECT('value', 'recovery_groups', 'label', 'Recovery groups'),
    JSON_OBJECT('value', 'after_payday', 'label', 'After payday'),
    JSON_OBJECT('value', 'before_going_out_dinner', 'label', 'Before going out to dinner'),
    JSON_OBJECT('value', 'before_breakfast', 'label', 'Before breakfast'),
    JSON_OBJECT('value', 'at_lunch_break', 'label', 'At lunch break'),
    JSON_OBJECT('value', 'while_at_dinner', 'label', 'While at dinner'),
    JSON_OBJECT('value', 'after_work', 'label', 'After work'),
    JSON_OBJECT('value', 'after_passing_street_exit', 'label', 'After passing a particular street or exit'),
    JSON_OBJECT('value', 'school', 'label', 'School'),
    JSON_OBJECT('value', 'the_park', 'label', 'The park'),
    JSON_OBJECT('value', 'in_neighborhood', 'label', 'In the neighborhood'),
    JSON_OBJECT('value', 'weekends', 'label', 'Weekends'),
    JSON_OBJECT('value', 'with_family_members', 'label', 'With family members'),
    JSON_OBJECT('value', 'when_in_pain', 'label', 'When in pain')
),
2000);

-- Custom external triggers (open text field)
INSERT INTO screening_questions (instrument, category, question_number, question_text, question_type, options, order_index) VALUES
('EXTERNAL_TRIGGERS', 'external_custom', NULL,
'List any other activities, situations, or settings where you frequently have used.',
'trigger_checkbox',
JSON_ARRAY(
    JSON_OBJECT('type', 'text_input', 'label', 'Other external triggers (separate with commas)')
),
2010);

-- Safe situations (helpful for recovery planning)
INSERT INTO screening_questions (instrument, category, question_number, question_text, question_type, options, order_index) VALUES
('EXTERNAL_TRIGGERS', 'external_safe', NULL,
'List activities, situations, or settings in which you would not use.',
'trigger_checkbox',
JSON_ARRAY(
    JSON_OBJECT('type', 'text_input', 'label', 'Safe situations where you do not use (separate with commas)')
),
2020);

-- Safe people (helpful for recovery planning)
INSERT INTO screening_questions (instrument, category, question_number, question_text, question_type, options, order_index) VALUES
('EXTERNAL_TRIGGERS', 'external_safe_people', NULL,
'List people you could be with and not use.',
'trigger_checkbox',
JSON_ARRAY(
    JSON_OBJECT('type', 'text_input', 'label', 'Safe people you can be with (separate with commas)')
),
2030);

-- ============================================================================
-- INTERNAL TRIGGERS (Emotional/Feelings)
-- ============================================================================

INSERT INTO screening_questions (instrument, category, question_number, question_text, question_type, options, order_index) VALUES

-- Internal Triggers Checklist
('INTERNAL_TRIGGERS', 'internal', NULL,
'During recovery certain feelings or emotions often trigger the brain to think about using substances. Read the following list of feelings and emotions, and place a checkmark next to those that might trigger thoughts of using for you. Place a zero next to those that are not connected with using.',
'trigger_checkbox',
JSON_ARRAY(
    JSON_OBJECT('value', 'afraid', 'label', 'Afraid'),
    JSON_OBJECT('value', 'frustrated', 'label', 'Frustrated'),
    JSON_OBJECT('value', 'neglected', 'label', 'Neglected'),
    JSON_OBJECT('value', 'angry', 'label', 'Angry'),
    JSON_OBJECT('value', 'guilty', 'label', 'Guilty'),
    JSON_OBJECT('value', 'nervous', 'label', 'Nervous'),
    JSON_OBJECT('value', 'confident', 'label', 'Confident'),
    JSON_OBJECT('value', 'happy', 'label', 'Happy'),
    JSON_OBJECT('value', 'passionate', 'label', 'Passionate'),
    JSON_OBJECT('value', 'criticized', 'label', 'Criticized'),
    JSON_OBJECT('value', 'inadequate', 'label', 'Inadequate'),
    JSON_OBJECT('value', 'pressured', 'label', 'Pressured'),
    JSON_OBJECT('value', 'depressed', 'label', 'Depressed'),
    JSON_OBJECT('value', 'insecure', 'label', 'Insecure'),
    JSON_OBJECT('value', 'relaxed', 'label', 'Relaxed'),
    JSON_OBJECT('value', 'embarrassed', 'label', 'Embarrassed'),
    JSON_OBJECT('value', 'irritated', 'label', 'Irritated'),
    JSON_OBJECT('value', 'sad', 'label', 'Sad'),
    JSON_OBJECT('value', 'excited', 'label', 'Excited'),
    JSON_OBJECT('value', 'jealous', 'label', 'Jealous'),
    JSON_OBJECT('value', 'bored', 'label', 'Bored'),
    JSON_OBJECT('value', 'exhausted', 'label', 'Exhausted'),
    JSON_OBJECT('value', 'lonely', 'label', 'Lonely'),
    JSON_OBJECT('value', 'envious', 'label', 'Envious'),
    JSON_OBJECT('value', 'deprived', 'label', 'Deprived'),
    JSON_OBJECT('value', 'humiliated', 'label', 'Humiliated'),
    JSON_OBJECT('value', 'anxious', 'label', 'Anxious'),
    JSON_OBJECT('value', 'aroused', 'label', 'Aroused'),
    JSON_OBJECT('value', 'revengeful', 'label', 'Revengeful'),
    JSON_OBJECT('value', 'worried', 'label', 'Worried'),
    JSON_OBJECT('value', 'grieving', 'label', 'Grieving'),
    JSON_OBJECT('value', 'resentful', 'label', 'Resentful'),
    JSON_OBJECT('value', 'overwhelmed', 'label', 'Overwhelmed'),
    JSON_OBJECT('value', 'misunderstood', 'label', 'Misunderstood'),
    JSON_OBJECT('value', 'paranoid', 'label', 'Paranoid'),
    JSON_OBJECT('value', 'hungry', 'label', 'Hungry')
),
3000);

-- Custom internal triggers (open text field)
INSERT INTO screening_questions (instrument, category, question_number, question_text, question_type, options, order_index) VALUES
('INTERNAL_TRIGGERS', 'internal_custom', NULL,
'What emotional states that are not listed above have triggered you to use substances?',
'trigger_checkbox',
JSON_ARRAY(
    JSON_OBJECT('type', 'text_input', 'label', 'Other emotional triggers (separate with commas)')
),
3010);

-- Pre-treatment use pattern
INSERT INTO screening_questions (instrument, category, question_number, question_text, question_type, options, order_index) VALUES
('INTERNAL_TRIGGERS', 'internal_pattern', NULL,
'Was your use in the weeks before entering treatment:',
'trigger_checkbox',
JSON_ARRAY(
    JSON_OBJECT('value', 'emotional', 'label', 'Tied primarily to emotional conditions?'),
    JSON_OBJECT('value', 'routine', 'label', 'Routine and automatic without much emotional triggering?')
),
3020);

-- Mood change trigger question
INSERT INTO screening_questions (instrument, category, question_number, question_text, question_type, options, order_index) VALUES
('INTERNAL_TRIGGERS', 'internal_mood_change', NULL,
'Were there times in the recent past when you were not using and a specific change in your mood clearly resulted in your wanting to use (for example, you got in a fight with someone and wanted to use in response to getting angry)?',
'trigger_checkbox',
JSON_ARRAY(
    JSON_OBJECT('value', 'yes', 'label', 'Yes'),
    JSON_OBJECT('value', 'no', 'label', 'No')
),
3030);

-- Mood change description (conditional - if yes to previous)
INSERT INTO screening_questions (instrument, category, question_number, question_text, question_type, options, order_index) VALUES
('INTERNAL_TRIGGERS', 'internal_mood_description', NULL,
'If yes, describe the situation:',
'trigger_checkbox',
JSON_ARRAY(
    JSON_OBJECT('type', 'text_input', 'label', 'Describe the mood change situation')
),
3040);

-- ============================================================================
-- TRIGGERS COMPLETE
-- ============================================================================
-- Total Trigger Items:
-- - External checklist: 39 predefined items
-- - External custom fields: 3 open-ended questions
-- - Internal checklist: 36 predefined emotions
-- - Internal custom fields: 4 open-ended questions
-- Total: 39 + 3 + 36 + 4 = 82 trigger assessment items
--
-- Display Logic:
-- - Only shown when ASSIST moderate+ (any substance >= 4) OR PHQ-9 >= 10
-- - Helps identify high-risk situations and emotions
-- - Informs Brief Intervention and coping strategy development
-- ============================================================================