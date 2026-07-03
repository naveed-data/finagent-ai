from pathlib import Path
import shutil

from fastapi import APIRouter, File, HTTPException, UploadFile

from app.rag.text_chunker import TextChunker
from app.rag.vector_store import VectorStore
from app.schemas.document_schema import DocumentUploadResponse
from app.services.document_parser import DocumentParser

router = APIRouter(
    prefix="/documents",
    tags=["Documents"],
)

UPLOAD_DIRECTORY = Path("datasets/raw")
UPLOAD_DIRECTORY.mkdir(parents=True, exist_ok=True)

parser = DocumentParser()
chunker = TextChunker(chunk_size=500, overlap=50)
vector_store = VectorStore()


@router.post("/upload", response_model=DocumentUploadResponse)
async def upload_document(file: UploadFile = File(...)):
    if not file.filename:
        raise HTTPException(status_code=400, detail="File name is missing.")

    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are supported.")

    destination = UPLOAD_DIRECTORY / file.filename

    with destination.open("wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    extracted_text = parser.extract_text_from_pdf(str(destination))
    chunks = chunker.split_text(extracted_text)
    stored_chunks = vector_store.add_chunks(file.filename, chunks)

    return {
        "message": "Document uploaded, parsed, chunked, and stored successfully.",
        "filename": file.filename,
        "path": str(destination),
        "character_count": len(extracted_text),
        "chunk_count": len(chunks),
        "stored_chunks": stored_chunks,
        "preview": extracted_text[:500],
        "chunks": [
            {
                "chunk_id": chunk.chunk_id,
                "character_count": chunk.character_count,
                "text": chunk.text,
            }
            for chunk in chunks
        ],
    }