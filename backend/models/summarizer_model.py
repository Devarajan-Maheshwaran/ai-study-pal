class SummarizerModel:
    def summarize(self, text, max_sentences=2):
        sentences = text.split('.')
        sentences = [s.strip() for s in sentences if s.strip()]
        return '.'.join(sentences[:max_sentences]) + '.' if sentences else "Unable to summarize."
