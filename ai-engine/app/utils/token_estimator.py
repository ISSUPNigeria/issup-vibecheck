"""
Token estimation utility using tiktoken for accurate token counting.
"""

import tiktoken
from typing import List, Optional
from langchain_core.messages import BaseMessage, HumanMessage, AIMessage, ToolMessage


class TokenEstimator:
    """Estimate token counts for different components using tiktoken."""

    def __init__(self, model: str = "gpt-4o-mini"):
        """
        Initialize token estimator.

        Args:
            model: Model name (gpt-4o-mini uses cl100k_base encoding)
        """
        # gpt-4o-mini uses cl100k_base encoding
        self.encoding = tiktoken.get_encoding("cl100k_base")

    def count_tokens(self, text: str) -> int:
        """
        Count tokens in a text string.

        Args:
            text: Text to count tokens for

        Returns:
            Number of tokens
        """
        if not text:
            return 0
        return len(self.encoding.encode(text))

    def count_message_tokens(self, messages: List[BaseMessage]) -> int:
        """
        Count total tokens in a list of messages.

        Args:
            messages: List of LangChain messages

        Returns:
            Total token count
        """
        total = 0
        for msg in messages:
            # Get message content
            content = msg.content if hasattr(msg, 'content') else str(msg)
            total += self.count_tokens(content)

            # Add overhead for message formatting (role, etc.)
            # OpenAI adds ~4 tokens per message for formatting
            total += 4

        # Add 3 tokens for reply priming
        total += 3

        return total

    def separate_tool_messages(self, messages: List[BaseMessage]) -> tuple[List[BaseMessage], List[BaseMessage], int]:
        """
        Separate tool messages from conversation messages.

        Args:
            messages: List of all messages

        Returns:
            Tuple of (conversation_messages, tool_messages, tool_tokens)
        """
        conversation_messages = []
        tool_messages = []
        tool_tokens = 0

        for msg in messages:
            if isinstance(msg, ToolMessage):
                tool_messages.append(msg)
                tool_tokens += self.count_tokens(msg.content)
            else:
                conversation_messages.append(msg)

        return conversation_messages, tool_messages, tool_tokens

    def estimate_system_prompt_breakdown(
        self,
        full_system_prompt: str,
        demographics_text: Optional[str] = None,
        screening_context_text: Optional[str] = None
    ) -> dict:
        """
        Estimate token breakdown for system prompt components.

        Args:
            full_system_prompt: Complete system prompt
            demographics_text: Demographics section text (if extractable)
            screening_context_text: Screening context section text (if extractable)

        Returns:
            Dictionary with token breakdown
        """
        total_prompt_tokens = self.count_tokens(full_system_prompt)

        # If we can extract specific sections, count them
        demographics_tokens = self.count_tokens(demographics_text) if demographics_text else 0
        screening_tokens = self.count_tokens(screening_context_text) if screening_context_text else 0

        # Base prompt is everything minus the dynamic parts
        base_prompt_tokens = total_prompt_tokens - demographics_tokens - screening_tokens

        return {
            "total_system_prompt_tokens": total_prompt_tokens,
            "base_prompt_tokens": base_prompt_tokens,
            "demographics_tokens": demographics_tokens,
            "screening_context_tokens": screening_tokens
        }

    def estimate_conversation_history_tokens(self, messages: List[BaseMessage]) -> dict:
        """
        Estimate token breakdown for conversation history.

        Args:
            messages: List of conversation messages

        Returns:
            Dictionary with breakdown by message type
        """
        human_tokens = 0
        ai_tokens = 0
        tool_tokens = 0
        other_tokens = 0

        for msg in messages:
            tokens = self.count_tokens(msg.content if hasattr(msg, 'content') else str(msg))

            if isinstance(msg, HumanMessage):
                human_tokens += tokens
            elif isinstance(msg, AIMessage):
                ai_tokens += tokens
            elif isinstance(msg, ToolMessage):
                tool_tokens += tokens
            else:
                other_tokens += tokens

        return {
            "total_history_tokens": human_tokens + ai_tokens + tool_tokens + other_tokens,
            "human_message_tokens": human_tokens,
            "ai_message_tokens": ai_tokens,
            "tool_message_tokens": tool_tokens,
            "other_tokens": other_tokens
        }

    def estimate_full_breakdown(
        self,
        system_prompt: str,
        messages: List[BaseMessage],
        demographics_text: Optional[str] = None,
        screening_context_text: Optional[str] = None
    ) -> dict:
        """
        Estimate complete token breakdown for an API call.

        Args:
            system_prompt: System prompt text
            messages: Conversation messages
            demographics_text: Demographics section (optional)
            screening_context_text: Screening context section (optional)

        Returns:
            Complete token breakdown dictionary
        """
        # System prompt breakdown
        prompt_breakdown = self.estimate_system_prompt_breakdown(
            system_prompt,
            demographics_text,
            screening_context_text
        )

        # Conversation history breakdown
        history_breakdown = self.estimate_conversation_history_tokens(messages)

        # Total estimated input tokens
        total_estimated = (
            prompt_breakdown["total_system_prompt_tokens"] +
            history_breakdown["total_history_tokens"]
        )

        return {
            **prompt_breakdown,
            **history_breakdown,
            "total_estimated_input_tokens": total_estimated
        }


# Global instance
token_estimator = TokenEstimator()