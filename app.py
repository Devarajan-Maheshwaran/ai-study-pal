from flask import Flask, request, jsonify
from flask_cors import CORS
import random
import csv
from pathlib import Path

app = Flask(__name__)
CORS(app)
Path('data').mkdir(exist_ok=True)

# Simple quiz generation
def generate_quiz(text, subject='General', num=5):
    sentences = text.split('.')
    quizzes = []
    for i, sent in enumerate(sentences[:num]):
        if len(sent.strip()) > 10:
            words = sent.split()
            if len(words) > 5:
                idx = random.randint(1, len(words)-2)
                blank = words[idx]
                q = ' '.join(words[:idx] + ['____'] + words[idx+1:])
                quizzes.append({
                    'id': i+1, 'question': q, 'difficulty': 'easy',
                    'answer': blank, 'subject': subject
                })
    return quizzes[:num]

# Initialize subjects
def init_subjects():
    subjects_file = 'data/subjects.csv'
    if not Path(subjects_file).exists():
        with open(subjects_file, 'w', newline='') as f:
            writer = csv.DictWriter(f, fieldnames=['id', 'name'])
            writer.writeheader()
            writer.writerows([
                {'id': '1', 'name': 'AIML Fundamentals'},
                {'id': '2', 'name': 'Python Basics'},
                {'id': '3', 'name': 'Data Science'}
            ])

def get_subjects():
    init_subjects()
    with open('data/subjects.csv', 'r') as f:
        return list(csv.DictReader(f))

@app.route('/health', methods=['GET'])
def health():
    return jsonify({'status': 'healthy', 'message': 'AI Study Pal Backend Running!'}), 200

@app.route('/api/ping', methods=['GET'])
def ping():
    return jsonify({'status': 'ok'}), 200

@app.route('/api/subjects', methods=['GET'])
def subjects():
    return jsonify({'success': True, 'subjects': get_subjects()}), 200

@app.route('/api/subjects', methods=['POST'])
def create_subject():
    data = request.json
    name = data.get('name', 'New Subject')
    subjects = get_subjects()
    new_id = str(len(subjects) + 1)
    subjects.append({'id': new_id, 'name': name})
    with open('data/subjects.csv', 'w', newline='') as f:
        writer = csv.DictWriter(f, fieldnames=['id', 'name'])
        writer.writeheader()
        writer.writerows(subjects)
    return jsonify({'success': True, 'subject': {'id': new_id, 'name': name}}), 201

@app.route('/api/notes-to-mcqs', methods=['POST'])
def notes_to_mcqs():
    data = request.json
    notes = data.get('notes', '')
    subject = data.get('subject', 'General')
    quizzes = generate_quiz(notes, subject)
    return jsonify({'success': True, 'quizzes': quizzes}), 200

@app.route('/api/adaptive-quiz', methods=['GET'])
def adaptive_quiz():
    subject = request.args.get('subject', 'General')
    text = 'ML is a subset of AI. Deep learning uses neural networks. NLP processes text. Study hard!'
    quizzes = generate_quiz(text, subject)
    return jsonify({'success': True, 'quizzes': quizzes}), 200

@app.route('/api/quiz/submit', methods=['POST'])
def submit_quiz():
    data = request.json
    answers = data.get('answers', [])
    correct = sum(1 for a in answers if a.get('is_correct'))
    total = len(answers)
    accuracy = (correct/total*100) if total > 0 else 0
    feedback = 'Excellent!' if accuracy >= 80 else 'Good job!' if accuracy >= 60 else 'Keep practicing!'
    return jsonify({
        'success': True,
        'result': {'correct': correct, 'total': total, 'accuracy': accuracy},
        'feedback': feedback
    }), 200

@app.route('/api/revision-summary', methods=['POST'])
def revision_summary():
    data = request.json
    text = data.get('text', '')
    sentences = text.split('.')
    summary = '.'.join(sentences[:2]) + '.'
    tips = [f'Review: {w}' for w in text.split()[:5]]
    return jsonify({
        'success': True,
        'summary': summary,
        'tips': tips
    }), 200

@app.route('/api/study-schedule', methods=['GET'])
def study_schedule():
    hours = int(request.args.get('hours', 5))
    return jsonify({
        'success': True,
        'schedule': [
            {'session': 1, 'activity': 'Review', 'hours': hours/3},
            {'session': 2, 'activity': 'Practice', 'hours': hours/3},
            {'session': 3, 'activity': 'Quiz', 'hours': hours/3}
        ]
    }), 200

@app.route('/api/resources', methods=['GET'])
def resources():
    return jsonify({
        'success': True,
        'resources': [
            {'title': 'Python Docs', 'url': 'https://docs.python.org'},
            {'title': 'ML Tutorial', 'url': 'https://youtu.be/example'}
        ]
    }), 200

@app.route('/api/dashboard', methods=['GET'])
def dashboard():
    return jsonify({
        'success': True,
        'dashboard': {
            'topics_studied': 5,
            'attempts': 10,
            'accuracy': 75.5,
            'subjects': get_subjects()
        }
    }), 200

if __name__ == '__main__':
    init_subjects()
    app.run(host='0.0.0.0', port=5000, debug=True)
