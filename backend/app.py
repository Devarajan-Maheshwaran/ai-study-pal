from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
from werkzeug.utils import secure_filename
import os, json, csv, collections
from datetime import datetime, timedelta
from io import StringIO, BytesIO

from models.quiz_model import train_quiz_models, classify_difficulty, generate_mcqs
from services.summary_service import generate_summary
from models.nlp_utils import extract_keywords, generate_study_tips
from models.feedback_model import generate_feedback_text
from services.notes_service import parse_text, parse_pdf, parse_url, parse_youtube, parse_source
from services.quiz_service import create_quiz_from_notes
from services.schedule_service import generate_study_schedule_csv
from services.resources_service import get_resources
from services.subject_service import get_all_subjects, create_subject

UPLOAD_FOLDER = os.path.join(os.path.dirname(__file__), "data", "uploads")
HISTORY_FILE  = os.path.join(os.path.dirname(__file__), "data", "quiz_history.json")
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
os.makedirs(os.path.dirname(HISTORY_FILE), exist_ok=True)

def load_history():
    if os.path.exists(HISTORY_FILE):
        with open(HISTORY_FILE) as f:
            return json.load(f)
    return {}

def save_history(h):
    with open(HISTORY_FILE, "w") as f:
        json.dump(h, f)

def create_app():
    app = Flask(__name__)
    CORS(app, origins="*")
    train_quiz_models()

    @app.route("/health")
    def health():
        return jsonify({"status": "ok", "timestamp": datetime.now().isoformat()})

    @app.route("/api/subjects", methods=["GET"])
    def get_subjects_route():
        return jsonify({"subjects": get_all_subjects()})

    @app.route("/api/subjects", methods=["POST"])
    def create_subject_route():
        data = request.json or {}
        name = data.get("name", "").strip()
        if not name:
            return jsonify({"error": "Missing name field"}), 400
        result = create_subject(name)
        return jsonify(result), 201

    @app.route("/api/parse", methods=["POST"])
    def parse_content():
        source = request.form.get("source", "text")
        text = ""
        if source == "text":
            text = parse_text(request.form.get("content", ""))
        elif source == "pdf" and "file" in request.files:
            text = parse_pdf(request.files["file"])
        elif source == "youtube":
            text = parse_youtube(request.form.get("url", ""))
        elif source == "url":
            text = parse_url(request.form.get("url", ""))
        if not text:
            return jsonify({"error": "Could not extract content"}), 400
        keywords = extract_keywords(text)
        return jsonify({"text": text, "word_count": len(text.split()), "keywords": keywords})

    @app.route("/api/summarize", methods=["POST"])
    @app.route("/api/revision-summary", methods=["POST"])
    def summarize():
        data = request.json or {}
        text = data.get("text", "").strip()
        subject = data.get("subject", "General")
        if len(text.split()) < 20:
            return jsonify({"error": "Text too short or empty"}), 400
        summary, tips = generate_summary(text, subject)
        keywords = extract_keywords(text)
        return jsonify({"summary": summary, "tips": tips, "keywords": keywords})

    @app.route("/api/mcqs", methods=["POST"])
    @app.route("/api/notes-to-mcqs", methods=["POST"])
    def mcqs():
        data = request.json or {}
        text = data.get("text", "").strip()
        subject = data.get("subject", "General")
        num = int(data.get("num_questions", 5))
        if len(text.split()) < 20:
            return jsonify({"error": "Text too short or empty"}), 400
        questions = generate_mcqs(text, num)
        texts = [q.get("question", q.get("stem", "")) for q in questions]
        difficulties = classify_difficulty(texts) if texts else []
        for i, q in enumerate(questions):
            q["difficulty"] = difficulties[i] if i < len(difficulties) else "medium"
            q["subject"] = subject
            q["id"] = f"q_{i}_{int(datetime.now().timestamp())}"
        return jsonify({"questions": questions, "count": len(questions)})

    @app.route("/api/quiz/adaptive", methods=["POST"])
    def adaptive_quiz():
        data = request.json or {}
        text = data.get("text", "").strip()
        subject = data.get("subject", "General")
        num = int(data.get("num_questions", 10))
        difficulty = data.get("difficulty", "easy")
        if not text or len(text.split()) < 20:
            return jsonify({"error": "Text required to generate quiz"}), 400
        questions = create_quiz_from_notes(text, subject, num)
        easy_qs = [q for q in questions if q.get("difficulty") == "easy"]
        med_qs  = [q for q in questions if q.get("difficulty") != "easy"]
        ordered = (easy_qs + med_qs) if difficulty == "easy" else (med_qs + easy_qs)
        result = (ordered + questions)[:num]
        for i, q in enumerate(result):
            q["id"] = f"aq_{i}_{int(datetime.now().timestamp())}"
        return jsonify({"questions": result, "count": len(result)})

    @app.route("/api/quiz/submit", methods=["POST"])
    def submit_quiz():
        data = request.json or {}
        subject = data.get("subject", "General")
        user_id = data.get("user_id", "default")
        answers = data.get("answers", [])
        if not answers:
            return jsonify({"error": "No answers provided"}), 400

        correct = sum(1 for a in answers if str(a.get("user_answer","")) == str(a.get("correct_answer","")))
        total   = len(answers)
        accuracy = round(correct / total, 4) if total else 0

        history = load_history()
        if user_id not in history:
            history[user_id] = []
        attempt = {
            "subject": subject, "accuracy": accuracy,
            "correct": correct, "total": total,
            "timestamp": datetime.now().isoformat(),
            "answers": answers
        }
        history[user_id].append(attempt)
        save_history(history)

        feedback_text = generate_feedback_text(subject, accuracy)

        subject_attempts = [a for a in history[user_id] if a["subject"] == subject]
        recent_accs = [a["accuracy"] for a in subject_attempts[-5:]]
        ability = round(sum(recent_accs)/len(recent_accs), 4) if recent_accs else accuracy
        trend = "improving" if (len(recent_accs)>1 and recent_accs[-1]>recent_accs[0]) else (
                "declining" if (len(recent_accs)>1 and recent_accs[-1]<recent_accs[0]) else "stable")

        all_accs = [a["accuracy"] for a in subject_attempts]
        avg_acc  = sum(all_accs)/len(all_accs) if all_accs else accuracy
        n = len(subject_attempts)
        consistency = 1 - (max(all_accs)-min(all_accs)) if len(all_accs)>1 else 0.5
        pred_score  = min(100, round(avg_acc*70 + consistency*15 + min(n,10)*1.5, 1))
        readiness   = "High" if pred_score>=75 else ("Medium" if pred_score>=55 else "Low")

        topic_stats = collections.defaultdict(lambda: {"correct":0,"total":0})
        for a in answers:
            t = a.get("topic", "General")
            topic_stats[t]["total"] += 1
            if str(a.get("user_answer","")) == str(a.get("correct_answer","")):
                topic_stats[t]["correct"] += 1
        concept_difficulty = {
            t: {"accuracy": round(v["correct"]/v["total"],2) if v["total"] else 0,
                "difficulty_score": round(1-(v["correct"]/v["total"]),2) if v["total"] else 1,
                "attempts": v["total"]}
            for t,v in topic_stats.items()
        }
        weak_topics = [t for t,v in concept_difficulty.items() if v["accuracy"]<0.5]
        suggestions = [f"Revisit {t} - only {int(v["accuracy"]*100)}% accuracy"
                       for t,v in concept_difficulty.items() if v["accuracy"]<0.6]

        return jsonify({
            "correct": correct, "total": total,
            "accuracy": round(accuracy*100,1),
            "feedback": feedback_text,
            "suggestions": suggestions,
            "weak_topics": weak_topics,
            "knowledge": {"ability": round(ability*100,1), "trend": trend, "attempts_in_subject": n},
            "exam_prediction": {"predicted_score": pred_score, "readiness": readiness, "confidence": min(100,n*10)},
            "concept_difficulty": concept_difficulty
        })

    @app.route("/api/progress", methods=["GET"])
    def progress():
        user_id = request.args.get("user_id", "default")
        history = load_history()
        user_data = history.get(user_id, [])
        if not user_data:
            return jsonify({"averageAccuracy":0,"totalQuizAttempts":0,"subjectStats":[],
                           "knowledge":{},"exam_predictions":{},"concept_difficulty":{},"sessions_this_week":0})

        by_subject = collections.defaultdict(list)
        for a in user_data:
            by_subject[a["subject"]].append(a)

        subject_stats, knowledge_map, exam_map, concept_map = [], {}, {}, {}
        for subject, attempts in by_subject.items():
            accs = [a["accuracy"] for a in attempts]
            avg  = sum(accs)/len(accs)
            subject_stats.append({
                "subjectName": subject, "accuracy": round(avg*100,1),
                "quizAttempts": len(attempts),
                "correctAnswers": sum(a["correct"] for a in attempts),
                "totalQuestions": sum(a["total"] for a in attempts)
            })
            recent = accs[-5:]
            trend = "improving" if (len(recent)>1 and recent[-1]>recent[0]) else (
                    "declining" if (len(recent)>1 and recent[-1]<recent[0]) else "stable")
            knowledge_map[subject] = {"ability": round(avg*100,1), "trend": trend, "attempts": len(attempts)}
            consistency = 1-(max(accs)-min(accs)) if len(accs)>1 else 0.5
            pred = min(100, round(avg*70+consistency*15+min(len(attempts),10)*1.5,1))
            exam_map[subject] = {"predicted_score":pred,
                                 "readiness":"High" if pred>=75 else ("Medium" if pred>=55 else "Low")}
            ts = collections.defaultdict(lambda:{"correct":0,"total":0})
            for att in attempts:
                for a in att.get("answers",[]):
                    t = a.get("topic", subject)
                    ts[t]["total"] += 1
                    if str(a.get("user_answer",""))==str(a.get("correct_answer","")):
                        ts[t]["correct"] += 1
            concept_map[subject] = {
                t: round(1-(v["correct"]/v["total"]),2) if v["total"] else 1
                for t,v in ts.items()
            }

        total_acc = sum(s["accuracy"] for s in subject_stats)/len(subject_stats) if subject_stats else 0
        week_ago = (datetime.now()-timedelta(days=7)).isoformat()
        sessions_week = sum(1 for a in user_data if a["timestamp"]>=week_ago)

        return jsonify({
            "averageAccuracy": round(total_acc,1), "totalQuizAttempts": len(user_data),
            "subjectStats": subject_stats, "knowledge": knowledge_map,
            "exam_predictions": exam_map, "concept_difficulty": concept_map,
            "sessions_this_week": sessions_week
        })

    @app.route("/api/resources", methods=["POST"])
    def resources():
        data = request.json or {}
        subject  = data.get("subject", "General")
        topics   = data.get("topics", [])
        accuracy = data.get("accuracy", 0.5)
        result   = get_resources(subject, topics=topics, accuracy=accuracy)
        return jsonify({"resources": result})

    @app.route("/api/study-schedule", methods=["POST"])
    def study_schedule():
        data = request.json or {}
        subject = data.get("subject", "General")
        hours   = float(data.get("hours", 4))
        concept_weights = data.get("concept_difficulty", {})
        csv_data = generate_study_schedule_csv(subject, hours, concept_weights)
        buf = BytesIO(csv_data.encode())
        buf.seek(0)
        return send_file(buf, mimetype="text/csv", as_attachment=True, download_name="study_schedule.csv")

    @app.route("/api/dashboard", methods=["GET"])
    def dashboard():
        user_id = request.args.get("user_id", "default")
        history = load_history()
        user_data = history.get(user_id, [])
        total = len(user_data)
        avg = round(sum(a["accuracy"] for a in user_data)/total*100, 1) if user_data else 0
        subjects_list = get_all_subjects()
        return jsonify({"subjects": subjects_list, "total_quiz_attempts": total, "average_accuracy": avg})

    return app

if __name__ == "__main__":
    app = create_app()
    app.run(debug=True, port=5000)
