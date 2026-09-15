"""
Pydantic schemas for Chat Feedback System
Handles thumbs up/down feedback on AI chatbot responses
"""
from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime


class FeedbackRequest(BaseModel):
    """Request schema for submitting feedback"""
    session_id: str = Field(..., description="Session ID from screening")
    message_index: int = Field(..., ge=0, description="Index of the AI message being rated")
    rating: int = Field(..., ge=0, le=1, description="1 = thumbs up, 0 = thumbs down")
    comment: Optional[str] = Field(None, description="Optional comment (typically on thumbs down)")
    user_message: str = Field(..., description="The user's message that triggered the AI response")
    ai_message: str = Field(..., description="The AI response that was rated")


class FeedbackResponse(BaseModel):
    """Response schema after submitting feedback"""
    id: int = Field(..., description="ID of the created feedback record")
    message: str = Field(..., description="Success message")

    class Config:
        from_attributes = True