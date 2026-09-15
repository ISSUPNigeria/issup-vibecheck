from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional
from datetime import datetime
from enum import Enum

# Import new instrument schemas
from .assist import ASSISTResponse, ASSISTResults
from .phq9 import PHQ9Response, PHQ9Results
from .triggers import TriggersResponse, TriggersResults
from .pgsi import PGSIResponse, PGSIResults

# Legacy enums (kept for backward compatibility)
class QuestionCategory(str, Enum):
    SUBSTANCE_USE = "substance_use"
    MENTAL_HEALTH = "mental_health"
    TRAUMA = "trauma"
    PHYSICAL = "physical"
    CRISIS = "crisis"

class QuestionType(str, Enum):
    MULTIPLE_CHOICE = "multiple_choice"
    SCALE = "scale"
    YES_NO = "yes_no"

class ScreeningQuestionResponse(BaseModel):
    """Legacy screening question schema (backward compatibility)"""
    id: int
    category: Optional[str] = None  # Allow any string value
    question_text: str
    question_type: str  # Allow any string value
    options: Optional[Any] = None  # Allow JSON data
    scoring_weight: Optional[int] = 1  # Make optional with default
    order_index: int
    # New fields for validated instruments
    instrument: Optional[str] = None
    question_number: Optional[int] = None
    is_crisis_question: Optional[bool] = False

    class Config:
        from_attributes = True

class ValidatedQuestionResponse(BaseModel):
    """New validated instrument question schema"""
    id: int
    instrument: str
    category: Optional[str] = None
    question_number: Optional[int] = None
    question_text: str
    question_type: str
    options: Optional[Any] = None  # JSON - can be list of dicts or list of strings
    order_index: int
    is_crisis_question: bool = False
    skip_for_substances: Optional[Any] = None

    class Config:
        from_attributes = True

class ScreeningQuestionsListResponse(BaseModel):
    questions: List[ScreeningQuestionResponse]
    total: int

class Demographics(BaseModel):
    age: Optional[str] = None
    gender: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    religion: Optional[str] = None
    employment_status: Optional[str] = None  # ILO-aligned employment status
    employment_sector: Optional[str] = None  # ILO-aligned sector/industry (ISIC Rev.4)
    marital_status: Optional[str] = None

class ScreeningAnswerInput(BaseModel):
    question_id: int
    answer: str  # The selected option text or index

class ScreeningSubmissionRequest(BaseModel):
    demographics: Optional[Demographics] = None
    responses: Dict[str, str]  # question_id as string: answer

class SeverityLevel(str, Enum):
    LOW = "Low Concern"
    MODERATE = "Moderate Concern"
    HIGH = "High Concern"
    IMMEDIATE = "Immediate Attention Needed"

class CategoryResult(BaseModel):
    category: str
    score: int
    max_score: int
    severity: SeverityLevel
    description: str
    recommendations: List[str]

class ScreeningResults(BaseModel):
    session_id: str
    category_results: Dict[str, CategoryResult]
    crisis_detected: bool
    overall_summary: str
    created_at: datetime

class ScreeningSessionResponse(BaseModel):
    session_id: str
    demographics: Optional[Dict[str, Any]] = None
    responses: Dict[str, Any]
    results: Optional[Dict[str, Any]] = None
    created_at: datetime
    expires_at: datetime

    class Config:
        from_attributes = True

# ============================================================================
# NEW VALIDATED INSTRUMENTS SCHEMAS
# ============================================================================

class ValidatedScreeningSubmission(BaseModel):
    """Complete submission for validated instruments (ASSIST + PGSI + PHQ-9 + optional Triggers)"""
    demographics: Demographics
    assist: ASSISTResponse
    pgsi: PGSIResponse
    phq9: PHQ9Response
    triggers: Optional[TriggersResponse] = None

class ValidatedScreeningResults(BaseModel):
    """Complete results for validated instruments"""
    session_id: str
    demographics: Demographics
    assist_results: ASSISTResults
    pgsi_results: Optional[PGSIResults] = None
    phq9_results: PHQ9Results
    triggers_results: Optional[TriggersResults] = None
    crisis_detected: bool = Field(..., description="True if PHQ-9 Q9 > 0 OR ASSIST high risk")
    crisis_reasons: List[str] = Field(default_factory=list, description="Reasons for crisis detection")
    triggers_recommended: bool = Field(..., description="True if user should complete triggers")
    ai_feedback: Optional[Dict[str, Any]] = Field(None, description="AI-generated personalized feedback")
    recommendations: Optional[Dict[str, Any]] = Field(None, description="Professional referrals and resources")
    created_at: datetime

class ScreeningQuestionsGrouped(BaseModel):
    """All screening questions organized by instrument"""
    assist: Dict[str, Any] = Field(..., description="ASSIST questions organized by Q1, Q2-Q7, Q8")
    phq9: Dict[str, Any] = Field(..., description="PHQ-9 questions (Q1-Q9 + functional impairment)")
    triggers: Dict[str, Any] = Field(..., description="External and internal triggers checklists")
