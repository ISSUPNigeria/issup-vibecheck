from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Dict, Any, Optional
from datetime import datetime, timedelta
import uuid

from ..database import get_db
from ..schemas.screening import (
    ScreeningQuestionResponse,
    ScreeningQuestionsListResponse,
    ScreeningSubmissionRequest,
    ScreeningResults,
    ScreeningSessionResponse,
    ValidatedScreeningSubmission,
    ValidatedScreeningResults,
    ScreeningQuestionsGrouped
)
from ..schemas.triggers import TriggersEligibility
from ..services.screening_service import ScreeningService
from ..services.assist_scoring_service import ASSISTScoringService
from ..services.phq9_scoring_service import PHQ9ScoringService
from ..services.pgsi_scoring_service import PGSIScoringService
from ..services.triggers_analysis_service import TriggersAnalysisService
from ..services.ai_engine_client import AIEngineClient
from ..models.screening import Instrument, ScreeningQuestion, ScreeningSession
from ..utils.auth_utils import get_optional_current_user

router = APIRouter()

@router.get("/questions", response_model=ScreeningQuestionsListResponse)
async def get_screening_questions(db: Session = Depends(get_db)):
    """Get all screening questions"""
    service = ScreeningService(db)
    questions = service.get_all_questions()

    return ScreeningQuestionsListResponse(
        questions=[ScreeningQuestionResponse.from_orm(q) for q in questions],
        total=len(questions)
    )

@router.post("/submit", response_model=ScreeningResults)
async def submit_screening(
    submission: ScreeningSubmissionRequest,
    db: Session = Depends(get_db)
):
    """
    Submit screening responses and get results
    Uses HYBRID APPROACH:
    - Logic-based scoring (fast, deterministic)
    - AI-generated feedback (personalized, empathetic)
    """
    service = ScreeningService(db)

    try:
        # Convert demographics to dict if provided
        demographics_dict = submission.demographics.dict() if submission.demographics else None
        results = await service.process_screening(submission.responses, demographics_dict)
        return results
    except Exception as e:
        print(f"Error processing screening: {e}")
        raise HTTPException(status_code=500, detail="Failed to process screening")

@router.get("/session/{session_id}", response_model=ScreeningSessionResponse)
async def get_screening_session(session_id: str, db: Session = Depends(get_db)):
    """Get screening session by ID"""
    service = ScreeningService(db)
    session = service.get_session(session_id)

    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    return ScreeningSessionResponse.from_orm(session)


# ============================================================================
# NEW VALIDATED INSTRUMENTS ENDPOINTS
# ============================================================================

@router.get("/v2/questions")
async def get_validated_questions(db: Session = Depends(get_db)):
    """
    Get all validated instrument questions organized by instrument

    Returns:
        - ASSIST questions (Q1 lifetime, Q2-Q7 substance-specific, Q8 injection)
        - PHQ-9 questions (Q1-Q9 depression + functional impairment)
        - Triggers checklists (external and internal)
    """
    # Get ASSIST questions
    assist_questions = db.query(ScreeningQuestion).filter(
        ScreeningQuestion.instrument == Instrument.ASSIST
    ).order_by(ScreeningQuestion.order_index).all()

    # Get PHQ-9 questions
    phq9_questions = db.query(ScreeningQuestion).filter(
        ScreeningQuestion.instrument == Instrument.PHQ9
    ).order_by(ScreeningQuestion.order_index).all()

    # Get External Triggers
    external_triggers = db.query(ScreeningQuestion).filter(
        ScreeningQuestion.instrument == Instrument.EXTERNAL_TRIGGERS
    ).order_by(ScreeningQuestion.order_index).all()

    # Get Internal Triggers
    internal_triggers = db.query(ScreeningQuestion).filter(
        ScreeningQuestion.instrument == Instrument.INTERNAL_TRIGGERS
    ).order_by(ScreeningQuestion.order_index).all()

    # Organize ASSIST questions by type
    assist_q1 = next((q for q in assist_questions if q.question_number == 1), None)
    assist_q2_q7 = [q for q in assist_questions if 2 <= q.question_number <= 7]
    assist_q8 = next((q for q in assist_questions if q.question_number == 8), None)

    # Organize PHQ-9 questions
    phq9_depression = [q for q in phq9_questions if 1 <= q.question_number <= 9]
    phq9_functional = next((q for q in phq9_questions if q.question_number == 10), None)

    # Helper function to convert question to dict
    def question_to_dict(q):
        if not q:
            return None
        return {
            "id": q.id,
            "instrument": q.instrument.value if q.instrument else None,
            "category": q.category,
            "question_number": q.question_number,
            "question_text": q.question_text,
            "question_type": q.question_type.value if q.question_type else None,
            "options": q.options,
            "order_index": q.order_index,
            "is_crisis_question": q.is_crisis_question,
            "skip_for_substances": q.skip_for_substances
        }

    return {
        "assist_questions": [question_to_dict(q) for q in assist_questions],
        "phq9_questions": [question_to_dict(q) for q in phq9_questions],
        "triggers_questions": {
            "external": [question_to_dict(q) for q in external_triggers],
            "internal": [question_to_dict(q) for q in internal_triggers]
        }
    }


@router.post("/v2/submit", response_model=ValidatedScreeningResults)
async def submit_validated_screening(
    submission: ValidatedScreeningSubmission,
    current_user: Optional[dict] = Depends(get_optional_current_user),
    db: Session = Depends(get_db)
):
    """
    Submit validated screening (ASSIST + PHQ-9 + optional Triggers) and get results

    Uses HYBRID APPROACH:
    - Logic-based scoring (ASSIST V3.0, PHQ-9 validated algorithms)
    - AI-generated personalized feedback (to be integrated in Phase 3)

    Returns complete results with:
    - ASSIST scores per substance (risk levels: low/moderate/high)
    - PHQ-9 total score and severity level
    - Triggers analysis (if applicable)
    - Crisis detection (PHQ-9 Q9 > 0 OR ASSIST high risk)
    """
    try:
        # Initialize scoring services
        assist_service = ASSISTScoringService()
        pgsi_service = PGSIScoringService()
        phq9_service = PHQ9ScoringService()
        triggers_service = TriggersAnalysisService()

        # Score ASSIST
        assist_results = assist_service.calculate_all_scores(submission.assist)

        # Score PGSI
        pgsi_results = pgsi_service.calculate_score(submission.pgsi)

        # Score PHQ-9
        phq9_results = phq9_service.calculate_score(submission.phq9)

        # Analyze Triggers (if provided)
        triggers_results = None
        if submission.triggers:
            triggers_results = triggers_service.analyze_triggers(submission.triggers)

        # Detect crisis
        crisis_detected = phq9_results.suicidal_ideation or assist_results.overall_risk == "high"
        crisis_reasons = []
        if phq9_results.suicidal_ideation:
            crisis_reasons.append("PHQ-9 Q9 > 0: Suicidal ideation detected")
        if assist_results.overall_risk == "high":
            crisis_reasons.append(f"ASSIST high risk: {assist_results.highest_risk_substance}")

        # Determine if triggers are recommended
        triggers_recommended = phq9_results.triggers_recommended or assist_results.brief_intervention_needed

        # ======================================================================
        # PHASE 3: AI FEEDBACK GENERATION (Synchronous with 10s timeout)
        # ======================================================================
        ai_feedback = None
        try:
            ai_client = AIEngineClient()
            ai_feedback = await ai_client.generate_validated_screening_feedback(
                demographics=submission.demographics.dict(),
                assist_results=assist_results.dict(),
                pgsi_results=pgsi_results.dict(),
                phq9_results=phq9_results.dict(),
                triggers_results=triggers_results.dict() if triggers_results else None,
                crisis_detected=crisis_detected,
                crisis_reasons=crisis_reasons
            )
            print(f"AI feedback generated successfully: {ai_feedback is not None}")
        except Exception as e:
            print(f"AI feedback generation failed (non-blocking): {e}")
            ai_feedback = None  # Continue without AI feedback if it fails

        # Create session
        session_id = str(uuid.uuid4())
        # Registered users: permanent (no expiry). Guests: expire in 24h.
        expires_at = None if current_user else datetime.utcnow() + timedelta(hours=24)

        # Store results in database
        results_data = {
            "assist": assist_results.dict(),
            "pgsi": pgsi_results.dict(),
            "phq9": phq9_results.dict(),
            "triggers": triggers_results.dict() if triggers_results else None,
            "crisis_detected": crisis_detected,
            "crisis_reasons": crisis_reasons,
            "ai_feedback": ai_feedback
        }

        session = ScreeningSession(
            session_id=session_id,
            user_id=current_user["user_id"] if current_user else None,
            demographics=submission.demographics.dict(),
            responses={
                "assist": submission.assist.dict(),
                "pgsi": submission.pgsi.dict(),
                "phq9": submission.phq9.dict(),
                "triggers": submission.triggers.dict() if submission.triggers else None
            },
            results=results_data,
            created_at=datetime.utcnow(),
            expires_at=expires_at
        )

        db.add(session)
        db.commit()

        # Return results
        return ValidatedScreeningResults(
            session_id=session_id,
            demographics=submission.demographics,
            assist_results=assist_results,
            pgsi_results=pgsi_results,
            phq9_results=phq9_results,
            triggers_results=triggers_results,
            crisis_detected=crisis_detected,
            crisis_reasons=crisis_reasons,
            triggers_recommended=triggers_recommended,
            ai_feedback=ai_feedback,
            recommendations=None,
            created_at=datetime.utcnow()
        )

    except Exception as e:
        print(f"Error processing validated screening: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Failed to process screening: {str(e)}")


@router.get("/v2/should-show-triggers/{session_id}", response_model=TriggersEligibility)
async def check_triggers_eligibility(session_id: str, db: Session = Depends(get_db)):
    """
    Check if user should be shown triggers assessment based on ASSIST results ONLY

    UPDATED: New screening flow is ASSIST → Triggers → PHQ-9
    Triggers are now shown ONLY if:
    - Any ASSIST substance score >= 4 (moderate or high risk)

    PHQ-9 is no longer considered for triggers eligibility since it comes AFTER triggers.

    Returns:
        - should_show_triggers: bool
        - reason: explanation of why triggers are/aren't shown
        - assist_moderate_or_high: bool
        - phq9_moderate_or_high: bool (kept for backwards compatibility)
    """
    # Get session
    session = db.query(ScreeningSession).filter(
        ScreeningSession.session_id == session_id
    ).first()

    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    if not session.results:
        raise HTTPException(status_code=400, detail="Session has no results yet")

    # Extract ASSIST results from session (PHQ-9 not needed for triggers eligibility)
    assist_results = session.results.get("assist", {})

    # Check ASSIST moderate or high risk
    assist_moderate_or_high = assist_results.get("brief_intervention_needed", False)

    # Use triggers service to check eligibility (only ASSIST matters now)
    triggers_service = TriggersAnalysisService()
    eligibility = triggers_service.check_eligibility(
        assist_moderate_or_high=assist_moderate_or_high
    )

    return TriggersEligibility(**eligibility)


@router.get("/v2/results/{session_id}", response_model=ValidatedScreeningResults)
async def get_validated_results(session_id: str, db: Session = Depends(get_db)):
    """
    Get validated screening results by session ID

    Returns complete results including:
    - ASSIST scores and risk levels
    - PHQ-9 score and severity
    - Triggers analysis (if completed)
    - Crisis detection
    - AI feedback (Phase 3)
    - Professional recommendations (Phase 3)
    """
    session = db.query(ScreeningSession).filter(
        ScreeningSession.session_id == session_id
    ).first()

    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    if not session.results:
        raise HTTPException(status_code=400, detail="Session has no results")

    # Reconstruct results from stored data
    from ..schemas.assist import ASSISTResults
    from ..schemas.pgsi import PGSIResults
    from ..schemas.phq9 import PHQ9Results
    from ..schemas.triggers import TriggersResults
    from ..schemas.screening import Demographics

    assist_results = ASSISTResults(**session.results["assist"])
    pgsi_results = PGSIResults(**session.results["pgsi"]) if session.results.get("pgsi") else None
    phq9_results = PHQ9Results(**session.results["phq9"])
    triggers_results = TriggersResults(**session.results["triggers"]) if session.results.get("triggers") else None
    demographics = Demographics(**session.demographics) if session.demographics else None

    return ValidatedScreeningResults(
        session_id=session.session_id,
        demographics=demographics,
        assist_results=assist_results,
        pgsi_results=pgsi_results,
        phq9_results=phq9_results,
        triggers_results=triggers_results,
        crisis_detected=session.results.get("crisis_detected", False),
        crisis_reasons=session.results.get("crisis_reasons", []),
        triggers_recommended=phq9_results.triggers_recommended or assist_results.brief_intervention_needed,
        ai_feedback=session.results.get("ai_feedback"),
        recommendations=None,
        created_at=session.created_at
    )
