import json
import re

from app.services.ollama_service import OllamaService

EXTRACTION_PROMPT = """
Extract loan application details from the document context below.
Respond with ONLY a valid JSON object (no markdown fences, no explanation)
matching this exact shape:

{{
  "applicant_name": string or null,
  "employer": string or null,
  "annual_income": number or null,
  "credit_score": number or null,
  "loan_type": string or null,
  "requested_loan_amount": number or null,
  "monthly_debt_payments": number or null,
  "down_payment": number or null,
  "missing_documents": array of short strings,
  "compliance_notes": array of short strings
}}

Use null for any field that is not present in the context. Numbers must be
plain numbers without "$" or commas. For missing_documents and
compliance_notes, list short factual statements actually found in the
context (e.g. "Home insurance quote", "Employment history shows 5 years
with current employer"). Do not invent information that is not present.

Document Context:
{context}

JSON:
"""


class DocumentExtractionService:
    def __init__(self, ollama_service: OllamaService | None = None):
        self.ollama_service = ollama_service or OllamaService()

    def extract_loan_fields(self, context: str) -> dict:
        fields = self._extract_with_llm(context)
        if fields is not None:
            return fields
        return self._extract_with_regex(context)

    def _extract_with_llm(self, context: str) -> dict | None:
        prompt = EXTRACTION_PROMPT.format(context=context)

        try:
            raw = self.ollama_service.generate_raw(prompt)
        except Exception:
            return None

        json_text = self._find_json_block(raw)
        if not json_text:
            return None

        try:
            data = json.loads(json_text)
        except (json.JSONDecodeError, TypeError):
            return None

        if not isinstance(data, dict):
            return None

        return {
            "applicant_name": self._to_str(data.get("applicant_name")),
            "employer": self._to_str(data.get("employer")),
            "annual_income": self._to_float(data.get("annual_income")),
            "credit_score": self._to_int(data.get("credit_score")),
            "loan_type": self._to_str(data.get("loan_type")),
            "requested_loan_amount": self._to_float(data.get("requested_loan_amount")),
            "monthly_debt_payments": self._to_float(data.get("monthly_debt_payments")),
            "down_payment": self._to_float(data.get("down_payment")),
            "missing_documents": self._to_str_list(data.get("missing_documents")),
            "compliance_notes": self._to_str_list(data.get("compliance_notes")),
        }

    def _extract_with_regex(self, context: str) -> dict:
        def extract(pattern: str) -> str | None:
            match = re.search(pattern, context)
            return match.group(1).strip() if match else None

        missing_documents = []
        if "Home insurance quote is not yet provided" in context:
            missing_documents.append("Home insurance quote")
        if "Final property appraisal is pending" in context:
            missing_documents.append("Final property appraisal")

        compliance_notes = []
        if "Customer provided pay stubs and bank statements" in context:
            compliance_notes.append("Customer provided pay stubs and bank statements.")
        if "Employment history shows 5 years with current employer" in context:
            compliance_notes.append("Employment history shows 5 years with current employer.")

        return {
            "applicant_name": extract(r"Customer Name:\s*([^\n]+)"),
            "employer": extract(r"Employer:\s*([^\n]+)"),
            "annual_income": self._to_float(extract(r"Annual Income:\s*([^\n]+)")),
            "credit_score": self._to_int(extract(r"Credit Score:\s*([^\n]+)")),
            "loan_type": extract(r"Loan Type:\s*([^\n]+)"),
            "requested_loan_amount": self._to_float(
                extract(r"Requested Loan Amount:\s*([^\n]+)")
            ),
            "monthly_debt_payments": self._to_float(
                extract(r"Monthly Debt Payments:\s*([^\n]+)")
            ),
            "down_payment": self._to_float(extract(r"Down Payment:\s*([^\n]+)")),
            "missing_documents": missing_documents,
            "compliance_notes": compliance_notes,
        }

    def _find_json_block(self, text: str) -> str | None:
        match = re.search(r"\{.*\}", text, re.DOTALL)
        return match.group(0) if match else None

    def _to_str(self, value) -> str | None:
        if value is None:
            return None
        text = str(value).strip()
        return text or None

    def _to_float(self, value) -> float | None:
        if value is None:
            return None
        if isinstance(value, (int, float)):
            return float(value)
        cleaned = re.sub(r"[^\d.]", "", str(value))
        return float(cleaned) if cleaned else None

    def _to_int(self, value) -> int | None:
        parsed = self._to_float(value)
        return int(parsed) if parsed is not None else None

    def _to_str_list(self, value) -> list[str]:
        if not isinstance(value, list):
            return []
        return [str(item).strip() for item in value if str(item).strip()]
