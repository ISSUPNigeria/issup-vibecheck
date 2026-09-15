"""
Mental health chatbot agent built with LangGraph.
Uses create_react_agent pattern for better state management and conversation flow.
"""

from typing import TypedDict, Annotated, Sequence
from langchain_core.messages import BaseMessage, HumanMessage, AIMessage, SystemMessage, ToolMessage
from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from langgraph.prebuilt import create_react_agent
from langgraph.graph import StateGraph, END
from ..config import settings
from ..prompts.system_prompts import get_chatbot_system_prompt
from ..utils.hospitals import format_nearest_hospitals


class AgentState(TypedDict):
    """State for the mental health chatbot agent."""
    messages: Sequence[BaseMessage]
    session_id: str
    screening_context: dict
    crisis_detected: bool
    resources_provided: bool


def create_mental_health_agent(tools: list, session_id: str, screening_context: dict = None, demographics: dict = None, responses: dict = None, questions: list = None):
    """
    Create a LangGraph-based mental health support agent.

    Args:
        tools: List of tools available to the agent
        session_id: Session ID for tracking conversation
        screening_context: User's screening results for context
        demographics: User's demographic information (age, gender, location, etc.)
        responses: User's actual responses (question_id -> answer mapping)
        questions: Full question data from screening

    Returns:
        Compiled LangGraph agent
    """
    # Initialize LLM
    llm = ChatOpenAI(
        model=settings.MODEL_NAME,
        temperature=0.8,  # Increased for more natural, conversational responses
        openai_api_key=settings.OPENAI_API_KEY,
        base_url=settings.OPENAI_BASE_URL,
        streaming=True
    )

    # Build system prompt with screening context and demographics
    # PHASE 1 OPTIMIZATION: Pass screening_context for conditional loading
    system_prompt = get_chatbot_system_prompt(screening_context=screening_context)

    # LOGGING: Print session info
    print("\n" + "="*80)
    print(f"🤖 CREATING AGENT FOR SESSION: {session_id}")
    print("="*80)

    context_addition = ""

    # PHASE 1 OPTIMIZATION 3: Compressed demographics format (saves ~60 tokens)
    if demographics:
        context_addition += "\n\nUSER CONTEXT:\n"

        # Build concise pipe-separated format
        demo_parts = []
        if demographics.get('age'):
            demo_parts.append(f"Age: {demographics['age']}")
        if demographics.get('gender'):
            demo_parts.append(f"Gender: {demographics['gender']}")
        if demographics.get('city') and demographics.get('state'):
            demo_parts.append(f"Location: {demographics['city']}, {demographics['state']}")
        elif demographics.get('state'):
            demo_parts.append(f"Location: {demographics['state']}")

        if demo_parts:
            context_addition += " | ".join(demo_parts) + "\n"

        # Second line for employment, marital, religion
        demo_parts_2 = []
        if demographics.get('employment_status'):
            employment_formatted = demographics['employment_status'].replace('_', ' ').title()
            if demographics.get('employment_sector'):
                sector_formatted = demographics['employment_sector'].replace('_', ' ').title()
                demo_parts_2.append(f"Employment: {employment_formatted} ({sector_formatted})")
            else:
                demo_parts_2.append(f"Employment: {employment_formatted}")
        if demographics.get('marital_status'):
            marital_formatted = demographics['marital_status'].replace('_', ' ').title()
            demo_parts_2.append(f"Marital: {marital_formatted}")
        if demographics.get('religion'):
            demo_parts_2.append(f"Religion: {demographics['religion'].title()}")

        if demo_parts_2:
            context_addition += " | ".join(demo_parts_2) + "\n"

        context_addition += "Use specific details to personalize responses.\n"

    # Add detailed screening responses if available
    if responses and questions:
        # Create a mapping of question_id to question data
        question_map = {str(q['id']): q for q in questions}

        # Group responses by category
        category_responses = {
            'substance_use': [],
            'mental_health': [],
            'trauma': [],
            'physical': [],
            'crisis': []
        }

        for question_id, answer in responses.items():
            if question_id in question_map:
                q = question_map[question_id]
                category = q['category']
                if category in category_responses:
                    category_responses[category].append({
                        'question': q['question_text'],
                        'answer': answer
                    })

        context_addition += "\n\nDETAILED SCREENING RESPONSES:\n"
        context_addition += "Here are the EXACT questions asked and the user's specific answers:\n\n"

        category_names = {
            'substance_use': 'SUBSTANCE USE',
            'mental_health': 'MENTAL HEALTH',
            'trauma': 'TRAUMA',
            'physical': 'PHYSICAL HEALTH',
            'crisis': 'CRISIS ASSESSMENT'
        }

        for category, responses_list in category_responses.items():
            if responses_list:
                context_addition += f"{category_names[category]}:\n"
                for item in responses_list:
                    context_addition += f"  Q: {item['question']}\n"
                    context_addition += f"  A: {item['answer']}\n\n"

        context_addition += "IMPORTANT: Use these specific answers to have informed, detailed conversations. "
        context_addition += "Reference what the user actually said in their screening when discussing their concerns.\n"

    # Add screening context if available
    if screening_context:
        context_addition += "\n\n========== SCREENING CONTEXT ==========\n"
        context_addition += f"The user has completed validated mental health screening (Session ID: {session_id}).\n\n"

        # ASSIST Results (Substance Use)
        # Handle both key formats: "assist" (v2 database) and "assist_results" (legacy)
        assist = screening_context.get("assist") or screening_context.get("assist_results")
        if assist:
            context_addition += "📋 ASSIST (Substance Use) Results:\n"

            if "scores" in assist and assist["scores"]:
                for substance, score_data in assist["scores"].items():
                    risk_level = score_data.get("risk_level", "unknown")
                    score = score_data.get("score", 0)
                    context_addition += f"  • {substance.title()}: {risk_level.upper()} risk (score: {score})\n"

                overall_risk = assist.get("overall_risk", "unknown")
                context_addition += f"\n  Overall Risk Level: {overall_risk.upper()}\n"

                if assist.get("brief_intervention_needed"):
                    context_addition += "  ⚠️  Brief intervention recommended - consider using WHO Brief Intervention framework\n"

                moderate_substances = assist.get("moderate_risk_substances", [])
                high_substances = assist.get("high_risk_substances", [])

                if moderate_substances:
                    context_addition += f"  Moderate risk substances: {', '.join(moderate_substances)}\n"
                if high_substances:
                    context_addition += f"  HIGH RISK substances: {', '.join(high_substances)}\n"
            else:
                context_addition += "  No substances reported with lifetime use\n"

            context_addition += "\n"

        # PHQ-9 Results (Depression)
        # Handle both key formats: "phq9" (v2 database) and "phq9_results" (legacy)
        phq9 = screening_context.get("phq9") or screening_context.get("phq9_results")
        if phq9:
            context_addition += "📋 PHQ-9 (Depression) Results:\n"

            total_score = phq9.get("total_score", 0)
            severity = phq9.get("severity", "unknown")
            context_addition += f"  • Total Score: {total_score}/27\n"
            context_addition += f"  • Severity: {severity.upper()}\n"

            if phq9.get("meets_clinical_threshold"):
                context_addition += "  ⚠️  Clinical threshold met (score ≥ 10) - professional help recommended\n"

            # CRITICAL: Suicidal ideation (Q9 > 0) — inject nearest hospitals
            if phq9.get("suicidal_ideation"):
                context_addition += "  🚨 CRISIS: SUICIDAL IDEATION DETECTED (Q9 > 0)\n"
                user_state = demographics.get("state", "") if demographics else ""
                context_addition += format_nearest_hospitals(user_state)

            functional = phq9.get("functional_impairment", "not_difficult")
            if functional != "not_difficult":
                context_addition += f"  • Functional impairment: {functional.replace('_', ' ')}\n"

            action = phq9.get("action", "unknown")
            if action == "crisis_response":
                context_addition += "  • REQUIRED ACTION: IMMEDIATE CRISIS RESPONSE\n"
            elif action == "treatment_recommended":
                context_addition += "  • Recommended action: Active treatment\n"
            elif action == "consider_treatment":
                context_addition += "  • Recommended action: Consider treatment plan\n"

            context_addition += "\n"

        # Triggers Results (Conditional) - 4-level rating system
        # Handle both key formats: "triggers" (v2 database) and "triggers_results" (legacy)
        triggers = screening_context.get("triggers") or screening_context.get("triggers_results")
        if triggers:
            context_addition += "📋 TRIGGERS Assessment:\n"

            external_count = triggers.get("external_count", 0)
            internal_count = triggers.get("internal_count", 0)
            total = triggers.get("total_triggers", 0)

            context_addition += f"  • Total: {total} triggers ({external_count} situational, {internal_count} emotional)\n"

            # Level-based verdicts (new 4-tier system)
            level_labels = {
                "always_use": "CRITICAL (Always Use - 100%)",
                "almost_always": "HIGH RISK (Almost Always - ~75%)",
                "almost_never": "LOW RISK (Almost Never - ~25%)",
                "never_use": "SAFE (Never Use - 0%)",
            }

            for verdict_key, category_label in [("external_verdicts", "External"), ("internal_verdicts", "Internal")]:
                verdicts = triggers.get(verdict_key, [])
                for v in verdicts:
                    level = v.get("level", "")
                    label = level_labels.get(level, level.upper())
                    trigger_names = [t.replace("_", " ").title() for t in v.get("triggers", [])]
                    if trigger_names:
                        context_addition += f"  • {category_label} {label}: {', '.join(trigger_names)}\n"

            # Fallback for legacy flat trigger lists
            if not triggers.get("external_verdicts") and not triggers.get("internal_verdicts"):
                external_triggers = triggers.get("external_triggers", [])
                internal_triggers = triggers.get("internal_triggers", [])
                if external_triggers:
                    formatted = [t.replace("_", " ").title() for t in external_triggers]
                    context_addition += f"  • EXTERNAL triggers: {', '.join(formatted)}\n"
                if internal_triggers:
                    formatted = [t.replace("_", " ").title() for t in internal_triggers]
                    context_addition += f"  • INTERNAL triggers: {', '.join(formatted)}\n"

            if triggers.get("primarily_emotional"):
                context_addition += "  • Pattern: PRIMARILY EMOTIONAL (focus on coping skills, emotional regulation)\n"
            elif triggers.get("primarily_routine"):
                context_addition += "  • Pattern: PRIMARILY SITUATIONAL (focus on habit change, avoiding situations)\n"

            context_addition += "\n"

        # Legacy support for category_results (backward compatibility)
        elif "category_results" in screening_context:
            context_addition += "📊 LEGACY Screening Results:\n"
            for category, result in screening_context["category_results"].items():
                category_name = category.replace("_", " ").title()
                context_addition += f"  • {category_name}: {result.get('severity', 'Unknown')} "
                context_addition += f"(Score: {result.get('score', 0)}/{result.get('max_score', 0)})\n"
            context_addition += "\n"

        # Overall crisis detection
        if screening_context.get("crisis_detected"):
            context_addition += "🚨 OVERALL CRISIS DETECTED - Immediate intervention required\n\n"

        if "overall_summary" in screening_context:
            context_addition += f"Overall Summary: {screening_context['overall_summary']}\n\n"

        context_addition += "========================================\n\n"
        context_addition += "IMPORTANT:\n"
        context_addition += "- Reference specific screening results when discussing their situation\n"
        context_addition += "- For ASSIST moderate/high risk, consider WHO Brief Intervention framework\n"
        context_addition += "- For Triggers, use TRIGGERS_AWARE_PROMPT guidance\n"
        context_addition += f"- Use get_screening_results('{session_id}') tool for detailed formatted results\n"

    if context_addition:
        system_prompt += context_addition

    # LOGGING: Print FULL context being sent to AI
    from ..utils.token_estimator import token_estimator

    total_prompt_tokens = token_estimator.count_tokens(system_prompt)

    print("\n" + "="*80)
    print(f"📊 FULL SYSTEM PROMPT BEING SENT TO AI ({total_prompt_tokens} tokens)")
    print("="*80)
    print(system_prompt)
    print("="*80)
    print(f"✅ END OF SYSTEM PROMPT ({total_prompt_tokens} tokens)")
    print("="*80 + "\n")

    # Create the react agent using LangGraph
    agent = create_react_agent(
        llm,
        tools,
        prompt=system_prompt  # System prompt parameter
    )

    return agent


def process_agent_response(agent_output: dict) -> tuple[str, bool, bool]:
    """
    Process agent output to extract message and detect crisis/resources.

    Args:
        agent_output: Output from agent execution

    Returns:
        Tuple of (message, crisis_detected, resources_provided)
    """
    # Get the last AI message
    messages = agent_output.get("messages", [])

    assistant_message = ""
    for msg in reversed(messages):
        if isinstance(msg, AIMessage):
            assistant_message = msg.content
            break

    # Detect crisis and resources in a smarter way
    crisis_detected = False
    resources_provided = False

    # Check the RESULT of the crisis analysis tool (not just if it was called)
    for msg in messages:
        if isinstance(msg, ToolMessage) and msg.name == 'analyze_crisis_risk':
            # Check the actual tool response content for crisis indicators
            tool_result = msg.content.upper() if msg.content else ""
            if 'IMMEDIATE CRISIS' in tool_result or 'HIGH RISK' in tool_result:
                crisis_detected = True

    # Check if Nigerian crisis resources were provided
    nigerian_crisis_numbers = [
        "+234 812 937 8557",  # WhatsApp Only
        "+234 903 989 0177",  # WhatsApp Only
        "+234 704 652 6817"   # WhatsApp AND Call
    ]

    if any(number in assistant_message for number in nigerian_crisis_numbers):
        resources_provided = True

    return assistant_message, crisis_detected, resources_provided
