from pydantic import BaseModel


class LoanRiskAssessmentResponse(BaseModel):
    filename: str | None
    overall_risk: str
    reasons: list[str]
    attention_required: list[str]
    recommendation: str