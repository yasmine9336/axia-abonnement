import AuthHeader from "../../components/AuthHeader";

interface ResetPasswordHeaderProps {
  resetComplete: boolean;
}

export default function ResetPasswordHeader({
  resetComplete,
}: ResetPasswordHeaderProps) {
  return (
    <AuthHeader
      title={resetComplete ? "Mot de passe" : "Nouveau mot de passe."}
      subtitle={resetComplete ? "réinitialisé !" : "Créez-en un sécurisé."}
      description={
        resetComplete
          ? "Vous pouvez maintenant vous connecter."
          : "Minimum 8 caractères avec majuscule et chiffre"
      }
    />
  );
}