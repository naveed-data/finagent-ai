class ComplianceService:
    def check_compliance(self, fields: dict) -> dict:
        missing_documents = list(fields.get("missing_documents") or [])
        compliance_notes = list(fields.get("compliance_notes") or [])

        kyc_status = "COMPLETE" if not missing_documents else "INCOMPLETE"

        return {
            "kyc_status": kyc_status,
            "missing_documents": missing_documents,
            "compliance_notes": compliance_notes,
        }
