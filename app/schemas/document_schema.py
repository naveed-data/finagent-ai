from pydantic import BaseModel


class DocumentChunkResponse(BaseModel):
    chunk_id: int
    character_count: int
    text: str


class DocumentUploadResponse(BaseModel):
    message: str
    filename: str
    path: str
    character_count: int
    chunk_count: int
    preview: str
    chunks: list[DocumentChunkResponse]