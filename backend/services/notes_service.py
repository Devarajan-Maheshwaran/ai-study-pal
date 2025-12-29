import requests
from PyPDF2 import PdfReader
from io import BytesIO

def parse_text(notes):
    return notes if notes else ""

def parse_pdf(file):
    """Extract text from PDF."""
    try:
        pdf = PdfReader(BytesIO(file.read()))
        text = ""
        for page in pdf.pages:
            text += page.extract_text()
        return text
    except:
        return ""

def parse_url(url):
    """Extract text from URL."""
    try:
        resp = requests.get(url, timeout=5)
        # Simple extraction - just get first 500 chars of content
        return resp.text[:500]
    except:
        return ""

def parse_youtube(youtube_url):
    """Extract transcript from YouTube (stub)."""
    return "YouTube video content. Please add transcript API key."

def parse_source(source_type, notes=None, url=None, youtube_url=None, file=None):
    """Parse different source types."""
    if source_type == "text":
        return parse_text(notes)
    elif source_type == "pdf":
        return parse_pdf(file) if file else ""
    elif source_type == "url":
        return parse_url(url)
    elif source_type == "youtube":
        return parse_youtube(youtube_url)
    return ""
