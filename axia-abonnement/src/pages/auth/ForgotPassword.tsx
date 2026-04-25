import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../api/axiosInstance";
import LogoAxia from "../../assets/logo-axia.svg";

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [cooldown, setCooldown] = useState(0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await axiosInstance.post("/auth/forgot-password", {
        email,
        clientUri: `${import.meta.env.VITE_APP_URL}/reset-password`,
      });
      setSubmitted(true);
    } catch (err) {
      const error = err as { response?: { data?: string } };
      setError(error.response?.data || "Une erreur est survenue.");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (cooldown > 0) return;
    setError("");
    try {
      await axiosInstance.post("/auth/forgot-password", {
        email,
        clientUri: `${import.meta.env.VITE_APP_URL}/reset-password`,
      });
      setCooldown(60);
      const interval = setInterval(() => {
        setCooldown((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch {
      setError("Erreur lors du renvoi");
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* ── Côté gauche ── */}
      <div className="w-full lg:w-[55%] flex flex-col justify-center px-8 sm:px-16 py-12 bg-white">
        <div className="max-w-md w-full mx-auto">
          <div className="mb-6">
            <img src={LogoAxia} alt="AxiaAbonnement" className="h-14 mb-2" />
            {!submitted ? (
              <>
                <h1 className="text-3xl font-bold text-gray-900">
                  Mot de passe oublié ?
                </h1>
                <h2 className="text-3xl font-bold text-gray-900">
                  Entrez vos informations.
                </h2>
                <p className="text-gray-400 text-sm mt-3">
                  Entrez votre email pour recevoir un lien de réinitialisation
                </p>
              </>
            ) : (
              <>
                <h1 className="text-3xl font-bold text-gray-900">
                  Email envoyé !
                </h1>
                <h2 className="text-3xl font-bold text-gray-900">
                  Vérifiez votre boîte.
                </h2>
                <p className="text-gray-400 text-sm mt-3">
                  Un lien de réinitialisation a été envoyé à{" "}
                  <strong>{email}</strong>
                </p>
              </>
            )}
          </div>

          {!submitted ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && <p className="text-red-500 text-sm">{error}</p>}

              <div>
                <label className="block text-xs text-gray-400 mb-1 uppercase tracking-wide">
                  Email
                </label>
                <div className="relative">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="votre.email@exemple.com"
                    required
                    className="w-full border-0 border-b-2 border-gray-200 pb-2 text-sm text-gray-800 placeholder-gray-300 outline-none transition-colors bg-transparent"
                    onFocus={(e) =>
                      (e.target.style.borderBottomColor =
                        "var(--color-primary)")
                    }
                    onBlur={(e) =>
                      (e.target.style.borderBottomColor = "#e5e7eb")
                    }
                  />
                  <svg
                    className="absolute right-0 bottom-2 w-4 h-4 text-gray-300"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                  </svg>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 text-white font-semibold rounded-xl text-sm disabled:opacity-50"
                style={{ background: "var(--color-primary)" }}
              >
                {loading ? "Envoi en cours..." : "Envoyer le lien"}
              </button>

              <p className="text-center">
                <button
                  type="button"
                  onClick={() => navigate("/login")}
                  className="text-sm text-gray-400 hover:text-gray-600"
                >
                  ← Retour à la connexion
                </button>
              </p>
            </form>
          ) : (
            <div className="space-y-5">
              {error && <p className="text-red-500 text-sm">{error}</p>}

              <div className="p-4 bg-gray-50 rounded-xl">
                <p className="text-sm text-gray-600 mb-2">
                  Vous n'avez pas reçu l'email ?
                </p>
                <button
                  onClick={handleResend}
                  disabled={cooldown > 0}
                  className="text-sm font-semibold disabled:opacity-50"
                  style={{ color: "var(--color-primary)" }}
                >
                  {cooldown > 0
                    ? `Renvoyer dans ${cooldown}s`
                    : "Renvoyer l'email"}
                </button>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => navigate("/login")}
                  className="flex-1 py-3 font-semibold rounded-xl text-sm border-2"
                  style={{
                    borderColor: "var(--color-primary)",
                    color: "var(--color-primary)",
                  }}
                >
                  Retour à la connexion
                </button>
                <button
                  onClick={() => navigate("/")}
                  className="flex-1 py-3 text-white font-semibold rounded-xl text-sm"
                  style={{ background: "var(--color-primary)" }}
                >
                  Retour à l'accueil
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Côté droit : fond bleu + illustration ── */}
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
          src="/src/assets/undraw_forgot-password_nttj.svg"
          alt="Mot de passe oublié"
          className="w-72 relative z-10"
        />
      </div>
    </div>
  );
}
