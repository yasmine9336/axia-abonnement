import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../api/axiosInstance";

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
        clientUri: "http://localhost:5173/reset-password",
      });
      setCooldown(60);
      const interval = setInterval(() => {
        setCooldown(prev => {
          if (prev <= 1) { clearInterval(interval); return 0; }
          return prev - 1;
        });
      }, 1000);
    } catch {
      setError("Erreur lors du renvoi");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12">
      <div className="bg-white rounded-2xl border border-gray-200 w-full max-w-md p-8">

        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-[#4F46E5]">AxiaAbonnement</h1>
          <h2 className="text-lg font-bold text-gray-900 mt-1">Mot de passe oublié ?</h2>
          <p className="text-gray-500 text-sm mt-1">
            {!submitted
              ? "Entrez votre adresse email et nous vous enverrons un lien pour réinitialiser votre mot de passe"
              : "Vérifiez votre boîte de réception"}
          </p>
        </div>

        <hr className="border-gray-100 mb-6" />

        {!submitted ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Info box */}
            <div className="flex items-center gap-3 p-4 bg-blue-50 border border-blue-100 rounded-xl">
              <svg className="w-5 h-5 text-[#4F46E5] shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <p className="text-sm text-blue-800">
                Nous vous enverrons des instructions pour réinitialiser votre mot de passe
              </p>
            </div>

            {error && <p className="text-red-500 text-sm text-center">{error}</p>}

            <div>
              <label className="block text-sm font-medium text-gray-800 mb-1">Adresse email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="votre.email@exemple.com"
                className="w-full bg-gray-100 rounded-xl px-4 py-3 text-sm text-gray-700 placeholder-gray-400 outline-none focus:ring-2 focus:ring-[#4F46E5]"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#4F46E5] hover:bg-[#3730A3] text-white font-semibold py-3.5 rounded-xl transition-colors mt-2 disabled:opacity-50"
            >
              {loading ? "Envoi en cours..." : "Envoyer le lien de réinitialisation"}
            </button>

            <p className="text-center">
              <button type="button" onClick={() => navigate("/login")} className="text-sm text-gray-500 hover:text-[#4F46E5] inline-flex items-center gap-1">
                ← Retour à la connexion
              </button>
            </p>
          </form>
        ) : (
          <div className="space-y-4">
            {/* Success icon */}
            <div className="flex flex-col items-center py-4">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <svg className="w-10 h-10 text-green-500" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-1">Email envoyé !</h3>
              <p className="text-sm text-gray-500 text-center">Nous avons envoyé un lien de réinitialisation à :</p>
              <p className="font-semibold text-gray-900 mt-1 break-all">{email}</p>
            </div>

            {error && <p className="text-red-500 text-sm text-center">{error}</p>}

            {/* Resend */}
            <div className="bg-gray-50 rounded-xl p-4 space-y-3">
              <p className="text-sm text-gray-600">
                <span className="font-semibold">Vous n'avez pas reçu l'email ?</span><br />
                Vérifiez votre dossier spam ou cliquez ci-dessous pour renvoyer.
              </p>
              <button
                onClick={handleResend}
                disabled={cooldown > 0}
                className="text-[#4F46E5] font-semibold hover:underline disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {cooldown > 0 ? `Renvoyer dans ${cooldown}s` : "Renvoyer l'email"}
              </button>
            </div>

            {/* Buttons */}
            <div className="flex gap-3">
              <button
                onClick={() => navigate("/login")}
                className="flex-1 border border-[#4F46E5] text-[#4F46E5] hover:bg-[#4F46E5] hover:text-white font-semibold py-3 rounded-xl transition-colors text-sm"
              >
                Retour à la connexion
              </button>
              <button
                onClick={() => navigate("/")}
                className="flex-1 bg-[#4F46E5] hover:bg-[#3730A3] text-white font-semibold py-3 rounded-xl transition-colors text-sm"
              >
                Retour à l'accueil
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}