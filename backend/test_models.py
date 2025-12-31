#!/usr/bin/env python3
"""
Test script to verify all ML models are properly trained and working.
"""

import os
import sys
sys.path.append(os.path.dirname(__file__))

from models.quiz_model import generate_mcqs, load_kmeans_model
from models.summarizer_model import summarize_text
from models.nlp_utils import extract_keywords, generate_study_tips
from models.feedback_model import generate_feedback_text

def test_quiz_model():
    """Test quiz generation model."""
    print("Testing Quiz Model...")
    text = "Machine learning is a subset of artificial intelligence. It uses algorithms to learn from data."
    questions = generate_mcqs(text, num_questions=2)
    print(f"Generated {len(questions)} questions")
    for q in questions:
        print(f"  - {q['stem']}")
    assert len(questions) > 0, "No questions generated"
    print("✅ Quiz model working")

def test_kmeans_model():
    """Test KMeans topic clustering."""
    print("Testing KMeans Model...")
    kmeans, tfidf = load_kmeans_model()
    sample_text = ["Machine learning algorithms are powerful"]
    X = tfidf.transform(sample_text)
    clusters = kmeans.predict(X)
    print(f"Predicted cluster: {clusters[0]}")
    assert clusters[0] >= 0, "Invalid cluster prediction"
    print("✅ KMeans model working")

def test_summarizer_model():
    """Test text summarization."""
    print("Testing Summarizer Model...")
    text = "Machine learning is important. Deep learning uses neural networks. Data science involves statistics."
    summary = summarize_text(text)
    print(f"Summary: {summary}")
    assert len(summary) > 0, "Empty summary"
    print("✅ Summarizer model working")

def test_nlp_utils():
    """Test NLP keyword extraction and tips generation."""
    print("Testing NLP Utils...")
    text = "Machine learning algorithms include supervised and unsupervised learning."
    keywords = extract_keywords(text)
    tips = generate_study_tips(keywords)
    print(f"Keywords: {keywords}")
    print(f"Tips: {tips}")
    assert len(keywords) > 0, "No keywords extracted"
    assert len(tips) > 0, "No tips generated"
    print("✅ NLP utils working")

def test_feedback_model():
    """Test feedback generation."""
    print("Testing Feedback Model...")
    feedback = generate_feedback_text("Math", 85)
    print(f"Feedback: {feedback}")
    assert len(feedback) > 0, "Empty feedback"
    print("✅ Feedback model working")

if __name__ == "__main__":
    print("🔍 Testing all ML models...\n")
    try:
        test_quiz_model()
        test_kmeans_model()
        test_summarizer_model()
        test_nlp_utils()
        test_feedback_model()
        print("\n🎉 All models are working correctly!")
    except Exception as e:
        print(f"\n❌ Model test failed: {e}")
        sys.exit(1)
