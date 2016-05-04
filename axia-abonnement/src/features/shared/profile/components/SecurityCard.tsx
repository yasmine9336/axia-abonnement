import type { FormEvent } from "react";
import type { PasswordForm } from "../types";
import PasswordStrengthIndicator from "./PasswordStrengthIndicator";

interface SecurityCardProps {
  showPasswordForm: boolean;
  passwordForm: PasswordForm;
  passwordLoading: boolean;
  passwordSuccess: string;
  passwordError: string;
  onTogglePasswordForm: () => void;
  onPasswordFormChange: (form: PasswordForm) => void;
  onPasswordSubmit: (event: FormEvent<HTMLFormElement>) => void;
}

export default function SecurityCard({
  showPasswordForm,
  passwordForm,
  passwordLoading,
  passwordSuccess,
  passwordError,
  onTogglePasswordForm,
  onPasswordFormChange,
  onPasswordSubmit,
}: SecurityCardProps) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6">
      <h2 className="text-base font-bold text-gray-900 mb-4">
        Sécurité & Accès
      </h2>

      <div className="space-y-3">
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-white border border-gray-200 rounded-lg flex items-center justify-center shrink-0 text-xl">
              🔑
            </div>

            <div>
              <p className="text-sm font-semibold text-gray-900">
                Mot de passe
              </p>

              <p className="text-xs text-gray-500">
                Modifiez votre mot de passe
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onTogglePasswordForm}
            className="text-sm font-semibold px-4 py-2 rounded-xl transition-colors border border-(--color-primary) text-(--color-primary)"
          >
            {showPasswordForm ? "Annuler" : "Changer"}
          </button>
        </div>

        {showPasswordForm && (
          <form
            onSubmit={onPasswordSubmit}
            className="border border-gray-100 rounded-xl p-5 space-y-4"
          >
            <input
              type="text"
              autoComplete="username"
              className="hidden"
              readOnly
            />

            <div>
              <label className="block text-sm font-medium text-gray-800 mb-1">
                Mot de passe actuel
              </label>

              <input
                type="password"
                value={passwordForm.currentPassword}
                onChange={(event) =>
                  onPasswordFormChange({
                    ...passwordForm,
                    currentPassword: event.target.value,
                  })
                }
                placeholder="Entrez votre mot de passe actuel"
                className="ui-input"
                autoComplete="current-password"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-800 mb-1">
                Nouveau mot de passe
              </label>

              <input
                type="password"
                value={passwordForm.newPassword}
                onChange={(event) =>
                  onPasswordFormChange({
                    ...passwordForm,
                    newPassword: event.target.value,
                  })
                }
                placeholder="Entrez votre nouveau mot de passe"
                className="ui-input"
                autoComplete="new-password"
                minLength={8}
              />
            </div>

            <PasswordStrengthIndicator password={passwordForm.newPassword} />

            <div>
              <label className="block text-sm font-medium text-gray-800 mb-1">
                Confirmer le mot de passe
              </label>

              <input
                type="password"
                value={passwordForm.confirmPassword}
                onChange={(event) =>
                  onPasswordFormChange({
                    ...passwordForm,
                    confirmPassword: event.target.value,
                  })
                }
                placeholder="Confirmez votre nouveau mot de passe"
                className="ui-input"
                autoComplete="new-password"
                minLength={8}
              />
            </div>

            {passwordSuccess && (
              <p className="text-sm text-green-700 bg-green-50 p-3 rounded-xl">
                {passwordSuccess}
              </p>
            )}

            {passwordError && (
              <p className="text-sm text-red-700 bg-red-50 p-3 rounded-xl">
                {passwordError}
              </p>
            )}

            <button
              type="submit"
              disabled={passwordLoading}
              className="w-full text-white font-semibold py-3 rounded-xl transition-colors disabled:opacity-50 bg-(--color-primary)"
            >
              {passwordLoading ? "Modification..." : "Modifier le mot de passe"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}