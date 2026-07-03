from app.schemas.compliance_schema import ComplianceCheckResponse
from app.schemas.risk_schema import LoanRiskAssessmentResponse
from app.schemas.summary_schema import DocumentSummaryResponse
from pydantic import BaseModel


class DocumentAnalysisResponse(BaseModel):
    filename: str | None
    summary: DocumentSummaryResponse
    risk_assessment: LoanRiskAssessmentResponse
    compliance_check: ComplianceCheckResponse
    executive_recommendation: str