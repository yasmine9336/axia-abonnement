import AuthIllustrationPanel from "../../components/AuthIllustrationPanel";
import ForgotPasswordIllustrationSvg from "../../../../assets/undraw_forgot-password_nttj.svg";

export default function ResetPasswordIllustration() {
  return (
    <AuthIllustrationPanel
      illustration={ForgotPasswordIllustrationSvg}
      alt="Réinitialisation du mot de passe"
      imageClassName="w-72"
    />
  );
}