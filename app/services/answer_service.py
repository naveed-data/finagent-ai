import re


class AnswerService:
    def generate_answer(self, question: str, context: str) -> str:
        question_lower = question.lower()

        if "income" in question_lower:
            match = re.search(r"Annual Income:\s*\$?([\d,]+)", context)
            if match:
                return f"The customer's annual income is ${match.group(1)}."

        if "loan amount" in question_lower:
            match = re.search(r"Requested Loan Amount:\s*\$?([\d,]+)", context)
            if match:
                return f"The requested loan amount is ${match.group(1)}."

        if "credit score" in question_lower:
            match = re.search(r"Credit Score:\s*(\d+)", context)
            if match:
                return f"The customer's credit score is {match.group(1)}."

        return "I found relevant document context, but I could not generate a specific answer yet."