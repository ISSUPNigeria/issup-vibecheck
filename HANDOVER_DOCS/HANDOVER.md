# ISSUP — Project Handover Document

This document is written for the incoming technical team taking ownership of the ISSUP Mental Health Screening & Support Platform. It explains what the product is, how it is built, how its parts connect, and what you need to know before you deploy or operate it.

---

## 1. What This Product Does

ISSUP is a web application that helps people in Nigeria screen themselves for mental health and substance use concerns. It is designed to be stigma-free, anonymous, and accessible — no account is required to use the core features.

### What a user experiences

1. They visit the website and answer questions about their demographics (age, state, gender, etc.)
2. They give consent and complete a series of validated screening questionnaires
3. They receive a personalized results report with scores, risk levels, and recommendations
4. They can then talk to an AI-powered chatbot that has read their results and can support them
5. The chatbot can refer them to nearby Nigerian mental health professionals and crisis lines

### Screening instruments used

| Instrument | Purpose | Questions |
|---|---|---|
| WHO ASSIST V3.0 | Substance use across 10 categories | 71 adaptive questions |
| PHQ-9 | Depression severity | 9 questions |
| Triggers Assessment | Emotional/situational relapse triggers | 82 items (conditional) |
| PGSI | Problem gambling severity | 9 questions |

The Triggers Assessment only appears if the user scores moderate or above on ASSIST or PHQ-9.

### Crisis safety

The system has hard-coded, deterministic crisis detection. If a user answers positively to PHQ-9 Question 9 (suicidal ideation), the app immediately shows Nigerian crisis hotlines — this is not handled by AI, it is logic-based and cannot be skipped.

### Admin dashboard

There is a password-protected admin dashboard at `/admin` that shows:
- Screening analytics and demographics
- AI chat quality and token cost tracking
- Crisis flag logs
- User feedback and improvement suggestions
- PGSI gambling analytics
- CSV data exports
- QR code generator for sharing the app

---

## 2. The Tech Stack

### Frontend
- **React 18** with **Vite 5** (build tool)
- **Tailwind CSS** for styling
- **React Router v6** for navigation
- **Axios** for API calls
- **Recharts** for admin dashboard charts
- **jsPDF** for downloadable screening reports
- No global state library — pure React hooks throughout

### Backend API
- **Python 3.11** with **FastAPI**
- **SQLAlchemy 2.0** as the ORM
- **PyMySQL** as the MySQL driver
- **Uvicorn** as the ASGI web server
- **python-jose** for JWT authentication
- **passlib + bcrypt** for password hashing
- **httpx** for proxying requests to the AI Engine

### AI Engine
- **Python 3.11** with **FastAPI**
- **OpenAI** (model: `gpt-4o-mini`) as the language model
- **LangChain + LangGraph** (`create_react_agent` pattern) as the agent framework
- **Uvicorn** as the ASGI web server

### Database
- **MySQL 8.0**
- 7 tables: `users`, `screening_sessions`, `screening_questions`, `chat_messages`, `chat_feedback`, `results_feedback`, `token_usage`

### Infrastructure (as originally deployed)
- Backend and AI Engine containerised with **Docker**
- Orchestrated with **docker-compose**
- Frontend built as static files and served separately
- MySQL running externally (not containerised)

---

## 3. System Architecture

The application has three services. They must all be running for the product to work correctly.

```
┌─────────────────────────────────────────────────────┐
│                  User's Browser                     │
│              React SPA (Frontend)                   │
│         Served as static files via Nginx            │
└──────────────────────┬──────────────────────────────┘
                       │  All /api/* requests
                       ▼
┌─────────────────────────────────────────────────────┐
│              Backend API  (Port 8448)               │
│                    FastAPI                          │
│  - Screening submission and scoring                 │
│  - Session/results stored in MySQL                  │
│  - Admin dashboard API + JWT auth                   │
│  - PII anonymization before sending to OpenAI       │
│  - Proxies chat requests → AI Engine                │
└───────────────────────┬─────────────────────────────┘
          MySQL ◄────── │ ──────► AI Engine (Port 8449)
          (Port 3306)   │         FastAPI + LangGraph
                        │         - LLM Agent
                        │         - OpenAI gpt-4o-mini
                        │         - Crisis detection tool
                        │         - Resource search tool
                        │         - Token usage tracking
                        ▼
                   OpenAI API
                  (external cloud)
```

### Key communication rules

- The **frontend never talks directly to the AI Engine**. All requests go through the Backend.
- The **Backend proxies chat messages** to the AI Engine via `ai_engine_client.py`.
- After each AI response, the **AI Engine calls back to the Backend** to record token usage (`POST /api/admin/tokens/record`). This is a background call — it never blocks the user.
- **MySQL is not inside Docker** — it runs on the host machine or a managed database service.
- **The frontend is not inside Docker** — it is built as static HTML/CSS/JS files and served by a web server like Nginx.

---

## 4. Port Reference

| Service | Port | Notes |
|---|---|---|
| Frontend (Nginx/static) | 80 / 443 | Served by web server in production |
| Backend API | 8448 | Docker container |
| AI Engine | 8449 | Docker container |
| MySQL | 3306 | External, on host or managed service |

---

## 5. Important Architectural Notes

These are things that will cause confusion if you are not aware of them.

### 5.1 AI Engine session memory is in-memory only

The AI Engine stores active chat sessions (screening context, demographics, conversation history) in Python dictionaries inside the process. This means:

- If the AI Engine container restarts, all active chat sessions are lost
- Users mid-conversation will lose context
- This is a known, intentional limitation — the original plan was to migrate this to the database in a future phase
- It does not affect screening results, which are always stored in MySQL

### 5.2 Admin credentials have insecure defaults

The backend ships with these defaults if you do not set them in `.env`:
- Username: `admin`
- Password: `changeme`

**You must override these before going live.** See the Credentials Checklist for details.

### 5.3 PII anonymization happens in the Backend

Before any user message reaches OpenAI, the Backend strips Nigerian phone numbers, email addresses, and names from the text. This happens in `backend/app/utils/pii_anonymizer.py`. This is a privacy protection — OpenAI never sees real user PII.

### 5.4 Crisis detection is deterministic, not AI

PHQ-9 Question 9 (suicidal ideation) being answered positively triggers an immediate crisis response in the scoring logic. The AI is not involved in this decision. The crisis hotlines shown are hardcoded Nigerian numbers — never change these to non-Nigerian numbers.

### 5.5 The Vite proxy is development-only

During development, Vite proxies all `/api` requests from the frontend to `http://localhost:8448`. In production, this proxy does not exist. You must configure **Nginx** (or equivalent) to proxy `/api` requests to the Backend container.

---

## 6. Data Stored

| Table | What it holds |
|---|---|
| `screening_sessions` | Every completed screening (demographics, responses, scores, results as JSON) |
| `screening_questions` | The 164 question bank seeded at setup (ASSIST + PHQ-9 + Triggers) |
| `users` | Optional registered accounts (nickname, email, hashed password) |
| `chat_messages` | Conversation history for registered users only |
| `chat_feedback` | Thumbs up/down ratings on AI responses |
| `results_feedback` | Tab-level ratings on screening results |
| `token_usage` | OpenAI token consumption per session (for cost tracking) |

Guest sessions expire after 7 days. Registered user data is stored permanently.

---

## 7. The Codebase Layout

```
ISSUP/
├── frontend/               React + Vite application
│   ├── src/
│   │   ├── pages/          Route-level pages (Home, Screening, Results, Chat, Admin/*)
│   │   ├── components/     Reusable UI components
│   │   ├── services/       api.js (main app), adminApi.js (admin panel)
│   │   └── utils/          pdfGenerator.js, triggerLabels.js
│   ├── package.json
│   └── vite.config.js
│
├── backend/                FastAPI backend
│   ├── app/
│   │   ├── main.py         Entry point, router registration, CORS
│   │   ├── config.py       All environment variable definitions
│   │   ├── database.py     SQLAlchemy engine and session setup
│   │   ├── models/         SQLAlchemy table models
│   │   ├── routers/        API route handlers
│   │   ├── services/       Business logic (scoring, admin analytics, AI proxy)
│   │   ├── schemas/        Pydantic request/response models
│   │   └── utils/          PII anonymizer, admin auth, scoring helpers
│   ├── migrate.py          Database setup script
│   ├── requirements.txt
│   └── Dockerfile
│
├── ai-engine/              AI chatbot engine
│   ├── app/
│   │   ├── main.py         Entry point
│   │   ├── config.py       Environment variable definitions
│   │   ├── agent/          LangGraph agent setup
│   │   ├── prompts/        Dynamic system prompt builder
│   │   ├── routers/        chat.py (agent tools + endpoints), analytics.py
│   │   └── utils/          Token tracking, hospital data
│   ├── requirements.txt
│   └── Dockerfile
│
├── docker-compose.yml      Runs backend + ai-engine containers
├── HANDOVER/               This documentation package
├── DEPLOY.md               Original deployment guide
└── README.md               Full technical reference
```

---

*Document prepared during project handover — August 2026.*
