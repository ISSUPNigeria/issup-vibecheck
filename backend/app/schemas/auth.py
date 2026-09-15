from pydantic import BaseModel


class RegisterRequest(BaseModel):
    nickname: str
    email: str
    password: str


class LoginRequest(BaseModel):
    email: str
    password: str


class AuthResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    nickname: str
    user_id: int
