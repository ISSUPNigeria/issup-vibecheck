from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .config import settings
from . import models

app = FastAPI(
    title="Mental Health Screening & Support API",
    description="Backend API for mental health screening and AI-powered support chatbot",
    version="1.0.0"
)

print(f"Initializing database with URL: {settings.cors_origins_list}")

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {
        "message": "Mental Health Screening & Support API",
        "version": "1.0.0",
        "status": "running"
    }

@app.get("/health")
async def health_check():
    return {"status": "healthy", "environment": settings.ENVIRONMENT}

# Import routers
from .routers import screening, chat, feedback, results_feedback, auth, chat_history, admin, improvement_suggestion
app.include_router(screening.router, prefix="/api/screening", tags=["screening"])
app.include_router(chat.router, prefix="/api/chat", tags=["chat"])
app.include_router(feedback.router)
app.include_router(results_feedback.router)
app.include_router(improvement_suggestion.router)
app.include_router(auth.router, prefix="/api/auth", tags=["auth"])
app.include_router(chat_history.router, prefix="/api", tags=["chat-history"])
app.include_router(admin.router)
