# Mental Health Screening & Support Application

A comprehensive web application combining mental health screening with AI-powered supportive chatbot for substance use prevention and treatment.

## Project Structure

```
ISSUP/
├── frontend/          # React + Vite + Tailwind CSS
├── backend/           # FastAPI Backend API
├── ai-engine/         # AI Chatbot Engine (OpenAI + LangChain)
└── database/          # MySQL Database Schema
```

## Prerequisites

- **Node.js** 18.x or higher
- **Python** 3.10 or higher
- **MySQL** 8.0 or higher
- **OpenAI API Key** (for AI chatbot)

## Nigerian Context (CRITICAL)

This application is **exclusively for Nigeria**. When modifying:
- **Resources:** Only Nigerian professionals, hotlines, organizations
- **Demographics:** Use 37 Nigerian states (full list in database schema)
- **Languages:** English, Yoruba, Hausa, Igbo, Pidgin
- **Crisis hotlines:** NEVER use US numbers (988, 741741). Use Nigerian only:
  - Primary: +234 704 652 6817 (Call/WhatsApp)
  - WhatsApp: +234 812 937 8557
  - Emergency: 112 (Nigeria National)
- **Phone format:** +234-XXX-XXX-XXXX
- **Affordability:** Prioritize free/sliding scale options (💚 emoji marker)

## Validated Screening Instruments

The app uses WHO-validated instruments (v2 endpoints):

### WHO ASSIST V3.0
- 71 adaptive questions across 10 substance categories
- Q1 determines which substances to assess (lifetime use)
- Q2-Q7 for past 3-month usage; **Q5 skipped for tobacco** (WHO specification)
- Q8: Injection drug use
- Risk levels: Low (0-10), Moderate (11-26), High (27+)
- **Tobacco thresholds differ**: Low (0-3), Moderate (4-26), High (27+)
- Backend: `backend/app/services/assist_scoring_service.py`

### PHQ-9 (Depression)
- 9 questions (0-3 scale) + Q10 functional impairment
- Severity: Minimal (0-4), Mild (5-9), Moderate (10-14), Moderately Severe (15-19), Severe (20-27)
- **Q9 >0 triggers crisis response** (suicidal ideation detection)
- Clinical threshold: score ≥ 10 requires professional intervention
- Backend: `backend/app/services/phq9_scoring_service.py`

### Triggers Assessment
- 82 items: 43 external + 39 internal triggers
- Only shown if ASSIST moderate+ OR PHQ-9 ≥10
- **4-level rating:** Never Use (0%), Almost Never (~25%), Almost Always (~75%), Always Use (100%)
- Pattern levels: Low (0-3), Moderate (4-7), High (8+)
- No "high-risk" individual trigger classification (WHO compliance)
- Backend: `backend/app/services/triggers_analysis_service.py`

### PGSI (Problem Gambling Severity Index)
- 9 questions measuring gambling behavior and consequences
- Shown as part of the screening flow (component: `PGSIScreening.jsx`)
- Backend: `backend/app/services/pgsi_scoring_service.py`; schema: `backend/app/schemas/pgsi.py`
- Admin analytics at `/admin/gambling` (page: `GamblingAnalytics.jsx`)

### Screening Flow Steps
Demographics → Consent → ASSIST Intro → Q1 (lifetime use) → Q2-Q7 (per substance) → Q8 (injection) → PHQ-9 → [Triggers if eligible] → PGSI → Results

### Results Page Tabs
📊 Overview → 💊 Substance Use → ⚡ Triggers → 🧠 Mental Health → 🎯 Next Steps

## Key API Endpoints

```
# v2 Validated Instruments
GET  /api/screening/v2/questions
POST /api/screening/v2/submit
GET  /api/screening/v2/should-show-triggers/{session_id}
GET  /api/screening/v2/results/{session_id}

# Chat (hit directly on AI Engine :8449, or proxied via Backend :8448)
POST /api/chat/start-conversation   # Initial greeting (streaming)
POST /api/chat/send                 # Streaming response

# Chat Feedback
POST /api/feedback/submit        # Thumbs up/down on AI messages

# Results Feedback (per-tab rating system)
POST /api/results-feedback/submit
GET  /api/results-feedback/status/{session_id}
GET  /api/results-feedback/tab/{session_id}/{tab_name}

# Token Analytics (AI Engine :8449)
GET  /api/analytics/token-usage/session/{session_id}
GET  /api/analytics/token-usage/global

# Admin (all except /login require Bearer JWT)
POST /api/admin/login
GET  /api/admin/overview            # ?date_from=YYYY-MM-DD&date_to=YYYY-MM-DD (all analytics accept these)
GET  /api/admin/screenings
GET  /api/admin/demographics
GET  /api/admin/users
GET  /api/admin/chat
GET  /api/admin/tokens
GET  /api/admin/crisis              # ?page=1&page_size=20
GET  /api/admin/feedback
GET  /api/admin/export/screenings   # CSV download
GET  /api/admin/export/demographics
GET  /api/admin/export/tokens
GET  /api/admin/export/crisis
POST /api/admin/tokens/record       # Called by AI Engine (no auth, fire-and-forget)
GET  /api/admin/gambling            # PGSI analytics
GET  /api/admin/suggestions         # User improvement suggestions

# User Suggestions
POST /api/suggestions               # Submit improvement suggestion (no auth)
```

## Frontend Architecture

**No global state library** — uses React hooks only. Session ID passed via URL search params (`?session_id=xyz`). Privacy preferences stored in `sessionStorage`.

**Routing** (React Router v6): `/` → Home, `/screening` → Screening, `/results` → Results, `/chat` → Chat

**Admin routes** (all under `/admin`, protected by JWT stored in `localStorage` as `admin_token`):
- `/admin/login` — public login page
- `/admin` → Overview, `/admin/screenings`, `/admin/demographics`, `/admin/users`
- `/admin/chat`, `/admin/tokens`, `/admin/crisis`, `/admin/feedback`
- `/admin/suggestions` — user-submitted improvement suggestions
- `/admin/gambling` — PGSI gambling analytics
- `/admin/share` — QR code generator (uses `VITE_APP_URL` or `window.location.origin`)

**Vite dev proxy**: All `/api` requests proxy to `http://localhost:8448`, so `api.js` uses relative `/api/...` paths. Admin API calls go through `frontend/src/services/adminApi.js` (separate Axios instance with automatic Bearer token attachment and 401→redirect interceptor).

**Key components beyond the screening flow:**
- `ConsentForm.jsx`, `PrivacyModal.jsx`, `PrivacyBanner.jsx` — privacy/consent UI shown before screening
- `pdfGenerator.js` — jsPDF for generating downloadable screening reports
- `triggerLabels.js` — human-readable trigger names/formatting

**Tailwind custom colors** (defined in `tailwind.config.js`):
- `purple` #5B2D91 (primary brand), `teal` #124A66, `blue` #2F80C3
- `green` #7CB342, `orange` #F2992E, `red` #E53935

## AI Agent Architecture

Located in `ai-engine/app/`. Uses LangChain + LangGraph with `create_react_agent` pattern.

**Agent Tools (defined in `routers/chat.py`):**
- `analyze_crisis_risk`: OpenAI-powered crisis detection (IMMEDIATE CRISIS | HIGH RISK | MODERATE CONCERN | LOW CONCERN)
- `get_screening_results`: Retrieves full Q&A (question text + answer), not just scores
- `search_mental_health_resources`: Location-aware Nigerian professional matching
  - Scoring: 10 pts city match, 5 pts state match, 3 pts per specialization, 2 pts affordability
  - Returns 3 professionals + crisis hotlines first

**Guard Rails:**
- System prompts: empathy required, 3-5 sentence minimum, no medical advice
- Crisis → immediate Nigerian hotline display (never delayed)
- Agent explicitly identifies as AI, not human therapist
- Demographics passed for personalization (location-aware responses)
- **PII anonymization** (`backend/app/utils/pii_anonymizer.py`): Strips Nigerian phone numbers (+234/0 prefixes, MTN/Glo/Airtel/9mobile), emails, and names (via `nigerian_names.py` database) from user messages **before** sending to OpenAI

**In-memory session storage:** Chat router stores `SCREENING_CONTEXTS`, `DEMOGRAPHICS_DATA`, `SCREENING_RESPONSES`, `SCREENING_QUESTIONS` in global Python dicts (not the database). These are lost on server restart — known limitation, intended for future migration to DB/cache.

**Token optimization in prompts:**
- Substance info lazy-loaded (only loads substances the user reported)
- WHO Brief Intervention conditionally added for moderate+ ASSIST risk only
- Demographics compressed to pipe-separated format: `Age: 30 | Gender: Male | Location: Lagos, Lagos`

**Key files:**
- `ai-engine/app/agent/chatbot_agent.py` — Agent setup
- `ai-engine/app/prompts/system_prompts.py` — Dynamic prompt builder
- `ai-engine/app/routers/chat.py` — Tools and streaming endpoint
- `ai-engine/app/utils/token_tracking_helper.py` — Token usage logging

## Admin Dashboard

### Authentication
- Credentials from `backend/app/config.py`: `ADMIN_USERNAME` (default `admin`), `ADMIN_PASSWORD` (default `changeme`), `ADMIN_JWT_SECRET` — **all must be overridden in production via `.env`**
- JWT (HS256, 24-hour expiry); `backend/app/utils/admin_auth.py` provides `create_admin_token()` and `verify_admin_token()` FastAPI dependency
- Frontend: `adminApi.js` attaches Bearer token automatically; 401 clears `localStorage` and redirects to `/admin/login`

### Analytics Architecture
- All query logic in `backend/app/services/admin_service.py` (~750 lines)
- `_safe_json()` handles results stored as either dict or JSON string
- `_is_crisis()` checks `crisis_detected`, `suicidal_ideation`, or `crisis_response` action
- `_bucket_age()` groups ages into: Under 18, 18–24, 25–34, 35–44, 45–54, 55+
- Charts use **Recharts** (LineChart, BarChart, PieChart, StackedBar)
- Reusable admin components: `StatCard.jsx` (KPI card), `DateFilter.jsx` (from/to date with refresh)

### Token Usage Tracking
- AI Engine calls `POST /api/admin/tokens/record` (async, 5-second timeout, never fails chat) after each OpenAI response
- Stored in `token_usage` MySQL table: `session_id`, `user_id` (nullable for guests), `input_tokens`, `output_tokens`, `total_tokens`, `model_name`, `estimated_cost_usd` (6 decimal places)
- Implementation: `persist_tokens_to_backend()` in `ai-engine/app/routers/chat.py`

## Scoring Logic

**Hybrid approach:**
1. Logic-based scoring FIRST (deterministic) — `backend/app/utils/scoring.py`
2. AI generates personalized feedback AFTER (empathetic)

**Crisis detection is deterministic:** Any "yes" on crisis questions = IMMEDIATE response, not probabilistic.

## Data Flow

```
User fills screening → Frontend (api.js)
  → POST /api/screening/v2/submit → Backend (:8448)
    → ASSISTScoringService + PHQ9ScoringService + TriggersAnalysisService + PGSIScoringService
    → Results stored in MySQL session (7-day expiry)
  → GET /api/screening/v2/results/{session_id} → Frontend renders Results tabs

User sends chat message → Frontend
  → POST /api/chat/send → Backend (:8448)
    → ai_engine_client.py proxies to AI Engine (:8449)
      → LangGraph agent invokes tools (crisis analysis, resource search)
      → OpenAI (gpt-4o-mini) generates response
    → Full message returned to Frontend
```

## Project Structure

```
frontend/src/
├── components/
│   ├── screening/     # ValidatedScreeningFlow, DemographicsStep, ASSIST*, PHQ9*, Triggers*, ConsentForm, InstrumentProgressBar
│   ├── chatbot/       # ChatInterface, Message, ChatInput
│   ├── privacy/       # PrivacyModal, PrivacyBanner
│   ├── admin/         # StatCard.jsx, DateFilter.jsx
│   └── shared/        # Header, ResultsFeedback
├── pages/
│   └── admin/         # AdminLogin, AdminLayout, Overview, Screenings, Demographics, Users,
│                      # ChatAnalytics, TokenUsage, CrisisLog, Feedback, Suggestions, GamblingAnalytics, ShareApp
├── services/
│   ├── api.js         # Screening/chat communication (Axios, relative /api paths)
│   └── adminApi.js    # Admin API (Axios + Bearer token + 401 interceptor)
├── constants/         # hospitals.js — Nigerian hospital list
└── utils/             # pdfGenerator.js, triggerLabels.js

backend/app/
├── routers/           # screening.py, chat.py, resources.py, feedback.py, results_feedback.py, admin.py,
│                      # improvement_suggestion.py, chat_history.py
├── services/          # assist_scoring, phq9_scoring, triggers_analysis, pgsi_scoring, screening, resource, ai_engine_client, admin_service.py
├── schemas/           # Pydantic models (assist.py, phq9.py, triggers.py, pgsi.py, chat.py, feedback.py, admin.py)
├── models/            # SQLAlchemy models (screening, feedback, results_feedback, token_usage,
│                      # chat_message, user, improvement_suggestion)
├── utils/             # scoring.py, pii_anonymizer.py, nigerian_names.py, admin_auth.py
└── config.py          # ADMIN_USERNAME, ADMIN_PASSWORD, ADMIN_JWT_SECRET

ai-engine/app/
├── agent/             # chatbot_agent.py — LangGraph setup
├── prompts/           # system_prompts.py — dynamic prompt builder
├── routers/           # chat.py (tools + streaming), validated_screening.py, analytics.py
└── utils/             # token_tracking_helper.py, token_estimator.py, hospitals.py
```

## Installation & Setup

### 1. Database Setup

```bash
# Create database
mysql -u root -p -e "CREATE DATABASE mental_health_db;"

# Run schema
mysql -u root -p mental_health_db < database/schema.sql

# Seed data
mysql -u root -p mental_health_db < database/seed_data.sql
```

### 2. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Frontend will run on: http://localhost:5173

### 3. Backend API Setup

```bash
cd backend
python -m venv venv

# Windows
venv\Scripts\activate

# Linux/Mac
source venv/bin/activate

pip install -r requirements.txt

# Update .env file with your database credentials
uvicorn app.main:app --reload --port 8448
```

Backend API will run on: http://localhost:8448

### 4. AI Engine Setup

```bash
cd ai-engine
python -m venv venv

# Windows
venv\Scripts\activate

# Linux/Mac
source venv/bin/activate

pip install -r requirements.txt

# Add your OpenAI API key to .env file
uvicorn app.main:app --reload --port 8449
```

AI Engine will run on: http://localhost:8449

## Environment Variables

### Backend (.env)

```
DATABASE_URL=mysql+pymysql://root:password@localhost/mental_health_db
SECRET_KEY=your_secret_key
ENVIRONMENT=development
CORS_ORIGINS=http://localhost:5173
AI_ENGINE_URL=http://localhost:8449
```

### AI Engine (.env)

```
OPENAI_API_KEY=your_openai_api_key_here
ENVIRONMENT=development
MODEL_NAME=gpt-4o-mini
TEMPERATURE=0.7
MAX_TOKENS=1000
```

### Frontend (.env)

```
VITE_API_BASE_URL=http://localhost:8448
```

## Features

- ✅ Mental health screening assessment
- ✅ AI-powered supportive chatbot
- ✅ Resource matching and referrals
- ✅ Crisis detection and immediate support
- ✅ Privacy-first design (no persistent user data)
- ✅ Responsive and animated UI

## Development

All three services must run simultaneously for the full application to work:

- Frontend: Port 5173
- Backend API: Port 8448
- AI Engine: Port 8449

## License

Private Project
