"""
AI Feedback Generation for Validated Screening (ASSIST + PHQ-9 + Triggers)
"""
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Dict, List, Any, Optional
from google import genai
from ..config import settings
import json

router = APIRouter()

class ValidatedScreeningFeedbackRequest(BaseModel):
    """Request model for validated screening AI feedback"""
    # Demographics
    demographics: Dict[str, Any]

    # ASSIST results
    assist_results: Dict[str, Any]

    # PGSI results (gambling screening)
    pgsi_results: Optional[Dict[str, Any]] = None

    # PHQ-9 results
    phq9_results: Dict[str, Any]

    # Triggers results (optional)
    triggers_results: Optional[Dict[str, Any]] = None

    # Crisis detection
    crisis_detected: bool
    crisis_reasons: List[str] = []

@router.post("/feedback/validated")
async def generate_validated_screening_feedback(request: ValidatedScreeningFeedbackRequest):
    """
    Generate personalized, empathetic AI feedback for validated screening results
    Uses OpenAI GPT to provide supportive insights based on ASSIST, PHQ-9, and Triggers
    """
    try:
        client = genai.Client(api_key=settings.GEMINI_API_KEY)

        # Prepare context for AI
        context = prepare_validated_screening_context(request)

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
            "assist_feedback": feedback.get("assist_feedback", ""),
            "phq9_feedback": feedback.get("phq9_feedback", ""),
            "triggers_feedback": feedback.get("triggers_feedback", ""),
            "overall_message": feedback.get("overall_message", ""),
            "next_steps": feedback.get("next_steps", []),
            "crisis_detected": request.crisis_detected
        }

    except Exception as e:
        print(f"Error generating AI feedback: {e}")
        # Return None to allow graceful fallback (no AI feedback)
        return None

def get_validated_screening_system_prompt() -> str:
    """System prompt for validated screening AI feedback"""
    return """You are a compassionate Nigerian mental health support assistant providing DEEPLY PERSONALIZED feedback on screening results.

CRITICAL PERSONALIZATION REQUIREMENTS:
- ALWAYS mention SPECIFIC substances by name (e.g., "your alcohol and cannabis use" NOT "substance use")
- ALWAYS reference SPECIFIC triggers identified (e.g., "stress, frustration, and being around certain people" NOT "your triggers")
- Connect symptoms to life context NATURALLY and SPARINGLY (don't force demographics into every sentence)
- Acknowledge protective factors (religion/faith if mentioned, employment, family support) when relevant
- Make feedback feel like it's written FOR THIS SPECIFIC PERSON, not generic advice

CORE GUIDELINES:
- Be empathetic, warm, and culturally sensitive
- NEVER diagnose or provide medical advice
- NEVER use alarming, scary, or judgmental language
- Focus on hope, strengths, resilience, and available support
- Normalize mental health struggles in Nigerian context (acknowledge stigma but emphasize it's changing)
- Be detailed (3-5 sentences per section)
- Use natural, conversational Nigerian English

IMPORTANT - VARY YOUR OPENINGS:
- Do NOT always start with "As a [marital status] [gender] in [location]..." - this is boring and formulaic
- Demographics should be woven in NATURALLY, not forced into every opening
- Sometimes start with the screening findings, sometimes with an empathetic statement, sometimes with acknowledgment of their courage
- Only mention demographics when they ADD VALUE to the point you're making (e.g., work stress for someone employed, family dynamics for married people)

Response format (JSON):
{
  "assist_feedback": "Deeply personalized feedback about SPECIFIC substances and their risk levels. Start with their actual substance findings, not demographics. Example: 'Thank you for being honest about your alcohol use (moderate risk). Your current drinking pattern suggests it may be starting to affect your well-being, particularly when combined with the stress triggers you mentioned...' Connect to triggers if relevant. (3-5 sentences)",

  "phq9_feedback": "Empathetic, specific feedback about depression severity and its impact. Focus on their symptoms first. Example: 'Your responses indicate you're experiencing moderately severe depression symptoms - feeling down most days and finding everyday activities more difficult. These feelings are valid and more common than many people realize...' Only weave in life context if it genuinely adds insight. (3-5 sentences)",

  "triggers_feedback": "Specific feedback naming the ACTUAL triggers identified. Example: 'You've identified several important triggers including stress, frustration, and being around certain people or places. Recognizing that both emotional states and situational factors contribute to your substance use shows real self-awareness...' Connect triggers to substance use patterns. (3-5 sentences) ONLY if triggers were collected.",

  "overall_message": "Warm, culturally-sensitive summary that ties together their SPECIFIC situation. VARY your opening - examples:
    - 'Taking this screening shows real courage and self-awareness. The connection between your alcohol use and the depression symptoms you're experiencing...'
    - 'What stands out from your results is the relationship between your identified triggers and your current patterns...'
    - 'Your results paint a picture of someone dealing with real challenges but also showing strength in seeking understanding...'
    Demographics should appear naturally IF relevant (e.g., 'balancing work responsibilities' for employed, 'family pressures' for married) - NOT as formulaic openers. (3-5 sentences)",

  "next_steps": [
    "Contact ISSUP Nigeria for immediate support and professional referral (e.g., 'Reach out to ISSUP Nigeria via the crisis contacts provided for support and guidance on next steps')",
    "Practical coping strategy directly related to THEIR specific triggers (e.g., 'When you notice stress or frustration building (your identified triggers), try...')",
    "Encouragement to visit a government mental health facility listed below for professional assessment and treatment"
  ]
}

CRITICAL RESTRICTIONS FOR next_steps:
- ONLY recommend ISSUP Nigeria and government hospitals (Federal Neuro-Psychiatric Hospitals, University Teaching Hospitals, State Psychiatric Hospitals)
- Do NOT suggest religious community resources or faith-based counseling
- Do NOT mention sliding-scale fees or affordability
- Do NOT recommend private practitioners or NGOs
- Keep recommendations focused on: ISSUP Nigeria contact + government hospital referral + practical coping strategies

NIGERIAN CULTURAL SENSITIVITY:
- Acknowledge family/community importance without assuming family dynamics
- Be sensitive to stigma around mental health and addiction ("seeking support is wisdom, not weakness")
- Emphasize confidential, professional support at government facilities
- Use inclusive language ("many Nigerians experience...", "support is available in Nigeria")
- Never assume Western individualistic framing
- Focus on ISSUP Nigeria and government hospitals as the primary referral sources
- Do NOT suggest religious community resources or faith-based counseling
- Do NOT mention sliding-scale fees or private practitioners

CRISIS HANDLING:
- If suicidal ideation or crisis detected, be DIRECT but compassionate
- Lead with immediate resources in next_steps (WhatsApp contacts: +234-812-937-8557, +234-903-989-0177, +234-704-652-6817)
- Acknowledge the person's pain while emphasizing immediate help is available
- Don't minimize crisis but avoid panic-inducing language

EXAMPLES OF VARIED, GOOD OPENINGS vs BAD OPENINGS:

BAD (formulaic): "As a married man in Lagos, you're navigating significant life challenges..."
BAD (formulaic): "As a single woman in Abuja working as a teacher..."
BAD (too generic): "You're experiencing some challenges with substance use and depression. It's important to seek help."

GOOD (varied openings):
- "Your moderate-risk alcohol use, combined with the stress and frustration triggers you've identified, suggests a pattern worth addressing..."
- "The courage it takes to complete this screening honestly shouldn't be underestimated. Your results show..."
- "What your screening reveals is a connection between the emotional triggers you identified and your current substance use..."
- "Dealing with depression while also managing alcohol use can feel overwhelming, and your results reflect that challenge..."
- "Thank you for taking the time to honestly assess your situation. The patterns in your responses suggest..."

Remember: This person took time to complete a detailed screening. Honor that by giving specific, thoughtful feedback that shows you actually read their responses - without sounding like a form letter.
"""

def prepare_validated_screening_context(request: ValidatedScreeningFeedbackRequest) -> str:
    """Prepare validated screening data as context for AI"""

    # Get all demographic info including optional fields
    demographics = request.demographics

    context = f"""Screening Results for Nigerian individual seeking mental health and substance use support:

DEMOGRAPHICS:
Age: {demographics.get('age', 'Not provided')}
Gender: {demographics.get('gender', 'Not provided')}
Location: {demographics.get('city', 'Not provided')}, {demographics.get('state', 'Not provided')}
Employment Status: {demographics.get('employment_status', 'Not provided').replace('_', ' ').title()}
Employment Sector: {demographics.get('employment_sector', 'Not provided').replace('_', ' ').title()}
Marital Status: {demographics.get('marital_status', 'Not provided').replace('_', ' ').title()}
Religion: {demographics.get('religion', 'Not provided').title()}

CRISIS STATUS: {"⚠️ YES - IMMEDIATE ATTENTION NEEDED" if request.crisis_detected else "No immediate crisis detected"}
"""

    if request.crisis_detected:
        context += f"Crisis Reasons: {', '.join(request.crisis_reasons)}\n"

    context += "\n"

    # ASSIST Results with actual substances used
    assist = request.assist_results

    # Get list of substances actually used
    substances_used = list(assist.get('scores', {}).keys()) if 'scores' in assist else []
    substances_formatted = [s.replace('_', ' ').title() for s in substances_used]

    context += f"""
SUBSTANCE USE ASSESSMENT (WHO ASSIST):
Overall Risk: {assist.get('overall_risk', 'unknown').upper()}
Brief Intervention Needed: {'Yes' if assist.get('brief_intervention_needed') else 'No'}
Substances Reported: {', '.join(substances_formatted) if substances_formatted else 'None'}

Substance-Specific Results:
"""

    if 'scores' in assist:
        for substance, score_data in assist['scores'].items():
            context += f"""
  {substance.replace('_', ' ').title()}:
    - Score: {score_data.get('score', 0)}
    - Risk Level: {score_data.get('risk_level', 'unknown').upper()}
    - Intervention: {score_data.get('intervention', 'None specified')}
"""

    if assist.get('injection_risk'):
        context += f"\n  ⚠️ Injection drug use detected: {assist.get('injection_timeframe', 'unknown')}\n"

    # PGSI Results (Gambling Screening)
    if request.pgsi_results:
        pgsi = request.pgsi_results
        context += f"""

GAMBLING SCREENING (PGSI):
Total Score: {pgsi.get('total_score', 0)}/27
Risk Category: {pgsi.get('risk_category', 'unknown').replace('_', ' ').upper()}
Description: {pgsi.get('risk_description', '')}
Professional Help Recommended: {'Yes' if pgsi.get('professional_help_recommended') else 'No'}
"""

    # PHQ-9 Results
    phq9 = request.phq9_results
    context += f"""

DEPRESSION SCREENING (PHQ-9):
Total Score: {phq9.get('total_score', 0)}/27
Severity: {phq9.get('severity', 'unknown').upper()}
Description: {phq9.get('severity_description', '')}
Suicidal Ideation: {'⚠️ YES' if phq9.get('suicidal_ideation') else 'No'}
Functional Impairment: {phq9.get('functional_impairment', '').replace('_', ' ').title()}
Recommended Action: {phq9.get('action_description', '')}
"""

    # Triggers Results (if collected) - 4-level rating system
    if request.triggers_results:
        triggers = request.triggers_results
        context += f"""

TRIGGERS ASSESSMENT (4-Level "Chance of Use" Rating):
Total Triggers: {triggers.get('total_triggers', 0)} ({triggers.get('external_count', 0)} situational, {triggers.get('internal_count', 0)} emotional)
Pattern: {triggers.get('pattern_description', '')}

"""

        # Level-based verdicts (new 4-tier system)
        level_labels = {
            "always_use": "CRITICAL - Always Use (100%)",
            "almost_always": "HIGH RISK - Almost Always (~75%)",
            "almost_never": "LOW RISK - Almost Never (~25%)",
            "never_use": "SAFE - Never Use (0%)",
        }

        for verdict_key, category in [("external_verdicts", "External (Situations)"), ("internal_verdicts", "Internal (Emotions)")]:
            verdicts = triggers.get(verdict_key, [])
            if verdicts:
                context += f"{category}:\n"
                for v in verdicts:
                    level = v.get("level", "")
                    label = level_labels.get(level, level.upper())
                    trigger_names = [t.replace("_", " ").title() for t in v.get("triggers", [])]
                    verdict_text = v.get("verdict", "")
                    if trigger_names:
                        context += f"  {label}: {', '.join(trigger_names)}\n"
                        context += f"  Verdict: {verdict_text}\n"
                context += "\n"

        # Fallback for legacy flat trigger lists
        if not triggers.get("external_verdicts") and not triggers.get("internal_verdicts"):
            external_triggers = triggers.get('external_triggers', [])
            internal_triggers = triggers.get('internal_triggers', [])
            if external_triggers:
                context += f"External Triggers: {', '.join([t.replace('_', ' ').title() for t in external_triggers])}\n"
            if internal_triggers:
                context += f"Internal Triggers: {', '.join([t.replace('_', ' ').title() for t in internal_triggers])}\n"

        if triggers.get('primarily_emotional'):
            context += "Pattern: Primarily emotional/feeling-based triggering\n"
        elif triggers.get('primarily_routine'):
            context += "Pattern: Primarily routine/situational use\n"

    context += """

Please provide personalized, empathetic feedback in JSON format as specified.
Focus on:
1. Acknowledging the person's courage in completing this screening
2. Providing hope and support
3. Offering specific, actionable next steps for Nigerian context
4. Being warm, non-judgmental, and encouraging
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
            # Fallback if JSON not found - wrap as overall message
            return {
                "assist_feedback": "",
                "phq9_feedback": "",
                "triggers_feedback": "",
                "overall_message": ai_response,
                "next_steps": []
            }
    except json.JSONDecodeError as e:
        print(f"JSON decode error: {e}")
        return {
            "assist_feedback": "",
            "phq9_feedback": "",
            "triggers_feedback": "",
            "overall_message": ai_response,
            "next_steps": []
        }
