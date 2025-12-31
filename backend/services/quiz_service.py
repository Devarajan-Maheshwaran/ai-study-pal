from models.quiz_model import generate_mcqs, classify_difficulty

def create_quiz_from_notes(notes, subject, max_questions=5):
    questions = generate_mcqs(notes, max_questions)
    question_texts = [q.get('question', q.get('stem', '')) for q in questions]
    difficulties = classify_difficulty(question_texts)
    for i, q in enumerate(questions):
        q['difficulty'] = difficulties[i] if i < len(difficulties) else 'medium'
        q['subject'] = subject
    return questions
