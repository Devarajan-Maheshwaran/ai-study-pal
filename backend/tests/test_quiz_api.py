# backend/tests/test_quiz_api.py
"""
Test Quiz API endpoints

Endpoints tested:
- POST /api/generate-quiz
- GET /api/available-topics
"""

import requests
import json

BASE_URL = "http://127.0.0.1:5000"

def test_available_topics():
    """Test fetching available quiz topics."""
    print("\n" + "="*60)
    print("TEST: GET /api/available-topics")
    print("="*60)
    
    resp = requests.get(f"{BASE_URL}/api/available-topics")
    print(f"Status: {resp.status_code}")
    data = resp.json()
    print(json.dumps(data, indent=2))
    return resp.status_code == 200

def test_generate_quiz():
    """Test quiz generation for a topic."""
    print("\n" + "="*60)
    print("TEST: POST /api/generate-quiz")
    print("="*60)
    
    payload = {
        "topic": "Python basics",
        "num_questions": 3
    }
    print(f"Payload: {json.dumps(payload, indent=2)}")
    
    resp = requests.post(f"{BASE_URL}/api/generate-quiz", json=payload)
    print(f"Status: {resp.status_code}")
    data = resp.json()
    print(json.dumps(data, indent=2))
    return resp.status_code == 200

def test_generate_quiz_invalid_topic():
    """Test quiz generation with invalid topic."""
    print("\n" + "="*60)
    print("TEST: POST /api/generate-quiz (Invalid Topic)")
    print("="*60)
    
    payload = {
        "topic": "NonexistentTopic12345",
        "num_questions": 3
    }
    print(f"Payload: {json.dumps(payload, indent=2)}")
    
    resp = requests.post(f"{BASE_URL}/api/generate-quiz", json=payload)
    print(f"Status: {resp.status_code}")
    data = resp.json()
    print(json.dumps(data, indent=2))
    return resp.status_code == 404

if __name__ == "__main__":
    print("\n" + "#"*60)
    print("# QUIZ API TEST SUITE")
    print("#"*60)
    
    results = {
        "available_topics": test_available_topics(),
        "generate_quiz": test_generate_quiz(),
        "invalid_topic": test_generate_quiz_invalid_topic(),
    }
    
    print("\n" + "#"*60)
    print("# TEST SUMMARY")
    print("#"*60)
    for test_name, passed in results.items():
        status = "✓ PASS" if passed else "✗ FAIL"
        print(f"{status}: {test_name}")
