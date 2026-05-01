# AI Study Pal

> An AI-powered adaptive study assistant built as a full-stack capstone project, combining 10 trained ML/NLP models with a React dashboard and Flask API backend.

[![Live Demo](https://img.shields.io/badge/Live%20Demo-Vercel-black?logo=vercel)](https://ai-study-pal.vercel.app)
[![Backend](https://img.shields.io/badge/Backend-Railway-purple)](https://railway.app)
[![Python](https://img.shields.io/badge/Python-3.10-blue?logo=python)](https://python.org)
[![React](https://img.shields.io/badge/React-18-61DAFB?logo=react)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript)](https://www.typescriptlang.org)

## What It Does

The system lets a student work inside **subject-based workspaces** — paste notes, upload PDFs, or use YouTube links, then:
- Generate AI summaries and topic keywords
- Auto-generate MCQs with difficulty classification
- Take adaptive quizzes where difficulty adjusts in real time
- Automatically compute knowledge tracing, exam predictions, and concept difficulty from quiz history
- Get personalized study schedules weighted toward weak topics
- Receive curated resource recommendations matched to their performance

## Trained Models (Jupyter Notebooks)

| Notebook | Model | Used By |
|---|---|---|
| NB03 | Quiz Difficulty Classifier (LogisticRegression) | Quiz Service |
| NB04 | Topic Clustering + Extraction (LDA + TF-IDF) | Topic Service |
| NB05 | Text Summarizer (TF-IDF sentence ranking) | Summary Service |
| NB06 | Feedback Generator (score-pattern model) | Feedback Service |
| NB07 | Knowledge Tracing (BKT-inspired) | `/api/quiz/submit` |
| NB08 | Exam Score Predictor (regression) | `/api/quiz/submit` |
| NB09 | Study Time Optimizer | `/api/study-schedule` |
| NB10 | Concept Difficulty Ranker | `/api/progress` |
| NB11 | Resource Recommender | `/api/resources` |
| NB12 | Evaluation Dashboard | Progress Analytics UI |

## Tech Stack

**Frontend:** React 18, TypeScript, Vite, Tailwind CSS, shadcn/ui, Recharts, React Router v6, TanStack Query

**Backend:** Python, Flask, Flask-CORS, scikit-learn, NLTK, PyMuPDF, Gunicorn

**Deploy:** Frontend → Vercel | Backend → Railway

## Project Structure

```
ai-study-pal/
├── backend/
│   ├── models/          # Trained ML models (NB03-NB12)
│   ├── services/        # API service layer
│   ├── data/            # Training datasets + quiz_history.json
│   ├── app.py           # Flask application factory
│   └── Procfile         # Railway deployment
├── frontend/
│   ├── src/
│   │   ├── pages/       # LandingPage + UnifiedDashboard
│   │   ├── components/  # Feature sections (Summarizer, MCQ, Quiz, Progress...)
│   │   ├── hooks/       # useAppState context
│   │   └── lib/         # apiClient.ts
│   └── vercel.json      # Vercel SPA routing config
└── notebooks/           # Training notebooks NB01-NB12
```

## Local Setup

```bash
# Backend
cd backend
pip install -r requirements.txt
python app.py

# Frontend
cd frontend
npm install
cp ../.env.example .env.local   # fill in VITE_API_BASE_URL
npm run dev
```

## Key Design Decision

All advanced analytics (knowledge tracing, exam prediction, concept difficulty, feedback) run **automatically from quiz submission history** — not from manual user inputs. After 10+ quiz answers, the dashboard unlocks full AI-driven insights.

## Author

Devarajan Maheshwaran — [GitHub](https://github.com/Devarajan-Maheshwaran)
