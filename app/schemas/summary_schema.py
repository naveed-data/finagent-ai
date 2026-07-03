from pydantic import BaseModel


class DocumentSummaryResponse(BaseModel):
    filename: str | None
    applicant_name: str | None
    employer: str | None
    annual_income: str | None
    credit_score: str | None
    loan_type: str | None
    requested_loan_amount: str | None
    summary: str