from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from ..database import get_db
from ..models.chat_message import ChatMessage
from ..models.screening import ScreeningSession
from ..utils.auth_utils import get_required_current_user

router = APIRouter()


@router.get("/chat-history/sessions")
async def get_user_sessions(
    current_user: dict = Depends(get_required_current_user),
    db: Session = Depends(get_db)
):
    """
    Get all screening sessions belonging to the logged-in user.
    Returns summary info for each session to display in the conversations list.
    """
    sessions = db.query(ScreeningSession).filter(
        ScreeningSession.user_id == current_user["user_id"]
    ).order_by(ScreeningSession.created_at.desc()).all()

    result = []
    for s in sessions:
        # Count saved messages for this session
        message_count = db.query(ChatMessage).filter(
            ChatMessage.session_id == s.session_id
        ).count()

        # Extract substances with moderate or high risk from ASSIST results
        substances = []
        overall_risk = None
        phq9_severity = None

        if s.results:
            assist = s.results.get("assist", {})
            overall_risk = assist.get("overall_risk")
            scores = assist.get("scores", {})
            substances = [
                sub for sub, data in scores.items()
                if data.get("risk_level") in ["moderate", "high"]
            ]
            phq9 = s.results.get("phq9", {})
            phq9_severity = phq9.get("severity")

        result.append({
            "session_id": s.session_id,
            "created_at": s.created_at.isoformat() if s.created_at else None,
            "overall_risk": overall_risk,
            "phq9_severity": phq9_severity,
            "substances": substances,
            "message_count": message_count
        })

    return result


@router.get("/chat-history/{session_id}")
async def get_session_messages(
    session_id: str,
    current_user: dict = Depends(get_required_current_user),
    db: Session = Depends(get_db)
):
    """
    Get all saved chat messages for a specific session.
    Only accessible by the user who owns the session.
    """
    # Verify the session belongs to this user
    session = db.query(ScreeningSession).filter(
        ScreeningSession.session_id == session_id
    ).first()

    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    if session.user_id != current_user["user_id"]:
        raise HTTPException(status_code=403, detail="Access denied")

    messages = db.query(ChatMessage).filter(
        ChatMessage.session_id == session_id
    ).order_by(ChatMessage.created_at.asc()).all()

    return [
        {
            "role": msg.role.value if hasattr(msg.role, "value") else msg.role,
            "content": msg.content,
            "created_at": msg.created_at.isoformat() if msg.created_at else None
        }
        for msg in messages
    ]
