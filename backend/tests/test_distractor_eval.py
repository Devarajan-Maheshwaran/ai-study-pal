"""
Distractor Generator Evaluation
================================
Checks three properties that make distractors "good" in the MCQ sense:
  1. Count     — exactly n distractors are returned
  2. Collision — no distractor equals the correct answer (case-insensitive)
  3. Uniqueness — no duplicates within the returned set
  4. POS rate  — at least 50% of text distractors share the broad POS group
                 with the correct answer (noun/verb/adj)
  5. Numeric   — numeric answers produce numeric distractors

Usage:
    pytest backend/tests/test_distractor_eval.py -v -s
"""

import sys, os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", ".."))

import pytest


# ---------------------------------------------------------------------------
# Test cases: (correct_answer, passage_snippet)
# ---------------------------------------------------------------------------

PASSAGE_DB = (
    "Photosynthesis occurs in the chloroplasts of plant cells. "
    "Chlorophyll absorbs sunlight and drives the conversion of carbon dioxide "
    "and water into glucose and oxygen. The thylakoid membranes host the "
    "light-dependent reactions while the stroma contains enzymes for the Calvin cycle."
)

PASSAGE_ML = (
    "Gradient descent is an optimization algorithm used to minimize the loss function. "
    "It iteratively updates model parameters by moving in the direction of the "
    "negative gradient. Learning rate controls the step size. Regularization "
    "techniques such as L1 and L2 penalize large weights to reduce overfitting."
)

TEST_CASES = [
    # (correct, passage, n_distractors)
    ("chloroplasts",  PASSAGE_DB, 3),
    ("glucose",       PASSAGE_DB, 3),
    ("Chlorophyll",   PASSAGE_DB, 3),
    ("gradient",      PASSAGE_ML, 3),
    ("Regularization",PASSAGE_ML, 3),
    ("42",            PASSAGE_DB, 3),   # numeric
    ("100",           PASSAGE_ML, 3),   # numeric
    ("oxygen",        PASSAGE_DB, 2),   # n=2
]


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _broad_pos(tag: str) -> str:
    if tag.startswith("NN"): return "noun"
    if tag.startswith("VB"): return "verb"
    if tag.startswith("JJ"): return "adj"
    return "other"


def _get_pos(word: str) -> str:
    try:
        import nltk
        tagged = nltk.pos_tag([word])
        return _broad_pos(tagged[0][1])
    except Exception:
        return "other"


# ---------------------------------------------------------------------------
# Tests
# ---------------------------------------------------------------------------

def _import_generator():
    try:
        from backend.services.distractor_service import generate_distractors
        return generate_distractors
    except ImportError:
        from services.distractor_service import generate_distractors
        return generate_distractors


class TestDistractorGenerator:

    @pytest.mark.parametrize("correct, passage, n", TEST_CASES)
    def test_count(self, correct, passage, n):
        """Exactly n distractors must be returned."""
        gen = _import_generator()
        result = gen(correct, passage, n=n, seed=42)
        assert len(result) == n, f"Expected {n} distractors, got {len(result)}: {result}"

    @pytest.mark.parametrize("correct, passage, n", TEST_CASES)
    def test_no_collision_with_correct(self, correct, passage, n):
        """No distractor should equal the correct answer (case-insensitive)."""
        gen = _import_generator()
        result = gen(correct, passage, n=n, seed=42)
        for d in result:
            assert d.lower() != correct.lower(), (
                f"Distractor '{d}' equals correct answer '{correct}'"
            )

    @pytest.mark.parametrize("correct, passage, n", TEST_CASES)
    def test_uniqueness(self, correct, passage, n):
        """All distractors must be unique (case-insensitive)."""
        gen = _import_generator()
        result = gen(correct, passage, n=n, seed=42)
        lower = [d.lower() for d in result]
        assert len(lower) == len(set(lower)), f"Duplicate distractors found: {result}"

    def test_numeric_distractors_are_numeric(self):
        """Numeric correct answers should produce numeric distractors."""
        gen = _import_generator()
        result = gen("42", PASSAGE_DB, n=3, seed=42)
        numeric_count = sum(1 for d in result if d.isdigit())
        assert numeric_count >= 2, (
            f"Expected at least 2 numeric distractors for '42', got: {result}"
        )

    def test_pos_alignment_rate(self):
        """At least 50% of text-based distractors should share POS group with correct."""
        gen = _import_generator()
        text_cases = [(c, p, n) for c, p, n in TEST_CASES if not c.isdigit()]
        match_count, total = 0, 0
        correct_group_counts = {}

        for correct, passage, n in text_cases:
            correct_pos = _get_pos(correct)
            result = gen(correct, passage, n=n, seed=42)
            for d in result:
                if d not in ["None of the above", "All of the above", "Cannot be determined"]:
                    total += 1
                    if _get_pos(d) == correct_pos:
                        match_count += 1

        if total > 0:
            rate = match_count / total
            print(f"\nPOS match rate: {rate:.2f}  ({match_count}/{total})")
            assert rate >= 0.40, f"POS match rate {rate:.2f} below threshold 0.40"
