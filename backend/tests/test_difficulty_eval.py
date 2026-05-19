"""
Difficulty Classifier Evaluation — Accuracy, Macro-F1, Confusion Matrix
========================================================================
Tests the Bloom's taxonomy classifier against a hand-labeled dataset of
15 questions (5 per difficulty level). Prints accuracy, macro-F1, and a
3x3 confusion matrix so it is easy to spot systematic mis-classifications.

Usage:
    pytest backend/tests/test_difficulty_eval.py -v -s
"""

import sys, os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", ".."))

import pytest


# ---------------------------------------------------------------------------
# Hand-labeled evaluation set
# Format: (question_stem, expected_label)
# ---------------------------------------------------------------------------

LABELED_SET = [
    # --- EASY (Bloom level 1-2: Remember / Understand) ---
    ("What is the capital of France?",                                           "easy"),
    ("Define the term photosynthesis.",                                          "easy"),
    ("List three primary colors.",                                               "easy"),
    ("Who wrote Romeo and Juliet?",                                              "easy"),
    ("Name the process by which plants make food using sunlight.",               "easy"),

    # --- MEDIUM (Bloom level 3-4: Apply / Analyze) ---
    ("Explain how the Calvin cycle converts carbon dioxide into glucose.",       "medium"),
    ("Describe the differences between supervised and unsupervised learning.",   "medium"),
    ("Calculate the time complexity of binary search on a sorted array.",        "medium"),
    ("Compare and contrast relational and NoSQL databases.",                     "medium"),
    ("Illustrate how Newton's second law applies to circular motion.",           "medium"),

    # --- HARD (Bloom level 5-6: Evaluate / Create) ---
    ("Critically analyze the regularization techniques used to prevent overfitting in deep neural networks.",  "hard"),
    ("Evaluate the trade-offs between consistency and availability in distributed systems from first principles.", "hard"),
    ("Derive the Bellman optimality equation for a finite Markov decision process.", "hard"),
    ("Design an algorithm to detect cycles in a directed graph and justify its time complexity.", "hard"),
    ("Critically examine how Gödel's incompleteness theorems challenge the foundations of formal mathematics.", "hard"),
]

LABELS = ["easy", "medium", "hard"]


# ---------------------------------------------------------------------------
# Metric helpers
# ---------------------------------------------------------------------------

def _build_confusion(y_true: list, y_pred: list, labels: list) -> list[list[int]]:
    idx = {l: i for i, l in enumerate(labels)}
    matrix = [[0] * len(labels) for _ in labels]
    for t, p in zip(y_true, y_pred):
        if t in idx and p in idx:
            matrix[idx[t]][idx[p]] += 1
    return matrix


def _macro_f1(y_true: list, y_pred: list, labels: list) -> float:
    f1s = []
    for label in labels:
        tp = sum(t == label and p == label for t, p in zip(y_true, y_pred))
        fp = sum(t != label and p == label for t, p in zip(y_true, y_pred))
        fn = sum(t == label and p != label for t, p in zip(y_true, y_pred))
        prec = tp / (tp + fp) if (tp + fp) else 0
        rec  = tp / (tp + fn) if (tp + fn) else 0
        f1s.append(2 * prec * rec / (prec + rec) if (prec + rec) else 0)
    return sum(f1s) / len(f1s)


def _print_confusion(matrix: list[list[int]], labels: list):
    col_w = 10
    header = f"{'':>{col_w}}" + "".join(f"{l:>{col_w}}" for l in labels)
    print("\n" + "=" * (col_w * (len(labels) + 1)))
    print("Confusion matrix  (rows=true, cols=predicted)")
    print(header)
    for label, row in zip(labels, matrix):
        print(f"{label:>{col_w}}" + "".join(f"{v:>{col_w}}" for v in row))
    print("=" * (col_w * (len(labels) + 1)) + "\n")


# ---------------------------------------------------------------------------
# Tests
# ---------------------------------------------------------------------------

def _import_classifier():
    try:
        from backend.services.difficulty_service import classify_labels_only
        return classify_labels_only
    except ImportError:
        from services.difficulty_service import classify_labels_only
        return classify_labels_only


class TestDifficultyClassifier:

    def test_accuracy_and_f1(self):
        """Accuracy >= 0.67 and macro-F1 >= 0.60 on the labeled set."""
        classify = _import_classifier()

        questions = [q for q, _ in LABELED_SET]
        y_true    = [l for _, l in LABELED_SET]
        y_pred    = classify(questions)

        correct  = sum(t == p for t, p in zip(y_true, y_pred))
        accuracy = correct / len(y_true)
        mf1      = _macro_f1(y_true, y_pred, LABELS)
        matrix   = _build_confusion(y_true, y_pred, LABELS)

        _print_confusion(matrix, LABELS)
        print(f"Accuracy:   {accuracy:.2f}  ({correct}/{len(y_true)})")
        print(f"Macro-F1:   {mf1:.2f}")

        assert accuracy >= 0.67, f"Accuracy {accuracy:.2f} below threshold 0.67"
        assert mf1 >= 0.60,      f"Macro-F1 {mf1:.2f} below threshold 0.60"

    @pytest.mark.parametrize("question, expected", LABELED_SET)
    def test_individual_labels(self, question, expected):
        """Each question should be classified into a valid label."""
        classify = _import_classifier()
        result = classify([question])
        assert result[0] in LABELS, f"Invalid label '{result[0]}' for: {question}"

    def test_feature_breakdown_returned(self):
        """classify_question must return confidence and feature breakdown."""
        try:
            from backend.services.difficulty_service import classify_question
        except ImportError:
            from services.difficulty_service import classify_question

        result = classify_question("Explain how gradient descent minimizes the loss function.")
        assert "label"      in result
        assert "confidence" in result
        assert "features"   in result
        assert result["confidence"] > 0
        assert result["label"] in LABELS
