"""
Tests for Triggers Analysis Service (4-Level Rating System)

Tests triggers assessment with Chance of Use ratings:
- Rating validation (0-3 range)
- Grouping by level (never_use, almost_never, almost_always, always_use)
- Verdict generation (correct text per level)
- Highest level detection
- Counting (external, internal, total)
- Pattern detection (emotional vs routine)
- Pattern description generation
- Eligibility checking
- Edge cases
"""

import pytest
from app.services.triggers_analysis_service import TriggersAnalysisService
from app.schemas.triggers import TriggersResponse


@pytest.fixture
def analysis_service():
    """Create triggers analysis service instance"""
    return TriggersAnalysisService()


# ============================================================================
# RATING VALIDATION TESTS
# ============================================================================

def test_valid_ratings_accepted():
    """Test that ratings 0-3 are accepted"""
    response = TriggersResponse(
        external_ratings={"bars_clubs": 0, "parties": 1, "home_alone": 2, "school": 3},
        internal_ratings={"depressed": 0, "anxious": 3}
    )
    assert len(response.external_ratings) == 4
    assert len(response.internal_ratings) == 2


def test_invalid_rating_rejected():
    """Test that rating > 3 raises validation error"""
    with pytest.raises(ValueError):
        TriggersResponse(
            external_ratings={"bars_clubs": 5},
            internal_ratings={}
        )


def test_negative_rating_rejected():
    """Test that negative rating raises validation error"""
    with pytest.raises(ValueError):
        TriggersResponse(
            external_ratings={"bars_clubs": -1},
            internal_ratings={}
        )


# ============================================================================
# GROUPING BY LEVEL TESTS
# ============================================================================

def test_group_external_by_level(analysis_service):
    """Test grouping external triggers by rating level"""
    response = TriggersResponse(
        external_ratings={
            "bars_clubs": 3,       # always_use
            "parties": 2,          # almost_always
            "home_alone": 0,       # never_use
            "after_payday": 1,     # almost_never
        },
        internal_ratings={}
    )

    result = analysis_service.analyze_triggers(response)

    assert "bars_clubs" in result.external_by_level.always_use
    assert "parties" in result.external_by_level.almost_always
    assert "home_alone" in result.external_by_level.never_use
    assert "after_payday" in result.external_by_level.almost_never


def test_group_internal_by_level(analysis_service):
    """Test grouping internal triggers by rating level"""
    response = TriggersResponse(
        external_ratings={},
        internal_ratings={
            "depressed": 3,        # always_use
            "anxious": 2,          # almost_always
            "happy": 0,            # never_use
            "bored": 1,            # almost_never
        }
    )

    result = analysis_service.analyze_triggers(response)

    assert "depressed" in result.internal_by_level.always_use
    assert "anxious" in result.internal_by_level.almost_always
    assert "happy" in result.internal_by_level.never_use
    assert "bored" in result.internal_by_level.almost_never


def test_group_all_same_level(analysis_service):
    """Test when all triggers have the same rating"""
    response = TriggersResponse(
        external_ratings={"bars_clubs": 2, "parties": 2, "school": 2},
        internal_ratings={}
    )

    result = analysis_service.analyze_triggers(response)

    assert len(result.external_by_level.almost_always) == 3
    assert len(result.external_by_level.always_use) == 0
    assert len(result.external_by_level.almost_never) == 0
    assert len(result.external_by_level.never_use) == 0


def test_group_empty_ratings(analysis_service):
    """Test grouping with no ratings"""
    response = TriggersResponse(
        external_ratings={},
        internal_ratings={}
    )

    result = analysis_service.analyze_triggers(response)

    assert len(result.external_by_level.always_use) == 0
    assert len(result.external_by_level.almost_always) == 0
    assert len(result.external_by_level.almost_never) == 0
    assert len(result.external_by_level.never_use) == 0


# ============================================================================
# VERDICT GENERATION TESTS
# ============================================================================

def test_external_verdict_always_use(analysis_service):
    """Test verdict text for external always_use level"""
    response = TriggersResponse(
        external_ratings={"bars_clubs": 3},
        internal_ratings={}
    )

    result = analysis_service.analyze_triggers(response)

    assert len(result.external_verdicts) == 1
    verdict = result.external_verdicts[0]
    assert verdict.level == "always_use"
    assert verdict.label == "Avoid Totally"
    assert verdict.count == 1
    assert "bars_clubs" in verdict.triggers
    assert verdict.verdict == "Involvement in these situations is deciding to stay addicted. Avoid totally."


def test_external_verdict_almost_always(analysis_service):
    """Test verdict text for external almost_always level"""
    response = TriggersResponse(
        external_ratings={"parties": 2, "bars_clubs": 2},
        internal_ratings={}
    )

    result = analysis_service.analyze_triggers(response)

    verdict = result.external_verdicts[0]
    assert verdict.level == "almost_always"
    assert verdict.label == "High Risk"
    assert verdict.verdict == "These situations are high risk. Staying in these situations is extremely dangerous."


def test_internal_verdict_always_use(analysis_service):
    """Test verdict text for internal always_use level"""
    response = TriggersResponse(
        external_ratings={},
        internal_ratings={"depressed": 3}
    )

    result = analysis_service.analyze_triggers(response)

    assert len(result.internal_verdicts) == 1
    verdict = result.internal_verdicts[0]
    assert verdict.level == "always_use"
    assert verdict.verdict == "Persisting in these emotions is deciding to stay addicted. Avoid totally."


def test_internal_verdict_almost_always(analysis_service):
    """Test verdict text for internal almost_always level"""
    response = TriggersResponse(
        external_ratings={},
        internal_ratings={"anxious": 2}
    )

    result = analysis_service.analyze_triggers(response)

    verdict = result.internal_verdicts[0]
    assert verdict.verdict == "These emotions are high risk."


def test_verdicts_ordered_highest_first(analysis_service):
    """Test that verdicts are ordered from highest risk to lowest"""
    response = TriggersResponse(
        external_ratings={
            "bars_clubs": 3,     # always_use
            "home_alone": 0,     # never_use
            "parties": 2,        # almost_always
            "school": 1,         # almost_never
        },
        internal_ratings={}
    )

    result = analysis_service.analyze_triggers(response)

    assert len(result.external_verdicts) == 4
    assert result.external_verdicts[0].level == "always_use"
    assert result.external_verdicts[1].level == "almost_always"
    assert result.external_verdicts[2].level == "almost_never"
    assert result.external_verdicts[3].level == "never_use"


def test_verdicts_only_for_nonempty_levels(analysis_service):
    """Test that verdicts are only generated for levels with triggers"""
    response = TriggersResponse(
        external_ratings={"bars_clubs": 3, "parties": 3},
        internal_ratings={}
    )

    result = analysis_service.analyze_triggers(response)

    # Only always_use has triggers
    assert len(result.external_verdicts) == 1
    assert result.external_verdicts[0].level == "always_use"
    assert result.external_verdicts[0].count == 2


# ============================================================================
# HIGHEST LEVEL DETECTION TESTS
# ============================================================================

def test_highest_level_always_use(analysis_service):
    """Test highest level is always_use when present"""
    response = TriggersResponse(
        external_ratings={"bars_clubs": 3, "home_alone": 0},
        internal_ratings={"depressed": 1}
    )

    result = analysis_service.analyze_triggers(response)

    assert result.highest_external_level == "always_use"
    assert result.highest_internal_level == "almost_never"


def test_highest_level_almost_always(analysis_service):
    """Test highest level when max is almost_always"""
    response = TriggersResponse(
        external_ratings={"bars_clubs": 2, "home_alone": 0},
        internal_ratings={}
    )

    result = analysis_service.analyze_triggers(response)

    assert result.highest_external_level == "almost_always"


def test_highest_level_none_when_empty(analysis_service):
    """Test highest level is None when no ratings"""
    response = TriggersResponse(
        external_ratings={},
        internal_ratings={}
    )

    result = analysis_service.analyze_triggers(response)

    assert result.highest_external_level is None
    assert result.highest_internal_level is None


# ============================================================================
# COUNTING TESTS
# ============================================================================

def test_count_external_only(analysis_service):
    """Test counting with external triggers only"""
    response = TriggersResponse(
        external_ratings={"bars_clubs": 3, "parties": 2, "home_alone": 0},
        external_custom=["After exams"],
        internal_ratings={}
    )

    result = analysis_service.analyze_triggers(response)

    assert result.external_count == 4  # 3 rated + 1 custom
    assert result.internal_count == 0
    assert result.total_triggers == 4


def test_count_internal_only(analysis_service):
    """Test counting with internal triggers only"""
    response = TriggersResponse(
        external_ratings={},
        internal_ratings={"depressed": 3, "anxious": 2},
        internal_custom=["Overwhelmed"]
    )

    result = analysis_service.analyze_triggers(response)

    assert result.external_count == 0
    assert result.internal_count == 3  # 2 rated + 1 custom
    assert result.total_triggers == 3


def test_count_mixed(analysis_service):
    """Test counting with both types"""
    response = TriggersResponse(
        external_ratings={"bars_clubs": 3, "parties": 2},
        external_custom=["After work"],
        internal_ratings={"depressed": 2, "anxious": 3},
        internal_custom=["Lonely"]
    )

    result = analysis_service.analyze_triggers(response)

    assert result.external_count == 3  # 2 + 1
    assert result.internal_count == 3  # 2 + 1
    assert result.total_triggers == 6


def test_count_zero(analysis_service):
    """Test counting with no triggers"""
    response = TriggersResponse(
        external_ratings={},
        internal_ratings={}
    )

    result = analysis_service.analyze_triggers(response)

    assert result.external_count == 0
    assert result.internal_count == 0
    assert result.total_triggers == 0


# ============================================================================
# PATTERN DETECTION TESTS
# ============================================================================

def test_primarily_emotional(analysis_service):
    """Test primarily emotional when internal > external"""
    response = TriggersResponse(
        external_ratings={"bars_clubs": 3},
        internal_ratings={"depressed": 3, "anxious": 2, "lonely": 1}
    )

    result = analysis_service.analyze_triggers(response)

    assert result.primarily_emotional is True
    assert result.primarily_routine is False


def test_primarily_routine(analysis_service):
    """Test primarily routine when external > internal"""
    response = TriggersResponse(
        external_ratings={"bars_clubs": 3, "parties": 2, "school": 0},
        internal_ratings={"depressed": 3}
    )

    result = analysis_service.analyze_triggers(response)

    assert result.primarily_emotional is False
    assert result.primarily_routine is True


def test_mixed_pattern_equal_counts(analysis_service):
    """Test mixed pattern when counts are equal"""
    response = TriggersResponse(
        external_ratings={"bars_clubs": 3, "parties": 2},
        internal_ratings={"depressed": 3, "anxious": 2}
    )

    result = analysis_service.analyze_triggers(response)

    assert result.primarily_emotional is False
    assert result.primarily_routine is False


# ============================================================================
# PATTERN DESCRIPTION TESTS
# ============================================================================

def test_description_with_high_risk_warning(analysis_service):
    """Test description includes warning when high-risk triggers present"""
    response = TriggersResponse(
        external_ratings={"bars_clubs": 3, "parties": 2},
        internal_ratings={"depressed": 3}
    )

    result = analysis_service.analyze_triggers(response)

    assert "high risk" in result.pattern_description
    assert "careful attention" in result.pattern_description


def test_description_primarily_situational(analysis_service):
    """Test description for primarily situational triggers"""
    response = TriggersResponse(
        external_ratings={"bars_clubs": 2, "parties": 1, "school": 0, "home_alone": 1, "weekends": 2},
        internal_ratings={"happy": 0}
    )

    result = analysis_service.analyze_triggers(response)

    assert "primarily situational" in result.pattern_description


def test_description_primarily_emotional(analysis_service):
    """Test description for primarily emotional triggers"""
    response = TriggersResponse(
        external_ratings={"bars_clubs": 2},
        internal_ratings={"depressed": 3, "anxious": 2, "lonely": 1, "bored": 0, "sad": 2}
    )

    result = analysis_service.analyze_triggers(response)

    assert "primarily emotional" in result.pattern_description


def test_description_mixed(analysis_service):
    """Test description for mixed triggers"""
    response = TriggersResponse(
        external_ratings={"bars_clubs": 2, "parties": 1},
        internal_ratings={"depressed": 3, "anxious": 2}
    )

    result = analysis_service.analyze_triggers(response)

    assert "mix of both situational and emotional" in result.pattern_description


def test_description_no_triggers(analysis_service):
    """Test description when no triggers identified"""
    response = TriggersResponse(
        external_ratings={},
        internal_ratings={}
    )

    result = analysis_service.analyze_triggers(response)

    assert result.pattern_description == "No triggers were identified."


def test_description_count_included(analysis_service):
    """Test that description includes trigger counts"""
    response = TriggersResponse(
        external_ratings={"bars_clubs": 2, "parties": 1},
        internal_ratings={"depressed": 3}
    )

    result = analysis_service.analyze_triggers(response)

    assert "3 triggers" in result.pattern_description
    assert "2 situational" in result.pattern_description
    assert "1 emotional" in result.pattern_description


# ============================================================================
# ELIGIBILITY CHECKING TESTS
# ============================================================================

def test_eligibility_assist_moderate(analysis_service):
    """Test eligibility when ASSIST indicates moderate+ risk"""
    result = analysis_service.check_eligibility(
        assist_moderate_or_high=True,
        phq9_moderate_or_high=False
    )

    assert result["should_show_triggers"] is True
    assert "ASSIST indicates moderate or high risk" in result["reason"]


def test_eligibility_low_risk(analysis_service):
    """Test eligibility when ASSIST is low risk"""
    result = analysis_service.check_eligibility(
        assist_moderate_or_high=False,
        phq9_moderate_or_high=False
    )

    assert result["should_show_triggers"] is False
    assert "No triggers assessment needed" in result["reason"]


def test_eligibility_phq9_only_does_not_trigger(analysis_service):
    """Test that PHQ-9 alone does not trigger triggers assessment"""
    result = analysis_service.check_eligibility(
        assist_moderate_or_high=False,
        phq9_moderate_or_high=True
    )

    # PHQ-9 alone should NOT show triggers (only ASSIST matters)
    assert result["should_show_triggers"] is False


def test_eligibility_both_high(analysis_service):
    """Test eligibility when both ASSIST and PHQ-9 indicate risk"""
    result = analysis_service.check_eligibility(
        assist_moderate_or_high=True,
        phq9_moderate_or_high=True
    )

    assert result["should_show_triggers"] is True
    assert result["assist_moderate_or_high"] is True
    assert result["phq9_moderate_or_high"] is True


# ============================================================================
# EDGE CASES
# ============================================================================

def test_custom_triggers_only(analysis_service):
    """Test with only custom triggers (no rated triggers)"""
    response = TriggersResponse(
        external_ratings={},
        external_custom=["After exams", "Weekend mornings"],
        internal_ratings={},
        internal_custom=["Overwhelmed", "Guilty"]
    )

    result = analysis_service.analyze_triggers(response)

    assert result.external_count == 2
    assert result.internal_count == 2
    assert result.total_triggers == 4
    # No rated triggers means no grouping
    assert result.highest_external_level is None
    assert result.highest_internal_level is None


def test_ai_analysis_placeholder(analysis_service):
    """Test that ai_analysis is None (populated by AI engine later)"""
    response = TriggersResponse(
        external_ratings={"bars_clubs": 3},
        internal_ratings={"depressed": 2}
    )

    result = analysis_service.analyze_triggers(response)

    assert result.ai_analysis is None


def test_raw_ratings_preserved(analysis_service):
    """Test that original ratings are preserved in results"""
    ratings_ext = {"bars_clubs": 3, "parties": 2, "home_alone": 0}
    ratings_int = {"depressed": 3, "anxious": 1}

    response = TriggersResponse(
        external_ratings=ratings_ext,
        internal_ratings=ratings_int
    )

    result = analysis_service.analyze_triggers(response)

    assert result.external_ratings == ratings_ext
    assert result.internal_ratings == ratings_int


def test_single_trigger(analysis_service):
    """Test with just one trigger rated"""
    response = TriggersResponse(
        external_ratings={"bars_clubs": 3},
        internal_ratings={}
    )

    result = analysis_service.analyze_triggers(response)

    assert result.total_triggers == 1
    assert result.external_count == 1
    assert result.highest_external_level == "always_use"
    assert len(result.external_verdicts) == 1
    assert "1 trigger" in result.pattern_description


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
