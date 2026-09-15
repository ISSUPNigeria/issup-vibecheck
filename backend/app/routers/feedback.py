"""
Feedback Router - Handles chat feedback submission
Collects thumbs up/down feedback on AI chatbot responses
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..database import get_db
from ..schemas.feedback import FeedbackRequest, FeedbackResponse
from ..models.feedback import ChatFeedback


router = APIRouter(prefix="/api/feedback", tags=["feedback"])


@router.post("/submit", response_model=FeedbackResponse)
async def submit_feedback(
    request: FeedbackRequest,
    db: Session = Depends(get_db)
):
    """
    Submit feedback for an AI chatbot response.

    - rating: 1 = thumbs up (helpful), 0 = thumbs down (not helpful)
    - comment: Optional text feedback (typically provided on thumbs down)
    """
    try:
        feedback = ChatFeedback(
            session_id=request.session_id,
            message_index=request.message_index,
            rating=request.rating,
            comment=request.comment,
            user_message=request.user_message,
            ai_message=request.ai_message
        )

        db.add(feedback)
        db.commit()
        db.refresh(feedback)

        return FeedbackResponse(
            id=feedback.id,
            message="Feedback submitted successfully"
        )

    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to submit feedback: {str(e)}")