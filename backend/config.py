import os

class Config:
    SECRET_KEY = os.environ.get("SECRET_KEY", "dev-secret")
    SQLALCHEMY_DATABASE_URI = os.environ.get(
        "DATABASE_URL", "sqlite:///instance/user_progress.db"
    )
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    YOUTUBE_API_KEY = os.environ.get("YOUTUBE_API_KEY", "")
    # Local paths
    DATA_DIR = os.path.join(os.path.dirname(__file__), "data")
    MODEL_DIR = os.path.join(os.path.dirname(__file__), "models", "artifacts")

os.makedirs(os.path.join(os.path.dirname(__file__), "instance"), exist_ok=True)
os.makedirs(os.path.join(os.path.dirname(__file__), "models", "artifacts"), exist_ok=True)
