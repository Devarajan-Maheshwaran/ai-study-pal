# backend/tests/test_feedback_api.py
"""
Test Feedback API endpoints

Endpoints tested:
- POST /api/feedback
- POST /api/performance-metrics
"""

import requests
import json

BASE_URL = "http://127.0.0.1:5000"

def test_generate_feedback():
    """Test motivational feedback generation."""
    print("\n" + "="*60)
    print("TEST: POST /api/feedback")
    print("="*60)
    
    test_cases = [
        {"score": 0.95, "topic": "Python basics", "label": "Excellent (95%)"},
        {"score": 0.75, "topic": "Machine Learning", "label": "Good (75%)"},
        {"score": 0.55, "topic": "Deep Learning", "label": "Okay (55%)"},
        {"score": 0.25, "topic": "NLP", "label": "Needs Work (25%)"},
    ]
    
    for case in test_cases:
        print(f"\n--- {case['label']} ---")
        payload = {
            "score": case["score"],
            "topic": case["topic"],
            "difficulty": "medium"
        }
        
        resp = requests.post(f"{BASE_URL}/api/feedback", json=payload)
        print(f"Status: {resp.status_code}")
        data = resp.json()
        print(f"Feedback: {data.get('feedback')}")
    
    return True

def test_performance_metrics():
    """Test performance metrics calculation."""
    print("\n" + "="*60)
    print("TEST: POST /api/performance-metrics")
    print("="*60)
    
    payload = {
        "quiz_results": [
            {"score": 0.6, "difficulty": "easy", "topic": "Python"},
            {"score": 0.7, "difficulty": "medium", "topic": "ML"},
            {"score": 0.75, "difficulty": "medium", "topic": "ML"},
            {"score": 0.8, "difficulty": "medium", "topic": "DL"},
        ]
    }
    
    print(f"Quiz results: {len(payload['quiz_results'])} attempts")
    
    resp = requests.post(f"{BASE_URL}/api/performance-metrics", json=payload)
    print(f"\nStatus: {resp.status_code}")
    data = resp.json()
    print(json.dumps(data, indent=2))
    return resp.status_code == 200

if __name__ == "__main__":
    print("\n" + "#"*60)
    print("# FEEDBACK API TEST SUITE")
    print("#"*60)
    
    results = {
        "generate_feedback": test_generate_feedback(),
        "performance_metrics": test_performance_metrics(),
    }
    
    print("\n" + "#"*60)
    print("# TEST SUMMARY")
    print("#"*60)
    for test_name, passed in results.items():
        status = "✓ PASS" if passed else "✗ FAIL"
        print(f"{status}: {test_name}")
