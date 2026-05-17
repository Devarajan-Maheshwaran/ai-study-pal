"""Integration tests for workspace-centric API endpoints."""
import json
import pytest


def _json(resp):
    return json.loads(resp.data)


# ── /health ──────────────────────────────────────────────────────────────────

def test_health(client):
    resp = client.get("/health")
    assert resp.status_code == 200
    assert _json(resp)["status"] == "ok"


# ── Workspaces ───────────────────────────────────────────────────────────────

def test_list_workspaces_empty(client):
    resp = client.get("/api/workspaces")
    assert resp.status_code == 200
    assert isinstance(_json(resp), list)


def test_create_workspace(client):
    resp = client.post("/api/workspaces", json={"name": "Physics 101", "subject": "Physics"})
    assert resp.status_code == 201
    data = _json(resp)
    assert data["name"] == "Physics 101"
    assert "id" in data
    return data["id"]


def test_create_workspace_missing_name(client):
    resp = client.post("/api/workspaces", json={})
    assert resp.status_code == 400


def test_get_workspace(client):
    # Create then fetch
    ws = _json(client.post("/api/workspaces", json={"name": "Bio", "subject": "Biology"}))
    resp = client.get(f"/api/workspaces/{ws['id']}")
    assert resp.status_code == 200
    data = _json(resp)
    assert data["id"] == ws["id"]
    assert "topics" in data
    assert "documents" in data


def test_delete_workspace(client):
    ws = _json(client.post("/api/workspaces", json={"name": "Temp WS"}))
    resp = client.delete(f"/api/workspaces/{ws['id']}")
    assert resp.status_code == 200
    # Confirm gone
    resp2 = client.get(f"/api/workspaces/{ws['id']}")
    assert resp2.status_code == 404


def test_get_nonexistent_workspace(client):
    resp = client.get("/api/workspaces/does-not-exist")
    assert resp.status_code == 404


# ── Ingestion ─────────────────────────────────────────────────────────────────

def test_ingest_text(client):
    ws = _json(client.post("/api/workspaces", json={"name": "Ingest Test"}))
    form = {
        "source":  "text",
        "title":   "Sample Notes",
        "content": (
            "Photosynthesis is the process by which plants use sunlight, water, and carbon dioxide "
            "to produce oxygen and energy in the form of glucose. The light-dependent reactions "
            "occur in the thylakoid membrane and the Calvin cycle occurs in the stroma of the chloroplast."
        ),
    }
    resp = client.post(f"/api/workspaces/{ws['id']}/ingest", data=form)
    assert resp.status_code == 201
    data = _json(resp)
    assert data["word_count"] > 0
    assert "summary" in data


def test_ingest_too_short(client):
    ws = _json(client.post("/api/workspaces", json={"name": "Short Ingest"}))
    resp = client.post(f"/api/workspaces/{ws['id']}/ingest", data={"source": "text", "content": "Too short."})
    assert resp.status_code == 400


# ── Summarize ─────────────────────────────────────────────────────────────────

def test_summarize(client):
    resp = client.post("/api/summarize", json={
        "text": (
            "The mitochondria is the powerhouse of the cell. It generates ATP through oxidative "
            "phosphorylation. The electron transport chain is embedded in the inner mitochondrial "
            "membrane and pumps protons to create an electrochemical gradient used by ATP synthase."
        ),
        "subject": "Biology",
    })
    assert resp.status_code == 200
    data = _json(resp)
    assert "summary" in data
    assert "keywords" in data


def test_summarize_too_short(client):
    resp = client.post("/api/summarize", json={"text": "Short."})
    assert resp.status_code == 400


# ── Quiz generation ───────────────────────────────────────────────────────────

def test_quiz_generate(client):
    ws = _json(client.post("/api/workspaces", json={"name": "Quiz WS"}))
    resp = client.post("/api/quiz/generate", json={
        "workspace_id": ws["id"],
        "text": (
            "Newton's first law states that an object at rest stays at rest and an object in motion "
            "stays in motion unless acted upon by an external force. The second law defines force as "
            "mass times acceleration. The third law states that for every action there is an equal "
            "and opposite reaction."
        ),
        "num_questions": 3,
    })
    assert resp.status_code == 200
    data = _json(resp)
    assert "questions" in data
    assert len(data["questions"]) > 0


def test_quiz_generate_too_short(client):
    ws = _json(client.post("/api/workspaces", json={"name": "Short Quiz"}))
    resp = client.post("/api/quiz/generate", json={"workspace_id": ws["id"], "text": "Short text."})
    assert resp.status_code == 400


# ── Progress ──────────────────────────────────────────────────────────────────

def test_progress_empty(client):
    ws = _json(client.post("/api/workspaces", json={"name": "Progress WS"}))
    resp = client.get(f"/api/progress/{ws['id']}")
    assert resp.status_code == 200
    data = _json(resp)
    assert data["total_attempts"] == 0


# ── Flashcards ────────────────────────────────────────────────────────────────

def test_flashcard_generate(client):
    ws = _json(client.post("/api/workspaces", json={"name": "Flash WS"}))
    resp = client.post("/api/flashcards/generate", json={
        "workspace_id": ws["id"],
        "text": (
            "The French Revolution began in 1789 and ended in 1799. It was a period of radical "
            "political and societal change in France. Key figures included Robespierre and Napoleon. "
            "The revolution led to the rise of democracy and the decline of absolute monarchy."
        ),
    })
    assert resp.status_code == 201
    data = _json(resp)
    assert data["generated"] > 0


def test_list_flashcards(client):
    ws = _json(client.post("/api/workspaces", json={"name": "Flash List WS"}))
    resp = client.get(f"/api/flashcards/{ws['id']}")
    assert resp.status_code == 200
    assert "cards" in _json(resp)
