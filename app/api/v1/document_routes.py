from pathlib import Path
import shutil
import uuid

from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile
from fastapi.responses import FileResponse
from app.services.ollama_service import OllamaService
from app.rag.text_chunker import TextChunker
from app.rag.vector_store import VectorStore
from app.api.v1.auth_routes import get_current_user
from app.models.user import User
from app.schemas.analysis_schema import DocumentAnalysisResponse
from app.schemas.answer_schema import AnswerResponse
from app.schemas.compliance_schema import ComplianceCheckResponse
from app.schemas.document_management_schema import (
    DocumentDeleteResponse,
    DocumentListResponse,
)
from app.schemas.document_schema import DocumentUploadResponse
from app.schemas.loan_application_schema import LoanApplicationInput
from app.schemas.risk_schema import LoanRiskAssessmentResponse
from app.schemas.search_schema import SearchResponse
from app.schemas.summary_schema import DocumentSummaryResponse
from app.services.answer_service import AnswerService
from app.services.chat_history_service import ChatHistoryService
from app.services.compliance_service import ComplianceService
from app.services.document_extraction_service import DocumentExtractionService
from app.services.document_parser import DocumentParser
from app.services.loan_application_service import LoanApplicationService
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
chat_history_service = ChatHistoryService()
loan_risk_service = LoanRiskService()
compliance_service = ComplianceService()
summary_service = SummaryService()
ollama_service = OllamaService()
supervisor_service = SupervisorService()
loan_application_service = LoanApplicationService()
extraction_service = DocumentExtractionService(ollama_service=ollama_service)


def _generate_storage_filename(original_filename: str) -> str:
    path = Path(original_filename)
    return f"{path.stem}-{uuid.uuid4().hex[:8]}{path.suffix}"


@router.post("/upload", response_model=DocumentUploadResponse)
async def upload_document(
    file: UploadFile = File(...),
    document_type: str = Form("application"),
    current_user: User = Depends(get_current_user),
):
    if not file.filename:
        raise HTTPException(status_code=400, detail="File name is missing.")

    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are supported.")

    if document_type not in ("application", "policy"):
        raise HTTPException(
            status_code=400,
            detail="document_type must be 'application' or 'policy'.",
        )

    storage_filename = _generate_storage_filename(file.filename)
    destination = UPLOAD_DIRECTORY / storage_filename

    with destination.open("wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    extracted_text = parser.extract_text_from_pdf(str(destination))
    chunks = chunker.split_text(extracted_text)
    stored_chunks = vector_store.add_chunks(
        storage_filename,
        chunks,
        document_type=document_type,
        user_id=current_user.id,
    )

    return {
        "message": "Document uploaded, parsed, chunked, and stored successfully.",
        "filename": storage_filename,
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


@router.post("/manual-entry", response_model=DocumentUploadResponse)
async def submit_manual_application(
    payload: LoanApplicationInput,
    current_user: User = Depends(get_current_user),
):
    filename = loan_application_service.generate_filename(payload)
    text = loan_application_service.build_document_text(payload)

    chunks = chunker.split_text(text)
    stored_chunks = vector_store.add_chunks(
        filename, chunks, document_type="application", user_id=current_user.id
    )

    return {
        "message": "Loan application submitted and indexed successfully.",
        "filename": filename,
        "path": "manual-entry",
        "character_count": len(text),
        "chunk_count": len(chunks),
        "stored_chunks": stored_chunks,
        "preview": text[:500],
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
async def list_documents(current_user: User = Depends(get_current_user)):
    documents = vector_store.list_documents(user_id=current_user.id)
    return {"document_count": len(documents), "documents": documents}


@router.get("/{filename}/download")
async def download_document(
    filename: str, current_user: User = Depends(get_current_user)
):
    file_path = (UPLOAD_DIRECTORY / filename).resolve()

    if UPLOAD_DIRECTORY.resolve() not in file_path.parents or not file_path.is_file():
        raise HTTPException(
            status_code=404,
            detail="No downloadable file found for this document.",
        )

    if vector_store.get_document_owner(filename) != current_user.id:
        raise HTTPException(
            status_code=404,
            detail="No downloadable file found for this document.",
        )

    return FileResponse(
        path=str(file_path),
        filename=filename,
        media_type="application/pdf",
    )


@router.delete("/{filename}", response_model=DocumentDeleteResponse)
async def delete_document(
    filename: str, current_user: User = Depends(get_current_user)
):
    deleted_chunks = vector_store.delete_document(filename, user_id=current_user.id)

    if deleted_chunks == 0:
        raise HTTPException(
            status_code=404,
            detail=f"No document found with filename: {filename}",
        )

    file_path = (UPLOAD_DIRECTORY / filename).resolve()
    if UPLOAD_DIRECTORY.resolve() in file_path.parents and file_path.is_file():
        file_path.unlink()

    return {
        "filename": filename,
        "deleted_chunks": deleted_chunks,
        "message": "Document deleted successfully.",
    }


@router.get("/search", response_model=SearchResponse)
async def search_documents(
    query: str,
    top_k: int = 3,
    filename: str | None = None,
    current_user: User = Depends(get_current_user),
):
    results = vector_store.search(
        query=query, top_k=top_k, filename=filename, user_id=current_user.id
    )
    return {"query": query, "result_count": len(results), "results": results}


@router.get("/ask", response_model=AnswerResponse)
async def ask_document(
    question: str,
    session_id: str = "default",
    top_k: int = 5,
    filename: str | None = None,
    current_user: User = Depends(get_current_user),
):
    user_id = current_user.id

    memory_service.add(session_id=session_id, role="user", message=question)
    chat_history_service.save_message(
        session_id=session_id,
        role="user",
        content=question,
        user_id=user_id,
        document_filename=filename,
    )

    # Policy/reference documents are shared knowledge and are always searched.
    # The active application document (if any) is searched in isolation, scoped
    # to its owner, so one applicant's data never leaks into another user's
    # conversation.
    policy_results = vector_store.search(
        query=question, top_k=top_k, document_type="policy"
    )
    application_results = (
        vector_store.search(
            query=question, top_k=top_k, filename=filename, user_id=user_id
        )
        if filename
        else []
    )
    results = policy_results + application_results

    context = "\n\n".join(result["text"] for result in results)
    memory_context = memory_service.get_context(session_id=session_id)

    fields = extraction_service.extract_loan_fields(context)
    summary = summary_service.summarize(fields)
    risk = loan_risk_service.assess_risk(fields)
    compliance = compliance_service.check_compliance(fields)

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
    chat_history_service.save_message(
        session_id=session_id,
        role="assistant",
        content=answer,
        user_id=user_id,
        document_filename=filename,
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


@router.get("/risk-assessment", response_model=LoanRiskAssessmentResponse)
async def assess_loan_risk(
    filename: str | None = None,
    current_user: User = Depends(get_current_user),
):
    query = "credit score annual income monthly debt payments down payment missing items"
    results = vector_store.search(
        query=query, top_k=5, filename=filename, user_id=current_user.id
    )
    context = "\n\n".join(result["text"] for result in results)

    fields = extraction_service.extract_loan_fields(context)
    assessment = loan_risk_service.assess_risk(fields)

    return {
        "filename": filename,
        "overall_risk": assessment["overall_risk"],
        "reasons": assessment["reasons"],
        "attention_required": assessment["attention_required"],
        "recommendation": assessment["recommendation"],
    }


@router.get("/compliance-check", response_model=ComplianceCheckResponse)
async def check_document_compliance(
    filename: str | None = None,
    current_user: User = Depends(get_current_user),
):
    query = (
        "missing documents home insurance property appraisal "
        "pay stubs bank statements employment history"
    )
    results = vector_store.search(
        query=query, top_k=5, filename=filename, user_id=current_user.id
    )
    context = "\n\n".join(result["text"] for result in results)

    fields = extraction_service.extract_loan_fields(context)
    compliance = compliance_service.check_compliance(fields)

    return {
        "filename": filename,
        "kyc_status": compliance["kyc_status"],
        "missing_documents": compliance["missing_documents"],
        "compliance_notes": compliance["compliance_notes"],
    }


@router.get("/summary", response_model=DocumentSummaryResponse)
async def summarize_document(
    filename: str | None = None,
    current_user: User = Depends(get_current_user),
):
    query = "customer name employer annual income credit score loan type requested loan amount"
    results = vector_store.search(
        query=query, top_k=5, filename=filename, user_id=current_user.id
    )
    context = "\n\n".join(result["text"] for result in results)

    fields = extraction_service.extract_loan_fields(context)
    summary = summary_service.summarize(fields)

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
async def analyze_document(
    filename: str | None = None,
    current_user: User = Depends(get_current_user),
):
    query = (
        "customer name employer annual income credit score loan type requested loan amount "
        "monthly debt payments down payment missing documents home insurance property appraisal "
        "pay stubs bank statements employment history"
    )

    results = vector_store.search(
        query=query, top_k=8, filename=filename, user_id=current_user.id
    )
    context = "\n\n".join(result["text"] for result in results)

    fields = extraction_service.extract_loan_fields(context)
    summary = summary_service.summarize(fields)
    risk = loan_risk_service.assess_risk(fields)
    compliance = compliance_service.check_compliance(fields)

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
