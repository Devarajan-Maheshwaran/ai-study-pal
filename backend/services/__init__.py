# backend/services/__init__.py
"""
AI Study Pal Services Package

This package contains all AI/ML service modules:
- quiz_service: Quiz generation with difficulty classification
- summarizer_service: Text summarization using Keras DL
- nlp_service: Keyword extraction, study tips, resources
- feedback_service: Motivational feedback generation
- study_plan_service: AI study plan creation
"""

from .quiz_service import generate_quiz_for_topic
from .summarizer_service import summarize_text
from .nlp_service import extract_keywords, get_study_tips, get_resources
from .feedback_service import generate_feedback, calculate_performance_metrics
from .study_plan_service import generate_study_plan, study_plan_to_csv

__all__ = [
    "generate_quiz_for_topic",
    "summarize_text",
    "extract_keywords",
    "get_study_tips",
    "get_resources",
    "generate_feedback",
    "calculate_performance_metrics",
    "generate_study_plan",
    "study_plan_to_csv",
]
