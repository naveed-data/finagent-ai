import SignInForm from "./SignInForm";
import SignUpForm from "./SignUpForm";

type AuthModalProps = {
  mode: "signin" | "signup";
  onClose: () => void;
  onModeChange: (mode: "signin" | "signup") => void;
};

function AuthModal({ mode, onClose, onModeChange }: AuthModalProps) {
  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="relative w-full max-w-md">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 text-neutral-500 hover:text-white text-xl leading-none"
        >
          &times;
        </button>

        {mode === "signin" ? (
          <SignInForm
            onSuccess={onClose}
            onNavigateToSignUp={() => onModeChange("signup")}
          />
        ) : (
          <SignUpForm
            onSuccess={onClose}
            onNavigateToSignIn={() => onModeChange("signin")}
          />
        )}
      </div>
    </div>
  );
}

export default AuthModal;
