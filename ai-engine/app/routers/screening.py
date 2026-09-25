from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Dict, List, Any
from google import genai
from ..config import settings
import json

router = APIRouter()

class ScreeningFeedbackRequest(BaseModel):
    responses: Dict[str, str]
    scores: Dict[str, int]
    max_scores: Dict[str, int]
    severities: Dict[str, str]
    crisis_detected: bool
    questions: List[Dict[str, Any]]

@router.post("/feedback")
async def generate_screening_feedback(request: ScreeningFeedbackRequest):
    """
    Generate personalized, empathetic feedback using OpenAI based on screening results
    """
    try:
        client = genai.Client(api_key=settings.GEMINI_API_KEY)

        # Prepare context for AI
        context = prepare_screening_context(request)

        # Generate feedback using OpenAI
        prompt = f"""
{get_system_prompt()}

{context}
"""

        response = client.models.generate_content(
            model=settings.MODEL_NAME,
            contents=prompt
        )

        # Parse AI response
        ai_response = response.text
        feedback = parse_ai_feedback(ai_response)

        return {
            "category_feedback": feedback.get("category_feedback", {}),
            "overall_summary": feedback.get("overall_summary", ""),
            "crisis_detected": request.crisis_detected
        }

    except Exception as e:
        print(f"Error generating feedback: {e}")
        raise HTTPException(status_code=500, detail="Failed to generate feedback")

def get_system_prompt() -> str:
    """System prompt for AI to generate empathetic, supportive feedback"""
    return """You are a compassionate mental health support assistant providing feedback on screening results.

Your role:
- Provide empathetic, supportive, and non-judgmental feedback
- NEVER diagnose or provide medical advice
- Always encourage professional help when appropriate
- Be warm and understanding
- Focus on hope and available support

Response format (JSON):
{
  "category_feedback": {
    "substance_use": {
      "description": "2-3 sentences of empathetic feedback",
      "recommendations": ["specific action 1", "specific action 2", "specific action 3"]
    },
    "mental_health": {
      "description": "2-3 sentences of empathetic feedback",
      "recommendations": ["specific action 1", "specific action 2", "specific action 3"]
    },
    "trauma": {
      "description": "2-3 sentences of empathetic feedback",
      "recommendations": ["specific action 1", "specific action 2"]
    },
    "physical": {
      "description": "2-3 sentences of empathetic feedback",
      "recommendations": ["specific action 1", "specific action 2"]
    },
    "crisis": {
      "description": "Direct, supportive message",
      "recommendations": ["Crisis hotline info", "Emergency resources"]
    }
  },
  "overall_summary": "3-4 sentences of warm, supportive summary emphasizing hope and next steps"
}

Guidelines:
- Be concise but warm
- Tailor feedback to severity level
- Always validate feelings
- Never use alarming language
- Emphasize that help is available
- For crisis: Be direct but compassionate
"""

def prepare_screening_context(request: ScreeningFeedbackRequest) -> str:
    """Prepare screening data as context for AI"""

    # Group questions by category
    categories_data = {}
    for question in request.questions:
        category = question['category']
        if category not in categories_data:
            categories_data[category] = []

        q_id = str(question['id'])
        if q_id in request.responses:
            categories_data[category].append({
                'question': question['question_text'],
                'answer': request.responses[q_id]
            })

    context = f"""Screening Results Summary:

Crisis Detected: {"YES - IMMEDIATE ATTENTION NEEDED" if request.crisis_detected else "No"}

Category Scores and Responses:

"""

    category_names = {
        "substance_use": "Substance Use",
        "mental_health": "Mental Health",
        "trauma": "Trauma",
        "physical": "Physical Health",
        "crisis": "Crisis Assessment"
    }

    for category in ["substance_use", "mental_health", "trauma", "physical", "crisis"]:
        if category in request.scores:
            name = category_names.get(category, category)
            score = request.scores[category]
            max_score = request.max_scores[category]
            severity = request.severities[category]

            context += f"\n{name}:\n"
            context += f"  Severity: {severity}\n"
            context += f"  Score: {score}/{max_score}\n"

            if category in categories_data:
                context += "  Responses:\n"
                for item in categories_data[category]:
                    context += f"    Q: {item['question']}\n"
                    context += f"    A: {item['answer']}\n"
            context += "\n"

    context += """
Please provide empathetic, personalized feedback in JSON format as specified in the system prompt.
Focus on being supportive and providing actionable next steps.
"""

    return context

def parse_ai_feedback(ai_response: str) -> Dict[str, Any]:
    """Parse AI response into structured feedback"""
    try:
        # Try to extract JSON from response
        start = ai_response.find('{')
        end = ai_response.rfind('}') + 1
        if start != -1 and end > start:
            json_str = ai_response[start:end]
            return json.loads(json_str)
        else:
            # Fallback if JSON not found
            return {
                "category_feedback": {},
                "overall_summary": ai_response
            }
    except json.JSONDecodeError:
        return {
            "category_feedback": {},
            "overall_summary": ai_response
        }
