from pydantic import BaseModel, Field


class ImprovementSuggestionRequest(BaseModel):
    session_id: str
    suggestion_text: str = Field(..., min_length=1, max_length=2000)


class ImprovementSuggestionResponse(BaseModel):
    id: int
    message: str