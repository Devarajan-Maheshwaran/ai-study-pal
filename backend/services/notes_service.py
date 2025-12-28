import json

def parse_text(text):
    return {'type': 'text', 'content': text}

def parse_pdf(file_path):
    try:
        import PyPDF2
        text = ""
        with open(file_path, 'rb') as f:
            reader = PyPDF2.PdfReader(f)
            for page in reader.pages:
                text += page.extract_text()
        return {'type': 'pdf', 'content': text}
    except:
        return {'type': 'pdf', 'content': '', 'error': 'Could not parse PDF'}

def fetch_url(url):
    try:
        import requests
        response = requests.get(url, timeout=5)
        return {'type': 'url', 'content': response.text}
    except:
        return {'type': 'url', 'content': '', 'error': 'Could not fetch URL'}

def fetch_youtube(video_id):
    return {'type': 'youtube', 'content': f'Video {video_id} data'}
