import re
import numpy as np
from nltk.tokenize import sent_tokenize
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from models.nlp_utils import generate_study_tips
import nltk

import threading

def _nltk_download():
    for pkg in ["punkt", "punkt_tab"]:
        try:
            nltk.download(pkg, quiet=True)
        except:
            pass

threading.Thread(target=_nltk_download, daemon=True).start()



def generate_summary(text: str, subject: str = "General", max_sentences: int = 7) -> tuple[str, list[str]]:
    """
    High-smartness Extractive Summarizer using TF-IDF Cosine Similarity Degree Centrality
    with a square-root sentence length normalization penalty.
    Returns (summary_text, study_tips).
    """
    sentences = sent_tokenize(text)
    sentences = [s.strip() for s in sentences if len(s.split()) >= 5]

    if not sentences:
        return "Could not generate a summary from the provided text.", []

    if len(sentences) <= max_sentences:
        summary = " ".join(sentences)
        tips = generate_study_tips(text, subject)
        return summary, tips

    try:
        # Compute sentence TF-IDF representations
        tfidf = TfidfVectorizer(stop_words="english", ngram_range=(1, 2))
        matrix = tfidf.fit_transform(sentences)
        
        # Calculate pair-wise cosine similarities between all sentences
        sim_matrix = cosine_similarity(matrix)
        
        # Compute Degree Centrality (sum of similarities with other sentences)
        scores = sim_matrix.sum(axis=1) - 1.0  # exclude self-similarity
        
        # Apply a square-root length normalization penalty to avoid biasing long sentences
        lengths = np.array([len(s.split()) for s in sentences], dtype=float)
        normalized_scores = scores / (lengths ** 0.5)
        
        # Extract top ranked sentences, keeping original text order for structural coherence
        indexed_scores = sorted(enumerate(normalized_scores), key=lambda x: x[1], reverse=True)
        top_indices = sorted([i for i, _ in indexed_scores[:max_sentences]])
        
        summary_sentences = [sentences[i] for i in top_indices]
        summary = " ".join(summary_sentences)
    except Exception as e:
        print(f"[SUMMARY ERROR] {e}")
        summary = " ".join(sentences[:max_sentences])

    tips = generate_study_tips(text, subject)
    return summary, tips

