"""
SQLAlchemy model for Improvement Suggestions
Stores open-ended user responses to "How do you think VibeCheck can help you better?"
"""
from sqlalchemy import Column, Integer, String, Text, TIMESTAMP
from sqlalchemy.sql import func
from ..database import Base


class ImprovementSuggestion(Base):
    __tablename__ = "improvement_suggestions"

    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(String(36), nullable=False, index=True)
    suggestion_text = Column(Text, nullable=False)
    created_at = Column(TIMESTAMP, server_default=func.now())