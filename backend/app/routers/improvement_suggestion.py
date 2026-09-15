from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from ..database import get_db
from ..models.improvement_suggestion import ImprovementSuggestion
from ..schemas.improvement_suggestion import (
    ImprovementSuggestionRequest,
    ImprovementSuggestionResponse,
)

router = APIRouter(prefix="/api/suggestions", tags=["Improvement Suggestions"])


@router.post("/submit", response_model=ImprovementSuggestionResponse)
async def submit_suggestion(
    payload: ImprovementSuggestionRequest,
    db: Session = Depends(get_db),
):
    try:
        record = ImprovementSuggestion(
            session_id=payload.session_id,
            suggestion_text=payload.suggestion_text,
        )
        db.add(record)
        db.commit()
        db.refresh(record)
        return ImprovementSuggestionResponse(id=record.id, message="Thank you for your suggestion!")
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to save suggestion: {str(e)}")