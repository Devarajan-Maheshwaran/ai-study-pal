import random
from models.quiz_model import classify_difficulty
from models.nlp_utils import extract_keywords

def simple_question_generator(text, max_questions=5):
    """
    Very basic MCQ generator: use keywords as blanks.
    """
    sentences = [s.strip() for s in text.split(".") if len(s.split()) > 4]
    questions = []
    for sent in sentences[: max_questions * 2]:
        keys = extract_keywords(sent, top_k=1)
        if not keys:
            continue
        ans = keys[0]
        stem = sent.replace(ans, "_____")
        options = [ans, ans[::-1], ans + "s", ans.title()]
        random.shuffle(options)
        questions.append(
            {
                "id": len(questions) + 1,
                "stem": stem,
                "options": options,
                "answer": ans,
            }
        )
        if len(questions) >= max_questions:
            break
    return questions

def generate_quiz_from_notes(text, subject, max_questions):
    base_qs = simple_question_generator(text, max_questions)
    # classify difficulty using logistic regression
    stems = [q["stem"] for q in base_qs]
    diffs = classify_difficulty(stems)
    for q, d in zip(base_qs, diffs):
        q["difficulty"] = d
        q["subject"] = subject
    return base_qs

def get_adaptive_quiz(user_id, subject, difficulty=None, n_questions=5):
    """
    Simple rule: if difficulty missing, select mix; else filter.
    Full adaptivity would read user history from DB. [file:15]
    """
    # In real version, regenerate from stored notes for that subject
    dummy_text = (
        f"This is a placeholder text for {subject}. "
        "Machine learning and deep learning are important topics. "
        "Neural networks and optimization are covered."
    )
    qs = generate_quiz_from_notes(dummy_text, subject, n_questions * 2)
    if difficulty:
        qs = [q for q in qs if q["difficulty"] == difficulty][:n_questions]
    else:
        qs = qs[:n_questions]
    return qs
