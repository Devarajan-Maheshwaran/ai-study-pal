"""SQLAlchemy ORM models matching the Phase 2 schema.

Tables: workspaces, topics, documents, document_chunks,
        quizzes, quiz_attempts, agent_logs
"""
from sqlalchemy import (
    Column, String, Integer, Float, Text,
    DateTime, ForeignKey, JSON, Boolean
)
from sqlalchemy.orm import relationship
from datetime import datetime
import uuid

from backend.db.database import Base


def _uuid():
    return str(uuid.uuid4())


class Workspace(Base):
    __tablename__ = "workspaces"

    id          = Column(String, primary_key=True, default=_uuid)
    name        = Column(String(200), nullable=False)
    subject     = Column(String(200), default="General")
    exam_date   = Column(String(50), nullable=True)
    created_at  = Column(DateTime, default=datetime.utcnow)

    topics      = relationship("Topic",    back_populates="workspace", cascade="all, delete")
    documents   = relationship("Document", back_populates="workspace", cascade="all, delete")
    quizzes     = relationship("Quiz",     back_populates="workspace", cascade="all, delete")


class Topic(Base):
    __tablename__ = "topics"

    id              = Column(String, primary_key=True, default=_uuid)
    workspace_id    = Column(String, ForeignKey("workspaces.id"), nullable=False)
    name            = Column(String(200), nullable=False)
    mastery_score   = Column(Float, default=0.0)
    difficulty_score= Column(Float, default=0.5)
    created_at      = Column(DateTime, default=datetime.utcnow)

    workspace       = relationship("Workspace", back_populates="topics")


class Document(Base):
    __tablename__ = "documents"

    id           = Column(String, primary_key=True, default=_uuid)
    workspace_id = Column(String, ForeignKey("workspaces.id"), nullable=False)
    title        = Column(String(300), nullable=False)
    source_type  = Column(String(30), default="text")  # text | pdf | youtube | url
    raw_text     = Column(Text, nullable=True)
    word_count   = Column(Integer, default=0)
    uploaded_at  = Column(DateTime, default=datetime.utcnow)

    workspace    = relationship("Workspace", back_populates="documents")
    chunks       = relationship("DocumentChunk", back_populates="document", cascade="all, delete")


class DocumentChunk(Base):
    __tablename__ = "document_chunks"

    id           = Column(String, primary_key=True, default=_uuid)
    document_id  = Column(String, ForeignKey("documents.id"), nullable=False)
    workspace_id = Column(String, nullable=False)
    chunk_index  = Column(Integer, default=0)
    chunk_text   = Column(Text, nullable=False)
    chroma_id    = Column(String, nullable=True)  # ID in ChromaDB collection

    document     = relationship("Document", back_populates="chunks")


class Quiz(Base):
    __tablename__ = "quizzes"

    id           = Column(String, primary_key=True, default=_uuid)
    workspace_id = Column(String, ForeignKey("workspaces.id"), nullable=False)
    topic_name   = Column(String(200), default="General")
    difficulty   = Column(String(20), default="mixed")
    questions    = Column(JSON, nullable=False)  # list of question dicts
    created_at   = Column(DateTime, default=datetime.utcnow)

    workspace    = relationship("Workspace", back_populates="quizzes")
    attempts     = relationship("QuizAttempt", back_populates="quiz", cascade="all, delete")


class QuizAttempt(Base):
    __tablename__ = "quiz_attempts"

    id           = Column(String, primary_key=True, default=_uuid)
    quiz_id      = Column(String, ForeignKey("quizzes.id"), nullable=False)
    workspace_id = Column(String, nullable=False)
    score        = Column(Float, default=0.0)   # 0.0 – 1.0
    correct      = Column(Integer, default=0)
    total        = Column(Integer, default=0)
    time_taken   = Column(Integer, nullable=True)  # seconds
    answers      = Column(JSON, nullable=True)
    ml_feedback  = Column(JSON, nullable=True)  # output of quiz/submit ML pipeline
    submitted_at = Column(DateTime, default=datetime.utcnow)

    quiz         = relationship("Quiz", back_populates="attempts")


class AgentLog(Base):
    __tablename__ = "agent_logs"

    id           = Column(String, primary_key=True, default=_uuid)
    workspace_id = Column(String, nullable=True)
    action       = Column(String(100), nullable=False)
    tool_used    = Column(String(100), nullable=True)
    latency_ms   = Column(Integer, nullable=True)
    payload      = Column(JSON, nullable=True)
    created_at   = Column(DateTime, default=datetime.utcnow)
