"""
Unit Tests — Core ML Models
============================
Fast, deterministic unit tests for the three core model components.
No database, no Flask app context required.

Marked as 'unit' so they can be run separately:
    pytest -m unit

Full suite:
    pytest backend/tests/ -v
"""

import sys, os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", ".."))

import pytest


# ---------------------------------------------------------------------------
# Summarizer unit tests
# ---------------------------------------------------------------------------

class TestSummarizer:

    PASSAGE = (
        "The mitochondria is the powerhouse of the cell. "
        "It generates ATP through oxidative phosphorylation. "
        "The inner membrane folds into cristae to increase surface area. "
        "ATP synthase uses a proton gradient to produce ATP molecules. "
        "Without mitochondria, eukaryotic cells could not survive aerobically. "
        "The outer membrane separates the organelle from the cytoplasm. "
        "Mitochondria have their own DNA, supporting the endosymbiotic theory."
    )

    def _summarizer(self):
        try:
            from backend.services.summary_service import generate_summary
        except ImportError:
            from services.summary_service import generate_summary
        return generate_summary

    @pytest.mark.unit
    def test_returns_nonempty_string(self):
        summary, _ = self._summarizer()(self.PASSAGE)
        assert isinstance(summary, str) and len(summary.strip()) > 0

    @pytest.mark.unit
    def test_shorter_than_original(self):
        summary, _ = self._summarizer()(self.PASSAGE, max_sentences=3)
        assert len(summary) < len(self.PASSAGE)

    @pytest.mark.unit
    def test_returns_tips_list(self):
        _, tips = self._summarizer()(self.PASSAGE, subject="Biology")
        assert isinstance(tips, list)

    @pytest.mark.unit
    def test_short_text_passthrough(self):
        short = "Cells are the basic unit of life."
        summary, _ = self._summarizer()(short)
        assert len(summary) > 0


# ---------------------------------------------------------------------------
# Difficulty classifier unit tests
# ---------------------------------------------------------------------------

class TestDifficultyClassifier:

    def _classifier(self):
        try:
            from backend.services.difficulty_service import classify_question, classify_labels_only
        except ImportError:
            from services.difficulty_service import classify_question, classify_labels_only
        return classify_question, classify_labels_only

    @pytest.mark.unit
    def test_easy_question(self):
        cq, _ = self._classifier()
        result = cq("What is photosynthesis?")
        assert result["label"] == "easy"

    @pytest.mark.unit
    def test_hard_question(self):
        cq, _ = self._classifier()
        result = cq("Critically analyze the regularization techniques used in deep learning.")
        assert result["label"] == "hard"

    @pytest.mark.unit
    def test_output_schema(self):
        cq, _ = self._classifier()
        result = cq("Explain gradient descent.")
        assert "label"      in result
        assert "confidence" in result
        assert "features"   in result
        assert result["label"] in ("easy", "medium", "hard")
        assert 0 < result["confidence"] <= 1

    @pytest.mark.unit
    def test_batch_length_matches(self):
        _, cl = self._classifier()
        qs = ["Define X.", "Explain Y.", "Critically evaluate Z."]
        out = cl(qs)
        assert len(out) == 3

    @pytest.mark.unit
    def test_empty_question_safe(self):
        cq, _ = self._classifier()
        result = cq("")
        assert result["label"] in ("easy", "medium", "hard")


# ---------------------------------------------------------------------------
# Distractor generator unit tests
# ---------------------------------------------------------------------------

PASSAGE = (
    "Photosynthesis converts sunlight into glucose using chlorophyll. "
    "The process occurs in chloroplasts located inside plant cells. "
    "Oxygen is released as a by-product of the light reactions."
)

class TestDistractorGenerator:

    def _gen(self):
        try:
            from backend.services.distractor_service import generate_distractors, generate_options
        except ImportError:
            from services.distractor_service import generate_distractors, generate_options
        return generate_distractors, generate_options

    @pytest.mark.unit
    def test_returns_correct_count(self):
        gd, _ = self._gen()
        result = gd("chlorophyll", PASSAGE, n=3, seed=0)
        assert len(result) == 3

    @pytest.mark.unit
    def test_no_answer_in_distractors(self):
        gd, _ = self._gen()
        result = gd("glucose", PASSAGE, n=3, seed=0)
        assert all(d.lower() != "glucose" for d in result)

    @pytest.mark.unit
    def test_generate_options_includes_correct(self):
        _, go = self._gen()
        options = go("chlorophyll", PASSAGE, seed=0)
        assert "chlorophyll" in [o.lower() for o in options]

    @pytest.mark.unit
    def test_numeric_answer(self):
        gd, _ = self._gen()
        result = gd("42", PASSAGE, n=3, seed=0)
        assert len(result) == 3
        numeric = [r for r in result if r.isdigit()]
        assert len(numeric) >= 2

    @pytest.mark.unit
    def test_unique_distractors(self):
        gd, _ = self._gen()
        result = gd("oxygen", PASSAGE, n=3, seed=0)
        assert len(result) == len(set(r.lower() for r in result))


# ---------------------------------------------------------------------------
# Retrieval service unit tests (no DB — tests the TF-IDF logic only)
# ---------------------------------------------------------------------------

class TestRetrievalLogic:
    """Tests the core TF-IDF scoring logic in isolation."""

    @pytest.mark.unit
    def test_tfidf_finds_relevant_chunk(self):
        from sklearn.feature_extraction.text import TfidfVectorizer
        from sklearn.metrics.pairwise import cosine_similarity
        import numpy as np

        chunks = [
            "Photosynthesis converts light energy into chemical energy.",
            "The French Revolution started in 1789.",
            "Newton discovered gravity when an apple fell from a tree.",
        ]
        query = "how do plants make food from sunlight"

        vec = TfidfVectorizer(stop_words="english")
        matrix = vec.fit_transform(chunks)
        q_vec = vec.transform([query])
        sims = cosine_similarity(q_vec, matrix).flatten()
        top = int(np.argmax(sims))

        assert top == 0, "Expected photosynthesis chunk to rank highest"
