"""
Token tracking schemas for monitoring OpenAI API usage.
"""

from pydantic import BaseModel, Field
from typing import Optional, Dict, List
from datetime import datetime
from enum import Enum


class TokenUsageType(str, Enum):
    """Type of token usage."""
    CHAT_MESSAGE = "chat_message"
    CRISIS_ANALYSIS = "crisis_analysis"
    SCREENING_RETRIEVAL = "screening_retrieval"
    RESOURCE_SEARCH = "resource_search"
    START_CONVERSATION = "start_conversation"


class TokenUsage(BaseModel):
    """Token usage for a single API call."""
    prompt_tokens: int = Field(..., description="Number of tokens in the prompt")
    completion_tokens: int = Field(..., description="Number of tokens in the completion")
    total_tokens: int = Field(..., description="Total tokens used")
    
    @property
    def estimated_cost(self) -> float:
        """
        Estimate cost based on gpt-4o-mini pricing.
        Input: $0.150 per 1M tokens
        Output: $0.600 per 1M tokens
        """
        input_cost = (self.prompt_tokens / 1_000_000) * 0.150
        output_cost = (self.completion_tokens / 1_000_000) * 0.600
        return input_cost + output_cost


class TokenTrackingRecord(BaseModel):
    """Complete token tracking record for a single operation."""
    session_id: str = Field(..., description="Session ID for tracking user sessions")
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    operation_type: TokenUsageType
    model_name: str = Field(default="gpt-4o-mini")
    
    # Main conversation tokens
    main_usage: Optional[TokenUsage] = None
    
    # Tool call tokens (crisis analysis, screening retrieval, etc.)
    tool_usages: Dict[str, TokenUsage] = Field(default_factory=dict)
    
    # Metadata
    user_message_length: Optional[int] = None
    response_message_length: Optional[int] = None
    tools_called: List[str] = Field(default_factory=list)
    crisis_detected: bool = False
    resources_provided: bool = False
    
    @property
    def total_prompt_tokens(self) -> int:
        """Calculate total prompt tokens across all calls."""
        total = self.main_usage.prompt_tokens if self.main_usage else 0
        for usage in self.tool_usages.values():
            total += usage.prompt_tokens
        return total
    
    @property
    def total_completion_tokens(self) -> int:
        """Calculate total completion tokens across all calls."""
        total = self.main_usage.completion_tokens if self.main_usage else 0
        for usage in self.tool_usages.values():
            total += usage.completion_tokens
        return total
    
    @property
    def total_tokens(self) -> int:
        """Calculate total tokens across all calls."""
        return self.total_prompt_tokens + self.total_completion_tokens
    
    @property
    def total_estimated_cost(self) -> float:
        """Calculate total estimated cost across all calls."""
        total_cost = self.main_usage.estimated_cost if self.main_usage else 0.0
        for usage in self.tool_usages.values():
            total_cost += usage.estimated_cost
        return total_cost


class SessionTokenStats(BaseModel):
    """Aggregated token statistics for a session."""
    session_id: str
    total_messages: int = 0
    total_prompt_tokens: int = 0
    total_completion_tokens: int = 0
    total_tokens: int = 0
    total_estimated_cost: float = 0.0
    
    # Breakdown by operation type
    operations_breakdown: Dict[str, int] = Field(default_factory=dict)
    
    # Tool usage breakdown
    tools_used: Dict[str, int] = Field(default_factory=dict)
    
    # Crisis and resource stats
    crisis_detections: int = 0
    resources_provided_count: int = 0
    
    # Time range
    first_message: Optional[datetime] = None
    last_message: Optional[datetime] = None


class GlobalTokenStats(BaseModel):
    """Global token statistics across all sessions."""
    total_sessions: int = 0
    total_messages: int = 0
    total_prompt_tokens: int = 0
    total_completion_tokens: int = 0
    total_tokens: int = 0
    total_estimated_cost: float = 0.0
    
    # Average per message
    avg_prompt_tokens_per_message: float = 0.0
    avg_completion_tokens_per_message: float = 0.0
    avg_total_tokens_per_message: float = 0.0
    avg_cost_per_message: float = 0.0
    
    # Breakdown by operation type
    operations_breakdown: Dict[str, Dict[str, int]] = Field(default_factory=dict)
    
    # Tool usage breakdown
    tools_used: Dict[str, int] = Field(default_factory=dict)
    
    # Crisis and resource stats
    total_crisis_detections: int = 0
    total_resources_provided: int = 0
    
    # Time range
    first_message: Optional[datetime] = None
    last_message: Optional[datetime] = None
