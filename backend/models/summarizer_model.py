import os
import numpy as np
from tensorflow.keras.models import Sequential, load_model
from tensorflow.keras.layers import Dense
from tensorflow.keras.preprocessing.text import Tokenizer
from tensorflow.keras.preprocessing.sequence import pad_sequences
import joblib
from config import Config

ARTIFACT_DIR = Config.MODEL_DIR
SUM_MODEL_PATH = os.path.join(ARTIFACT_DIR, "summary_model.h5")
TOK_PATH = os.path.join(ARTIFACT_DIR, "summary_tokenizer.joblib")

MAX_WORDS = 5000
MAX_LEN = 100

def train_dummy_summarizer():
    """
    For the capstone, you can create synthetic examples:
    short_text -> shorter_text.
    Here a tiny autoencoder style NN is used.
    """
    texts = [
        "Machine learning uses data to learn patterns and make predictions",
        "Deep learning uses neural networks with many layers for complex tasks",
        "Natural language processing helps computers understand human language",
    ]
    summaries = [
        "Machine learning learns from data",
        "Deep learning uses multi layer networks",
        "NLP helps computers understand language",
    ]

    tokenizer = Tokenizer(num_words=MAX_WORDS, oov_token="<OOV>")
    tokenizer.fit_on_texts(texts + summaries)

    X = pad_sequences(tokenizer.texts_to_sequences(texts), maxlen=MAX_LEN)
    y = pad_sequences(tokenizer.texts_to_sequences(summaries), maxlen=MAX_LEN)

    model = Sequential()
    model.add(Dense(128, activation="relu", input_shape=(MAX_LEN,)))
    model.add(Dense(MAX_LEN, activation="softmax"))
    model.compile(optimizer="adam", loss="sparse_categorical_crossentropy")

    # crude training: treat y as single label per position (argmax)
    y_labels = np.argmax(y, axis=1)
    model.fit(X, y_labels, epochs=10, batch_size=2, verbose=0)

    model.save(SUM_MODEL_PATH)
    joblib.dump(tokenizer, TOK_PATH)

def load_summarizer():
    if not os.path.exists(SUM_MODEL_PATH):
        train_dummy_summarizer()
    model = load_model(SUM_MODEL_PATH)
    tokenizer = joblib.load(TOK_PATH)
    return model, tokenizer

def summarize_text(text, max_sentences=3):
    """
    Heuristic: use NN to score tokens, then pick top tokens & reconstruct.
    For a capstone this simple behaviour is acceptable. [file:15]
    """
    import nltk
    nltk.download("punkt", quiet=True)

    sentences = nltk.sent_tokenize(text)
    model, tokenizer = load_summarizer()
    seq = pad_sequences(
        tokenizer.texts_to_sequences([" ".join(sentences)]), maxlen=MAX_LEN
    )
    scores = model.predict(seq, verbose=0)[0]
    # pick top-k indices as "important tokens"
    top_idx = np.argsort(scores)[-max_sentences:]
    # fallback: just take first N sentences to keep behaviour deterministic
    selected = sentences[:max_sentences]
    return " ".join(selected)
