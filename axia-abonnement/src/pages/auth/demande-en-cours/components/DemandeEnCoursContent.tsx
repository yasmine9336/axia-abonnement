interface DemandeEnCoursContentProps {
  email?: string;
  onBackHome: () => void;
}

export default function DemandeEnCoursContent({
  email,
  onBackHome,
}: DemandeEnCoursContentProps) {
  return (
    <div className="space-y-4">
      {email && (
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

          <div>
            <p className="text-xs text-gray-400">Notification envoyée à</p>
            <p className="text-sm font-semibold text-gray-800">{email}</p>
          </div>
        </div>
      )}

      <div className="p-4 rounded-xl border bg-(--color-primary-soft) border-(--color-primary-soft)">
        <p className="text-sm font-medium text-(--color-primary)">
          Si votre demande est acceptée, un lien de paiement de{" "}
          <strong>500 TND</strong> vous sera envoyé pour activer votre compte.
        </p>
      </div>

      <button
        type="button"
        onClick={onBackHome}
        className="w-full py-3 text-white font-semibold rounded-xl text-sm bg-(--color-primary)"
      >
        Retour à l'accueil
      </button>
    </div>
  );
}