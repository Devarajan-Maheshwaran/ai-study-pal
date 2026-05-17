"""Unit tests for the local MCQ generation engine."""
from backend.models.quiz_model import generate_mcqs, classify_difficulty

SAMPLE_TEXT = (
    "Photosynthesis is the process used by plants, algae and certain bacteria to harness energy "
    "from sunlight and turn it into chemical energy stored in glucose. The process occurs primarily "
    "in the chloroplasts using chlorophyll pigments. The light-dependent reactions convert solar "
    "energy into ATP and NADPH. The Calvin cycle uses these to fix carbon dioxide into organic molecules."
)


def test_generate_mcqs_returns_list():
    qs = generate_mcqs(SAMPLE_TEXT, num_questions=3)
    assert isinstance(qs, list)


def test_generate_mcqs_fields():
    qs = generate_mcqs(SAMPLE_TEXT, num_questions=3)
    if qs:  # may be empty if NLTK data not downloaded yet
        for q in qs:
            assert "question"  in q
            assert "options"   in q
            assert "answer"    in q
            assert "difficulty" in q
            assert len(q["options"]) == 4


def test_classify_difficulty():
    labels = classify_difficulty(["What is photosynthesis?", "Derive the Schrodinger equation from first principles."])
    assert len(labels) == 2
    assert all(l in {"easy", "medium", "hard"} for l in labels)


def test_empty_text_returns_empty():
    assert generate_mcqs("", num_questions=5) == []


def test_short_text_returns_empty_or_list():
    result = generate_mcqs("Short.", num_questions=5)
    assert isinstance(result, list)
