from sqlalchemy.orm import Session
from typing import Dict, Any
from datetime import datetime, timedelta
import uuid

from ..models.screening import ScreeningQuestion, ScreeningSession
from ..schemas.screening import ScreeningResults, CategoryResult, SeverityLevel
from ..utils.scoring import (
    calculate_category_scores,
    determine_severity,
    detect_crisis
)
from .ai_engine_client import AIEngineClient

class ScreeningService:
    def __init__(self, db: Session):
        self.db = db
        self.ai_client = AIEngineClient()

    def get_all_questions(self):
        """Get all screening questions ordered by order_index"""
        return self.db.query(ScreeningQuestion).order_by(ScreeningQuestion.order_index).all()

    async def process_screening(self, responses: Dict[str, str], demographics: Dict[str, Any] = None) -> ScreeningResults:
        """
        Process screening responses using HYBRID APPROACH:
        1. Logic-based scoring (fast, deterministic)
        2. AI-generated feedback (personalized, empathetic)
        """
        # Get all questions
        questions = self.get_all_questions()
        questions_data = [
            {
                'id': q.id,
                'category': q.category.value,
                'question_text': q.question_text,
                'question_type': q.question_type.value,
                'options': q.options,
                'scoring_weight': q.scoring_weight
            }
            for q in questions
        ]

        # STEP 1: LOGIC-BASED SCORING (Fast & Deterministic)
        # Calculate scores
        scores, max_scores = calculate_category_scores(responses, questions_data)

        # Determine severity levels
        severities = {}
        for category in scores.keys():
            severities[category] = determine_severity(
                scores[category],
                max_scores[category],
                category
            )

        # CRITICAL: Detect crisis (deterministic - safety first!)
        crisis_detected = detect_crisis(responses, questions_data)

        # STEP 2: AI-GENERATED FEEDBACK (Personalized & Empathetic)
        ai_feedback = await self.ai_client.generate_screening_feedback(
            responses=responses,
            scores=scores,
            max_scores=max_scores,
            severities={k: v.value for k, v in severities.items()},
            crisis_detected=crisis_detected,
            questions_data=questions_data
        )

        # STEP 3: Combine logic-based scores with AI feedback
        category_results = {}
        for category in scores.keys():
            ai_category_feedback = ai_feedback.get('category_feedback', {}).get(category, {})

            category_results[category] = CategoryResult(
                category=category,
                score=scores[category],
                max_score=max_scores[category],
                severity=severities[category],
                description=ai_category_feedback.get('description', f'{category} assessment completed'),
                recommendations=ai_category_feedback.get('recommendations', [])
            )

        # STEP 4: Create and save session
        session_id = str(uuid.uuid4())
        expires_at = datetime.utcnow() + timedelta(hours=24)

        results_data = {
            'category_results': {k: v.dict() for k, v in category_results.items()},
            'crisis_detected': crisis_detected,
            'overall_summary': ai_feedback.get('overall_summary', '')
        }

        session = ScreeningSession(
            session_id=session_id,
            demographics=demographics,
            responses=responses,
            results=results_data,
            created_at=datetime.utcnow(),
            expires_at=expires_at
        )

        self.db.add(session)
        self.db.commit()

        # Return results
        return ScreeningResults(
            session_id=session_id,
            category_results=category_results,
            crisis_detected=crisis_detected,
            overall_summary=ai_feedback.get('overall_summary', ''),
            created_at=datetime.utcnow()
        )

    def get_session(self, session_id: str) -> ScreeningSession:
        """Get screening session by ID"""
        return self.db.query(ScreeningSession).filter(
            ScreeningSession.session_id == session_id
        ).first()
