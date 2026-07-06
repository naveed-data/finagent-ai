import { useState } from "react";
import api from "../../services/api";

type LoanApplicationFormProps = {
  onClose: () => void;
  onSubmitted: (message: string, filename: string) => void;
  onRequireAuth: () => void;
};

const initialState = {
  customerName: "",
  dateOfBirth: "",
  address: "",
  employer: "",
  employmentStatus: "Full-Time",
  annualIncome: "",
  requestedLoanAmount: "",
  loanType: "Home Mortgage",
  creditScore: "",
  monthlyDebtPayments: "",
  downPayment: "",
  notes: "",
  payStubsAndBankStatementsProvided: false,
  employmentHistoryFiveYears: false,
  homeInsuranceQuoteProvided: false,
  propertyAppraisalCompleted: false,
};

function LoanApplicationForm({
  onClose,
  onSubmitted,
  onRequireAuth,
}: LoanApplicationFormProps) {
  const [form, setForm] = useState(initialState);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const update = <K extends keyof typeof initialState>(
    key: K,
    value: (typeof initialState)[K]
  ) => setForm((prev) => ({ ...prev, [key]: value }));

  const submit = async () => {
    if (
      !form.customerName.trim() ||
      !form.annualIncome ||
      !form.requestedLoanAmount ||
      !form.creditScore ||
      !form.monthlyDebtPayments ||
      !form.downPayment
    ) {
      setError("Please fill in all required fields.");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      const response = await api.post("/documents/manual-entry", {
        customer_name: form.customerName,
        date_of_birth: form.dateOfBirth || null,
        address: form.address || null,
        employer: form.employer || null,
        employment_status: form.employmentStatus || null,
        annual_income: Number(form.annualIncome),
        requested_loan_amount: Number(form.requestedLoanAmount),
        loan_type: form.loanType,
        credit_score: Number(form.creditScore),
        monthly_debt_payments: Number(form.monthlyDebtPayments),
        down_payment: Number(form.downPayment),
        notes: form.notes || null,
        pay_stubs_and_bank_statements_provided:
          form.payStubsAndBankStatementsProvided,
        employment_history_five_years: form.employmentHistoryFiveYears,
        home_insurance_quote_provided: form.homeInsuranceQuoteProvided,
        property_appraisal_completed: form.propertyAppraisalCompleted,
      });

      onSubmitted(
        `Loan application for ${form.customerName} was submitted and indexed ` +
          `(${response.data.stored_chunks} chunk${
            response.data.stored_chunks === 1 ? "" : "s"
          } stored as "${response.data.filename}"). Ask a question or generate an analysis.`,
        response.data.filename
      );
    } catch (err: any) {
      if (err?.response?.status === 401) {
        setError("Your session has expired. Please sign in again.");
        onRequireAuth();
      } else {
        setError("Failed to submit application. Please check the backend server.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  const inputClass =
    "w-full border border-neutral-700 bg-neutral-800 text-neutral-100 placeholder:text-neutral-500 rounded-lg px-3 py-2 text-sm";
  const labelClass = "text-xs font-medium text-neutral-400 mb-1 block";

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-neutral-100">
            📝 New Loan Application
          </h2>
          <button
            onClick={onClose}
            className="text-neutral-500 hover:text-neutral-200 text-xl leading-none"
          >
            &times;
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <label className={labelClass}>Customer Name *</label>
            <input
              className={inputClass}
              value={form.customerName}
              onChange={(e) => update("customerName", e.target.value)}
              placeholder="Daniel Matthews"
            />
          </div>

          <div>
            <label className={labelClass}>Date of Birth</label>
            <input
              type="date"
              className={inputClass}
              value={form.dateOfBirth}
              onChange={(e) => update("dateOfBirth", e.target.value)}
            />
          </div>

          <div>
            <label className={labelClass}>Employment Status</label>
            <select
              className={inputClass}
              value={form.employmentStatus}
              onChange={(e) => update("employmentStatus", e.target.value)}
            >
              <option>Full-Time</option>
              <option>Part-Time</option>
              <option>Self-Employed</option>
              <option>Unemployed</option>
            </select>
          </div>

          <div className="sm:col-span-2">
            <label className={labelClass}>Address</label>
            <input
              className={inputClass}
              value={form.address}
              onChange={(e) => update("address", e.target.value)}
              placeholder="2458 Oak Ridge Drive, Dallas, TX 75201"
            />
          </div>

          <div>
            <label className={labelClass}>Employer</label>
            <input
              className={inputClass}
              value={form.employer}
              onChange={(e) => update("employer", e.target.value)}
              placeholder="Northstar Logistics LLC"
            />
          </div>

          <div>
            <label className={labelClass}>Loan Type *</label>
            <select
              className={inputClass}
              value={form.loanType}
              onChange={(e) => update("loanType", e.target.value)}
            >
              <option>Home Mortgage</option>
              <option>Auto Loan</option>
              <option>Personal Loan</option>
              <option>Business Loan</option>
            </select>
          </div>

          <div>
            <label className={labelClass}>Annual Income ($) *</label>
            <input
              type="number"
              className={inputClass}
              value={form.annualIncome}
              onChange={(e) => update("annualIncome", e.target.value)}
              placeholder="118000"
            />
          </div>

          <div>
            <label className={labelClass}>Requested Loan Amount ($) *</label>
            <input
              type="number"
              className={inputClass}
              value={form.requestedLoanAmount}
              onChange={(e) => update("requestedLoanAmount", e.target.value)}
              placeholder="350000"
            />
          </div>

          <div>
            <label className={labelClass}>Credit Score *</label>
            <input
              type="number"
              className={inputClass}
              value={form.creditScore}
              onChange={(e) => update("creditScore", e.target.value)}
              placeholder="724"
            />
          </div>

          <div>
            <label className={labelClass}>Monthly Debt Payments ($) *</label>
            <input
              type="number"
              className={inputClass}
              value={form.monthlyDebtPayments}
              onChange={(e) => update("monthlyDebtPayments", e.target.value)}
              placeholder="1850"
            />
          </div>

          <div>
            <label className={labelClass}>Down Payment ($) *</label>
            <input
              type="number"
              className={inputClass}
              value={form.downPayment}
              onChange={(e) => update("downPayment", e.target.value)}
              placeholder="70000"
            />
          </div>

          <div className="sm:col-span-2">
            <label className={labelClass}>Applicant Notes</label>
            <textarea
              className={inputClass}
              rows={2}
              value={form.notes}
              onChange={(e) => update("notes", e.target.value)}
              placeholder="Customer is applying for a 30-year fixed mortgage."
            />
          </div>

          <div className="sm:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-2 mt-1">
            <label className="flex items-center gap-2 text-sm text-neutral-300">
              <input
                type="checkbox"
                checked={form.payStubsAndBankStatementsProvided}
                onChange={(e) =>
                  update("payStubsAndBankStatementsProvided", e.target.checked)
                }
              />
              Pay stubs & bank statements provided
            </label>

            <label className="flex items-center gap-2 text-sm text-neutral-300">
              <input
                type="checkbox"
                checked={form.employmentHistoryFiveYears}
                onChange={(e) =>
                  update("employmentHistoryFiveYears", e.target.checked)
                }
              />
              5+ years with current employer
            </label>

            <label className="flex items-center gap-2 text-sm text-neutral-300">
              <input
                type="checkbox"
                checked={form.homeInsuranceQuoteProvided}
                onChange={(e) =>
                  update("homeInsuranceQuoteProvided", e.target.checked)
                }
              />
              Home insurance quote provided
            </label>

            <label className="flex items-center gap-2 text-sm text-neutral-300">
              <input
                type="checkbox"
                checked={form.propertyAppraisalCompleted}
                onChange={(e) =>
                  update("propertyAppraisalCompleted", e.target.checked)
                }
              />
              Property appraisal completed
            </label>
          </div>
        </div>

        {error && <p className="text-sm text-red-400 mt-4">{error}</p>}

        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-sm font-medium text-neutral-400 hover:bg-neutral-800"
          >
            Cancel
          </button>
          <button
            onClick={submit}
            disabled={submitting}
            className="bg-purple-600 hover:bg-purple-500 disabled:bg-purple-900 text-white px-5 py-2 rounded-lg text-sm font-medium"
          >
            {submitting ? "Submitting..." : "Submit Application"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default LoanApplicationForm;
