import csv
import os
from datetime import datetime
from models.quiz_model import generate_mcqs

SAMPLE_TEXTS = {
    "General": "The AI Study Pal is an intelligent companion designed to help students learn more effectively. It uses NLP to summarize notes, generate quizzes, and provide study tips based on student progress.",
    "Computer Science": "Computer Science is the study of computers and computational systems. Unlike electrical and computer engineers, computer scientists deal mostly with software and software systems; this includes their theory, design, development, and application.",
    "Mathematics": "Mathematics is the science that deals with the logic of shape, quantity and arrangement. Math is all around us, in everything we do. It is the building block for everything in our daily lives, including mobile devices, architecture, art, money, engineering, and even sports.",
    "Physics": "Physics is the natural science that studies matter, its fundamental constituents, its motion and behavior through space and time, and the related entities of energy and force. Physics is one of the most fundamental scientific disciplines, with its main goal being to understand how the universe behaves.",
    "Chemistry": "Chemistry is the scientific study of the properties and behavior of matter. It is a physical science within the natural sciences that studies the chemical elements that make up matter and compounds made of atoms, molecules and ions: their composition, structure, properties, behavior and the changes they undergo during a reaction with other substances.",
    "Biology": "Biology is the scientific study of life. It is a natural science with a broad scope but has several unifying themes that tie it together as a single, coherent field. For instance, all organisms are made up of cells that process hereditary information encoded in genes, which can be transmitted to future generations."
}

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
def get_all_subjects():
    return get_available_subjects()

def create_subject(name):
    created = save_subject(name)
    return {
        "name": name,
        "created": created,
        "message": "Subject created" if created else "Subject already exists"
    }