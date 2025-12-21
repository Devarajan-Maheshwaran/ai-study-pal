# backend/app.py
"""
AI Study Pal - Flask Backend

Main Flask application that integrates all AI/ML services:
1. Quiz generation (ML: LogisticRegression)
2. Text summarization (DL: Keras)
3. NLP (keyword extraction, tips, resources)
4. Feedback generation
5. Study plan generation

Startup flow:
1. Initialize Flask app
2. Load all trained models and databases
3. Initialize all AI services
4. Register API routes
5. Start development server on http://127.0.0.1:5000

API Endpoints:
- GET  /api/ping                  - Health check
- POST /api/generate-quiz         - Generate quiz by topic
- POST /api/summarize             - Summarize text
- POST /api/extract-keywords      - Extract keywords from text
- POST /api/study-tips            - Get study tips from keywords
- POST /api/resources             - Get learning resources
- POST /api/feedback              - Generate motivational feedback
- POST /api/performance-metrics   - Calculate performance stats
- POST /api/generate-study-plan   - Generate AI study plan
- GET  /api/available-topics      - Get all quiz topics
- GET  /api/available-subjects    - Get all study plan subjects
- POST /api/study-plan-csv        - Download study plan as CSV
- POST /api/generate-mcqs         - Generate MCQs from text
- POST /api/log-quiz-result       - Log quiz result for user
- GET  /api/generate-learning-path - Generate personalized learning path
- POST /api/suggest-resources     - Suggest learning resources by subject
"""

import os
from flask import Flask, jsonify, request, send_file
from flask_cors import CORS
import io

# Import all AI services
from services import (
    quiz_service,
    summarizer_service,
    nlp_service,
    feedback_service,
    study_plan_service,
    mcq_generator,
    learning_path,
    resource_suggester,
)

# Initialize Flask app
app = Flask(__name__)
CORS(app)  # Enable CORS for React frontend development

# ============================================================================
# CONFIGURATION
# ============================================================================

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT = os.path.dirname(BASE_DIR)

DATA_PATH = os.path.join(PROJECT_ROOT, "data", "quiz", "quiz_samples.csv")
MODELS_DIR = os.path.join(BASE_DIR, "models")

# ============================================================================
# STARTUP: Initialize all AI services
# ============================================================================

def initialize_services():
    """Initialize all AI services at Flask startup."""
    try:
        print("[STARTUP] Initializing AI services...")
        
        quiz_service.init_quiz_service(DATA_PATH, MODELS_DIR)
        print("  ✓ Quiz service initialized")
        
        summarizer_service.init_summarizer_service(MODELS_DIR)
        print("  ✓ Summarizer service initialized")
        
        nlp_service.init_nlp_service(MODELS_DIR)
        print("  ✓ NLP service initialized")
        
        feedback_service.init_feedback_service(MODELS_DIR)
        print("  ✓ Feedback service initialized")
        
        study_plan_service.init_study_plan_service(MODELS_DIR)
        print("  ✓ Study plan service initialized")

        # mcq_generator loads models at import time
        print("  ✓ MCQ generator service initialized")

        # learning_path does not require initialization
        print("  ✓ Learning path service initialized")

        # resource_suggester loads models at import time
        print("  ✓ Resource suggester service initialized")

        print("[STARTUP] All AI services ready!")
        return True
    except Exception as e:
        print(f"[ERROR] Failed to initialize services: {e}")
        return False

# Initialize services when app starts
if not initialize_services():
    print("[CRITICAL] Could not initialize services. Some endpoints may fail.")

# ============================================================================
# ROUTES: Health & Info
# ============================================================================

@app.route("/api/ping", methods=["GET"])
def ping():
    """
    Health check endpoint.
    
    Returns:
        JSON with status "ok" if backend is running
    """
    return jsonify({
        "status": "ok",
        "message": "AI Study Pal backend is running",
        "services": {
            "quiz": "ready",
            "summarizer": "ready",
            "nlp": "ready",
            "feedback": "ready",
            "study_plan": "ready",
            "mcq_generator": "ready",
            "learning_path": "ready",
            "resource_suggester": "ready"
        }
    })

# ============================================================================
# ROUTES: Quiz API
# ============================================================================

@app.route("/api/available-topics", methods=["GET"])
def available_topics():
    """
    Get all available quiz topics.
    
    Returns:
        JSON list of topics available for quizzes
    """
    try:
        topics = quiz_service.get_quiz_service().get_available_topics()
        return jsonify({
            "available_topics": topics,
            "count": len(topics)
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/api/generate-quiz", methods=["POST"])
def generate_quiz():
    """
    Generate a quiz for a given topic.
    
    Request JSON:
    {
        "topic": "Python basics",
        "num_questions": 5
    }
    
    Response:
    {
        "topic": "Python basics",
        "num_questions": 5,
        "items": [
            {
                "id": 0,
                "question": "...",
                "answer": "...",
                "topic": "Python basics",
                "difficulty": "easy",
                "predicted_difficulty": "easy"
            },
            ...
        ]
    }
    """
    try:
        data = request.get_json(force=True) or {}
        topic = data.get("topic", "").strip()
        num_questions = data.get("num_questions", 5)
        
        if not topic:
            return jsonify({"error": "topic is required"}), 400
        
        try:
            num_questions = int(num_questions)
        except ValueError:
            return jsonify({"error": "num_questions must be an integer"}), 400
        
        if num_questions <= 0:
            return jsonify({"error": "num_questions must be > 0"}), 400
        
        result = quiz_service.generate_quiz_for_topic(topic, num_questions)
        
        if "error" in result:
            return jsonify(result), 404
        
        return jsonify(result)
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# ============================================================================
# ROUTES: Summarizer API
# ============================================================================

@app.route("/api/summarize", methods=["POST"])
def summarize():
    """
    Summarize a given text into fewer sentences.
    
    Request JSON:
    {
        "text": "long paragraph of text...",
        "max_sentences": 2
    }
    
    Response:
    {
        "original_length": 250,
        "summary_length": 80,
        "compression_ratio": 32.0,
        "max_sentences": 2,
        "summary": "Summarized text here..."
    }
    """
    try:
        data = request.get_json(force=True) or {}
        text = data.get("text", "")
        max_sentences = data.get("max_sentences", 2)
        
        if not text or not text.strip():
            return jsonify({"error": "text is required"}), 400
        
        try:
            max_sentences = int(max_sentences)
        except ValueError:
            return jsonify({"error": "max_sentences must be an integer"}), 400
        
        if max_sentences <= 0:
            return jsonify({"error": "max_sentences must be > 0"}), 400
        
        summary = summarizer_service.summarize_text(text, max_sentences)
        stats = summarizer_service.get_summarizer_service().get_summary_stats(text, summary)
        
        return jsonify({
            **stats,
            "max_sentences": max_sentences,
            "summary": summary
        })
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# ============================================================================
# ROUTES: NLP API (Keywords, Tips, Resources)
# ============================================================================

@app.route("/api/extract-keywords", methods=["POST"])
def extract_keywords():
    """
    Extract keywords from text using NLP.
    
    Request JSON:
    {
        "text": "text to extract keywords from",
        "top_n": 5
    }
    
    Response:
    {
        "keywords": ["keyword1", "keyword2", ...],
        "count": 5
    }
    """
    try:
        data = request.get_json(force=True) or {}
        text = data.get("text", "")
        top_n = data.get("top_n", 5)
        
        if not text or not text.strip():
            return jsonify({"error": "text is required"}), 400
        
        try:
            top_n = int(top_n)
        except ValueError:
            return jsonify({"error": "top_n must be an integer"}), 400
        
        keywords = nlp_service.extract_keywords(text, top_n)
        
        return jsonify({
            "keywords": keywords,
            "count": len(keywords)
        })
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/api/study-tips", methods=["POST"])
def get_study_tips():
    """
    Get study tips based on keywords.
    
    Request JSON:
    {
        "keywords": ["machine learning", "python"]
    }
    
    Response:
    {
        "keywords": ["machine learning", "python"],
        "tips": ["Tip 1", "Tip 2", ...],
        "count": 3
    }
    """
    try:
        data = request.get_json(force=True) or {}
        keywords = data.get("keywords", [])
        
        if not keywords:
            return jsonify({"error": "keywords list is required"}), 400
        
        if not isinstance(keywords, list):
            return jsonify({"error": "keywords must be a list"}), 400
        
        tips = nlp_service.get_study_tips(keywords)
        
        return jsonify({
            "keywords": keywords,
            "tips": tips,
            "count": len(tips)
        })
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/api/resources", methods=["POST"])
def get_resources():
    """
    Get learning resources based on keywords.
    
    Request JSON:
    {
        "keywords": ["machine learning", "python"]
    }
    
    Response:
    {
        "keywords": ["machine learning", "python"],
        "resources": [
            {
                "title": "Resource title",
                "url": "https://..."
            },
            ...
        ],
        "count": 2
    }
    """
    try:
        data = request.get_json(force=True) or {}
        keywords = data.get("keywords", [])
        
        if not keywords:
            return jsonify({"error": "keywords list is required"}), 400
        
        if not isinstance(keywords, list):
            return jsonify({"error": "keywords must be a list"}), 400
        
        resources = nlp_service.get_resources(keywords)
        
        return jsonify({
            "keywords": keywords,
            "resources": resources,
            "count": len(resources)
        })
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# ============================================================================
# ROUTES: Feedback API
# ============================================================================

@app.route("/api/feedback", methods=["POST"])
def generate_feedback_endpoint():
    """
    Generate motivational feedback based on quiz score.
    
    Request JSON:
    {
        "score": 0.85,
        "topic": "Python basics",
        "difficulty": "medium"
    }
    
    Response:
    {
        "score": 0.85,
        "feedback": "Fantastic work! You nailed this topic. Great effort on Python basics!"
    }
    """
    try:
        data = request.get_json(force=True) or {}
        score = data.get("score")
        topic = data.get("topic", "")
        difficulty = data.get("difficulty", "medium")
        
        if score is None:
            return jsonify({"error": "score is required"}), 400
        
        try:
            score = float(score)
        except (ValueError, TypeError):
            return jsonify({"error": "score must be a number between 0 and 1"}), 400
        
        feedback = feedback_service.generate_feedback(score, topic, difficulty)
        
        return jsonify({
            "score": score,
            "score_percentage": f"{score * 100:.1f}%",
            "feedback": feedback
        })
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/api/performance-metrics", methods=["POST"])
def performance_metrics():
    """
    Calculate performance metrics from quiz history.
    
    Request JSON:
    {
        "quiz_results": [
            {"score": 0.6, "difficulty": "easy", "topic": "Python"},
            {"score": 0.75, "difficulty": "medium", "topic": "ML"},
            {"score": 0.85, "difficulty": "medium", "topic": "ML"}
        ]
    }
    
    Response:
    {
        "avg_score": 0.73,
        "percentage_score": "73.3%",
        "total_quizzes": 3,
        "level": "intermediate",
        "trend": "improving"
    }
    """
    try:
        data = request.get_json(force=True) or {}
        quiz_results = data.get("quiz_results", [])
        
        if not isinstance(quiz_results, list):
            return jsonify({"error": "quiz_results must be a list"}), 400
        
        metrics = feedback_service.calculate_performance_metrics(quiz_results)
        
        return jsonify(metrics)
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# ============================================================================
# ROUTES: Study Plan API
# ============================================================================

@app.route("/api/available-subjects", methods=["GET"])
def available_subjects():
    """
    Get all available subjects for study plans.
    
    Returns:
        JSON list of subjects
    """
    try:
        subjects = study_plan_service.get_study_plan_service().get_available_subjects()
        return jsonify({
            "available_subjects": subjects,
            "count": len(subjects)
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/api/generate-study-plan", methods=["POST"])
def generate_study_plan_endpoint():
    """
    Generate an AI study plan based on subject, hours, and difficulty.
    
    Request JSON:
    {
        "subject": "Python basics",
        "total_hours": 10,
        "difficulty": "easy"
    }
    
    Response:
    {
        "subject": "Python basics",
        "difficulty": "easy",
        "total_hours": 10,
        "num_days": 5,
        "hours_per_day": 2.0,
        "daily_schedule": [
            {
                "day": 1,
                "topics": ["Topic 1", "Topic 2"],
                "minutes_per_topic": 30,
                "total_minutes": 60
            },
            ...
        ]
    }
    """
    try:
        data = request.get_json(force=True) or {}
        subject = data.get("subject", "").strip()
        total_hours = data.get("total_hours")
        difficulty = data.get("difficulty", "medium")
        
        if not subject:
            return jsonify({"error": "subject is required"}), 400
        
        if total_hours is None:
            return jsonify({"error": "total_hours is required"}), 400
        
        try:
            total_hours = float(total_hours)
        except (ValueError, TypeError):
            return jsonify({"error": "total_hours must be a number"}), 400
        
        plan = study_plan_service.generate_study_plan(subject, total_hours, difficulty)
        
        if "error" in plan:
            return jsonify(plan), 404
        
        return jsonify(plan)
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/api/study-plan-csv", methods=["POST"])
def study_plan_csv():
    """
    Download study plan as CSV file.
    
    Request JSON:
    {
        "plan": { study plan object from /generate-study-plan }
    }
    
    Returns:
        CSV file download
    """
    try:
        data = request.get_json(force=True) or {}
        plan = data.get("plan")
        
        if not plan:
            return jsonify({"error": "plan object is required"}), 400
        
        csv_content = study_plan_service.study_plan_to_csv(plan)
        
        # Create file-like object
        csv_file = io.StringIO(csv_content)
        
        return send_file(
            io.BytesIO(csv_content.encode()),
            mimetype="text/csv",
            as_attachment=True,
            download_name="study_plan.csv"
        )
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# ============================================================================
# ROUTES: MCQ Generator API
# ============================================================================

@app.route("/api/generate-mcqs", methods=["POST"])
def generate_mcqs():
    """
    Generate multiple-choice questions from text.

    Request JSON:
    {
        "text": "Text to generate MCQs from...",
        "topic": "optional topic",
        "max_questions": 5
    }

    Response:
    {
        "mcqs": [
            {
                "id": "uuid",
                "question": "What is ____?",
                "options": ["A", "B", "C", "D"],
                "correct_index": 2,
                "topic": "topic",
                "difficulty": "easy"
            },
            ...
        ],
        "count": 3
    }
    """
    try:
        data = request.get_json(force=True) or {}
        text = data.get("text", "")
        topic = data.get("topic")
        max_questions = data.get("max_questions", 5)

        if not text or not text.strip():
            return jsonify({"error": "text is required"}), 400

        try:
            max_questions = int(max_questions)
        except ValueError:
            return jsonify({"error": "max_questions must be an integer"}), 400

        if max_questions <= 0:
            return jsonify({"error": "max_questions must be > 0"}), 400

        mcqs = mcq_generator.generate_mcqs_from_text(text, topic=topic, max_questions=max_questions)

        return jsonify({
            "mcqs": mcqs,
            "count": len(mcqs)
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500

# ============================================================================
# ROUTES: Learning Path API
# ============================================================================

@app.route("/api/log-quiz-result", methods=["POST"])
def log_quiz_result():
    """
    Log a quiz result for a user.

    Request JSON:
    {
        "user_id": "user123",
        "result": {
            "topic": "Python",
            "difficulty": "easy",
            "correct": true
        }
    }

    Response:
    {
        "status": "logged"
    }
    """
    try:
        data = request.get_json(force=True) or {}
        user_id = data.get("user_id", "").strip()
        result = data.get("result", {})

        if not user_id:
            return jsonify({"error": "user_id is required"}), 400

        if not result:
            return jsonify({"error": "result object is required"}), 400

        learning_path.log_quiz_result(user_id, result)

        return jsonify({"status": "logged"})

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/api/generate-learning-path", methods=["GET"])
def generate_learning_path_endpoint():
    """
    Generate a personalized learning path for a user.

    Query Params:
    - user_id: string (required)

    Response:
    {
        "user_id": "user123",
        "topic_stats": {...},
        "next_steps": [...]
    }
    """
    try:
        user_id = request.args.get("user_id", "").strip()

        if not user_id:
            return jsonify({"error": "user_id query parameter is required"}), 400

        profile = learning_path.generate_learning_path(user_id)

        return jsonify(profile)

    except Exception as e:
        return jsonify({"error": str(e)}), 500

# ============================================================================
# ROUTES: Resource Suggester API
# ============================================================================

@app.route("/api/suggest-resources", methods=["POST"])
def suggest_resources():
    """
    Suggest learning resources based on subject using K-means clustering.

    Request JSON:
    {
        "subject": "machine learning",
        "top_n": 5
    }

    Response:
    {
        "subject": "machine learning",
        "resources": [
            {
                "subject": "Machine Learning",
                "title": "Resource Title",
                "url": "https://...",
                "description": "Description..."
            },
            ...
        ],
        "count": 5
    }
    """
    try:
        data = request.get_json(force=True) or {}
        subject = data.get("subject", "").strip()
        top_n = data.get("top_n", 5)

        if not subject:
            return jsonify({"error": "subject is required"}), 400

        try:
            top_n = int(top_n)
        except ValueError:
            return jsonify({"error": "top_n must be an integer"}), 400

        if top_n <= 0:
            return jsonify({"error": "top_n must be > 0"}), 400

        resources = resource_suggester.suggest_resources(subject, top_n=top_n)

        return jsonify({
            "subject": subject,
            "resources": resources,
            "count": len(resources)
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500

# ============================================================================
# ERROR HANDLERS
# ============================================================================

@app.errorhandler(404)
def not_found(e):
    """Handle 404 errors."""
    return jsonify({"error": "Endpoint not found"}), 404

@app.errorhandler(500)
def internal_error(e):
    """Handle 500 errors."""
    return jsonify({"error": "Internal server error"}), 500

# ============================================================================
# MAIN
# ============================================================================

if __name__ == "__main__":
    app.run(debug=True, host="127.0.0.1", port=5000)
