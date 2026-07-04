from pydantic import BaseModel


class DocumentMetadataResponse(BaseModel):
    document_id: str
    filename: str
    chunk_count: int
    uploaded_at: str
    document_type: str = "application"


class DocumentListResponse(BaseModel):
    document_count: int
    documents: list[DocumentMetadataResponse]


class DocumentDeleteResponse(BaseModel):
    filename: str
    deleted_chunks: int
    message: str