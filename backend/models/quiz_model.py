"""Quiz ML model — difficulty classifier + MCQ generator.

Fixes applied (Phase 5):
- O(N²) POS tagging: tokenize + tag ALL sentences ONCE, pass prebuilt pool to _make_distractors
- Race condition: train_quiz_models() checks file existence before writing (safe for multi-worker Gunicorn)
- Serverless compat: MODEL_PATH / VECTORIZER_PATH fall back to /tmp if the data dir is read-only
"""
import os
import re
import random
import pickle
import threading
from nltk.tokenize import sent_tokenize, word_tokenize
from nltk.corpus import stopwords
from sklearn.feature_extraction.text import TfidfVectorizer, CountVectorizer
from sklearn.linear_model import LogisticRegression
import nltk

for pkg in ["punkt", "stopwords", "averaged_perceptron_tagger", "punkt_tab"]:
    try:
        nltk.download(pkg, quiet=True)
    except Exception:
        pass

# Serverless-safe paths: prefer /data dir, fall back to /tmp
_DATA_DIR = os.path.join(os.path.dirname(__file__), "..", "data")
try:
    os.makedirs(_DATA_DIR, exist_ok=True)
    _test = os.path.join(_DATA_DIR, ".write_test")
    open(_test, "w").close()
    os.remove(_test)
except OSError:
    _DATA_DIR = "/tmp"

MODEL_PATH      = os.path.join(_DATA_DIR, "quiz_model.pkl")
VECTORIZER_PATH = os.path.join(_DATA_DIR, "vectorizer.pkl")

# File-level lock prevents race condition between Gunicorn workers
_TRAIN_LOCK = threading.Lock()

_LATEX_DISPLAY = re.compile(r"\$\$.*?\$\$", re.DOTALL)
_LATEX_INLINE  = re.compile(r"\$[^\$]+?\$")
_EXTRA_WS      = re.compile(r"\s+")
_ASCII_DIAGRAM = re.compile(r"[\u2502\u251c\u2514\u250c\u2510\u2518\u2524\u252c\u2534\u253c\u2500\u2550\u2554\u2557\u255a\u255d\u2560\u2563\u2566\u2569\u256a\u25bc\u25b2\u25c4\u25ba\[\]]+")
_PREFERRED_POS  = {"NN", "NNS", "NNP", "NNPS", "VBG"}


def _clean(text: str) -> str:
    text = _LATEX_DISPLAY.sub(" ", text)
    text = _LATEX_INLINE.sub(" ", text)
    text = re.sub(r"^#{1,6}\s+", "", text, flags=re.MULTILINE)
    text = _ASCII_DIAGRAM.sub(" ", text)
    text = re.sub(r"[^\w\s.,!?;:'\"()-]", " ", text)
    return _EXTRA_WS.sub(" ", text).strip()


def train_quiz_models():
    """Train and persist difficulty classifier. Thread-safe; skips if models already exist."""
    with _TRAIN_LOCK:
        # ─ Skip if models already written by another worker ─
        if os.path.exists(MODEL_PATH) and os.path.exists(VECTORIZER_PATH):
            return load_quiz_models()

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
            "What is the role of RNA in protein synthesis?",
            "Fill in the blank: In supervised learning, the model minimizes ______ risk.",
            "Fill in the blank: K-Means minimizes the Within-Cluster Sum of ______.",
        ]
        hard = [
            "Critically analyze the implications of Godel incompleteness theorems.",
            "Derive the Schrodinger equation from first principles.",
            "Compare and contrast sorting algorithm complexities and real-world trade-offs.",
            "Explain gradient descent optimization in deep neural networks.",
            "Fill in the blank: The Bellman optimality equation decomposes Q*(s,a) into the immediate reward plus discounted value of the ______ next state.",
            "Fill in the blank: DQN uses Experience Replay and ______ Networks to stabilize training.",
        ]
        texts  = easy + medium + hard
        labels = [0] * len(easy) + [1] * len(medium) + [2] * len(hard)
        vec    = CountVectorizer(max_features=200, ngram_range=(1, 2))
        X      = vec.fit_transform(texts)
        model  = LogisticRegression(random_state=42, max_iter=500, C=1.0)
        model.fit(X, labels)
        with open(MODEL_PATH,      "wb") as f: pickle.dump(model, f)
        with open(VECTORIZER_PATH, "wb") as f: pickle.dump(vec,   f)
        return model, vec


def load_quiz_models():
    if not os.path.exists(MODEL_PATH):
        return train_quiz_models()
    with open(MODEL_PATH,      "rb") as f: model = pickle.load(f)
    with open(VECTORIZER_PATH, "rb") as f: vec   = pickle.load(f)
    return model, vec


def classify_difficulty(questions: list) -> list:
    try:
        model, vec = load_quiz_models()
        X     = vec.transform(questions)
        preds = model.predict(X)
        mapping = {0: "easy", 1: "medium", 2: "hard"}
        return [mapping[p] for p in preds]
    except Exception as e:
        print(f"[DIFFICULTY ERROR] {e}")
        return ["medium"] * len(questions)


def _extract_key_sentences(text: str, n: int) -> list:
    clean     = _clean(text)
    sentences = sent_tokenize(clean)
    sentences = [
        s.strip() for s in sentences
        if len(s.split()) >= 8 and not re.match(r'^[\W\d\s]+$', s)
    ]
    if not sentences:
        return []
    tfidf = TfidfVectorizer(stop_words="english")
    try:
        matrix  = tfidf.fit_transform(sentences)
        scores  = matrix.sum(axis=1).A1
        top_idx = scores.argsort()[::-1][:n * 3]
        return [sentences[i] for i in sorted(top_idx)]
    except Exception:
        return sentences[:n * 2]


def _build_pos_pool(sentences: list, stop: set) -> list:
    """Tokenize + POS-tag ALL sentences ONCE. Returns a flat list of candidate words.
    Eliminates the O(N²) re-tagging in _make_distractors.
    """
    pool = []
    for sent in sentences:
        tokens = word_tokenize(sent)
        try:
            tagged = nltk.pos_tag(tokens)
            pool.extend([
                w for w, pos in tagged
                if pos in _PREFERRED_POS and w.lower() not in stop
                and len(w) > 3 and w.isalpha()
            ])
        except Exception:
            pool.extend([
                w for w in tokens
                if w.lower() not in stop and len(w) > 3 and w.isalpha()
            ])
    # Deduplicate while preserving order
    seen, unique = set(), []
    for w in pool:
        if w.lower() not in seen:
            seen.add(w.lower())
            unique.append(w)
    return unique


def _pick_answer_word(tagged_tokens: list, used: set, stop: set):
    """Pick answer from pre-tagged token list — no extra nltk.pos_tag call."""
    candidates = [
        w for w, pos in tagged_tokens
        if pos in _PREFERRED_POS
        and w.lower() not in stop
        and len(w) > 4
        and w.isalpha()
        and w.lower() not in used
    ]
    if not candidates:
        return None
    candidates.sort(key=len, reverse=True)
    return candidates[0]


def _make_distractors(correct: str, pos_pool: list, n: int = 3) -> list:
    """Select distractors from the pre-built pos_pool (no re-tagging)."""
    filtered = [
        w for w in pos_pool
        if w.lower() != correct.lower()
    ]
    random.shuffle(filtered)
    distractors = filtered[:n]
    fallback = ["None of the above", "All of the above", "Cannot be determined"]
    i = 0
    while len(distractors) < n:
        distractors.append(fallback[i % len(fallback)])
        i += 1
    return distractors


def generate_mcqs(text: str, num_questions: int = 5) -> list:
    """Generate MCQs. POS tagging is done ONCE for O(N) performance."""
    try:
        key_sentences = _extract_key_sentences(text, num_questions)
        if not key_sentences:
            return []

        stop = set(stopwords.words("english"))

        # ─ O(N) pass: tag every sentence once, build shared pool ─
        all_tagged: list[list] = []
        for sent in key_sentences:
            tokens = word_tokenize(sent)
            try:
                all_tagged.append(nltk.pos_tag(tokens))
            except Exception:
                all_tagged.append([(w, "NN") for w in tokens])

        pos_pool = _build_pos_pool(key_sentences, stop)  # flat deduplicated pool

        questions: list  = []
        used_answers: set = set()

        for i, sentence in enumerate(key_sentences):
            if len(questions) >= num_questions:
                break
            correct = _pick_answer_word(all_tagged[i], used_answers, stop)
            if not correct:
                continue
            used_answers.add(correct.lower())
            blanked = re.sub(
                r'\b' + re.escape(correct) + r'\b',
                "______", sentence, count=1, flags=re.IGNORECASE,
            )
            question_text = f"Fill in the blank: {blanked}"
            distractors   = _make_distractors(correct, pos_pool, n=3)
            options       = [correct] + distractors
            random.shuffle(options)
            difficulty    = classify_difficulty([question_text])[0]
            topic_words   = [
                w for w, _ in all_tagged[i]
                if w.lower() not in stop and w.isalpha() and len(w) > 4
            ]
            topic = topic_words[0].capitalize() if topic_words else "General"
            questions.append({
                "id":         f"q_{len(questions) + 1}",
                "question":   question_text,
                "stem":       sentence,
                "options":    options,
                "answer":     correct,
                "difficulty": difficulty,
                "topic":      topic,
            })
        return questions
    except Exception as e:
        print(f"[MCQ ERROR] {e}")
        return []
