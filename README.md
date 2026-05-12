# StudyForge — AI Study Operating System

> Transform notes, PDFs, and lectures into adaptive quizzes, personalized revision plans, and an AI copilot grounded in your own learning history.

![StudyForge](https://img.shields.io/badge/status-active-brightgreen) ![Python](https://img.shields.io/badge/python-3.13-blue) ![React](https://img.shields.io/badge/react-18-61DAFB) ![License](https://img.shields.io/badge/license-MIT-green)

## What It Does

StudyForge is not a quiz app or a chatbot. It is an **adaptive learning operating system** that closes the loop between content ingestion, assessment, diagnosis, and planning.

1. **Upload** notes, PDFs, or YouTube links
2. **Get** summaries, keywords, and topic extraction automatically
3. **Take** adaptive MCQ quizzes generated from your material
4. **Track** knowledge state, weak topics, and exam readiness over time
5. **Ask** the Jarvis-style copilot for targeted study advice based on your actual performance

## Architecture

```
React 18 + TypeScript (Vite) ── Vercel
        │
        ▼
Flask API Gateway ─────────── Railway
        │
        ├── NLP Models (TF-IDF, sklearn)
        ├── Quiz Engine (difficulty classifier)
        ├── Knowledge Tracing (BKT-inspired)
        ├── Exam Score Predictor
        ├── Study Schedule Generator
        ├── Resource Recommender
        └── Gemini-powered Copilot
```

## ML Models

| Model | Algorithm | Purpose |
|---|---|---|
| Quiz Difficulty Classifier | Logistic Regression | easy/medium/hard labels |
| MCQ Generator | TF-IDF + Fill-in-blank | Question generation |
| Summarizer | TF-IDF sentence scoring | Extractive summaries |
| Knowledge Tracer | BKT-inspired scoring | Ability estimation |
| Exam Score Predictor | Accuracy + consistency | Score forecasting |
| Concept Difficulty Ranker | Per-topic accuracy | Weak topic detection |
| Resource Recommender | Rule-based + accuracy | Adaptive resources |

## Tech Stack

**Frontend:** React 18, TypeScript, Vite, Tailwind CSS, shadcn/ui, Recharts, TanStack Query, React Router v6

**Backend:** Python 3.13, Flask 2.3, scikit-learn 1.6, NLTK, PyMuPDF, youtube-transcript-api, Google Generative AI

**Deployment:** Vercel (frontend) + Railway (backend)

## Local Development

### Backend
```bash
cd backend
python -m venv venv
venv\Scripts\activate  # Windows
source venv/bin/activate  # Mac/Linux
pip install -r requirements.txt
python app.py
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

Backend runs on `http://localhost:5000`, frontend on `http://localhost:5173`.

## Environment Variables

Create `backend/.env`:
```
GEMINI_API_KEY=your_gemini_api_key
YOUTUBE_API_KEY=your_youtube_api_key  # optional
```

Create `frontend/.env`:
```
VITE_API_BASE_URL=http://127.0.0.1:5000/api
```

## Deployment

- **Frontend → Vercel:** Connect repo, set `VITE_API_BASE_URL` to your Railway backend URL
- **Backend → Railway:** Connect repo, set root to `backend/`, add env vars
