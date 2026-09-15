"""
Triggers Assessment Analysis Service

Redesigned: 4-level "Chance of Use" rating system (WHO ERS 2B/3B)

Rating levels:
- Never Use (0%) = score 0 -> "safe"
- Almost Never Use (~25%) = score 1 -> "low risk"
- Almost Always Use (~75%) = score 2 -> "high risk"
- Always Use (100%) = score 3 -> "avoid totally"

Triggers are grouped by their rating level and verdicts are generated
per level for both External (situations) and Internal (emotions).
"""

from typing import Dict, List, Optional
from app.schemas.triggers import (
    TriggersResponse, TriggersResults,
    TriggersByLevel, LevelVerdict,
    LEVEL_NAMES,
)


# Verdicts for external triggers (situations)
EXTERNAL_VERDICTS = {
    "never_use": "These situations are safe.",
    "almost_never": "These situations are low risk, but caution is needed.",
    "almost_always": "These situations are high risk. Staying in these situations is extremely dangerous.",
    "always_use": "Involvement in these situations is deciding to stay addicted. Avoid totally.",
}

# Verdicts for internal triggers (emotions)
INTERNAL_VERDICTS = {
    "never_use": "These emotions are safe.",
    "almost_never": "These emotions are low risk, but caution is needed.",
    "almost_always": "These emotions are high risk.",
    "always_use": "Persisting in these emotions is deciding to stay addicted. Avoid totally.",
}

# Human-readable labels for each level
LEVEL_LABEL_MAP = {
    "never_use": "Safe",
    "almost_never": "Low Risk",
    "almost_always": "High Risk",
    "always_use": "Avoid Totally",
}


class TriggersAnalysisService:
    """Service for analyzing triggers assessment responses with 4-level rating"""

    def analyze_triggers(self, triggers_response: TriggersResponse) -> TriggersResults:
        """
        Analyze triggers response: group by level, generate verdicts.

        Args:
            triggers_response: User's triggers assessment with ratings

        Returns:
            TriggersResults with level grouping and verdicts
        """
        # Group triggers by rating level
        external_by_level = self._group_by_level(triggers_response.external_ratings)
        internal_by_level = self._group_by_level(triggers_response.internal_ratings)

        # Generate verdicts for non-empty levels
        external_verdicts = self._generate_verdicts(
            external_by_level, EXTERNAL_VERDICTS
        )
        internal_verdicts = self._generate_verdicts(
            internal_by_level, INTERNAL_VERDICTS
        )

        # Counts
        external_count = len(triggers_response.external_ratings) + len(
            triggers_response.external_custom or []
        )
        internal_count = len(triggers_response.internal_ratings) + len(
            triggers_response.internal_custom or []
        )
        total_triggers = external_count + internal_count

        # Highest risk level
        highest_external = self._get_highest_level(triggers_response.external_ratings)
        highest_internal = self._get_highest_level(triggers_response.internal_ratings)

        # Pattern analysis
        primarily_emotional = internal_count > external_count
        primarily_routine = external_count > internal_count

        # Generate description
        pattern_description = self._generate_pattern_description(
            external_count, internal_count, highest_external, highest_internal
        )

        return TriggersResults(
            external_ratings=triggers_response.external_ratings,
            internal_ratings=triggers_response.internal_ratings,
            external_by_level=external_by_level,
            internal_by_level=internal_by_level,
            external_verdicts=external_verdicts,
            internal_verdicts=internal_verdicts,
            external_count=external_count,
            internal_count=internal_count,
            total_triggers=total_triggers,
            highest_external_level=highest_external,
            highest_internal_level=highest_internal,
            primarily_emotional=primarily_emotional,
            primarily_routine=primarily_routine,
            pattern_description=pattern_description,
            ai_analysis=None,
        )

    def _group_by_level(self, ratings: Dict[str, int]) -> TriggersByLevel:
        """Group trigger IDs by their rating level (0-3)."""
        groups = {
            "never_use": [],
            "almost_never": [],
            "almost_always": [],
            "always_use": [],
        }
        for trigger_id, score in ratings.items():
            level_name = LEVEL_NAMES.get(score)
            if level_name and level_name in groups:
                groups[level_name].append(trigger_id)

        return TriggersByLevel(**groups)

    def _generate_verdicts(
        self,
        by_level: TriggersByLevel,
        verdict_texts: Dict[str, str],
    ) -> List[LevelVerdict]:
        """Generate LevelVerdict objects for each non-empty level (highest risk first)."""
        verdicts = []
        # Order: always_use, almost_always, almost_never, never_use
        for level_name in ["always_use", "almost_always", "almost_never", "never_use"]:
            triggers = getattr(by_level, level_name, [])
            if triggers:
                verdicts.append(LevelVerdict(
                    level=level_name,
                    label=LEVEL_LABEL_MAP[level_name],
                    count=len(triggers),
                    triggers=triggers,
                    verdict=verdict_texts[level_name],
                ))
        return verdicts

    def _get_highest_level(self, ratings: Dict[str, int]) -> Optional[str]:
        """Get the highest rating level name from a ratings dict."""
        if not ratings:
            return None
        max_score = max(ratings.values())
        return LEVEL_NAMES.get(max_score)

    def _generate_pattern_description(
        self,
        external_count: int,
        internal_count: int,
        highest_external: Optional[str],
        highest_internal: Optional[str],
    ) -> str:
        """Generate human-readable pattern description."""
        if external_count == 0 and internal_count == 0:
            return "No triggers were identified."

        descriptions = []

        # Overall count
        total = external_count + internal_count
        descriptions.append(
            f"You have identified {total} trigger{'s' if total != 1 else ''} "
            f"({external_count} situational, {internal_count} emotional)."
        )

        # Highest risk warning
        critical_levels = {"always_use", "almost_always"}
        if highest_external in critical_levels or highest_internal in critical_levels:
            descriptions.append(
                "Some of your triggers are rated as high risk and require careful attention."
            )

        # Balance
        if external_count > internal_count * 2:
            descriptions.append(
                "Your triggers are primarily situational (external environments, people, places)."
            )
        elif internal_count > external_count * 2:
            descriptions.append(
                "Your triggers are primarily emotional (internal feelings, moods, thoughts)."
            )
        elif external_count > 0 and internal_count > 0:
            descriptions.append(
                "Your triggers are a mix of both situational and emotional factors."
            )

        return " ".join(descriptions)

    def check_eligibility(
        self,
        assist_moderate_or_high: bool,
        phq9_moderate_or_high: bool = False,
    ) -> Dict[str, any]:
        """
        Determine if user should complete triggers assessment.

        Triggers are shown based on ASSIST results only.

        Args:
            assist_moderate_or_high: Any ASSIST substance score >= 4
            phq9_moderate_or_high: Kept for backwards compatibility, not used

        Returns:
            Dict with eligibility decision
        """
        should_show = assist_moderate_or_high

        if assist_moderate_or_high:
            reason = "ASSIST indicates moderate or high risk substance use - triggers assessment recommended"
        else:
            reason = "No triggers assessment needed - low risk on ASSIST"

        return {
            "should_show_triggers": should_show,
            "reason": reason,
            "assist_moderate_or_high": assist_moderate_or_high,
            "phq9_moderate_or_high": phq9_moderate_or_high,
        }