import csv
import json
from pathlib import Path

SUBJECTS_FILE = 'data/subjects.csv'

def get_subjects():
    if not Path(SUBJECTS_FILE).exists():
        init_subjects()
    subjects = []
    try:
        with open(SUBJECTS_FILE, 'r') as f:
            reader = csv.DictReader(f)
            subjects = list(reader)
    except:
        pass
    return subjects

def init_subjects():
    Path('data').mkdir(exist_ok=True)
    subjects = [
        {'id': '1', 'name': 'AIML Fundamentals'},
        {'id': '2', 'name': 'Python Basics'},
        {'id': '3', 'name': 'Data Science'},
    ]
    with open(SUBJECTS_FILE, 'w', newline='') as f:
        writer = csv.DictWriter(f, fieldnames=['id', 'name'])
        writer.writeheader()
        writer.writerows(subjects)

def add_subject(name):
    subjects = get_subjects()
    new_id = str(len(subjects) + 1)
    subjects.append({'id': new_id, 'name': name})
    with open(SUBJECTS_FILE, 'w', newline='') as f:
        writer = csv.DictWriter(f, fieldnames=['id', 'name'])
        writer.writeheader()
        writer.writerows(subjects)
    return {'id': new_id, 'name': name}
