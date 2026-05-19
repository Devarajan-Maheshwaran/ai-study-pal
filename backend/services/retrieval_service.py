"""Local TF-IDF Vector Space Model (VSM) for the copilot + search flows.
Zero external neural/transformer models — 100% local, high-precision text search.
"""
from backend.db.database import db_session
from backend.db.models import Document, DocumentChunk
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import numpy as np

def search_workspace(
    workspace_id: str,
    query: str,
    n_results: int = 5,
) -> list[dict]:
    """Return top-n relevant chunks for a query within a workspace using local TF-IDF.
    """
    try:
        # Fetch all chunks in this workspace
        db = db_session()
        chunks = (
            db.query(DocumentChunk)
            .join(Document)
            .filter(Document.workspace_id == workspace_id)
            .all()
        )
        
        if not chunks:
            return []
            
        texts = [c.text for c in chunks]
        
        # Fit TF-IDF on all chunks
        vectorizer = TfidfVectorizer(stop_words="english", ngram_range=(1, 2))
        matrix = vectorizer.fit_transform(texts)
        
        # Transform query
        query_vec = vectorizer.transform([query])
        
        # Compute cosine similarity
        similarities = cosine_similarity(query_vec, matrix).flatten()
        
        # Get top indices
        top_indices = np.argsort(similarities)[::-1]
        
        results = []
        for idx in top_indices:
            score = similarities[idx]
            if score > 0.05:  # Relevance threshold
                results.append({
                    "text": texts[idx],
                    "relevance_score": round(float(score), 3)
                })
                if len(results) >= n_results:
                    break
        return results
    except Exception as e:
        print(f"[retrieval] search failed: {e}")
        return []

