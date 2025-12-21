from __future__ import annotations

from typing import List

from nltk.corpus import stopwords
from nltk.tokenize import word_tokenize
from nltk import pos_tag

STOPWORDS = set(stopwords.words("english"))


def _extract_keywords(text: str, top_k: int = 5) -> List[str]:
    tokens = word_tokenize(text)
    tokens = [t for t in tokens if t.isalpha() and t.lower() not in STOPWORDS]
    if not tokens:
        return []
    tagged = pos_tag(tokens)
    nouns = [w for w, pos in tagged if pos.startswith("NN")]
    if not nouns:
        nouns = tokens
    freq = {}
    for w in nouns:
        freq[w.lower()] = freq.get(w.lower(), 0) + 1
    sorted_words = sorted(freq.items(), key=lambda x: x[1], reverse=True)
    return [w for w, _ in sorted_words[:top_k]]


def generate_study_tips(text: str, subject: str | None = None, max_tips: int = 3) -> List[str]:
    subject = subject or "this topic"
    keywords = _extract_keywords(text, top_k=5)
    tips = []

    if keywords:
        main = keywords[0]
        tips.append(f"Review the core concept of '{main}' and try to explain it in your own words.")
    tips.append(f"Practice a few problems on {subject} and check which steps you find hardest.")
    if keywords:
        tips.append(f"Create flashcards for key terms like: {', '.join(keywords[:3])}.")

    return tips[:max_tips]
