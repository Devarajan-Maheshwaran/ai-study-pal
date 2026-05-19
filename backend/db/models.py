"""SQLAlchemy ORM models for StudyForge."""
import uuid
from datetime import datetime
from sqlalchemy import Column, String, Float, Integer, DateTime, Text, ForeignKey, JSON
from sqlalchemy.orm import relationship
from backend.db.database import Base


def _uuid():
    return str(uuid.uuid4())


class Workspace(Base):
    __tablename__ = "workspaces"

    id         = Column(String,      primary_key=True, default=_uuid)
    user_id    = Column(String(100), nullable=False, index=True, default="dev")  # Owner ID
    name       = Column(String(200), nullable=False)
    subject    = Column(String(200), default="General")
    exam_date  = Column(String(50),  nullable=True)
    created_at = Column(DateTime,    default=datetime.utcnow)


    topics    = relationship("Topic",    back_populates="workspace", cascade="all, delete-orphan")
    documents = relationship("Document", back_populates="workspace", cascade="all, delete-orphan")


class Topic(Base):
    __tablename__ = "topics"

    id               = Column(String, primary_key=True, default=_uuid)
    workspace_id     = Column(String, ForeignKey("workspaces.id", ondelete="CASCADE"), nullable=False)
    name             = Column(String(300), nullable=False)
    mastery_score    = Column(Float,   default=0.0)
    difficulty_score = Column(Float,   default=0.5)
    created_at       = Column(DateTime, default=datetime.utcnow)

    workspace = relationship("Workspace", back_populates="topics")


class Document(Base):
    __tablename__ = "documents"

    id           = Column(String,  primary_key=True, default=_uuid)
    workspace_id = Column(String,  ForeignKey("workspaces.id", ondelete="CASCADE"), nullable=False)
    title        = Column(String(400), nullable=False)
    source_type  = Column(String(50),  default="text")
    raw_text     = Column(Text,    nullable=True)
    word_count   = Column(Integer, default=0)
    uploaded_at  = Column(DateTime, default=datetime.utcnow)

    workspace = relationship("Workspace", back_populates="documents")
    chunks    = relationship("DocumentChunk", back_populates="document", cascade="all, delete-orphan")


class DocumentChunk(Base):
    __tablename__ = "document_chunks"

    id          = Column(String,  primary_key=True, default=_uuid)
    document_id = Column(String,  ForeignKey("documents.id", ondelete="CASCADE"), nullable=False)
    chunk_index = Column(Integer, nullable=False)
    text        = Column(Text,    nullable=False)

    document = relationship("Document", back_populates="chunks")


class Quiz(Base):
    __tablename__ = "quizzes"

    id           = Column(String,   primary_key=True, default=_uuid)
    workspace_id = Column(String,   ForeignKey("workspaces.id", ondelete="CASCADE"), nullable=False)
    questions    = Column(JSON,     nullable=False, default=list)
    created_at   = Column(DateTime, default=datetime.utcnow)

    attempts = relationship("QuizAttempt", back_populates="quiz", cascade="all, delete-orphan")


class QuizAttempt(Base):
    __tablename__ = "quiz_attempts"

    id           = Column(String,   primary_key=True, default=_uuid)
    quiz_id      = Column(String,   ForeignKey("quizzes.id",      ondelete="CASCADE"), nullable=False)
    workspace_id = Column(String,   ForeignKey("workspaces.id",   ondelete="CASCADE"), nullable=False)
    score        = Column(Float,    default=0.0)
    correct      = Column(Integer,  default=0)
    total        = Column(Integer,  default=0)
    time_taken   = Column(Integer,  nullable=True)
    ml_feedback  = Column(JSON,     nullable=True)
    submitted_at = Column(DateTime, default=datetime.utcnow)

    quiz = relationship("Quiz", back_populates="attempts")
