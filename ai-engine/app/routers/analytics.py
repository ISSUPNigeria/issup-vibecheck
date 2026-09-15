"""
Analytics router for token usage tracking and monitoring.
"""

from fastapi import APIRouter, Query
from typing import Optional
from datetime import datetime, timedelta
from ..services.token_tracking_service import token_tracking_service
from ..schemas.token_tracking import SessionTokenStats, GlobalTokenStats

router = APIRouter()


@router.get("/token-usage/session/{session_id}", response_model=SessionTokenStats)
async def get_session_token_usage(session_id: str):
    """
    Get aggregated token usage statistics for a specific chat session.

    Args:
        session_id: The chat session ID

    Returns:
        Aggregated token statistics for the session
    """
    stats = token_tracking_service.get_session_stats(session_id)
    return stats


@router.get("/token-usage/global", response_model=GlobalTokenStats)
async def get_global_token_usage():
    """
    Get global token usage statistics across all sessions.

    Returns:
        Global aggregated token statistics
    """
    stats = token_tracking_service.get_global_stats()
    return stats


@router.get("/token-usage/recent")
async def get_recent_token_usage(limit: int = Query(default=50, le=200)):
    """
    Get the most recent token tracking records.

    Args:
        limit: Maximum number of records to return (max 200)

    Returns:
        List of recent token tracking records
    """
    records = token_tracking_service.get_recent_records(limit=limit)
    return {
        "total_records": len(records),
        "records": records
    }


@router.get("/token-usage/summary")
async def get_token_usage_summary():
    """
    Get a summary of token usage with key metrics.

    Returns:
        Summary with key metrics and cost estimates
    """
    global_stats = token_tracking_service.get_global_stats()

    # Calculate daily/monthly projections if we have data
    daily_projection = 0.0
    monthly_projection = 0.0

    if global_stats.total_messages > 0 and global_stats.first_message and global_stats.last_message:
        # Calculate time span
        time_span = global_stats.last_message - global_stats.first_message
        hours_elapsed = max(time_span.total_seconds() / 3600, 1)  # At least 1 hour

        # Calculate messages per hour
        messages_per_hour = global_stats.total_messages / hours_elapsed

        # Project to daily (24 hours)
        daily_messages = messages_per_hour * 24
        daily_cost = (daily_messages / global_stats.total_messages) * global_stats.total_estimated_cost

        # Project to monthly (30 days)
        monthly_cost = daily_cost * 30

        daily_projection = daily_cost
        monthly_projection = monthly_cost

    return {
        "current_stats": global_stats,
        "projections": {
            "daily_cost_estimate": round(daily_projection, 4),
            "monthly_cost_estimate": round(monthly_projection, 2),
            "yearly_cost_estimate": round(monthly_projection * 12, 2)
        },
        "efficiency_metrics": {
            "avg_tokens_per_message": round(global_stats.avg_total_tokens_per_message, 2),
            "avg_cost_per_message": round(global_stats.avg_cost_per_message, 6),
            "avg_prompt_completion_ratio": round(
                global_stats.avg_prompt_tokens_per_message / max(global_stats.avg_completion_tokens_per_message, 1),
                2
            ) if global_stats.avg_completion_tokens_per_message > 0 else 0
        }
    }


@router.get("/token-usage/breakdown")
async def get_token_usage_breakdown():
    """
    Get detailed breakdown of token usage by operation type and tool usage.

    Returns:
        Detailed breakdown of where tokens are being used
    """
    global_stats = token_tracking_service.get_global_stats()

    # Calculate percentages for operation breakdown
    operation_percentages = {}
    if global_stats.total_tokens > 0:
        for op_type, op_data in global_stats.operations_breakdown.items():
            tokens = op_data.get("tokens", 0)
            percentage = (tokens / global_stats.total_tokens) * 100
            operation_percentages[op_type] = {
                "count": op_data.get("count", 0),
                "tokens": tokens,
                "percentage": round(percentage, 2)
            }

    return {
        "operations_breakdown": operation_percentages,
        "tools_usage": global_stats.tools_used,
        "crisis_stats": {
            "total_crisis_detections": global_stats.total_crisis_detections,
            "total_resources_provided": global_stats.total_resources_provided,
            "crisis_detection_rate": round(
                (global_stats.total_crisis_detections / max(global_stats.total_messages, 1)) * 100,
                2
            )
        }
    }


@router.delete("/token-usage/session/{session_id}")
async def clear_session_token_usage(session_id: str):
    """
    Clear token usage data for a specific session.

    Args:
        session_id: The session ID to clear

    Returns:
        Success message
    """
    token_tracking_service.clear_session(session_id)
    return {
        "message": f"Token usage data cleared for session {session_id}"
    }


@router.delete("/token-usage/all")
async def clear_all_token_usage():
    """
    Clear all token usage data (use with caution).

    Returns:
        Success message
    """
    token_tracking_service.clear_all()
    return {
        "message": "All token usage data cleared"
    }


@router.get("/health")
async def analytics_health():
    """Health check for analytics service."""
    global_stats = token_tracking_service.get_global_stats()

    return {
        "status": "healthy",
        "total_sessions_tracked": global_stats.total_sessions,
        "total_messages_tracked": global_stats.total_messages,
        "tracking_enabled": True
    }
