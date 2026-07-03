import re


class LoanRiskService:
    def assess_risk(self, context: str) -> dict:
        credit_score = self._extract_number(r"Credit Score:\s*(\d+)", context)
        annual_income = self._extract_money(r"Annual Income:\s*\$?([\d,]+)", context)
        monthly_debt = self._extract_money(r"Monthly Debt Payments:\s*\$?([\d,]+)", context)
        down_payment = self._extract_money(r"Down Payment:\s*\$?([\d,]+)", context)

        reasons = []
        attention_required = []

        risk_score = 0

        if credit_score:
            if credit_score >= 700:
                reasons.append(f"Good credit score of {credit_score}.")
            elif credit_score >= 640:
                reasons.append(f"Moderate credit score of {credit_score}.")
                risk_score += 1
            else:
                reasons.append(f"Low credit score of {credit_score}.")
                risk_score += 2

        if annual_income:
            if annual_income >= 100000:
                reasons.append(f"Strong annual income of ${annual_income:,.0f}.")
            elif annual_income >= 60000:
                reasons.append(f"Moderate annual income of ${annual_income:,.0f}.")
                risk_score += 1
            else:
                reasons.append(f"Lower annual income of ${annual_income:,.0f}.")
                risk_score += 2

        if monthly_debt and annual_income:
            monthly_income = annual_income / 12
            debt_ratio = monthly_debt / monthly_income

            if debt_ratio <= 0.30:
                reasons.append(f"Healthy debt-to-income ratio of {debt_ratio:.1%}.")
            elif debt_ratio <= 0.45:
                reasons.append(f"Moderate debt-to-income ratio of {debt_ratio:.1%}.")
                risk_score += 1
            else:
                reasons.append(f"High debt-to-income ratio of {debt_ratio:.1%}.")
                risk_score += 2

        if down_payment:
            if down_payment >= 50000:
                reasons.append(f"Strong down payment of ${down_payment:,.0f}.")
            else:
                reasons.append(f"Lower down payment of ${down_payment:,.0f}.")
                risk_score += 1

        if "Home insurance quote is not yet provided" in context:
            attention_required.append("Home insurance quote is missing.")

        if "Final property appraisal is pending" in context:
            attention_required.append("Final property appraisal is pending.")

        if attention_required:
            risk_score += 1

        if risk_score <= 1:
            overall_risk = "LOW"
            recommendation = "Proceed to manual underwriting after resolving pending documentation."
        elif risk_score <= 3:
            overall_risk = "MEDIUM"
            recommendation = "Review supporting documents and verify pending items before approval."
        else:
            overall_risk = "HIGH"
            recommendation = "Escalate for detailed underwriting review."

        return {
            "overall_risk": overall_risk,
            "reasons": reasons,
            "attention_required": attention_required,
            "recommendation": recommendation,
        }

    def _extract_number(self, pattern: str, text: str) -> int | None:
        match = re.search(pattern, text)
        return int(match.group(1)) if match else None

    def _extract_money(self, pattern: str, text: str) -> float | None:
        match = re.search(pattern, text)
        if not match:
            return None
        return float(match.group(1).replace(",", ""))