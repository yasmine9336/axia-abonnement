import { useLocation, useNavigate } from "react-router-dom";
import { CheckCircle } from "lucide-react";
import ResultCard from "../../components/common/ResultCard";

export default function PaymentSuccess() {
  const navigate = useNavigate();
  const location = useLocation();

  const isResponsable = location.pathname.includes("responsable-account");

  return (
    <ResultCard
      icon={
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="w-8 h-8 text-green-600" />
        </div>
      }
      title={isResponsable ? "Compte activé !" : "Paiement réussi"}
      message={
        isResponsable
          ? "Votre paiement de 500 TND a bien été reçu. Votre compte responsable est maintenant actif. Connectez-vous pour accéder à votre tableau de bord."
          : "Votre abonnement a été activé avec succès."
      }
      buttonLabel={
        isResponsable ? "Se connecter" : "Accéder à mon tableau de bord"
      }
      onButtonClick={() =>
        navigate(isResponsable ? "/login" : "/dashboard/client")
      }
    />
  );
}