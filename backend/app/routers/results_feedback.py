"""
Router for Results Page Feedback endpoints
Handles submission and retrieval of feedback on screening results tabs
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import and_
from typing import Dict, Optional

from ..database import get_db
from ..models.results_feedback import ResultsFeedback
from ..schemas.results_feedback import (
    ResultsFeedbackRequest,
    ResultsFeedbackResponse,
    ResultsFeedbackStatus,
    TabName
)

router = APIRouter(prefix="/api/results-feedback", tags=["Results Feedback"])


@router.post("/submit", response_model=ResultsFeedbackResponse)
async def submit_results_feedback(
    feedback: ResultsFeedbackRequest,
    db: Session = Depends(get_db)
):
    """
    Submit feedback for a results page tab.
    Allows re-rating: if feedback already exists for this session+tab, it will be updated.
    """
    try:
        # Check if feedback already exists for this session and tab
        existing = db.query(ResultsFeedback).filter(
            and_(
                ResultsFeedback.session_id == feedback.session_id,
                ResultsFeedback.tab_name == feedback.tab_name.value
            )
        ).first()

        if existing:
            # Update existing feedback (re-rating)
            existing.rating = feedback.rating
            existing.comment = feedback.comment
            existing.tab_content_summary = feedback.tab_content_summary
            db.commit()
            db.refresh(existing)

            return ResultsFeedbackResponse(
                id=existing.id,
                message="Feedback updated successfully",
                is_update=True
            )
        else:
            # Create new feedback
            db_feedback = ResultsFeedback(
                session_id=feedback.session_id,
                tab_name=feedback.tab_name.value,
                rating=feedback.rating,
                comment=feedback.comment,
                tab_content_summary=feedback.tab_content_summary
            )

            db.add(db_feedback)
            db.commit()
            db.refresh(db_feedback)

            return ResultsFeedbackResponse(
                id=db_feedback.id,
                message="Feedback submitted successfully",
                is_update=False
            )

    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to submit feedback: {str(e)}")


@router.get("/status/{session_id}", response_model=ResultsFeedbackStatus)
async def get_feedback_status(
    session_id: str,
    db: Session = Depends(get_db)
):
    """
    Get existing feedback status for a session.
    Returns which tabs have been rated and their ratings.
    """
    try:
        feedbacks = db.query(ResultsFeedback).filter(
            ResultsFeedback.session_id == session_id
        ).all()

        # Build map of tab_name -> rating
        feedback_by_tab: Dict[str, Optional[int]] = {
            tab.value: None for tab in TabName
        }

        for fb in feedbacks:
            feedback_by_tab[fb.tab_name] = fb.rating

        return ResultsFeedbackStatus(
            session_id=session_id,
            feedback_by_tab=feedback_by_tab
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get feedback status: {str(e)}")


@router.get("/tab/{session_id}/{tab_name}")
async def get_tab_feedback(
    session_id: str,
    tab_name: TabName,
    db: Session = Depends(get_db)
):
    """
    Get existing feedback for a specific tab.
    Returns the feedback record if it exists, null otherwise.
    """
    try:
        feedback = db.query(ResultsFeedback).filter(
            and_(
                ResultsFeedback.session_id == session_id,
                ResultsFeedback.tab_name == tab_name.value
            )
        ).first()

        if feedback:
            return {
                "id": feedback.id,
                "rating": feedback.rating,
                "comment": feedback.comment,
                "created_at": feedback.created_at,
                "updated_at": feedback.updated_at
            }

        return None

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get tab feedback: {str(e)}")