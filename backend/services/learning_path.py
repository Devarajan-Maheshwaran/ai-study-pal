# backend/services/learning_path.py

from __future__ import annotations
import json
from collections import defaultdict
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parents[1]
DATA_DIR = BASE_DIR / "data"
USER_DATA_DIR = DATA_DIR / "users"
USER_DATA_DIR.mkdir(parents=True, exist_ok=True)


def _user_log_path(user_id: str) -> Path:
    return USER_DATA_DIR / f"{user_id}_quiz_log.json"


def _user_profile_path(user_id: str) -> Path:
    return USER_DATA_DIR / f"{user_id}_profile.json"


def load_quiz_log(user_id: str):
    path = _user_log_path(user_id)
    if not path.exists():
        return []
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)


def save_quiz_log(user_id: str, log):
    path = _user_log_path(user_id)
    with open(path, "w", encoding="utf-8") as f:
        json.dump(log, f, ensure_ascii=False, indent=2)


def log_quiz_result(user_id: str, result: dict):
    log = load_quiz_log(user_id)
    log.append(result)
    save_quiz_log(user_id, log)


def compute_topic_stats(user_id: str):
    log = load_quiz_log(user_id)
    stats = defaultdict(lambda: {
        "attempts": 0,
        "correct": 0,
        "easy": 0,
        "medium": 0,
        "hard": 0,
    })

    for entry in log:
        topic = entry.get("topic", "general")
        difficulty = entry.get("difficulty", "medium")
        correct = bool(entry.get("correct", False))
        s = stats[topic]
        s["attempts"] += 1
        if correct:
            s["correct"] += 1
        if difficulty in s:
            s[difficulty] += 1

    # compute accuracy
    for topic, s in stats.items():
        s["accuracy"] = s["correct"] / s["attempts"] if s["attempts"] else 0.0

    return stats


def generate_learning_path(user_id: str):
    stats = compute_topic_stats(user_id)

    weak_topics = []
    strong_topics = []

    for topic, s in stats.items():
        if s["attempts"] < 3:
            continue
        if s["accuracy"] < 0.6:
            weak_topics.append((topic, s))
        elif s["accuracy"] > 0.8:
            strong_topics.append((topic, s))

    next_steps = []

    for topic, s in weak_topics:
        next_steps.append({
            "type": "review",
            "topic": topic,
            "resource": "summary",
            "reason": "low_accuracy",
        })
        next_steps.append({
            "type": "quiz",
            "topic": topic,
            "difficulty": "easy",
            "count": 5,
        })

    for topic, s in strong_topics:
        next_steps.append({
            "type": "quiz",
            "topic": topic,
            "difficulty": "hard",
            "count": 3,
            "reason": "mastered_medium",
        })

    if not next_steps:
        next_steps.append({
            "type": "quiz",
            "topic": "general",
            "difficulty": "easy",
            "count": 5,
        })

    profile = {
        "user_id": user_id,
        "topic_stats": stats,
        "next_steps": next_steps,
    }

    with open(_user_profile_path(user_id), "w", encoding="utf-8") as f:
        json.dump(profile, f, ensure_ascii=False, indent=2)

    return profile
