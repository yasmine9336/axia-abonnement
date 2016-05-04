import type { ChangeEvent, FormEvent } from "react";
import type { LoginFormValues } from "../types";

interface LoginFormProps {
  form: LoginFormValues;
  loading: boolean;
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onForgotPassword: () => void;
  onRegister: () => void;
}

export default function LoginForm({
  form,
  loading,
  onChange,
  onSubmit,
  onForgotPassword,
  onRegister,
}: LoginFormProps) {
  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <div>
        <label className="block text-xs text-gray-400 mb-1 uppercase tracking-wide">
          Email
        </label>

        <div className="relative">
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={onChange}
            placeholder="john.doe@gmail.com"
            autoComplete="email"
            required
            className="w-full border-0 border-b-2 border-gray-200 focus:border-b-(--color-primary) pb-2 text-sm text-gray-800 placeholder-gray-300 outline-none transition-colors bg-transparent"
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

      <div>
        <label className="block text-xs text-gray-400 mb-1 uppercase tracking-wide">
          Mot de passe
        </label>

        <div className="relative">
          <input
            type="password"
            name="password"
            value={form.password}
            onChange={onChange}
            placeholder="Start typing..."
            autoComplete="current-password"
            required
            className="w-full border-0 border-b-2 border-gray-200 focus:border-b-(--color-primary) pb-2 text-sm text-gray-800 placeholder-gray-300 outline-none transition-colors bg-transparent"
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
              d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
            />
          </svg>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <label className="flex items-center gap-2 cursor-pointer">
          <div className="relative">
            <input
              type="checkbox"
              name="remember"
              checked={form.remember}
              onChange={onChange}
              className="sr-only"
            />

            <div
              className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                form.remember
                  ? "border-(--color-primary) bg-(--color-primary)"
                  : "border-gray-300 bg-white"
              }`}
            >
              {form.remember && (
                <svg
                  className="w-3 h-3 text-white"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              )}
            </div>
          </div>

          <span className="text-sm text-gray-600">Se souvenir de moi</span>
        </label>

        <button
          type="button"
          onClick={onForgotPassword}
          className="text-sm font-medium transition-colors text-(--color-primary)"
        >
          Récupérer le mot de passe
        </button>
      </div>

      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          disabled={loading}
          className="flex-1 py-3 text-white font-semibold rounded-xl text-sm transition-colors disabled:opacity-50 bg-(--color-primary)"
        >
          {loading ? "Connexion..." : "Se connecter"}
        </button>

        <button
          type="button"
          onClick={onRegister}
          className="flex-1 py-3 font-semibold rounded-xl text-sm border-2 transition-colors bg-white border-(--color-primary) text-(--color-primary)"
        >
          S'inscrire
        </button>
      </div>
    </form>
  );
}