# backend/tests/test_full_api.py
"""
Full Integration Test Suite - All AI Study Pal APIs

Run all endpoints in sequence to verify full backend functionality.

Usage:
    python test_full_api.py
"""

import requests
import json

BASE_URL = "http://127.0.0.1:5000"

class Colors:
    """ANSI color codes for terminal output."""
    GREEN = '\033[92m'
    RED = '\033[91m'
    BLUE = '\033[94m'
    YELLOW = '\033[93m'
    END = '\033[0m'

def print_section(title):
    """Print a formatted section header."""
    print(f"\n{Colors.BLUE}{'='*70}")
    print(f"{title:^70}")
    print(f"{'='*70}{Colors.END}\n")

def print_success(msg):
    """Print a success message."""
    print(f"{Colors.GREEN}✓ {msg}{Colors.END}")

def print_error(msg):
    """Print an error message."""
    print(f"{Colors.RED}✗ {msg}{Colors.END}")

def test_health():
    """Test backend health check."""
    print_section("1. HEALTH CHECK")
    try:
        resp = requests.get(f"{BASE_URL}/api/ping")
        if resp.status_code == 200:
            print_success("Backend is running")
            print(f"  Services: {resp.json().get('services')}")
            return True
        else:
            print_error(f"Unexpected status code: {resp.status_code}")
            return False
    except Exception as e:
        print_error(f"Connection failed: {e}")
        return False

def test_quiz_module():
    """Test Quiz generation."""
    print_section("2. QUIZ MODULE")
    try:
        # Get topics
        resp = requests.get(f"{BASE_URL}/api/available-topics")
        if resp.status_code != 200:
            print_error("Failed to get available topics")
            return False
        
        topics = resp.json().get('available_topics', [])
        print_success(f"Found {len(topics)} topics: {topics[:2]}...")
        
        # Generate quiz
        if topics:
            payload = {"topic": topics[0], "num_questions": 3}
            resp = requests.post(f"{BASE_URL}/api/generate-quiz", json=payload)
            if resp.status_code == 200:
                data = resp.json()
                print_success(f"Generated {data.get('num_questions')} quiz questions")
                return True
            else:
                print_error(f"Failed to generate quiz: {resp.status_code}")
                return False
        else:
            print_error("No topics available")
            return False
    
    except Exception as e:
        print_error(f"Quiz module test failed: {e}")
        return False

def test_summarizer_module():
    """Test Text Summarization."""
    print_section("3. SUMMARIZER MODULE")
    try:
        text = (
            "Machine learning is a field of artificial intelligence that focuses on "
            "building systems that learn from data. These systems can improve their "
            "performance on tasks over time without being explicitly programmed for "
            "every rule. Machine learning is widely used in recommendation systems, "
            "image recognition, natural language processing, and many other applications."
        )
        
        payload = {"text": text, "max_sentences": 2}
        resp = requests.post(f"{BASE_URL}/api/summarize", json=payload)
        
        if resp.status_code == 200:
            data = resp.json()
            print_success("Text summarization successful")
            print(f"  Original: {data['original_length']} chars")
            print(f"  Summary: {data['summary_length']} chars")
            print(f"  Compression: {data['compression_ratio']}%")
            return True
        else:
            print_error(f"Summarization failed: {resp.status_code}")
            return False
    
    except Exception as e:
        print_error(f"Summarizer module test failed: {e}")
        return False

def test_nlp_module():
    """Test NLP (keywords, tips, resources)."""
    print_section("4. NLP MODULE")
    try:
        text = "Machine learning and neural networks are key areas of AI"
        
        # Extract keywords
        resp = requests.post(
            f"{BASE_URL}/api/extract-keywords",
            json={"text": text, "top_n": 3}
        )
        if resp.status_code != 200:
            print_error("Failed to extract keywords")
            return False
        
        keywords = resp.json().get('keywords', [])
        print_success(f"Extracted keywords: {keywords}")
        
        # Get study tips
        resp = requests.post(
            f"{BASE_URL}/api/study-tips",
            json={"keywords": keywords}
        )
        if resp.status_code != 200:
            print_error("Failed to get study tips")
            return False
        
        tips = resp.json().get('tips', [])
        print_success(f"Generated {len(tips)} study tips")
        
        # Get resources
        resp = requests.post(
            f"{BASE_URL}/api/resources",
            json={"keywords": keywords}
        )
        if resp.status_code != 200:
            print_error("Failed to get resources")
            return False
        
        resources = resp.json().get('resources', [])
        print_success(f"Found {len(resources)} learning resources")
        return True
    
    except Exception as e:
        print_error(f"NLP module test failed: {e}")
        return False

def test_feedback_module():
    """Test Feedback generation."""
    print_section("5. FEEDBACK MODULE")
    try:
        # Generate feedback
        resp = requests.post(
            f"{BASE_URL}/api/feedback",
            json={"score": 0.85, "topic": "Python basics"}
        )
        if resp.status_code != 200:
            print_error("Failed to generate feedback")
            return False
        
        feedback = resp.json().get('feedback')
        print_success(f"Generated feedback: '{feedback}'")
        
        # Calculate metrics
        quiz_results = [
            {"score": 0.6, "difficulty": "easy"},
            {"score": 0.75, "difficulty": "medium"},
            {"score": 0.85, "difficulty": "medium"},
        ]
        
        resp = requests.post(
            f"{BASE_URL}/api/performance-metrics",
            json={"quiz_results": quiz_results}
        )
        if resp.status_code != 200:
            print_error("Failed to calculate metrics")
            return False
        
        metrics = resp.json()
        print_success(f"Performance level: {metrics.get('level')} (Trend: {metrics.get('trend')})")
        return True
    
    except Exception as e:
        print_error(f"Feedback module test failed: {e}")
        return False

def test_study_plan_module():
    """Test Study Plan generation."""
    print_section("6. STUDY PLAN MODULE")
    try:
        # Get available subjects
        resp = requests.get(f"{BASE_URL}/api/available-subjects")
        if resp.status_code != 200:
            print_error("Failed to get available subjects")
            return False
        
        subjects = resp.json().get('available_subjects', [])
        print_success(f"Found {len(subjects)} subjects")
        
        # Generate plan
        if subjects:
            payload = {
                "subject": subjects[0],
                "total_hours": 10,
                "difficulty": "easy"
            }
            resp = requests.post(f"{BASE_URL}/api/generate-study-plan", json=payload)
            
            if resp.status_code != 200:
                print_error(f"Failed to generate study plan: {resp.status_code}")
                return False
            
            plan = resp.json()
            print_success(f"Generated plan for {plan['num_days']} days")
            print(f"  Hours per day: {plan['hours_per_day']}")
            print(f"  Days: {plan['num_days']}")
            return True
        else:
            print_error("No subjects available")
            return False
    
    except Exception as e:
        print_error(f"Study plan module test failed: {e}")
        return False

def main():
    """Run all tests."""
    print(f"\n{Colors.YELLOW}")
    print("╔" + "="*68 + "╗")
    print("║" + " "*68 + "║")
    print("║" + "AI STUDY PAL - FULL INTEGRATION TEST SUITE".center(68) + "║")
    print("║" + " "*68 + "║")
    print("╚" + "="*68 + "╝")
    print(f"{Colors.END}")
    
    results = {
        "Health Check": test_health(),
        "Quiz Module": test_quiz_module(),
        "Summarizer Module": test_summarizer_module(),
        "NLP Module": test_nlp_module(),
        "Feedback Module": test_feedback_module(),
        "Study Plan Module": test_study_plan_module(),
        "MCQ Generator Module": test_mcq_module(),
        "Learning Path Module": test_learning_path_module(),
    }
    
    # Summary
    print_section("TEST SUMMARY")
    
    passed = sum(1 for v in results.values() if v)
    total = len(results)
    
    for test_name, passed_flag in results.items():
        status = f"{Colors.GREEN}✓ PASS{Colors.END}" if passed_flag else f"{Colors.RED}✗ FAIL{Colors.END}"
        print(f"{status}: {test_name}")
    
    print(f"\n{Colors.BLUE}Overall: {passed}/{total} tests passed{Colors.END}")
    
    if passed == total:
        print(f"{Colors.GREEN}🎉 All tests passed! Backend is fully operational.{Colors.END}\n")
        return 0
    else:
        print(f"{Colors.RED}⚠️  Some tests failed. Check the errors above.{Colors.END}\n")
        return 1

if __name__ == "__main__":
    exit(main())
