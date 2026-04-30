import ForgotPasswordIllustrationSvg from "../../../../assets/undraw_forgot-password_nttj.svg";

export default function ForgotPasswordIllustration() {
  return (
    <div
      className="hidden lg:flex lg:w-[45%] flex-col items-center justify-center relative overflow-hidden"
      style={{ background: "var(--color-primary)" }}
    >
      <div
        className="absolute w-96 h-96 rounded-full opacity-10"
        style={{ background: "white", top: "-80px", right: "-80px" }}
      />

      <div
        className="absolute w-64 h-64 rounded-full opacity-10"
        style={{ background: "white", bottom: "-40px", left: "-40px" }}
      />

      <img
        src={ForgotPasswordIllustrationSvg}
        alt="Mot de passe oublié"
        className="w-72 relative z-10"
      />
    </div>
  );
}