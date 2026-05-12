interface ForgotPasswordSuccessProps {
  error: string;
  cooldown: number;
  onResend: () => void;
  onBackToLogin: () => void;
  onBackHome: () => void;
}

export default function ForgotPasswordSuccess({
  error,
  cooldown,
  onResend,
  onBackToLogin,
  onBackHome,
}: ForgotPasswordSuccessProps) {
  return (
    <div className="space-y-5">
      {error && <p className="text-blue-500 text-sm">{error}</p>}

      <div className="p-4 bg-gray-50 rounded-xl">
        <p className="text-sm text-gray-600 mb-2">
          Vous n'avez pas reçu l'email ?
        </p>

        <button
          type="button"
          onClick={onResend}
          disabled={cooldown > 0}
          className="text-sm font-semibold disabled:opacity-50 text-(--color-primary)"
        >
          {cooldown > 0 ? `Renvoyer dans ${cooldown}s` : "Renvoyer l'email"}
        </button>
      </div>

      <div className="flex gap-3">
        <button
          type="button"
          onClick={onBackToLogin}
          className="flex-1 py-3 font-semibold rounded-xl text-sm border-2 border-(--color-primary) text-(--color-primary)"
        >
          Retour à la connexion
        </button>

        <button
          type="button"
          onClick={onBackHome}
          className="flex-1 py-3 text-white font-semibold rounded-xl text-sm bg-(--color-primary)"
        >
          Retour à l'accueil
        </button>
      </div>
    </div>
  );
}