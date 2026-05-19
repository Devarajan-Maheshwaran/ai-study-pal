# StudyForge — AI Study Pal

[![Vercel Deployment](https://img.shields.io/badge/Vercel-Deployed-success?logo=vercel&logoColor=white)](YOUR_VERCEL_DEPLOYMENT_URL_PLACEHOLDER)
[![Railway Deployment](https://img.shields.io/badge/Railway-Running-blue?logo=railway&logoColor=white)](YOUR_RAILWAY_BACKEND_URL_PLACEHOLDER)
[![Tests](https://img.shields.io/badge/pytest-passing-brightgreen?logo=pytest)](backend/tests/)

StudyForge is a full-stack AIML exam prep platform that demonstrates how to design, train, evaluate, and deploy small NLP models in a production-style system. It uses TF-IDF-based graph summarization, Bloom's taxonomy difficulty classification, POS-aligned distractor generation, and TF-IDF retrieval — all implemented from scratch, served via a Flask API, and surfaced through a modern React + Vite dashboard.

> **No external LLM APIs. No Hugging Face downloads. 100% offline inference.**

---

## ML Lifecycle at a Glance

| Stage | What happens |
|---|---|
| **Data** | Raw student notes → sentence-tokenized, cleaned, TF-IDF vectorized |
| **Models** | Summarizer, Difficulty Classifier, Distractor Generator, Retrieval Index, BKT Mastery |
| **Algorithm design** | Degree centrality, Bloom verb maps, POS alignment, Hidden Markov BKT |
| **Evaluation** | ROUGE-1/L (summarizer), Accuracy + Macro-F1 + Confusion Matrix (classifier), POS match rate (distractors) |
| **Serving** | Flask blueprints → SQLAlchemy → Vercel + Railway |

---

## Evaluation Results

Run the full eval suite:
```bash
cd backend
pytest tests/test_summarizer_eval.py tests/test_difficulty_eval.py tests/test_distractor_eval.py -v -s
```

### Summarizer (ROUGE vs first-N baseline)
| Metric | Model | Baseline (first-N) |
|---|---|---|
| ROUGE-1 (avg) | ≥ 0.38 | ~0.30 |
| ROUGE-L (avg) | ≥ 0.35 | ~0.28 |

### Difficulty Classifier (15-question labeled set)
| Metric | Value |
|---|---|
| Accuracy | ≥ 0.67 |
| Macro-F1 | ≥ 0.60 |

### Distractor Generator
| Metric | Value |
|---|---|
| POS match rate | ≥ 40% |
| No-collision rate | 100% |
| Uniqueness | 100% |

---

## Architecture

```
Frontend (Vercel)          Backend (Railway)              ML / Heuristic Engine
React + TypeScript   →    Flask app factory          →   services/
+ Vite                     blueprints (routes/)            summarizer   (TF-IDF centrality)
+ Supabase auth            SQLAlchemy ORM                  difficulty   (Bloom classifier)
                           db/models.py                    distractors  (POS-aligned)
                                                           retrieval    (TF-IDF VSM)
                                                           mastery      (Bayesian KT)
                                                           embeddings   (pluggable)
```

## Project Structure

```
├── backend/
│   ├── app.py                     # Flask app factory
│   ├── config.py                  # Env-based config
│   ├── pytest.ini                 # Pytest config
│   ├── db/
│   │   ├── database.py            # Engine, scoped session
│   │   └── models.py              # ORM schemas (7 tables)
│   ├── routes/                    # Flask blueprints
│   ├── services/
│   │   ├── summary_service.py     # Degree centrality summarizer
│   │   ├── difficulty_service.py  # Bloom's taxonomy classifier ← Phase 4
│   │   ├── distractor_service.py  # POS-aligned distractor gen  ← Phase 4
│   │   ├── retrieval_service.py   # TF-IDF vector search
│   │   ├── mastery_service.py     # Bayesian Knowledge Tracing  ← Phase 6
│   │   ├── embedding_service.py   # Pluggable embeddings        ← Phase 6
│   │   ├── schedule_service.py    # Study plan generator
│   │   ├── copilot_service.py     # Local AI copilot
│   │   └── ingestion_service.py   # Document ingestion
│   ├── models/
│   │   ├── quiz_model.py          # MCQ generator
│   │   ├── nlp_utils.py           # Shared NLP utilities
│   │   └── *_training.ipynb       # Evaluation notebooks
│   └── tests/
│       ├── test_models_unit.py    # Fast unit tests  ← Phase 5
│       ├── test_summarizer_eval.py  # ROUGE evaluation
│       ├── test_difficulty_eval.py  # F1 + confusion matrix
│       ├── test_distractor_eval.py  # POS match rate
│       ├── test_quiz_generation.py
│       └── test_api.py
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   └── components/
│   └── vite.config.ts
├── Procfile                       # Railway entrypoint
└── vercel.json                    # Vercel monorepo config
```

---

## Environment Variables

### Backend (Railway)

| Variable | Required | Description |
|---|---|---|
| `FLASK_SECRET_KEY` | ✅ | Long random string |
| `DATABASE_URL` | ✅ prod | Postgres URL; falls back to SQLite if blank |
| `CORS_ORIGINS` | ✅ | Comma-separated allowed origins |
| `SUPABASE_URL` | Auth only | Supabase project URL |
| `SUPABASE_SERVICE_KEY` | Auth only | Supabase service role key |
| `AUTH_ENABLED` | ❌ | `true` to enforce JWT auth (default `false`) |
| `USE_SENTENCE_TRANSFORMERS` | ❌ | `true` to use ST embeddings (default TF-IDF) |
| `EMBEDDING_MODEL` | ❌ | ST model name (default `all-MiniLM-L6-v2`) |

### Frontend (Vercel)

| Variable | Required | Description |
|---|---|---|
| `VITE_SUPABASE_URL` | Auth only | Supabase project URL |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Auth only | Supabase anon/public key |
| `VITE_API_BASE_URL` | ✅ | Railway backend URL |

---

## Local Development

```bash
# Backend
cd backend
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env   # then fill in values
python app.py

# Frontend
cd frontend
npm install
cp .env.example .env.local   # then fill in values
npm run dev
```

## Running Tests

```bash
cd backend

# Fast unit tests only
pytest -m unit

# Full eval suite with metric output
pytest tests/test_summarizer_eval.py tests/test_difficulty_eval.py tests/test_distractor_eval.py -v -s

# Everything
pytest
```

---

## Deployment

### Supabase (database + optional auth)
1. Create project at [supabase.com](https://supabase.com)
2. Copy **Project URL** → `SUPABASE_URL` + `VITE_SUPABASE_URL`
3. Copy **service_role key** → `SUPABASE_SERVICE_KEY`
4. Copy **anon key** → `VITE_SUPABASE_PUBLISHABLE_KEY`
5. Copy **connection string** → `DATABASE_URL`
6. Tables auto-create on first boot — no SQL migration needed

### Railway (backend)
1. Connect GitHub repo, set root dir = `/`
2. Railway detects `Procfile` automatically
3. Set env vars from the table above
4. Add a volume at `/app/data` for ChromaDB persistence
5. Copy the public Railway URL → `VITE_API_BASE_URL` + `CORS_ORIGINS`

### Vercel (frontend)
1. Import repo, set **Root Directory** = `frontend`, preset = **Vite**
2. Set env vars from the table above
3. `vercel.json` handles monorepo routing automatically

---

## Local AI Copilot

The copilot uses TF-IDF retrieval to pull relevant chunks from your uploaded notes, then applies the summarizer + template prompts to produce a structured explanation — no LLM, no API call.

Optionally, set `USE_SENTENCE_TRANSFORMERS=true` to upgrade the retrieval layer to a local `sentence-transformers` model for higher semantic recall. The calling code is identical — only the embedding backend switches.

---

## Heuristic Algorithms

### Degree Centrality Summarizer
Sentences are vectorized with TF-IDF and a cosine similarity matrix is computed. Each sentence's degree centrality (sum of similarities to all others) is penalized by √length to avoid selecting overly long sentences. Top-k are returned in original order.

### Bloom's Taxonomy Difficulty Classifier
A hybrid of cognitive verb mapping (define/list → easy, explain/compare → medium, evaluate/derive → hard) and lexical features (avg word length, type-token ratio, syllable density, long-word ratio). Returns label + confidence + full feature breakdown.

### POS-Aligned Distractor Generator
The correct answer is POS-tagged; distractors are selected from the passage vocabulary to match the same POS group and casing. Numeric answers get ±10% and ±25% boundary distractors. Prevents trivially wrong options.

### TF-IDF Vector Search
Each workspace builds an in-memory TF-IDF matrix over document chunks. Queries are vectorized and matched via cosine similarity. Powers the copilot, grounded quiz generation, and the pluggable embedding service.

### Bayesian Knowledge Tracing
A two-state HMM per topic. Parameters: p_init=0.30, p_learn=0.20, p_slip=0.10, p_guess=0.20. Each quiz attempt updates the mastery probability via Bayes rule + learning transition. Output: mastery score (0–1), label (mastered/learning/struggling), and trend (improving/flat/declining).
