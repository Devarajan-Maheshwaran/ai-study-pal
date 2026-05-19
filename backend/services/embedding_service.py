"""
Pluggable Embedding Backend
============================
Abstracts retrieval embeddings so the system can switch between:
  - TF-IDF (default, zero dependencies, always available)
  - sentence-transformers (optional, local CPU model, no API)

Configuration via environment variable:
  USE_SENTENCE_TRANSFORMERS=false   → TF-IDF (default)
  USE_SENTENCE_TRANSFORMERS=true    → sentence-transformers (if installed)
  EMBEDDING_MODEL=all-MiniLM-L6-v2  → model name (only used when ST is enabled)

This design mirrors how production ML systems abstract their retrieval layer:
the calling code never knows which backend is active.

Usage:
    from services.embedding_service import get_top_k

    results = get_top_k(
        query="how does gradient descent work",
        corpus=["text chunk 1", "text chunk 2", ...],
        k=5,
    )
    # returns list of {"text": str, "score": float} sorted by score desc

To enable sentence-transformers:
    pip install sentence-transformers
    export USE_SENTENCE_TRANSFORMERS=true
"""

import os
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

_USE_ST = os.getenv("USE_SENTENCE_TRANSFORMERS", "false").lower() == "true"
_MODEL_NAME = os.getenv("EMBEDDING_MODEL", "all-MiniLM-L6-v2")

_st_model = None


def _load_st_model():
    global _st_model
    if _st_model is None:
        try:
            from sentence_transformers import SentenceTransformer
            _st_model = SentenceTransformer(_MODEL_NAME)
        except ImportError:
            raise ImportError(
                "sentence-transformers is not installed. "
                "Run: pip install sentence-transformers  "
                "or set USE_SENTENCE_TRANSFORMERS=false"
            )
    return _st_model


# ---------------------------------------------------------------------------
# TF-IDF backend
# ---------------------------------------------------------------------------

def _tfidf_top_k(query: str, corpus: list[str], k: int) -> list[dict]:
    if not corpus:
        return []
    vec = TfidfVectorizer(stop_words="english", ngram_range=(1, 2))
    matrix = vec.fit_transform(corpus)
    q_vec  = vec.transform([query])
    scores = cosine_similarity(q_vec, matrix).flatten()
    top_idx = np.argsort(scores)[::-1]
    results = []
    for i in top_idx:
        if scores[i] > 0.01:
            results.append({"text": corpus[i], "score": round(float(scores[i]), 4)})
        if len(results) == k:
            break
    return results


# ---------------------------------------------------------------------------
# Sentence-transformers backend
# ---------------------------------------------------------------------------

def _st_top_k(query: str, corpus: list[str], k: int) -> list[dict]:
    if not corpus:
        return []
    model = _load_st_model()
    corpus_emb = model.encode(corpus, convert_to_numpy=True)
    query_emb  = model.encode([query], convert_to_numpy=True)
    scores     = cosine_similarity(query_emb, corpus_emb).flatten()
    top_idx    = np.argsort(scores)[::-1]
    results = []
    for i in top_idx[:k]:
        results.append({"text": corpus[i], "score": round(float(scores[i]), 4)})
    return results


# ---------------------------------------------------------------------------
# Public API — backend-agnostic
# ---------------------------------------------------------------------------

def get_top_k(
    query: str,
    corpus: list[str],
    k: int = 5,
) -> list[dict]:
    """
    Return top-k most relevant corpus chunks for a query.

    Args:
        query:  The search string.
        corpus: List of text chunks to search over.
        k:      Number of results to return.

    Returns:
        List of {"text": str, "score": float} dicts, sorted by score descending.
    """
    if _USE_ST:
        return _st_top_k(query, corpus, k)
    return _tfidf_top_k(query, corpus, k)


def active_backend() -> str:
    """Returns the name of the currently active embedding backend."""
    return "sentence-transformers" if _USE_ST else "tfidf"
