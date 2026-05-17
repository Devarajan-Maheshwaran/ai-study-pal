"""Quiz generation + submission endpoints.

Routes
------
POST /api/quiz/generate    generate adaptive quiz from workspace text
POST /api/quiz/submit      submit answers, run ML pipeline, persist attempt
GET  /api/quiz/history/:ws_id  list attempts for a workspace
"""
from flask import Blueprint, request, jsonify
from datetime import datetime
import collections

from backend.db.database import SessionLocal
from backend.db.models import Workspace, Quiz, QuizAttempt, Topic
from backend.models.quiz_model import generate_mcqs, classify_difficulty
from backend.models.feedback_model import generate_feedback_text

bp = Blueprint("quiz", __name__)


@bp.post("/api/quiz/generate")
def generate_quiz():
    data         = request.json or {}
    workspace_id = data.get("workspace_id", "")
    topic_name   = data.get("topic", "General")
    num          = min(int(data.get("num_questions", 10)), 20)
    difficulty   = data.get("difficulty", "mixed")  # easy | medium | hard | mixed
    text         = data.get("text", "").strip()

    if len(text.split()) < 20:
        return jsonify({"error": "Text too short — provide at least 20 words"}), 400

    questions = generate_mcqs(text, num)
    stems     = [q.get("question", q.get("stem", "")) for q in questions]
    diffs     = classify_difficulty(stems) if stems else []

    for i, q in enumerate(questions):
        q["difficulty"]  = diffs[i] if i < len(diffs) else "medium"
        q["topic"]       = topic_name
        q["id"]          = f"q_{i}_{int(datetime.utcnow().timestamp())}"

    # Filter by requested difficulty
    if difficulty != "mixed":
        filtered = [q for q in questions if q["difficulty"] == difficulty]
        questions = filtered if filtered else questions

    # Persist quiz if workspace_id given
    if workspace_id:
        db = SessionLocal()
        try:
            quiz = Quiz(
                workspace_id=workspace_id,
                topic_name=topic_name,
                difficulty=difficulty,
                questions=questions,
            )
            db.add(quiz)
            db.commit()
            db.refresh(quiz)
            quiz_id = quiz.id
        finally:
            db.close()
    else:
        quiz_id = None

    return jsonify({"quiz_id": quiz_id, "questions": questions, "count": len(questions)})


@bp.post("/api/quiz/submit")
def submit_quiz():
    data         = request.json or {}
    quiz_id      = data.get("quiz_id")
    workspace_id = data.get("workspace_id", "")
    answers      = data.get("answers", [])
    time_taken   = data.get("time_taken")  # seconds

    if not answers:
        return jsonify({"error": "No answers provided"}), 400

    correct  = sum(1 for a in answers if str(a.get("user_answer","")) == str(a.get("correct_answer","")))
    total    = len(answers)
    accuracy = round(correct / total, 4) if total else 0

    # Per-topic breakdown
    topic_stats: dict = collections.defaultdict(lambda: {"correct": 0, "total": 0})
    for a in answers:
        t = a.get("topic", "General")
        topic_stats[t]["total"] += 1
        if str(a.get("user_answer","")) == str(a.get("correct_answer","")):
            topic_stats[t]["correct"] += 1

    concept_difficulty = {
        t: {
            "accuracy":          round(v["correct"] / v["total"], 2) if v["total"] else 0,
            "difficulty_score":  round(1 - (v["correct"] / v["total"]), 2) if v["total"] else 1,
            "attempts":          v["total"],
        }
        for t, v in topic_stats.items()
    }
    weak_topics = [t for t, v in concept_difficulty.items() if v["accuracy"] < 0.5]

    # Knowledge tracing: simple rolling average over past attempts
    db = SessionLocal()
    try:
        past_attempts = []
        if workspace_id:
            past_attempts = (
                db.query(QuizAttempt)
                .filter_by(workspace_id=workspace_id)
                .order_by(QuizAttempt.submitted_at)
                .all()
            )
        recent_scores = [a.score for a in past_attempts[-5:]] + [accuracy]
        ability       = round(sum(recent_scores) / len(recent_scores) * 100, 1)
        trend         = (
            "improving" if len(recent_scores) > 1 and recent_scores[-1] > recent_scores[0]
            else "declining" if len(recent_scores) > 1 and recent_scores[-1] < recent_scores[0]
            else "stable"
        )

        # Exam score prediction
        n           = len(past_attempts) + 1
        all_scores  = [a.score for a in past_attempts] + [accuracy]
        avg         = sum(all_scores) / len(all_scores)
        consistency = 1 - (max(all_scores) - min(all_scores)) if len(all_scores) > 1 else 0.5
        pred_score  = min(100, round(avg * 70 + consistency * 15 + min(n, 10) * 1.5, 1))
        readiness   = "High" if pred_score >= 75 else ("Medium" if pred_score >= 55 else "Low")

        ml_feedback = {
            "knowledge":        {"ability": ability, "trend": trend, "attempts": n},
            "exam_prediction":  {"predicted_score": pred_score, "readiness": readiness, "confidence": min(100, n * 10)},
            "concept_difficulty": concept_difficulty,
            "weak_topics":      weak_topics,
            "suggestions":      [f"Revisit {t} — {int(v['accuracy']*100)}% accuracy" for t, v in concept_difficulty.items() if v["accuracy"] < 0.6],
        }

        # Feedback from existing model
        subject = data.get("subject", "General")
        feedback_text = generate_feedback_text(subject, accuracy)

        # Persist attempt
        attempt = QuizAttempt(
            quiz_id=quiz_id,
            workspace_id=workspace_id,
            score=accuracy,
            correct=correct,
            total=total,
            time_taken=time_taken,
            answers=answers,
            ml_feedback=ml_feedback,
        )
        db.add(attempt)

        # Update topic mastery scores
        if workspace_id:
            for topic_name, stats in concept_difficulty.items():
                existing = db.query(Topic).filter_by(workspace_id=workspace_id, name=topic_name).first()
                if existing:
                    existing.mastery_score    = stats["accuracy"]
                    existing.difficulty_score = stats["difficulty_score"]
                else:
                    db.add(Topic(
                        workspace_id=workspace_id,
                        name=topic_name,
                        mastery_score=stats["accuracy"],
                        difficulty_score=stats["difficulty_score"],
                    ))
        db.commit()

    finally:
        db.close()

    return jsonify({
        "correct":    correct,
        "total":      total,
        "accuracy":   round(accuracy * 100, 1),
        "feedback":   feedback_text,
        **ml_feedback,
    })


@bp.get("/api/quiz/history/<ws_id>")
def quiz_history(ws_id: str):
    db = SessionLocal()
    try:
        attempts = (
            db.query(QuizAttempt)
            .filter_by(workspace_id=ws_id)
            .order_by(QuizAttempt.submitted_at.desc())
            .limit(50)
            .all()
        )
        return jsonify([
            {
                "id":           a.id,
                "quiz_id":      a.quiz_id,
                "score":        round(a.score * 100, 1),
                "correct":      a.correct,
                "total":        a.total,
                "time_taken":   a.time_taken,
                "ml_feedback":  a.ml_feedback,
                "submitted_at": a.submitted_at.isoformat() if a.submitted_at else None,
            }
            for a in attempts
        ])
    finally:
        db.close()
