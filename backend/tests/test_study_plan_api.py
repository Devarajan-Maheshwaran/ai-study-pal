# backend/tests/test_study_plan_api.py
"""
Test Study Plan API endpoints

Endpoints tested:
- GET /api/available-subjects
- POST /api/generate-study-plan
- POST /api/study-plan-csv
"""

import requests
import json

BASE_URL = "http://127.0.0.1:5000"

def test_available_subjects():
    """Test fetching available study subjects."""
    print("\n" + "="*60)
    print("TEST: GET /api/available-subjects")
    print("="*60)
    
    resp = requests.get(f"{BASE_URL}/api/available-subjects")
    print(f"Status: {resp.status_code}")
    data = resp.json()
    print(json.dumps(data, indent=2))
    return resp.status_code == 200

def test_generate_study_plan():
    """Test AI study plan generation."""
    print("\n" + "="*60)
    print("TEST: POST /api/generate-study-plan")
    print("="*60)
    
    payload = {
        "subject": "Python basics",
        "total_hours": 10,
        "difficulty": "easy"
    }
    
    print(f"Payload: {json.dumps(payload, indent=2)}")
    
    resp = requests.post(f"{BASE_URL}/api/generate-study-plan", json=payload)
    print(f"\nStatus: {resp.status_code}")
    data = resp.json()
    print(json.dumps(data, indent=2))
    
    return resp.status_code == 200, data

def test_study_plan_csv(plan):
    """Test CSV download of study plan."""
    print("\n" + "="*60)
    print("TEST: POST /api/study-plan-csv")
    print("="*60)
    
    payload = {"plan": plan}
    
    resp = requests.post(f"{BASE_URL}/api/study-plan-csv", json=payload)
    print(f"Status: {resp.status_code}")
    print(f"Content-Type: {resp.headers.get('Content-Type')}")
    print(f"Content length: {len(resp.content)} bytes")
    print(f"\nCSV Preview:\n{resp.text[:300]}...")
    
    return resp.status_code == 200

if __name__ == "__main__":
    print("\n" + "#"*60)
    print("# STUDY PLAN API TEST SUITE")
    print("#"*60)
    
    test1_passed = test_available_subjects()
    test2_passed, plan = test_generate_study_plan()
    test3_passed = test_study_plan_csv(plan) if test2_passed else False
    
    results = {
        "available_subjects": test1_passed,
        "generate_study_plan": test2_passed,
        "study_plan_csv": test3_passed,
    }
    
    print("\n" + "#"*60)
    print("# TEST SUMMARY")
    print("#"*60)
    for test_name, passed in results.items():
        status = "✓ PASS" if passed else "✗ FAIL"
        print(f"{status}: {test_name}")
