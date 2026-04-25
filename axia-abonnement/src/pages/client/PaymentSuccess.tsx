import { useNavigate } from "react-router-dom";
import { CheckCircle } from "lucide-react";

export default function PaymentSuccess() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-white rounded-2xl border border-gray-200 p-8 text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="w-8 h-8 text-green-600" />
        </div>

        <h1 className="text-2xl font-bold text-gray-900 mb-2">Paiement réussi</h1>

        <p className="text-gray-500 text-sm mb-6">
          Votre abonnement a été activé avec succès.
        </p>

        <button
          onClick={() => navigate("/dashboard/client")}
          className="w-full py-3 text-white rounded-xl font-semibold text-sm transition-colors"
          style={{ background: "var(--color-primary)" }}
        >
          Accéder à mon tableau de bord
        </button>
      </div>
    </div>
  );
}