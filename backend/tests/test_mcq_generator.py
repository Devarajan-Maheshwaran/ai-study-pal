import json
from pathlib import Path

from services import mcq_generator


def test_generate_mcqs_from_text_basic():
    text = "Recursion is a technique where a function calls itself. It must reach a base case."
    mcqs = mcq_generator.generate_mcqs_from_text(text, topic="recursion", max_questions=5)

    assert isinstance(mcqs, list)
    assert len(mcqs) >= 1

    m = mcqs[0]
    assert "question" in m and "options" in m and "correct_index" in m
    assert len(m["options"]) == 4
    assert 0 <= m["correct_index"] < 4
    assert m["difficulty"] in ["easy", "medium", "hard"]


def test_mcq_bank_save_and_load(tmp_path):
    mcq = {
        "id": "test",
        "question": "What is 2+2?",
        "options": ["1", "2", "3", "4"],
        "correct_index": 3,
        "topic": "math",
        "source_sentence": "2+2=4",
        "difficulty": "easy",
    }
    path = tmp_path / "mcq_bank.json"
    mcq_generator.save_mcqs_to_bank([mcq], path)
    loaded = mcq_generator.load_mcq_bank(path)
    assert len(loaded) == 1
    assert loaded[0]["id"] == "test"
