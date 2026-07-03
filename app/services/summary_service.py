import re


class SummaryService:
    def summarize(self, context: str) -> dict:
        applicant_name = self._extract(r"Customer Name:\s*([^\n]+)", context)
        employer = self._extract(r"Employer:\s*([^\n]+)", context)
        income = self._extract(r"Annual Income:\s*([^\n]+)", context)
        credit_score = self._extract(r"Credit Score:\s*([^\n]+)", context)
        loan_type = self._extract(r"Loan Type:\s*([^\n]+)", context)
        loan_amount = self._extract(r"Requested Loan Amount:\s*([^\n]+)", context)

        summary = (
            f"{applicant_name or 'The applicant'} is applying for a "
            f"{loan_type or 'loan'} with a requested amount of "
            f"{loan_amount or 'not specified'}. The applicant is employed at "
            f"{employer or 'an unspecified employer'}, has an annual income of "
            f"{income or 'not specified'}, and has a credit score of "
            f"{credit_score or 'not specified'}."
        )

        return {
            "applicant_name": applicant_name,
            "employer": employer,
            "annual_income": income,
            "credit_score": credit_score,
            "loan_type": loan_type,
            "requested_loan_amount": loan_amount,
            "summary": summary,
        }

    def _extract(self, pattern: str, text: str) -> str | None:
        match = re.search(pattern, text)
        return match.group(1).strip() if match else None