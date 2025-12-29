from flask import Flask, request, jsonify
from flask_cors import CORS
from werkzeug.utils import secure_filename
import os
import json
import csv
from datetime import datetime
from io import StringIO

from models.quiz_model import train_quiz_models, classify_difficulty, generate_mcqs
from models.summarizer_model import summarize_text
from models.nlp_utils import extract_keywords, generate_study_tips
from models.feedback_model import generate_feedback_text
from services.notes_service import parse_text, parse_pdf, parse_url, parse_youtube
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
            if 'file' in request.files:
                file = request.files['file']
                if file.filename == '':
                    return jsonify({"error": "No file selected"}), 400
                
                filename = secure_filename(file.filename)
                filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
                file.save(filepath)
                
                text = parse_pdf(filepath)
                try:
                    os.remove(filepath)
                except:
                    pass
            else:
                data = request.get_json() or {}
                source_type = data.get('source_type', 'text')
                
                if source_type == 'text':
                    text = data.get('notes', '')
                elif source_type == 'url':
                    text = parse_url(data.get('url', ''))
                elif source_type == 'youtube':
                    text = parse_youtube(data.get('youtube_url', ''))
                else:
                    text = data.get('notes', '')
            
            subject = data.get('subject', 'General') if isinstance(data, dict) else request.form.get('subject', 'General')
            max_questions = int(data.get('max_questions', 5) if isinstance(data, dict) else request.form.get('max_questions', 5))
            
            if not text or len(text.strip()) < 20:
                return jsonify({"error": "Text too short or empty"}), 400
            
            questions = generate_mcqs(text, max_questions)
            question_texts = [q['question'] for q in questions]
            difficulties = classify_difficulty(question_texts)
            
            for i, q in enumerate(questions):
                q['difficulty'] = difficulties[i] if i < len(difficulties) else 'medium'
                q['subject'] = subject
            
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
            data = request.get_json()
            text = data.get('text', '')
            subject = data.get('subject', 'General')
            max_sentences = int(data.get('max_sentences', 5))
            
            if not text or len(text.strip()) < 20:
                return jsonify({"error": "Text too short or empty"}), 400
            
            summary = summarize_text(text, max_sentences)
            keywords = extract_keywords(text, num_keywords=5)
            tips = generate_study_tips(keywords, subject)
            
            return jsonify({
                "subject": subject,
                "summary": summary,
                "keywords": keywords,
                "tips": tips
            }), 200
        except Exception as e:
            return jsonify({"error": str(e)}), 500
    
    @app.route('/api/resources', methods=['GET'])
    def get_resources():
        try:
            subject = request.args.get('subject', 'General')
            limit = int(request.args.get('limit', 10))
            
            resources_file = './backend/data/resources.csv'
            resources = []
            
            if os.path.exists(resources_file):
                with open(resources_file, 'r') as f:
                    reader = csv.DictReader(f)
                    for i, row in enumerate(reader):
                        if i >= limit:
                            break
                        if subject.lower() == 'all' or row.get('subject', '').lower() == subject.lower():
                            resources.append(row)
            
            return jsonify({"resources": resources, "count": len(resources)}), 200
        except Exception as e:
            return jsonify({"error": str(e)}), 500
    
    @app.route('/api/study-schedule', methods=['GET'])
    def study_schedule():
        try:
            subject = request.args.get('subject', 'General')
            hours = int(request.args.get('hours', 10))
            scenario = request.args.get('scenario', 'balanced')
            
            output = StringIO()
            writer = csv.writer(output)
            writer.writerow(['Session', 'Subject', 'Scenario', 'Planned Hours', 'Activity'])
            
            activities = {
                'intensive': ['Concept Review', 'Problem Solving', 'Practice Tests', 'Revision'],
                'balanced': ['Theory', 'Examples', 'Practice', 'Review'],
                'relaxed': ['Overview', 'Light Reading', 'Video', 'Discussion']
            }
            
            acts = activities.get(scenario, activities['balanced'])
            hours_per_session = hours / len(acts)
            
            for i, activity in enumerate(acts):
                writer.writerow([f'Session {i+1}', subject, scenario, round(hours_per_session, 1), activity])
            
            csv_data = output.getvalue()
            output.close()
            
            return csv_data, 200, {
                'Content-Disposition': f'attachment; filename=schedule_{subject}.csv',
                'Content-Type': 'text/csv'
            }
        except Exception as e:
            return jsonify({"error": str(e)}), 500
    
    return app

if __name__ == '__main__':
    app = create_app()
    app.run(debug=True, host='0.0.0.0', port=5000)