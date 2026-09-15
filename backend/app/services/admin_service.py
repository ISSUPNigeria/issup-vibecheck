"""
Admin analytics service — all DB query logic for the admin dashboard.
All functions accept optional date_from / date_to (datetime) for filtering.
"""

import csv
import io
import json
from collections import defaultdict
from datetime import datetime, timedelta
from typing import Dict, List, Optional

from sqlalchemy import cast, Date, distinct, func
from sqlalchemy.orm import Session

from ..models.chat_message import ChatMessage
from ..models.feedback import ChatFeedback
from ..models.improvement_suggestion import ImprovementSuggestion
from ..models.results_feedback import ResultsFeedback
from ..models.screening import ScreeningSession
from ..models.token_usage import TokenUsage
from ..models.user import User


# ---------------------------------------------------------------------------
# Private helpers
# ---------------------------------------------------------------------------

def _safe_json(value) -> dict:
    """Return value as dict, handling both dict and JSON-string inputs."""
    if not value:
        return {}
    if isinstance(value, str):
        try:
            return json.loads(value)
        except Exception:
            return {}
    return value if isinstance(value, dict) else {}


def _is_crisis(results) -> bool:
    r = _safe_json(results)
    if not r:
        return False
    if r.get("crisis_detected"):
        return True
    phq9 = r.get("phq9") or r.get("phq9_results") or {}
    if phq9.get("suicidal_ideation"):
        return True
    if phq9.get("action") == "crisis_response":
        return True
    return False


def _filter_sessions(query, date_from, date_to):
    if date_from:
        query = query.filter(ScreeningSession.created_at >= date_from)
    if date_to:
        query = query.filter(ScreeningSession.created_at <= date_to)
    return query


def _filter_tokens(query, date_from, date_to):
    if date_from:
        query = query.filter(TokenUsage.created_at >= date_from)
    if date_to:
        query = query.filter(TokenUsage.created_at <= date_to)
    return query


AGE_BUCKETS = [
    ("Under 18", lambda a: a < 18),
    ("18–24", lambda a: 18 <= a <= 24),
    ("25–34", lambda a: 25 <= a <= 34),
    ("35–44", lambda a: 35 <= a <= 44),
    ("45–54", lambda a: 45 <= a <= 54),
    ("55+", lambda a: a >= 55),
]


def _bucket_age(age) -> str:
    try:
        a = int(age)
    except (TypeError, ValueError):
        return "Unknown"
    for label, test in AGE_BUCKETS:
        if test(a):
            return label
    return "Unknown"


# ---------------------------------------------------------------------------
# Overview
# ---------------------------------------------------------------------------

def get_overview(db: Session, date_from=None, date_to=None) -> Dict:
    # Total screenings
    sq = _filter_sessions(db.query(func.count(ScreeningSession.session_id)), date_from, date_to)
    total_screenings = sq.scalar() or 0

    # Registered users (count users created in period)
    uq = db.query(func.count(User.id))
    if date_from:
        uq = uq.filter(User.created_at >= date_from)
    if date_to:
        uq = uq.filter(User.created_at <= date_to)
    registered_users = uq.scalar() or 0

    # Crisis sessions
    rq = _filter_sessions(db.query(ScreeningSession.results), date_from, date_to)
    crisis_count = sum(1 for (r,) in rq.all() if _is_crisis(r))

    # Estimated cost this calendar month
    now = datetime.utcnow()
    month_start = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
    monthly_cost = float(
        db.query(func.sum(TokenUsage.estimated_cost_usd))
        .filter(TokenUsage.created_at >= month_start)
        .scalar() or 0
    )

    # Screenings per day (last 30 days, capped by date filter)
    thirty_ago = now - timedelta(days=30)
    effective_from = max(date_from, thirty_ago) if date_from else thirty_ago
    daily_rows = (
        _filter_sessions(
            db.query(
                cast(ScreeningSession.created_at, Date).label("day"),
                func.count(ScreeningSession.session_id).label("count"),
            ),
            effective_from,
            date_to,
        )
        .group_by("day")
        .order_by("day")
        .all()
    )
    screenings_per_day = [{"date": str(r.day), "count": r.count} for r in daily_rows]

    # Guest vs registered split
    guest_q = _filter_sessions(
        db.query(func.count(ScreeningSession.session_id)).filter(ScreeningSession.user_id.is_(None)),
        date_from, date_to,
    )
    reg_q = _filter_sessions(
        db.query(func.count(ScreeningSession.session_id)).filter(ScreeningSession.user_id.isnot(None)),
        date_from, date_to,
    )

    return {
        "total_screenings": total_screenings,
        "registered_users": registered_users,
        "crisis_sessions": crisis_count,
        "monthly_token_cost_usd": round(monthly_cost, 4),
        "screenings_per_day": screenings_per_day,
        "guest_sessions": guest_q.scalar() or 0,
        "registered_sessions": reg_q.scalar() or 0,
    }


# ---------------------------------------------------------------------------
# Screenings
# ---------------------------------------------------------------------------

def get_screenings(db: Session, date_from=None, date_to=None) -> Dict:
    rows = _filter_sessions(
        db.query(ScreeningSession.results, ScreeningSession.created_at),
        date_from, date_to,
    ).all()

    total = len(rows)
    high_assist = 0
    phq9_clinical = 0

    assist_risk: Dict[str, Dict[str, int]] = defaultdict(lambda: {"low": 0, "moderate": 0, "high": 0})
    phq9_severity: Dict[str, int] = defaultdict(int)
    volume_by_day: Dict[str, int] = defaultdict(int)

    for results, created_at in rows:
        r = _safe_json(results)
        day = str(created_at.date()) if created_at else "unknown"
        volume_by_day[day] += 1

        # ASSIST
        assist = r.get("assist") or r.get("assist_results") or {}
        scores = assist.get("scores") or {}
        session_has_high = False
        for substance, score_data in scores.items():
            level = (score_data.get("risk_level") or "low").lower()
            if level not in ("low", "moderate", "high"):
                level = "low"
            assist_risk[substance][level] += 1
            if level == "high":
                session_has_high = True
        if session_has_high:
            high_assist += 1

        # PHQ-9
        phq9 = r.get("phq9") or r.get("phq9_results") or {}
        severity = (phq9.get("severity") or "unknown").lower()
        phq9_severity[severity] += 1
        if phq9.get("meets_clinical_threshold") or (phq9.get("total_score") or 0) >= 10:
            phq9_clinical += 1

    # Sort volume by day
    sorted_volume = [{"date": d, "count": c} for d, c in sorted(volume_by_day.items())]

    # Format assist risk as list for charting
    assist_risk_list = [
        {"substance": sub, **counts}
        for sub, counts in sorted(assist_risk.items())
    ]

    return {
        "total_screenings": total,
        "high_assist_risk_sessions": high_assist,
        "phq9_clinical_threshold_met": phq9_clinical,
        "volume_by_day": sorted_volume,
        "assist_risk_by_substance": assist_risk_list,
        "phq9_severity_distribution": dict(phq9_severity),
    }


# ---------------------------------------------------------------------------
# Demographics
# ---------------------------------------------------------------------------

def get_demographics(db: Session, date_from=None, date_to=None) -> Dict:
    rows = _filter_sessions(
        db.query(ScreeningSession.demographics),
        date_from, date_to,
    ).all()

    age_groups: Dict[str, int] = defaultdict(int)
    genders: Dict[str, int] = defaultdict(int)
    states: Dict[str, int] = defaultdict(int)
    employment: Dict[str, int] = defaultdict(int)
    religion: Dict[str, int] = defaultdict(int)
    marital: Dict[str, int] = defaultdict(int)

    for (demo,) in rows:
        d = _safe_json(demo)
        age_groups[_bucket_age(d.get("age"))] += 1
        genders[(d.get("gender") or "unknown").lower()] += 1
        states[(d.get("state") or "unknown").title()] += 1
        employment[(d.get("employment_status") or "unknown").lower()] += 1
        religion[(d.get("religion") or "unknown").lower()] += 1
        marital[(d.get("marital_status") or "unknown").lower()] += 1

    # Top 10 states by volume
    top_states = sorted(states.items(), key=lambda x: x[1], reverse=True)[:10]

    return {
        "total": len(rows),
        "age_groups": dict(age_groups),
        "gender_distribution": dict(genders),
        "top_states": [{"state": s, "count": c} for s, c in top_states],
        "employment_status": dict(employment),
        "religion_distribution": dict(religion),
        "marital_status": dict(marital),
    }


# ---------------------------------------------------------------------------
# Users
# ---------------------------------------------------------------------------

def get_users(db: Session, date_from=None, date_to=None) -> Dict:
    # Total registered users ever
    total_registered = db.query(func.count(User.id)).scalar() or 0

    # Guest sessions in period
    guest_q = _filter_sessions(
        db.query(func.count(ScreeningSession.session_id)).filter(ScreeningSession.user_id.is_(None)),
        date_from, date_to,
    )
    guest_sessions = guest_q.scalar() or 0

    # Users with chat history
    users_with_chat = db.query(func.count(distinct(ChatMessage.user_id))).scalar() or 0

    # New registrations over time (in period if filtered)
    reg_q = db.query(
        cast(User.created_at, Date).label("day"),
        func.count(User.id).label("count"),
    )
    if date_from:
        reg_q = reg_q.filter(User.created_at >= date_from)
    if date_to:
        reg_q = reg_q.filter(User.created_at <= date_to)
    reg_rows = reg_q.group_by("day").order_by("day").all()
    registrations_over_time = [{"date": str(r.day), "count": r.count} for r in reg_rows]

    # Screening count distribution per user (1, 2, 3+)
    user_screening_counts = (
        db.query(
            ScreeningSession.user_id,
            func.count(ScreeningSession.session_id).label("cnt"),
        )
        .filter(ScreeningSession.user_id.isnot(None))
        .group_by(ScreeningSession.user_id)
        .all()
    )
    dist = {"1": 0, "2": 0, "3+": 0}
    for _, cnt in user_screening_counts:
        if cnt == 1:
            dist["1"] += 1
        elif cnt == 2:
            dist["2"] += 1
        else:
            dist["3+"] += 1

    return {
        "total_registered": total_registered,
        "guest_sessions_period": guest_sessions,
        "users_with_chat_history": users_with_chat,
        "registrations_over_time": registrations_over_time,
        "screenings_per_user_distribution": dist,
    }


# ---------------------------------------------------------------------------
# Chat analytics
# ---------------------------------------------------------------------------

def get_chat(db: Session, date_from=None, date_to=None) -> Dict:
    # Total unique conversations (sessions that have chat messages)
    total_conversations = (
        db.query(func.count(distinct(ChatMessage.session_id))).scalar() or 0
    )

    # Avg messages per session
    msg_per_session = (
        db.query(
            ChatMessage.session_id,
            func.count(ChatMessage.id).label("cnt"),
        )
        .group_by(ChatMessage.session_id)
        .all()
    )
    avg_messages = (
        round(sum(cnt for _, cnt in msg_per_session) / len(msg_per_session), 1)
        if msg_per_session
        else 0
    )

    # Thumbs-up rate from chat_feedback
    feedback_q = db.query(ChatFeedback.rating, ChatFeedback.created_at)
    if date_from:
        feedback_q = feedback_q.filter(ChatFeedback.created_at >= date_from)
    if date_to:
        feedback_q = feedback_q.filter(ChatFeedback.created_at <= date_to)
    all_feedback = feedback_q.all()

    thumbs_up_rate = (
        round(sum(r for r, _ in all_feedback) / len(all_feedback) * 100, 1)
        if all_feedback
        else 0
    )

    # Thumbs-up ratio trend by day
    daily_feedback: Dict[str, Dict] = defaultdict(lambda: {"up": 0, "down": 0})
    for rating, created_at in all_feedback:
        day = str(created_at.date()) if created_at else "unknown"
        if rating == 1:
            daily_feedback[day]["up"] += 1
        else:
            daily_feedback[day]["down"] += 1
    thumbs_up_trend = [
        {
            "date": d,
            "thumbs_up": v["up"],
            "thumbs_down": v["down"],
            "rate": round(v["up"] / (v["up"] + v["down"]) * 100, 1) if (v["up"] + v["down"]) else 0,
        }
        for d, v in sorted(daily_feedback.items())
    ]

    # Recent negative comments (last 20)
    neg_comments = (
        db.query(
            ChatFeedback.session_id,
            ChatFeedback.comment,
            ChatFeedback.ai_message,
            ChatFeedback.created_at,
        )
        .filter(ChatFeedback.rating == 0, ChatFeedback.comment.isnot(None))
        .order_by(ChatFeedback.created_at.desc())
        .limit(20)
        .all()
    )
    recent_negative = [
        {
            "session_id": r.session_id,
            "comment": r.comment,
            "ai_message": r.ai_message or "",
            "date": str(r.created_at.date()) if r.created_at else None,
        }
        for r in neg_comments
    ]

    return {
        "total_conversations": total_conversations,
        "avg_messages_per_session": avg_messages,
        "thumbs_up_rate_percent": thumbs_up_rate,
        "total_feedback_submitted": len(all_feedback),
        "thumbs_up_trend": thumbs_up_trend,
        "recent_negative_comments": recent_negative,
    }


# ---------------------------------------------------------------------------
# Token usage
# ---------------------------------------------------------------------------

def get_tokens(db: Session, date_from=None, date_to=None) -> Dict:
    now = datetime.utcnow()
    today_start = now.replace(hour=0, minute=0, second=0, microsecond=0)
    month_start = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)

    # This month
    monthly = db.query(
        func.sum(TokenUsage.total_tokens).label("tokens"),
        func.sum(TokenUsage.estimated_cost_usd).label("cost"),
    ).filter(TokenUsage.created_at >= month_start).one()
    this_month_tokens = int(monthly.tokens or 0)
    this_month_cost = round(float(monthly.cost or 0), 4)

    # Today
    today_tokens = int(
        db.query(func.sum(TokenUsage.total_tokens))
        .filter(TokenUsage.created_at >= today_start)
        .scalar() or 0
    )

    # Avg tokens per session
    session_totals = (
        db.query(
            TokenUsage.session_id,
            func.sum(TokenUsage.total_tokens).label("total"),
        )
        .group_by(TokenUsage.session_id)
        .all()
    )
    avg_per_session = (
        round(sum(t for _, t in session_totals) / len(session_totals))
        if session_totals
        else 0
    )

    # Daily usage (in filter period, default last 30 days)
    effective_from = date_from or (now - timedelta(days=30))
    daily_rows = _filter_tokens(
        db.query(
            cast(TokenUsage.created_at, Date).label("day"),
            func.sum(TokenUsage.input_tokens).label("input"),
            func.sum(TokenUsage.output_tokens).label("output"),
            func.sum(TokenUsage.total_tokens).label("total"),
        ).filter(TokenUsage.created_at >= effective_from),
        None,
        date_to,
    ).group_by("day").order_by("day").all()

    daily_usage = [
        {
            "date": str(r.day),
            "input_tokens": int(r.input or 0),
            "output_tokens": int(r.output or 0),
            "total_tokens": int(r.total or 0),
        }
        for r in daily_rows
    ]

    # Monthly cost trend (last 6 months)
    six_months_ago = now.replace(day=1) - timedelta(days=180)
    monthly_rows = (
        db.query(
            func.date_format(TokenUsage.created_at, "%Y-%m").label("month"),
            func.sum(TokenUsage.estimated_cost_usd).label("cost"),
            func.sum(TokenUsage.total_tokens).label("tokens"),
        )
        .filter(TokenUsage.created_at >= six_months_ago)
        .group_by("month")
        .order_by("month")
        .all()
    )
    monthly_cost_trend = [
        {"month": r.month, "cost_usd": round(float(r.cost or 0), 4), "tokens": int(r.tokens or 0)}
        for r in monthly_rows
    ]

    return {
        "this_month_tokens": this_month_tokens,
        "this_month_cost_usd": this_month_cost,
        "avg_tokens_per_session": avg_per_session,
        "today_tokens": today_tokens,
        "daily_usage": daily_usage,
        "monthly_cost_trend": monthly_cost_trend,
    }


# ---------------------------------------------------------------------------
# Crisis log
# ---------------------------------------------------------------------------

def get_crisis(db: Session, page: int, page_size: int, date_from=None, date_to=None) -> Dict:
    rows = _filter_sessions(
        db.query(
            ScreeningSession.session_id,
            ScreeningSession.demographics,
            ScreeningSession.results,
            ScreeningSession.created_at,
        ),
        date_from,
        date_to,
    ).all()

    crisis_rows = []
    for session_id, demo, results, created_at in rows:
        if not _is_crisis(results):
            continue
        d = _safe_json(demo)
        r = _safe_json(results)
        phq9 = r.get("phq9") or r.get("phq9_results") or {}
        assist = r.get("assist") or r.get("assist_results") or {}

        crisis_rows.append({
            "date": str(created_at.date()) if created_at else None,
            "session_id": session_id,
            "age": d.get("age"),
            "state": d.get("state"),
            "gender": d.get("gender"),
            "assist_overall_risk": assist.get("overall_risk"),
            "phq9_score": phq9.get("total_score"),
            "phq9_q9": phq9.get("suicidal_ideation"),
        })

    # Sort by date descending
    crisis_rows.sort(key=lambda x: x["date"] or "", reverse=True)
    total = len(crisis_rows)
    start = (page - 1) * page_size
    paginated = crisis_rows[start: start + page_size]

    return {
        "total": total,
        "page": page,
        "page_size": page_size,
        "total_pages": max(1, (total + page_size - 1) // page_size),
        "sessions": paginated,
    }


# ---------------------------------------------------------------------------
# Feedback
# ---------------------------------------------------------------------------

def get_feedback(db: Session, date_from=None, date_to=None) -> Dict:
    # Results feedback: avg rating per tab
    rf_q = db.query(ResultsFeedback.tab_name, ResultsFeedback.rating, ResultsFeedback.created_at)
    if date_from:
        rf_q = rf_q.filter(ResultsFeedback.created_at >= date_from)
    if date_to:
        rf_q = rf_q.filter(ResultsFeedback.created_at <= date_to)
    results_feedback = rf_q.all()

    tab_data: Dict[str, Dict] = defaultdict(lambda: {"up": 0, "down": 0})
    for tab, rating, _ in results_feedback:
        if rating == 1:
            tab_data[tab]["up"] += 1
        else:
            tab_data[tab]["down"] += 1

    tab_ratings = [
        {
            "tab": tab,
            "thumbs_up": v["up"],
            "thumbs_down": v["down"],
            "total": v["up"] + v["down"],
            "rate_percent": round(v["up"] / (v["up"] + v["down"]) * 100, 1) if (v["up"] + v["down"]) else 0,
        }
        for tab, v in sorted(tab_data.items())
    ]

    # Chat feedback trend by day
    cf_q = db.query(ChatFeedback.rating, ChatFeedback.created_at)
    if date_from:
        cf_q = cf_q.filter(ChatFeedback.created_at >= date_from)
    if date_to:
        cf_q = cf_q.filter(ChatFeedback.created_at <= date_to)
    chat_feedback = cf_q.order_by(ChatFeedback.created_at).all()

    daily_chat: Dict[str, Dict] = defaultdict(lambda: {"up": 0, "down": 0})
    for rating, created_at in chat_feedback:
        day = str(created_at.date()) if created_at else "unknown"
        if rating == 1:
            daily_chat[day]["up"] += 1
        else:
            daily_chat[day]["down"] += 1
    chat_trend = [
        {
            "date": d,
            "thumbs_up": v["up"],
            "thumbs_down": v["down"],
            "rate_percent": round(v["up"] / (v["up"] + v["down"]) * 100, 1) if (v["up"] + v["down"]) else 0,
        }
        for d, v in sorted(daily_chat.items())
    ]

    # Recent negative comments (both chat and results)
    neg_chat = (
        db.query(ChatFeedback.session_id, ChatFeedback.comment, ChatFeedback.created_at)
        .filter(ChatFeedback.rating == 0, ChatFeedback.comment.isnot(None))
        .order_by(ChatFeedback.created_at.desc())
        .limit(10)
        .all()
    )
    neg_results = (
        db.query(ResultsFeedback.session_id, ResultsFeedback.tab_name, ResultsFeedback.comment, ResultsFeedback.created_at)
        .filter(ResultsFeedback.rating == 0, ResultsFeedback.comment.isnot(None))
        .order_by(ResultsFeedback.created_at.desc())
        .limit(10)
        .all()
    )
    negative_comments = [
        {"source": "chat", "session_id": r.session_id, "tab": None, "comment": r.comment,
         "date": str(r.created_at.date()) if r.created_at else None}
        for r in neg_chat
    ] + [
        {"source": "results", "session_id": r.session_id, "tab": r.tab_name, "comment": r.comment,
         "date": str(r.created_at.date()) if r.created_at else None}
        for r in neg_results
    ]
    negative_comments.sort(key=lambda x: x["date"] or "", reverse=True)

    return {
        "tab_ratings": tab_ratings,
        "chat_feedback_trend": chat_trend,
        "negative_comments": negative_comments[:20],
    }


# ---------------------------------------------------------------------------
# CSV export helpers
# ---------------------------------------------------------------------------

def export_screenings_csv(db: Session, date_from=None, date_to=None) -> str:
    rows = _filter_sessions(
        db.query(
            ScreeningSession.session_id,
            ScreeningSession.user_id,
            ScreeningSession.demographics,
            ScreeningSession.results,
            ScreeningSession.created_at,
        ),
        date_from, date_to,
    ).order_by(ScreeningSession.created_at.desc()).all()

    buf = io.StringIO()
    writer = csv.writer(buf)
    writer.writerow([
        "session_id", "user_id", "created_at",
        "age", "gender", "state",
        "assist_overall_risk", "phq9_score", "phq9_severity", "crisis",
    ])
    for sid, uid, demo, results, created_at in rows:
        d = _safe_json(demo)
        r = _safe_json(results)
        phq9 = r.get("phq9") or r.get("phq9_results") or {}
        assist = r.get("assist") or r.get("assist_results") or {}
        writer.writerow([
            sid, uid or "guest",
            str(created_at) if created_at else "",
            d.get("age", ""), d.get("gender", ""), d.get("state", ""),
            assist.get("overall_risk", ""),
            phq9.get("total_score", ""),
            phq9.get("severity", ""),
            "yes" if _is_crisis(r) else "no",
        ])
    return buf.getvalue()


def export_demographics_csv(db: Session, date_from=None, date_to=None) -> str:
    rows = _filter_sessions(
        db.query(
            ScreeningSession.session_id,
            ScreeningSession.demographics,
            ScreeningSession.created_at,
        ),
        date_from, date_to,
    ).order_by(ScreeningSession.created_at.desc()).all()

    buf = io.StringIO()
    writer = csv.writer(buf)
    writer.writerow([
        "session_id", "created_at", "age", "gender", "state", "city",
        "religion", "employment_status", "employment_sector", "marital_status",
    ])
    for sid, demo, created_at in rows:
        d = _safe_json(demo)
        writer.writerow([
            sid, str(created_at) if created_at else "",
            d.get("age", ""), d.get("gender", ""), d.get("state", ""), d.get("city", ""),
            d.get("religion", ""), d.get("employment_status", ""),
            d.get("employment_sector", ""), d.get("marital_status", ""),
        ])
    return buf.getvalue()


def export_tokens_csv(db: Session, date_from=None, date_to=None) -> str:
    rows = _filter_tokens(
        db.query(TokenUsage),
        date_from, date_to,
    ).order_by(TokenUsage.created_at.desc()).all()

    buf = io.StringIO()
    writer = csv.writer(buf)
    writer.writerow([
        "id", "session_id", "user_id", "model_name",
        "input_tokens", "output_tokens", "total_tokens",
        "estimated_cost_usd", "created_at",
    ])
    for row in rows:
        writer.writerow([
            row.id, row.session_id, row.user_id or "guest", row.model_name,
            row.input_tokens, row.output_tokens, row.total_tokens,
            row.estimated_cost_usd, str(row.created_at),
        ])
    return buf.getvalue()


def export_crisis_csv(db: Session, date_from=None, date_to=None) -> str:
    data = get_crisis(db, page=1, page_size=10000, date_from=date_from, date_to=date_to)
    buf = io.StringIO()
    writer = csv.writer(buf)
    writer.writerow([
        "date", "session_id", "age", "state", "gender",
        "assist_overall_risk", "phq9_score", "phq9_q9",
    ])
    for s in data["sessions"]:
        writer.writerow([
            s["date"], s["session_id"], s["age"], s["state"], s["gender"],
            s["assist_overall_risk"], s["phq9_score"],
            "yes" if s["phq9_q9"] else "no",
        ])
    return buf.getvalue()


def get_pgsi_analytics(db: Session, date_from=None, date_to=None) -> dict:
    """Return PGSI gambling screening distribution and summary stats."""
    sessions = _filter_sessions(
        db.query(ScreeningSession), date_from, date_to
    ).all()

    category_counts = {
        "no_risk": 0,
        "low_risk": 0,
        "moderate_risk": 0,
        "problem_gambler": 0,
    }
    total_scores = []
    professional_help_count = 0

    for s in sessions:
        r = _safe_json(s.results)
        pgsi = r.get("pgsi")
        if not pgsi:
            continue
        cat = pgsi.get("risk_category", "")
        if cat in category_counts:
            category_counts[cat] += 1
        score = pgsi.get("total_score")
        if score is not None:
            total_scores.append(score)
        if pgsi.get("professional_help_recommended"):
            professional_help_count += 1

    total_screened = len(total_scores)
    avg_score = round(sum(total_scores) / total_screened, 2) if total_screened else 0

    return {
        "total_screened": total_screened,
        "average_score": avg_score,
        "professional_help_recommended": professional_help_count,
        "distribution": [
            {"category": "no_risk",         "label": "No Risk",          "count": category_counts["no_risk"]},
            {"category": "low_risk",         "label": "Low Risk",         "count": category_counts["low_risk"]},
            {"category": "moderate_risk",    "label": "Moderate Risk",    "count": category_counts["moderate_risk"]},
            {"category": "problem_gambler",  "label": "Problem Gambler",  "count": category_counts["problem_gambler"]},
        ],
    }


def get_suggestions(db: Session, date_from=None, date_to=None) -> dict:
    query = db.query(ImprovementSuggestion)
    if date_from:
        query = query.filter(ImprovementSuggestion.created_at >= date_from)
    if date_to:
        query = query.filter(ImprovementSuggestion.created_at <= date_to)
    rows = query.order_by(ImprovementSuggestion.created_at.desc()).all()
    return {
        "total": len(rows),
        "suggestions": [
            {
                "id": r.id,
                "session_id": r.session_id,
                "suggestion_text": r.suggestion_text,
                "created_at": str(r.created_at),
            }
            for r in rows
        ],
    }

