def test_study_schedule(client):
    res = client.get("/api/study-schedule?subject=Python+Basics&hours=5")
    assert res.status_code == 200
    assert "text/csv" in res.content_type
    assert "Session,Subject,Scenario" in res.data.decode("utf-8")
