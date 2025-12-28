from models.summarizer_model import SummarizerModel
from models.nlp_utils import extract_keywords, generate_tips

summarizer = SummarizerModel()

def summarize_and_tips(text, max_sentences=2):
    summary = summarizer.summarize(text, max_sentences)
    tips = generate_tips(text)
    return {'summary': summary, 'tips': tips}
