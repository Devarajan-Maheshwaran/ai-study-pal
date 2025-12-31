from models.summarizer_model import summarize_text
from models.nlp_utils import extract_keywords, generate_study_tips

def generate_summary(text, subject, max_sentences=3):
    summary = summarize_text(text, max_sentences)
    keywords = extract_keywords(text)
    tips = generate_study_tips(keywords, subject)
    return summary, tips
