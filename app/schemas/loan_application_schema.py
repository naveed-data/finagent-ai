from pydantic import BaseModel


class LoanApplicationInput(BaseModel):
    customer_name: str
    date_of_birth: str | None = None
    address: str | None = None
    employer: str | None = None
    employment_status: str | None = None
    annual_income: float
    requested_loan_amount: float
    loan_type: str
    credit_score: int
    monthly_debt_payments: float
    down_payment: float
    notes: str | None = None
    pay_stubs_and_bank_statements_provided: bool = False
    employment_history_five_years: bool = False
    home_insurance_quote_provided: bool = False
    property_appraisal_completed: bool = False
