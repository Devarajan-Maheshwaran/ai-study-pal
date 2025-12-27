from flask import Flask, request, jsonify
from flask_cors import CORS
from config import Config
from services.notes_service import process_notes_input
from services.quiz_service import generate_quiz_from_notes, get_adaptive_quiz
from services.summary_service import generate_revision_summary
from services.schedule_service import generate_study_schedule_csv
from services.resources_service import get_resources_for_subject
from services.subject_service import (
    get_available_subjects,
    save_user_progress,
    get_user_dashboard,
)
from services.youtube_service import extract_youtube_transcript_or_meta

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)
    CORS(app)

    # ---------- Utility route ----------
    @app.get("/health")
    def health():
        return jsonify({"status": "ok"})

    # ---------- Subjects & Dashboard ----------

    @app.get("/api/subjects")
    def subjects():
        """
        Returns predefined subjects for the sidebar/dashboard selector.
        Example: AIML Fundamentals, Python Basics, plus any from data file.
        """
        subjects = get_available_subjects()
        return jsonify({"subjects": subjects})

    @app.get("/api/dashboard")
    def dashboard():
        """
        Returns user progress per subject for dashboard cards & topic performance.
        """
        user_id = request.args.get("user_id")
        data = get_user_dashboard(user_id)
        return jsonify(data)

    # ---------- Notes to MCQs & Adaptive Quiz ----------

    @app.post("/api/notes-to-mcqs")
    def notes_to_mcqs():
        """
        Accepts: text notes OR pdf file OR URL OR YouTube link, plus subject.
        Returns: MCQs list.
        """
        payload = request.form if request.form else request.json or {}
        subject = payload.get("subject", "General")
        max_questions = int(payload.get("max_questions", 5))

        text_content = ""
        source_type = payload.get("source_type", "text")

        if source_type == "text":
            text_content = payload.get("notes", "")
        elif source_type == "url":
            text_content = process_notes_input.from_url(payload.get("url"))
        elif source_type == "youtube":
            yt_url = payload.get("youtube_url")
            text_content = extract_youtube_transcript_or_meta(yt_url)
        elif source_type == "pdf":
            # file field name: "file"
            if "file" not in request.files:
                return jsonify({"error": "PDF file missing"}), 400
            text_content = process_notes_input.from_pdf(request.files["file"])
        else:
            return jsonify({"error": "Invalid source_type"}), 400

        questions = generate_quiz_from_notes(text_content, subject, max_questions)
        return jsonify({"questions": questions})

    @app.get("/api/adaptive-quiz")
    def adaptive_quiz():
        """
        Adaptive quiz based on notes + past performance.
        Input: user_id, subject, optional difficulty.
        """
        user_id = request.args.get("user_id")
        subject = request.args.get("subject", "General")
        difficulty = request.args.get("difficulty")  # easy, medium
        quiz = get_adaptive_quiz(user_id=user_id, subject=subject, difficulty=difficulty)
        return jsonify({"questions": quiz})

    @app.post("/api/quiz/submit")
    def submit_quiz():
        """
        Save quiz results and generate motivational feedback.
        """
        from services.summary_service import generate_feedback

        data = request.json or {}
        user_id = data.get("user_id")
        subject = data.get("subject", "General")
        answers = data.get("answers", [])  # list of {question_id, correct: bool}

        correct = sum(1 for ans in answers if ans.get("correct"))
        total = len(answers) or 1
        accuracy = correct / total

        save_user_progress(user_id, subject, correct, total)
        feedback = generate_feedback(subject, accuracy)
        return jsonify(
            {
                "correct": correct,
                "total": total,
                "accuracy": accuracy,
                "feedback": feedback,
            }
        )

    # ---------- Revision / Summary ----------

    @app.post("/api/revision-summary")
    def revision_summary():
        """
        Last‑minute revision: returns short summary + key bullet tips.
        """
        data = request.json or {}
        text = data.get("text", "")
        subject = data.get("subject", "General")
        max_sentences = int(data.get("max_sentences", 3))
        result = generate_revision_summary(text, subject, max_sentences)
        return jsonify(result)

    # ---------- Resources ----------

    @app.get("/api/resources")
    def resources():
        """
        Returns curated URLs + YouTube links for a subject.
        """
        subject = request.args.get("subject", "General")
        limit = int(request.args.get("limit", 5))
        items = get_resources_for_subject(subject, limit)
        return jsonify({"resources": items})

    # ---------- Study Schedule ----------

    @app.get("/api/study-schedule")
    def study_schedule():
        """
        Generate CSV schedule (AI‑generated study plan as per PDF).
        [file:15]
        """
        subject = request.args.get("subject", "General")
        hours = float(request.args.get("hours", 10))
        scenario = request.args.get("scenario", "exam_prep")

        csv_str = generate_study_schedule_csv(subject, hours, scenario)
        return app.response_class(
            csv_str,
            mimetype="text/csv",
            headers={
                "Content-Disposition": f"attachment; filename={subject}_schedule.csv"
            },
        )

    return app

if __name__ == "__main__":
    create_app().run(debug=True)
