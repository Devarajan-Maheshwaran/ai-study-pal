# backend/tests/test_nlp_api.py
"""
Test NLP API endpoints

Endpoints tested:
- POST /api/extract-keywords
- POST /api/study-tips
- POST /api/resources
"""

import requests
import json

BASE_URL = "http://127.0.0.1:5000"

def test_extract_keywords():
    """Test keyword extraction."""
    print("\n" + "="*60)
    print("TEST: POST /api/extract-keywords")
    print("="*60)
    
    text = (
        "Machine learning is a subset of artificial intelligence that enables "
        "systems to learn and improve from experience without being explicitly "
        "programmed. Neural networks and deep learning are key techniques."
    )
    
    payload = {
        "text": text,
        "top_n": 5
    }
    
    print(f"Text: {text[:80]}...")
    
    resp = requests.post(f"{BASE_URL}/api/extract-keywords", json=payload)
    print(f"\nStatus: {resp.status_code}")
    data = resp.json()
    print(json.dumps(data, indent=2))
    return resp.status_code == 200

def test_study_tips():
    """Test study tips generation."""
    print("\n" + "="*60)
    print("TEST: POST /api/study-tips")
    print("="*60)
    
    payload = {
        "keywords": ["machine learning", "python"]
    }
    
    print(f"Keywords: {payload['keywords']}")
    
    resp = requests.post(f"{BASE_URL}/api/study-tips", json=payload)
    print(f"\nStatus: {resp.status_code}")
    data = resp.json()
    print(json.dumps(data, indent=2))
    return resp.status_code == 200

def test_get_resources():
    """Test resource recommendation."""
    print("\n" + "="*60)
    print("TEST: POST /api/resources")
    print("="*60)
    
    payload = {
        "keywords": ["machine learning", "deep learning"]
    }
    
    print(f"Keywords: {payload['keywords']}")
    
    resp = requests.post(f"{BASE_URL}/api/resources", json=payload)
    print(f"\nStatus: {resp.status_code}")
    data = resp.json()
    print(json.dumps(data, indent=2))
    return resp.status_code == 200

if __name__ == "__main__":
    print("\n" + "#"*60)
    print("# NLP API TEST SUITE")
    print("#"*60)
    
    results = {
        "extract_keywords": test_extract_keywords(),
        "study_tips": test_study_tips(),
        "resources": test_get_resources(),
    }
    
    print("\n" + "#"*60)
    print("# TEST SUMMARY")
    print("#"*60)
    for test_name, passed in results.items():
        status = "✓ PASS" if passed else "✗ FAIL"
        print(f"{status}: {test_name}")
