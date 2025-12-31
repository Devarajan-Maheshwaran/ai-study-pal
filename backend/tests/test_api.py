import pytest
import json
import sys
import os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
from app import create_app

@pytest.fixture
def client():
    app = create_app()
    app.config['TESTING'] = True
    with app.test_client() as client:
        yield client

def test_health_endpoint(client):
    response = client.get('/health')
    assert response.status_code == 200
    data = json.loads(response.data)
    assert data['status'] == 'ok'

def test_subjects_get(client):
    response = client.get('/api/subjects')
    assert response.status_code == 200
    data = json.loads(response.data)
    assert 'subjects' in data
    assert isinstance(data['subjects'], list)

def test_subjects_post(client):
    response = client.post('/api/subjects', json={'name': 'Test Subject'})
    assert response.status_code in [200, 201]

def test_dashboard(client):
    response = client.get('/api/dashboard?user_id=test_user')
    assert response.status_code == 200
    data = json.loads(response.data)
    assert 'topics_studied' in data

def test_adaptive_quiz(client):
    response = client.get('/api/adaptive-quiz?user_id=test_user&subject=General')
    assert response.status_code == 200
    data = json.loads(response.data)
    assert 'questions' in data
    assert isinstance(data['questions'], list)

def test_revision_summary(client):
    response = client.post('/api/revision-summary', json={'text': 'Test text', 'subject': 'General'})
    assert response.status_code == 200
    data = json.loads(response.data)
    assert 'summary' in data

def test_notes_to_mcqs(client):
    response = client.post('/api/notes-to-mcqs', json={
        'subject': 'AIML Fundamentals',
        'source_type': 'text',
        'notes': 'Machine learning is a subset of AI that enables systems to learn from data.',
        'max_questions': 2
    })
    assert response.status_code == 200
    data = json.loads(response.data)
    assert 'questions' in data
    assert isinstance(data['questions'], list)

def test_quiz_submit(client):
    response = client.post('/api/quiz/submit', json={
        'user_id': 'test_user',
        'subject': 'AIML Fundamentals',
        'answers': [
            {'question_id': 'q1', 'selected': 0, 'correct': True},
            {'question_id': 'q2', 'selected': 1, 'correct': False}
        ]
    })
    assert response.status_code == 200
    data = json.loads(response.data)
    assert 'correct' in data
    assert 'total' in data
    assert 'accuracy' in data
    assert 'feedback' in data
def test_resources(client):
    response = client.get('/api/resources?subject=General')
    assert response.status_code == 200
    data = json.loads(response.data)
    assert 'resources' in data

def test_study_schedule(client):
    response = client.get('/api/study-schedule?subject=General&hours=5')
    assert response.status_code == 200
