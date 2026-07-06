import { useState } from "react";
import api from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import Card from "../common/Card";

type ProfileSettingsPanelProps = {
  onRequireAuth: () => void;
};

function getInitials(fullName: string) {
  return fullName
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function formatMemberSince(isoTimestamp: string) {
  return new Date(isoTimestamp).toLocaleDateString([], {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function ProfileSettingsPanel({ onRequireAuth }: ProfileSettingsPanelProps) {
  const { user, updateUser } = useAuth();

  const [fullName, setFullName] = useState(user?.full_name ?? "");
  const [savingName, setSavingName] = useState(false);
  const [nameMessage, setNameMessage] = useState("");
  const [nameError, setNameError] = useState("");

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [savingPassword, setSavingPassword] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState("");
  const [passwordError, setPasswordError] = useState("");

  if (!user) {
    return (
      <Card
        title="👤 Profile Settings"
        subtitle="Manage your account details."
      >
        <div className="border border-dashed border-neutral-700 rounded-xl p-8 text-center text-neutral-500 space-y-3">
          <p>Sign in to manage your profile.</p>
          <button
            onClick={onRequireAuth}
            className="bg-white hover:bg-neutral-200 text-black px-5 py-2 rounded-full text-sm font-medium"
          >
            Sign In
          </button>
        </div>
      </Card>
    );
  }

  const saveFullName = async () => {
    setNameMessage("");
    setNameError("");

    if (!fullName.trim()) {
      setNameError("Full name cannot be empty.");
      return;
    }

    setSavingName(true);

    try {
      const response = await api.patch("/auth/me", { full_name: fullName.trim() });
      updateUser(response.data);
      setNameMessage("Profile updated.");
    } catch (err: any) {
      setNameError(err?.response?.data?.detail || "Could not update profile.");
    } finally {
      setSavingName(false);
    }
  };

  const savePassword = async () => {
    setPasswordMessage("");
    setPasswordError("");

    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordError("Please fill in all password fields.");
      return;
    }

    if (newPassword.length < 8) {
      setPasswordError("New password must be at least 8 characters.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError("New password and confirmation do not match.");
      return;
    }

    setSavingPassword(true);

    try {
      await api.post("/auth/change-password", {
        current_password: currentPassword,
        new_password: newPassword,
      });
      setPasswordMessage("Password updated successfully.");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      setPasswordError(err?.response?.data?.detail || "Could not update password.");
    } finally {
      setSavingPassword(false);
    }
  };

  const inputClass =
    "w-full border border-neutral-700 bg-neutral-800 text-neutral-100 placeholder:text-neutral-500 rounded-xl px-4 py-2.5 text-sm";

  return (
    <div className="space-y-6">
      <Card title="👤 Profile Settings" subtitle="Manage your account details.">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-14 h-14 rounded-full bg-purple-600 text-white flex items-center justify-center text-lg font-semibold shrink-0">
            {getInitials(user.full_name)}
          </div>
          <div className="min-w-0">
            <p className="text-base font-semibold text-neutral-100 truncate">
              {user.full_name}
            </p>
            <p className="text-sm text-neutral-500 truncate">{user.email}</p>
            <p className="text-xs text-neutral-600 mt-0.5">
              Member since {formatMemberSince(user.created_at)}
            </p>
          </div>
        </div>

        <div className="max-w-md space-y-3">
          <label className="text-xs font-medium text-neutral-400 block">
            Full Name
          </label>
          <input
            className={inputClass}
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
          />
          <label className="text-xs font-medium text-neutral-400 block">
            Email
          </label>
          <input
            className={`${inputClass} opacity-60 cursor-not-allowed`}
            value={user.email}
            disabled
            title="Email cannot be changed."
          />

          {nameError && <p className="text-sm text-red-400">{nameError}</p>}
          {nameMessage && <p className="text-sm text-emerald-400">{nameMessage}</p>}

          <button
            onClick={saveFullName}
            disabled={savingName}
            className="bg-white hover:bg-neutral-200 disabled:bg-neutral-600 text-black px-5 py-2.5 rounded-xl font-semibold text-sm transition-colors"
          >
            {savingName ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </Card>

      <Card title="🔒 Change Password" subtitle="Update your account password.">
        <div className="max-w-md space-y-3">
          <input
            type="password"
            className={inputClass}
            placeholder="Current Password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
          />
          <input
            type="password"
            className={inputClass}
            placeholder="New Password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />
          <input
            type="password"
            className={inputClass}
            placeholder="Confirm New Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && savePassword()}
          />

          {passwordError && <p className="text-sm text-red-400">{passwordError}</p>}
          {passwordMessage && (
            <p className="text-sm text-emerald-400">{passwordMessage}</p>
          )}

          <button
            onClick={savePassword}
            disabled={savingPassword}
            className="bg-white hover:bg-neutral-200 disabled:bg-neutral-600 text-black px-5 py-2.5 rounded-xl font-semibold text-sm transition-colors"
          >
            {savingPassword ? "Updating..." : "Update Password"}
          </button>
        </div>
      </Card>

      <Card title="⚙️ System Info" subtitle="Application environment.">
        <div className="space-y-2 text-sm text-neutral-300">
          <p>Model: Ollama llama3.2:3b</p>
          <p>Vector Database: ChromaDB</p>
          <p>Backend: FastAPI</p>
          <p>Status: Local Development</p>
        </div>
      </Card>
    </div>
  );
}

export default ProfileSettingsPanel;
