# backend/services/feedback_service.py
"""
Feedback Service Module

Handles motivational feedback generation and performance tracking.

Dependencies:
- random (for template selection)
- joblib (model loading)
- numpy (for calculations)

Static Models (loaded at startup):
- feedback_templates.joblib (Motivational feedback templates)
"""

import os
import random
import joblib
import numpy as np


class FeedbackService:
    """Service for generating motivational feedback and tracking progress."""
    
    def __init__(self, model_dir: str):
        """
        Initialize FeedbackService.
        
        Args:
            model_dir: Path to models directory
        """
        self.feedback_templates = None
        self._load_resources(model_dir)
    
    def _load_resources(self, model_dir: str):
        """Load feedback templates database."""
        templates_path = os.path.join(model_dir, "feedback_templates.joblib")
        self.feedback_templates = joblib.load(templates_path)
    
    def generate_feedback(
        self,
        score: float,
        topic: str = "",
        difficulty: str = "medium"
    ) -> str:
        """
        Generate motivational feedback based on score.
        
        Score ranges:
        - 0.8-1.0: "excellent" feedback
        - 0.6-0.8: "good" feedback
        - 0.4-0.6: "okay" feedback
        - 0.0-0.4: "needs_work" feedback
        
        Args:
            score: Quiz score between 0.0 and 1.0 (fraction correct)
            topic: Topic studied (optional, for context)
            difficulty: Difficulty level (optional)
        
        Returns:
            Motivational feedback string
        """
        # Clamp score between 0 and 1
        score = max(0.0, min(1.0, float(score)))
        
        # Categorize performance
        if score >= 0.8:
            level = "excellent"
        elif score >= 0.6:
            level = "good"
        elif score >= 0.4:
            level = "okay"
        else:
            level = "needs_work"
        
        # Select random feedback from level
        feedback_list = self.feedback_templates.get(level, ["Great effort!"])
        feedback_msg = random.choice(feedback_list)
        
        # Add topic context if provided
        if topic and isinstance(topic, str) and topic.strip():
            feedback_msg += f" Great work on {topic}!"
        
        return feedback_msg
    
    def calculate_performance_metrics(self, quiz_results: list) -> dict:
        """
        Calculate aggregate performance from quiz history.
        
        Args:
            quiz_results: List of quiz attempts, each with:
                {
                    "score": 0.0-1.0,
                    "difficulty": "easy"/"medium",
                    "topic": "subject"
                }
        
        Returns:
            Dictionary with:
            - avg_score: Average score across attempts
            - total_quizzes: Total number of quizzes taken
            - level: "beginner"/"intermediate"/"advanced"
            - trend: "improving"/"stable"/"declining"
            - strengths: Best-performing difficulties
            - areas_to_improve: Worst-performing difficulties
        """
        if not quiz_results or not isinstance(quiz_results, list):
            return {
                "avg_score": 0.0,
                "total_quizzes": 0,
                "level": "beginner",
                "trend": "stable",
                "message": "No quiz data yet. Start practicing!"
            }
        
        # Extract scores
        scores = [
            float(r.get("score", 0.5))
            for r in quiz_results
            if isinstance(r, dict)
        ]
        
        if not scores:
            return {
                "avg_score": 0.0,
                "total_quizzes": 0,
                "level": "beginner",
                "trend": "stable"
            }
        
        avg_score = np.mean(scores)
        
        # Determine skill level
        if avg_score >= 0.8:
            level = "advanced"
        elif avg_score >= 0.6:
            level = "intermediate"
        else:
            level = "beginner"
        
        # Determine trend (first vs last 3 quizzes)
        if len(scores) > 3:
            first_avg = np.mean(scores[:3])
            last_avg = np.mean(scores[-3:])
            if last_avg > first_avg + 0.1:
                trend = "improving"
            elif last_avg < first_avg - 0.1:
                trend = "declining"
            else:
                trend = "stable"
        else:
            trend = "stable"
        
        return {
            "avg_score": round(avg_score, 2),
            "total_quizzes": len(scores),
            "level": level,
            "trend": trend,
            "percentage_score": f"{avg_score * 100:.1f}%"
        }


# Initialize global feedback service
feedback_service = None

def init_feedback_service(model_dir: str):
    """Initialize the global feedback service (call from app.py startup)."""
    global feedback_service
    feedback_service = FeedbackService(model_dir)

def get_feedback_service() -> FeedbackService:
    """Get the global feedback service instance."""
    if feedback_service is None:
        raise RuntimeError("FeedbackService not initialized. Call init_feedback_service first.")
    return feedback_service

def generate_feedback(score: float, topic: str = "", difficulty: str = "medium") -> str:
    """Public function to generate feedback (called by Flask routes)."""
    return get_feedback_service().generate_feedback(score, topic, difficulty)

def calculate_performance_metrics(quiz_results: list) -> dict:
    """Public function to calculate metrics (called by Flask routes)."""
    return get_feedback_service().calculate_performance_metrics(quiz_results)
