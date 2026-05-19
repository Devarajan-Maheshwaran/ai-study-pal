"""Workspace CRUD and document ingestion endpoints."""
from flask import Blueprint, request, jsonify
from datetime import datetime

from backend.db.database import db_session
from backend.db.models import Workspace, Topic, Document
from backend.services.ingestion_service import ingest_document
from backend.middleware.auth import require_auth, current_user_id

bp = Blueprint("workspaces", __name__)


def _db():
    return db_session


@bp.get("/api/workspaces")
@require_auth
def list_workspaces():
    rows = _db().query(Workspace).filter_by(user_id=current_user_id()).order_by(Workspace.created_at.desc()).all()
    return jsonify([_ws_summary(w) for w in rows])


@bp.post("/api/workspaces")
@require_auth
def create_workspace():
    data = request.json or {}
    name = (data.get("name") or "").strip()
    if not name:
        return jsonify({"error": "name is required"}), 400
    db = _db()
    ws = Workspace(
        user_id=current_user_id(),
        name=name,
        subject=data.get("subject", "General"),
        exam_date=data.get("exam_date"),
    )
    db.add(ws)
    db.commit()
    db.refresh(ws)
    return jsonify(_ws_summary(ws)), 201


@bp.get("/api/workspaces/<ws_id>")
@require_auth
def get_workspace(ws_id: str):
    ws = _db().query(Workspace).filter_by(id=ws_id, user_id=current_user_id()).first()
    if not ws:
        return jsonify({"error": "Not found"}), 404
    return jsonify({
        **_ws_summary(ws),
        "topics":    [_topic_dict(t) for t in ws.topics],
        "documents": [_doc_dict(d)   for d in ws.documents],
    })


@bp.delete("/api/workspaces/<ws_id>")
@require_auth
def delete_workspace(ws_id: str):
    db = _db()
    ws = db.query(Workspace).filter_by(id=ws_id, user_id=current_user_id()).first()
    if not ws:
        return jsonify({"error": "Not found"}), 404
    db.delete(ws)
    db.commit()
    return jsonify({"deleted": ws_id})


@bp.post("/api/workspaces/<ws_id>/ingest")
@require_auth
def ingest(ws_id: str):
    db = _db()
    ws = db.query(Workspace).filter_by(id=ws_id, user_id=current_user_id()).first()
    if not ws:
        return jsonify({"error": "Workspace not found"}), 404
    source = request.form.get("source", "text")
    title  = request.form.get("title", f"Document {datetime.utcnow().strftime('%Y-%m-%d %H:%M')}").strip()
    try:
        result = ingest_document(
            db=db,
            workspace_id=ws_id,
            source_type=source,
            title=title,
            text=request.form.get("content", ""),
            url=request.form.get("url", ""),
            file=request.files.get("file"),
        )
        return jsonify(result), 201
    except ValueError as e:
        return jsonify({"error": str(e)}), 400


@bp.get("/api/workspaces/<ws_id>/topics")
@require_auth
def list_topics(ws_id: str):
    ws = _db().query(Workspace).filter_by(id=ws_id, user_id=current_user_id()).first()
    if not ws:
        return jsonify({"error": "Not found"}), 404
    topics = _db().query(Topic).filter_by(workspace_id=ws_id).all()
    return jsonify([_topic_dict(t) for t in topics])


@bp.get("/api/workspaces/<ws_id>/raw-text")
@require_auth
def workspace_raw_text(ws_id: str):
    ws = _db().query(Workspace).filter_by(id=ws_id, user_id=current_user_id()).first()
    if not ws:
        return jsonify({"error": "Not found"}), 404
    docs     = _db().query(Document).filter_by(workspace_id=ws_id).all()
    combined = "\n\n".join(d.raw_text for d in docs if d.raw_text)
    return jsonify({"text": combined, "word_count": len(combined.split()), "doc_count": len(docs)})


def _ws_summary(ws: Workspace) -> dict:
    return {
        "id":         ws.id,
        "name":       ws.name,
        "subject":    ws.subject,
        "exam_date":  ws.exam_date,
        "created_at": ws.created_at.isoformat() if ws.created_at else None,
    }

def _topic_dict(t: Topic) -> dict:
    return {"id": t.id, "name": t.name, "mastery_score": t.mastery_score, "difficulty_score": t.difficulty_score}

def _doc_dict(d: Document) -> dict:
    return {"id": d.id, "title": d.title, "source_type": d.source_type, "word_count": d.word_count,
            "uploaded_at": d.uploaded_at.isoformat() if d.uploaded_at else None}
