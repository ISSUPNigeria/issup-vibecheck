from typing import Dict, List, Tuple
from ..schemas.screening import SeverityLevel

def calculate_question_score(answer: str, options: List[str], question_type: str) -> int:
    """Calculate score for a single question based on answer"""
    if question_type == "yes_no":
        return 1 if answer.lower() == "yes" else 0
    elif question_type == "scale":
        # Scale questions: score based on position in options
        if answer in options:
            return options.index(answer)
        return 0
    elif question_type == "multiple_choice":
        # Multiple choice: score based on position
        if answer in options:
            return options.index(answer)
        return 0
    return 0

def calculate_category_scores(responses: Dict[str, str], questions_data: List[Dict]) -> Tuple[Dict[str, int], Dict[str, int]]:
    """Calculate total score for each category"""
    category_scores = {
        "substance_use": 0,
        "mental_health": 0,
        "trauma": 0,
        "physical": 0,
        "crisis": 0
    }

    category_max_scores = {
        "substance_use": 0,
        "mental_health": 0,
        "trauma": 0,
        "physical": 0,
        "crisis": 0
    }

    for question in questions_data:
        question_id = str(question['id'])
        if question_id in responses:
            answer = responses[question_id]
            category = question['category']
            weight = question.get('scoring_weight', 1)

            # Calculate score for this question
            question_score = calculate_question_score(
                answer,
                question.get('options', []),
                question['question_type']
            )

            # Apply weight and add to category score
            weighted_score = question_score * weight
            category_scores[category] += weighted_score

            # Calculate max possible score
            max_option_score = len(question.get('options', [])) - 1 if question.get('options') else 1
            category_max_scores[category] += max_option_score * weight

    return category_scores, category_max_scores

def determine_severity(score: int, max_score: int, category: str) -> SeverityLevel:
    """Determine severity level based on score and category (LOGIC-BASED - DETERMINISTIC)"""
    if max_score == 0:
        return SeverityLevel.LOW

    percentage = (score / max_score) * 100

    # Crisis category has stricter thresholds - ANY positive response is IMMEDIATE
    if category == "crisis":
        if score > 0:
            return SeverityLevel.IMMEDIATE
        return SeverityLevel.LOW

    # Other categories
    if percentage >= 75:
        return SeverityLevel.HIGH
    elif percentage >= 50:
        return SeverityLevel.MODERATE
    elif percentage >= 25:
        return SeverityLevel.MODERATE
    else:
        return SeverityLevel.LOW

def detect_crisis(responses: Dict[str, str], questions_data: List[Dict]) -> bool:
    """Detect if any crisis questions were answered yes (CRITICAL - DETERMINISTIC)"""
    for question in questions_data:
        if question['category'] == 'crisis':
            question_id = str(question['id'])
            if question_id in responses:
                answer = responses[question_id]
                if answer.lower() == 'yes':
                    return True
    return False
