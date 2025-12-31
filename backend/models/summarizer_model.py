import os
import pickle

MODEL_PATH = os.path.join(os.path.dirname(__file__), '..', 'data', 'summarizer.pkl')

def train_dummy_summarizer():
    """Train dummy summarizer (just store a flag)."""
    os.makedirs(os.path.dirname(MODEL_PATH), exist_ok=True)
    with open(MODEL_PATH, 'wb') as f:
        pickle.dump({'trained': True}, f)

def summarize_text(text, max_sentences=3):
    """Extractive summarization: select most important sentences by word frequency."""
    import re
    from collections import Counter
    sentences = re.split(r'(?<=[.!?]) +', text)
    if len(sentences) <= max_sentences:
        return ' '.join(sentences)
    # Tokenize and count word frequencies
    words = re.findall(r'\w+', text.lower())
    freq = Counter(words)
    # Score sentences by sum of word frequencies
    scored = [(sum(freq[w.lower()] for w in re.findall(r'\w+', s)), i, s) for i, s in enumerate(sentences)]
    # Select top N scored sentences, preserving order
    top = sorted(scored, reverse=True)[:max_sentences]
    top_sorted = sorted(top, key=lambda x: x[1])
    return ' '.join(s for _, _, s in top_sorted)
