import numpy as np

TEMPLATES = {
    "high": [
        "Excellent work on {subject}! Keep pushing your limits.",
        "You are doing great in {subject}. Stay consistent.",
    ],
    "medium": [
        "Good job on {subject}. Review mistakes and try another quiz.",
        "Nice effort in {subject}. A bit more practice will boost your score.",
    ],
    "low": [
        "Do not worry about {subject}. Focus on key concepts and retry.",
        "Every expert started as a beginner in {subject}. Keep going.",
    ],
}

def generate_feedback_text(subject: str, accuracy: float) -> str:
    if accuracy >= 0.8:
        key = "high"
    elif accuracy >= 0.5:
        key = "medium"
    else:
        key = "low"
    import random

    template = random.choice(TEMPLATES[key])
    return template.format(subject=subject)
