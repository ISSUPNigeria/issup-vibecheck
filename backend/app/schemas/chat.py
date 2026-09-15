"""
Pydantic schemas for chat functionality.
"""

from pydantic import BaseModel
from typing import List, Optional


class ChatMessage(BaseModel):
    role: str  # "user" or "assistant"
    content: str


class SendMessageRequest(BaseModel):
    session_id: str
    message: str
    conversation_history: List[ChatMessage] = []


class SendMessageResponse(BaseModel):
    message: str
    crisis_detected: bool = False
    resources_provided: bool = False


class StartConversationRequest(BaseModel):
    session_id: str


class StartConversationResponse(BaseModel):
    message: str
