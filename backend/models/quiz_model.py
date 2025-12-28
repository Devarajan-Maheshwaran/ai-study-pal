import json
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
import random

class QuizModel:
    def __init__(self):
        self.vectorizer = TfidfVectorizer(max_features=100)
        self.classifier = LogisticRegression(random_state=42)
    
    def generate_quizzes(self, text, subject="General", num_questions=5):
        sentences = text.split('.')
        quizzes = []
        for i, sent in enumerate(sentences[:num_questions]):
            if len(sent.strip()) > 10:
                words = sent.split()
                if len(words) > 5:
                    blank_idx = random.randint(1, len(words)-2)
                    blank_word = words[blank_idx]
                    question_text = ' '.join(words[:blank_idx] + ['____'] + words[blank_idx+1:])
                    quizzes.append({
                        'id': i+1,
                        'question': question_text,
                        'difficulty': 'easy' if len(words) < 15 else 'medium',
                        'answer': blank_word,
                        'subject': subject
                    })
        return quizzes[:num_questions]
