import AuthIllustrationPanel from "../../components/AuthIllustrationPanel";
import ForgotPasswordIllustrationSvg from "../../../../assets/undraw_forgot-password_nttj.svg";

export default function ForgotPasswordIllustration() {
  return (
    <AuthIllustrationPanel
      illustration={ForgotPasswordIllustrationSvg}
      alt="Mot de passe oublié"
      imageClassName="w-72"
    />
  );
}