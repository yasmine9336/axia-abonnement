import LogoAxia from "../../../../assets/logo-axia.svg";

interface ResetPasswordHeaderProps {
  resetComplete: boolean;
}

export default function ResetPasswordHeader({
  resetComplete,
}: ResetPasswordHeaderProps) {
  return (
    <div className="mb-8">
      <img src={LogoAxia} alt="AxiaAbonnement" className="h-20 mb-4" />

      {!resetComplete ? (
        <>
          <h1 className="text-3xl font-bold text-gray-900">
            Nouveau mot de passe.
          </h1>

          <h2 className="text-3xl font-bold text-gray-900">
            Créez-en un sécurisé.
          </h2>

          <p className="text-gray-400 text-sm mt-3">
            Minimum 8 caractères avec majuscule et chiffre
          </p>
        </>
      ) : (
        <>
          <h1 className="text-3xl font-bold text-gray-900">Mot de passe</h1>

          <h2 className="text-3xl font-bold text-gray-900">
            réinitialisé !
          </h2>

          <p className="text-gray-400 text-sm mt-3">
            Vous pouvez maintenant vous connecter.
          </p>
        </>
      )}
    </div>
  );
}