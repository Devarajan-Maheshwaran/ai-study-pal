from sklearn.feature_extraction.text import CountVectorizer
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
