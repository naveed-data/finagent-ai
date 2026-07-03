import re


class AnswerService:
    def generate_answer(self, question: str, context: str) -> str:
        question_lower = question.lower()

        field_patterns = {
            "income": (
                r"Annual Income:\s*\$?([\d,]+)",
                "The customer's annual income is ${value}.",
            ),
            "loan amount": (
                r"Requested Loan Amount:\s*\$?([\d,]+)",
                "The requested loan amount is ${value}.",
            ),
            "credit score": (
                r"Credit Score:\s*(\d+)",
                "The customer's credit score is {value}.",
            ),
            "employer": (
                r"Employer:\s*([^\n]+)",
                "The customer's employer is {value}.",
            ),
            "employment status": (
                r"Employment Status:\s*([^\n]+)",
                "The customer's employment status is {value}.",
            ),
            "down payment": (
                r"Down Payment:\s*\$?([\d,]+)",
                "The down payment is ${value}.",
            ),
            "customer name": (
                r"Customer Name:\s*([^\n]+)",
                "The customer's name is {value}.",
            ),
            "loan type": (
                r"Loan Type:\s*([^\n]+)",
                "The loan type is {value}.",
            ),
        }

        for keyword, (pattern, template) in field_patterns.items():
            if keyword in question_lower:
                match = re.search(pattern, context)
                if match:
                    return template.format(value=match.group(1).strip())

        if "missing" in question_lower or "pending" in question_lower:
            missing_items = re.findall(r"(Home insurance quote.*|Final property appraisal.*)", context)
            if missing_items:
                return "Missing or pending items: " + "; ".join(item.strip() for item in missing_items)

        return "I found relevant document context, but I could not generate a specific answer yet."