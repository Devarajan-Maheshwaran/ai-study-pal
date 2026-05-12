import re
import os
import requests
from io import BytesIO

import fitz  # PyMuPDF


def parse_text(notes: str) -> str:
    return notes.strip() if notes else ""


def parse_pdf(file) -> str:
    """Extract text from PDF using PyMuPDF (fitz). Handles scanned and digital PDFs."""
    try:
        data = file.read() if hasattr(file, "read") else file
        doc = fitz.open(stream=BytesIO(data), filetype="pdf")
        text = ""
        for page in doc:
            text += page.get_text()
        doc.close()
        return text.strip()
    except Exception as e:
        print(f"[PDF ERROR] {e}")
        return ""


def parse_url(url: str) -> str:
    """Extract readable text from a URL using basic HTML stripping."""
    try:
        resp = requests.get(url, timeout=10, headers={"User-Agent": "Mozilla/5.0"})
        resp.raise_for_status()
        clean = re.sub(r"<[^>]+>", " ", resp.text)
        clean = re.sub(r"\s+", " ", clean).strip()
        return clean[:3000]
    except Exception as e:
        print(f"[URL ERROR] {e}")
        return ""


def parse_youtube(youtube_url: str) -> str:
    """Extract full transcript from YouTube video using youtube-transcript-api."""
    try:
        from youtube_transcript_api import YouTubeTranscriptApi

        match = re.search(r"(?:v=|youtu\.be/)([\w-]{11})", youtube_url)
        if not match:
            return ""
        video_id = match.group(1)

        transcript_list = YouTubeTranscriptApi.get_transcript(video_id)
        transcript = " ".join([entry["text"] for entry in transcript_list])
        return transcript.strip()
    except Exception as e:
        print(f"[YOUTUBE ERROR] {e}")
        return _youtube_api_fallback(youtube_url)


def _youtube_api_fallback(youtube_url: str) -> str:
    """Fallback: get title + description from YouTube Data API."""
    try:
        api_key = os.environ.get("YOUTUBE_API_KEY", "")
        if not api_key:
            return ""
        match = re.search(r"v=([\w-]+)", youtube_url)
        if not match:
            return ""
        video_id = match.group(1)
        url = f"https://www.googleapis.com/youtube/v3/videos?id={video_id}&key={api_key}&part=snippet"
        resp = requests.get(url, timeout=10)
        if resp.status_code == 200:
            items = resp.json().get("items", [])
            if items:
                snippet = items[0]["snippet"]
                return f"{snippet.get('title', '')} {snippet.get('description', '')}"
    except Exception as e:
        print(f"[YOUTUBE API FALLBACK ERROR] {e}")
    return ""


def parse_source(source_type: str, notes=None, url=None, youtube_url=None, file=None) -> str:
    """Unified entry point for all source types."""
    if source_type == "text":
        return parse_text(notes or "")
    elif source_type == "pdf":
        return parse_pdf(file) if file else ""
    elif source_type == "url":
        return parse_url(url or "")
    elif source_type == "youtube":
        return parse_youtube(youtube_url or "")
    return ""
