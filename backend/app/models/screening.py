from sqlalchemy import Column, Integer, String, Text, Enum, JSON, DateTime, Index, Boolean, ForeignKey
from sqlalchemy.sql import func
from ..database import Base
import enum

# New Instrument Enum for validated screening tools
class Instrument(str, enum.Enum):
    ASSIST = "ASSIST"
    PHQ9 = "PHQ9"
    EXTERNAL_TRIGGERS = "EXTERNAL_TRIGGERS"
    INTERNAL_TRIGGERS = "INTERNAL_TRIGGERS"

# Legacy category enum (kept for backward compatibility)
class QuestionCategory(str, enum.Enum):
    substance_use = "substance_use"
    mental_health = "mental_health"
    trauma = "trauma"
    physical = "physical"
    crisis = "crisis"

# Updated question type enum for new instruments
class QuestionType(str, enum.Enum):
    # Legacy types
    multiple_choice = "multiple_choice"
    scale = "scale"
    yes_no = "yes_no"
    # New ASSIST types
    lifetime_use = "lifetime_use"
    frequency = "frequency"
    injection = "injection"
    # New PHQ-9 types
    depression_scale = "depression_scale"
    functional_scale = "functional_scale"
    # New Triggers type
    trigger_checkbox = "trigger_checkbox"

class ScreeningQuestion(Base):
    __tablename__ = "screening_questions"

    id = Column(Integer, primary_key=True, index=True)

    # New fields for validated instruments
    instrument = Column(Enum(Instrument), nullable=True, index=True)  # NULL for legacy questions
    question_number = Column(Integer, nullable=True)  # Question number within instrument (e.g., 1-9 for PHQ-9)
    is_crisis_question = Column(Boolean, default=False)  # Flag for PHQ-9 Q9
    skip_for_substances = Column(JSON, nullable=True)  # For ASSIST Q5 (skip tobacco)

    # Existing fields (category now used for ASSIST substance names)
    category = Column(String(100), nullable=True, index=True)  # For ASSIST: 'tobacco', 'alcohol', etc.
    question_text = Column(Text, nullable=False)
    question_type = Column(Enum(QuestionType), nullable=False)
    options = Column(JSON, nullable=True)  # JSON array of options with scores
    order_index = Column(Integer, nullable=False, index=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    __table_args__ = (
        Index('idx_instrument', 'instrument'),
        Index('idx_category', 'category'),
        Index('idx_question_number', 'question_number'),
        Index('idx_order', 'order_index'),
    )

class ScreeningSession(Base):
    __tablename__ = "screening_sessions"

    session_id = Column(String(255), primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True)
    demographics = Column(JSON, nullable=True)  # JSON object with user demographics
    responses = Column(JSON, nullable=False)  # JSON object with question_id: answer
    results = Column(JSON, nullable=True)  # JSON object with scoring results
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    expires_at = Column(DateTime(timezone=True), nullable=True)  # NULL = permanent (registered users); timestamp = guest expiry

    __table_args__ = (
        Index('idx_created_at', 'created_at'),
        Index('idx_expires_at', 'expires_at'),
    )
