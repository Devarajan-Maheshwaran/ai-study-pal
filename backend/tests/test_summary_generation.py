def test_revision_summary(client):
    payload = {
        "text": "Machine learning is the field of study that gives computers the ability to learn.",
        "subject": "AIML Fundamentals",
        "max_sentences": 2,
    }
    res = client.post("/api/revision-summary", json=payload)
    assert res.status_code == 200
    data = res.get_json()
    assert "summary" in data
    assert "tips" in data
