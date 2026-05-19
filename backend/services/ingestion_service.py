"""Document ingestion pipeline."""
import os
import uuid
from typing import Optional

from sqlalchemy.orm import Session

from backend.db.models import Document, DocumentChunk, Topic
from backend.services.notes_service import parse_text, parse_pdf, parse_youtube
from backend.services.summary_service import generate_summary
from backend.models.nlp_utils import extract_keywords
from backend.config import config

# --- Chunker ---

def _chunk_text(text: str, chunk_size: int = 300, overlap: int = 50) -> list[str]:
    """Chunk text by word count."""
    words  = text.split()
    chunks = []
    start  = 0
    while start < len(words):
        end = start + chunk_size
        chunks.append(" ".join(words[start:end]))
        start += chunk_size - overlap
    return [c for c in chunks if len(c.split()) >= 20]


# --- Ingestion ---

def ingest_document(
    db: Session,
    workspace_id: str,
    source_type: str,
    title: str,
    text: str = "",
    url: str = "",
    file=None,
) -> dict:
    """Ingest a document and return its details."""

    # Extract text
    raw = ""
    if source_type == "text":
        raw = parse_text(text)
    elif source_type == "pdf" and file:
        raw = parse_pdf(file)
    elif source_type == "youtube" and url:
        raw = parse_youtube(url)
    else:
        raise ValueError(f"Unsupported source_type '{source_type}' or missing payload.")

    if len(raw.split()) < 20:
        raise ValueError("Extracted text too short (< 20 words). Check input.")

    # Persist document
    doc = Document(
        workspace_id=workspace_id,
        title=title,
        source_type=source_type,
        raw_text=raw,
        word_count=len(raw.split()),
    )
    db.add(doc)
    db.flush()  # Get ID

    # Chunk text
    chunks = _chunk_text(raw)

    # Save chunks
    for i, chunk in enumerate(chunks):
        db.add(DocumentChunk(
            document_id=doc.id,
            chunk_index=i,
            text=chunk,
        ))

    # Upsert topics
    keywords = extract_keywords(raw)
    for kw in keywords[:8]:
        if not db.query(Topic).filter_by(workspace_id=workspace_id, name=kw).first():
            db.add(Topic(workspace_id=workspace_id, name=kw))

    # Generate summary
    try:
        summary, tips = generate_summary(raw, subject="General")
    except Exception:
        summary, tips = "", []

    db.commit()

    return {
        "document_id": doc.id,
        "title":       title,
        "source_type": source_type,
        "word_count":  doc.word_count,
        "chunk_count": len(chunks),
        "topics":      keywords[:8],
        "summary":     summary,
        "tips":        tips,
    }

