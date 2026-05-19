"""Source parsing service for text, PDF, URL, and YouTube."""
import re
import os
import socket
import ipaddress
import requests
from io import BytesIO
from urllib.parse import urlparse

import fitz  # PyMuPDF

# Allowed URL schemes
_ALLOWED_SCHEMES = {"http", "https"}

# Blocked IP ranges (RFC 1918, loopback, link-local, cloud-metadata, etc.)
_BLOCKED_NETS = [
    ipaddress.ip_network("0.0.0.0/8"),
    ipaddress.ip_network("10.0.0.0/8"),
    ipaddress.ip_network("127.0.0.0/8"),
    ipaddress.ip_network("169.254.0.0/16"),   # AWS/GCP metadata
    ipaddress.ip_network("172.16.0.0/12"),
    ipaddress.ip_network("192.168.0.0/16"),
    ipaddress.ip_network("::1/128"),
    ipaddress.ip_network("fc00::/7"),
    ipaddress.ip_network("fe80::/10"),
]


def _validate_url(url: str) -> str:
    """Raise ValueError if the URL is unsafe (SSRF vector). Returns the sanitised URL."""
    parsed = urlparse(url)
    if parsed.scheme not in _ALLOWED_SCHEMES:
        raise ValueError(f"URL scheme '{parsed.scheme}' is not allowed.")
    hostname = parsed.hostname
    if not hostname:
        raise ValueError("URL has no hostname.")
    try:
        addr = socket.getaddrinfo(hostname, None)[0][4][0]
        ip   = ipaddress.ip_address(addr)
    except Exception:
        raise ValueError(f"Cannot resolve hostname: {hostname}")
    for blocked in _BLOCKED_NETS:
        if ip in blocked:
            raise ValueError(f"Blocked: {hostname} resolves to private/reserved IP {ip}")
    return url


def parse_text(notes: str) -> str:
    return notes.strip() if notes else ""


def parse_pdf(file) -> str:
    """Extract text from PDF using PyMuPDF (fitz)."""
    try:
        data = file.read() if hasattr(file, "read") else file
        doc  = fitz.open(stream=BytesIO(data), filetype="pdf")
        text = "".join(page.get_text() for page in doc)
        doc.close()
        return text.strip()
    except Exception as e:
        print(f"[PDF ERROR] {e}")
        return ""


def parse_url(url: str) -> str:
    """Fetch and strip HTML from a URL. Validates against SSRF before fetching."""
    try:
        safe_url = _validate_url(url)
    except ValueError as e:
        print(f"[URL BLOCKED] {e}")
        return ""
    try:
        resp  = requests.get(safe_url, timeout=10, headers={"User-Agent": "StudyForge/1.0"})
        resp.raise_for_status()
        clean = re.sub(r"<[^>]+>", " ", resp.text)
        clean = re.sub(r"\s+", " ", clean).strip()
        return clean[:3000]
    except Exception as e:
        print(f"[URL ERROR] {e}")
        return ""


def parse_youtube(youtube_url: str) -> str:
    """Extract full transcript from YouTube video."""
    try:
        from youtube_transcript_api import YouTubeTranscriptApi
        match = re.search(r"(?:v=|youtu\.be/)([\w-]{11})", youtube_url)
        if not match:
            return ""
        video_id      = match.group(1)
        transcript_list = YouTubeTranscriptApi.get_transcript(video_id)
        return " ".join(e["text"] for e in transcript_list).strip()
    except Exception as e:
        print(f"[YOUTUBE ERROR] {e}")
        return _youtube_api_fallback(youtube_url)


def _youtube_api_fallback(youtube_url: str) -> str:
    api_key = os.environ.get("YOUTUBE_API_KEY", "")
    if not api_key:
        return ""
    try:
        match = re.search(r"v=([\w-]+)", youtube_url)
        if not match:
            return ""
        video_id = match.group(1)
        resp = requests.get(
            f"https://www.googleapis.com/youtube/v3/videos?id={video_id}&key={api_key}&part=snippet",
            timeout=10,
        )
        if resp.status_code == 200:
            items = resp.json().get("items", [])
            if items:
                s = items[0]["snippet"]
                return f"{s.get('title','')} {s.get('description','')}"
    except Exception as e:
        print(f"[YOUTUBE API FALLBACK ERROR] {e}")
    return ""


def parse_source(source_type: str, notes=None, url=None, youtube_url=None, file=None) -> str:
    """Unified entry point for all source types."""
    if source_type == "text":    return parse_text(notes or "")
    if source_type == "pdf":     return parse_pdf(file) if file else ""
    if source_type == "url":     return parse_url(url or "")
    if source_type == "youtube": return parse_youtube(youtube_url or "")
    return ""
