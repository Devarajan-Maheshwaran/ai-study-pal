# backend/services/nlp_service.py
"""
NLP Service Module

Handles keyword extraction, study tips generation, and resource recommendations.

Dependencies:
- nltk (tokenization, stopwords)
- collections (Counter for frequency analysis)
- joblib (database loading)

Trained/Static Models (loaded at startup):
- study_tips_db.joblib (Tips database)
- resources_db.joblib (Resources database)
"""

import os
import nltk
from nltk.tokenize import word_tokenize
from nltk.corpus import stopwords
from collections import Counter
import joblib

# Download required NLTK data
for item in ["punkt", "stopwords"]:
    try:
        nltk.data.find(f'tokenizers/{item}' if item == "punkt" else f'corpora/{item}')
    except LookupError:
        nltk.download(item, quiet=True)


class NLPService:
    """Service for NLP tasks: keyword extraction, tips, and resources."""
    
    def __init__(self, model_dir: str):
        """
        Initialize NLPService with databases.
        
        Args:
            model_dir: Path to models directory
        """
        self.tips_db = None
        self.resources_db = None
        self._load_resources(model_dir)
    
    def _load_resources(self, model_dir: str):
        """Load tips and resources databases."""
        tips_path = os.path.join(model_dir, "study_tips_db.joblib")
        resources_path = os.path.join(model_dir, "resources_db.joblib")
        
        self.tips_db = joblib.load(tips_path)
        self.resources_db = joblib.load(resources_path)
    
    def extract_keywords(self, text: str, top_n: int = 5) -> list:
        """
        Extract top N keywords from text using frequency analysis.
        
        Removes stopwords and filters short words for better quality.
        
        Args:
            text: Input text
            top_n: Number of keywords to extract
        
        Returns:
            List of keywords
        """
        text = text.lower()
        
        try:
            tokens = word_tokenize(text)
        except:
            # Fallback: simple split
            tokens = text.split()
        
        stop_words = set(stopwords.words('english'))
        
        # Filter: remove stopwords, punctuation, short words
        tokens = [
            t for t in tokens
            if t.isalnum() and t not in stop_words and len(t) > 2
        ]
        
        if not tokens:
            return []
        
        # Get top N most frequent
        freq = Counter(tokens)
        top_keywords = freq.most_common(top_n)
        
        return [kw for kw, count in top_keywords]
    
    def get_study_tips(self, keywords: list) -> list:
        """
        Get study tips based on keywords.
        
        Searches the tips database for matching keywords and returns
        relevant tips.
        
        Args:
            keywords: List of keywords
        
        Returns:
            List of study tips (max 5)
        """
        if not keywords or not isinstance(keywords, list):
            return []
        
        all_tips = []
        
        for kw in keywords:
            # Search tips database
            for _, row in self.tips_db.iterrows():
                db_keyword = row.get("keyword", "").lower()
                if kw.lower() in db_keyword or db_keyword in kw.lower():
                    tips = row.get("tips", [])
                    if isinstance(tips, list):
                        all_tips.extend(tips)
        
        # Return unique tips (limit to 5)
        unique_tips = list(set(all_tips))[:5]
        return unique_tips if unique_tips else ["Keep practicing regularly!", "Review your mistakes."]
    
    def get_resources(self, keywords: list) -> list:
        """
        Get learning resources based on keywords.
        
        Searches the resources database for materials matching keywords.
        
        Args:
            keywords: List of keywords
        
        Returns:
            List of resource dictionaries with title and URL
        """
        if not keywords or not isinstance(keywords, list):
            return []
        
        recommended = []
        
        for kw in keywords:
            kw_lower = kw.lower()
            # Search resources database
            for db_kw, resources in self.resources_db.items():
                if kw_lower in db_kw.lower() or db_kw.lower() in kw_lower:
                    if isinstance(resources, list):
                        recommended.extend(resources)
        
        # Deduplicate and limit to 4
        unique_resources = {r.get("title", ""): r for r in recommended}.values()
        return list(unique_resources)[:4]


# Initialize global NLP service
nlp_service = None

def init_nlp_service(model_dir: str):
    """Initialize the global NLP service (call from app.py startup)."""
    global nlp_service
    nlp_service = NLPService(model_dir)

def get_nlp_service() -> NLPService:
    """Get the global NLP service instance."""
    if nlp_service is None:
        raise RuntimeError("NLPService not initialized. Call init_nlp_service first.")
    return nlp_service

def extract_keywords(text: str, top_n: int = 5) -> list:
    """Public function to extract keywords (called by Flask routes)."""
    return get_nlp_service().extract_keywords(text, top_n)

def get_study_tips(keywords: list) -> list:
    """Public function to get study tips (called by Flask routes)."""
    return get_nlp_service().get_study_tips(keywords)

def get_resources(keywords: list) -> list:
    """Public function to get resources (called by Flask routes)."""
    return get_nlp_service().get_resources(keywords)
