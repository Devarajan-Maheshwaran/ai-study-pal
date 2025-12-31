# AI Study Pal

A minimal, production-ready, full-stack AI-powered study assistant for students. Features adaptive quizzes, notes-to-MCQs, revision summaries, resource management, and progress tracking.

## Features
- Adaptive Quiz Generation (ML/DL, trained in Jupyter Notebooks)
- Notes to MCQs (NLP, trained in Notebooks)
- Revision Summarization (NLP, trained in Notebooks)
- Study Resources & Progress Tracking
- Minimal, modern frontend (React + Vite + Tailwind, Aurora background)
- Flask backend, CSV data, REST API

## Project Structure
```
ai-study-pal/
	backend/
		app.py                # Flask app entrypoint
		models/               # Only Jupyter notebooks for model training
		services/             # All backend logic
		data/                 # CSV data files
		tests/                # Pytest API tests
	frontend/
		src/                  # Minimal React app
			components/         # Aurora, Layout, UI primitives
			pages/              # Dashboard, Quiz, Notes→MCQs, Revision, etc.
			lib/                # API logic
			types.ts            # Global types
			config.ts           # Frontend config
		public/               # Static assets
	README.md
	CHECKS.md
```

## Getting Started

### Backend
1. Install Python 3.10+ and create a venv:
	 ```sh
	 python -m venv .venv
	 .venv/Scripts/activate  # Windows
	 source .venv/bin/activate  # Mac/Linux
	 pip install -r backend/requirements.txt
	 ```
2. Run the backend:
	 ```sh
	 python backend/app.py
	 ```

### Frontend
1. Install Node.js (18+ recommended)
2. In `frontend/`:
	 ```sh
	 npm install
	 npm run dev
	 ```

### Model Training
- All ML/DL models are trained in Jupyter notebooks in `backend/models/`.
- Notebooks are self-contained and can be run with Jupyter Lab/Notebook.

### Testing
- Run backend tests:
	```sh
	pytest backend/tests
	```

## Deployment
- Backend: Deploy Flask app (e.g., Gunicorn, Docker, or any WSGI server)
- Frontend: Deploy static build (`npm run build`) to any static host (Vercel, Netlify, etc.)

## Credits
- Built for capstone showcase. All code is minimal, production-ready, and easy to extend.

```
ai-study-pal/
├── backend/
│   ├── app.py                    # Flask API endpoints
│   ├── config.py
│   ├── requirements.txt
│   ├── models/                   # ML models
│   │   ├── quiz_model.py
│   │   ├── summarizer_model.py
│   │   ├── nlp_utils.py
│   │   └── feedback_model.py
│   ├── services/                 # Business logic
│   │   ├── notes_service.py
│   │   ├── subject_service.py
│   │   ├── quiz_service.py
│   │   ├── summary_service.py
│   │   ├── schedule_service.py
│   │   ├── resources_service.py
│   │   └── youtube_service.py
│   ├── data/                     # CSV data storage
│   │   ├── subjects.csv
│   │   ├── resources.csv
│   │   └── user_progress.csv
│   └── tests/
│       └── test_api.py
├── frontend/
│   ├── src/
│   │   ├── components/           # Reusable components
│   │   │   ├── Aurora.tsx        # WebGL background
│   │   │   ├── Layout.tsx        # App shell
│   │   │   └── ui/               # UI components
│   │   ├── pages/                # Page components
│   │   ├── lib/api.ts            # API client
│   │   ├── types/api.ts          # TypeScript types
│   │   ├── App.tsx
│   │   ├── main.tsx
│   │   └── index.css
│   ├── package.json
│   ├── vite.config.ts
│   ├── tailwind.config.js
│   └── postcss.config.js
├── README.md
└── CHECKS.md
```

## Quick Start

### Backend Setup
```bash
cd backend
pip install -r requirements.txt
python app.py
# API available at http://127.0.0.1:5000
```

### Frontend Setup
```bash
cd frontend
npm install
npm run dev
# App available at http://localhost:5173
```

### Testing
```bash
cd backend
pytest tests/
```

## API Endpoints

- `GET /health` - Health check
- `GET /api/subjects` - Get available subjects
- `POST /api/subjects` - Create new subject
- `GET /api/dashboard?user_id=...` - User dashboard data
- `POST /api/notes-to-mcqs` - Generate MCQs from content
- `GET /api/adaptive-quiz?user_id&subject` - Get adaptive quiz
- `POST /api/quiz/submit` - Submit quiz answers
- `POST /api/revision-summary` - Generate text summary
- `GET /api/resources?subject&limit` - Get learning resources
- `GET /api/study-schedule?subject&hours` - Download study schedule CSV

## Features Overview

### 1. Dashboard
- Subject selection and performance overview
- Statistics cards (topics studied, attempts, accuracy)
- Per-subject progress tracking

### 2. Notes to MCQs
- Multi-source input (text, PDF, URL, YouTube)
- Automatic MCQ generation with difficulty classification
- Interactive question display

### 3. Adaptive Quiz
- Dynamic question selection based on user performance
- Real-time progress tracking
- Detailed feedback and explanations

### 4. Revision Summary
- Text summarization using neural networks
- Keyword extraction and study tips
- Subject-specific recommendations

### 5. Resources
- Curated learning materials by subject
- Video, article, and interactive content
- External link integration

### 6. Settings
- User profile management
- Study schedule generation
- Subject management

## ML Models

### Quiz Model
- **LogisticRegression**: Classifies question difficulty (easy/medium)
- **KMeans**: Groups questions by topic clusters
- **MCQ Generation**: Rule-based question creation from text

### Summarizer Model
- **Keras Sequential NN**: Text-to-summary transformation
- **LSTM layers**: Sequence processing for summarization
- **Attention mechanism**: Focus on important content

### NLP Utils
- **NLTK**: Tokenization, POS tagging, keyword extraction
- **Study Tips Generation**: Template-based recommendations
- **Text preprocessing**: Cleaning and normalization

## Deployment

### Backend (Production)
```bash
pip install gunicorn
gunicorn app:create_app() -w 4 -b 0.0.0.0:8000
```

### Frontend (Production)
```bash
npm run build
# Serve dist/ folder with any static server
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Submit a pull request

## License

This project is part of the AI Study Pal capstone project.
