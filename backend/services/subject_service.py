import csv
import json
import os
from pathlib import Path

DATA_DIR = os.path.join(os.path.dirname(__file__), '..', 'data')
SUBJECTS_FILE = os.path.join(DATA_DIR, 'subjects.csv')
PROGRESS_FILE = os.path.join(DATA_DIR, 'progress.json')

def init_data_files():
    """Initialize data files if they don't exist."""
    Path(DATA_DIR).mkdir(exist_ok=True)
    
    if not os.path.exists(SUBJECTS_FILE):
        with open(SUBJECTS_FILE, 'w', newline='') as f:
            writer = csv.writer(f)
            writer.writerow(['name', 'created_at'])
            default_subjects = ['Mathematics', 'Science', 'History', 'English', 'Biology']
            for s in default_subjects:
                writer.writerow([s, '2024-12-29'])
    
    if not os.path.exists(PROGRESS_FILE):
        with open(PROGRESS_FILE, 'w') as f:
            json.dump({}, f)

def get_available_subjects():
    """Get all subjects."""
    init_data_files()
    subjects = []
    try:
        with open(SUBJECTS_FILE, 'r') as f:
            reader = csv.DictReader(f)
            for row in reader:
                subjects.append(row['name'])
    except:
        pass
    return subjects

def save_subject(name):
    """Save a new subject."""
    init_data_files()
    with open(SUBJECTS_FILE, 'a', newline='') as f:
        writer = csv.writer(f)
        writer.writerow([name, '2024-12-29'])

def save_user_progress(user_id, subject, correct, total):
    """Save quiz progress."""
    init_data_files()
    try:
        with open(PROGRESS_FILE, 'r') as f:
            progress = json.load(f)
    except:
        progress = {}
    
    if user_id not in progress:
        progress[user_id] = {}
    if subject not in progress[user_id]:
        progress[user_id][subject] = []
    
    progress[user_id][subject].append({
        'correct': correct,
        'total': total,
        'accuracy': correct / total if total > 0 else 0
    })
    
    with open(PROGRESS_FILE, 'w') as f:
        json.dump(progress, f)

def get_user_dashboard(user_id):
    """Get user dashboard stats."""
    init_data_files()
    try:
        with open(PROGRESS_FILE, 'r') as f:
            all_progress = json.load(f)
    except:
        all_progress = {}
    
    user_progress = all_progress.get(user_id, {})
    
    total_attempts = sum(len(attempts) for attempts in user_progress.values())
    total_correct = sum(sum(a['correct'] for a in attempts) for attempts in user_progress.values())
    
    per_subject = []
    for subject, attempts in user_progress.items():
        if attempts:
            avg_acc = sum(a['accuracy'] for a in attempts) / len(attempts)
            per_subject.append({
                'subject': subject,
                'attempts': len(attempts),
                'correct': sum(a['correct'] for a in attempts),
                'avg_accuracy': round(avg_acc, 2)
            })
    
    return {
        'user_id': user_id,
        'topics_studied': len(user_progress),
        'total_attempts': total_attempts,
        'correct_answers': total_correct,
        'avg_accuracy': round(total_correct / total_attempts if total_attempts > 0 else 0, 2),
        'per_subject': per_subject
    }

def get_quiz_questions(user_id, subject, difficulty=None):
    """Get quiz questions for a subject."""
    # Dummy questions
    questions = [
        {
            'id': f'{subject}_q1',
            'question': f'What is the first concept in {subject}?',
            'options': ['Option A', 'Option B', 'Option C', 'Option D'],
            'correct_option': 0,
            'difficulty': 'easy'
        },
        {
            'id': f'{subject}_q2',
            'question': f'Explain a key principle of {subject}.',
            'options': ['Option A', 'Option B', 'Option C', 'Option D'],
            'correct_option': 1,
            'difficulty': 'medium'
        },
    ]
    
    if difficulty:
        questions = [q for q in questions if q['difficulty'] == difficulty]
    
    return questions
