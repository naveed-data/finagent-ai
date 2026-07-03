from pathlib import Path

from pypdf import PdfReader


class DocumentParser:
    """
    Extracts text from banking PDF documents.
    """

    def extract_text_from_pdf(self, file_path: str) -> str:
        path = Path(file_path)

        if not path.exists():
            raise FileNotFoundError(f"File not found: {file_path}")

        if path.suffix.lower() != ".pdf":
            raise ValueError("Only PDF files are supported.")

        reader = PdfReader(str(path))
        text_parts: list[str] = []

        for page in reader.pages:
            page_text = page.extract_text()
            if page_text:
                text_parts.append(page_text)

        return "\n".join(text_parts)
    
    from pathlib import Path
from pypdf import PdfReader


class DocumentParser:
    def extract_text_from_pdf(self, file_path: str) -> str:
        path = Path(file_path)

        if not path.exists():
            raise FileNotFoundError(file_path)

        reader = PdfReader(str(path))

        text = ""

        for page in reader.pages:
            page_text = page.extract_text()
            if page_text:
                text += page_text + "\n"

        return text