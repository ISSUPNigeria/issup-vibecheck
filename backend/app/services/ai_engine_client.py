import httpx
from typing import Dict, Any, Optional
from ..config import settings

class AIEngineClient:
    """Client to communicate with AI Engine for personalized feedback"""

    def __init__(self):
        self.base_url = settings.AI_ENGINE_URL
        self.timeout = 30.0  # 30 seconds timeout for AI feedback (increased for detailed personalized responses)

    async def generate_screening_feedback(
        self,
        responses: Dict[str, str],
        scores: Dict[str, int],
        max_scores: Dict[str, int],
        severities: Dict[str, str],
        crisis_detected: bool,
        questions_data: list
    ) -> Dict[str, Any]:
        """
        Call AI Engine to generate personalized feedback based on screening results

        Returns:
            {
                "category_feedback": {
                    "substance_use": {
                        "description": "...",
                        "recommendations": ["..."]
                    },
                    ...
                },
                "overall_summary": "...",
                "crisis_detected": bool
            }
        """
        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                response = await client.post(
                    f"{self.base_url}/api/screening/feedback",
                    json={
                        "responses": responses,
                        "scores": scores,
                        "max_scores": max_scores,
                        "severities": severities,
                        "crisis_detected": crisis_detected,
                        "questions": questions_data
                    }
                )
                response.raise_for_status()
                return response.json()
        except httpx.HTTPError as e:
            print(f"Error calling AI Engine: {e}")
            # Fallback to basic feedback if AI Engine fails
            return self._generate_fallback_feedback(severities, crisis_detected)

    def _generate_fallback_feedback(self, severities: Dict[str, str], crisis_detected: bool) -> Dict[str, Any]:
        """Generate basic fallback feedback if AI Engine is unavailable"""
        category_names = {
            "substance_use": "Substance Use",
            "mental_health": "Mental Health",
            "trauma": "Trauma",
            "physical": "Physical Health",
            "crisis": "Crisis"
        }

        category_feedback = {}
        for category, severity in severities.items():
            category_feedback[category] = {
                "description": f"Your {category_names[category]} screening indicates: {severity}",
                "recommendations": ["Please consult with a healthcare professional for personalized guidance."]
            }

        overall_summary = "Thank you for completing the screening. Based on your responses, we recommend connecting with a healthcare professional for personalized support."

        if crisis_detected:
            overall_summary = "We're concerned about your immediate safety. Please reach out to a crisis line or emergency services right away."

        return {
            "category_feedback": category_feedback,
            "overall_summary": overall_summary,
            "crisis_detected": crisis_detected
        }

    async def generate_validated_screening_feedback(
        self,
        demographics: Dict[str, Any],
        assist_results: Dict[str, Any],
        pgsi_results: Optional[Dict[str, Any]],
        phq9_results: Dict[str, Any],
        triggers_results: Optional[Dict[str, Any]],
        crisis_detected: bool,
        crisis_reasons: list
    ) -> Optional[Dict[str, Any]]:
        """
        Generate AI feedback for validated screening (ASSIST + PHQ-9 + Triggers)

        Args:
            demographics: User demographic information
            assist_results: ASSIST assessment results
            phq9_results: PHQ-9 assessment results
            triggers_results: Triggers assessment results (optional)
            crisis_detected: Whether crisis was detected
            crisis_reasons: List of crisis reasons if detected

        Returns:
            AI feedback dictionary or None if generation fails/times out
            {
                "assist_feedback": "Personalized feedback about substance use",
                "phq9_feedback": "Personalized feedback about depression",
                "triggers_feedback": "Personalized feedback about triggers",
                "overall_message": "Overall supportive message",
                "next_steps": ["action 1", "action 2"],
                "crisis_detected": bool
            }
        """
        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                response = await client.post(
                    f"{self.base_url}/api/validated-screening/feedback/validated",
                    json={
                        "demographics": demographics,
                        "assist_results": assist_results,
                        "pgsi_results": pgsi_results,
                        "phq9_results": phq9_results,
                        "triggers_results": triggers_results,
                        "crisis_detected": crisis_detected,
                        "crisis_reasons": crisis_reasons
                    }
                )

                if response.status_code == 200:
                    return response.json()
                else:
                    print(f"AI Engine returned status {response.status_code}: {response.text}")
                    return None

        except httpx.TimeoutException:
            print(f"AI Engine request timed out after {self.timeout} seconds - continuing without AI feedback")
            return None

        except httpx.RequestError as e:
            print(f"AI Engine request failed: {e} - continuing without AI feedback")
            return None

        except Exception as e:
            print(f"Unexpected error calling AI Engine: {e} - continuing without AI feedback")
            return None
