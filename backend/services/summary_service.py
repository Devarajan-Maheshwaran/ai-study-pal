import re
from nltk.tokenize import sent_tokenize
from sklearn.feature_extraction.text import TfidfVectorizer
from models.nlp_utils import generate_study_tips
import nltk

for pkg in ["punkt", "punkt_tab"]:
    try:
        nltk.download(pkg, quiet=True)
    except:
        pass


def generate_summary(text: str, subject: str = "General", max_sentences: int = 7) -> tuple[str, list[str]]:
    """
    Extractive summarizer using TF-IDF sentence scoring.
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
        tfidf = TfidfVectorizer(stop_words="english")
        matrix = tfidf.fit_transform(sentences)
        scores = matrix.sum(axis=1).A1

        # Score each sentence and keep original order for coherence
        indexed_scores = sorted(enumerate(scores), key=lambda x: x[1], reverse=True)
        top_indices = sorted([i for i, _ in indexed_scores[:max_sentences]])
        summary_sentences = [sentences[i] for i in top_indices]
        summary = " ".join(summary_sentences)
    except Exception as e:
        print(f"[SUMMARY ERROR] {e}")
        summary = " ".join(sentences[:max_sentences])

    tips = generate_study_tips(text, subject)
    return summary, tips
