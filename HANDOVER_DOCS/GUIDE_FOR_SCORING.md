# Screening Instruments Scoring Guide

## Overview

This application uses three validated screening instruments to assess mental health and substance use risk:

1. **WHO ASSIST V3.0** - Substance Use Screening
2. **PHQ-9** - Depression Screening
3. **Triggers Assessment** - Conditional (shown based on ASSIST/PHQ-9 results)

---

## 1. WHO ASSIST V3.0 (Alcohol, Smoking and Substance Involvement Screening Test)

### Purpose
Identifies risk levels for substance use across multiple substances (tobacco, alcohol, cannabis, cocaine, amphetamines, inhalants, sedatives, hallucinogens, opioids, and other drugs).

### Scoring Formula

| Substance | Questions Included |
|-----------|-------------------|
| **Tobacco** | Q2 + Q3 + Q4 + Q6 + Q7 *(Q5 excluded)* |
| **All Other Substances** | Q2 + Q3 + Q4 + Q5 + Q6 + Q7 |

### Question Score Mappings

| Question | Response Options | Scores |
|----------|-----------------|--------|
| **Q2** (Frequency) | Never / Once or twice / Monthly / Weekly / Daily | 0 / 2 / 3 / 4 / 6 |
| **Q3** (Cravings) | Never / Once or twice / Monthly / Weekly / Daily | 0 / 3 / 4 / 5 / 6 |
| **Q4** (Problems) | Never / Once or twice / Monthly / Weekly / Daily | 0 / 4 / 5 / 6 / 7 |
| **Q5** (Failed expectations) | Never / Once or twice / Monthly / Weekly / Daily | 0 / 5 / 6 / 7 / 8 |
| **Q6** (Concern expressed) | No never / Yes past 3 months / Yes not past 3 months | 0 / 6 / 3 |
| **Q7** (Tried to control) | No never / Yes past 3 months / Yes not past 3 months | 0 / 6 / 3 |

### Risk Levels

| Risk Level | Tobacco Score | Other Substances Score | Recommended Intervention |
|------------|---------------|------------------------|-------------------------|
| **Low** | 0 - 3 | 0 - 10 | No intervention needed |
| **Moderate** | 4 - 26 | 11 - 26 | Brief intervention recommended |
| **High** | 27+ | 27+ | Intensive treatment / Specialist referral |

### Additional Flags

- **Q8 (Injection Drug Use)**: Assessed separately for injection risk
- **Brief Intervention**: Recommended if any substance is moderate or high risk
- **Overall Risk**: Determined by the highest-risk substance

---

## 2. PHQ-9 (Patient Health Questionnaire-9)

### Purpose
Screens for depression severity and monitors treatment response.

### Scoring Formula

**Total Score = Q1 + Q2 + Q3 + Q4 + Q5 + Q6 + Q7 + Q8 + Q9**

Each question scored 0-3:
- **0** = Not at all
- **1** = Several days
- **2** = More than half the days
- **3** = Nearly every day

**Score Range: 0 - 27**

### Questions

| # | Question Topic |
|---|---------------|
| Q1 | Little interest or pleasure in doing things |
| Q2 | Feeling down, depressed, or hopeless |
| Q3 | Trouble falling/staying asleep, or sleeping too much |
| Q4 | Feeling tired or having little energy |
| Q5 | Poor appetite or overeating |
| Q6 | Feeling bad about yourself (failure, let family down) |
| Q7 | Trouble concentrating on things |
| Q8 | Moving/speaking slowly or being fidgety/restless |
| Q9 | Thoughts of self-harm or being better off dead |

### Severity Levels

| Total Score | Severity | Recommended Action |
|-------------|----------|-------------------|
| **0 - 4** | Minimal | No intervention needed |
| **5 - 9** | Mild | Watchful waiting; repeat PHQ-9 at follow-up |
| **10 - 14** | Moderate | Consider treatment plan (counseling/pharmacotherapy) |
| **15 - 19** | Moderately Severe | Active treatment strongly recommended |
| **20 - 27** | Severe | Immediate treatment initiation required |

### Critical Flags

| Flag | Condition | Action Required |
|------|-----------|----------------|
| **Clinical Threshold** | Score ≥ 10 | Professional help recommended |
| **Suicidal Ideation** | Q9 > 0 | ⚠️ **IMMEDIATE crisis intervention required** |

### Functional Impairment Question

Asked after Q1-Q9: "How difficult have these problems made it to do work, take care of things at home, or get along with other people?"

| Response | Severity Score |
|----------|---------------|
| Not difficult at all | 0 |
| Somewhat difficult | 1 |
| Very difficult | 2 |
| Extremely difficult | 3 |

---

## 3. Triggers Assessment (Conditional)

### When Shown

The Triggers Assessment is **only displayed** when:
- **ASSIST** shows moderate or high risk for any substance, **OR**
- **PHQ-9** score is ≥ 10 (moderate depression or higher)

### Purpose
Identifies external (situational) and internal (emotional) triggers that contribute to substance use or mental health challenges.

### Trigger Categories

| Category | Type | Examples |
|----------|------|----------|
| **External** | Situational | Environments, people, places, activities, social settings |
| **Internal** | Emotional | Feelings, moods, thoughts, physical states, stress |

### Pattern Levels

| Total Triggers | Pattern Level | Interpretation |
|----------------|---------------|----------------|
| **0 - 3** | Low | Limited number of triggers identified |
| **4 - 7** | Moderate | Moderate number of triggers identified |
| **8+** | High | Significant number of triggers identified |

### Use Pattern Analysis

| Pattern | Condition | Recommended Focus |
|---------|-----------|-------------------|
| **Primarily Emotional** | Internal triggers > External triggers | Coping skills, emotional regulation |
| **Primarily Routine** | External triggers > Internal triggers | Habit change, avoiding triggering situations |

---

## Screening Flow

```
┌─────────────────┐
│  Demographics   │
│  (Age, Gender,  │
│   Location)     │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  WHO ASSIST     │
│  (Substance     │
│   Use Screen)   │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│     PHQ-9       │
│  (Depression    │
│   Screen)       │
└────────┬────────┘
         │
         ▼
    ┌────┴────┐
    │ ASSIST  │
    │Moderate/│──── Yes ───┐
    │ High OR │            │
    │PHQ-9≥10?│            ▼
    └────┬────┘    ┌───────────────┐
         │         │   Triggers    │
        No         │  Assessment   │
         │         └───────┬───────┘
         │                 │
         ▼                 ▼
    ┌─────────────────────────┐
    │      Results Page       │
    │  (Scores + AI Summary)  │
    └────────────┬────────────┘
                 │
                 ▼
    ┌─────────────────────────┐
    │    AI Chat Support      │
    │ (Personalized guidance) │
    └─────────────────────────┘
```

---

## Crisis Detection

### Automatic Crisis Flags

| Source | Condition | Action |
|--------|-----------|--------|
| PHQ-9 Q9 | Score > 0 | Immediate crisis response |
| Chat AI | "IMMEDIATE CRISIS" or "HIGH RISK" detected | Crisis banner displayed |
| Keyword Detection | Explicit crisis phrases in chat | Crisis banner displayed |

### Crisis Banner

When crisis is detected, a banner appears with:
- **WhatsApp ONLY**: +234 812 937 8557
- **WhatsApp AND Call**: +234 704 652 6917

---

## References

- WHO ASSIST V3.0: World Health Organization Guidelines
- PHQ-9: Kroenke K, Spitzer RL, Williams JB. The PHQ-9: validity of a brief depression severity measure. J Gen Intern Med. 2001;16(9):606-613.