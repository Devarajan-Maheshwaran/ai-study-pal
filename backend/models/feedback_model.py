def generate_feedback(accuracy, subject="General"):
    if accuracy >= 80:
        return f"Excellent work on {subject}! Keep it up! 🎉"
    elif accuracy >= 60:
        return f"Good job on {subject}! Practice more to improve. 💪"
    else:
        return f"Keep practicing {subject}! You'll improve soon. 📚"
