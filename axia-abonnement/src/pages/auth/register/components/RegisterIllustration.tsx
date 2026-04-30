import RegisterIllustrationSvg from "../../../../assets/undraw_sign-up_qamz.svg";

export default function RegisterIllustration() {
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
        src={RegisterIllustrationSvg}
        alt="Inscription"
        className="w-80 relative z-10"
      />
    </div>
  );
}