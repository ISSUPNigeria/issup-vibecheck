"""
Token tracking service for monitoring and analyzing token usage.
"""

from typing import Dict, List, Optional
from datetime import datetime
from collections import defaultdict
from ..schemas.token_tracking import (
    TokenUsage,
    TokenTrackingRecord,
    SessionTokenStats,
    GlobalTokenStats,
    TokenUsageType
)


class TokenTrackingService:
    """Service for tracking and analyzing token usage."""
    
    def __init__(self):
        # In-memory storage for token tracking records
        # In production, this should be persisted to a database
        self.records: List[TokenTrackingRecord] = []
        self.session_records: Dict[str, List[TokenTrackingRecord]] = defaultdict(list)
    
    def track_usage(self, record: TokenTrackingRecord) -> None:
        """
        Track a token usage record.
        
        Args:
            record: Token tracking record to store
        """
        self.records.append(record)
        self.session_records[record.session_id].append(record)
    
    def get_session_stats(self, session_id: str) -> SessionTokenStats:
        """
        Get aggregated token statistics for a specific session.
        
        Args:
            session_id: Session ID to get statistics for
            
        Returns:
            Aggregated session statistics
        """
        session_records = self.session_records.get(session_id, [])
        
        if not session_records:
            return SessionTokenStats(session_id=session_id)
        
        stats = SessionTokenStats(session_id=session_id)
        stats.total_messages = len(session_records)
        
        operations_count: Dict[str, int] = defaultdict(int)
        tools_count: Dict[str, int] = defaultdict(int)
        
        for record in session_records:
            stats.total_prompt_tokens += record.total_prompt_tokens
            stats.total_completion_tokens += record.total_completion_tokens
            stats.total_tokens += record.total_tokens
            stats.total_estimated_cost += record.total_estimated_cost
            
            # Track operations
            operations_count[record.operation_type.value] += 1
            
            # Track tools
            for tool in record.tools_called:
                tools_count[tool] += 1
            
            # Track crisis and resources
            if record.crisis_detected:
                stats.crisis_detections += 1
            if record.resources_provided:
                stats.resources_provided_count += 1
            
            # Track time range
            if stats.first_message is None or record.timestamp < stats.first_message:
                stats.first_message = record.timestamp
            if stats.last_message is None or record.timestamp > stats.last_message:
                stats.last_message = record.timestamp
        
        stats.operations_breakdown = dict(operations_count)
        stats.tools_used = dict(tools_count)
        
        return stats
    
    def get_global_stats(self) -> GlobalTokenStats:
        """
        Get global token statistics across all sessions.
        
        Returns:
            Global aggregated statistics
        """
        if not self.records:
            return GlobalTokenStats()
        
        stats = GlobalTokenStats()
        stats.total_sessions = len(self.session_records)
        stats.total_messages = len(self.records)
        
        operations_breakdown: Dict[str, Dict[str, int]] = defaultdict(lambda: defaultdict(int))
        tools_count: Dict[str, int] = defaultdict(int)
        
        for record in self.records:
            stats.total_prompt_tokens += record.total_prompt_tokens
            stats.total_completion_tokens += record.total_completion_tokens
            stats.total_tokens += record.total_tokens
            stats.total_estimated_cost += record.total_estimated_cost
            
            # Track operations
            op_type = record.operation_type.value
            operations_breakdown[op_type]["count"] += 1
            operations_breakdown[op_type]["tokens"] = operations_breakdown[op_type].get("tokens", 0) + record.total_tokens
            
            # Track tools
            for tool in record.tools_called:
                tools_count[tool] += 1
            
            # Track crisis and resources
            if record.crisis_detected:
                stats.total_crisis_detections += 1
            if record.resources_provided:
                stats.total_resources_provided += 1
            
            # Track time range
            if stats.first_message is None or record.timestamp < stats.first_message:
                stats.first_message = record.timestamp
            if stats.last_message is None or record.timestamp > stats.last_message:
                stats.last_message = record.timestamp
        
        # Calculate averages
        if stats.total_messages > 0:
            stats.avg_prompt_tokens_per_message = stats.total_prompt_tokens / stats.total_messages
            stats.avg_completion_tokens_per_message = stats.total_completion_tokens / stats.total_messages
            stats.avg_total_tokens_per_message = stats.total_tokens / stats.total_messages
            stats.avg_cost_per_message = stats.total_estimated_cost / stats.total_messages
        
        stats.operations_breakdown = {k: dict(v) for k, v in operations_breakdown.items()}
        stats.tools_used = dict(tools_count)
        
        return stats
    
    def get_recent_records(self, limit: int = 50) -> List[TokenTrackingRecord]:
        """
        Get the most recent token tracking records.
        
        Args:
            limit: Maximum number of records to return
            
        Returns:
            List of recent records
        """
        return sorted(self.records, key=lambda r: r.timestamp, reverse=True)[:limit]
    
    def get_session_records(self, session_id: str) -> List[TokenTrackingRecord]:
        """
        Get all token tracking records for a specific session.
        
        Args:
            session_id: Session ID to get records for
            
        Returns:
            List of records for the session
        """
        return self.session_records.get(session_id, [])
    
    def clear_session(self, session_id: str) -> None:
        """
        Clear token tracking data for a specific session.
        
        Args:
            session_id: Session ID to clear
        """
        if session_id in self.session_records:
            # Remove from session records
            session_records = self.session_records[session_id]
            del self.session_records[session_id]
            
            # Remove from global records
            self.records = [r for r in self.records if r.session_id != session_id]
    
    def clear_all(self) -> None:
        """Clear all token tracking data."""
        self.records.clear()
        self.session_records.clear()


# Global token tracking service instance
token_tracking_service = TokenTrackingService()
