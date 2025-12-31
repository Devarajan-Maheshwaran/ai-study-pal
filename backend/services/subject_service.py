import csv
import os
from datetime import datetime

DATA_FOLDER = os.path.join(os.path.dirname(__file__), '..', 'data')

def get_available_subjects():
    subjects_file = os.path.join(DATA_FOLDER, 'subjects.csv')
    subjects = []
    if os.path.exists(subjects_file):
        with open(subjects_file, 'r') as f:
            reader = csv.DictReader(f)
            subjects = [row['name'] for row in reader]
    return subjects

def save_subject(name):
    subjects_file = os.path.join(DATA_FOLDER, 'subjects.csv')
    subjects = get_available_subjects()
    if name in subjects:
        return False
    subjects.append(name)
    with open(subjects_file, 'w', newline='') as f:
        writer = csv.writer(f)
        writer.writerow(['name'])
        for subj in subjects:
            writer.writerow([subj])
    return True

def get_user_dashboard(user_id):
    progress_file = os.path.join(DATA_FOLDER, 'user_progress.csv')
    if not os.path.exists(progress_file):
        return {
            'topics_studied': 0,
            'total_attempts': 0,
            'correct_answers': 0,
            'avg_accuracy': 0.0,
            'per_subject': []
        }
    
    with open(progress_file, 'r') as f:
        reader = csv.DictReader(f)
        data = list(reader)
    
    user_data = [row for row in data if row.get('user_id') == user_id]
    if not user_data:
        return {
            'topics_studied': 0,
            'total_attempts': 0,
            'correct_answers': 0,
            'avg_accuracy': 0.0,
            'per_subject': []
        }
    
    total_attempts = sum(int(row['total']) for row in user_data)
    correct_answers = sum(int(row['correct']) for row in user_data)
    avg_accuracy = (correct_answers / total_attempts * 100) if total_attempts > 0 else 0
    
    per_subject = {}
    for row in user_data:
        subj = row['subject']
        if subj not in per_subject:
            per_subject[subj] = {'attempts': 0, 'correct': 0, 'accuracy': 0}
        per_subject[subj]['attempts'] += int(row['total'])
        per_subject[subj]['correct'] += int(row['correct'])
    
    for subj in per_subject:
        attempts = per_subject[subj]['attempts']
        correct = per_subject[subj]['correct']
        per_subject[subj]['avg_accuracy'] = (correct / attempts * 100) if attempts > 0 else 0
    
    return {
        'topics_studied': len(per_subject),
        'total_attempts': total_attempts,
        'correct_answers': correct_answers,
        'avg_accuracy': round(avg_accuracy, 2),
        'per_subject': [{'subject': k, **v} for k, v in per_subject.items()]
    }

def save_user_progress(user_id, subject, correct, total, accuracy):
    progress_file = os.path.join(DATA_FOLDER, 'user_progress.csv')
    file_exists = os.path.exists(progress_file)
    with open(progress_file, 'a', newline='') as f:
        writer = csv.writer(f)
        if not file_exists:
            writer.writerow(['user_id', 'subject', 'correct', 'total', 'accuracy', 'timestamp'])
        writer.writerow([user_id, subject, correct, total, round(accuracy, 2), datetime.now().isoformat()])

def get_quiz_questions(user_id, subject, difficulty=None):
    # Generate MCQs from sample text for the subject
    text = SAMPLE_TEXTS.get(subject, SAMPLE_TEXTS['General'])
    mcqs = generate_mcqs(text, num_questions=5)
    questions = []
    for i, mcq in enumerate(mcqs):
        questions.append({
            'id': str(i+1),
            'stem': mcq['question'],
            'options': mcq['options'],
            'answer': mcq['answer'],
            'difficulty': mcq.get('difficulty', 'medium'),
            'topic': subject
        })
    return questions
