from dataclasses import dataclass


@dataclass
class TextChunk:
    chunk_id: int
    text: str
    character_count: int


class TextChunker:
    """
    Splits extracted document text into smaller chunks for RAG.
    """

    def __init__(self, chunk_size: int = 500, overlap: int = 50):
        self.chunk_size = chunk_size
        self.overlap = overlap

    def split_text(self, text: str) -> list[TextChunk]:
        if not text.strip():
            return []

        chunks: list[TextChunk] = []
        start = 0
        chunk_id = 1

        while start < len(text):
            end = start + self.chunk_size
            chunk_text = text[start:end].strip()

            if chunk_text:
                chunks.append(
                    TextChunk(
                        chunk_id=chunk_id,
                        text=chunk_text,
                        character_count=len(chunk_text),
                    )
                )

            chunk_id += 1
            start += self.chunk_size - self.overlap

        return chunks