from datetime import datetime, timedelta
from jose import JWTError, jwt
from fastapi import Depends, HTTPException
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

from ..config import settings

ALGORITHM = "HS256"
ADMIN_TOKEN_EXPIRE_HOURS = 24

_bearer_scheme = HTTPBearer()


def create_admin_token() -> str:
    expire = datetime.utcnow() + timedelta(hours=ADMIN_TOKEN_EXPIRE_HOURS)
    payload = {"sub": "admin", "exp": expire}
    return jwt.encode(payload, settings.ADMIN_JWT_SECRET, algorithm=ALGORITHM)


def verify_admin_token(
    credentials: HTTPAuthorizationCredentials = Depends(_bearer_scheme)
) -> None:
    """
    FastAPI dependency — protects all /api/admin/* routes.
    Raises 401 if token is missing or expired.
    """
    try:
        payload = jwt.decode(credentials.credentials, settings.ADMIN_JWT_SECRET, algorithms=[ALGORITHM])
        if payload.get("sub") != "admin":
            raise HTTPException(status_code=401, detail="Invalid admin token")
    except JWTError:
        raise HTTPException(status_code=401, detail="Admin token expired or invalid")
