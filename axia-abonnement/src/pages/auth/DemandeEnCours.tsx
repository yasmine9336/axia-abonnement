import { useLocation, useNavigate } from "react-router-dom";
import LogoAxia from "../../assets/logo-axia.svg";

export default function DemandeEnCours() {
  const navigate = useNavigate();
  const location = useLocation();
  const email = (location.state as { email?: string })?.email;

  return (
    <div className="min-h-screen flex">
      {/* Côté gauche */}
      <div className="w-full lg:w-[55%] flex flex-col justify-center px-8 sm:px-16 py-12 bg-white">
        <div className="max-w-md w-full mx-auto">
          <div className="mb-8">
            <img src={LogoAxia} alt="AxiaAbonnement" className="h-20 mb-4" />
            <h1 className="text-3xl font-bold text-gray-900">Demande envoyée.</h1>
            <h2 className="text-3xl font-bold text-gray-900">En cours d'examen.</h2>
            <p className="text-gray-400 text-sm mt-3">
              Votre demande est en cours d'examen par l'administrateur.
            </p>
          </div>

          <div className="space-y-4">
            {email && (
              <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                <svg className="w-4 h-4 text-gray-400 shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <div>
                  <p className="text-xs text-gray-400">Notification envoyée à</p>
                  <p className="text-sm font-semibold text-gray-800">{email}</p>
                </div>
              </div>
            )}

            <div className="p-4 rounded-xl border"
              style={{ background: "var(--color-primary-soft)", borderColor: "var(--color-primary-soft)" }}>
              <p className="text-sm font-medium" style={{ color: "var(--color-primary)" }}>
                Si votre demande est acceptée, un lien de paiement de <strong>500 TND</strong> vous sera envoyé pour activer votre compte.
              </p>
            </div>

            <button onClick={() => navigate("/")}
              className="w-full py-3 text-white font-semibold rounded-xl text-sm"
              style={{ background: "var(--color-primary)" }}>
              Retour à l'accueil
            </button>
          </div>
        </div>
      </div>

      {/* Côté droit */}
      <div className="hidden lg:flex lg:w-[45%] flex-col items-center justify-center relative overflow-hidden"
        style={{ background: "var(--color-primary)" }}>
        <div className="absolute w-96 h-96 rounded-full opacity-10" style={{ background: "white", top: "-80px", right: "-80px" }} />
        <div className="absolute w-64 h-64 rounded-full opacity-10" style={{ background: "white", bottom: "-40px", left: "-40px" }} />
        <img src="/src/assets/undraw_newsletter-subscriber_plsr.svg" alt="Demande en cours" className="w-72 relative z-10" />
      </div>
    </div>
  );
}