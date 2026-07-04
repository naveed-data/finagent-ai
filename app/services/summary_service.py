class SummaryService:
    def summarize(self, fields: dict) -> dict:
        applicant_name = fields.get("applicant_name")
        employer = fields.get("employer")
        income = fields.get("annual_income")
        credit_score = fields.get("credit_score")
        loan_type = fields.get("loan_type")
        loan_amount = fields.get("requested_loan_amount")

        income_display = f"${income:,.0f}" if income is not None else None
        loan_amount_display = (
            f"${loan_amount:,.0f}" if loan_amount is not None else None
        )
        credit_score_display = (
            str(credit_score) if credit_score is not None else None
        )

        summary = (
            f"{applicant_name or 'The applicant'} is applying for a "
            f"{loan_type or 'loan'} with a requested amount of "
            f"{loan_amount_display or 'not specified'}. The applicant is employed at "
            f"{employer or 'an unspecified employer'}, has an annual income of "
            f"{income_display or 'not specified'}, and has a credit score of "
            f"{credit_score_display or 'not specified'}."
        )

        return {
            "applicant_name": applicant_name,
            "employer": employer,
            "annual_income": income_display,
            "credit_score": credit_score_display,
            "loan_type": loan_type,
            "requested_loan_amount": loan_amount_display,
            "summary": summary,
        }
