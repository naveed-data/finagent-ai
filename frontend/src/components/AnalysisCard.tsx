import { useState } from "react";
import api from "../services/api";

type Analysis = {
  summary: {
    applicant_name: string;
    employer: string;
    annual_income: string;
    credit_score: string;
    loan_type: string;
    requested_loan_amount: string;
    summary: string;
  };
  risk_assessment: {
    overall_risk: string;
    reasons: string[];
    attention_required: string[];
    recommendation: string;
  };
  compliance_check: {
    kyc_status: string;
    missing_documents: string[];
    compliance_notes: string[];
  };
  executive_recommendation: string;
};

function AnalysisCard() {
  const [analysis, setAnalysis] = useState<Analysis | null>(null);

  const analyze = async () => {
    const response = await api.get("/documents/analyze");
    setAnalysis(response.data);
  };

  return (
    <div className="bg-white rounded-2xl shadow p-6 lg:col-span-3">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">📊 AI Document Analysis</h2>

        <button
          onClick={analyze}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-3 rounded-lg font-medium"
        >
          Analyze Documents
        </button>
      </div>

      {analysis && (
        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-blue-50 rounded-xl p-5">
            <h3 className="font-bold mb-3">Summary</h3>
            <p className="text-sm">{analysis.summary.summary}</p>
          </div>

          <div className="bg-red-50 rounded-xl p-5">
            <h3 className="font-bold mb-3">Risk</h3>
            <p className="text-2xl font-bold">
              {analysis.risk_assessment.overall_risk}
            </p>
            <ul className="mt-3 text-sm list-disc ml-5">
              {analysis.risk_assessment.reasons.map((reason, i) => (
                <li key={i}>{reason}</li>
              ))}
            </ul>
          </div>

          <div className="bg-yellow-50 rounded-xl p-5">
            <h3 className="font-bold mb-3">Compliance</h3>
            <p className="text-2xl font-bold">
              {analysis.compliance_check.kyc_status}
            </p>
            <ul className="mt-3 text-sm list-disc ml-5">
              {analysis.compliance_check.missing_documents.map((doc, i) => (
                <li key={i}>{doc}</li>
              ))}
            </ul>
          </div>

          <div className="md:col-span-3 bg-slate-50 rounded-xl p-5">
            <h3 className="font-bold mb-2">Executive Recommendation</h3>
            <p className="text-sm">{analysis.executive_recommendation}</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default AnalysisCard;
