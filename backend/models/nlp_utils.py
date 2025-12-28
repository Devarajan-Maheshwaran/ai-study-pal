import re
from nltk.tokenize import word_tokenize
from nltk.corpus import stopwords

try:
    stopwords.words('english')
except:
    import nltk
    nltk.download('stopwords', quiet=True)
    nltk.download('punkt', quiet=True)

def extract_keywords(text, num_keywords=5):
    try:
        from nltk.tokenize import word_tokenize
        from nltk.corpus import stopwords
        stop_words = set(stopwords.words('english'))
        words = word_tokenize(text.lower())
        keywords = [w for w in words if w.isalnum() and w not in stop_words]
        return list(dict.fromkeys(keywords))[:num_keywords]
    except:
        return text.split()[:num_keywords]

def generate_tips(text):
    keywords = extract_keywords(text, 5)
    tips = [f"Review key term: {kw}" for kw in keywords]
    return tips
