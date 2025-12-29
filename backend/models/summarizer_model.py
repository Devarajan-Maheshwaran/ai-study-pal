import os
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
