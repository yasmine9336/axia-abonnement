type PaymentStatus = "idle" | "loading" | "error";

interface ResponsablePaymentStatusProps {
  status: PaymentStatus;
  error: string;
  onRetry: () => void;
  onBackToLogin: () => void;
}

export default function ResponsablePaymentStatus({
  status,
  error,
  onRetry,
  onBackToLogin,
}: ResponsablePaymentStatusProps) {
  if (status === "loading") {
    return (
      <div className="flex flex-col items-center gap-4 py-8">
        <div className="w-12 h-12 border-4 border-gray-200 border-t-(--color-primary) rounded-full animate-spin" />

        <p className="text-sm text-gray-500">Préparation du paiement...</p>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="space-y-4">
        <p className="text-sm text-red-600 bg-red-50 px-4 py-3 rounded-xl">
          {error}
        </p>

        <button
          type="button"
          onClick={onRetry}
          className="w-full py-3 text-white font-semibold rounded-xl text-sm bg-(--color-primary)"
        >
          Réessayer
        </button>

        <button
          type="button"
          onClick={onBackToLogin}
          className="w-full py-3 font-semibold rounded-xl text-sm border-2 border-gray-200 text-gray-600 hover:bg-gray-50"
        >
          Retour à la connexion
        </button>
      </div>
    );
  }

  return null;
}