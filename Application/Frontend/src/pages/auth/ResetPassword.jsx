import { useState } from "react";

const EyeIcon = ({ visible }) => (
  <svg
    className="w-5 h-5"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    {visible ? (
      <>
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
        />
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
        />
      </>
    ) : (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
      />
    )}
  </svg>
);

// Floating label password input with eye toggle
const PasswordInput = ({
  label,
  name,
  value,
  onChange,
  showPassword,
  onToggle,
  error,
}) => (
  <div className="relative">
    <input
      type={showPassword ? "text" : "password"}
      name={name}
      id={name}
      value={value}
      onChange={onChange}
      placeholder=" "
      className={`peer w-full px-4 pt-5 pb-2 pr-11 border rounded-xl bg-white dark:bg-slate-800
        text-slate-800 dark:text-slate-200 outline-none transition-all text-sm
        ${error ? "border-red-400 focus:ring-red-400" : "border-slate-300 dark:border-slate-600 focus:border-indigo-500 focus:ring-indigo-500"}
        focus:ring-2`}
    />
    <label
      htmlFor={name}
      className={`absolute left-4 transition-all duration-200 pointer-events-none
        ${value ? "top-1.5 text-[10px] text-indigo-600" : "top-3.5 text-sm text-slate-400"}
        peer-focus:top-1.5 peer-focus:text-[10px] peer-focus:text-indigo-600`}
    >
      {label}
    </label>
    <button
      type="button"
      onClick={onToggle}
      className="absolute right-3 top-3.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
    >
      <EyeIcon visible={showPassword} />
    </button>
    {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
  </div>
);

export default function ResetPassword() {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState({});
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const calculateStrength = (pw) => {
    let s = 0;
    if (pw.length >= 8) s++;
    if (pw.match(/[a-z]/) && pw.match(/[A-Z]/)) s++;
    if (pw.match(/[0-9]/)) s++;
    if (pw.match(/[^a-zA-Z0-9]/)) s++;
    return s;
  };

  const strengthLevel = calculateStrength(newPassword);
  const strengthText = ["Very Weak", "Weak", "Fair", "Good", "Strong"][
    strengthLevel
  ];
  const strengthColors = [
    "bg-red-500",
    "bg-orange-500",
    "bg-yellow-500",
    "bg-blue-500",
    "bg-emerald-500",
  ];

  const validate = () => {
    const newErrors = {};
    if (!newPassword) newErrors.newPassword = "Password is required";
    else if (newPassword.length < 8)
      newErrors.newPassword = "Password must be at least 8 characters";
    if (!confirmPassword)
      newErrors.confirmPassword = "Please confirm your password";
    else if (newPassword !== confirmPassword)
      newErrors.confirmPassword = "Passwords do not match";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setIsSubmitting(true);
    await new Promise((r) => setTimeout(r, 1500));
    setIsSubmitting(false);
    setSuccess(true);
    setTimeout(() => setSuccess(false), 3000);
    setNewPassword("");
    setConfirmPassword("");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex p-3 bg-indigo-100 dark:bg-indigo-900/50 rounded-full mb-4">
            <svg
              className="w-8 h-8 text-indigo-600 dark:text-indigo-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white">
            Reset Password
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm">
            Create a new strong password
          </p>
        </div>

        {/* Card */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 p-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* New Password */}
            <PasswordInput
              label="New Password"
              name="newPassword"
              value={newPassword}
              onChange={(e) => {
                setNewPassword(e.target.value);
                if (errors.newPassword)
                  setErrors((p) => ({ ...p, newPassword: "" }));
              }}
              showPassword={showNew}
              onToggle={() => setShowNew(!showNew)}
              error={errors.newPassword}
            />

            {/* Strength Indicator */}
            {newPassword && (
              <div className="space-y-1">
                <div className="flex gap-1 h-1.5">
                  {[...Array(4)].map((_, i) => (
                    <div
                      key={i}
                      className={`flex-1 rounded-full transition-all ${i < strengthLevel ? strengthColors[strengthLevel] : "bg-slate-200 dark:bg-slate-700"}`}
                    />
                  ))}
                </div>
                <p
                  className={`text-xs ${strengthLevel >= 3 ? "text-emerald-600" : "text-slate-500"}`}
                >
                  {strengthText} password
                </p>
              </div>
            )}

            {/* Confirm Password */}
            <PasswordInput
              label="Confirm Password"
              name="confirmPassword"
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value);
                if (errors.confirmPassword)
                  setErrors((p) => ({ ...p, confirmPassword: "" }));
              }}
              showPassword={showConfirm}
              onToggle={() => setShowConfirm(!showConfirm)}
              error={errors.confirmPassword}
            />

            {/* Submit */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 text-sm bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl transition shadow-sm disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {isSubmitting && (
                <svg
                  className="w-4 h-4 animate-spin"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v8H4z"
                  />
                </svg>
              )}
              {isSubmitting ? "Resetting..." : "Reset Password"}
            </button>
          </form>
        </div>

        {/* Success Toast */}
        {success && (
          <div className="fixed bottom-6 right-6 bg-emerald-500 text-white px-4 py-3 rounded-xl shadow-lg flex items-center gap-2">
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
            Password reset successfully!
          </div>
        )}
      </div>
    </div>
  );
}
