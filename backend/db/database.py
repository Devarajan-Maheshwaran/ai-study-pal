"""SQLAlchemy engine + session factory wired to Supabase Postgres.
Falls back to SQLite for local dev when DATABASE_URL is not set.
"""
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, DeclarativeBase
from backend.config import config
import os

_url = config.DATABASE_URL or f"sqlite:///{os.path.join(os.path.dirname(__file__), '../data/studyforge.db')}"

engine = create_engine(
    _url,
    pool_pre_ping=True,
    connect_args={"check_same_thread": False} if _url.startswith("sqlite") else {},
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

class Base(DeclarativeBase):
    pass

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
