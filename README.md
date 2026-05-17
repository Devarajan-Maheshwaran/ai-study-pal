# StudyForge — AI Study Platform

An end-to-end exam preparation platform powered by on-device ML models (no external AI API).
Upload notes → auto-summarize → generate adaptive quizzes → track mastery → predict exam score.

## Tech Stack

| Layer | Stack |
|---|---|
| Frontend | React 18, TypeScript, Vite, Tailwind CSS, TanStack Query, React Router v6 |
| Backend | Python 3.11, Flask 3, SQLAlchemy 2, Supabase Postgres |
| Vector DB | ChromaDB (local persistent) |
| Embeddings | `all-MiniLM-L6-v2` via sentence-transformers (100% local) |
| ML Models | scikit-learn + NLTK (NB01–NB10 notebook models) |
| Deploy | Vercel (frontend) + Railway / Render (backend) |

## Project Structure

```
├── frontend/          # Vite + React app
│   ├── src/
│   │   ├── components/forge/   # Design system components
│   │   ├── pages/              # 8 workspace pages
│   │   ├── hooks/useWorkspace.ts
│   │   └── lib/api.ts          # Typed API client
│   └── vercel.json
├── backend/
│   ├── app.py                  # Flask factory
│   ├── config.py
│   ├── db/
│   │   ├── database.py         # SQLAlchemy engine (Supabase / SQLite fallback)
│   │   ├── models.py           # ORM: workspaces, topics, documents, quizzes, attempts
│   │   └── migrate.py          # One-time table creation
│   ├── routes/
│   │   ├── workspaces.py       # CRUD + /ingest
│   │   ├── quiz.py             # generate, submit, history
│   │   ├── content.py          # summarize, progress, weak-topics, raw-text
│   │   ├── copilot.py          # chat + planner
│   │   └── flashcards.py       # SM-2 spaced repetition
│   ├── services/
│   │   ├── ingestion_service.py   # PDF/text/YouTube → chunk → embed → ChromaDB
│   │   ├── retrieval_service.py   # Vector search
│   │   ├── copilot_service.py     # Context-aware responses (no LLM API)
│   │   └── ...                    # summary, schedule, resources
│   └── models/                    # scikit-learn ML models
```

## Local Setup

### 1. Backend

```bash
cd backend
python -m venv .venv && source .venv/bin/activate   # Windows: .venv\Scripts\activate
pip install -r requirements.txt

# Copy env template and fill in values
cp .env.example .env

# Create DB tables (SQLite by default, Postgres if DATABASE_URL is set)
python -m backend.db.migrate

# Start dev server
python app.py
# → running on http://localhost:5000
```

### 2. Frontend

```bash
cd frontend
npm install
cp .env.example .env          # sets VITE_API_URL=http://localhost:5000
npm run dev
# → running on http://localhost:5173
```

## Supabase Setup (for production)

1. Create a project at [supabase.com](https://supabase.com)
2. Go to **Settings → Database** → copy the connection string
3. Add to `backend/.env`:
   ```
   DATABASE_URL=postgresql://postgres:<password>@db.<ref>.supabase.co:5432/postgres
   SUPABASE_URL=https://<ref>.supabase.co
   SUPABASE_SERVICE_KEY=<service_role_key>
   ```
4. Run `python -m backend.db.migrate` once to create all tables

## Vercel Deploy (frontend)

1. Import repo at [vercel.com/new](https://vercel.com/new)
2. Set **Root Directory** → `frontend`
3. Framework preset: **Vite** | Build: `npm run build` | Output: `dist`
4. Add env var: `VITE_API_URL=https://your-backend.railway.app`
5. Deploy — every push to `main` auto-deploys

## Backend Deploy (Railway / Render)

```bash
# Railway (recommended)
railway login
railway init
railway up
# Set all env vars from .env.example in Railway dashboard
```

The `Procfile` is already configured:
```
web: gunicorn 'backend.app:create_app()' --bind 0.0.0.0:$PORT --workers 2 --timeout 120
```

## Features

| Feature | Model used |
|---|---|
| Text summarizer | Extractive NLP (TF-IDF + sentence scoring) |
| Keyword extraction | TF-IDF |
| MCQ generation | N-gram + distractor selection |
| Difficulty classifier | Naive Bayes (NB01) |
| Adaptive quiz ordering | Ability-based sort (NB04) |
| Exam score prediction | Rolling accuracy + consistency score |
| Spaced repetition | SM-2 algorithm |
| Semantic search | all-MiniLM-L6-v2 + ChromaDB |
| Copilot responses | Intent detection + context injection (no LLM API) |
