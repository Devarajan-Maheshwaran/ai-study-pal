from typing import List, Dict
import os
import pandas as pd
from config import Config
from datetime import datetime

# Minimal persistence using CSV; for simplicity instead of full SQLAlchemy
SUBJECTS = [
    "AIML Fundamentals",
    "Python Basics",
]

DATA_SUBJECTS_PATH = os.path.join(Config.DATA_DIR, "educational_texts.csv")
PROGRESS_PATH = os.path.join(Config.DATA_DIR, "user_progress.csv")

def get_available_subjects() -> List[str]:
    subs = set(SUBJECTS)
    if os.path.exists(DATA_SUBJECTS_PATH):
        df = pd.read_csv(DATA_SUBJECTS_PATH)
        if "subject" in df.columns:
            subs.update(df["subject"].dropna().unique().tolist())
    return sorted(subs)

def save_user_progress(user_id: str, subject: str, correct: int, total: int):
    acc = correct / (total or 1)
    row = {
        "user_id": user_id,
        "subject": subject,
        "correct": correct,
        "total": total,
        "accuracy": acc,
        "timestamp": datetime.utcnow().isoformat(),
    }
    if os.path.exists(PROGRESS_PATH):
        df = pd.read_csv(PROGRESS_PATH)
        df = pd.concat([df, pd.DataFrame([row])], ignore_index=True)
    else:
        df = pd.DataFrame([row])
    os.makedirs(Config.DATA_DIR, exist_ok=True)
    df.to_csv(PROGRESS_PATH, index=False)

def get_user_dashboard(user_id: str) -> Dict:
    if not os.path.exists(PROGRESS_PATH):
        return {
            "topics_studied": 0,
            "total_attempts": 0,
            "correct_answers": 0,
            "avg_accuracy": 0,
            "per_subject": [],
        }
    df = pd.read_csv(PROGRESS_PATH)
    df_user = df[df["user_id"] == user_id]
    if df_user.empty:
        return {
            "topics_studied": 0,
            "total_attempts": 0,
            "correct_answers": 0,
            "avg_accuracy": 0,
            "per_subject": [],
        }
    per_subject = (
        df_user.groupby("subject")
        .agg(
            attempts=("total", "sum"),
            correct=("correct", "sum"),
            avg_accuracy=("accuracy", "mean"),
        )
        .reset_index()
        .to_dict(orient="records")
    )
    total_attempts = int(df_user["total"].sum())
    correct_answers = int(df_user["correct"].sum())
    avg_accuracy = float(df_user["accuracy"].mean())

    return {
        "topics_studied": len(per_subject),
        "total_attempts": total_attempts,
        "correct_answers": correct_answers,
        "avg_accuracy": avg_accuracy,
        "per_subject": per_subject,
    }
