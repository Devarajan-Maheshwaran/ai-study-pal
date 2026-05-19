"""
Bloom's Taxonomy Difficulty Classifier
======================================
Classifies a question stem into easy | medium | hard using a hybrid of:
  1. Cognitive verb mapping (Bloom's taxonomy levels 1-6)
  2. Lexical complexity (avg word length, type-token ratio, long-word ratio)
  3. Syntactic complexity (sentence length, syllable density)

Returns a label AND a feature breakdown so every prediction is explainable.
This is intentionally a deterministic, rule-based + feature-scoring model
(no external API, no transformer) — chosen for explainability and offline use.

To run evaluation:
    pytest backend/tests/test_difficulty_eval.py -v
"""

import re
from dataclasses import dataclass


# ---------------------------------------------------------------------------
# Bloom's taxonomy cognitive verb maps
# ---------------------------------------------------------------------------

_BLOOM_EASY = [
    "what is", "define", "name", "who", "list", "identify", "select",
    "where", "when", "state", "recall", "recognise", "recognize",
    "label", "match", "spell", "tell", "write",
]

_BLOOM_MEDIUM = [
    "explain", "describe", "summarize", "summarise", "interpret",
    "classify", "compare", "differentiate", "distinguish", "illustrate",
    "outline", "paraphrase", "predict", "relate", "translate",
    "apply", "demonstrate", "use", "solve", "calculate", "compute",
    "show how", "implement", "construct",
]

_BLOOM_HARD = [
    "analyze", "analyse", "critically", "evaluate", "justify",
    "assess", "derive", "contrast", "argue", "debate", "formulate",
    "design", "create", "synthesize", "synthesise", "propose",
    "critique", "examine", "investigate", "first principles",
    "implication", "optimality", "regularization", "bellman",
    "godel", "schrodinger",
]


# ---------------------------------------------------------------------------
# Feature extraction
# ---------------------------------------------------------------------------

def _syllable_count(word: str) -> int:
    return max(1, len(re.findall(r'[aeiouyAEIOUY]+', word)))


@dataclass
class DifficultyFeatures:
    sentence_len: int
    avg_word_len: float
    long_word_ratio: float      # fraction of words with len > 7
    syllables_per_word: float
    type_token_ratio: float     # vocabulary richness
    bloom_level: str            # 'easy' | 'medium' | 'hard' | 'none'
    raw_score: int


def _extract_features(question: str) -> DifficultyFeatures:
    q_lower = question.lower()
    words = [w for w in re.findall(r'\w+', question) if w.isalpha()]

    if not words:
        return DifficultyFeatures(0, 0, 0, 0, 0, 'none', 0)

    avg_word_len      = sum(len(w) for w in words) / len(words)
    long_word_ratio   = sum(1 for w in words if len(w) > 7) / len(words)
    syllables_per_word = sum(_syllable_count(w) for w in words) / len(words)
    type_token_ratio  = len(set(w.lower() for w in words)) / len(words)

    # Bloom level
    if any(k in q_lower for k in _BLOOM_HARD):
        bloom = 'hard'
    elif any(k in q_lower for k in _BLOOM_MEDIUM):
        bloom = 'medium'
    elif any(k in q_lower for k in _BLOOM_EASY):
        bloom = 'easy'
    else:
        bloom = 'none'

    # Composite score
    score = 0
    if len(words) > 16:     score += 2
    elif len(words) > 10:   score += 1
    if avg_word_len > 5.5:  score += 2
    elif avg_word_len > 4.5: score += 1
    if long_word_ratio > 0.25: score += 2
    elif long_word_ratio > 0.15: score += 1
    if syllables_per_word > 1.8: score += 1
    if bloom == 'hard':   score += 3
    elif bloom == 'easy': score -= 2

    return DifficultyFeatures(
        sentence_len=len(words),
        avg_word_len=round(avg_word_len, 2),
        long_word_ratio=round(long_word_ratio, 2),
        syllables_per_word=round(syllables_per_word, 2),
        type_token_ratio=round(type_token_ratio, 2),
        bloom_level=bloom,
        raw_score=score,
    )


# ---------------------------------------------------------------------------
# Public API
# ---------------------------------------------------------------------------

def classify_question(question: str) -> dict:
    """
    Classify a single question stem.

    Returns:
        {
            "label": "easy" | "medium" | "hard",
            "confidence": float (0-1, heuristic),
            "features": { ... }
        }
    """
    feats = _extract_features(question)
    score = feats.raw_score

    if score >= 5:
        label = "hard"
        confidence = min(1.0, 0.60 + (score - 5) * 0.08)
    elif score >= 2:
        label = "medium"
        confidence = min(1.0, 0.55 + (score - 2) * 0.06)
    else:
        label = "easy"
        confidence = min(1.0, 0.65 + abs(score) * 0.07)

    return {
        "label": label,
        "confidence": round(confidence, 2),
        "features": {
            "sentence_len":       feats.sentence_len,
            "avg_word_len":       feats.avg_word_len,
            "long_word_ratio":    feats.long_word_ratio,
            "syllables_per_word": feats.syllables_per_word,
            "type_token_ratio":   feats.type_token_ratio,
            "bloom_level":        feats.bloom_level,
            "raw_score":          feats.raw_score,
        }
    }


def classify_batch(questions: list[str]) -> list[dict]:
    """Classify a list of question stems. Returns a list of result dicts."""
    return [classify_question(q) for q in questions]


def classify_labels_only(questions: list[str]) -> list[str]:
    """Convenience wrapper — returns only label strings (drop-in for quiz_model)."""
    return [classify_question(q)["label"] for q in questions]
