"""Content AI endpoints + workspace raw-text retrieval."""
from flask import Blueprint, request, jsonify
from datetime import datetime, timedelta

from backend.db.database import SessionLocal
from backend.db.models import QuizAttempt, Topic, Document
from backend.services.summary_service import generate_summary
from backend.models.nlp_utils import extract_keywords
from backend.services.resources_service import get_resources

bp = Blueprint("content", __name__)


@bp.post("/api/summarize")
def summarize():
    data    = request.json or {}
    text    = (data.get("text") or "").strip()
    subject = data.get("subject", "General")
    if len(text.split()) < 20:
        return jsonify({"error": "Text too short (min 20 words)"}), 400
    summary, tips = generate_summary(text, subject)
    keywords      = extract_keywords(text)
    return jsonify({"summary": summary, "tips": tips, "keywords": keywords})


@bp.post("/api/keywords")
def keywords():
    data = request.json or {}
    text = (data.get("text") or "").strip()
    if not text:
        return jsonify({"error": "text is required"}), 400
    return jsonify({"keywords": extract_keywords(text)})


@bp.post("/api/resources")
def resources():
    data     = request.json or {}
    subject  = data.get("subject", "General")
    topics   = data.get("topics", [])
    accuracy = float(data.get("accuracy", 0.5))
    result   = get_resources(subject, topics=topics, accuracy=accuracy)
    return jsonify({"resources": result})


@bp.get("/api/progress/<ws_id>")
def progress(ws_id: str):
    db = SessionLocal()
    try:
        attempts = (
            db.query(QuizAttempt)
            .filter_by(workspace_id=ws_id)
            .order_by(QuizAttempt.submitted_at)
            .all()
        )
        if not attempts:
            return jsonify({"average_accuracy": 0, "total_attempts": 0, "score_trend": [], "sessions_this_week": 0})

        scores = [round(a.score * 100, 1) for a in attempts]
        avg    = round(sum(scores) / len(scores), 1)
        week_ago      = (datetime.utcnow() - timedelta(days=7)).isoformat()
        sessions_week = sum(1 for a in attempts if a.submitted_at and a.submitted_at.isoformat() >= week_ago)
        trend = [
            {"attempt": i + 1, "score": s, "submitted_at": a.submitted_at.isoformat() if a.submitted_at else None}
            for i, (s, a) in enumerate(zip(scores, attempts))
        ]
        return jsonify({"average_accuracy": avg, "total_attempts": len(attempts), "score_trend": trend, "sessions_this_week": sessions_week})
    finally:
        db.close()


@bp.get("/api/exam-prediction/<ws_id>")
def exam_prediction(ws_id: str):
    db = SessionLocal()
    try:
        attempts = db.query(QuizAttempt).filter_by(workspace_id=ws_id).order_by(QuizAttempt.submitted_at).all()
        if not attempts:
            return jsonify({"predicted_score": None, "readiness": "Unknown", "confidence": 0})
        latest = attempts[-1]
        if latest.ml_feedback and "exam_prediction" in latest.ml_feedback:
            return jsonify(latest.ml_feedback["exam_prediction"])
        scores      = [a.score for a in attempts]
        avg         = sum(scores) / len(scores)
        consistency = 1 - (max(scores) - min(scores)) if len(scores) > 1 else 0.5
        pred        = min(100, round(avg * 70 + consistency * 15 + min(len(scores), 10) * 1.5, 1))
        return jsonify({"predicted_score": pred, "readiness": "High" if pred >= 75 else ("Medium" if pred >= 55 else "Low"), "confidence": min(100, len(scores) * 10)})
    finally:
        db.close()


@bp.get("/api/weak-topics/<ws_id>")
def weak_topics(ws_id: str):
    db = SessionLocal()
    try:
        topics = db.query(Topic).filter_by(workspace_id=ws_id).filter(Topic.mastery_score < 0.5).order_by(Topic.mastery_score).all()
        return jsonify([{"name": t.name, "mastery": round(t.mastery_score * 100, 1), "difficulty": round(t.difficulty_score, 2)} for t in topics])
    finally:
        db.close()


@bp.get("/api/workspaces/<ws_id>/raw-text")
def workspace_raw_text(ws_id: str):
    """Returns concatenated raw text from all ingested documents in a workspace.
    Used by QuizArena + Flashcards to seed generation with real content.
    """
    db = SessionLocal()
    try:
        docs = db.query(Document).filter_by(workspace_id=ws_id).all()
        combined = "\n\n".join(d.raw_text for d in docs if d.raw_text)
        return jsonify({"text": combined, "word_count": len(combined.split()), "doc_count": len(docs)})
    finally:
        db.close()
