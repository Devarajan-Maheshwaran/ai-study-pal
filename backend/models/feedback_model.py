def generate_feedback_text(subject, accuracy):
    """Generate feedback based on accuracy."""
    if accuracy >= 0.8:
        return f"Excellent work on {subject}! Keep it up!"
    elif accuracy >= 0.6:
        return f"Good progress in {subject}. Review the concepts and try again."
    elif accuracy >= 0.4:
        return f"You're learning {subject}. More practice will help!"
    else:
        return f"Don't worry about {subject}. Let's review and practice more."
