from datetime import datetime, timedelta
from typing import Optional
import bcrypt
from jose import JWTError, jwt
from fastapi import Header, HTTPException

from ..config import settings

# JWT settings
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_DAYS = 7


def hash_password(plain_password: str) -> str:
    return bcrypt.hashpw(plain_password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")


def verify_password(plain_password: str, hashed_password: str) -> bool:
    return bcrypt.checkpw(plain_password.encode("utf-8"), hashed_password.encode("utf-8"))


def create_access_token(user_id: int, nickname: str, email: str) -> str:
    expire = datetime.utcnow() + timedelta(days=ACCESS_TOKEN_EXPIRE_DAYS)
    payload = {
        "user_id": user_id,
        "nickname": nickname,
        "email": email,
        "exp": expire
    }
    return jwt.encode(payload, settings.SECRET_KEY, algorithm=ALGORITHM)


def get_optional_current_user(authorization: Optional[str] = Header(None)) -> Optional[dict]:
    """
    FastAPI dependency — extracts user from JWT if present.
    Returns user dict if valid token, None if absent or invalid.
    Never raises for missing token (guests pass through).
    """
    if not authorization or not authorization.startswith("Bearer "):
        return None
    token = authorization.split(" ", 1)[1]
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[ALGORITHM])
        return {
            "user_id": payload.get("user_id"),
            "nickname": payload.get("nickname"),
            "email": payload.get("email")
        }
    except JWTError:
        return None


def get_required_current_user(authorization: Optional[str] = Header(None)) -> dict:
    """
    FastAPI dependency — same as above but raises 401 if no valid token.
    Use on endpoints that require authentication.
    """
    user = get_optional_current_user(authorization)
    if not user:
        raise HTTPException(status_code=401, detail="Authentication required")
    return user