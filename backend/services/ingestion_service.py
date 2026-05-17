"""Document ingestion pipeline.

Fix (Phase 7): DocumentChunk instantiation now uses the correct field names
  text=chunk  (not chunk_text / workspace_id / chroma_id).
ChromaDB already stores workspace_id in its metadata; the Postgres table only
needs document_id, chunk_index, and text.
"""
import os
import uuid
from typing import Optional

from sqlalchemy.orm import Session

from backend.db.models import Document, DocumentChunk, Topic
from backend.services.notes_service import parse_text, parse_pdf, parse_youtube
from backend.services.summary_service import generate_summary
from backend.models.nlp_utils import extract_keywords
from backend.config import config

# ── ChromaDB client (lazy init) ───────────────────────────────────────────────
_chroma_client     = None
_chroma_collection = None


def _get_chroma():
    global _chroma_client, _chroma_collection
    if _chroma_collection is None:
        try:
            import chromadb
            os.makedirs(config.CHROMADB_PATH, exist_ok=True)
            _chroma_client = chromadb.PersistentClient(path=config.CHROMADB_PATH)
            _chroma_collection = _chroma_client.get_or_create_collection(
                name="studyforge_chunks",
                metadata={"hnsw:space": "cosine"},
            )
        except Exception as e:
            print(f"[ingestion] ChromaDB init failed: {e} — running without vector search")
    return _chroma_collection


# ── Sentence-transformers embedder (lazy init) ────────────────────────────────
_embedder = None


def _get_embedder():
    global _embedder
    if _embedder is None:
        try:
            from sentence_transformers import SentenceTransformer
            _embedder = SentenceTransformer("all-MiniLM-L6-v2")
        except Exception as e:
            print(f"[ingestion] Embedder init failed: {e} — vector search disabled")
    return _embedder


# ── Chunker ───────────────────────────────────────────────────────────────────

def _chunk_text(text: str, chunk_size: int = 300, overlap: int = 50) -> list[str]:
    """Simple word-count chunker with overlap."""
    words  = text.split()
    chunks = []
    start  = 0
    while start < len(words):
        end = start + chunk_size
        chunks.append(" ".join(words[start:end]))
        start += chunk_size - overlap
    return [c for c in chunks if len(c.split()) >= 20]


# ── Main entry point ──────────────────────────────────────────────────────────

def ingest_document(
    db: Session,
    workspace_id: str,
    source_type: str,
    title: str,
    text: str = "",
    url: str = "",
    file=None,
) -> dict:
    """Ingest a document into Postgres + ChromaDB. Returns a summary dict."""

    # 1. Extract raw text
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

    # 2. Persist Document row
    doc = Document(
        workspace_id=workspace_id,
        title=title,
        source_type=source_type,
        raw_text=raw,
        word_count=len(raw.split()),
    )
    db.add(doc)
    db.flush()  # materialise doc.id before FK references

    # 3. Chunk
    chunks = _chunk_text(raw)

    # 4. Embed + store in ChromaDB
    collection = _get_chroma()
    embedder   = _get_embedder()
    chroma_ids: list = []

    if collection is not None and embedder is not None:
        try:
            embeddings = embedder.encode(chunks, show_progress_bar=False).tolist()
            chroma_ids = [str(uuid.uuid4()) for _ in chunks]
            collection.add(
                ids=chroma_ids,
                embeddings=embeddings,
                documents=chunks,
                # workspace_id lives here in ChromaDB metadata — not in Postgres chunks
                metadatas=[
                    {"workspace_id": workspace_id, "doc_id": doc.id, "chunk_index": i}
                    for i in range(len(chunks))
                ],
            )
        except Exception as e:
            print(f"[ingestion] ChromaDB embed failed: {e}")
            chroma_ids = [None] * len(chunks)
    else:
        chroma_ids = [None] * len(chunks)

    # 5. Persist DocumentChunk rows (only fields that exist on the ORM model)
    for i, chunk in enumerate(chunks):
        db.add(DocumentChunk(
            document_id=doc.id,
            chunk_index=i,
            text=chunk,          # correct field name per models.py
        ))

    # 6. Extract topics + upsert into Topic table
    keywords = extract_keywords(raw)
    for kw in keywords[:8]:
        if not db.query(Topic).filter_by(workspace_id=workspace_id, name=kw).first():
            db.add(Topic(workspace_id=workspace_id, name=kw))

    # 7. Generate summary (local NLP, no external API)
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
