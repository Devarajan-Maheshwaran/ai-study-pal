import nltk
from collections import Counter

nltk.download("punkt", quiet=True)
nltk.download("stopwords", quiet=True)
STOPWORDS = set(nltk.corpus.stopwords.words("english"))

def extract_keywords(text, top_k=5):
    tokens = nltk.word_tokenize(text.lower())
    words = [t for t in tokens if t.isalpha() and t not in STOPWORDS]
    freq = Counter(words)
    return [w for w, _ in freq.most_common(top_k)]

def generate_study_tips(text):
    keys = extract_keywords(text)
    tips = []
    if keys:
        tips.append(f"Review key terms: {', '.join(keys)} every day.")
        tips.append("Create flashcards for the most confusing terms.")
        tips.append("Solve 3–5 practice questions per key term.")
    else:
        tips.append("Revise main definitions and formulas once before the exam.")
    return tips
