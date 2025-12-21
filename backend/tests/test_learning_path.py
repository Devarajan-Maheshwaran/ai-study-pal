from services import learning_path


def test_learning_path_generation(tmp_path, monkeypatch):
    def fake_user_dir():
        return tmp_path

    monkeypatch.setattr(learning_path, "USER_DATA_DIR", tmp_path)

    user_id = "u1"

    # Simulate log: weak in recursion, strong in arrays
    results = [
        {"topic": "recursion", "difficulty": "easy", "correct": False},
        {"topic": "recursion", "difficulty": "easy", "correct": False},
        {"topic": "recursion", "difficulty": "easy", "correct": True},
        {"topic": "arrays", "difficulty": "medium", "correct": True},
        {"topic": "arrays", "difficulty": "medium", "correct": True},
        {"topic": "arrays", "difficulty": "medium", "correct": True},
    ]
    for r in results:
        learning_path.log_quiz_result(user_id, r)

    profile = learning_path.generate_learning_path(user_id)

    assert profile["user_id"] == user_id
    assert "topic_stats" in profile
    steps = profile["next_steps"]
    assert len(steps) >= 1
