import os
import random

from flask import Flask, jsonify, request
from flask_cors import CORS

import pandas as pd
import joblib

# -----------------------------------------------------------------------------
# App setup
# -----------------------------------------------------------------------------

app = Flask(__name__)
CORS(app)  # allow React frontend to call this API during development

# -----------------------------------------------------------------------------
# Paths and global objects
# -----------------------------------------------------------------------------

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT = os.path.dirname(BASE_DIR)

DATA_PATH = os.path.join(PROJECT_ROOT, "data", "quiz", "quiz_samples.csv")
MODEL_DIR = os.path.join(BASE_DIR, "models")
MODEL_PATH = os.path.join(MODEL_DIR, "quiz_difficulty_clf.joblib")
VEC_PATH = os.path.join(MODEL_DIR, "quiz_vectorizer.joblib")

quiz_df = None
quiz_clf = None
quiz_vectorizer = None


def load_resources():
    """
    Load quiz dataset, trained classifier, and vectorizer into memory.
    Called once when the app starts.
    """
    global quiz_df, quiz_clf, quiz_vectorizer

    # Load quiz data
    quiz_df_local = pd.read_csv(DATA_PATH)

    # Make sure columns have standard names
    quiz_df_local = quiz_df_local.rename(columns={
        quiz_df_local.columns[0]: "question",
        quiz_df_local.columns[1]: "answer",
        quiz_df_local.columns[2]: "topic",
        quiz_df_local.columns[3]: "difficulty"
    })

    quiz_df_local["difficulty"] = (
        quiz_df_local["difficulty"].astype(str).str.lower().str.strip()
    )

    quiz_df_local = quiz_df_local.dropna(subset=["question", "answer", "topic"])
    quiz_df_local = quiz_df_local[quiz_df_local["question"].str.strip() != ""]

    quiz_df = quiz_df_local.reset_index(drop=True)

    # Load model and vectorizer
    quiz_clf_local = joblib.load(MODEL_PATH)
    quiz_vectorizer_local = joblib.load(VEC_PATH)

    quiz_clf = quiz_clf_local
    quiz_vectorizer = quiz_vectorizer_local


# Load resources at startup
load_resources()

# -----------------------------------------------------------------------------
# Routes
# -----------------------------------------------------------------------------

@app.route("/api/ping", methods=["GET"])
def ping():
    """
    Simple health check endpoint.
    """
    return jsonify({"status": "ok", "message": "AI Study Pal backend is running"})


@app.route("/api/generate-quiz", methods=["POST"])
def generate_quiz():
    """
    Generate a quiz for a given topic and number of questions.

    Expected JSON body:
    {
        "topic": "Python basics",
        "num_questions": 5
    }
    """
    data = request.get_json(force=True) or {}

    topic = data.get("topic", "").strip()
    num_questions = data.get("num_questions", 5)

    if not topic:
        return jsonify({"error": "topic is required"}), 400

    try:
        num_questions = int(num_questions)
    except ValueError:
        return jsonify({"error": "num_questions must be an integer"}), 400

    if num_questions <= 0:
        return jsonify({"error": "num_questions must be > 0"}), 400

    # Filter questions by topic (case insensitive)
    topic_mask = quiz_df["topic"].str.lower().str.contains(topic.lower())
    topic_questions = quiz_df[topic_mask]

    if topic_questions.empty:
        return jsonify({
            "error": "No questions found for this topic",
            "topic": topic
        }), 404

    # If fewer rows than requested, just use all available
    num_questions = min(num_questions, len(topic_questions))

    # Random sample
    sampled = topic_questions.sample(n=num_questions, random_state=random.randint(0, 9999)).copy()

    # Predict difficulty using the trained model (optional if you already trust CSV labels)
    questions_text = sampled["question"].tolist()
    X_vec = quiz_vectorizer.transform(questions_text)
    predicted_difficulties = quiz_clf.predict(X_vec)

    sampled["predicted_difficulty"] = predicted_difficulties

    quiz_items = []
    for idx, row in sampled.iterrows():
        quiz_items.append({
            "id": int(idx),
            "question": row["question"],
            "answer": row["answer"],
            "topic": row["topic"],
            "difficulty": row["difficulty"],
            "predicted_difficulty": row["predicted_difficulty"]
        })

    return jsonify({
        "topic": topic,
        "num_questions": len(quiz_items),
        "items": quiz_items
    })


if __name__ == "__main__":
    app.run(debug=True)
