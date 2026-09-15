"""
Tests for ASSIST Scoring Service

Tests WHO ASSIST V3.0 scoring algorithm implementation including:
- Tobacco scoring (Q5 excluded)
- Other substance scoring (Q5 included)
- Risk level determination
- Overall risk assessment
"""

import pytest
from app.services.assist_scoring_service import ASSISTScoringService
from app.schemas.assist import (
    ASSISTResponse,
    ASSISTLifetimeUse,
    ASSISTSubstanceResponse
)


@pytest.fixture
def scoring_service():
    """Create ASSIST scoring service instance"""
    return ASSISTScoringService()


# ============================================================================
# TOBACCO SCORING TESTS (Q5 excluded)
# ============================================================================

def test_tobacco_low_risk(scoring_service):
    """Test tobacco scoring - low risk (score 0-3)"""
    response = ASSISTSubstanceResponse(
        q2_frequency=0,  # Never -> score 0
        q3_cravings=0,   # Never -> score 0
        q4_problems=0,   # Never -> score 0
        q5_failed_expectations=None,  # NOT asked for tobacco
        q6_concern=0,    # No never -> score 0
        q7_control=2     # Yes but not past 3m -> score 3
    )

    result = scoring_service.calculate_substance_score("tobacco", response)

    assert result.substance == "tobacco"
    assert result.score == 3  # 0+0+0+0+3 = 3
    assert result.risk_level == "low"
    assert "Q2(0)" in result.calculation
    assert "Q5" not in result.calculation  # Q5 should NOT be in calculation


def test_tobacco_moderate_risk(scoring_service):
    """Test tobacco scoring - moderate risk (score 4-26)"""
    response = ASSISTSubstanceResponse(
        q2_frequency=4,  # Daily -> score 6
        q3_cravings=3,   # Weekly -> score 5
        q4_problems=1,   # Once or twice -> score 4
        q5_failed_expectations=None,  # NOT asked for tobacco
        q6_concern=0,    # No never -> score 0
        q7_control=0     # No never -> score 0
    )

    result = scoring_service.calculate_substance_score("tobacco", response)

    assert result.substance == "tobacco"
    assert result.score == 15  # 6+5+4+0+0 = 15
    assert result.risk_level == "moderate"


def test_tobacco_high_risk(scoring_service):
    """Test tobacco scoring - high risk (score 27+)"""
    response = ASSISTSubstanceResponse(
        q2_frequency=4,  # Daily -> score 6
        q3_cravings=4,   # Daily -> score 6
        q4_problems=4,   # Daily -> score 7
        q5_failed_expectations=None,  # NOT asked for tobacco
        q6_concern=1,    # Yes past 3m -> score 6
        q7_control=1     # Yes past 3m -> score 6
    )

    result = scoring_service.calculate_substance_score("tobacco", response)

    assert result.substance == "tobacco"
    assert result.score == 31  # 6+6+7+6+6 = 31 (max for tobacco)
    assert result.risk_level == "high"


# ============================================================================
# OTHER SUBSTANCES SCORING TESTS (Q5 included)
# ============================================================================

def test_alcohol_low_risk(scoring_service):
    """Test alcohol scoring - low risk (score 0-10)"""
    response = ASSISTSubstanceResponse(
        q2_frequency=1,  # Once or twice -> score 2
        q3_cravings=1,   # Once or twice -> score 3
        q4_problems=0,   # Never -> score 0
        q5_failed_expectations=0,  # Never -> score 0
        q6_concern=0,    # No never -> score 0
        q7_control=2     # Yes but not past 3m -> score 3
    )

    result = scoring_service.calculate_substance_score("alcohol", response)

    assert result.substance == "alcohol"
    assert result.score == 8  # 2+3+0+0+0+3 = 8
    assert result.risk_level == "low"
    assert "Q5(0)" in result.calculation  # Q5 SHOULD be in calculation


def test_cannabis_moderate_risk(scoring_service):
    """Test cannabis scoring - moderate risk (score 11-26)"""
    response = ASSISTSubstanceResponse(
        q2_frequency=3,  # Weekly -> score 4
        q3_cravings=2,   # Monthly -> score 4
        q4_problems=1,   # Once or twice -> score 4
        q5_failed_expectations=0,  # Never -> score 0
        q6_concern=0,    # No never -> score 0
        q7_control=0     # No never -> score 0
    )

    result = scoring_service.calculate_substance_score("cannabis", response)

    assert result.substance == "cannabis"
    assert result.score == 12  # 4+4+4+0+0+0 = 12
    assert result.risk_level == "moderate"


def test_cocaine_high_risk(scoring_service):
    """Test cocaine scoring - high risk (score 27+)"""
    response = ASSISTSubstanceResponse(
        q2_frequency=4,  # Daily -> score 6
        q3_cravings=4,   # Daily -> score 6
        q4_problems=4,   # Daily -> score 7
        q5_failed_expectations=4,  # Daily -> score 8
        q6_concern=1,    # Yes past 3m -> score 6
        q7_control=1     # Yes past 3m -> score 6
    )

    result = scoring_service.calculate_substance_score("cocaine", response)

    assert result.substance == "cocaine"
    assert result.score == 39  # 6+6+7+8+6+6 = 39 (max possible)
    assert result.risk_level == "high"


# ============================================================================
# COMPLETE ASSIST SCORING TESTS
# ============================================================================

def test_complete_assist_multiple_substances(scoring_service):
    """Test complete ASSIST with multiple substances"""
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

    assist_response = ASSISTResponse(
        q1_lifetime_use=lifetime,
        substance_responses={
            "tobacco": ASSISTSubstanceResponse(
                q2_frequency=4,
                q3_cravings=3,
                q4_problems=0,
                q5_failed_expectations=None,
                q6_concern=0,
                q7_control=2
            ),
            "alcohol": ASSISTSubstanceResponse(
                q2_frequency=2,
                q3_cravings=1,
                q4_problems=0,
                q5_failed_expectations=0,
                q6_concern=0,
                q7_control=0
            )
        },
        q8_injection=0
    )

    results = scoring_service.calculate_all_scores(assist_response)

    assert len(results.scores) == 2
    assert "tobacco" in results.scores
    assert "alcohol" in results.scores

    # Tobacco: 6+5+0+0+3 = 14 (moderate)
    assert results.scores["tobacco"].score == 14
    assert results.scores["tobacco"].risk_level == "moderate"

    # Alcohol: 3+3+0+0+0+0 = 6 (low)
    assert results.scores["alcohol"].score == 6
    assert results.scores["alcohol"].risk_level == "low"

    # Overall assessment
    assert results.highest_risk_substance == "tobacco"
    assert results.highest_risk_score == 14
    assert results.overall_risk == "moderate"
    assert results.brief_intervention_needed == True
    assert "tobacco" in results.moderate_risk_substances
    assert len(results.high_risk_substances) == 0


def test_complete_assist_high_risk_scenario(scoring_service):
    """Test complete ASSIST with high-risk substance"""
    lifetime = ASSISTLifetimeUse(
        tobacco=False,
        alcohol=False,
        cannabis=True,
        cocaine=False,
        amphetamines=False,
        inhalants=False,
        sedatives=False,
        hallucinogens=False,
        opioids=False,
        other=False
    )

    assist_response = ASSISTResponse(
        q1_lifetime_use=lifetime,
        substance_responses={
            "cannabis": ASSISTSubstanceResponse(
                q2_frequency=4,  # Daily
                q3_cravings=4,   # Daily
                q4_problems=3,   # Weekly -> score 6
                q5_failed_expectations=3,  # Weekly -> score 7
                q6_concern=1,    # Yes past 3m -> score 6
                q7_control=1     # Yes past 3m -> score 6
            )
        },
        q8_injection=2  # Yes, past 3 months
    )

    results = scoring_service.calculate_all_scores(assist_response)

    # Cannabis: 6+6+6+7+6+6 = 37 (high)
    assert results.scores["cannabis"].score == 37
    assert results.scores["cannabis"].risk_level == "high"

    # Overall assessment
    assert results.overall_risk == "high"
    assert results.brief_intervention_needed == True
    assert "cannabis" in results.high_risk_substances
    assert results.injection_risk == True
    assert results.injection_timeframe == "past_3m"


def test_complete_assist_low_risk_all(scoring_service):
    """Test complete ASSIST with all low-risk scores"""
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

    assist_response = ASSISTResponse(
        q1_lifetime_use=lifetime,
        substance_responses={
            "tobacco": ASSISTSubstanceResponse(
                q2_frequency=1,  # Once or twice -> score 2
                q3_cravings=0,   # Never -> score 0
                q4_problems=0,   # Never -> score 0
                q5_failed_expectations=None,
                q6_concern=0,
                q7_control=0
            ),
            "alcohol": ASSISTSubstanceResponse(
                q2_frequency=1,  # Once or twice -> score 2
                q3_cravings=0,   # Never -> score 0
                q4_problems=0,   # Never -> score 0
                q5_failed_expectations=0,  # Never -> score 0
                q6_concern=0,
                q7_control=0
            )
        },
        q8_injection=0
    )

    results = scoring_service.calculate_all_scores(assist_response)

    # Tobacco: 2+0+0+0+0 = 2 (low)
    assert results.scores["tobacco"].risk_level == "low"
    # Alcohol: 2+0+0+0+0+0 = 2 (low)
    assert results.scores["alcohol"].risk_level == "low"

    # Overall assessment
    assert results.overall_risk == "low"
    assert results.brief_intervention_needed == False
    assert len(results.moderate_risk_substances) == 0
    assert len(results.high_risk_substances) == 0


# ============================================================================
# EDGE CASES & VALIDATION
# ============================================================================

def test_substance_requires_q5(scoring_service):
    """Test that non-tobacco substances require Q5"""
    response = ASSISTSubstanceResponse(
        q2_frequency=2,
        q3_cravings=1,
        q4_problems=0,
        q5_failed_expectations=None,  # Missing Q5
        q6_concern=0,
        q7_control=0
    )

    with pytest.raises(ValueError, match="Q5 is required for alcohol"):
        scoring_service.calculate_substance_score("alcohol", response)


if __name__ == "__main__":
    pytest.main([__file__, "-v"])