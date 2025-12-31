from flask import Flask, request, jsonify
from flask_cors import CORS
from werkzeug.utils import secure_filename
import os
import json
import csv
from datetime import datetime
from io import StringIO

from models.quiz_model import train_quiz_models, classify_difficulty, generate_mcqs
from services.summary_service import generate_summary
from models.nlp_utils import extract_keywords, generate_study_tips
from models.feedback_model import generate_feedback_text
from services.notes_service import parse_text, parse_pdf, parse_url, parse_youtube, parse_source
from services.quiz_service import generate_mcqs
from services.summary_service import summarize_text
from services.schedule_service import generate_study_schedule_csv
from services.resources_service import get_resources
from services.subject_service import (
    get_available_subjects,
    save_subject,
    get_user_dashboard,
    save_user_progress,
    get_quiz_questions,
)

UPLOAD_FOLDER = './backend/uploads'
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

def create_app():
    app = Flask(__name__)
    CORS(app)
    app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
    app.config['MAX_CONTENT_LENGTH'] = 50 * 1024 * 1024

    try:
        train_quiz_models()
    except Exception as e:
        print(f"Warning: Could not train models: {e}")

    @app.route('/health', methods=['GET'])
    def health():
        return jsonify({"status": "ok"}), 200

    @app.route('/api/subjects', methods=['GET'])
    def get_subjects():
        subjects = get_available_subjects()
        return jsonify({"subjects": subjects}), 200

    @app.route('/api/subjects', methods=['POST'])
    def create_subject():
        data = request.get_json()
        if not data or 'name' not in data:
            return jsonify({"error": "Missing 'name' field"}), 400

        name = data['name'].strip()
        if not name:
            return jsonify({"error": "Name cannot be empty"}), 400

        result = save_subject(name)
        if result:
            return jsonify({"message": "Subject created", "subject": name}), 201
        return jsonify({"message": "Subject already exists"}), 200

    @app.route('/api/dashboard', methods=['GET'])
    def dashboard():
        user_id = request.args.get('user_id', 'default_user')
        data = get_user_dashboard(user_id)
        return jsonify(data), 200

    @app.route('/api/notes-to-mcqs', methods=['POST'])
    def notes_to_mcqs():
        try:
            text = ''
            data = request.form if request.form else (request.get_json() or {})
            source_type = data.get('source_type', 'text')
            subject = data.get('subject', 'General')
            max_questions = int(data.get('max_questions', 5))
            file = request.files.get('file') if 'file' in request.files else None
            url = data.get('url', '')
            youtube_url = data.get('youtube_url', '')

            text = parse_source(source_type, notes=data.get('notes', ''), url=url, youtube_url=youtube_url, file=file)

            if not text or len(text.strip()) < 20:
                return jsonify({"error": "Text too short or empty"}), 400

            from services.quiz_service import create_quiz_from_notes
            questions = create_quiz_from_notes(text, subject, max_questions)
            return jsonify({"questions": questions, "count": len(questions)}), 200
        except Exception as e:
            return jsonify({"error": str(e)}), 500

    @app.route('/api/adaptive-quiz', methods=['GET'])
    def adaptive_quiz():
        try:
            user_id = request.args.get('user_id', 'default_user')
            subject = request.args.get('subject', 'General')
            difficulty = request.args.get('difficulty', None)

            questions = get_quiz_questions(user_id, subject, difficulty)
            return jsonify({"questions": questions}), 200
        except Exception as e:
            return jsonify({"error": str(e)}), 500

    @app.route('/api/quiz/submit', methods=['POST'])
    def submit_quiz():
        try:
            data = request.get_json()
            user_id = data.get('user_id', 'default_user')
            subject = data.get('subject', 'General')
            answers = data.get('answers', [])

            if not answers:
                return jsonify({"error": "No answers provided"}), 400

            correct = sum(1 for ans in answers if ans.get('correct', False))
            total = len(answers)
            accuracy = (correct / total * 100) if total > 0 else 0

            save_user_progress(user_id, subject, correct, total, accuracy)

            feedback = generate_feedback_text(subject, accuracy)

            return jsonify({
                "correct": correct,
                "total": total,
                "accuracy": round(accuracy, 2),
                "feedback": feedback
            }), 200
        except Exception as e:
            return jsonify({"error": str(e)}), 500

    @app.route('/api/revision-summary', methods=['POST'])
    def revision_summary():
        try:
            data = request.form if request.form else (request.get_json() or {})
            source_type = data.get('source_type', 'text')
            subject = data.get('subject', 'General')
            file = request.files.get('file') if 'file' in request.files else None
            url = data.get('url', '')
            youtube_url = data.get('youtube_url', '')
            # For last minute revision, do not use max_sentences from user
            text = parse_source(source_type, notes=data.get('notes', ''), url=url, youtube_url=youtube_url, file=file)

            if not text or len(text.strip()) < 20:
                return jsonify({"error": "Text too short or empty"}), 400

            # Use a fixed number of sentences for last minute revision
            summary, tips = generate_summary(text, subject, max_sentences=7)
            return jsonify({
                "summary": summary,
                "tips": tips
            }), 200
        except Exception as e:
            return jsonify({"error": str(e)}), 500

    @app.route('/api/resources', methods=['POST'])
    def get_resources_endpoint():
        try:
            data = request.form if request.form else (request.get_json() or {})
            subject = data.get('subject', 'General')
            url = data.get('url', '')
            youtube_url = data.get('youtube_url', '')
            source_type = data.get('source_type', 'text')
            file = request.files.get('file') if 'file' in request.files else None
            # If YouTube or PDF, extract text and return as a resource
            resources = get_resources(subject, 10)
            extra_resources = []
            if source_type == 'pdf' and file:
                text = parse_pdf(file)
                if text:
                    extra_resources.append({
                        'subject': subject,
                        'title': 'Uploaded PDF Content',
                        'url': '',
                        'type': 'pdf',
                        'content': text[:500]
                    })
            elif source_type == 'youtube' and youtube_url:
                yt_text = parse_youtube(youtube_url)
                if yt_text:
                    extra_resources.append({
                        'subject': subject,
                        'title': 'YouTube Video Content',
                        'url': youtube_url,
                        'type': 'youtube',
                        'content': yt_text[:500]
                    })
            return jsonify({"resources": resources + extra_resources}), 200
        except Exception as e:
            return jsonify({"error": str(e)}), 500

    @app.route('/api/study-schedule', methods=['GET'])
    def study_schedule():
        try:
            subject = request.args.get('subject', 'General')
            hours = int(request.args.get('hours', 10))
            scenario = request.args.get('scenario', 'exam_prep')

            csv_data = generate_study_schedule_csv(subject, hours, scenario)

            return csv_data, 200, {
                'Content-Disposition': f'attachment; filename=study-schedule-{subject}.csv',
                'Content-Type': 'text/csv'
            }
        except Exception as e:
            return jsonify({"error": str(e)}), 500

    # --- ROUTE ALIASES FOR FRONTEND COMPATIBILITY ---
    @app.route('/api/summarize', methods=['POST'])
    def summarize_alias():
        return revision_summary()

    @app.route('/api/mcqs', methods=['POST'])
    def mcqs_alias():
        return notes_to_mcqs()

    @app.route('/api/quiz/adaptive', methods=['POST'])
    def quiz_adaptive_alias():
        data = request.get_json() or {}
        user_id = data.get('user_id', 'default_user')
        subject = data.get('subject', 'General')
        difficulty = data.get('difficulty', None)
        questions = get_quiz_questions(user_id, subject, difficulty)
        return jsonify({"questions": questions}), 200

    @app.route('/api/progress', methods=['GET'])
    def get_progress():
        user_id = request.args.get('user_id', 'default_user')
        data = get_user_dashboard(user_id)
        # Transform data to match ProgressResponse expected by frontend
        average_accuracy = data.get('average_accuracy', 0)
        total_quiz_attempts = data.get('total_quiz_attempts', 0)
        subject_stats = [
            {
                'subjectName': s.get('subject', ''),
                'accuracy': s.get('accuracy', 0),
                'quizAttempts': s.get('quiz_attempts', 0),
                'color': s.get('color', None)
            }
            for s in data.get('subjects', [])
        ]
        return jsonify({
            'averageAccuracy': average_accuracy,
            'totalQuizAttempts': total_quiz_attempts,
            'subjectStats': subject_stats
        }), 200

    return app

if __name__ == '__main__':
    app = create_app()
    app.run(debug=True, host='0.0.0.0', port=5000)
