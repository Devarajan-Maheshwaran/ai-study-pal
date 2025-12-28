from models.quiz_model import QuizModel

quiz_model = QuizModel()

def generate_adaptive_quiz(text, subject, difficulty='easy'):
    quizzes = quiz_model.generate_quizzes(text, subject)
    if difficulty == 'medium':
        return quizzes
    elif difficulty == 'easy':
        return [q for q in quizzes if q['difficulty'] == 'easy']
    return quizzes

def evaluate_quiz(answers):
    correct = sum(1 for a in answers if a.get('is_correct'))
    total = len(answers)
    accuracy = (correct / total * 100) if total > 0 else 0
    return {'correct': correct, 'total': total, 'accuracy': accuracy}
