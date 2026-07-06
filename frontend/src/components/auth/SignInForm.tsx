import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import Card from "../common/Card";

type SignInFormProps = {
  onSuccess: () => void;
  onNavigateToSignUp: () => void;
};

function SignInForm({ onSuccess, onNavigateToSignUp }: SignInFormProps) {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const submit = async () => {
    if (!email.trim() || !password) {
      setError("Please enter your email and password.");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      await login(email, password);
      onSuccess();
    } catch (err: any) {
      setError(err?.response?.data?.detail || "Invalid email or password.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card
      title="🔐 Sign In"
      subtitle="Login to access your FinAgent workspace."
    >
      <div className="max-w-md space-y-4">
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
          {submitting ? "Signing in..." : "Sign In"}
        </button>

        <p className="text-sm text-neutral-400 text-center">
          Don&apos;t have an account?{" "}
          <button
            onClick={onNavigateToSignUp}
            className="text-purple-400 font-medium hover:underline"
          >
            Create one
          </button>
        </p>
      </div>
    </Card>
  );
}

export default SignInForm;
