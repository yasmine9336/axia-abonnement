import type { RegisterStep } from "../types";

interface RegisterActionsProps {
  isResponsable: boolean;
  step: RegisterStep;
  loading: boolean;
  onBack: () => void;
  onLogin: () => void;
}

export default function RegisterActions({
  isResponsable,
  step,
  loading,
  onBack,
  onLogin,
}: RegisterActionsProps) {
  if (isResponsable && step === 2) {
    return (
      <div className="flex gap-3 pt-2">
        <button
          type="button"
          onClick={onBack}
          className="w-1/3 py-3 border-2 rounded-xl font-semibold text-sm text-gray-600 border-gray-200 hover:bg-gray-50"
        >
          Retour
        </button>

        <button
          type="submit"
          disabled={loading}
          className="w-2/3 py-3 text-white font-semibold rounded-xl text-sm disabled:opacity-50"
          style={{ background: "var(--color-primary)" }}
        >
          {loading ? "Inscription..." : "Envoyer ma demande"}
        </button>
      </div>
    );
  }

  return (
    <div className="flex gap-3 pt-2">
      <button
        type="submit"
        disabled={loading}
        className="flex-1 py-3 text-white font-semibold rounded-xl text-sm disabled:opacity-50"
        style={{ background: "var(--color-primary)" }}
      >
        {loading ? "..." : isResponsable ? "Suivant" : "Créer un compte"}
      </button>

      <button
        type="button"
        onClick={onLogin}
        className="flex-1 py-3 font-semibold rounded-xl text-sm border-2 bg-white"
        style={{
          borderColor: "var(--color-primary)",
          color: "var(--color-primary)",
        }}
      >
        Se connecter
      </button>
    </div>
  );
}