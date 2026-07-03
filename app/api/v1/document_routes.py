from pathlib import Path
import shutil

from fastapi import APIRouter, File, HTTPException, UploadFile

from app.rag.text_chunker import TextChunker
from app.rag.vector_store import VectorStore
from app.schemas.answer_schema import AnswerResponse
from app.schemas.document_schema import DocumentUploadResponse
from app.schemas.search_schema import SearchResponse
from app.services.answer_service import AnswerService
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
answer_service = AnswerService()


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


@router.get("/search", response_model=SearchResponse)
async def search_documents(query: str, top_k: int = 3):
    results = vector_store.search(query=query, top_k=top_k)

    return {
        "query": query,
        "result_count": len(results),
        "results": results,
    }


@router.get("/ask", response_model=AnswerResponse)
async def ask_document(question: str, top_k: int = 3):
    results = vector_store.search(query=question, top_k=top_k)

    context = "\n\n".join(result["text"] for result in results)

    answer = answer_service.generate_answer(
        question=question,
        context=context,
    )

    return {
        "question": question,
        "answer": answer,
        "sources": [
            {
                "filename": result["filename"],
                "chunk_id": result["chunk_id"],
                "text": result["text"],
            }
            for result in results
        ],
    }