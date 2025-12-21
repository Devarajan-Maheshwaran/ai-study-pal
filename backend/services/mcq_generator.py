# backend/services/mcq_generator.py

import json
import uuid
from pathlib import Path

import nltk
from nltk import sent_tokenize, word_tokenize, pos_tag
from nltk.corpus import stopwords

import joblib
import numpy as np

BASE_DIR = Path(__file__).resolve().parents[1]
DATA_DIR = BASE_DIR / "data"
GENERATED_DIR = DATA_DIR / "generated"
GENERATED_DIR.mkdir(parents=True, exist_ok=True)

MODELS_DIR = BASE_DIR / "models"
MCQ_BANK_PATH = GENERATED_DIR / "mcq_bank.json"

# Load models
vectorizer = joblib.load(MODELS_DIR / "quiz_vectorizer.joblib")
difficulty_clf = joblib.load(MODELS_DIR / "quiz_difficulty_clf.joblib")

# NLTK setup (ensure you already downloaded these in some notebook)
STOPWORDS = set(stopwords.words("english"))


def _clean_tokens(tokens):
    return [t for t in tokens if t.isalpha() and t.lower() not in STOPWORDS]


def _extract_keywords(sentence, top_k=3):
    tokens = word_tokenize(sentence)
    tokens = _clean_tokens(tokens)
    if not tokens:
        return []

    tagged = pos_tag(tokens)
    nouns = [w for w, pos in tagged if pos.startswith("NN")]
    if not nouns:
        nouns = tokens

    freq = {}
    for w in nouns:
        freq[w] = freq.get(w, 0) + 1
    sorted_words = sorted(freq.items(), key=lambda x: x[1], reverse=True)
    return [w for w, _ in sorted_words[:top_k]]


def _blank_answer(sentence, answer):
    if not answer:
        return None
    idx = sentence.lower().find(answer.lower())
    if idx == -1:
        return None
    return sentence[:idx] + "_____" + sentence[idx + len(answer):]


def _predict_difficulty(text):
    X = vectorizer.transform([text])
    return difficulty_clf.predict(X)[0]


def generate_mcq_from_sentence(sentence: str, topic: str | None = None):
    sentence = sentence.strip()
    if len(sentence.split()) < 5:
        return None

    keywords = _extract_keywords(sentence, top_k=4)
    if not keywords:
        return None

    answer = keywords[0]
    stem = _blank_answer(sentence, answer)
    if not stem:
        return None

    distractors = [k for k in keywords[1:] if k.lower() != answer.lower()]
    if len(distractors) < 3:
        return None

    options = distractors[:3] + [answer]
    rng = np.random.default_rng()
    rng.shuffle(options)
    correct_index = options.index(answer)

    difficulty = _predict_difficulty(stem)

    return {
        "id": str(uuid.uuid4()),
        "question": stem.strip(),
        "options": options,
        "correct_index": int(correct_index),
        "topic": topic or "general",
        "source_sentence": sentence,
        "difficulty": difficulty,
    }


def generate_mcqs_from_text(text: str, topic: str | None = None, max_questions: int = 10):
    sentences = sent_tokenize(text)
    mcqs = []
    for s in sentences:
        if len(mcqs) >= max_questions:
            break
        mcq = generate_mcq_from_sentence(s, topic=topic)
        if mcq:
            mcqs.append(mcq)
    return mcqs


def load_mcq_bank(path: Path = MCQ_BANK_PATH):
    if not path.exists():
        return []
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)


def save_mcqs_to_bank(mcqs, path: Path = MCQ_BANK_PATH):
    existing = load_mcq_bank(path)
    existing.extend(mcqs)
    with open(path, "w", encoding="utf-8") as f:
        json.dump(existing, f, ensure_ascii=False, indent=2)
