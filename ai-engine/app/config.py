from typing import Optional
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    OPENAI_API_KEY: Optional[str] = None
    OPENAI_BASE_URL: Optional[str] = None
    GEMINI_API_KEY: Optional[str] = None

    ENVIRONMENT: Optional[str] = None
    MODEL_NAME: Optional[str] = None
    TEMPERATURE: Optional[float] = 0.7
    MAX_TOKENS: Optional[int] = 1000
    BACKEND_URL: Optional[str] = None

    model_config = SettingsConfigDict(
        env_file=".env",
        extra="ignore"
    )


settings = Settings()
