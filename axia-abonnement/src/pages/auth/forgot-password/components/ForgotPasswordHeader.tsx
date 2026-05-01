import AuthHeader from "../../components/AuthHeader";

interface ForgotPasswordHeaderProps {
  submitted: boolean;
  email: string;
}

export default function ForgotPasswordHeader({
  submitted,
  email,
}: ForgotPasswordHeaderProps) {
  return (
    <AuthHeader
      title={submitted ? "Email envoyé !" : "Mot de passe oublié ?"}
      subtitle={
        submitted ? "Vérifiez votre boîte." : "Entrez vos informations."
      }
      description={
        submitted ? (
          <>
            Un lien de réinitialisation a été envoyé à <strong>{email}</strong>
          </>
        ) : (
          "Entrez votre email pour recevoir un lien de réinitialisation"
        )
      }
    />
  );
}