"""Quiz endpoints."""
from flask import Blueprint, request, jsonify
from datetime import datetime
import uuid

from backend.db.database import db_session
from backend.db.models import Workspace, Quiz, QuizAttempt, Topic
from backend.models.quiz_model import generate_mcqs, classify_difficulty
from backend.middleware.auth import require_auth, current_user_id

bp = Blueprint("quiz", __name__)


def _db():
    return db_session


@bp.post("/api/quiz/generate")
@require_auth
def generate_quiz():
    data         = request.json or {}
    workspace_id = data.get("workspace_id", "")
    text         = (data.get("text") or "").strip()
    num_q        = min(int(data.get("num_questions", 10)), 20)
    difficulty   = data.get("difficulty", "mixed")

    if not text or len(text.split()) < 20:
        return jsonify({"error": "text is required (min 20 words)"}), 400

    # Verify workspace ownership
    if workspace_id:
        ws = _db().query(Workspace).filter_by(id=workspace_id, user_id=current_user_id()).first()
        if not ws:
            return jsonify({"error": "Workspace not found"}), 404

    raw_qs = generate_mcqs(text, num_questions=num_q)
    if not raw_qs:
        return jsonify({"error": "Could not generate questions from this text"}), 422

    if difficulty != "mixed":
        raw_qs = [q for q in raw_qs if q["difficulty"] == difficulty] or raw_qs

    questions = [
        {
            "id":             q["id"],
            "question":       q["question"],
            "options":        q["options"],
            "correct_answer": q["answer"],
            "difficulty":     q["difficulty"],
            "topic":          q["topic"],
        }
        for q in raw_qs
    ]

    quiz_id = str(uuid.uuid4())
    if workspace_id:
        quiz_obj = Quiz(id=quiz_id, workspace_id=workspace_id, questions=questions)
        db = _db()
        db.add(quiz_obj)
        db.commit()

    return jsonify({"quiz_id": quiz_id, "questions": questions, "count": len(questions)})


@bp.post("/api/quiz/submit")
@require_auth
def submit_quiz():
    data         = request.json or {}
    quiz_id      = data.get("quiz_id", "")
    workspace_id = data.get("workspace_id", "")
    answers      = data.get("answers", [])
    time_taken   = data.get("time_taken")
    subject      = data.get("subject", "General")

    if not answers:
        return jsonify({"error": "answers required"}), 400

    # Verify ownership
    if workspace_id:
        ws = _db().query(Workspace).filter_by(id=workspace_id, user_id=current_user_id()).first()
        if not ws:
            return jsonify({"error": "Workspace not found"}), 404

    correct = sum(1 for a in answers if a.get("user_answer", "").strip().lower() == a.get("correct_answer", "").strip().lower())
    total   = len(answers)
    score   = correct / total if total else 0
    acc     = round(score * 100, 1)

    # Topic mastery update
    db           = _db()
    topic_scores: dict = {}
    for ans in answers:
        t = ans.get("topic", "General")
        topic_scores.setdefault(t, {"correct": 0, "total": 0})
        topic_scores[t]["total"] += 1
        if ans.get("user_answer", "").strip().lower() == ans.get("correct_answer", "").strip().lower():
            topic_scores[t]["correct"] += 1

    if workspace_id:
        for tname, ts in topic_scores.items():
            mastery = ts["correct"] / ts["total"] if ts["total"] else 0
            topic   = db.query(Topic).filter_by(workspace_id=workspace_id, name=tname).first()
            if topic:
                topic.mastery_score = round((topic.mastery_score + mastery) / 2, 3)
            else:
                db.add(Topic(workspace_id=workspace_id, name=tname, mastery_score=mastery, difficulty_score=0.5))

    # Exam prediction
    attempts_count = 1
    if workspace_id:
        attempts_count = db.query(QuizAttempt).filter_by(workspace_id=workspace_id).count() + 1
    predicted      = min(100, round(acc * 0.7 + min(attempts_count, 10) * 1.5, 1))
    readiness      = "High" if predicted >= 75 else ("Medium" if predicted >= 55 else "Low")

    weak_topics = [t for t, ts in topic_scores.items() if ts["total"] > 0 and ts["correct"] / ts["total"] < 0.5]
    suggestions = [f"Review topic: {t}" for t in weak_topics[:3]]
    feedback    = (
        f"You scored {acc}% ({correct}/{total} correct). "
        + ("Great work! Keep challenging yourself with harder questions." if acc >= 80
           else "Focus on your weak topics before the next attempt." if acc >= 50
           else "Start with the fundamentals — review your notes and retake the quiz.")
    )

    ml_feedback = {
        "exam_prediction": {"predicted_score": predicted, "readiness": readiness, "confidence": min(100, attempts_count * 10)},
        "knowledge":       {"ability": acc, "trend": "improving" if acc >= 60 else "needs_work", "attempts": attempts_count},
    }

    if workspace_id:
        attempt = QuizAttempt(
            quiz_id=quiz_id, workspace_id=workspace_id,
            score=score, correct=correct, total=total,
            time_taken=time_taken, ml_feedback=ml_feedback,
        )
        db.add(attempt)
        db.commit()

    return jsonify({
        "correct": correct, "total": total, "accuracy": acc,
        "feedback": feedback, "suggestions": suggestions, "weak_topics": weak_topics,
        "knowledge": ml_feedback["knowledge"],
        "exam_prediction": ml_feedback["exam_prediction"],
    })


@bp.get("/api/quiz/history/<ws_id>")
@require_auth
def quiz_history(ws_id: str):
    ws = _db().query(Workspace).filter_by(id=ws_id, user_id=current_user_id()).first()
    if not ws:
        return jsonify({"error": "Not found"}), 404
    attempts = _db().query(QuizAttempt).filter_by(workspace_id=ws_id).order_by(QuizAttempt.submitted_at.desc()).all()
    return jsonify([{
        "id":           a.id, "quiz_id": a.quiz_id,
        "score":        round(a.score * 100, 1),
        "correct":      a.correct, "total": a.total,
        "time_taken":   a.time_taken, "ml_feedback": a.ml_feedback,
        "submitted_at": a.submitted_at.isoformat() if a.submitted_at else None,
    } for a in attempts])
