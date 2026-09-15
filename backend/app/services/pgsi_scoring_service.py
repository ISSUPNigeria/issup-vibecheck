"""
PGSI (Problem Gambling Severity Index) Scoring Service

Implements the official PGSI scoring algorithm for gambling screening.

SCORING RULES:
- Total Score: Sum of Q1–Q9 (each question scored 0–3)
- Range: 0–27
- Scale: Never (0), Sometimes (1), Most of the time (2), Almost always (3)

RISK CATEGORIES:
- 0:   Non-problem gambling
- 1–4: Low risk
- 5–7: Moderate risk
- 8+:  Problem gambler

CLINICAL NOTE:
- Score >= 8 warrants a strong professional referral recommendation.
- No crisis-level response is applied for gambling (unlike PHQ-9 Q9).
"""

from app.schemas.pgsi import PGSIResponse, PGSIResults


class PGSIScoringService:
    """Service for calculating PGSI gambling screening scores"""

    RISK_THRESHOLDS = {
        "no_risk":         (0,  0),
        "low_risk":        (1,  4),
        "moderate_risk":   (5,  7),
        "problem_gambler": (8, 27),
    }

    RISK_DESCRIPTIONS = {
        "no_risk":         "Non-problem gambling — No significant gambling-related harms detected.",
        "low_risk":        "Low risk gambling — Few or no identified negative consequences, but some risk of harm.",
        "moderate_risk":   "Moderate risk gambling — Some negative consequences and some risk of problems from gambling.",
        "problem_gambler": "Problem gambling — Negative consequences and a possible loss of control from gambling.",
    }

    RECOMMENDATIONS = {
        "no_risk":         "No intervention needed at this time. Continue to be aware of your gambling habits.",
        "low_risk":        "Brief advice recommended. Be aware of how gambling affects your life and monitor your habits.",
        "moderate_risk":   "Brief intervention recommended. Consider speaking with a counsellor about your gambling.",
        "problem_gambler": "Professional help strongly recommended. Please speak with a mental health professional or gambling counsellor as soon as possible.",
    }

    def calculate_score(self, pgsi_response: PGSIResponse) -> PGSIResults:
        """
        Calculate PGSI score and provide clinical interpretation.

        Args:
            pgsi_response: User's responses to PGSI questions (Q1–Q9)

        Returns:
            PGSIResults with total score, risk category, and recommendations
        """
        individual_scores = {
            "q1": pgsi_response.q1,
            "q2": pgsi_response.q2,
            "q3": pgsi_response.q3,
            "q4": pgsi_response.q4,
            "q5": pgsi_response.q5,
            "q6": pgsi_response.q6,
            "q7": pgsi_response.q7,
            "q8": pgsi_response.q8,
            "q9": pgsi_response.q9,
        }

        total_score = sum(individual_scores.values())
        risk_category = self._determine_risk(total_score)

        return PGSIResults(
            individual_scores=individual_scores,
            total_score=total_score,
            risk_category=risk_category,
            risk_description=self.RISK_DESCRIPTIONS[risk_category],
            recommendation=self.RECOMMENDATIONS[risk_category],
            professional_help_recommended=total_score >= 8,
        )

    def _determine_risk(self, total_score: int) -> str:
        for category, (low, high) in self.RISK_THRESHOLDS.items():
            if low <= total_score <= high:
                return category
        return "problem_gambler"