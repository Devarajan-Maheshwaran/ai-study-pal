import os

BACK = '/workspaces/ai-study-pal/backend'

# ============ BACKEND SERVICES ============

# services/__init__.py
with open(f'{BACK}/services/__init__.py', 'w') as f:
    f.write('')

# services/notes_service.py
notes_service = '''import requests
from PyPDF2 import PdfReader
from io import BytesIO

def parse_text(notes):
    return notes if notes else ""

def parse_pdf(file):
    """Extract text from PDF."""
    try:
        pdf = PdfReader(BytesIO(file.read()))
        text = ""
        for page in pdf.pages:
            text += page.extract_text()
        return text
    except:
        return ""

def parse_url(url):
    """Extract text from URL."""
    try:
        resp = requests.get(url, timeout=5)
        # Simple extraction - just get first 500 chars of content
        return resp.text[:500]
    except:
        return ""

def parse_youtube(youtube_url):
    """Extract transcript from YouTube (stub)."""
    return "YouTube video content. Please add transcript API key."

def parse_source(source_type, notes=None, url=None, youtube_url=None, file=None):
    """Parse different source types."""
    if source_type == "text":
        return parse_text(notes)
    elif source_type == "pdf":
        return parse_pdf(file) if file else ""
    elif source_type == "url":
        return parse_url(url)
    elif source_type == "youtube":
        return parse_youtube(youtube_url)
    return ""
'''

with open(f'{BACK}/services/notes_service.py', 'w') as f:
    f.write(notes_service)

print('✓ notes_service.py')

# services/subject_service.py
subject_service = '''import csv
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
'''

with open(f'{BACK}/services/subject_service.py', 'w') as f:
    f.write(subject_service)

print('✓ subject_service.py')

# services/resources_service.py
resources_service = '''import csv
import os

RESOURCES_FILE = os.path.join(os.path.dirname(__file__), '..', 'data', 'resources.csv')

def init_resources():
    """Initialize resources file."""
    if not os.path.exists(RESOURCES_FILE):
        os.makedirs(os.path.dirname(RESOURCES_FILE), exist_ok=True)
        with open(RESOURCES_FILE, 'w', newline='') as f:
            writer = csv.writer(f)
            writer.writerow(['subject', 'title', 'url', 'type'])
            writer.writerow(['Mathematics', 'Khan Academy Math', 'https://www.khanacademy.org/math', 'web'])
            writer.writerow(['Science', 'Crash Course Science', 'https://www.youtube.com/@crashcourse', 'youtube'])

def get_resources(subject, limit=10):
    """Get resources for a subject."""
    init_resources()
    resources = []
    try:
        with open(RESOURCES_FILE, 'r') as f:
            reader = csv.DictReader(f)
            for row in reader:
                if row['subject'] == subject:
                    resources.append(row)
                    if len(resources) >= limit:
                        break
    except:
        pass
    return resources
'''

with open(f'{BACK}/services/resources_service.py', 'w') as f:
    f.write(resources_service)

print('✓ resources_service.py')

# services/schedule_service.py
schedule_service = '''def generate_schedule(subject, hours, scenario="standard"):
    """Generate study schedule."""
    schedule_data = []
    sessions = max(1, int(hours // 1))
    per_session = hours / sessions if sessions > 0 else hours
    
    for i in range(sessions):
        schedule_data.append({
            'session': i + 1,
            'subject': subject,
            'scenario': scenario,
            'planned_hours': round(per_session, 1),
            'activity': f'Review and practice {subject} concepts'
        })
    
    return schedule_data

def schedule_to_csv(schedule_data):
    """Convert schedule to CSV format."""
    lines = ['Session,Subject,Scenario,Planned Hours,Activity\n']
    for item in schedule_data:
        line = f"{item['session']},{item['subject']},{item['scenario']},{item['planned_hours']},{item['activity']}\n"
        lines.append(line)
    return ''.join(lines)
'''

with open(f'{BACK}/services/schedule_service.py', 'w') as f:
    f.write(schedule_service)

print('✓ schedule_service.py')

print('\nAll service files created!')
