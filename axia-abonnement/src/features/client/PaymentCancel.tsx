import { useNavigate, useLocation } from "react-router-dom";
import { XCircle } from "lucide-react";

export default function PaymentCancel() {
  const navigate = useNavigate();
  const location = useLocation();
  const isResponsable = location.pathname.includes("responsable-account");

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-white rounded-2xl border border-gray-200 p-8 text-center">
        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <XCircle className="w-8 h-8 text-blue-500" />
        </div>

        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Paiement annulé
        </h1>

        <p className="text-gray-500 text-sm mb-6">
          {isResponsable
            ? "Votre paiement a été annulé. Votre compte responsable n'a pas encore été activé. Vous pouvez réessayer depuis votre espace."
            : "Votre paiement a été annulé. Votre abonnement n'a pas été activé. Vous pouvez réessayer à tout moment."}
        </p>

        <button
          onClick={() =>
            navigate(isResponsable ? "/responsable-account/payment" : "/dashboard/client/abonnements")
          }
          className="w-full py-3 text-white rounded-xl font-semibold text-sm transition-colors bg-(--color-primary)"
        >
          Réessayer
        </button>
      </div>
    </div>
  );
}