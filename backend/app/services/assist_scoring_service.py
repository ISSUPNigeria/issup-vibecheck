"""
WHO ASSIST V3.0 Scoring Service

Implements the official WHO ASSIST scoring algorithm as per WHO ASSIST V3.0 guidelines.

SCORING RULES:
- Tobacco: Q2 + Q3 + Q4 + Q6 + Q7 (Q5 is NOT coded for tobacco)
- All other substances: Q2 + Q3 + Q4 + Q5 + Q6 + Q7

RISK LEVELS (per substance):
- Low risk: 0-3 for tobacco, 0-10 for other substances
- Moderate risk: 4-26 for tobacco, 11-26 for other substances
- High risk: 27+ for any substance

NOTE: The response values (0-4) map to different scores based on the question.
This service extracts the SCORE from the options, not the value.
"""

from typing import Dict, List, Optional
from app.schemas.assist import (
    ASSISTResponse,
    ASSISTSubstanceResponse,
    ASSISTSubstanceScore,
    ASSISTResults
)


class ASSISTScoringService:
    """Service for calculating WHO ASSIST V3.0 scores"""

    # WHO ASSIST Risk thresholds per substance type
    TOBACCO_THRESHOLDS = {
        "low": (0, 3),
        "moderate": (4, 26),
        "high": (27, float('inf'))
    }

    OTHER_SUBSTANCE_THRESHOLDS = {
        "low": (0, 10),
        "moderate": (11, 26),
        "high": (27, float('inf'))
    }

    # Score mappings for each question (value -> score)
    Q2_SCORES = {0: 0, 1: 2, 2: 3, 3: 4, 4: 6}  # Frequency
    Q3_SCORES = {0: 0, 1: 3, 2: 4, 3: 5, 4: 6}  # Cravings
    Q4_SCORES = {0: 0, 1: 4, 2: 5, 3: 6, 4: 7}  # Problems
    Q5_SCORES = {0: 0, 1: 5, 2: 6, 3: 7, 4: 8}  # Failed expectations
    Q6_SCORES = {0: 0, 1: 6, 2: 3}  # Concern (0=No never, 1=Yes past 3m, 2=Yes not past 3m)
    Q7_SCORES = {0: 0, 1: 6, 2: 3}  # Control (0=No never, 1=Yes past 3m, 2=Yes not past 3m)

    def calculate_substance_score(
        self,
        substance: str,
        response: ASSISTSubstanceResponse
    ) -> ASSISTSubstanceScore:
        """
        Calculate ASSIST score for a single substance

        Args:
            substance: Substance name (tobacco, alcohol, cannabis, etc.)
            response: User's responses for Q2-Q7

        Returns:
            ASSISTSubstanceScore with calculated score and risk level
        """
        # Get scores from response values
        q2_score = self.Q2_SCORES[response.q2_frequency]
        q3_score = self.Q3_SCORES[response.q3_cravings]
        q4_score = self.Q4_SCORES[response.q4_problems]
        q6_score = self.Q6_SCORES[response.q6_concern]
        q7_score = self.Q7_SCORES[response.q7_control]

        # Calculate total score
        if substance == "tobacco":
            # Tobacco: Q2 + Q3 + Q4 + Q6 + Q7 (NO Q5)
            total_score = q2_score + q3_score + q4_score + q6_score + q7_score
            calculation = f"Q2({q2_score}) + Q3({q3_score}) + Q4({q4_score}) + Q6({q6_score}) + Q7({q7_score}) = {total_score}"
        else:
            # All other substances: Q2 + Q3 + Q4 + Q5 + Q6 + Q7
            if response.q5_failed_expectations is None:
                raise ValueError(f"Q5 is required for {substance}")
            q5_score = self.Q5_SCORES[response.q5_failed_expectations]
            total_score = q2_score + q3_score + q4_score + q5_score + q6_score + q7_score
            calculation = f"Q2({q2_score}) + Q3({q3_score}) + Q4({q4_score}) + Q5({q5_score}) + Q6({q6_score}) + Q7({q7_score}) = {total_score}"

        # Determine risk level
        risk_level = self._determine_risk_level(substance, total_score)

        return ASSISTSubstanceScore(
            substance=substance,
            score=total_score,
            risk_level=risk_level,
            calculation=calculation
        )

    def _determine_risk_level(self, substance: str, score: int) -> str:
        """
        Determine risk level based on substance type and score

        Args:
            substance: Substance name
            score: Calculated ASSIST score

        Returns:
            Risk level: "low", "moderate", or "high"
        """
        thresholds = (
            self.TOBACCO_THRESHOLDS
            if substance == "tobacco"
            else self.OTHER_SUBSTANCE_THRESHOLDS
        )

        for level, (min_score, max_score) in thresholds.items():
            if min_score <= score <= max_score:
                return level

        return "high"  # Fallback

    def calculate_all_scores(self, assist_response: ASSISTResponse) -> ASSISTResults:
        """
        Calculate ASSIST scores for all substances used

        Args:
            assist_response: Complete ASSIST response with all substance responses

        Returns:
            ASSISTResults with scores for all substances and overall assessment
        """
        scores: Dict[str, ASSISTSubstanceScore] = {}
        moderate_risk_substances: List[str] = []
        high_risk_substances: List[str] = []

        highest_risk_score = 0
        highest_risk_substance = None

        # Calculate score for each substance
        for substance, response in assist_response.substance_responses.items():
            substance_score = self.calculate_substance_score(substance, response)
            scores[substance] = substance_score

            # Track highest risk
            if substance_score.score > highest_risk_score:
                highest_risk_score = substance_score.score
                highest_risk_substance = substance

            # Track risk categories
            if substance_score.risk_level == "moderate":
                moderate_risk_substances.append(substance)
            elif substance_score.risk_level == "high":
                high_risk_substances.append(substance)

        # Determine overall risk (based on highest substance risk)
        if high_risk_substances:
            overall_risk = "high"
        elif moderate_risk_substances:
            overall_risk = "moderate"
        else:
            overall_risk = "low"

        # Determine injection risk
        injection_risk = assist_response.q8_injection > 0
        injection_timeframe = (
            "never" if assist_response.q8_injection == 0
            else "not_past_3m" if assist_response.q8_injection == 1
            else "past_3m"
        )

        # Brief intervention needed if any substance is moderate or high risk
        brief_intervention_needed = len(moderate_risk_substances) > 0 or len(high_risk_substances) > 0

        # Get other_specify from the lifetime use data
        other_specify = assist_response.q1_lifetime_use.other_specify

        return ASSISTResults(
            scores=scores,
            highest_risk_substance=highest_risk_substance,
            highest_risk_score=highest_risk_score if highest_risk_substance else None,
            moderate_risk_substances=moderate_risk_substances,
            high_risk_substances=high_risk_substances,
            injection_risk=injection_risk,
            injection_timeframe=injection_timeframe,
            overall_risk=overall_risk,
            brief_intervention_needed=brief_intervention_needed,
            other_specify=other_specify
        )