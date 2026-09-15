"""
Pydantic schemas for PGSI (Problem Gambling Severity Index)
"""
from pydantic import BaseModel, Field
from typing import Dict


class PGSIResponse(BaseModel):
    """Complete PGSI screening response — 9 questions, each scored 0–3"""
    q1: int = Field(..., ge=0, le=3, description="Bet more than you could afford to lose")
    q2: int = Field(..., ge=0, le=3, description="Needed to gamble with larger amounts for same excitement")
    q3: int = Field(..., ge=0, le=3, description="Went back to win back money lost")
    q4: int = Field(..., ge=0, le=3, description="Borrowed money or sold anything to gamble")
    q5: int = Field(..., ge=0, le=3, description="Felt you might have a problem with gambling")
    q6: int = Field(..., ge=0, le=3, description="Gambling caused health problems including stress/anxiety")
    q7: int = Field(..., ge=0, le=3, description="People criticised your betting or said you had a problem")
    q8: int = Field(..., ge=0, le=3, description="Gambling caused financial problems for you or your household")
    q9: int = Field(..., ge=0, le=3, description="Felt guilty about the way you gamble or what happens")


class PGSIResults(BaseModel):
    """PGSI scoring results with clinical interpretation"""
    individual_scores: Dict[str, int] = Field(
        ..., description="Scores for each question (q1 through q9)"
    )
    total_score: int = Field(..., ge=0, le=27, description="Sum of Q1–Q9")
    risk_category: str = Field(
        ..., description="no_risk | low_risk | moderate_risk | problem_gambler"
    )
    risk_description: str = Field(..., description="Human-readable risk description")
    recommendation: str = Field(..., description="Clinical recommendation")
    professional_help_recommended: bool = Field(
        ..., description="True if score >= 8 (problem gambler)"
    )
