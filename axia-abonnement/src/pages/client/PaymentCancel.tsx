import { useNavigate } from "react-router-dom";
import { XCircle } from "lucide-react";

export default function PaymentCancel() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-white rounded-2xl border border-gray-200 p-8 text-center">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <XCircle className="w-8 h-8 text-red-500" />
        </div>

        <h1 className="text-2xl font-bold text-gray-900 mb-2">Paiement annulé</h1>

        <p className="text-gray-500 text-sm mb-6">
          Votre paiement a été annulé. Aucun montant n&apos;a été débité.
        </p>

        <button
          onClick={() => navigate("/dashboard/client/payment")}
          className="w-full py-3 text-white rounded-xl font-semibold text-sm transition-colors"
          style={{ background: "var(--color-primary)" }}
        >
          Réessayer
        </button>
      </div>
    </div>
  );
}