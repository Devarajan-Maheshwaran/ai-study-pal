import requests
from PyPDF2 import PdfReader
from io import BytesIO
import os
import re

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
    """Extract transcript/title/description from YouTube using API key."""
    api_key = os.environ.get('YOUTUBE_API_KEY', '')
    video_id = None
    match = re.search(r'v=([\w-]+)', youtube_url)
    if match:
        video_id = match.group(1)
    if not video_id or not api_key:
        return ''
    # Try to get video details
    url = f'https://www.googleapis.com/youtube/v3/videos?id={video_id}&key={api_key}&part=snippet'
    resp = requests.get(url)
    if resp.status_code == 200:
        data = resp.json()
        items = data.get('items', [])
        if items:
            snippet = items[0]['snippet']
            return snippet.get('title', '') + ' ' + snippet.get('description', '')
    return ''

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
