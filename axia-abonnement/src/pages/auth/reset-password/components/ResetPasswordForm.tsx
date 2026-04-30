import type { FormEvent } from "react";
import { inputClass } from "../constants";
import { handleInputBlur, handleInputFocus } from "../utils";
import PasswordStrengthIndicator from "./PasswordStrengthIndicator";

interface ResetPasswordFormProps {
  userEmail: string | null;
  password: string;
  confirmPassword: string;
  loading: boolean;
  error: string;
  onPasswordChange: (value: string) => void;
  onConfirmPasswordChange: (value: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onBackToLogin: () => void;
}

export default function ResetPasswordForm({
  userEmail,
  password,
  confirmPassword,
  loading,
  error,
  onPasswordChange,
  onConfirmPasswordChange,
  onSubmit,
  onBackToLogin,
}: ResetPasswordFormProps) {
  return (
    <form onSubmit={onSubmit} className="space-y-6">
      {userEmail && (
        <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
          <svg
            className="w-4 h-4 text-gray-400 shrink-0"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
            />
          </svg>

          <p className="text-sm text-gray-700 font-medium">{userEmail}</p>
        </div>
      )}

      {error && (
        <p className="text-sm text-red-600 bg-red-50 px-4 py-3 rounded-xl">
          {error}
        </p>
      )}

      <div>
        <label className="block text-xs text-gray-400 mb-1 uppercase tracking-wide">
          Nouveau mot de passe
        </label>

        <input
          type="password"
          value={password}
          onChange={(event) => onPasswordChange(event.target.value)}
          placeholder="Start typing..."
          required
          minLength={8}
          className={inputClass}
          onFocus={handleInputFocus}
          onBlur={handleInputBlur}
        />
      </div>

      <div>
        <label className="block text-xs text-gray-400 mb-1 uppercase tracking-wide">
          Confirmer le mot de passe
        </label>

        <input
          type="password"
          value={confirmPassword}
          onChange={(event) => onConfirmPasswordChange(event.target.value)}
          placeholder="Start typing..."
          required
          minLength={8}
          className={inputClass}
          onFocus={handleInputFocus}
          onBlur={handleInputBlur}
        />
      </div>

      <PasswordStrengthIndicator password={password} />

      <button
        type="submit"
        disabled={loading}
        className="w-full py-3 text-white font-semibold rounded-xl text-sm disabled:opacity-50"
        style={{ background: "var(--color-primary)" }}
      >
        {loading ? "Réinitialisation..." : "Réinitialiser le mot de passe"}
      </button>

      <p className="text-center">
        <button
          type="button"
          onClick={onBackToLogin}
          className="text-sm text-gray-400 hover:text-gray-600"
        >
          ← Retour à la connexion
        </button>
      </p>
    </form>
  );
}