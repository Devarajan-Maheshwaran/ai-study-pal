import re
from config import Config
import requests

YOUTUBE_VIDEO_ID_REGEX = r"(?:v=|youtu\.be/)([A-Za-z0-9_\-]+)"

def extract_video_id(url: str) -> str:
    m = re.search(YOUTUBE_VIDEO_ID_REGEX, url)
    return m.group(1) if m else ""

def extract_youtube_transcript_or_meta(url: str) -> str:
    """
    Minimal: call YouTube Data API to get title & description as 'notes'.
    You can later plug in transcript APIs.
    """
    vid = extract_video_id(url)
    if not vid or not Config.YOUTUBE_API_KEY:
        return ""
    api_url = (
        "https://www.googleapis.com/youtube/v3/videos"
        f"?id={vid}&key={Config.YOUTUBE_API_KEY}&part=snippet"
    )
    r = requests.get(api_url, timeout=10)
    r.raise_for_status()
    items = r.json().get("items", [])
    if not items:
        return ""
    snippet = items[0]["snippet"]
    title = snippet.get("title", "")
    desc = snippet.get("description", "")
    return f"{title}\n{desc}"
