"""
Tests for PHQ-9 Scoring Service

Tests PHQ-9 depression screening scoring algorithm including:
- Total score calculation
- Severity level determination
- Crisis detection (Q9 > 0)
- Clinical threshold (score >= 10)
- Action recommendations
"""

import pytest
from app.services.phq9_scoring_service import PHQ9ScoringService
from app.schemas.phq9 import PHQ9Response


@pytest.fixture
def scoring_service():
    """Create PHQ-9 scoring service instance"""
    return PHQ9ScoringService()


# ============================================================================
# SEVERITY LEVEL TESTS
# ============================================================================

def test_minimal_depression(scoring_service):
    """Test PHQ-9 minimal depression (0-4)"""
    response = PHQ9Response(
        q1_interest=1,
        q2_depressed=0,
        q3_sleep=1,
        q4_tired=1,
        q5_appetite=0,
        q6_failure=0,
        q7_concentration=1,
        q8_movement=0,
        q9_selfharm=0,
        functional_impairment="not_difficult"
    )

    result = scoring_service.calculate_score(response)

    assert result.total_score == 4  # 1+0+1+1+0+0+1+0+0
    assert result.severity == "minimal"
    assert result.meets_clinical_threshold == False
    assert result.suicidal_ideation == False
    assert result.action == "no_intervention"
    assert result.triggers_recommended == False


def test_mild_depression(scoring_service):
    """Test PHQ-9 mild depression (5-9)"""
    response = PHQ9Response(
        q1_interest=1,
        q2_depressed=2,
        q3_sleep=1,
        q4_tired=1,
        q5_appetite=1,
        q6_failure=1,
        q7_concentration=1,
        q8_movement=0,
        q9_selfharm=0,
        functional_impairment="somewhat_difficult"
    )

    result = scoring_service.calculate_score(response)

    assert result.total_score == 8  # 1+2+1+1+1+1+1+0+0
    assert result.severity == "mild"
    assert result.meets_clinical_threshold == False
    assert result.suicidal_ideation == False
    assert result.action == "watchful_waiting"
    assert result.functional_impairment_severity == 1
    assert result.triggers_recommended == False


def test_moderate_depression(scoring_service):
    """Test PHQ-9 moderate depression (10-14)"""
    response = PHQ9Response(
        q1_interest=2,
        q2_depressed=2,
        q3_sleep=1,
        q4_tired=2,
        q5_appetite=1,
        q6_failure=1,
        q7_concentration=2,
        q8_movement=1,
        q9_selfharm=0,
        functional_impairment="somewhat_difficult"
    )

    result = scoring_service.calculate_score(response)

    assert result.total_score == 12  # 2+2+1+2+1+1+2+1+0
    assert result.severity == "moderate"
    assert result.meets_clinical_threshold == True  # Score >= 10
    assert result.suicidal_ideation == False
    assert result.action == "consider_treatment"
    assert result.triggers_recommended == True  # Score >= 10


def test_moderately_severe_depression(scoring_service):
    """Test PHQ-9 moderately severe depression (15-19)"""
    response = PHQ9Response(
        q1_interest=2,
        q2_depressed=2,
        q3_sleep=2,
        q4_tired=2,
        q5_appetite=2,
        q6_failure=2,
        q7_concentration=2,
        q8_movement=2,
        q9_selfharm=1,  # Some suicidal ideation
        functional_impairment="very_difficult"
    )

    result = scoring_service.calculate_score(response)

    assert result.total_score == 17  # 2+2+2+2+2+2+2+2+1
    assert result.severity == "moderately_severe"
    assert result.meets_clinical_threshold == True
    assert result.suicidal_ideation == True  # Q9 > 0 = CRISIS
    assert result.action == "crisis_response"  # Crisis overrides severity-based action
    assert result.functional_impairment_severity == 2
    assert result.triggers_recommended == True


def test_severe_depression(scoring_service):
    """Test PHQ-9 severe depression (20-27)"""
    response = PHQ9Response(
        q1_interest=3,
        q2_depressed=3,
        q3_sleep=3,
        q4_tired=3,
        q5_appetite=3,
        q6_failure=2,
        q7_concentration=2,
        q8_movement=2,
        q9_selfharm=0,
        functional_impairment="extremely_difficult"
    )

    result = scoring_service.calculate_score(response)

    assert result.total_score == 21  # 3+3+3+3+3+2+2+2+0
    assert result.severity == "severe"
    assert result.meets_clinical_threshold == True
    assert result.suicidal_ideation == False
    assert result.action == "treatment_recommended"
    assert result.functional_impairment_severity == 3
    assert result.triggers_recommended == True


# ============================================================================
# CRISIS DETECTION TESTS (Q9 > 0)
# ============================================================================

def test_crisis_q9_minimal(scoring_service):
    """Test crisis detection with minimal depression but Q9 > 0"""
    response = PHQ9Response(
        q1_interest=0,
        q2_depressed=0,
        q3_sleep=0,
        q4_tired=0,
        q5_appetite=0,
        q6_failure=0,
        q7_concentration=0,
        q8_movement=0,
        q9_selfharm=1,  # Suicidal ideation - CRISIS
        functional_impairment="not_difficult"
    )

    result = scoring_service.calculate_score(response)

    assert result.total_score == 1
    assert result.severity == "minimal"  # Score-based severity
    assert result.suicidal_ideation == True  # Q9 > 0
    assert result.action == "crisis_response"  # Crisis overrides severity
    assert "CRISIS" in result.action_description
    assert result.triggers_recommended == False  # Score < 10


def test_crisis_q9_moderate(scoring_service):
    """Test crisis detection with moderate depression and Q9 > 0"""
    response = PHQ9Response(
        q1_interest=2,
        q2_depressed=2,
        q3_sleep=1,
        q4_tired=2,
        q5_appetite=1,
        q6_failure=1,
        q7_concentration=1,
        q8_movement=1,
        q9_selfharm=2,  # Suicidal ideation - CRISIS
        functional_impairment="very_difficult"
    )

    result = scoring_service.calculate_score(response)

    assert result.total_score == 13
    assert result.severity == "moderate"
    assert result.suicidal_ideation == True
    assert result.action == "crisis_response"  # Crisis overrides
    assert result.triggers_recommended == True  # Score >= 10


def test_crisis_q9_maximum(scoring_service):
    """Test crisis detection with maximum Q9 score"""
    response = PHQ9Response(
        q1_interest=3,
        q2_depressed=3,
        q3_sleep=3,
        q4_tired=3,
        q5_appetite=3,
        q6_failure=3,
        q7_concentration=3,
        q8_movement=3,
        q9_selfharm=3,  # Maximum suicidal ideation
        functional_impairment="extremely_difficult"
    )

    result = scoring_service.calculate_score(response)

    assert result.total_score == 27  # Maximum possible
    assert result.severity == "severe"
    assert result.suicidal_ideation == True
    assert result.action == "crisis_response"
    assert result.individual_scores["q9_selfharm"] == 3


# ============================================================================
# CLINICAL THRESHOLD TESTS (Score >= 10)
# ============================================================================

def test_clinical_threshold_boundary_below(scoring_service):
    """Test clinical threshold boundary - score 9 (below threshold)"""
    response = PHQ9Response(
        q1_interest=1,
        q2_depressed=1,
        q3_sleep=1,
        q4_tired=1,
        q5_appetite=1,
        q6_failure=1,
        q7_concentration=1,
        q8_movement=1,
        q9_selfharm=1,
        functional_impairment="somewhat_difficult"
    )

    result = scoring_service.calculate_score(response)

    assert result.total_score == 9
    assert result.meets_clinical_threshold == False  # < 10
    assert result.triggers_recommended == False
    assert result.action == "crisis_response"  # But still crisis due to Q9


def test_clinical_threshold_boundary_at(scoring_service):
    """Test clinical threshold boundary - score 10 (at threshold)"""
    response = PHQ9Response(
        q1_interest=1,
        q2_depressed=1,
        q3_sleep=1,
        q4_tired=1,
        q5_appetite=1,
        q6_failure=1,
        q7_concentration=2,
        q8_movement=1,
        q9_selfharm=1,
        functional_impairment="somewhat_difficult"
    )

    result = scoring_service.calculate_score(response)

    assert result.total_score == 10
    assert result.meets_clinical_threshold == True  # >= 10
    assert result.severity == "moderate"
    assert result.triggers_recommended == True


# ============================================================================
# FUNCTIONAL IMPAIRMENT TESTS
# ============================================================================

def test_functional_impairment_levels(scoring_service):
    """Test all functional impairment severity levels"""
    base_response_data = {
        "q1_interest": 1,
        "q2_depressed": 1,
        "q3_sleep": 1,
        "q4_tired": 1,
        "q5_appetite": 1,
        "q6_failure": 1,
        "q7_concentration": 1,
        "q8_movement": 1,
        "q9_selfharm": 0
    }

    # Test not_difficult (0)
    response = PHQ9Response(**base_response_data, functional_impairment="not_difficult")
    result = scoring_service.calculate_score(response)
    assert result.functional_impairment_severity == 0

    # Test somewhat_difficult (1)
    response = PHQ9Response(**base_response_data, functional_impairment="somewhat_difficult")
    result = scoring_service.calculate_score(response)
    assert result.functional_impairment_severity == 1

    # Test very_difficult (2)
    response = PHQ9Response(**base_response_data, functional_impairment="very_difficult")
    result = scoring_service.calculate_score(response)
    assert result.functional_impairment_severity == 2

    # Test extremely_difficult (3)
    response = PHQ9Response(**base_response_data, functional_impairment="extremely_difficult")
    result = scoring_service.calculate_score(response)
    assert result.functional_impairment_severity == 3


# ============================================================================
# EDGE CASES
# ============================================================================

def test_zero_score(scoring_service):
    """Test all zeros - no depression"""
    response = PHQ9Response(
        q1_interest=0,
        q2_depressed=0,
        q3_sleep=0,
        q4_tired=0,
        q5_appetite=0,
        q6_failure=0,
        q7_concentration=0,
        q8_movement=0,
        q9_selfharm=0,
        functional_impairment="not_difficult"
    )

    result = scoring_service.calculate_score(response)

    assert result.total_score == 0
    assert result.severity == "minimal"
    assert result.meets_clinical_threshold == False
    assert result.suicidal_ideation == False
    assert result.triggers_recommended == False


def test_maximum_score(scoring_service):
    """Test all threes - maximum depression"""
    response = PHQ9Response(
        q1_interest=3,
        q2_depressed=3,
        q3_sleep=3,
        q4_tired=3,
        q5_appetite=3,
        q6_failure=3,
        q7_concentration=3,
        q8_movement=3,
        q9_selfharm=3,
        functional_impairment="extremely_difficult"
    )

    result = scoring_service.calculate_score(response)

    assert result.total_score == 27  # Maximum possible
    assert result.severity == "severe"
    assert result.meets_clinical_threshold == True
    assert result.suicidal_ideation == True
    assert result.triggers_recommended == True
    assert result.action == "crisis_response"


if __name__ == "__main__":
    pytest.main([__file__, "-v"])