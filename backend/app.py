"""StudyForge Flask application entry point.

Blueprints
----------
workspaces  /api/workspaces/*
quiz        /api/quiz/*
content     /api/summarize, /api/keywords, /api/resources, /api/progress/*, ...

Legacy routes from Phase 1 (app_backup.py) are preserved as-is for
backwards compatibility.
"""
import os
from flask import Flask, jsonify
from flask_cors import CORS
from datetime import datetime

from backend.config import config
from backend.db.database import engine, Base
import backend.db.models  # noqa: register ORM models

from backend.routes.workspaces import bp as workspaces_bp
from backend.routes.quiz       import bp as quiz_bp
from backend.routes.content    import bp as content_bp

# Legacy ML model warm-up (keeps existing trained models in memory)
from backend.models.quiz_model import train_quiz_models


def create_app() -> Flask:
    app = Flask(__name__)
    app.config["MAX_CONTENT_LENGTH"] = config.MAX_CONTENT_LENGTH
    app.config["SECRET_KEY"]         = config.SECRET_KEY

    CORS(app, origins=config.CORS_ORIGINS)

    # Auto-create tables (no-op if already exist)
    Base.metadata.create_all(bind=engine)

    # Warm up trained ML models
    try:
        train_quiz_models()
    except Exception as e:
        print(f"[startup] ML warm-up failed: {e}")

    # Register blueprints
    app.register_blueprint(workspaces_bp)
    app.register_blueprint(quiz_bp)
    app.register_blueprint(content_bp)

    # Health check
    @app.get("/health")
    def health():
        return jsonify({"status": "ok", "timestamp": datetime.utcnow().isoformat()})

    return app


if __name__ == "__main__":
    application = create_app()
    application.run(debug=True, port=5000)
