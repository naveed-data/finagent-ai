class ComplianceService:
    def check_compliance(self, context: str) -> dict:
        missing_documents = []
        compliance_notes = []

        if "Home insurance quote is not yet provided" in context:
            missing_documents.append("Home insurance quote")

        if "Final property appraisal is pending" in context:
            missing_documents.append("Final property appraisal")

        if "Customer provided pay stubs and bank statements" in context:
            compliance_notes.append("Customer provided pay stubs and bank statements.")

        if "Employment history shows 5 years with current employer" in context:
            compliance_notes.append("Employment history shows 5 years with current employer.")

        kyc_status = "COMPLETE" if not missing_documents else "INCOMPLETE"

        return {
            "kyc_status": kyc_status,
            "missing_documents": missing_documents,
            "compliance_notes": compliance_notes,
        }