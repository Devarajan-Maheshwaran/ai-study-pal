"""StudyForge — Flask app factory (Phase 3)."""
import os
from flask import Flask, jsonify
from flask_cors import CORS
from datetime import datetime

from backend.config import config
from backend.db.database import engine, Base
import backend.db.models

from backend.routes.workspaces import bp as workspaces_bp
from backend.routes.quiz       import bp as quiz_bp
from backend.routes.content    import bp as content_bp
from backend.routes.copilot    import bp as copilot_bp
from backend.routes.flashcards import bp as flashcards_bp

from backend.models.quiz_model import train_quiz_models


def create_app() -> Flask:
    app = Flask(__name__)
    app.config["MAX_CONTENT_LENGTH"] = config.MAX_CONTENT_LENGTH
    app.config["SECRET_KEY"]         = config.SECRET_KEY

    CORS(app, origins=config.CORS_ORIGINS)
    Base.metadata.create_all(bind=engine)

    try:
        train_quiz_models()
    except Exception as e:
        print(f"[startup] ML warm-up: {e}")

    for bp in (workspaces_bp, quiz_bp, content_bp, copilot_bp, flashcards_bp):
        app.register_blueprint(bp)

    @app.get("/health")
    def health():
        return jsonify({"status": "ok", "timestamp": datetime.utcnow().isoformat()})

    return app


if __name__ == "__main__":
    create_app().run(debug=True, port=5000)
