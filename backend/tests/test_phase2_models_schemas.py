"""
Phase 2 Testing: Models and Schemas Validation
Tests the new validated instruments models and schemas
"""
import pytest
from datetime import datetime, timedelta
from app.models.screening import (
    Instrument,
    QuestionType,
    ScreeningQuestion,
    ScreeningSession
)
from app.schemas.assist import (
    ASSISTLifetimeUse,
    ASSISTSubstanceResponse,
    ASSISTResponse,
    ASSISTSubstanceScore,
    ASSISTResults
)
from app.schemas.phq9 import (
    PHQ9Response,
    PHQ9Results
)
from app.schemas.triggers import (
    TriggersResponse,
    TriggersResults
)
from app.schemas.screening import (
    ValidatedScreeningSubmission,
    ValidatedScreeningResults,
    Demographics
)

# ============================================================================
# TEST ASSIST SCHEMAS
# ============================================================================

def test_assist_lifetime_use_valid():
    """Test valid ASSIST lifetime use"""
    lifetime = ASSISTLifetimeUse(
        tobacco=True,
        alcohol=True,
        cannabis=False,
        cocaine=False,
        amphetamines=False,
        inhalants=False,
        sedatives=False,
        hallucinogens=False,
        opioids=False,
        other=False
    )
    assert lifetime.tobacco == True
    assert lifetime.alcohol == True
    assert lifetime.cannabis == False

def test_assist_lifetime_use_other_requires_specify():
    """Test that other=True requires other_specify"""
    with pytest.raises(ValueError, match="other_specify is required"):
        ASSISTLifetimeUse(
            tobacco=False,
            alcohol=False,
            cannabis=False,
            cocaine=False,
            amphetamines=False,
            inhalants=False,
            sedatives=False,
            hallucinogens=False,
            opioids=False,
            other=True,
            other_specify=None  # Should fail
        )

def test_assist_substance_response_valid():
    """Test valid ASSIST substance response (tobacco - no Q5)"""
    tobacco_response = ASSISTSubstanceResponse(
        q2_frequency=4,  # Daily
        q3_cravings=3,   # Weekly
        q4_problems=0,   # Never
        q5_failed_expectations=None,  # Tobacco skips Q5
        q6_concern=0,    # No
        q7_control=2     # Yes, but not past 3m (value 2, score 3)
    )
    assert tobacco_response.q2_frequency == 4
    assert tobacco_response.q5_failed_expectations is None

def test_assist_substance_response_with_q5():
    """Test ASSIST substance response with Q5 (alcohol)"""
    alcohol_response = ASSISTSubstanceResponse(
        q2_frequency=3,  # Monthly
        q3_cravings=0,   # Never
        q4_problems=0,   # Never
        q5_failed_expectations=0,  # Never - alcohol includes Q5
        q6_concern=0,    # No
        q7_control=0     # No
    )
    assert alcohol_response.q5_failed_expectations == 0

def test_assist_complete_response():
    """Test complete ASSIST response"""
    lifetime = ASSISTLifetimeUse(
        tobacco=True,
        alcohol=True,
        cannabis=False,
        cocaine=False,
        amphetamines=False,
        inhalants=False,
        sedatives=False,
        hallucinogens=False,
        opioids=False,
        other=False
    )

    substance_responses = {
        "tobacco": ASSISTSubstanceResponse(
            q2_frequency=4,
            q3_cravings=3,
            q4_problems=0,
            q5_failed_expectations=None,
            q6_concern=0,
            q7_control=2  # Yes, but not past 3m (value 2, score 3)
        ),
        "alcohol": ASSISTSubstanceResponse(
            q2_frequency=3,
            q3_cravings=0,
            q4_problems=0,
            q5_failed_expectations=0,
            q6_concern=0,
            q7_control=0
        )
    }

    assist_response = ASSISTResponse(
        q1_lifetime_use=lifetime,
        substance_responses=substance_responses,
        q8_injection=0
    )

    assert assist_response.q8_injection == 0
    assert "tobacco" in assist_response.substance_responses
    assert "alcohol" in assist_response.substance_responses

# ============================================================================
# TEST PHQ-9 SCHEMAS
# ============================================================================

def test_phq9_response_valid():
    """Test valid PHQ-9 response"""
    phq9 = PHQ9Response(
        q1_interest=2,
        q2_depressed=2,
        q3_sleep=1,
        q4_tired=3,
        q5_appetite=1,
        q6_failure=2,
        q7_concentration=1,
        q8_movement=0,
        q9_selfharm=0,  # No suicidal ideation
        functional_impairment="somewhat_difficult"
    )
    assert phq9.q9_selfharm == 0
    assert phq9.functional_impairment == "somewhat_difficult"

def test_phq9_response_invalid_functional_impairment():
    """Test PHQ-9 with invalid functional impairment"""
    with pytest.raises(ValueError, match="functional_impairment must be one of"):
        PHQ9Response(
            q1_interest=2,
            q2_depressed=2,
            q3_sleep=1,
            q4_tired=3,
            q5_appetite=1,
            q6_failure=2,
            q7_concentration=1,
            q8_movement=0,
            q9_selfharm=0,
            functional_impairment="invalid_option"  # Should fail
        )

def test_phq9_response_crisis():
    """Test PHQ-9 with suicidal ideation (crisis)"""
    phq9_crisis = PHQ9Response(
        q1_interest=1,
        q2_depressed=1,
        q3_sleep=0,
        q4_tired=1,
        q5_appetite=0,
        q6_failure=1,
        q7_concentration=0,
        q8_movement=0,
        q9_selfharm=2,  # Suicidal ideation - CRISIS
        functional_impairment="somewhat_difficult"
    )
    assert phq9_crisis.q9_selfharm == 2  # Crisis indicator

# ============================================================================
# TEST TRIGGERS SCHEMAS
# ============================================================================

def test_triggers_response_valid():
    """Test valid triggers response with 4-level ratings"""
    triggers = TriggersResponse(
        external_ratings={"bars_clubs": 3, "parties": 2, "home_alone": 0},
        external_custom=["After exams"],
        internal_ratings={"frustrated": 2, "anxious": 3, "lonely": 1},
        internal_custom=["Overwhelmed"],
    )
    assert len(triggers.external_ratings) == 3
    assert len(triggers.internal_ratings) == 3
    assert triggers.external_ratings["bars_clubs"] == 3

def test_triggers_response_minimal():
    """Test minimal triggers response (empty ratings)"""
    triggers_minimal = TriggersResponse(
        external_ratings={},
        internal_ratings={}
    )
    assert len(triggers_minimal.external_ratings) == 0
    assert len(triggers_minimal.internal_ratings) == 0

def test_triggers_response_invalid_rating():
    """Test triggers response rejects invalid rating values"""
    with pytest.raises(ValueError, match="Rating must be 0-3"):
        TriggersResponse(
            external_ratings={"bars_clubs": 5},
            internal_ratings={}
        )

# ============================================================================
# TEST COMBINED SUBMISSION
# ============================================================================

def test_validated_screening_submission():
    """Test complete validated screening submission"""
    demographics = Demographics(
        age="25",
        gender="male",
        city="Lagos",
        state="Lagos",
        religion="Christianity",
        employment_status="student",
        employment_sector=None,
        marital_status="single"
    )

    lifetime = ASSISTLifetimeUse(
        tobacco=True,
        alcohol=False,
        cannabis=False,
        cocaine=False,
        amphetamines=False,
        inhalants=False,
        sedatives=False,
        hallucinogens=False,
        opioids=False,
        other=False
    )

    assist = ASSISTResponse(
        q1_lifetime_use=lifetime,
        substance_responses={
            "tobacco": ASSISTSubstanceResponse(
                q2_frequency=4,
                q3_cravings=3,
                q4_problems=0,
                q5_failed_expectations=None,
                q6_concern=0,
                q7_control=2  # Yes, but not past 3m (value 2, score 3)
            )
        },
        q8_injection=0
    )

    phq9 = PHQ9Response(
        q1_interest=2,
        q2_depressed=2,
        q3_sleep=1,
        q4_tired=3,
        q5_appetite=1,
        q6_failure=2,
        q7_concentration=1,
        q8_movement=0,
        q9_selfharm=0,
        functional_impairment="somewhat_difficult"
    )

    submission = ValidatedScreeningSubmission(
        demographics=demographics,
        assist=assist,
        phq9=phq9,
        triggers=None  # Optional
    )

    assert submission.demographics.city == "Lagos"
    assert submission.assist.q8_injection == 0
    assert submission.phq9.q9_selfharm == 0
    assert submission.triggers is None

# ============================================================================
# TEST MODELS (SQLAlchemy)
# ============================================================================

def test_screening_question_model():
    """Test ScreeningQuestion model structure"""
    question = ScreeningQuestion(
        instrument=Instrument.ASSIST,
        category="tobacco",
        question_number=2,
        question_text="In the past 3 months, how often have you used tobacco?",
        question_type=QuestionType.frequency,
        options=[
            {"value": 0, "label": "Never", "score": 0},
            {"value": 1, "label": "Once or twice", "score": 2}
        ],
        order_index=200,
        is_crisis_question=False
    )

    assert question.instrument == Instrument.ASSIST
    assert question.category == "tobacco"
    assert question.question_number == 2

def test_screening_question_phq9_crisis():
    """Test PHQ-9 Q9 crisis question"""
    crisis_question = ScreeningQuestion(
        instrument=Instrument.PHQ9,
        category="depression",
        question_number=9,
        question_text="Thoughts that you would be better off dead or of hurting yourself",
        question_type=QuestionType.depression_scale,
        options=[
            {"value": 0, "label": "Not at all", "score": 0},
            {"value": 3, "label": "Nearly every day", "score": 3}
        ],
        order_index=1080,
        is_crisis_question=True  # Flagged as crisis
    )

    assert crisis_question.is_crisis_question == True
    assert crisis_question.question_number == 9

# ============================================================================
# RUN TESTS
# ============================================================================

if __name__ == "__main__":
    pytest.main([__file__, "-v"])
