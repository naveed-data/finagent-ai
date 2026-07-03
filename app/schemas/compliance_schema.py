from pydantic import BaseModel


class ComplianceCheckResponse(BaseModel):
    filename: str | None
    kyc_status: str
    missing_documents: list[str]
    compliance_notes: list[str]