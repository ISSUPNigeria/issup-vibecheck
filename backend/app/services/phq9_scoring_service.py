"""
PHQ-9 (Patient Health Questionnaire-9) Scoring Service

Implements the official PHQ-9 scoring algorithm for depression screening.

SCORING RULES:
- Total Score: Sum of Q1-Q9 (each question scored 0-3)
- Range: 0-27

SEVERITY LEVELS:
- 0-4: Minimal depression
- 5-9: Mild depression
- 10-14: Moderate depression
- 15-19: Moderately severe depression
- 20-27: Severe depression

CLINICAL THRESHOLD: Score ≥ 10 (moderate or higher)
CRISIS INDICATOR: Q9 > 0 (suicidal ideation)

FUNCTIONAL IMPAIRMENT SCORING:
- not_difficult: 0
- somewhat_difficult: 1
- very_difficult: 2
- extremely_difficult: 3
"""

from typing import Dict
from app.schemas.phq9 import PHQ9Response, PHQ9Results


class PHQ9ScoringService:
    """Service for calculating PHQ-9 depression screening scores"""

    # Severity thresholds
    SEVERITY_THRESHOLDS = {
        "minimal": (0, 4),
        "mild": (5, 9),
        "moderate": (10, 14),
        "moderately_severe": (15, 19),
        "severe": (20, 27)
    }

    # Functional impairment mapping
    FUNCTIONAL_IMPAIRMENT_SCORES = {
        "not_difficult": 0,
        "somewhat_difficult": 1,
        "very_difficult": 2,
        "extremely_difficult": 3
    }

    # Action recommendations based on severity
    ACTION_RECOMMENDATIONS = {
        "minimal": ("no_intervention", "No intervention needed. Continue monitoring."),
        "mild": ("watchful_waiting", "Watchful waiting; repeat PHQ-9 at follow-up."),
        "moderate": ("consider_treatment", "Consider treatment plan (counseling, follow-up, or pharmacotherapy)."),
        "moderately_severe": ("treatment_recommended", "Active treatment with pharmacotherapy and/or psychotherapy strongly recommended."),
        "severe": ("treatment_recommended", "Immediate initiation of pharmacotherapy and/or psychotherapy required."),
        "crisis": ("crisis_response", "CRISIS: Immediate mental health evaluation required. Suicidal ideation detected.")
    }

    def calculate_score(self, phq9_response: PHQ9Response) -> PHQ9Results:
        """
        Calculate PHQ-9 score and provide clinical interpretation

        Args:
            phq9_response: User's responses to PHQ-9 questions

        Returns:
            PHQ9Results with total score, severity, and recommendations
        """
        # Extract individual scores
        individual_scores = {
            "q1_interest": phq9_response.q1_interest,
            "q2_depressed": phq9_response.q2_depressed,
            "q3_sleep": phq9_response.q3_sleep,
            "q4_tired": phq9_response.q4_tired,
            "q5_appetite": phq9_response.q5_appetite,
            "q6_failure": phq9_response.q6_failure,
            "q7_concentration": phq9_response.q7_concentration,
            "q8_movement": phq9_response.q8_movement,
            "q9_selfharm": phq9_response.q9_selfharm
        }

        # Calculate total score (sum of Q1-Q9)
        total_score = sum(individual_scores.values())

        # Check for suicidal ideation (Q9 > 0)
        suicidal_ideation = phq9_response.q9_selfharm > 0

        # Determine severity level
        severity = self._determine_severity(total_score)
        severity_description = self._get_severity_description(severity)

        # Clinical threshold (score >= 10)
        meets_clinical_threshold = total_score >= 10

        # Functional impairment
        functional_impairment_severity = self.FUNCTIONAL_IMPAIRMENT_SCORES[
            phq9_response.functional_impairment
        ]

        # Determine action (crisis overrides severity-based action)
        if suicidal_ideation:
            action, action_description = self.ACTION_RECOMMENDATIONS["crisis"]
        else:
            action, action_description = self.ACTION_RECOMMENDATIONS[severity]

        # Triggers recommended if score >= 10
        triggers_recommended = total_score >= 10

        return PHQ9Results(
            individual_scores=individual_scores,
            total_score=total_score,
            severity=severity,
            severity_description=severity_description,
            meets_clinical_threshold=meets_clinical_threshold,
            suicidal_ideation=suicidal_ideation,
            functional_impairment=phq9_response.functional_impairment,
            functional_impairment_severity=functional_impairment_severity,
            action=action,
            action_description=action_description,
            triggers_recommended=triggers_recommended
        )

    def _determine_severity(self, total_score: int) -> str:
        """
        Determine severity level based on total score

        Args:
            total_score: Sum of Q1-Q9 (0-27)

        Returns:
            Severity level: minimal, mild, moderate, moderately_severe, or severe
        """
        for severity, (min_score, max_score) in self.SEVERITY_THRESHOLDS.items():
            if min_score <= total_score <= max_score:
                return severity

        return "severe"  # Fallback

    def _get_severity_description(self, severity: str) -> str:
        """
        Get human-readable severity description

        Args:
            severity: Severity level

        Returns:
            Human-readable description
        """
        descriptions = {
            "minimal": "Minimal depression - No significant symptoms",
            "mild": "Mild depression - Few symptoms, minor functional impairment",
            "moderate": "Moderate depression - Several symptoms, moderate functional impairment",
            "moderately_severe": "Moderately severe depression - Many symptoms, significant functional impairment",
            "severe": "Severe depression - Most symptoms, severe functional impairment"
        }
        return descriptions.get(severity, "Unknown severity")