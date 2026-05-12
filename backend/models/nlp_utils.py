import re
import nltk
from nltk.tokenize import word_tokenize, sent_tokenize
from nltk.corpus import stopwords
from sklearn.feature_extraction.text import TfidfVectorizer
from collections import Counter

for pkg in ["punkt", "stopwords", "punkt_tab"]:
    try:
        nltk.download(pkg, quiet=True)
    except:
        pass


def extract_keywords(text: str, top_n: int = 15) -> list[str]:
    """
    Extract top keywords using TF-IDF over individual sentences.
    Falls back to frequency-based extraction if text is too short.
    """
    stop = set(stopwords.words("english"))
    sentences = sent_tokenize(text)

    if len(sentences) >= 3:
        try:
            tfidf = TfidfVectorizer(
                stop_words="english",
                max_features=100,
                ngram_range=(1, 2),
            )
            tfidf.fit_transform(sentences)
            scores = dict(zip(tfidf.get_feature_names_out(), tfidf.idf_))
            # Lower IDF = more important in this corpus
            sorted_kw = sorted(scores.items(), key=lambda x: x[1])
            return [kw for kw, _ in sorted_kw[:top_n]]
        except Exception:
            pass

    # Fallback: frequency-based
    tokens = word_tokenize(text.lower())
    clean = [t for t in tokens if t.isalpha() and t not in stop and len(t) > 3]
    freq = Counter(clean)
    return [w for w, _ in freq.most_common(top_n)]


def generate_study_tips(text: str, subject: str = "General") -> list[str]:
    """Generate actionable study tips based on content keywords."""
    keywords = extract_keywords(text, top_n=5)
    tips = [
        f"Focus on understanding the core concept of '{keywords[0]}' before moving on." if keywords else "Break down complex concepts into smaller parts.",
        "Use active recall: close your notes and try to reproduce key ideas from memory.",
        f"Create a mind map linking '{keywords[1]}' to related concepts." if len(keywords) > 1 else "Create visual diagrams to map relationships between ideas.",
        "Space your revision: study this material today, revisit in 2 days, then again in a week.",
        f"Test yourself on '{keywords[2]}' with the generated quiz questions." if len(keywords) > 2 else "Test yourself with the generated quiz questions.",
        "Teach the concept out loud — if you can explain it simply, you understand it.",
    ]
    return tips
