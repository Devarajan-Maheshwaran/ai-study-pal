from models.summarizer_model import summarize_text
from models.nlp_utils import generate_study_tips
from models.feedback_model import generate_feedback_text

def generate_revision_summary(text: str, subject: str, max_sentences: int):
    """
    Uses DL summarizer + NLP tips for last‑minute revision page.
    """
    summary = summarize_text(text, max_sentences=max_sentences)
    tips = generate_study_tips(text)
    return {
        "subject": subject,
        "summary": summary,
        "tips": tips,
    }

def generate_feedback(subject: str, accuracy: float) -> str:
    return generate_feedback_text(subject, accuracy)
