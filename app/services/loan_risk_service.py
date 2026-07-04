class LoanRiskService:
    def assess_risk(self, fields: dict) -> dict:
        credit_score = fields.get("credit_score")
        annual_income = fields.get("annual_income")
        monthly_debt = fields.get("monthly_debt_payments")
        down_payment = fields.get("down_payment")
        attention_required = list(fields.get("missing_documents") or [])

        reasons = []
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
