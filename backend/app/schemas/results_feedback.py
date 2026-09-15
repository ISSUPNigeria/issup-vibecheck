"""
Pydantic schemas for Results Page Feedback System
Handles thumbs up/down feedback on screening results tabs
"""
from pydantic import BaseModel, Field
from typing import Optional, Dict, Any, List
from datetime import datetime
from enum import Enum


class TabName(str, Enum):
    """Valid tab names for Results page"""
    OVERVIEW = "overview"
    ASSIST = "assist"
    PHQ9 = "phq9"
    TRIGGERS = "triggers"
    NEXT_STEPS = "next-steps"


class ResultsFeedbackRequest(BaseModel):
    """Request schema for submitting results feedback"""
    session_id: str = Field(..., description="Session ID from screening")
    tab_name: TabName = Field(..., description="Which tab is being rated")
    rating: int = Field(..., ge=0, le=1, description="1 = thumbs up, 0 = thumbs down")
    comment: Optional[str] = Field(None, description="Optional feedback comment")
    tab_content_summary: Dict[str, Any] = Field(
        ...,
        description="Snapshot of key data shown on the tab (scores, risk levels, etc.)"
    )


class ResultsFeedbackResponse(BaseModel):
    """Response schema after submitting feedback"""
    id: int = Field(..., description="ID of the feedback record")
    message: str = Field(..., description="Success message")
    is_update: bool = Field(False, description="Whether this was an update to existing feedback")

    class Config:
        from_attributes = True


class ResultsFeedbackStatus(BaseModel):
    """Schema for checking existing feedback status for a session"""
    session_id: str
    feedback_by_tab: Dict[str, Optional[int]] = Field(
        default_factory=dict,
        description="Map of tab_name to rating (1, 0, or null if not rated)"
    )


class ResultsFeedbackRecord(BaseModel):
    """Full feedback record for admin/analytics"""
    id: int
    session_id: str
    tab_name: str
    rating: int
    comment: Optional[str]
    tab_content_summary: Optional[Dict[str, Any]]
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
