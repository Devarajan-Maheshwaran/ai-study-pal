import re
import nltk
from nltk.tokenize import word_tokenize, sent_tokenize
from nltk.corpus import stopwords
from sklearn.feature_extraction.text import TfidfVectorizer
from collections import Counter

for pkg in ["punkt", "stopwords", "punkt_tab", "averaged_perceptron_tagger"]:
    try:
        nltk.download(pkg, quiet=True)
    except:
        pass

_LATEX_DISPLAY = re.compile(r"\$\$.*?\$\$", re.DOTALL)
_LATEX_INLINE  = re.compile(r"\$[^\$]+?\$")
_MARKDOWN_HDR  = re.compile(r"^#{1,6}\s+", re.MULTILINE)
_MARKDOWN_FMT  = re.compile(r"[*_`~]{1,3}")
_TABLE_LINE    = re.compile(r"^\|.*\|$", re.MULTILINE)
_ASCII_DIAGRAM = re.compile(r"[\u2502\u251c\u2514\u250c\u2510\u2518\u2524\u252c\u2534\u253c\u2500\u2550\u2554\u2557\u255a\u255d\u2560\u2563\u2566\u2569\u256a\u25bc\u25b2\u25c4\u25ba\[\]]+")
_EXTRA_WS      = re.compile(r"\s+")


def clean_text(text: str) -> str:
    """Strip LaTeX equations, markdown, ASCII diagrams, normalise whitespace."""
    text = _LATEX_DISPLAY.sub(" ", text)
    text = _LATEX_INLINE.sub(" ", text)
    text = _MARKDOWN_HDR.sub("", text)
    text = _MARKDOWN_FMT.sub("", text)
    text = _TABLE_LINE.sub("", text)
    text = _ASCII_DIAGRAM.sub(" ", text)
    text = re.sub(r"\\\\[a-zA-Z]+\{?[^}]*\}?", " ", text)
    text = re.sub(r"[^\w\s.,!?;:'\"()-]", " ", text)
    text = _EXTRA_WS.sub(" ", text)
    return text.strip()


def extract_keywords(text: str, top_n: int = 15) -> list:
    text = clean_text(text)
    stop = set(stopwords.words("english"))
    sentences = sent_tokenize(text)
    sentences = [s for s in sentences if len(s.split()) >= 4]

    if len(sentences) >= 3:
        try:
            tfidf = TfidfVectorizer(
                stop_words="english",
                max_features=200,
                ngram_range=(1, 2),
                min_df=1,
            )
            tfidf.fit_transform(sentences)
            feature_names = tfidf.get_feature_names_out()
            idf_scores = tfidf.idf_
            # HIGH IDF first — rarer = more distinctive concept
            scored = sorted(
                zip(feature_names, idf_scores),
                key=lambda x: x[1],
                reverse=True,
            )
            keywords = [
                kw for kw, _ in scored
                if len(kw) > 2 and not kw.replace(" ", "").isdigit()
            ]
            return keywords[:top_n]
        except Exception:
            pass

    tokens = word_tokenize(text.lower())
    clean = [t for t in tokens if t.isalpha() and t not in stop and len(t) > 3]
    freq = Counter(clean)
    return [w for w, _ in freq.most_common(top_n)]


def generate_study_tips(text: str, subject: str = "General") -> list:
    keywords = extract_keywords(text, top_n=8)
    single_kw = [k for k in keywords if " " not in k]
    tips = [
        f"Focus on understanding '{single_kw[0]}' as a core concept before moving on." if single_kw else "Break complex concepts into smaller, labelled parts.",
        "Use active recall: close your notes and try to reproduce key ideas from memory.",
        f"Create a mind map linking '{single_kw[1]}' to related ideas." if len(single_kw) > 1 else "Create visual diagrams mapping relationships between ideas.",
        "Space your revision: study today, revisit in 2 days, then again in a week.",
        f"Test yourself on '{single_kw[2]}' using the generated quiz questions." if len(single_kw) > 2 else "Test yourself with the generated quiz questions.",
        "Teach the concept out loud — if you can explain it simply, you understand it.",
    ]
    return tips
