import os
import re
import random
import pickle
from nltk.tokenize import sent_tokenize, word_tokenize
from nltk.corpus import stopwords
from sklearn.feature_extraction.text import TfidfVectorizer, CountVectorizer
from sklearn.linear_model import LogisticRegression
import nltk

for pkg in ["punkt", "stopwords", "averaged_perceptron_tagger", "punkt_tab"]:
    try:
        nltk.download(pkg, quiet=True)
    except:
        pass

MODEL_PATH = os.path.join(os.path.dirname(__file__), "..", "data", "quiz_model.pkl")
VECTORIZER_PATH = os.path.join(os.path.dirname(__file__), "..", "data", "vectorizer.pkl")


def train_quiz_models():
    """Train logistic regression difficulty classifier."""
    easy = [
        "What is the capital of France?",
        "Define photosynthesis.",
        "What is 2 + 2?",
        "Name the largest planet.",
        "What is water made of?",
        "Who wrote Romeo and Juliet?",
        "What is the boiling point of water?",
        "Name a primary color.",
    ]
    medium = [
        "Explain the process of mitosis in detail.",
        "Describe how quantum entanglement works.",
        "What are the key differences between TCP and UDP?",
        "Explain the concept of entropy in thermodynamics.",
        "How does the immune system respond to pathogens?",
        "Describe the mechanism of action potential in neurons.",
        "Explain the significance of the Krebs cycle.",
        "What is the role of RNA in protein synthesis?",
    ]
    hard = [
        "Critically analyze the implications of Godel incompleteness theorems on formal systems.",
        "Derive the Schrodinger equation from first principles and explain its physical interpretation.",
        "Compare and contrast various sorting algorithm complexities and their real-world trade-offs.",
        "Explain how gradient descent optimization works in the context of deep neural networks.",
        "Analyze the computational complexity of NP-hard problems and implications for cryptography.",
    ]
    texts = easy + medium + hard
    labels = [0] * len(easy) + [1] * len(medium) + [2] * len(hard)

    os.makedirs(os.path.dirname(MODEL_PATH), exist_ok=True)
    vec = CountVectorizer(max_features=200, ngram_range=(1, 2))
    X = vec.fit_transform(texts)
    model = LogisticRegression(random_state=42, max_iter=500, C=1.0)
    model.fit(X, labels)

    with open(MODEL_PATH, "wb") as f:
        pickle.dump(model, f)
    with open(VECTORIZER_PATH, "wb") as f:
        pickle.dump(vec, f)
    return model, vec


def load_quiz_models():
    if not os.path.exists(MODEL_PATH):
        return train_quiz_models()
    with open(MODEL_PATH, "rb") as f:
        model = pickle.load(f)
    with open(VECTORIZER_PATH, "rb") as f:
        vec = pickle.load(f)
    return model, vec


def classify_difficulty(questions: list[str]) -> list[str]:
    """Return easy/medium/hard for each question string."""
    try:
        model, vec = load_quiz_models()
        X = vec.transform(questions)
        preds = model.predict(X)
        mapping = {0: "easy", 1: "medium", 2: "hard"}
        return [mapping[p] for p in preds]
    except Exception as e:
        print(f"[DIFFICULTY ERROR] {e}")
        return ["medium"] * len(questions)


def _extract_key_sentences(text: str, n: int) -> list[str]:
    """Return top-n TF-IDF scored sentences."""
    sentences = sent_tokenize(text)
    sentences = [s.strip() for s in sentences if len(s.split()) >= 6]
    if not sentences:
        return []
    tfidf = TfidfVectorizer(stop_words="english")
    try:
        matrix = tfidf.fit_transform(sentences)
        scores = matrix.sum(axis=1).A1
        top_idx = scores.argsort()[::-1][:n * 2]
        return [sentences[i] for i in top_idx]
    except Exception:
        return sentences[:n * 2]


def _make_distractors(correct: str, all_words: list[str], n: int = 3) -> list[str]:
    """Generate plausible wrong answer options from the text vocabulary."""
    stop = set(stopwords.words("english"))
    candidates = [
        w for w in all_words
        if w.lower() != correct.lower()
        and w.lower() not in stop
        and len(w) > 3
        and w.isalpha()
    ]
    candidates = list(dict.fromkeys(candidates))  # deduplicate preserving order
    random.shuffle(candidates)
    distractors = candidates[:n]
    while len(distractors) < n:
        distractors.append(f"None of the above")
    return distractors


def generate_mcqs(text: str, num_questions: int = 5) -> list[dict]:
    """
    Generate MCQs using fill-in-the-blank pattern.
    Each question blanks out a key noun/concept from a sentence.
    """
    try:
        key_sentences = _extract_key_sentences(text, num_questions)
        all_words = word_tokenize(text)
        stop = set(stopwords.words("english"))

        # Extract noun-like words as answer candidates
        content_words = [
            w for w in all_words
            if w.lower() not in stop and len(w) > 3 and w.isalpha()
        ]

        questions = []
        used_answers = set()

        for sentence in key_sentences:
            if len(questions) >= num_questions:
                break
            words = word_tokenize(sentence)
            # Pick the longest content word in this sentence as the answer
            candidates = [
                w for w in words
                if w.lower() not in stop
                and len(w) > 4
                and w.isalpha()
                and w.lower() not in used_answers
            ]
            if not candidates:
                continue

            # Prefer longer, more meaningful words
            candidates.sort(key=len, reverse=True)
            correct = candidates[0]
            used_answers.add(correct.lower())

            # Build fill-in-the-blank question
            blanked = re.sub(
                r'\b' + re.escape(correct) + r'\b',
                "______",
                sentence,
                count=1,
                flags=re.IGNORECASE
            )
            question_text = f"Fill in the blank: {blanked}"

            distractors = _make_distractors(correct, content_words, n=3)
            options = [correct] + distractors
            random.shuffle(options)

            questions.append({
                "id": f"q_{len(questions) + 1}",
                "question": question_text,
                "stem": sentence,
                "options": options,
                "answer": correct,
                "topic": "General",
            })

        return questions

    except Exception as e:
        print(f"[MCQ ERROR] {e}")
        return []
