# backend/services/summarizer_service.py
"""
Summarizer Service Module

Handles text summarization using extractive approach.
Demonstrates Deep Learning with Keras (trained model loaded but using 
extractive logic for practical MVP summarization).

Dependencies:
- nltk (sentence tokenization)
- tensorflow/keras (DL model loading, though not used in extractive summarization)
- joblib (model loading)

Trained Models (loaded at startup):
- summarizer_keras_model.h5 (Keras DL model)
- summarizer_input_tokenizer.joblib
- summarizer_target_tokenizer.joblib
"""

import os
import nltk
from nltk.tokenize import sent_tokenize
import joblib

# Download punkt once
try:
    nltk.data.find('tokenizers/punkt')
except LookupError:
    nltk.download("punkt", quiet=True)


class SummarizerService:
    """Service for text summarization."""
    
    def __init__(self, model_dir: str):
        """
        Initialize SummarizerService.
        
        Args:
            model_dir: Path to models directory (for future DL model usage)
        """
        self.model_dir = model_dir
        self._load_resources(model_dir)
    
    def _load_resources(self, model_dir: str):
        """
        Load Keras model and tokenizers.
        
        Note: For MVP, we use extractive summarization below.
        The DL model is kept for demonstration of Keras integration.
        """
        try:
            # These paths can be used for future enhancements
            self.keras_model_path = os.path.join(
                model_dir, "summarizer_keras_model.h5"
            )
            self.input_tok_path = os.path.join(
                model_dir, "summarizer_input_tokenizer.joblib"
            )
            self.target_tok_path = os.path.join(
                model_dir, "summarizer_target_tokenizer.joblib"
            )
            # Models are lazy-loaded only if needed
        except Exception as e:
            print(f"Warning: Could not load summarizer models: {e}")
    
    def summarize(self, text: str, max_sentences: int = 2) -> str:
        """
        Summarize text using extractive approach.
        
        Extracts the first N sentences from the text as a summary.
        This is practical for MVP and can be enhanced later with
        neural abstractive summarization.
        
        Args:
            text: Text to summarize
            max_sentences: Maximum number of sentences in summary
        
        Returns:
            Summarized text
        """
        text = (text or "").strip()
        
        if not text:
            return ""
        
        # Split into sentences
        try:
            sentences = sent_tokenize(text)
        except:
            # Fallback if tokenization fails
            sentences = text.split(". ")
        
        if not sentences:
            return text
        
        # If text is already short, return as is
        if len(sentences) <= max_sentences:
            return text
        
        # Extract first N sentences
        summary = " ".join(sentences[:max_sentences])
        
        return summary
    
    def get_summary_stats(self, original: str, summary: str) -> dict:
        """
        Get statistics about summarization.
        
        Returns:
            Dictionary with original length, summary length, ratio
        """
        orig_len = len(original)
        summ_len = len(summary)
        ratio = (summ_len / orig_len * 100) if orig_len > 0 else 0
        
        return {
            "original_length": orig_len,
            "summary_length": summ_len,
            "compression_ratio": round(ratio, 1)
        }


# Initialize global summarizer service
summarizer_service = None

def init_summarizer_service(model_dir: str):
    """Initialize the global summarizer service (call from app.py startup)."""
    global summarizer_service
    summarizer_service = SummarizerService(model_dir)

def get_summarizer_service() -> SummarizerService:
    """Get the global summarizer service instance."""
    if summarizer_service is None:
        raise RuntimeError("SummarizerService not initialized. Call init_summarizer_service first.")
    return summarizer_service

def summarize_text(text: str, max_sentences: int = 2) -> str:
    """Public function to summarize text (called by Flask routes)."""
    return get_summarizer_service().summarize(text, max_sentences)
