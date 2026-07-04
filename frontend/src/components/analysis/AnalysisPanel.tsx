import { useState } from "react";
import api from "../../services/api";
import Card from "../common/Card";
import StatusBadge from "../common/StatusBadge";

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

type AnalysisPanelProps = {
  filename: string | null;
};

function AnalysisPanel({ filename }: AnalysisPanelProps) {
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [loading, setLoading] = useState(false);

  const analyze = async () => {
    if (!filename) return;

    setLoading(true);

    try {
      const response = await api.get("/documents/analyze", {
        params: { filename },
      });
      setAnalysis(response.data);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card
      title="📊 Executive Document Analysis"
      subtitle="Supervisor analysis combining summary, risk, and compliance."
    >
      <button
        onClick={analyze}
        disabled={loading || !filename}
        className="mb-5 bg-indigo-600 hover:bg-indigo-500 disabled:bg-neutral-700 disabled:text-neutral-400 text-white px-5 py-3 rounded-lg font-medium"
      >
        {loading ? "Analyzing..." : "Generate Analysis"}
      </button>

      {!filename && (
        <div className="border border-dashed border-neutral-700 rounded-xl p-8 text-center text-neutral-500">
          Upload or enter a loan application in the chat above to generate an
          analysis.
        </div>
      )}

      {filename && !analysis && (
        <div className="border border-dashed border-neutral-700 rounded-xl p-8 text-center text-neutral-500">
          No analysis generated yet.
        </div>
      )}

      {analysis && (
        <div className="space-y-5">
          <div className="grid md:grid-cols-3 gap-5">
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-5">
              <p className="text-sm text-blue-400 font-semibold">Applicant</p>
              <p className="text-xl font-bold text-neutral-100 mt-1">
                {analysis.summary.applicant_name}
              </p>
              <p className="text-sm text-neutral-400 mt-1">
                {analysis.summary.employer}
              </p>
            </div>

            <div className="bg-rose-500/10 border border-rose-500/20 rounded-xl p-5">
              <p className="text-sm text-rose-400 font-semibold">Risk</p>
              <p className="text-2xl font-bold text-rose-400 mt-1">
                {analysis.risk_assessment.overall_risk}
              </p>
            </div>

            <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-5">
              <p className="text-sm text-amber-400 font-semibold">Compliance</p>
              <div className="mt-2">
                <StatusBadge
                  label={analysis.compliance_check.kyc_status}
                  tone={
                    analysis.compliance_check.kyc_status === "COMPLETE"
                      ? "green"
                      : "yellow"
                  }
                />
              </div>
            </div>
          </div>

          <div className="bg-neutral-800/60 border border-neutral-800 rounded-xl p-5">
            <h3 className="font-bold text-neutral-100 mb-2">Summary</h3>
            <p className="text-sm text-neutral-300">{analysis.summary.summary}</p>
          </div>

          <div className="grid md:grid-cols-2 gap-5">
            <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-5">
              <h3 className="font-bold text-neutral-100 mb-3">Risk Reasons</h3>
              <ul className="list-disc ml-5 text-sm text-neutral-300 space-y-1">
                {analysis.risk_assessment.reasons.map((reason, index) => (
                  <li key={index}>{reason}</li>
                ))}
              </ul>
            </div>

            <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-5">
              <h3 className="font-bold text-neutral-100 mb-3">
                Missing Documents
              </h3>
              <ul className="list-disc ml-5 text-sm text-neutral-300 space-y-1">
                {analysis.compliance_check.missing_documents.map(
                  (doc, index) => (
                    <li key={index}>{doc}</li>
                  )
                )}
              </ul>
            </div>
          </div>

          <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-xl p-5">
            <h3 className="font-bold text-indigo-300 mb-2">
              Executive Recommendation
            </h3>
            <p className="text-sm text-neutral-300">
              {analysis.executive_recommendation}
            </p>
          </div>
        </div>
      )}
    </Card>
  );
}

export default AnalysisPanel;
