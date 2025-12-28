from flask import Flask, request, jsonify
from flask_cors import CORS
import json
import os
from models.quiz_model import QuizModel
from models.feedback_model import generate_feedback
from services.subject_service import get_subjects, add_subject, init_subjects
from services.notes_service import parse_text, parse_pdf, fetch_url, fetch_youtube
from services.quiz_service import generate_adaptive_quiz, evaluate_quiz
from services.summary_service import summarize_and_tips
from services.schedule_service import generate_schedule
from services.resources_service import get_resources, init_resources

app = Flask(__name__)
CORS(app)

# Initialize data
init_subjects()
init_resources()

# In-memory storage for user data
user_data = {}

@app.route('/health', methods=['GET'])
def health():
    return jsonify({'status': 'healthy', 'message': 'AI Study Pal Backend is running!'}), 200

@app.route('/api/ping', methods=['GET'])
def ping():
    return jsonify({'status': 'ok', 'message': 'Pong!'}), 200

@app.route('/api/subjects', methods=['GET'])
def get_all_subjects():
    try:
        subjects = get_subjects()
        return jsonify({'success': True, 'subjects': subjects}), 200
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/subjects', methods=['POST'])
def create_subject():
    try:
        data = request.json
        name = data.get('name', 'New Subject')
        subject = add_subject(name)
        return jsonify({'success': True, 'subject': subject}), 201
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/notes-to-mcqs', methods=['POST'])
def notes_to_mcqs():
    try:
        data = request.json
        source_type = data.get('source_type', 'text')
        subject = data.get('subject', 'General')
        
        if source_type == 'text':
            notes = data.get('notes', '')
            parsed = parse_text(notes)
        elif source_type == 'pdf':
            file_path = data.get('file_path', '')
            parsed = parse_pdf(file_path)
        elif source_type == 'url':
            url = data.get('url', '')
            parsed = fetch_url(url)
        elif source_type == 'youtube':
            video_id = data.get('youtube_url', '')
            parsed = fetch_youtube(video_id)
        else:
            return jsonify({'success': False, 'error': 'Invalid source type'}), 400
        
        content = parsed.get('content', '')
        quiz_model = QuizModel()
        quizzes = quiz_model.generate_quizzes(content, subject, num_questions=5)
        
        return jsonify({'success': True, 'quizzes': quizzes, 'source': source_type}), 200
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/adaptive-quiz', methods=['GET'])
def adaptive_quiz():
    try:
        user_id = request.args.get('user_id', 'user1')
        subject = request.args.get('subject', 'General')
        difficulty = request.args.get('difficulty', 'easy')
        
        sample_text = "Machine learning is a subset of artificial intelligence. It focuses on enabling systems to learn from data. Deep learning uses neural networks with multiple layers. Natural language processing helps computers understand human language."
        
        quizzes = generate_adaptive_quiz(sample_text, subject, difficulty)
        
        return jsonify({'success': True, 'quizzes': quizzes, 'subject': subject}), 200
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/quiz/submit', methods=['POST'])
def submit_quiz():
    try:
        data = request.json
        user_id = data.get('user_id', 'user1')
        subject = data.get('subject', 'General')
        answers = data.get('answers', [])
        
        result = evaluate_quiz(answers)
        feedback = generate_feedback(result['accuracy'], subject)
        
        return jsonify({
            'success': True,
            'result': result,
            'feedback': feedback,
            'subject': subject
        }), 200
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/revision-summary', methods=['POST'])
def revision_summary():
    try:
        data = request.json
        text = data.get('text', '')
        subject = data.get('subject', 'General')
        max_sentences = data.get('max_sentences', 2)
        
        summary_data = summarize_and_tips(text, max_sentences)
        
        return jsonify({
            'success': True,
            'summary': summary_data['summary'],
            'tips': summary_data['tips'],
            'subject': subject
        }), 200
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/study-schedule', methods=['GET'])
def study_schedule():
    try:
        subject = request.args.get('subject', 'General')
        hours = int(request.args.get('hours', '5'))
        scenario = request.args.get('scenario', 'exam_prep')
        
        schedule = generate_schedule(hours, subject)
        
        return jsonify({
            'success': True,
            'schedule': schedule,
            'subject': subject,
            'scenario': scenario
        }), 200
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/resources', methods=['GET'])
def resources():
    try:
        subject = request.args.get('subject')
        limit = int(request.args.get('limit', '10'))
        
        res = get_resources(subject)
        
        return jsonify({
            'success': True,
            'resources': res[:limit],
            'subject': subject
        }), 200
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/dashboard', methods=['GET'])
def dashboard():
    try:
        user_id = request.args.get('user_id', 'user1')
        
        dashboard_data = {
            'user_id': user_id,
            'topics_studied': 3,
            'total_attempts': 10,
            'average_accuracy': 75.5,
            'subjects': get_subjects()
        }
        
        return jsonify({'success': True, 'dashboard': dashboard_data}), 200
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@app.errorhandler(404)
def not_found(error):
    return jsonify({'success': False, 'error': 'Not found'}), 404

@app.errorhandler(500)
def server_error(error):
    return jsonify({'success': False, 'error': 'Server error'}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
