"""
Chat router for AI-powered mental health support conversations.
Uses LangGraph create_react_agent for better state management and conversation flow.
Tools available:
- Crisis detection
- Resource search and referral
- Accessing screening context
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Dict, Optional
from google import genai
import httpx
from langchain_core.tools import tool
from langchain_core.messages import HumanMessage, AIMessage
from ..config import settings
from ..agent.chatbot_agent import create_mental_health_agent, process_agent_response
from ..schemas.token_tracking import TokenUsageType
from ..utils.token_tracking_helper import track_chat_usage

router = APIRouter()


class Message(BaseModel):
    role: str  # "user" or "assistant"
    content: str


class ChatRequest(BaseModel):
    messages: List[Message]
    screening_context: Optional[Dict] = None
    demographics: Optional[Dict] = None
    responses: Optional[Dict] = None  # question_id -> answer mapping
    questions: Optional[List[Dict]] = None  # Full question data
    session_id: str  # To track screening session
    user_id: Optional[int] = None  # Authenticated user ID (None for guests)


class ChatResponse(BaseModel):
    message: str
    crisis_detected: bool = False
    resources_provided: bool = False


# Global variable to store screening context and demographics per session
# In production, this should be in a database or cache
SCREENING_CONTEXTS = {}
DEMOGRAPHICS_DATA = {}
SCREENING_RESPONSES = {}  # Store question-answer pairs
SCREENING_QUESTIONS = {}  # Store questions data


@tool
def analyze_crisis_risk(user_message: str) -> str:
    """
    Analyzes if the user's message indicates crisis or immediate danger.
    Use this tool when you detect concerning language about self-harm, suicide, or immediate danger.

    Args:
        user_message: The user's latest message to analyze

    Returns:
        Analysis indicating if crisis detected and severity level
    """
    client = genai.Client(api_key=settings.GEMINI_API_KEY)

    crisis_analysis_prompt = """Analyze this message for crisis indicators:

Message: "{message}"

Classify into ONE of these risk levels:
- IMMEDIATE CRISIS: Active suicidal thoughts, plans, or immediate self-harm intention
- HIGH RISK: Passive suicidal ideation, recent self-harm, severe distress
- MODERATE CONCERN: Depression, hopelessness, but no immediate danger
- LOW CONCERN: General stress or sadness

IMPORTANT: Your response MUST start with exactly one of these labels:
"IMMEDIATE CRISIS:", "HIGH RISK:", "MODERATE CONCERN:", or "LOW CONCERN:"

Then provide a brief reason (1-2 sentences).

Example format:
HIGH RISK: The user mentions recent self-harm behavior and feelings of hopelessness.
"""

    prompt = f"""
You are a crisis assessment specialist.

Always start your response with exactly one of:

IMMEDIATE CRISIS:
HIGH RISK:
MODERATE CONCERN:
LOW CONCERN:

{crisis_analysis_prompt.format(message=user_message)}
"""

    response = client.models.generate_content(
        model=settings.MODEL_NAME,
        contents=prompt
    )

    return response.text


@tool
def get_screening_results(session_id: str) -> str:
    """
    Retrieves the user's validated screening results (ASSIST, PHQ-9, Triggers).
    Use this when you need to reference their screening scores or understand their situation better.

    Args:
        session_id: The user's screening session ID

    Returns:
        Summary of validated screening results including ASSIST, PHQ-9, and Triggers analysis
    """
    screening_context = SCREENING_CONTEXTS.get(session_id)

    if not screening_context:
        return "No screening results available for this session."

    summary = "=== VALIDATED SCREENING RESULTS ===\n\n"

    # Check for ASSIST results (substance use)
    # Handle both key formats: "assist" (v2 database) and "assist_results" (legacy)
    assist = screening_context.get("assist") or screening_context.get("assist_results")
    if assist:
        summary += "🔬 ASSIST (Substance Use Screening):\n"

        if "scores" in assist and assist["scores"]:
            for substance, score_data in assist["scores"].items():
                risk_level = score_data.get("risk_level", "unknown").upper()
                score = score_data.get("score", 0)

                # Add emoji based on risk level
                emoji = "🟢" if risk_level == "LOW" else "🟡" if risk_level == "MODERATE" else "🔴"

                summary += f"  {emoji} {substance.title()}: {risk_level} risk (score: {score})\n"

            # Overall assessment
            overall_risk = assist.get("overall_risk", "unknown").upper()
            summary += f"\n  Overall ASSIST Risk: {overall_risk}\n"

            if assist.get("brief_intervention_needed"):
                summary += "  ⚠️  Brief intervention recommended\n"

            if assist.get("moderate_risk_substances"):
                mod_subs = ", ".join(assist["moderate_risk_substances"])
                summary += f"  Moderate risk: {mod_subs}\n"

            if assist.get("high_risk_substances"):
                high_subs = ", ".join(assist["high_risk_substances"])
                summary += f"  High risk: {high_subs}\n"
        else:
            summary += "  No substances reported with lifetime use\n"

        summary += "\n"

    # Check for PHQ-9 results (depression)
    # Handle both key formats: "phq9" (v2 database) and "phq9_results" (legacy)
    phq9 = screening_context.get("phq9") or screening_context.get("phq9_results")
    if phq9:
        summary += "🧠 PHQ-9 (Depression Screening):\n"

        total_score = phq9.get("total_score", 0)
        severity = phq9.get("severity", "unknown").upper()

        # Add emoji based on severity
        severity_emoji = {
            "MINIMAL": "🟢",
            "MILD": "🟡",
            "MODERATE": "🟠",
            "MODERATELY_SEVERE": "🔴",
            "SEVERE": "🔴"
        }
        emoji = severity_emoji.get(severity, "⚪")

        summary += f"  {emoji} Severity: {severity} (total score: {total_score}/27)\n"

        if phq9.get("meets_clinical_threshold"):
            summary += "  ⚠️  Clinical threshold met (score ≥ 10) - professional help recommended\n"

        # CRITICAL: Suicidal ideation detection (Q9 > 0)
        if phq9.get("suicidal_ideation"):
            summary += "  🚨 CRISIS: Suicidal ideation detected (Q9 > 0)\n"
            summary += "  ⚠️  IMMEDIATE mental health evaluation required\n"

        # Functional impairment
        functional = phq9.get("functional_impairment", "not_difficult")
        if functional != "not_difficult":
            summary += f"  Functional impairment: {functional.replace('_', ' ')}\n"

        # Action recommendation
        action = phq9.get("action", "unknown")
        if action == "crisis_response":
            summary += "  Action: IMMEDIATE CRISIS RESPONSE\n"
        elif action == "treatment_recommended":
            summary += "  Action: Active treatment recommended\n"
        elif action == "consider_treatment":
            summary += "  Action: Consider treatment plan\n"

        summary += "\n"

    # Check for Triggers results (conditional) - 4-level rating system
    # Handle both key formats: "triggers" (v2 database) and "triggers_results" (legacy)
    triggers = screening_context.get("triggers") or screening_context.get("triggers_results")
    if triggers:
        summary += "🎯 TRIGGERS ASSESSMENT (4-Level Chance of Use):\n"

        external_count = triggers.get("external_count", 0)
        internal_count = triggers.get("internal_count", 0)
        total_triggers = triggers.get("total_triggers", 0)

        summary += f"  Total: {total_triggers} triggers ({external_count} situational, {internal_count} emotional)\n"

        # Level-based verdicts (new 4-tier system)
        level_labels = {
            "always_use": "🔴 CRITICAL (Always Use 100%)",
            "almost_always": "🟠 HIGH RISK (Almost Always ~75%)",
            "almost_never": "🟡 LOW RISK (Almost Never ~25%)",
            "never_use": "🟢 SAFE (Never Use 0%)",
        }

        for verdict_key, category_icon in [("external_verdicts", "📍 External"), ("internal_verdicts", "💭 Internal")]:
            verdicts = triggers.get(verdict_key, [])
            for v in verdicts:
                level = v.get("level", "")
                label = level_labels.get(level, level.upper())
                trigger_names = [t.replace("_", " ").title() for t in v.get("triggers", [])]
                if trigger_names:
                    summary += f"  {category_icon} {label}: {', '.join(trigger_names)}\n"

        # Fallback for legacy flat trigger lists
        if not triggers.get("external_verdicts") and not triggers.get("internal_verdicts"):
            external_triggers = triggers.get("external_triggers", [])
            internal_triggers = triggers.get("internal_triggers", [])
            if external_triggers:
                formatted_external = [t.replace("_", " ").title() for t in external_triggers]
                summary += f"  📍 EXTERNAL triggers: {', '.join(formatted_external)}\n"
            if internal_triggers:
                formatted_internal = [t.replace("_", " ").title() for t in internal_triggers]
                summary += f"  💭 INTERNAL triggers: {', '.join(formatted_internal)}\n"

        # Use pattern
        if triggers.get("primarily_emotional"):
            summary += "  Pattern: Primarily EMOTIONAL (focus on coping skills)\n"
        elif triggers.get("primarily_routine"):
            summary += "  Pattern: Primarily SITUATIONAL (focus on habit change)\n"

        summary += "\n"

    # Legacy support for category_results (backward compatibility)
    elif "category_results" in screening_context:
        summary += "📊 LEGACY SCREENING RESULTS:\n"
        for category, result in screening_context["category_results"].items():
            category_name = category.replace("_", " ").title()
            summary += f"- {category_name}: {result.get('severity', 'Unknown')} "
            summary += f"(Score: {result.get('score', 0)}/{result.get('max_score', 0)})\n"
        summary += "\n"

    # Overall crisis detection
    if screening_context.get("crisis_detected"):
        summary += "🚨 OVERALL: Crisis indicators detected - immediate intervention required\n\n"

    if "overall_summary" in screening_context:
        summary += f"Summary: {screening_context['overall_summary']}\n"

    return summary


# ============== EMBEDDED NIGERIAN MENTAL HEALTH RESOURCES ==============

# Federal Neuro-Psychiatric Hospitals
# Federal Neuropsychiatric Hospital, Yaba is pinned first per client requirement.
FEDERAL_PSYCHIATRIC_HOSPITALS = [
    {
        "name": "Federal Neuropsychiatric Hospital, Yaba",
        "type": "Federal Neuro-Psychiatric Hospital",
        "state": "Lagos",
        "city": "Yaba",
        "region": "South West"
    },
    {
        "name": "Federal Neuro-Psychiatric Hospital, Aro, Abeokuta",
        "type": "Federal Neuro-Psychiatric Hospital",
        "state": "Ogun",
        "city": "Abeokuta",
        "region": "South West"
    },
    {
        "name": "Federal Neuro-Psychiatric Hospital, Uselu-Benin",
        "type": "Federal Neuro-Psychiatric Hospital",
        "state": "Edo",
        "city": "Benin City",
        "region": "South South"
    },
    {
        "name": "Federal Neuro-Psychiatric Hospital, Calabar",
        "type": "Federal Neuro-Psychiatric Hospital",
        "state": "Cross River",
        "city": "Calabar",
        "region": "South South"
    },
    {
        "name": "Federal Neuro-Psychiatric Hospital, Kaduna",
        "type": "Federal Neuro-Psychiatric Hospital",
        "state": "Kaduna",
        "city": "Kaduna",
        "region": "North West"
    },
    {
        "name": "Federal Neuro-Psychiatric Hospital, Maiduguri",
        "type": "Federal Neuro-Psychiatric Hospital",
        "state": "Borno",
        "city": "Maiduguri",
        "region": "North East"
    },
    {
        "name": "Federal Neuro-Psychiatric Hospital, Kware",
        "type": "Federal Neuro-Psychiatric Hospital",
        "state": "Sokoto",
        "city": "Kware",
        "region": "North West"
    },
    {
        "name": "Federal Neuro-Psychiatric Hospital, Budo-Egba",
        "type": "Federal Neuro-Psychiatric Hospital",
        "state": "Kwara",
        "city": "Budo-Egba",
        "region": "North Central"
    },
]

# University Teaching Hospitals with Mental Health Services
TEACHING_HOSPITALS = [
    {
        "name": "Lagos State University Teaching Hospital, Ikeja",
        "type": "University Teaching Hospital",
        "state": "Lagos",
        "city": "Ikeja",
        "region": "South West"
    },
    {
        "name": "Lagos University Teaching Hospital, Idi-Araba",
        "type": "University Teaching Hospital",
        "state": "Lagos",
        "city": "Idi-Araba",
        "region": "South West"
    },
    {
        "name": "University College Hospital (UCH), Ibadan",
        "type": "University Teaching Hospital",
        "state": "Oyo",
        "city": "Ibadan",
        "region": "South West"
    },
    {
        "name": "University of Benin Teaching Hospital (UBTH)",
        "type": "University Teaching Hospital",
        "state": "Edo",
        "city": "Benin City",
        "region": "South South"
    },
    {
        "name": "Obafemi Awolowo University Teaching Hospital Complex (OAUTHC)",
        "type": "University Teaching Hospital",
        "state": "Osun",
        "city": "Ile-Ife",
        "region": "South West"
    },
    {
        "name": "University of Port Harcourt Teaching Hospital",
        "type": "University Teaching Hospital",
        "state": "Rivers",
        "city": "Port Harcourt",
        "region": "South South"
    },
    {
        "name": "University of Calabar Teaching Hospital",
        "type": "University Teaching Hospital",
        "state": "Cross River",
        "city": "Calabar",
        "region": "South South"
    },
    {
        "name": "University of Ilorin Teaching Hospital",
        "type": "University Teaching Hospital",
        "state": "Kwara",
        "city": "Ilorin",
        "region": "North Central"
    },
    {
        "name": "Jos University Teaching Hospital",
        "type": "University Teaching Hospital",
        "state": "Plateau",
        "city": "Jos",
        "region": "North Central"
    },
]

# State Psychiatric Hospitals
STATE_PSYCHIATRIC_HOSPITALS = [
    {
        "name": "State Psychiatric Hospital, Sokoto",
        "type": "State Psychiatric Hospital",
        "state": "Sokoto",
        "city": "Sokoto",
        "region": "North West"
    },
    {
        "name": "State Psychiatric Hospital, Abia",
        "type": "State Psychiatric Hospital",
        "state": "Abia",
        "city": "Umuahia",
        "region": "South East"
    },
    {
        "name": "State Neuro-Psychiatric Hospital, Nawfia",
        "type": "State Psychiatric Hospital",
        "state": "Anambra",
        "city": "Nawfia",
        "region": "South East"
    },
    {
        "name": "Psychiatric Hospital, Eket",
        "type": "State Psychiatric Hospital",
        "state": "Akwa Ibom",
        "city": "Eket",
        "region": "South South"
    },
    {
        "name": "Kano State Psychiatric Hospital",
        "type": "State Psychiatric Hospital",
        "state": "Kano",
        "city": "Kano",
        "region": "North West"
    },
]

# All hospitals combined
ALL_HOSPITALS = FEDERAL_PSYCHIATRIC_HOSPITALS + TEACHING_HOSPITALS + STATE_PSYCHIATRIC_HOSPITALS

# State to Region mapping for finding nearby hospitals
STATE_REGIONS = {
    # South West
    "Lagos": "South West", "Ogun": "South West", "Oyo": "South West",
    "Osun": "South West", "Ondo": "South West", "Ekiti": "South West",
    # South South
    "Edo": "South South", "Delta": "South South", "Rivers": "South South",
    "Bayelsa": "South South", "Cross River": "South South", "Akwa Ibom": "South South",
    # South East
    "Enugu": "South East", "Anambra": "South East", "Imo": "South East",
    "Abia": "South East", "Ebonyi": "South East",
    # North Central
    "Kwara": "North Central", "Kogi": "North Central", "Plateau": "North Central",
    "Nasarawa": "North Central", "Benue": "North Central", "Niger": "North Central", "FCT": "North Central",
    # North West
    "Kaduna": "North West", "Kano": "North West", "Katsina": "North West",
    "Sokoto": "North West", "Zamfara": "North West", "Kebbi": "North West", "Jigawa": "North West",
    # North East
    "Borno": "North East", "Yobe": "North East", "Adamawa": "North East",
    "Bauchi": "North East", "Gombe": "North East", "Taraba": "North East",
}

# Crisis contacts
CRISIS_CONTACTS = {
    "whatsapp_only": [
        {"number": "+234 812 937 8557", "description": "WhatsApp crisis support and counseling"},
        {"number": "+234 903 989 0177", "description": "WhatsApp mental health support line"},
    ],
    "whatsapp_and_call": [
        {"number": "+234 704 652 6817", "description": "Call or WhatsApp for immediate crisis intervention"},
    ]
}


def get_hospitals_for_state(user_state: str, limit: int = 3) -> list:
    """
    Get hospitals for a user's state, with fallback to same region if none in state.
    Federal Neuropsychiatric Hospital, Yaba is always returned first.

    Args:
        user_state: The user's state from demographics
        limit: Maximum number of hospitals to return

    Returns:
        List of hospital dictionaries
    """
    fnph_yaba = FEDERAL_PSYCHIATRIC_HOSPITALS[0]  # Always index 0

    if not user_state:
        return [fnph_yaba, TEACHING_HOSPITALS[0]]

    # Normalize state name
    user_state = user_state.strip().title()

    # Find hospitals in the exact state (excluding Yaba — pinned separately)
    state_hospitals = [h for h in ALL_HOSPITALS if h["state"].lower() == user_state.lower() and h is not fnph_yaba]

    if len(state_hospitals) >= limit - 1:
        federal = [h for h in state_hospitals if "Federal" in h["type"]]
        teaching = [h for h in state_hospitals if "Teaching" in h["type"]]
        state_psych = [h for h in state_hospitals if "State" in h["type"]]
        rest = (federal + teaching + state_psych)[:limit - 1]
        return [fnph_yaba] + rest

    # If not enough in state, find hospitals in the same region
    user_region = STATE_REGIONS.get(user_state)

    if user_region:
        region_hospitals = [h for h in ALL_HOSPITALS if h["region"] == user_region and h is not fnph_yaba]
        combined = state_hospitals + [h for h in region_hospitals if h not in state_hospitals]

        def priority(h):
            if "Federal" in h["type"]:
                return 0
            elif "Teaching" in h["type"]:
                return 1
            else:
                return 2

        combined.sort(key=priority)
        return [fnph_yaba] + combined[:limit - 1]

    # Fallback: return Yaba + next federal hospitals
    return [fnph_yaba] + FEDERAL_PSYCHIATRIC_HOSPITALS[1:limit]


@tool
def search_mental_health_resources(session_id: str, concern_type: str) -> str:
    """
    Provides Nigerian government mental health facilities based on user's location.
    Use this when user needs referrals to hospitals, psychiatric facilities, or professional support.

    Args:
        session_id: The user's session ID to retrieve demographics and location
        concern_type: Type of support needed (e.g., "substance_use", "depression", "trauma", "mental_health")

    Returns:
        List of nearest government hospitals and crisis hotlines
    """
    # Get demographics for location
    demographics = DEMOGRAPHICS_DATA.get(session_id, {})
    user_state = demographics.get("state")
    user_city = demographics.get("city")

    # Get nearest hospitals (2-3 based on location)
    hospitals = get_hospitals_for_state(user_state, limit=3)

    # Format location string
    if user_city and user_state:
        location_str = f"{user_city}, {user_state}"
    elif user_state:
        location_str = user_state
    else:
        location_str = "Nigeria"

    # Format concern type for display (parameter used for context)
    concern_display = concern_type.replace("_", " ").title() if concern_type else "Mental Health"

    # Build output
    output = f"{concern_display} Resources near {location_str}:\n\n"

    # Add hospitals
    output += "🏥 GOVERNMENT MENTAL HEALTH FACILITIES:\n\n"

    for idx, hospital in enumerate(hospitals, 1):
        output += f"{idx}. {hospital['name']}\n"
        output += f"   Type: {hospital['type']}\n"
        output += f"   Location: {hospital['city']}, {hospital['state']} State\n\n"

    # Add crisis contacts
    output += "📞 CRISIS SUPPORT CONTACTS:\n\n"

    # One WhatsApp only
    wa_only = CRISIS_CONTACTS["whatsapp_only"][0]
    output += f"• WhatsApp ONLY: {wa_only['number']}\n"
    output += f"  {wa_only['description']}\n\n"

    # One WhatsApp and Call
    wa_call = CRISIS_CONTACTS["whatsapp_and_call"][0]
    output += f"• WhatsApp AND Call: {wa_call['number']}\n"
    output += f"  {wa_call['description']}\n\n"

    output += "📌 These are government-approved mental health facilities. "
    output += "Please visit or contact them for professional support."

    return output


def get_nigerian_crisis_resources() -> str:
    """Returns Nigerian crisis resources for immediate support."""
    return """🚨 NIGERIAN CRISIS SUPPORT:

• WhatsApp ONLY: +234 812 937 8557
  Connect via WhatsApp for immediate support and counseling.

• WhatsApp ONLY: +234 903 989 0177
  Alternative WhatsApp line for crisis support.

• WhatsApp AND Call: +234 704 652 6817
  Call or WhatsApp for immediate mental health crisis intervention.

📌 Please reach out to these services if you need immediate support."""


def get_agent_tools():
    """Get the list of tools available to the agent."""
    return [
        analyze_crisis_risk,
        get_screening_results,
        search_mental_health_resources
    ]


async def persist_tokens_to_backend(
    session_id: str,
    user_id: Optional[int],
    token_data: Dict
) -> None:
    """
    Fire-and-forget: saves token usage to backend DB via /api/admin/tokens/record.
    Called before streaming so no tokens are lost even if stream fails.
    """
    try:
        payload = {
            "session_id": session_id,
            "user_id": user_id,
            "input_tokens": token_data["prompt_tokens"],
            "output_tokens": token_data["completion_tokens"],
            "total_tokens": token_data["total_tokens"],
            "model_name": settings.MODEL_NAME,
            "estimated_cost_usd": str(round(token_data["estimated_cost"], 6))
        }
        async with httpx.AsyncClient(timeout=5.0) as client:
            await client.post(f"{settings.BACKEND_URL}/api/admin/tokens/record", json=payload)
    except Exception as e:
        # Never fail the chat request due to tracking failure
        print(f"Warning: Failed to persist token usage to backend: {e}")


@router.post("/message", response_model=ChatResponse)
async def send_message(request: ChatRequest):
    """
    Process a chat message using LangGraph create_react_agent.
    The agent can use tools to analyze crisis risk, access screening results, and search for resources.
    """
    try:
        # Store screening context and demographics for this session
        screening_context = request.screening_context
        if screening_context:
            SCREENING_CONTEXTS[request.session_id] = screening_context
        else:
            screening_context = SCREENING_CONTEXTS.get(request.session_id)

        demographics = request.demographics
        if demographics:
            DEMOGRAPHICS_DATA[request.session_id] = demographics
        else:
            demographics = DEMOGRAPHICS_DATA.get(request.session_id)

        # Store responses and questions
        responses = request.responses
        if responses:
            SCREENING_RESPONSES[request.session_id] = responses
        else:
            responses = SCREENING_RESPONSES.get(request.session_id)

        questions = request.questions
        if questions:
            SCREENING_QUESTIONS[request.session_id] = questions
        else:
            questions = SCREENING_QUESTIONS.get(request.session_id)

        # Get tools
        tools = get_agent_tools()

        # Create LangGraph agent
        agent = create_mental_health_agent(
            tools=tools,
            session_id=request.session_id,
            screening_context=screening_context,
            demographics=demographics,
            responses=responses,
            questions=questions
        )

        # Build message history for LangGraph
        messages = []
        for msg in request.messages:
            if msg.role == "user":
                messages.append(HumanMessage(content=msg.content))
            else:
                messages.append(AIMessage(content=msg.content))

        # LOGGING: Print message history being sent to AI
        from ..utils.token_estimator import token_estimator

        print("\n" + "="*80)
        print(f"💬 MESSAGE HISTORY BEING SENT TO AI ({len(messages)} messages)")
        print("="*80)

        for i, msg in enumerate(messages, 1):
            msg_tokens = token_estimator.count_tokens(msg.content)
            role = "USER" if isinstance(msg, HumanMessage) else "AI"
            print(f"\n[Message {i} - {role}] ({msg_tokens} tokens):")
            print(f"{msg.content}")
            print("-" * 80)

        total_message_tokens = sum(token_estimator.count_tokens(m.content) for m in messages)
        print(f"\n✅ TOTAL MESSAGE HISTORY: {total_message_tokens} tokens")
        print("="*80 + "\n")

        # Invoke agent with LangGraph
        result = agent.invoke({
            "messages": messages
        })

        # Track token usage and persist to backend DB
        token_data = track_chat_usage(
            session_id=request.session_id,
            operation_type=TokenUsageType.CHAT_MESSAGE,
            result=result,
            messages=messages,
            screening_context=screening_context,
            demographics=demographics
        )
        if token_data:
            await persist_tokens_to_backend(request.session_id, request.user_id, token_data)

        # Process agent response
        assistant_message, crisis_detected, resources_provided = process_agent_response(result)

        # Additional crisis detection for explicit urgent keywords
        latest_message = request.messages[-1].content if request.messages else ""
        urgent_keywords = ["kill myself right now", "going to kill myself", "ending my life tonight"]

        if any(keyword in latest_message.lower() for keyword in urgent_keywords):
            crisis_detected = True

        return ChatResponse(
            message=assistant_message,
            crisis_detected=crisis_detected,
            resources_provided=resources_provided
        )

    except Exception as e:
        import traceback
        print(f"ERROR generating response: {str(e)}")
        print(traceback.format_exc())
        raise HTTPException(status_code=500, detail=f"Error generating response: {str(e)}")


class StartConversationRequest(BaseModel):
    session_id: str
    screening_context: Optional[Dict] = None
    demographics: Optional[Dict] = None
    responses: Optional[Dict] = None  # question_id -> answer mapping
    questions: Optional[List[Dict]] = None  # Full question data
    user_id: Optional[int] = None  # Authenticated user ID (None for guests)


@router.post("/start-conversation")
async def start_conversation(request: StartConversationRequest):
    """
    Start a new conversation with an AI greeting based on screening results using LangGraph.
    """
    try:
        screening_context = request.screening_context
        if screening_context:
            SCREENING_CONTEXTS[request.session_id] = screening_context

        demographics = request.demographics
        if demographics:
            DEMOGRAPHICS_DATA[request.session_id] = demographics

        # Store responses and questions
        responses = request.responses
        if responses:
            SCREENING_RESPONSES[request.session_id] = responses

        questions = request.questions
        if questions:
            SCREENING_QUESTIONS[request.session_id] = questions

        # Get tools
        tools = get_agent_tools()

        # Create LangGraph agent
        agent = create_mental_health_agent(
            tools=tools,
            session_id=request.session_id,
            screening_context=screening_context,
            demographics=demographics,
            responses=responses,
            questions=questions
        )

        # Start with initial greeting message
        initial_message = HumanMessage(
            content="Hello, I just completed the screening and would like to discuss my results."
        )

        # LOGGING: Print initial message being sent to AI
        from ..utils.token_estimator import token_estimator

        print("\n" + "="*80)
        print(f"💬 INITIAL MESSAGE BEING SENT TO AI (START CONVERSATION)")
        print("="*80)

        msg_tokens = token_estimator.count_tokens(initial_message.content)
        print(f"\n[Message 1 - USER] ({msg_tokens} tokens):")
        print(f"{initial_message.content}")
        print("-" * 80)

        print(f"\n✅ TOTAL MESSAGE HISTORY: {msg_tokens} tokens")
        print("="*80 + "\n")

        # Invoke agent
        result = agent.invoke({
            "messages": [initial_message]
        })

        # Track token usage and persist to backend DB
        token_data = track_chat_usage(
            session_id=request.session_id,
            operation_type=TokenUsageType.START_CONVERSATION,
            result=result,
            messages=[initial_message],
            screening_context=screening_context,
            demographics=demographics
        )
        if token_data:
            await persist_tokens_to_backend(request.session_id, request.user_id, token_data)

        # Process response
        assistant_message, _, _ = process_agent_response(result)

        return {
            "message": assistant_message
        }

    except Exception as e:
        import traceback
        print(f"ERROR starting conversation: {str(e)}")
        print(traceback.format_exc())
        raise HTTPException(status_code=500, detail=f"Error starting conversation: {str(e)}")
