from nltk.tokenize import word_tokenize
from nltk.corpus import stopwords
import re

def extract_keywords(text, num_keywords=5):
    """Extract keywords from text."""
    try:
        import nltk
        nltk.download('punkt', quiet=True)
        nltk.download('stopwords', quiet=True)
        words = word_tokenize(text.lower())
        stop = set(stopwords.words('english'))
        keywords = [w for w in words if w.isalnum() and w not in stop]
        return list(set(keywords[:num_keywords]))
    except:
        # Fallback: simple word extraction
        words = re.findall(r'\b[a-z]+\b', text.lower())
        return list(set(w for w in words if len(w) > 3))[:num_keywords]

def generate_study_tips(keywords, subject):
    """Generate study tips from keywords."""
    tips = [
        f"Focus on understanding {keywords[0] if keywords else 'key concepts'}.",
        f"Create flashcards for {subject} terms.",
        "Review material regularly for better retention.",
        "Practice problems related to the concepts.",
    ]
    return tips[:3]
