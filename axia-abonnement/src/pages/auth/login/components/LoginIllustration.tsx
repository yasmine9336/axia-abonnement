import AuthIllustrationPanel from "../../components/AuthIllustrationPanel";
import LoginIllustrationSvg from "../../../../assets/undraw_login_weas.svg";

export default function LoginIllustration() {
  return (
    <AuthIllustrationPanel
      illustration={LoginIllustrationSvg}
      alt="Connexion"
      imageClassName="w-80"
    />
  );
}