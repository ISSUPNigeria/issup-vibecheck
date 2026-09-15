from fastapi import FastAPI
from .config import settings

app = FastAPI(
    title="Mental Health AI Engine",
    description="AI-powered chatbot engine for mental health support using OpenAI and LangChain",
    version="1.0.0"
)

@app.get("/")
async def root():
    return {
        "message": "Mental Health AI Engine",
        "version": "1.0.0",
        "status": "running",
        "model": settings.MODEL_NAME
    }

@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "environment": settings.ENVIRONMENT,
        "model": settings.MODEL_NAME
    }

# Import routers
from .routers import screening, chat, validated_screening, analytics
app.include_router(screening.router, prefix="/api/screening", tags=["screening"])
app.include_router(validated_screening.router, prefix="/api/validated-screening", tags=["validated-screening"])
app.include_router(chat.router, prefix="/api/chat", tags=["chat"])
app.include_router(analytics.router, prefix="/api/analytics", tags=["analytics"])
