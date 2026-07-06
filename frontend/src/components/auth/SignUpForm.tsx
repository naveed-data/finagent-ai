import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import Card from "../common/Card";

type SignUpFormProps = {
  onSuccess: () => void;
  onNavigateToSignIn: () => void;
};

function SignUpForm({ onSuccess, onNavigateToSignIn }: SignUpFormProps) {
  const { signup } = useAuth();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const submit = async () => {
    if (!fullName.trim() || !email.trim() || !password) {
      setError("Please fill in all fields.");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      await signup(fullName, email, password);
      onSuccess();
    } catch (err: any) {
      setError(
        err?.response?.data?.detail || "Could not create account. Try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card
      title="📝 Create Account"
      subtitle="Create a new FinAgent AI account."
    >
      <div className="max-w-md space-y-4">
        <input
          className="w-full border border-neutral-700 bg-neutral-800 text-neutral-100 placeholder:text-neutral-500 rounded-xl px-4 py-3"
          placeholder="Full Name"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
        />
        <input
          className="w-full border border-neutral-700 bg-neutral-800 text-neutral-100 placeholder:text-neutral-500 rounded-xl px-4 py-3"
          placeholder="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          className="w-full border border-neutral-700 bg-neutral-800 text-neutral-100 placeholder:text-neutral-500 rounded-xl px-4 py-3"
          placeholder="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && submit()}
        />

        {error && <p className="text-sm text-red-400">{error}</p>}

        <button
          onClick={submit}
          disabled={submitting}
          className="w-full bg-white hover:bg-neutral-200 disabled:bg-neutral-600 text-black py-3 rounded-xl font-semibold transition-colors"
        >
          {submitting ? "Creating account..." : "Create Account"}
        </button>

        <p className="text-sm text-neutral-400 text-center">
          Already have an account?{" "}
          <button
            onClick={onNavigateToSignIn}
            className="text-purple-400 font-medium hover:underline"
          >
            Sign in
          </button>
        </p>
      </div>
    </Card>
  );
}

export default SignUpForm;
