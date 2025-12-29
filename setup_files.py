import os
from pathlib import Path

BACK = '/workspaces/ai-study-pal/backend'
FRONT = '/workspaces/ai-study-pal/frontend'

# ============ BACKEND MODELS ============

# models/quiz_model.py
quiz_model = '''from sklearn.feature_extraction.text import CountVectorizer
from sklearn.linear_model import LogisticRegression
import pickle
import os

MODEL_PATH = os.path.join(os.path.dirname(__file__), '..', 'data', 'quiz_model.pkl')
VECTORIZER_PATH = os.path.join(os.path.dirname(__file__), '..', 'data', 'vectorizer.pkl')

def train_quiz_models():
    """Train models for difficulty classification."""
    easy = ["What is 2+2?", "What is the capital of France?", "Define photosynthesis?"]
    medium = ["Explain evolution?", "Describe quantum mechanics?", "What is mitosis?"]
    
    all_texts = easy + medium
    all_labels = [0]*len(easy) + [1]*len(medium)
    
    os.makedirs(os.path.dirname(MODEL_PATH), exist_ok=True)
    
    vectorizer = CountVectorizer(max_features=100)
    X = vectorizer.fit_transform(all_texts)
    model = LogisticRegression(random_state=42, max_iter=200)
    model.fit(X, all_labels)
    
    with open(MODEL_PATH, 'wb') as f:
        pickle.dump(model, f)
    with open(VECTORIZER_PATH, 'wb') as f:
        pickle.dump(vectorizer, f)
    
    return model, vectorizer

def load_quiz_models():
    """Load or train models."""
    if not os.path.exists(MODEL_PATH):
        return train_quiz_models()
    with open(MODEL_PATH, 'rb') as f:
        model = pickle.load(f)
    with open(VECTORIZER_PATH, 'rb') as f:
        vectorizer = pickle.load(f)
    return model, vectorizer

def classify_difficulty(questions):
    """Classify difficulty of questions."""
    try:
        model, vectorizer = load_quiz_models()
        X = vectorizer.transform(questions)
        preds = model.predict(X)
        return ["easy" if p == 0 else "medium" for p in preds]
    except:
        return ["easy"] * len(questions)
'''

with open(f'{BACK}/models/quiz_model.py', 'w') as f:
    f.write(quiz_model)

print('✓ quiz_model.py')

# models/summarizer_model.py
summarizer = '''import os
import pickle

MODEL_PATH = os.path.join(os.path.dirname(__file__), '..', 'data', 'summarizer.pkl')

def train_dummy_summarizer():
    """Train dummy summarizer (just store a flag)."""
    os.makedirs(os.path.dirname(MODEL_PATH), exist_ok=True)
    with open(MODEL_PATH, 'wb') as f:
        pickle.dump({'trained': True}, f)

def summarize_text(text, max_sentences=3):
    """Extract first few sentences as summary."""
    sentences = [s.strip() for s in text.split('.') if s.strip()]
    return ' '.join(sentences[:max_sentences])
'''

with open(f'{BACK}/models/summarizer_model.py', 'w') as f:
    f.write(summarizer)

print('✓ summarizer_model.py')

# models/nlp_utils.py
nlp_utils = '''from nltk.tokenize import word_tokenize
from nltk.corpus import stopwords
import re

def extract_keywords(text, num_keywords=5):
    """Extract keywords from text."""
    try:
        import nltk
        nltk.download('punkt', quiet=True)
        nltk.download('stopwords', quiet=True)
        words = word_tokenize(text.lower())
        stop = set(stopwords.words('english'))
        keywords = [w for w in words if w.isalnum() and w not in stop]
        return list(set(keywords[:num_keywords]))
    except:
        # Fallback: simple word extraction
        words = re.findall(r'\\b[a-z]+\\b', text.lower())
        return list(set(w for w in words if len(w) > 3))[:num_keywords]

def generate_study_tips(keywords, subject):
    """Generate study tips from keywords."""
    tips = [
        f"Focus on understanding {keywords[0] if keywords else 'key concepts'}.",
        f"Create flashcards for {subject} terms.",
        "Review material regularly for better retention.",
        "Practice problems related to the concepts.",
    ]
    return tips[:3]
'''

with open(f'{BACK}/models/nlp_utils.py', 'w') as f:
    f.write(nlp_utils)

print('✓ nlp_utils.py')

# models/feedback_model.py
feedback = '''def generate_feedback_text(subject, accuracy):
    """Generate feedback based on accuracy."""
    if accuracy >= 0.8:
        return f"Excellent work on {subject}! Keep it up!"
    elif accuracy >= 0.6:
        return f"Good progress in {subject}. Review the concepts and try again."
    elif accuracy >= 0.4:
        return f"You\'re learning {subject}. More practice will help!"
    else:
        return f"Don\'t worry about {subject}. Let\'s review and practice more."
'''

with open(f'{BACK}/models/feedback_model.py', 'w') as f:
    f.write(feedback)

print('✓ feedback_model.py')

print('\nAll model files created!')
