import AuthHeader from "../../components/AuthHeader";

export default function ResponsablePaymentHeader() {
  return (
    <AuthHeader
      title="Activation du compte."
      subtitle="Paiement sécurisé."
      description="Redirection vers Stripe pour le paiement de 500 TND."
    />
  );
}