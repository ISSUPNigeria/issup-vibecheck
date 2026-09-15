from typing import Optional
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    OPENAI_API_KEY: str
    OPENAI_BASE_URL: Optional[str] = None
    ENVIRONMENT: str = "development"
    MODEL_NAME: str = "gpt-4o-mini"
    TEMPERATURE: float = 0.7
    MAX_TOKENS: int = 1000
    BACKEND_URL: str = "http://localhost:8448"

    class Config:
        env_file = ".env"
        case_sensitive = True

settings = Settings()
