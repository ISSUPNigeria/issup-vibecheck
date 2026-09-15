from pydantic_settings import BaseSettings
from typing import List

class Settings(BaseSettings):
    DATABASE_URL: str
    SECRET_KEY: str
    ENVIRONMENT: str = "development"
    CORS_ORIGINS: str = "http://localhost:5173"
    AI_ENGINE_URL: str = "http://localhost:8449"
    ADMIN_USERNAME: str = "admin"
    ADMIN_PASSWORD: str = "changeme"
    ADMIN_JWT_SECRET: str = "admin_jwt_secret_change_in_production"

    @property
    def cors_origins_list(self) -> List[str]:
        print(f"Parsing CORS_ORIGINS: {self.CORS_ORIGINS}")
        return [origin.strip() for origin in self.CORS_ORIGINS.split(",")]

    class Config:
        env_file = ".env"
        case_sensitive = True

settings = Settings()
