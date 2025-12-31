import PyPDF2
import requests
from bs4 import BeautifulSoup
import re

def extract_text_from_source(source, source_type):
    if source_type == 'pdf':
        reader = PyPDF2.PdfReader(source)
        text = ''
        for page in reader.pages:
            text += page.extract_text() or ''
        return text
    elif source_type == 'url':
        resp = requests.get(source)
        soup = BeautifulSoup(resp.text, 'html.parser')
        return ' '.join([p.get_text() for p in soup.find_all('p')])
    elif source_type == 'youtube':
        # Extract video transcript using YouTube API or fallback to title/description
        video_id = None
        match = re.search(r'v=([\w-]+)', source)
        if match:
            video_id = match.group(1)
        if not video_id:
            return ''
        api_key = 'YOUR_YOUTUBE_API_KEY'  # Replace with actual key
        url = f'https://www.googleapis.com/youtube/v3/videos?id={video_id}&key={api_key}&part=snippet'
        resp = requests.get(url)
        if resp.status_code == 200:
            data = resp.json()
            items = data.get('items', [])
            if items:
                snippet = items[0]['snippet']
                return snippet.get('title', '') + ' ' + snippet.get('description', '')
        return ''
