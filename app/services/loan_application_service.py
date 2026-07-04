import re
import uuid

from app.schemas.loan_application_schema import LoanApplicationInput


class LoanApplicationService:
    def generate_filename(self, payload: LoanApplicationInput) -> str:
        slug = re.sub(r"[^a-z0-9]+", "-", payload.customer_name.strip().lower()).strip("-")
        return f"{slug or 'applicant'}-manual-{uuid.uuid4().hex[:8]}"

    def build_document_text(self, payload: LoanApplicationInput) -> str:
        compliance_notes = []
        if payload.pay_stubs_and_bank_statements_provided:
            compliance_notes.append("Customer provided pay stubs and bank statements.")
        if payload.employment_history_five_years:
            compliance_notes.append("Employment history shows 5 years with current employer.")

        missing_items = []
        if not payload.home_insurance_quote_provided:
            missing_items.append("Home insurance quote is not yet provided.")
        if not payload.property_appraisal_completed:
            missing_items.append("Final property appraisal is pending.")

        lines = [
            "FinAgent AI - Loan Application",
            "",
            f"Customer Name: {payload.customer_name}",
        ]

        if payload.date_of_birth:
            lines.append(f"Date of Birth: {payload.date_of_birth}")
        if payload.address:
            lines.append(f"Address: {payload.address}")
        if payload.employer:
            lines.append(f"Employer: {payload.employer}")
        if payload.employment_status:
            lines.append(f"Employment Status: {payload.employment_status}")

        lines += [
            f"Annual Income: ${payload.annual_income:,.0f}",
            f"Requested Loan Amount: ${payload.requested_loan_amount:,.0f}",
            f"Loan Type: {payload.loan_type}",
            f"Credit Score: {payload.credit_score}",
            f"Monthly Debt Payments: ${payload.monthly_debt_payments:,.0f}",
            f"Down Payment: ${payload.down_payment:,.0f}",
        ]

        if payload.notes:
            lines += ["", "Applicant Notes:", payload.notes]

        if compliance_notes:
            lines += ["", "Compliance Notes:", *compliance_notes]

        if missing_items:
            lines += ["", "Missing Items:", *missing_items]

        return "\n".join(lines)
