# backend/services/quiz_service.py
"""
Quiz Service Module

Handles quiz generation, difficulty classification, and topic-based filtering.

Dependencies:
- pandas (data manipulation)
- scikit-learn (ML models)
- joblib (model loading)

Trained Models (loaded at startup):
- quiz_difficulty_clf.joblib (LogisticRegression classifier)
- quiz_vectorizer.joblib (CountVectorizer for feature extraction)
- quiz_samples.csv (quiz database)
"""

import os
import random
import pandas as pd
import joblib

class QuizService:
    """Service for generating and managing quizzes."""
    
    def __init__(self, data_path: str, model_dir: str):
        """
        Initialize QuizService with data and models.
        
        Args:
            data_path: Path to quiz_samples.csv
            model_dir: Path to models directory
        """
        self.quiz_df = None
        self.clf = None
        self.vectorizer = None
        
        self._load_resources(data_path, model_dir)
    
    def _load_resources(self, data_path: str, model_dir: str):
        """Load quiz CSV, classifier, and vectorizer."""
        # Load quiz database
        self.quiz_df = pd.read_csv(data_path)
        
        # Ensure standard column names
        self.quiz_df = self.quiz_df.rename(columns={
            self.quiz_df.columns[0]: "question",
            self.quiz_df.columns[1]: "answer",
            self.quiz_df.columns[2]: "topic",
            self.quiz_df.columns[3]: "difficulty"
        })
        
        # Clean data
        self.quiz_df["difficulty"] = (
            self.quiz_df["difficulty"].astype(str).str.lower().str.strip()
        )
        self.quiz_df = self.quiz_df.dropna(subset=["question", "answer", "topic"])
        self.quiz_df = self.quiz_df[self.quiz_df["question"].str.strip() != ""]
        self.quiz_df = self.quiz_df.reset_index(drop=True)
        
        # Load trained models
        clf_path = os.path.join(model_dir, "quiz_difficulty_clf.joblib")
        vec_path = os.path.join(model_dir, "quiz_vectorizer.joblib")
        
        self.clf = joblib.load(clf_path)
        self.vectorizer = joblib.load(vec_path)
    
    def generate_quiz(self, topic: str, num_questions: int) -> dict:
        """
        Generate quiz questions for a given topic.
        
        Args:
            topic: Subject/topic for quiz (e.g., "Python basics")
            num_questions: Number of questions to generate
        
        Returns:
            Dictionary with quiz items and metadata
        
        Raises:
            ValueError: If topic not found or invalid num_questions
        """
        if not topic or not isinstance(topic, str):
            raise ValueError("topic must be a non-empty string")
        
        if not isinstance(num_questions, int) or num_questions <= 0:
            raise ValueError("num_questions must be a positive integer")
        
        # Filter by topic (case insensitive)
        topic_mask = self.quiz_df["topic"].str.lower().str.contains(
            topic.lower(), na=False
        )
        topic_questions = self.quiz_df[topic_mask]
        
        if topic_questions.empty:
            return {
                "error": f"No questions found for topic: {topic}",
                "topic": topic,
                "available_topics": self.quiz_df["topic"].unique().tolist()
            }
        
        # Sample questions (adjust if more requested than available)
        num_questions = min(num_questions, len(topic_questions))
        sampled = topic_questions.sample(
            n=num_questions,
            random_state=random.randint(0, 9999)
        ).copy()
        
        # Predict difficulty using trained ML model
        questions_text = sampled["question"].tolist()
        X_vec = self.vectorizer.transform(questions_text)
        predicted_difficulties = self.clf.predict(X_vec)
        
        sampled["predicted_difficulty"] = predicted_difficulties
        
        # Format response
        quiz_items = []
        for idx, row in sampled.iterrows():
            quiz_items.append({
                "id": int(idx),
                "question": row["question"],
                "answer": row["answer"],
                "topic": row["topic"],
                "difficulty": row["difficulty"],
                "predicted_difficulty": row["predicted_difficulty"]
            })
        
        return {
            "topic": topic,
            "num_questions": len(quiz_items),
            "items": quiz_items
        }
    
    def get_available_topics(self) -> list:
        """Get list of all available quiz topics."""
        return self.quiz_df["topic"].unique().tolist()


# Initialize global quiz service (loaded by app.py)
quiz_service = None

def init_quiz_service(data_path: str, model_dir: str):
    """Initialize the global quiz service (call from app.py startup)."""
    global quiz_service
    quiz_service = QuizService(data_path, model_dir)

def get_quiz_service() -> QuizService:
    """Get the global quiz service instance."""
    if quiz_service is None:
        raise RuntimeError("QuizService not initialized. Call init_quiz_service first.")
    return quiz_service

def generate_quiz_for_topic(topic: str, num_questions: int) -> dict:
    """Public function to generate quiz (called by Flask routes)."""
    return get_quiz_service().generate_quiz(topic, num_questions)
