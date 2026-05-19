import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    SECRET_KEY        = os.getenv("FLASK_SECRET_KEY", "dev-secret")
    DATABASE_URL      = os.getenv("DATABASE_URL", "")
    SUPABASE_URL      = os.getenv("SUPABASE_URL", "")
    SUPABASE_KEY      = os.getenv("SUPABASE_SERVICE_KEY", "")
    UPLOAD_FOLDER     = os.getenv("UPLOAD_FOLDER", "./data/uploads")
    CORS_ORIGINS      = os.getenv("CORS_ORIGINS", "http://localhost:5173").split(",")
    MAX_CONTENT_LENGTH = 20 * 1024 * 1024  # 20 MB limit


config = Config()
