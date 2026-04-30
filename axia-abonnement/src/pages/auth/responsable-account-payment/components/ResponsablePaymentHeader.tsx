import LogoAxia from "../../../../assets/logo-axia.svg";

export default function ResponsablePaymentHeader() {
  return (
    <div className="mb-8">
      <img src={LogoAxia} alt="AxiaAbonnement" className="h-20 mb-4" />

      <h1 className="text-3xl font-bold text-gray-900">
        Activation du compte.
      </h1>

      <h2 className="text-3xl font-bold text-gray-900">
        Paiement sécurisé.
      </h2>

      <p className="text-gray-400 text-sm mt-3">
        Redirection vers Stripe pour le paiement de 500 TND.
      </p>
    </div>
  );
}