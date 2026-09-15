# Deployment Guide

This document covers two scenarios:

- **Fresh Deployment** — setting up on a new server from scratch
- **Redeployment** — pushing updates to an existing live server

---

## Prerequisites

- MySQL 8.0+
- Python 3.10+ with shared virtualenv at `C:\environments\issup_env` (Windows) or equivalent
- Node.js 18+
- Git

---

## Environment Files

Before starting, ensure these `.env` files exist and are correctly filled:

```
backend/.env
ai-engine/.env
frontend/.env        ← optional, only needed if overriding defaults
```

**`backend/.env` minimum required:**

```
DATABASE_URL=mysql+pymysql://root:YOUR_PASSWORD@localhost/mental_health_db
SECRET_KEY=your-secret-key-here
ENVIRONMENT=production
CORS_ORIGINS=https://your-frontend-domain.com
AI_ENGINE_URL=http://localhost:8449
```

**`ai-engine/.env` minimum required:**

```
OPENAI_API_KEY=your-openai-api-key
ENVIRONMENT=production
MODEL_NAME=gpt-4o-mini
TEMPERATURE=0.8
MAX_TOKENS=1000
```

---

## Fresh Deployment (New Server)

### Step 1 — Create the Database

```sql
mysql -u root -p -e "CREATE DATABASE mental_health_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
```

### Step 2 — Create All Tables

```bash
cd backend
C:\environments\issup_env\Scripts\activate    # Windows
# source /path/to/venv/bin/activate           # Linux/Mac

python migrate.py
```

This creates all 6 tables in the correct structure:

- `screening_questions`
- `screening_sessions`
- `users`
- `chat_messages`
- `chat_feedback`
- `results_feedback`

### Step 3 — Seed Question Data

```bash
python migrate.py --seeds
```

This loads all WHO ASSIST V3.0, PHQ-9, and Triggers assessment questions (~164 items).

### Step 4 — Install Backend Dependencies

```bash
pip install -r requirements.txt
```

### Step 5 — Install AI Engine Dependencies

```bash
cd ../ai-engine
pip install -r requirements.txt
```

### Step 6 — Install Frontend Dependencies and Build

```bash
cd ../frontend
npm install
npm run build
```

### Step 7 — Start the Services

**Option A — Direct (development/testing):**

```bash
# Terminal 1 — Backend API
cd backend
uvicorn app.main:app --host 0.0.0.0 --port 8448

# Terminal 2 — AI Engine
cd ai-engine
uvicorn app.main:app --host 0.0.0.0 --port 8449

# Terminal 3 — Frontend (dev only)
cd frontend
npm run dev
```

**Option B — Docker (backend + ai-engine only):**

```bash
docker-compose up --build -d
```

> Note: Frontend is NOT in docker-compose. Run it separately or serve the build via a web server (Nginx, etc.)

### Step 8 — Verify

```bash
curl http://localhost:8448/health    # → {"status": "healthy"}
curl http://localhost:8449/health    # → {"status": "healthy"}
```

---

## Redeployment (Existing Live Server)

Use this when pushing code changes to a server that is already running.

### Step 1 — Pull Latest Code

```bash
git pull origin main
```

### Step 2 — Install Any New Dependencies

```bash
# Backend / AI Engine (if requirements.txt changed)
pip install -r backend/requirements.txt
pip install -r ai-engine/requirements.txt

# Frontend (if package.json changed)
cd frontend && npm install
```

### Step 3 — Rebuild Frontend (if frontend changed)

```bash
cd frontend && npm run build
```

### Step 4 — Restart Services

**If using Docker:**

```bash
docker-compose up --build -d
```

**If running directly:**

```bash
# Restart backend and ai-engine processes
# (use your process manager: systemd, supervisor, pm2, etc.)
```

> The database is NOT touched during redeployment. `migrate.py` only creates tables that don't exist — it never drops or alters existing ones, so your data is safe.

---

## Database Notes

### What `python migrate.py` does

- Reads all SQLAlchemy models and creates any missing tables
- Safe to run on an existing database — it will not drop, alter, or delete anything
- Does NOT re-run seeds — run `python migrate.py --seeds` separately only on a fresh DB

### Migration History (for reference only)

Historical SQL migration files are in `backend/database/migrations/`. These document how the live database was upgraded over time. **Do NOT run these on a fresh deployment** — `migrate.py` already incorporates all their changes.

| File                                        | What it did                                                              |
| ------------------------------------------- | ------------------------------------------------------------------------ |
| `001_refactor_to_validated_instruments.sql` | Replaced legacy screening questions with ASSIST/PHQ-9/Triggers structure |
| `002_add_chat_feedback_table.sql`           | Added `chat_feedback` table                                              |
| `003_add_results_feedback_table.sql`        | Added `results_feedback` table                                           |
| `004_add_users_and_chat_history.sql`        | Added `users` table, `chat_messages` table, `user_id` FK                 |
| `005_make_expires_at_nullable.sql`          | Made `expires_at` nullable for registered users                          |

### Original Schema (for reference only)

`backend/database/schema.sql` is kept as a historical reference showing the original database structure. **Do NOT run it** — it is outdated and will create the wrong structure.

---

## Troubleshooting

| Error                              | Cause                         | Fix                                                   |
| ---------------------------------- | ----------------------------- | ----------------------------------------------------- |
| `Access denied for user`           | Wrong DB credentials          | Check `DATABASE_URL` in `backend/.env`                |
| `Column expires_at cannot be null` | Running old schema on live DB | Run `005_make_expires_at_nullable.sql` on the live DB |
| `Table X doesn't exist`            | Tables not created            | Run `python migrate.py`                               |
| `No questions returned`            | Seeds not loaded              | Run `python migrate.py --seeds`                       |
| `OpenAI error`                     | Missing or invalid API key    | Check `OPENAI_API_KEY` in `ai-engine/.env`            |
| CORS error in browser              | Wrong CORS origins            | Check `CORS_ORIGINS` in `backend/.env`                |
