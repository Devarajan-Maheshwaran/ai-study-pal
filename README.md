# AI Study Pal (StudyForge)

[![Vercel Deployment](https://img.shields.io/badge/Vercel-Deployed-success?logo=vercel&logoColor=white)](YOUR_VERCEL_DEPLOYMENT_URL_PLACEHOLDER)
[![Railway Deployment](https://img.shields.io/badge/Railway-Running-blue?logo=railway&logoColor=white)](YOUR_RAILWAY_BACKEND_URL_PLACEHOLDER)

An end-to-end exam preparation platform powered by high-smartness, 100% offline, local NLP algorithms (no external API keys, zero Hugging Face downloads). 

Upload notes, generate adaptive quizzes, analyze study schedules, track topic mastery, use spaced repetition, and chat with a local AI copilot.

---

## 🚀 Deployment Guide

### Frontend: Vercel
1. Import the repository into [Vercel](https://vercel.com).
2. Set **Root Directory** to `frontend`.
3. Set the Framework Preset to **Vite**.
4. Configure the Environment Variable:
   * `VITE_API_URL` = `https://your-backend-railway-url.railway.app`
5. Click **Deploy**.

### Backend: Railway
1. Create a new service in [Railway](https://railway.app) from this GitHub repository.
2. In the service settings, Railway will automatically find the `Procfile` in the workspace root.
3. Configure the Environment Variables:
   * `PORT` = `5000` (dynamic port assigned by Railway automatically)
   * `CORS_ORIGINS` = `https://your-frontend-vercel-url.vercel.app`
   * `DATABASE_URL` = `postgresql://...` (Highly recommended for persistence, or omit to fall back to transient SQLite)
   * `AUTH_ENABLED` = `false` (Set to `true` if integrating user-specific Supabase auth)
4. Click **Deploy**.

---

## ❓ Do We Need Supabase for a Database?
**No, Supabase is not required.**
* **Development/Simple Setup:** The backend automatically falls back to a local SQLite database (`backend/data/studyforge.db`) if no `DATABASE_URL` is set.
* **Production/Railway Setup:** Because Railway containers have ephemeral disks (data resets on restart), you should use a persistent database. Instead of Supabase, you can simply provision a **PostgreSQL** database directly inside Railway and paste its connection string into `DATABASE_URL`. The SQLAlchemy ORM handles this automatically.
* **Authentication:** The auth middleware integrates with Supabase JWT tokens when `AUTH_ENABLED=true`. If auth is disabled (`AUTH_ENABLED=false`), the app runs smoothly in single-tenant mode using a mock developer user.

---

## 🧠 Local Heuristic & ML Architecture
This platform runs purely offline on your server using optimized mathematical algorithms:
* **Degree Centrality Summarizer:** Computes a sentence cosine-similarity matrix using TF-IDF representation, ranking sentence importance based on network centrality with a square-root length normalization penalty to avoid choosing overly long sentences.
* **Bloom's Taxonomy Classifier:** Classifies quiz difficulties (`easy`, `medium`, `hard`) using custom readability metrics (average word size, sentence complexity) paired with a cognitive verb lookup dictionary.
* **POS-Aligned Distractor Generator:** Creates contextually convincing multiple-choice distractors by matching target Part-Of-Speech (POS) tags, preserving casing, and generating nearby numeric values for digits.
* **TF-IDF Vector Search:** Performs local workspace retrieval by computing cosine-similarities over a TF-IDF vector matrix in-memory, replacing heavy transformer dependencies.

---

## 🛠️ Project Structure
```
├── backend/
│   ├── app.py             # Flask App Factory
│   ├── config.py          # App Configuration
│   ├── db/
│   │   ├── database.py    # Database connection & scoped sessions
│   │   └── models.py      # SQLAlchemy schemas
│   ├── routes/            # Workspace, Quiz, Flashcards, Copilot, & Content blueprints
│   ├── services/          # Local ingestion, retrieval, scheduling, & summary engines
│   └── tests/             # Pytest unit testing suite
├── frontend/
│   ├── src/               # React + TypeScript source code
│   └── vite.config.ts     # Build bundler configurations
├── Procfile               # Railway entrypoint
└── vercel.json            # Vercel monorepo config
```
