from models.quiz_model import generate_mcqs, classify_difficulty


def create_quiz_from_notes(
    text: str,
    subject: str = "General",
    num_questions: int = 10,
) -> list[dict]:
    """
    Generate a full quiz from raw text with difficulty classification.
    """
    questions = generate_mcqs(text, num_questions=num_questions)
    if not questions:
        return []

    stems = [q.get("question", "") for q in questions]
    difficulties = classify_difficulty(stems) if stems else []

    for i, q in enumerate(questions):
        q["difficulty"] = difficulties[i] if i < len(difficulties) else "medium"
        q["subject"] = subject

    return questions
