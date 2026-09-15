from pydantic import BaseModel
from typing import Optional
from decimal import Decimal


class AdminLoginRequest(BaseModel):
    username: str
    password: str


class AdminTokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


class TokenRecordRequest(BaseModel):
    session_id: str
    user_id: Optional[int] = None
    input_tokens: int
    output_tokens: int
    total_tokens: int
    model_name: str
    estimated_cost_usd: Decimal
