"""
Helper functions for token tracking in chat router.
"""

from typing import List, Dict, Optional
from langchain_core.messages import BaseMessage
from ..schemas.token_tracking import TokenUsage, TokenTrackingRecord, TokenUsageType
from ..services.token_tracking_service import token_tracking_service
from .token_estimator import token_estimator


def track_chat_usage(
    session_id: str,
    operation_type: TokenUsageType,
    result: Dict,
    messages: List[BaseMessage],
    screening_context: Optional[Dict] = None,
    demographics: Optional[Dict] = None
) -> Optional[Dict]:
    """
    Track token usage from a LangChain agent response.

    Args:
        session_id: Chat session ID
        operation_type: Type of operation (chat_message, start_conversation, etc.)
        result: Result from agent.invoke() containing usage metadata
        messages: List of messages sent to the agent
        screening_context: User's screening context (optional)
        demographics: User's demographics (optional)
    """
    try:
        # Extract usage from LangGraph result
        # LangGraph returns usage in result['messages'][-1].usage_metadata
        usage_data = None

        if isinstance(result, dict) and "messages" in result:
            last_message = result["messages"][-1]
            if hasattr(last_message, "usage_metadata"):
                usage_data = last_message.usage_metadata
            elif hasattr(last_message, "response_metadata"):
                response_meta = last_message.response_metadata
                if "token_usage" in response_meta:
                    usage_data = response_meta["token_usage"]

        # If we found usage data, create tracking record
        if usage_data:
            # Extract token counts
            prompt_tokens = usage_data.get("input_tokens", 0) or usage_data.get("prompt_tokens", 0)
            completion_tokens = usage_data.get("output_tokens", 0) or usage_data.get("completion_tokens", 0)
            total_tokens = usage_data.get("total_tokens", prompt_tokens + completion_tokens)

            # Create main usage record
            main_usage = TokenUsage(
                prompt_tokens=prompt_tokens,
                completion_tokens=completion_tokens,
                total_tokens=total_tokens
            )

            # Check for crisis and resources in screening context
            crisis_detected = False
            if screening_context:
                if screening_context.get("crisis_detected"):
                    crisis_detected = True
                elif screening_context.get("phq9_results", {}).get("suicidal_ideation"):
                    crisis_detected = True

            # Estimate message lengths
            user_message_length = None
            response_message_length = None

            if messages:
                last_user_msg = messages[-1]
                user_message_length = len(last_user_msg.content) if hasattr(last_user_msg, "content") else 0

            if isinstance(result, dict) and "messages" in result:
                last_ai_msg = result["messages"][-1]
                response_message_length = len(last_ai_msg.content) if hasattr(last_ai_msg, "content") else 0

            # Create tracking record
            record = TokenTrackingRecord(
                session_id=session_id,
                operation_type=operation_type,
                main_usage=main_usage,
                user_message_length=user_message_length,
                response_message_length=response_message_length,
                crisis_detected=crisis_detected,
                resources_provided=False  # Could be enhanced to detect this
            )

            # Track the usage
            token_tracking_service.track_usage(record)

            # Return token data for DB persistence
            token_data = {
                "prompt_tokens": prompt_tokens,
                "completion_tokens": completion_tokens,
                "total_tokens": total_tokens,
                "estimated_cost": main_usage.estimated_cost
            }

            # LOGGING: Print token breakdown to console
            print("\n" + "="*80)
            print(f"📈 TOKEN USAGE BREAKDOWN FOR THIS MESSAGE")
            print("="*80)
            print(f"Session ID: {session_id}")
            print(f"Operation Type: {operation_type.value}")
            print(f"Message Number: {len(token_tracking_service.session_records.get(session_id, []))}")
            print(f"\n💰 TOKEN COUNTS:")
            print(f"   Prompt Tokens: {prompt_tokens}")
            print(f"   Completion Tokens: {completion_tokens}")
            print(f"   Total Tokens: {total_tokens}")
            print(f"\n💵 COST ESTIMATE:")
            print(f"   Prompt Cost: ${main_usage.estimated_cost * (prompt_tokens / total_tokens):.6f}")
            print(f"   Completion Cost: ${main_usage.estimated_cost * (completion_tokens / total_tokens):.6f}")
            print(f"   Total Cost: ${main_usage.estimated_cost:.6f}")
            print(f"\n📏 MESSAGE LENGTHS:")
            if user_message_length:
                print(f"   User Message: {user_message_length} characters")
            if response_message_length:
                print(f"   AI Response: {response_message_length} characters")
            print(f"\n🔍 CONTEXT INFO:")
            if screening_context:
                print(f"   Has Screening Context: ✅")
                if "assist_results" in screening_context:
                    substances = screening_context.get("assist_results", {}).get("scores", {})
                    print(f"   Substances: {len(substances)} ({', '.join(substances.keys()) if substances else 'none'})")
                if "phq9_results" in screening_context:
                    score = screening_context.get("phq9_results", {}).get("total_score", 0)
                    print(f"   PHQ-9 Score: {score}")
            else:
                print(f"   Has Screening Context: ❌")
            if demographics:
                print(f"   Has Demographics: ✅")
            else:
                print(f"   Has Demographics: ❌")
            if crisis_detected:
                print(f"   Crisis Detected: 🚨 YES")
            print("="*80 + "\n")

            return token_data

    except Exception as e:
        # Don't fail the request if tracking fails
        print(f"Warning: Failed to track token usage: {e}")

    return None


def get_estimated_breakdown(
    system_prompt: str,
    messages: List[BaseMessage],
    demographics: Optional[Dict] = None,
    screening_context: Optional[Dict] = None
) -> Dict:
    """
    Get estimated token breakdown for debugging/analysis.

    Args:
        system_prompt: System prompt text
        messages: Conversation messages
        demographics: User demographics
        screening_context: Screening context

    Returns:
        Dictionary with estimated breakdown
    """
    try:
        # Extract demographics text (if available)
        demographics_text = None
        if demographics:
            demographics_text = f"Age: {demographics.get('age')}, Gender: {demographics.get('gender')}, Location: {demographics.get('city')}, {demographics.get('state')}"

        # Extract screening context text (if available)
        screening_text = None
        if screening_context:
            screening_text = str(screening_context)[:500]  # Rough approximation

        # Get breakdown
        breakdown = token_estimator.estimate_full_breakdown(
            system_prompt=system_prompt,
            messages=messages,
            demographics_text=demographics_text,
            screening_context_text=screening_text
        )

        return breakdown

    except Exception as e:
        print(f"Warning: Failed to estimate token breakdown: {e}")
        return {}
