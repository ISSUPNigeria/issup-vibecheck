"""
SQLAlchemy model for Chat Feedback
Stores user feedback (thumbs up/down) on AI chatbot responses
"""
from sqlalchemy import Column, Integer, String, Text, TIMESTAMP
from sqlalchemy.sql import func
from ..database import Base


class ChatFeedback(Base):
    __tablename__ = "chat_feedback"

    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(String(36), nullable=False, index=True)
    message_index = Column(Integer, nullable=False)
    rating = Column(Integer, nullable=False)  # 1 = thumbs up, 0 = thumbs down
    comment = Column(Text, nullable=True)
    user_message = Column(Text, nullable=True)
    ai_message = Column(Text, nullable=True)
    created_at = Column(TIMESTAMP, server_default=func.now())