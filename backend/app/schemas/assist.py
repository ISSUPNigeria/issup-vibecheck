"""
Pydantic schemas for WHO ASSIST V3.0 (Alcohol, Smoking and Substance Involvement Screening Test)
"""
from pydantic import BaseModel, Field, field_validator
from typing import Dict, List, Optional

# ============================================================================
# ASSIST Q1: Lifetime Use
# ============================================================================

class ASSISTLifetimeUse(BaseModel):
    """Q1: Lifetime substance use (checkboxes)"""
    tobacco: bool = False
    alcohol: bool = False
    cannabis: bool = False
    cocaine: bool = False
    amphetamines: bool = False
    inhalants: bool = False
    sedatives: bool = False
    hallucinogens: bool = False
    opioids: bool = False
    other: bool = False
    other_specify: Optional[str] = None

    @field_validator('other_specify')
    @classmethod
    def validate_other_specify(cls, v, info):
        """Require other_specify if other is True"""
        if info.data.get('other') and not v:
            raise ValueError('other_specify is required when other is True')
        return v

# ============================================================================
# ASSIST Q2-Q7: Substance-specific questions
# ============================================================================

class ASSISTSubstanceResponse(BaseModel):
    """Responses for Q2-Q7 for a single substance"""
    q2_frequency: int = Field(..., ge=0, le=4, description="How often used in past 3 months (0,2,3,4,6)")
    q3_cravings: int = Field(..., ge=0, le=4, description="Strong desire/urge (0,3,4,5,6)")
    q4_problems: int = Field(..., ge=0, le=4, description="Health/social/legal/financial problems (0,4,5,6,7)")
    q5_failed_expectations: Optional[int] = Field(None, ge=0, le=4, description="Failed expectations (0,5,6,7,8) - NOT for tobacco")
    q6_concern: int = Field(..., ge=0, le=2, description="Friend/relative concern (0,3,6)")
    q7_control: int = Field(..., ge=0, le=2, description="Tried and failed to control/cut down/stop (0,3,6)")

    @field_validator('q5_failed_expectations')
    @classmethod
    def validate_q5(cls, v):
        """Q5 is optional (None) for tobacco"""
        return v

# ============================================================================
# ASSIST Q8: Injection Use
# ============================================================================

class ASSISTInjectionResponse(BaseModel):
    """Q8: Ever used drugs by injection"""
    injection: int = Field(..., ge=0, le=2, description="0=Never, 1=Yes (not past 3m), 2=Yes (past 3m)")

# ============================================================================
# ASSIST Complete Response
# ============================================================================

class ASSISTResponse(BaseModel):
    """Complete ASSIST screening response"""
    q1_lifetime_use: ASSISTLifetimeUse
    substance_responses: Dict[str, ASSISTSubstanceResponse] = Field(
        ...,
        description="Responses for each substance used (key = substance name)"
    )
    q8_injection: int = Field(..., ge=0, le=2, description="Injection use")

    @field_validator('substance_responses')
    @classmethod
    def validate_substances_match_lifetime(cls, v, info):
        """Ensure substance_responses only includes substances marked True in q1_lifetime_use"""
        lifetime = info.data.get('q1_lifetime_use')
        if lifetime:
            # Get all substances marked as used
            used_substances = [
                sub for sub, used in lifetime.model_dump().items()
                if used and sub not in ['other_specify']
            ]
            # Check that substance_responses only has those substances
            for substance in v.keys():
                if substance not in used_substances:
                    raise ValueError(f"Substance '{substance}' not marked as used in Q1 lifetime use")
        return v

# ============================================================================
# ASSIST Scoring Results
# ============================================================================

class ASSISTSubstanceScore(BaseModel):
    """Score for a single substance"""
    substance: str
    score: int = Field(..., ge=0, description="Calculated ASSIST score")
    risk_level: str = Field(..., description="low, moderate, or high")
    calculation: str = Field(..., description="Human-readable calculation breakdown")

class ASSISTResults(BaseModel):
    """Complete ASSIST scoring results"""
    scores: Dict[str, ASSISTSubstanceScore] = Field(
        ...,
        description="Scores per substance (key = substance name)"
    )
    highest_risk_substance: Optional[str] = Field(None, description="Substance with highest score")
    highest_risk_score: Optional[int] = Field(None, description="Highest score value")
    moderate_risk_substances: List[str] = Field(default_factory=list, description="Substances with moderate risk")
    high_risk_substances: List[str] = Field(default_factory=list, description="Substances with high risk")
    injection_risk: bool = Field(False, description="Whether user has injected drugs")
    injection_timeframe: Optional[str] = Field(None, description="never, not_past_3m, past_3m")
    overall_risk: str = Field(..., description="low, moderate, or high based on highest substance risk")
    brief_intervention_needed: bool = Field(False, description="True if any substance is moderate or high risk")
    other_specify: Optional[str] = Field(None, description="User-specified other substances (comma-separated)")

# ============================================================================
# ASSIST Questions Response (for frontend)
# ============================================================================

class ASSISTQuestion(BaseModel):
    """Single ASSIST question"""
    id: int
    instrument: str
    category: Optional[str]
    question_number: Optional[int]
    question_text: str
    question_type: str
    options: Optional[List[Dict]]
    order_index: int
    skip_for_substances: Optional[List[str]] = None

class ASSISTQuestionsResponse(BaseModel):
    """All ASSIST questions organized by structure"""
    q1_lifetime: ASSISTQuestion
    q2_q7_questions: Dict[int, List[ASSISTQuestion]] = Field(
        ...,
        description="Questions 2-7 organized by question number"
    )
    q8_injection: ASSISTQuestion
    substances: List[str] = Field(
        default=[
            "tobacco", "alcohol", "cannabis", "cocaine", "amphetamines",
            "inhalants", "sedatives", "hallucinogens", "opioids", "other"
        ],
        description="List of substance names"
    )
