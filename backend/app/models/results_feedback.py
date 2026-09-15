"""
SQLAlchemy model for Results Page Feedback
Stores user feedback (thumbs up/down) on screening results tabs
"""
from sqlalchemy import Column, Integer, String, Text, TIMESTAMP, JSON
from sqlalchemy.sql import func
from ..database import Base


class ResultsFeedback(Base):
    __tablename__ = "results_feedback"

    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(String(36), nullable=False, index=True)
    tab_name = Column(String(50), nullable=False)  # overview, assist, phq9, triggers, next-steps
    rating = Column(Integer, nullable=False)  # 1 = thumbs up, 0 = thumbs down
    comment = Column(Text, nullable=True)
    tab_content_summary = Column(JSON, nullable=True)  # Snapshot of data shown on the tab
    created_at = Column(TIMESTAMP, server_default=func.now())
    updated_at = Column(TIMESTAMP, server_default=func.now(), onupdate=func.now())
