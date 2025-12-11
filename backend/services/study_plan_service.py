# backend/services/study_plan_service.py
"""
Study Plan Service Module

Handles AI-powered study plan generation based on subject, hours, and difficulty.

Dependencies:
- joblib (database loading)

Static Models (loaded at startup):
- study_plan_templates.joblib (Study plan templates by subject/difficulty)
"""

import os
import joblib
from datetime import datetime, timedelta


class StudyPlanService:
    """Service for generating and managing study plans."""
    
    def __init__(self, model_dir: str):
        """
        Initialize StudyPlanService.
        
        Args:
            model_dir: Path to models directory
        """
        self.templates = None
        self._load_resources(model_dir)
    
    def _load_resources(self, model_dir: str):
        """Load study plan templates."""
        templates_path = os.path.join(model_dir, "study_plan_templates.joblib")
        self.templates = joblib.load(templates_path)
    
    def generate_plan(self, subject: str, total_hours: int, difficulty: str = "medium") -> dict:
        """
        Generate a structured AI study plan.
        
        The plan distributes topics across days with time allocations,
        creating a realistic learning schedule.
        
        Args:
            subject: Topic to study (e.g., "Python basics")
            total_hours: Total hours available for study
            difficulty: "easy" or "medium"
        
        Returns:
            Dictionary with daily study breakdown
        
        Example return:
        {
            "subject": "Python basics",
            "difficulty": "easy",
            "total_hours": 10,
            "num_days": 5,
            "hours_per_day": 2.0,
            "daily_schedule": [
                {
                    "day": 1,
                    "topics": ["Introduction to Python syntax", "..."],
                    "minutes_per_topic": 30,
                    "total_minutes": 120
                },
                ...
            ]
        }
        """
        # Validate inputs
        if subject not in self.templates:
            available = list(self.templates.keys())
            return {
                "error": f"Subject '{subject}' not found",
                "available_subjects": available
            }
        
        if difficulty not in self.templates[subject]:
            available_diffs = list(self.templates[subject].keys())
            return {
                "error": f"Difficulty '{difficulty}' not available for '{subject}'",
                "available_difficulties": available_diffs
            }
        
        if not isinstance(total_hours, (int, float)) or total_hours <= 0:
            return {"error": "total_hours must be a positive number"}
        
        topics = self.templates[subject][difficulty]
        num_topics = len(topics)
        
        # Determine optimal number of study days (3-7 days)
        num_days = max(3, min(7, num_topics))
        
        hours_per_day = total_hours / num_days
        minutes_per_day = hours_per_day * 60
        minutes_per_topic = int(minutes_per_day / (num_topics / num_days))
        
        plan = {
            "subject": subject,
            "difficulty": difficulty,
            "total_hours": total_hours,
            "num_days": num_days,
            "hours_per_day": round(hours_per_day, 1),
            "created_at": datetime.now().isoformat(),
            "daily_schedule": []
        }
        
        # Distribute topics across days
        topics_per_day = num_topics / num_days
        
        for day in range(num_days):
            start_idx = int(day * topics_per_day)
            end_idx = int((day + 1) * topics_per_day)
            day_topics = topics[start_idx:end_idx]
            
            plan["daily_schedule"].append({
                "day": day + 1,
                "topics": day_topics,
                "minutes_per_topic": minutes_per_topic,
                "total_minutes": len(day_topics) * minutes_per_topic,
            })
        
        return plan
    
    def study_plan_to_csv(self, plan: dict) -> str:
        """
        Convert study plan to downloadable CSV format.
        
        Args:
            plan: Study plan dictionary (output from generate_plan)
        
        Returns:
            CSV string that can be saved as .csv file
        """
        if "error" in plan:
            return f"Error,{plan['error']}"
        
        lines = [
            f"Study Plan: {plan['subject']}",
            f"Difficulty: {plan['difficulty']}",
            f"Total Hours: {plan['total_hours']}",
            f"Days: {plan['num_days']}",
            f"Generated: {plan.get('created_at', 'N/A')}",
            "",
            "Day,Topics,Minutes"
        ]
        
        for day in plan["daily_schedule"]:
            day_num = day["day"]
            topics_str = " | ".join(day["topics"])
            total_min = day["total_minutes"]
            lines.append(f"{day_num},\"{topics_str}\",{total_min}")
        
        return "\n".join(lines)
    
    def get_available_subjects(self) -> list:
        """Get all available subjects for study plans."""
        return list(self.templates.keys())
    
    def get_available_difficulties(self, subject: str) -> list:
        """Get available difficulty levels for a subject."""
        if subject in self.templates:
            return list(self.templates[subject].keys())
        return []


# Initialize global study plan service
study_plan_service = None

def init_study_plan_service(model_dir: str):
    """Initialize the global study plan service (call from app.py startup)."""
    global study_plan_service
    study_plan_service = StudyPlanService(model_dir)

def get_study_plan_service() -> StudyPlanService:
    """Get the global study plan service instance."""
    if study_plan_service is None:
        raise RuntimeError("StudyPlanService not initialized. Call init_study_plan_service first.")
    return study_plan_service

def generate_study_plan(subject: str, total_hours: int, difficulty: str = "medium") -> dict:
    """Public function to generate study plan (called by Flask routes)."""
    return get_study_plan_service().generate_plan(subject, total_hours, difficulty)

def study_plan_to_csv(plan: dict) -> str:
    """Public function to convert plan to CSV (called by Flask routes)."""
    return get_study_plan_service().study_plan_to_csv(plan)
