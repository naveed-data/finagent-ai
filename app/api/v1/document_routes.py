from pathlib import Path
import shutil

from fastapi import APIRouter, File, HTTPException, UploadFile
from app.services.ollama_service import OllamaService
from app.rag.text_chunker import TextChunker
from app.rag.vector_store import VectorStore
from app.schemas.analysis_schema import DocumentAnalysisResponse
from app.schemas.answer_schema import AnswerResponse
from app.schemas.compliance_schema import ComplianceCheckResponse
from app.schemas.document_management_schema import (
    DocumentDeleteResponse,
    DocumentListResponse,
)
from app.schemas.document_schema import DocumentUploadResponse
from app.schemas.risk_schema import LoanRiskAssessmentResponse
from app.schemas.search_schema import SearchResponse
from app.schemas.summary_schema import DocumentSummaryResponse
from app.services.answer_service import AnswerService
from app.services.compliance_service import ComplianceService
from app.services.document_parser import DocumentParser
from app.services.loan_risk_service import LoanRiskService
from app.services.memory_service import MemoryService
from app.services.summary_service import SummaryService
from app.services.supervisor_service import SupervisorService

router = APIRouter(prefix="/documents", tags=["Documents"])

UPLOAD_DIRECTORY = Path("datasets/raw")
UPLOAD_DIRECTORY.mkdir(parents=True, exist_ok=True)

parser = DocumentParser()
chunker = TextChunker(chunk_size=500, overlap=50)
vector_store = VectorStore()
answer_service = AnswerService()
memory_service = MemoryService()
loan_risk_service = LoanRiskService()
compliance_service = ComplianceService()
summary_service = SummaryService()
ollama_service = OllamaService()
supervisor_service = SupervisorService()


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


@router.get("", response_model=DocumentListResponse)
async def list_documents():
    documents = vector_store.list_documents()
    return {"document_count": len(documents), "documents": documents}


@router.delete("/{filename}", response_model=DocumentDeleteResponse)
async def delete_document(filename: str):
    deleted_chunks = vector_store.delete_document(filename)

    if deleted_chunks == 0:
        raise HTTPException(
            status_code=404,
            detail=f"No document found with filename: {filename}",
        )

    return {
        "filename": filename,
        "deleted_chunks": deleted_chunks,
        "message": "Document deleted successfully.",
    }


@router.get("/search", response_model=SearchResponse)
async def search_documents(query: str, top_k: int = 3, filename: str | None = None):
    results = vector_store.search(query=query, top_k=top_k, filename=filename)
    return {"query": query, "result_count": len(results), "results": results}


@router.get("/ask", response_model=AnswerResponse)
async def ask_document(
    question: str,
    session_id: str = "default",
    top_k: int = 5,
    filename: str | None = None,
):
    memory_service.add(session_id=session_id, role="user", message=question)

    results = vector_store.search(
        query=question,
        top_k=top_k,
        filename=filename,
    )

    context = "\n\n".join(result["text"] for result in results)
    memory_context = memory_service.get_context(session_id=session_id)

    summary = summary_service.summarize(context)
    risk = loan_risk_service.assess_risk(context)
    compliance = compliance_service.check_compliance(context)

    structured_context = f"""
Document Summary:
{summary}

Risk Assessment:
{risk}

Compliance Check:
{compliance}
"""

    final_context = (
        context
        + "\n\nStructured Analysis:\n"
        + structured_context
        + "\n\nConversation History:\n"
        + memory_context
    )

    answer = ollama_service.generate_answer(
        question=question,
        context=final_context,
    )

    memory_service.add(session_id=session_id, role="assistant", message=answer)

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


@router.get("/risk-assessment", response_model=LoanRiskAssessmentResponse)
async def assess_loan_risk(filename: str | None = None):
    query = "credit score annual income monthly debt payments down payment missing items"
    results = vector_store.search(query=query, top_k=5, filename=filename)
    context = "\n\n".join(result["text"] for result in results)

    assessment = loan_risk_service.assess_risk(context)

    return {
        "filename": filename,
        "overall_risk": assessment["overall_risk"],
        "reasons": assessment["reasons"],
        "attention_required": assessment["attention_required"],
        "recommendation": assessment["recommendation"],
    }


@router.get("/compliance-check", response_model=ComplianceCheckResponse)
async def check_document_compliance(filename: str | None = None):
    query = (
        "missing documents home insurance property appraisal "
        "pay stubs bank statements employment history"
    )
    results = vector_store.search(query=query, top_k=5, filename=filename)
    context = "\n\n".join(result["text"] for result in results)

    compliance = compliance_service.check_compliance(context)

    return {
        "filename": filename,
        "kyc_status": compliance["kyc_status"],
        "missing_documents": compliance["missing_documents"],
        "compliance_notes": compliance["compliance_notes"],
    }


@router.get("/summary", response_model=DocumentSummaryResponse)
async def summarize_document(filename: str | None = None):
    query = "customer name employer annual income credit score loan type requested loan amount"
    results = vector_store.search(query=query, top_k=5, filename=filename)
    context = "\n\n".join(result["text"] for result in results)

    summary = summary_service.summarize(context)

    return {
        "filename": filename,
        "applicant_name": summary["applicant_name"],
        "employer": summary["employer"],
        "annual_income": summary["annual_income"],
        "credit_score": summary["credit_score"],
        "loan_type": summary["loan_type"],
        "requested_loan_amount": summary["requested_loan_amount"],
        "summary": summary["summary"],
    }


@router.get("/analyze", response_model=DocumentAnalysisResponse)
async def analyze_document(filename: str | None = None):
    query = (
        "customer name employer annual income credit score loan type requested loan amount "
        "monthly debt payments down payment missing documents home insurance property appraisal "
        "pay stubs bank statements employment history"
    )

    results = vector_store.search(query=query, top_k=8, filename=filename)
    context = "\n\n".join(result["text"] for result in results)

    summary = summary_service.summarize(context)
    risk = loan_risk_service.assess_risk(context)
    compliance = compliance_service.check_compliance(context)

    executive_recommendation = supervisor_service.generate_recommendation(
        risk_level=risk["overall_risk"],
        kyc_status=compliance["kyc_status"],
        missing_documents=compliance["missing_documents"],
    )

    return {
        "filename": filename,
        "summary": {
            "filename": filename,
            "applicant_name": summary["applicant_name"],
            "employer": summary["employer"],
            "annual_income": summary["annual_income"],
            "credit_score": summary["credit_score"],
            "loan_type": summary["loan_type"],
            "requested_loan_amount": summary["requested_loan_amount"],
            "summary": summary["summary"],
        },
        "risk_assessment": {
            "filename": filename,
            "overall_risk": risk["overall_risk"],
            "reasons": risk["reasons"],
            "attention_required": risk["attention_required"],
            "recommendation": risk["recommendation"],
        },
        "compliance_check": {
            "filename": filename,
            "kyc_status": compliance["kyc_status"],
            "missing_documents": compliance["missing_documents"],
            "compliance_notes": compliance["compliance_notes"],
        },
        "executive_recommendation": executive_recommendation,
    }