# backend/tests/test_summarizer_api.py
"""
Test Summarizer API endpoint

Endpoint tested:
- POST /api/summarize
"""

import requests
import json

BASE_URL = "http://127.0.0.1:5000"

def test_summarize():
    """Test text summarization."""
    print("\n" + "="*60)
    print("TEST: POST /api/summarize")
    print("="*60)
    
    text = (
        "Machine learning is a field of artificial intelligence that focuses on "
        "building systems that learn from data. These systems can improve their "
        "performance on tasks over time without being explicitly programmed for "
        "every rule. Machine learning is widely used in recommendation systems, "
        "image recognition, natural language processing, and many other applications."
    )
    
    payload = {
        "text": text,
        "max_sentences": 2
    }
    
    print(f"Original text length: {len(text)} characters")
    print(f"Max sentences: 2")
    
    resp = requests.post(f"{BASE_URL}/api/summarize", json=payload)
    print(f"\nStatus: {resp.status_code}")
    data = resp.json()
    print(json.dumps(data, indent=2))
    return resp.status_code == 200

def test_summarize_empty():
    """Test summarization with empty text."""
    print("\n" + "="*60)
    print("TEST: POST /api/summarize (Empty Text)")
    print("="*60)
    
    payload = {
        "text": "",
        "max_sentences": 2
    }
    
    resp = requests.post(f"{BASE_URL}/api/summarize", json=payload)
    print(f"Status: {resp.status_code}")
    data = resp.json()
    print(json.dumps(data, indent=2))
    return resp.status_code == 400

if __name__ == "__main__":
    print("\n" + "#"*60)
    print("# SUMMARIZER API TEST SUITE")
    print("#"*60)
    
    results = {
        "summarize": test_summarize(),
        "empty_text": test_summarize_empty(),
    }
    
    print("\n" + "#"*60)
    print("# TEST SUMMARY")
    print("#"*60)
    for test_name, passed in results.items():
        status = "✓ PASS" if passed else "✗ FAIL"
        print(f"{status}: {test_name}")
