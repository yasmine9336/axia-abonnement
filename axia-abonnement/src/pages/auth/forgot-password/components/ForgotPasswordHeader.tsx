import LogoAxia from "../../../../assets/logo-axia.svg";

interface ForgotPasswordHeaderProps {
  submitted: boolean;
  email: string;
}

export default function ForgotPasswordHeader({
  submitted,
  email,
}: ForgotPasswordHeaderProps) {
  return (
    <div className="mb-6">
      <img src={LogoAxia} alt="AxiaAbonnement" className="h-14 mb-2" />

      {!submitted ? (
        <>
          <h1 className="text-3xl font-bold text-gray-900">
            Mot de passe oublié ?
          </h1>

          <h2 className="text-3xl font-bold text-gray-900">
            Entrez vos informations.
          </h2>

          <p className="text-gray-400 text-sm mt-3">
            Entrez votre email pour recevoir un lien de réinitialisation
          </p>
        </>
      ) : (
        <>
          <h1 className="text-3xl font-bold text-gray-900">Email envoyé !</h1>

          <h2 className="text-3xl font-bold text-gray-900">
            Vérifiez votre boîte.
          </h2>

          <p className="text-gray-400 text-sm mt-3">
            Un lien de réinitialisation a été envoyé à{" "}
            <strong>{email}</strong>
          </p>
        </>
      )}
    </div>
  );
}