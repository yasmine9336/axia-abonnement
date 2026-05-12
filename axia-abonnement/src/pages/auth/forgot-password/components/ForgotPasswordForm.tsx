import type { FormEvent } from "react";

interface ForgotPasswordFormProps {
  email: string;
  loading: boolean;
  error: string;
  onEmailChange: (value: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onBackToLogin: () => void;
}

export default function ForgotPasswordForm({
  email,
  loading,
  error,
  onEmailChange,
  onSubmit,
  onBackToLogin,
}: ForgotPasswordFormProps) {
  return (
    <form onSubmit={onSubmit} className="space-y-6">
      {error && <p className="text-blue-500 text-sm">{error}</p>}

      <div>
        <label className="block text-xs text-gray-400 mb-1 uppercase tracking-wide">
          Email
        </label>

        <div className="relative">
          <input
            type="email"
            value={email}
            onChange={(event) => onEmailChange(event.target.value)}
            placeholder="votre.email@exemple.com"
            required
            className="w-full border-0 border-b-2 border-gray-200 pb-2 text-sm text-gray-800 placeholder-gray-300 outline-none transition-colors bg-transparent focus:border-b-(--color-primary)"
          />

          <svg
            className="absolute right-0 bottom-2 w-4 h-4 text-gray-300"
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
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full py-3 text-white font-semibold rounded-xl text-sm disabled:opacity-50 bg-(--color-primary)"
      >
        {loading ? "Envoi en cours..." : "Envoyer le lien"}
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