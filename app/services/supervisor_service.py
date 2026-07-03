class SupervisorService:
    def generate_recommendation(
        self,
        risk_level: str,
        kyc_status: str,
        missing_documents: list[str],
    ) -> str:
        if risk_level == "LOW" and kyc_status == "COMPLETE":
            return "Applicant appears ready for approval review."

        if risk_level == "LOW" and kyc_status == "INCOMPLETE":
            return (
                "Applicant shows low financial risk, but pending documents "
                "must be resolved before final approval."
            )

        if risk_level == "MEDIUM":
            return (
                "Applicant requires additional underwriting review before "
                "a decision can be made."
            )

        return "Applicant should be escalated for detailed risk and compliance review."