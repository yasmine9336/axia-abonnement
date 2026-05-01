import AuthHeader from "../../components/AuthHeader";

export default function LoginHeader() {
  return (
    <AuthHeader
      title="Bienvenue."
      subtitle="Connectez-vous à votre compte."
      description="Entrez vos identifiants pour continuer"
    />
  );
}