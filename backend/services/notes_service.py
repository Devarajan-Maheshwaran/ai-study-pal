import io
import requests
from PyPDF2 import PdfReader

class process_notes_input:
    @staticmethod
    def from_pdf(file_storage):
        """
        file_storage: Werkzeug FileStorage from request.files
        """
        pdf = PdfReader(file_storage)
        text = []
        for page in pdf.pages:
            text.append(page.extract_text() or "")
        return "\n".join(text)

    @staticmethod
    def from_url(url: str) -> str:
        resp = requests.get(url, timeout=10)
        resp.raise_for_status()
        return resp.text
