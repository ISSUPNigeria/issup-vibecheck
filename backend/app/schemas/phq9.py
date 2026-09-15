"""
Pydantic schemas for PHQ-9 (Patient Health Questionnaire-9) Depression Screening
"""
from pydantic import BaseModel, Field, field_validator
from typing import Dict, List, Optional

# ============================================================================
# PHQ-9 Response
# ============================================================================

class PHQ9Response(BaseModel):
    """Complete PHQ-9 screening response"""
    q1_interest: int = Field(..., ge=0, le=3, description="Little interest or pleasure in doing things")
    q2_depressed: int = Field(..., ge=0, le=3, description="Feeling down, depressed, or hopeless")
    q3_sleep: int = Field(..., ge=0, le=3, description="Trouble falling/staying asleep, or sleeping too much")
    q4_tired: int = Field(..., ge=0, le=3, description="Feeling tired or having little energy")
    q5_appetite: int = Field(..., ge=0, le=3, description="Poor appetite or overeating")
    q6_failure: int = Field(..., ge=0, le=3, description="Feeling bad about yourself or that you're a failure")
    q7_concentration: int = Field(..., ge=0, le=3, description="Trouble concentrating on things")
    q8_movement: int = Field(..., ge=0, le=3, description="Moving/speaking slowly or being fidgety/restless")
    q9_selfharm: int = Field(..., ge=0, le=3, description="Thoughts of being better off dead or hurting yourself (CRISIS)")
    functional_impairment: str = Field(
        ...,
        description="How difficult problems made work/home/relationships"
    )

    @field_validator('functional_impairment')
    @classmethod
    def validate_functional_impairment(cls, v):
        """Validate functional impairment options"""
        valid_options = ['not_difficult', 'somewhat_difficult', 'very_difficult', 'extremely_difficult']
        if v not in valid_options:
            raise ValueError(f"functional_impairment must be one of {valid_options}")
        return v

    @field_validator('q9_selfharm')
    @classmethod
    def warn_crisis(cls, v):
        """Q9 > 0 indicates suicidal ideation (crisis)"""
        # Just validation, crisis handling is in scoring service
        return v

# ============================================================================
# PHQ-9 Scoring Results
# ============================================================================

class PHQ9Results(BaseModel):
    """PHQ-9 scoring results with clinical interpretation"""
    # Individual question scores
    individual_scores: Dict[str, int] = Field(
        ...,
        description="Scores for each question (q1_interest through q9_selfharm)"
    )

    # Total score and interpretation
    total_score: int = Field(..., ge=0, le=27, description="Sum of Q1-Q9")
    severity: str = Field(..., description="minimal, mild, moderate, moderately_severe, severe")
    severity_description: str = Field(..., description="Human-readable severity description")

    # Clinical thresholds
    meets_clinical_threshold: bool = Field(..., description="True if score >= 10 (moderate or higher)")
    suicidal_ideation: bool = Field(..., description="True if Q9 > 0 (CRISIS)")

    # Functional impairment
    functional_impairment: str = Field(..., description="not_difficult, somewhat, very, extremely")
    functional_impairment_severity: int = Field(..., ge=0, le=3, description="0-3 scale for impairment")

    # Recommended action
    action: str = Field(
        ...,
        description="no_intervention, watchful_waiting, consider_treatment, treatment_recommended, crisis_response"
    )
    action_description: str = Field(..., description="Human-readable action recommendation")

    # Triggers eligibility
    triggers_recommended: bool = Field(
        ...,
        description="True if score >= 10 (should collect triggers)"
    )

# ============================================================================
# PHQ-9 Questions Response (for frontend)
# ============================================================================

class PHQ9Question(BaseModel):
    """Single PHQ-9 question"""
    id: int
    instrument: str
    category: str
    question_number: int
    question_text: str
    question_type: str
    options: List[Dict]
    order_index: int
    is_crisis_question: bool = False

class PHQ9QuestionsResponse(BaseModel):
    """All PHQ-9 questions"""
    questions: List[PHQ9Question] = Field(..., description="Q1-Q9 depression questions")
    functional_impairment_question: PHQ9Question = Field(..., description="Functional impairment question")
    scoring_info: Dict = Field(
        default={
            "scale": "0-27",
            "interpretation": {
                "0-4": "Minimal depression",
                "5-9": "Mild depression",
                "10-14": "Moderate depression",
                "15-19": "Moderately severe depression",
                "20-27": "Severe depression"
            },
            "clinical_threshold": 10,
            "crisis_question": "q9"
        },
        description="Scoring interpretation guidelines"
    )
