"""Vector search over ChromaDB for the copilot + summarize-topic flows.
No external AI API — pure local embeddings (all-MiniLM-L6-v2).
"""
from backend.config import config
import os

_collection = None
_embedder   = None


def _get_collection():
    global _collection
    if _collection is None:
        try:
            import chromadb
            client = chromadb.PersistentClient(path=config.CHROMADB_PATH)
            _collection = client.get_or_create_collection("studyforge_chunks")
        except Exception as e:
            print(f"[retrieval] ChromaDB unavailable: {e}")
    return _collection


def _get_embedder():
    global _embedder
    if _embedder is None:
        try:
            from sentence_transformers import SentenceTransformer
            _embedder = SentenceTransformer("all-MiniLM-L6-v2")
        except Exception as e:
            print(f"[retrieval] Embedder unavailable: {e}")
    return _embedder


def search_workspace(
    workspace_id: str,
    query: str,
    n_results: int = 5,
) -> list[dict]:
    """Return top-n relevant chunks for a query within a workspace.
    Falls back to empty list if ChromaDB is unavailable.
    """
    collection = _get_collection()
    embedder   = _get_embedder()
    if collection is None or embedder is None:
        return []

    try:
        q_embedding = embedder.encode([query]).tolist()
        results     = collection.query(
            query_embeddings=q_embedding,
            n_results=n_results,
            where={"workspace_id": workspace_id},
        )
        docs      = results.get("documents", [[]])[0]
        distances = results.get("distances", [[]])[0]
        return [
            {"text": d, "relevance_score": round(1 - dist, 3)}
            for d, dist in zip(docs, distances)
        ]
    except Exception as e:
        print(f"[retrieval] search failed: {e}")
        return []
