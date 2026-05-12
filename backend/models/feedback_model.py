def generate_feedback_text(subject: str, accuracy: float) -> str:
    """
    Generate contextual performance feedback based on subject and accuracy score.
    accuracy is a float between 0 and 1.
    """
    pct = round(accuracy * 100, 1)

    if accuracy >= 0.9:
        return (
            f"Outstanding performance in {subject}! {pct}% accuracy shows deep mastery. "
            f"You're ready to tackle advanced topics. Consider exploring edge cases and "
            f"real-world applications to solidify your understanding."
        )
    elif accuracy >= 0.75:
        return (
            f"Strong work in {subject} with {pct}% accuracy. You have a solid foundation. "
            f"Review the questions you missed and identify any recurring weak patterns. "
            f"A focused revision session on those gaps will push you to excellence."
        )
    elif accuracy >= 0.6:
        return (
            f"Good effort in {subject} — {pct}% accuracy shows you understand the basics. "
            f"There are clear areas to improve. Revisit the concepts behind your wrong answers, "
            f"then retake the quiz to track your progress."
        )
    elif accuracy >= 0.4:
        return (
            f"You scored {pct}% in {subject}. This topic needs more attention. "
            f"Go back to your notes and focus on the concepts you struggled with. "
            f"Try summarizing each weak topic in your own words before attempting the quiz again."
        )
    else:
        return (
            f"Your score of {pct}% in {subject} tells us this material needs a fresh start. "
            f"Don't be discouraged — this is exactly what the adaptive system is for. "
            f"Start from the summary, revisit the source material, and take the quiz in smaller segments."
        )
