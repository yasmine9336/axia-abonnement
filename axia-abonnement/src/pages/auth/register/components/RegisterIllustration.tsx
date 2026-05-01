import AuthIllustrationPanel from "../../components/AuthIllustrationPanel";
import RegisterIllustrationSvg from "../../../../assets/undraw_sign-up_qamz.svg";

export default function RegisterIllustration() {
  return (
    <AuthIllustrationPanel
      illustration={RegisterIllustrationSvg}
      alt="Inscription"
      imageClassName="w-80"
    />
  );
}