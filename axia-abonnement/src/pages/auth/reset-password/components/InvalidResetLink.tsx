import LogoAxia from "../../../../assets/logo-axia.svg";
import ResetPasswordIllustration from "./ResetPasswordIllustration";

interface InvalidResetLinkProps {
  onNewLink: () => void;
  onLogin: () => void;
}

export default function InvalidResetLink({
  onNewLink,
  onLogin,
}: InvalidResetLinkProps) {
  return (
    <div className="min-h-screen flex">
      <div className="w-full lg:w-[55%] flex flex-col justify-center px-8 sm:px-16 py-12 bg-white">
        <div className="max-w-md w-full mx-auto">
          <img src={LogoAxia} alt="AxiaAbonnement" className="h-20 mb-4" />

          <h1 className="text-3xl font-bold text-gray-900">Lien invalide.</h1>

          <p className="text-gray-400 text-sm mt-3 mb-8">
            Ce lien de réinitialisation est invalide ou a expiré.
          </p>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onNewLink}
              className="flex-1 py-3 font-semibold rounded-xl text-sm border-2"
              style={{
                borderColor: "var(--color-primary)",
                color: "var(--color-primary)",
              }}
            >
              Nouveau lien
            </button>

            <button
              type="button"
              onClick={onLogin}
              className="flex-1 py-3 text-white font-semibold rounded-xl text-sm"
              style={{ background: "var(--color-primary)" }}
            >
              Se connecter
            </button>
          </div>
        </div>
      </div>

      <ResetPasswordIllustration />
    </div>
  );
}