from datetime import datetime
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.responses import Response
from sqlalchemy.orm import Session

from ..database import get_db
from ..config import settings
from ..schemas.admin import AdminLoginRequest, AdminTokenResponse, TokenRecordRequest
from ..utils.admin_auth import create_admin_token, verify_admin_token
from ..models.token_usage import TokenUsage
from ..services import admin_service

router = APIRouter(prefix="/api/admin", tags=["admin"])


# ---------------------------------------------------------------------------
# Auth
# ---------------------------------------------------------------------------

@router.post("/login", response_model=AdminTokenResponse)
async def admin_login(request: AdminLoginRequest):
    """Validate admin credentials and return a JWT."""
    if request.username != settings.ADMIN_USERNAME or request.password != settings.ADMIN_PASSWORD:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    token = create_admin_token()
    return AdminTokenResponse(access_token=token)


# ---------------------------------------------------------------------------
# Internal — token persistence (called by AI engine, no auth required)
# ---------------------------------------------------------------------------

@router.post("/tokens/record", status_code=201)
async def record_token_usage(
    request: TokenRecordRequest,
    db: Session = Depends(get_db)
):
    """
    Internal endpoint — called by AI engine after every chat response.
    Saves token usage to DB before streaming begins so nothing is lost.
    """
    row = TokenUsage(
        session_id=request.session_id,
        user_id=request.user_id,
        input_tokens=request.input_tokens,
        output_tokens=request.output_tokens,
        total_tokens=request.total_tokens,
        model_name=request.model_name,
        estimated_cost_usd=request.estimated_cost_usd
    )
    db.add(row)
    db.commit()
    return {"status": "recorded"}


# ---------------------------------------------------------------------------
# Shared date-parse helper
# ---------------------------------------------------------------------------

def _parse_dates(date_from: Optional[str], date_to: Optional[str]):
    """Parse YYYY-MM-DD strings into datetime objects (or None)."""
    fmt = "%Y-%m-%d"
    try:
        df = datetime.strptime(date_from, fmt) if date_from else None
    except ValueError:
        raise HTTPException(status_code=422, detail=f"Invalid date_from: '{date_from}'. Use YYYY-MM-DD.")
    try:
        # Include the full end day
        dt = datetime.strptime(date_to, fmt).replace(hour=23, minute=59, second=59) if date_to else None
    except ValueError:
        raise HTTPException(status_code=422, detail=f"Invalid date_to: '{date_to}'. Use YYYY-MM-DD.")
    return df, dt


# ---------------------------------------------------------------------------
# Analytics endpoints (all require admin JWT)
# ---------------------------------------------------------------------------

@router.get("/overview")
async def get_overview(
    date_from: Optional[str] = Query(None, description="Start date YYYY-MM-DD"),
    date_to: Optional[str] = Query(None, description="End date YYYY-MM-DD"),
    _: None = Depends(verify_admin_token),
    db: Session = Depends(get_db),
):
    """Total screenings, registered users, crisis count, monthly token cost, daily volume chart."""
    df, dt = _parse_dates(date_from, date_to)
    return admin_service.get_overview(db, df, dt)


@router.get("/screenings")
async def get_screenings(
    date_from: Optional[str] = Query(None),
    date_to: Optional[str] = Query(None),
    _: None = Depends(verify_admin_token),
    db: Session = Depends(get_db),
):
    """Volume by day, ASSIST risk per substance, PHQ-9 severity distribution."""
    df, dt = _parse_dates(date_from, date_to)
    return admin_service.get_screenings(db, df, dt)


@router.get("/demographics")
async def get_demographics(
    date_from: Optional[str] = Query(None),
    date_to: Optional[str] = Query(None),
    _: None = Depends(verify_admin_token),
    db: Session = Depends(get_db),
):
    """Age groups, gender, top states, employment status, religion distribution."""
    df, dt = _parse_dates(date_from, date_to)
    return admin_service.get_demographics(db, df, dt)


@router.get("/users")
async def get_users(
    date_from: Optional[str] = Query(None),
    date_to: Optional[str] = Query(None),
    _: None = Depends(verify_admin_token),
    db: Session = Depends(get_db),
):
    """Registration growth, guest vs registered, returning users."""
    df, dt = _parse_dates(date_from, date_to)
    return admin_service.get_users(db, df, dt)


@router.get("/chat")
async def get_chat(
    date_from: Optional[str] = Query(None),
    date_to: Optional[str] = Query(None),
    _: None = Depends(verify_admin_token),
    db: Session = Depends(get_db),
):
    """Conversation counts, avg messages/session, thumbs-up ratio, negative comments."""
    df, dt = _parse_dates(date_from, date_to)
    return admin_service.get_chat(db, df, dt)


@router.get("/tokens")
async def get_tokens(
    date_from: Optional[str] = Query(None),
    date_to: Optional[str] = Query(None),
    _: None = Depends(verify_admin_token),
    db: Session = Depends(get_db),
):
    """Daily token usage, monthly cost trend, totals and averages."""
    df, dt = _parse_dates(date_from, date_to)
    return admin_service.get_tokens(db, df, dt)


@router.get("/crisis")
async def get_crisis(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    date_from: Optional[str] = Query(None),
    date_to: Optional[str] = Query(None),
    _: None = Depends(verify_admin_token),
    db: Session = Depends(get_db),
):
    """Paginated crisis sessions with demographics and screening scores."""
    df, dt = _parse_dates(date_from, date_to)
    return admin_service.get_crisis(db, page, page_size, df, dt)


@router.get("/feedback")
async def get_feedback(
    date_from: Optional[str] = Query(None),
    date_to: Optional[str] = Query(None),
    _: None = Depends(verify_admin_token),
    db: Session = Depends(get_db),
):
    """Tab ratings per results tab, chat feedback trend, negative comments."""
    df, dt = _parse_dates(date_from, date_to)
    return admin_service.get_feedback(db, df, dt)


# ---------------------------------------------------------------------------
# CSV exports
# ---------------------------------------------------------------------------

@router.get("/export/screenings")
async def export_screenings(
    date_from: Optional[str] = Query(None),
    date_to: Optional[str] = Query(None),
    _: None = Depends(verify_admin_token),
    db: Session = Depends(get_db),
):
    df, dt = _parse_dates(date_from, date_to)
    csv_data = admin_service.export_screenings_csv(db, df, dt)
    return Response(
        content=csv_data,
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=screenings.csv"},
    )


@router.get("/export/demographics")
async def export_demographics(
    date_from: Optional[str] = Query(None),
    date_to: Optional[str] = Query(None),
    _: None = Depends(verify_admin_token),
    db: Session = Depends(get_db),
):
    df, dt = _parse_dates(date_from, date_to)
    csv_data = admin_service.export_demographics_csv(db, df, dt)
    return Response(
        content=csv_data,
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=demographics.csv"},
    )


@router.get("/export/tokens")
async def export_tokens(
    date_from: Optional[str] = Query(None),
    date_to: Optional[str] = Query(None),
    _: None = Depends(verify_admin_token),
    db: Session = Depends(get_db),
):
    df, dt = _parse_dates(date_from, date_to)
    csv_data = admin_service.export_tokens_csv(db, df, dt)
    return Response(
        content=csv_data,
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=token_usage.csv"},
    )


@router.get("/export/crisis")
async def export_crisis(
    date_from: Optional[str] = Query(None),
    date_to: Optional[str] = Query(None),
    _: None = Depends(verify_admin_token),
    db: Session = Depends(get_db),
):
    df, dt = _parse_dates(date_from, date_to)
    csv_data = admin_service.export_crisis_csv(db, df, dt)
    return Response(
        content=csv_data,
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=crisis_log.csv"},
    )


@router.get("/suggestions")
async def get_suggestions(
    date_from: Optional[str] = Query(None),
    date_to: Optional[str] = Query(None),
    _: None = Depends(verify_admin_token),
    db: Session = Depends(get_db),
):
    df, dt = _parse_dates(date_from, date_to)
    return admin_service.get_suggestions(db, df, dt)


@router.get("/gambling")
async def get_gambling_analytics(
    date_from: Optional[str] = Query(None),
    date_to: Optional[str] = Query(None),
    _: None = Depends(verify_admin_token),
    db: Session = Depends(get_db),
):
    df, dt = _parse_dates(date_from, date_to)
    return admin_service.get_pgsi_analytics(db, df, dt)
