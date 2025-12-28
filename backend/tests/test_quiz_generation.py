def test_notes_to_mcqs_text(client):
    payload = {
        "source_type": "text",
        "subject": "Python Basics",
        "notes": "Python uses indentation. Functions are defined with def keyword.",
        "max_questions": 3,
    }
    res = client.post("/api/notes-to-mcqs", json=payload)
    assert res.status_code == 200
    data = res.get_json()
    assert "questions" in data
    assert len(data["questions"]) <= 3
