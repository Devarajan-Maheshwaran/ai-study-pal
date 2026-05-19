"""Copilot chat and study planner endpoints."""
from flask import Blueprint, request, jsonify, send_file
from io import BytesIO

from backend.db.database import db_session
from backend.db.models import QuizAttempt, Topic, Workspace
from backend.services.copilot_service import get_copilot_response
from backend.services.schedule_service import generate_study_schedule_csv
from backend.services.retrieval_service import search_workspace
from backend.middleware.auth import require_auth, current_user_id

bp = Blueprint("copilot", __name__)


def _db():
    return db_session


@bp.post("/api/copilot")
@require_auth
def copilot():
    data         = request.json or {}
    message      = (data.get("message") or "").strip()
    workspace_id = data.get("workspace_id", "")
    if not message:
        return jsonify({"error": "message required"}), 400

    weak_topics, last_score, recent_summary = [], None, ""

    if workspace_id:
        ws = _db().query(Workspace).filter_by(id=workspace_id, user_id=current_user_id()).first()
        if not ws:
            return jsonify({"error": "Workspace not found"}), 404

        topics = _db().query(Topic).filter_by(workspace_id=workspace_id).filter(Topic.mastery_score < 0.5).order_by(Topic.mastery_score).all()
        weak_topics = [t.name for t in topics]

        latest = _db().query(QuizAttempt).filter_by(workspace_id=workspace_id).order_by(QuizAttempt.submitted_at.desc()).first()
        if latest:
            last_score = round(latest.score * 100, 1)

        chunks = search_workspace(workspace_id, message, n_results=3)
        recent_summary = " ".join(c["text"] for c in chunks)

    result = get_copilot_response(
        message=message,
        subject=data.get("subject", "General"),
        weak_topics=weak_topics,
        last_score=last_score,
        recent_summary=recent_summary,
    )
    return jsonify(result)


@bp.post("/api/planner")
@require_auth
def planner():
    data         = request.json or {}
    workspace_id = data.get("workspace_id", "")
    hours        = float(data.get("hours", 4))
    subject      = data.get("subject", "General")
    weights: dict = {}
    if workspace_id:
        ws = _db().query(Workspace).filter_by(id=workspace_id, user_id=current_user_id()).first()
        if not ws:
            return jsonify({"error": "Workspace not found"}), 404
        topics  = _db().query(Topic).filter_by(workspace_id=workspace_id).all()
        weights = {t.name: t.difficulty_score for t in topics}
    else:
        weights = data.get("concept_difficulty", {})
    csv_data = generate_study_schedule_csv(subject, hours, weights)
    buf = BytesIO(csv_data.encode())
    buf.seek(0)
    return send_file(buf, mimetype="text/csv", as_attachment=True, download_name="study_schedule.csv")


@bp.post("/api/planner/preview")
@require_auth
def planner_preview():
    data         = request.json or {}
    workspace_id = data.get("workspace_id", "")
    hours        = float(data.get("hours", 4))
    subject      = data.get("subject", "General")
    weights: dict = {}
    if workspace_id:
        ws = _db().query(Workspace).filter_by(id=workspace_id, user_id=current_user_id()).first()
        if not ws:
            return jsonify({"error": "Workspace not found"}), 404
        topics  = _db().query(Topic).filter_by(workspace_id=workspace_id).all()
        weights = {t.name: t.difficulty_score for t in topics}
    if not weights:
        return jsonify({"schedule": [], "message": "No topic data — ingest study material first."})
    total_weight = sum(weights.values()) or 1
    schedule, day = [], 1
    for topic, diff in sorted(weights.items(), key=lambda x: -x[1]):
        mins = max(5, round((diff / total_weight) * hours * 60))
        schedule.append({"day": day, "topic": topic, "minutes": mins, "difficulty": round(diff, 2)})
        day += 1
    return jsonify({"schedule": schedule, "total_hours": hours, "subject": subject})
