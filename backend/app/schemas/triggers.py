"""
Pydantic schemas for Triggers Assessment (External & Internal)

Redesigned: 4-level "Chance of Use" rating system (WHO ERS 2B/3B)
- Never Use (0%) = score 0
- Almost Never Use (~25%) = score 1
- Almost Always Use (~75%) = score 2
- Always Use (100%) = score 3
"""
from pydantic import BaseModel, Field, field_validator
from typing import List, Optional, Dict

# ============================================================================
# Rating levels
# ============================================================================

VALID_RATINGS = {0, 1, 2, 3}

RATING_LABELS = {
    0: "Never Use",
    1: "Almost Never Use",
    2: "Almost Always Use",
    3: "Always Use",
}

LEVEL_NAMES = {
    0: "never_use",
    1: "almost_never",
    2: "almost_always",
    3: "always_use",
}

# ============================================================================
# Triggers Response (Frontend submission)
# ============================================================================

class TriggersResponse(BaseModel):
    """Complete triggers assessment response with 4-level ratings"""
    # External triggers: {trigger_id: rating_score}
    external_ratings: Dict[str, int] = Field(
        default_factory=dict,
        description="External trigger ratings {trigger_id: 0-3}"
    )
    external_custom: List[str] = Field(
        default_factory=list,
        description="User-specified custom external triggers"
    )

    # Internal triggers: {trigger_id: rating_score}
    internal_ratings: Dict[str, int] = Field(
        default_factory=dict,
        description="Internal trigger ratings {trigger_id: 0-3}"
    )
    internal_custom: List[str] = Field(
        default_factory=list,
        description="User-specified custom internal triggers"
    )

    @field_validator('external_ratings', 'internal_ratings')
    @classmethod
    def validate_ratings(cls, v):
        for trigger_id, rating in v.items():
            if rating not in VALID_RATINGS:
                raise ValueError(
                    f"Rating must be 0-3, got {rating} for '{trigger_id}'"
                )
        return v

# ============================================================================
# Grouped triggers by level
# ============================================================================

class TriggersByLevel(BaseModel):
    """Triggers grouped by their rating level"""
    never_use: List[str] = Field(default_factory=list, description="Rating 0 - safe")
    almost_never: List[str] = Field(default_factory=list, description="Rating 1 - low risk")
    almost_always: List[str] = Field(default_factory=list, description="Rating 2 - high risk")
    always_use: List[str] = Field(default_factory=list, description="Rating 3 - avoid totally")


class LevelVerdict(BaseModel):
    """Verdict for a particular rating level"""
    level: str = Field(..., description="never_use | almost_never | almost_always | always_use")
    label: str = Field(..., description="Human-readable label: Safe, Low Risk, High Risk, Avoid Totally")
    count: int = Field(..., ge=0)
    triggers: List[str] = Field(default_factory=list)
    verdict: str = Field(..., description="Verdict text from WHO ERS forms")

# ============================================================================
# Triggers Analysis Results
# ============================================================================

class TriggersResults(BaseModel):
    """Triggers assessment analysis results - 4-level rating system"""
    # Raw ratings preserved
    external_ratings: Dict[str, int] = Field(
        default_factory=dict,
        description="Original external trigger ratings"
    )
    internal_ratings: Dict[str, int] = Field(
        default_factory=dict,
        description="Original internal trigger ratings"
    )

    # Grouped by level
    external_by_level: TriggersByLevel = Field(
        default_factory=TriggersByLevel,
        description="External triggers grouped by rating level"
    )
    internal_by_level: TriggersByLevel = Field(
        default_factory=TriggersByLevel,
        description="Internal triggers grouped by rating level"
    )

    # Verdicts per level
    external_verdicts: List[LevelVerdict] = Field(
        default_factory=list,
        description="Verdict for each external trigger level (non-empty levels only)"
    )
    internal_verdicts: List[LevelVerdict] = Field(
        default_factory=list,
        description="Verdict for each internal trigger level (non-empty levels only)"
    )

    # Summary counts
    external_count: int = Field(..., ge=0, description="Number of external triggers rated")
    internal_count: int = Field(..., ge=0, description="Number of internal triggers rated")
    total_triggers: int = Field(..., ge=0, description="Total triggers rated (external + internal)")

    # Highest risk level found
    highest_external_level: Optional[str] = Field(
        None,
        description="Highest rating level among external triggers"
    )
    highest_internal_level: Optional[str] = Field(
        None,
        description="Highest rating level among internal triggers"
    )

    # Pattern analysis
    primarily_emotional: bool = Field(
        False,
        description="True if internal trigger count exceeds external"
    )
    primarily_routine: bool = Field(
        False,
        description="True if external trigger count exceeds internal"
    )
    pattern_description: str = Field(
        "",
        description="Human-readable description of trigger patterns"
    )

    # AI analysis placeholder
    ai_analysis: Optional[str] = Field(
        None,
        description="AI-generated personalized trigger analysis"
    )

# ============================================================================
# Conditional Display Logic
# ============================================================================

class TriggersEligibility(BaseModel):
    """Determines if triggers should be collected"""
    should_show_triggers: bool = Field(..., description="True if user should complete triggers assessment")
    reason: str = Field(..., description="Why triggers are/aren't being shown")
    assist_moderate_or_high: bool = Field(False, description="Any ASSIST substance >= 4")
    phq9_moderate_or_high: bool = Field(False, description="PHQ-9 score >= 10")

# ============================================================================
# Triggers Questions Response (for frontend)
# ============================================================================

class TriggerItem(BaseModel):
    """Single trigger item"""
    id: int
    instrument: str
    category: str  # 'external', 'internal', 'external_custom', etc.
    question_text: str
    question_type: str
    options: List[Dict]
    order_index: int

class TriggersQuestionsResponse(BaseModel):
    """All triggers assessment items"""
    external_triggers: List[Dict] = Field(
        ...,
        description="External trigger checklist items (39 items)"
    )
    internal_triggers: List[Dict] = Field(
        ...,
        description="Internal trigger checklist items (36 items)"
    )
    custom_fields: Dict = Field(
        default={
            "external_custom": "List any other activities, situations, or settings where you frequently have used.",
            "internal_custom": "What emotional states that are not listed above have triggered you to use substances?",
        },
        description="Custom field prompts"
    )