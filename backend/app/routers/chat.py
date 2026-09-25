"""
Chat router for handling chatbot interactions.
Acts as a proxy between frontend and AI Engine, providing screening context.
"""

from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from typing import List, Optional
import httpx

from ..database import get_db
from ..schemas.chat import (
    SendMessageRequest,
    SendMessageResponse,
    StartConversationRequest,
    StartConversationResponse,
    ChatMessage
)
from ..models.screening import ScreeningSession, ScreeningQuestion
from ..models.chat_message import ChatMessage as ChatMessageModel, MessageRole
from ..config import settings
from ..utils.pii_anonymizer import anonymizer
from ..utils.auth_utils import get_optional_current_user

router = APIRouter()

AI_ENGINE_URL = settings.AI_ENGINE_URL


def _build_demographics_with_nickname(demographics: Optional[dict], nickname: Optional[str]) -> Optional[dict]:
    """
    Inject nickname into demographics so the AI Engine can address the user by name.
    Only applied for registered (authenticated) users.
    """
    if not demographics or not nickname:
        return demographics
    enriched = dict(demographics)
    enriched["nickname"] = nickname
    return enriched


def _save_messages(db: Session, user_id: int, session_id: str, pairs: list):
    """
    Persist chat message pairs to the database for registered users.
    pairs: list of (role, content) tuples, e.g. [("user", "..."), ("assistant", "...")]
    """
    for role, content in pairs:
        db.add(ChatMessageModel(
            user_id=user_id,
            session_id=session_id,
            role=MessageRole(role),
            content=content
        ))
    db.commit()


@router.post("/start", response_model=StartConversationResponse)
async def start_conversation(
    request: StartConversationRequest,
    current_user: Optional[dict] = Depends(get_optional_current_user),
    db: Session = Depends(get_db)
):
    """
    Start a new chat conversation.
    Retrieves screening results and sends to AI Engine for context-aware greeting.
    For registered users: saves AI greeting to chat_messages and passes nickname to AI.
    """
    try:
        # Get screening session from database
        session = db.query(ScreeningSession).filter(
            ScreeningSession.session_id == request.session_id
        ).first()

        if not session:
            raise HTTPException(status_code=404, detail="Screening session not found")

        # Prepare screening context, demographics, and responses for AI
        screening_context = session.results if session.results else None
        demographics = session.demographics if session.demographics else None
        responses = session.responses if session.responses else None

        # Inject nickname for registered users so AI greets them by name
        if current_user:
            demographics = _build_demographics_with_nickname(demographics, current_user.get("nickname"))

        # Get all questions to provide full context
        questions = db.query(ScreeningQuestion).order_by(ScreeningQuestion.order_index).all()
        questions_data = [
            {
                'id': q.id,
                'category': q.category,
                'question_text': q.question_text,
                'question_type': q.question_type.value if hasattr(q.question_type, 'value') else q.question_type,
                'options': q.options
            }
            for q in questions
        ]

        # Call AI Engine to start conversation
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{AI_ENGINE_URL}/api/chat/start-conversation",
                json={
                    "session_id": request.session_id,
                    "screening_context": screening_context,
                    "demographics": demographics,
                    "responses": responses,
                    "questions": questions_data
                },
                timeout=30.0
            )

print("=" * 80)
print("STATUS:", response.status_code)
print("BODY:", response.text)
print("=" * 80)

            if response.status_code != 200:
                raise HTTPException(
                    status_code=response.status_code,
                    detail="Failed to start conversation with AI Engine"
                )

            ai_response = response.json()
            greeting = ai_response["message"]

            # Save AI greeting to DB for registered users
            if current_user:
                _save_messages(db, current_user["user_id"], request.session_id, [
                    ("assistant", greeting)
                ])

            return StartConversationResponse(message=greeting)

    except httpx.RequestError as e:
        raise HTTPException(status_code=503, detail=f"AI Engine unavailable: {str(e)}")
    except Exception as e:
    import traceback

    print("=" * 80)
    print("CHAT START ERROR")
    print(repr(e))
    print(traceback.format_exc())
    print("=" * 80)

    raise HTTPException(
        status_code=500,
        detail=f"Error starting conversation: {str(e)}"
    )


@router.post("/message", response_model=SendMessageResponse)
async def send_message(
    request: SendMessageRequest,
    current_user: Optional[dict] = Depends(get_optional_current_user),
    db: Session = Depends(get_db)
):
    """
    Send a message to the chatbot and get a response.
    Includes screening context from database for personalized support.
    For registered users: saves both user message and AI response to chat_messages.
    """
    try:
        # Get screening session from database
        session = db.query(ScreeningSession).filter(
            ScreeningSession.session_id == request.session_id
        ).first()

        if not session:
            raise HTTPException(status_code=404, detail="Screening session not found")

        # Prepare screening context, demographics, and responses
        screening_context = session.results if session.results else None
        demographics = session.demographics if session.demographics else None
        responses = session.responses if session.responses else None

        # Inject nickname for registered users
        if current_user:
            demographics = _build_demographics_with_nickname(demographics, current_user.get("nickname"))

        # Get all questions to provide full context
        questions = db.query(ScreeningQuestion).order_by(ScreeningQuestion.order_index).all()
        questions_data = [
            {
                'id': q.id,
                'category': q.category,
                'question_text': q.question_text,
                'question_type': q.question_type.value if hasattr(q.question_type, 'value') else q.question_type,
                'options': q.options
            }
            for q in questions
        ]

        # Build message list for AI Engine with PII anonymization
        # Cap history to last 10 messages to control token usage
        recent_history = request.conversation_history[-10:]
        messages = []
        for msg in recent_history:
            if msg.role == "user":
                anonymized_content, _ = anonymizer.anonymize(msg.content)
                messages.append({"role": msg.role, "content": anonymized_content})
            else:
                messages.append({"role": msg.role, "content": msg.content})

        # Anonymize current user message
        anonymized_message, redaction_stats = anonymizer.anonymize(request.message)
        messages.append({"role": "user", "content": anonymized_message})

        if any(redaction_stats.values()):
            print(f"[PII Anonymizer] Redacted from user message: {redaction_stats}")

        # Call AI Engine
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{AI_ENGINE_URL}/api/chat/message",
                json={
                    "session_id": request.session_id,
                    "messages": messages,
                    "screening_context": screening_context,
                    "demographics": demographics,
                    "responses": responses,
                    "questions": questions_data
                },
                timeout=30.0
            )

            if response.status_code != 200:
                raise HTTPException(
                    status_code=response.status_code,
                    detail="Failed to get response from AI Engine"
                )

            ai_response = response.json()
	    print("=" * 80)
print("AI RESPONSE JSON:")
print(ai_response)
print("=" * 80)
            ai_message = ai_response["message"]

            # Save user message + AI response to DB for registered users
            if current_user:
                _save_messages(db, current_user["user_id"], request.session_id, [
                    ("user", request.message),
                    ("assistant", ai_message)
                ])

            return SendMessageResponse(
                message=ai_message,
                crisis_detected=ai_response.get("crisis_detected", False),
                resources_provided=ai_response.get("resources_provided", False)
            )

    except httpx.RequestError as e:
        raise HTTPException(status_code=503, detail=f"AI Engine unavailable: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error sending message: {str(e)}")


@router.get("/session/{session_id}/exists")
async def check_session_exists(session_id: str, db: Session = Depends(get_db)):
    """Check if a screening session exists."""
    session = db.query(ScreeningSession).filter(
        ScreeningSession.session_id == session_id
    ).first()
    return {"exists": session is not None}
