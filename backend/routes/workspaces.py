"""Workspace CRUD + document ingestion endpoints.

Routes
------
GET  /api/workspaces              list all workspaces
POST /api/workspaces              create workspace
GET  /api/workspaces/:id          get one workspace (with topics + docs)
DELETE /api/workspaces/:id        delete workspace
POST /api/workspaces/:id/ingest   ingest text / PDF / YouTube into workspace
GET  /api/workspaces/:id/topics   list topics extracted for workspace
"""
from flask import Blueprint, request, jsonify
from sqlalchemy.orm import Session
from datetime import datetime

from backend.db.database import SessionLocal
from backend.db.models import Workspace, Topic, Document, DocumentChunk
from backend.services.ingestion_service import ingest_document

bp = Blueprint("workspaces", __name__)


def _db() -> Session:
    return SessionLocal()


@bp.get("/api/workspaces")
def list_workspaces():
    db = _db()
    try:
        rows = db.query(Workspace).order_by(Workspace.created_at.desc()).all()
        return jsonify([_ws_summary(w) for w in rows])
    finally:
        db.close()


@bp.post("/api/workspaces")
def create_workspace():
    data = request.json or {}
    name = (data.get("name") or "").strip()
    if not name:
        return jsonify({"error": "name is required"}), 400
    db = _db()
    try:
        ws = Workspace(
            name=name,
            subject=data.get("subject", "General"),
            exam_date=data.get("exam_date"),
        )
        db.add(ws)
        db.commit()
        db.refresh(ws)
        return jsonify(_ws_summary(ws)), 201
    finally:
        db.close()


@bp.get("/api/workspaces/<ws_id>")
def get_workspace(ws_id: str):
    db = _db()
    try:
        ws = db.query(Workspace).filter_by(id=ws_id).first()
        if not ws:
            return jsonify({"error": "Not found"}), 404
        return jsonify({
            **_ws_summary(ws),
            "topics": [_topic_dict(t) for t in ws.topics],
            "documents": [_doc_dict(d) for d in ws.documents],
        })
    finally:
        db.close()


@bp.delete("/api/workspaces/<ws_id>")
def delete_workspace(ws_id: str):
    db = _db()
    try:
        ws = db.query(Workspace).filter_by(id=ws_id).first()
        if not ws:
            return jsonify({"error": "Not found"}), 404
        db.delete(ws)
        db.commit()
        return jsonify({"deleted": ws_id})
    finally:
        db.close()


@bp.post("/api/workspaces/<ws_id>/ingest")
def ingest(ws_id: str):
    """Ingest content into workspace.
    Accepts multipart/form-data:
      source = text | pdf | youtube
      content = raw text (for source=text)
      url     = YouTube URL (for source=youtube)
      file    = uploaded file (for source=pdf)
    """
    db = _db()
    try:
        ws = db.query(Workspace).filter_by(id=ws_id).first()
        if not ws:
            return jsonify({"error": "Workspace not found"}), 404

        source  = request.form.get("source", "text")
        title   = request.form.get("title", f"Document {datetime.utcnow().strftime('%Y-%m-%d %H:%M')}").strip()

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
    finally:
        db.close()


@bp.get("/api/workspaces/<ws_id>/topics")
def list_topics(ws_id: str):
    db = _db()
    try:
        topics = db.query(Topic).filter_by(workspace_id=ws_id).all()
        return jsonify([_topic_dict(t) for t in topics])
    finally:
        db.close()


# ── helpers ─────────────────────────────────────────────────────────────────

def _ws_summary(ws: Workspace) -> dict:
    return {
        "id":         ws.id,
        "name":       ws.name,
        "subject":    ws.subject,
        "exam_date":  ws.exam_date,
        "created_at": ws.created_at.isoformat() if ws.created_at else None,
    }

def _topic_dict(t: Topic) -> dict:
    return {
        "id":               t.id,
        "name":             t.name,
        "mastery_score":    t.mastery_score,
        "difficulty_score": t.difficulty_score,
    }

def _doc_dict(d: Document) -> dict:
    return {
        "id":          d.id,
        "title":       d.title,
        "source_type": d.source_type,
        "word_count":  d.word_count,
        "uploaded_at": d.uploaded_at.isoformat() if d.uploaded_at else None,
    }
