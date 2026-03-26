import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import axiosInstance from "../../api/axiosInstance";

export default function ResetPassword() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const userEmail = searchParams.get("email");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [resetComplete, setResetComplete] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (password.length < 8) {
      setError("Le mot de passe doit contenir au moins 8 caractères.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Les mots de passe ne correspondent pas.");
      return;
    }
    setLoading(true);
    try {
      await axiosInstance.post("/auth/reset-password", {
        email: userEmail,
        token,
        password,
      });
      setResetComplete(true);
    } catch (err) {
      const error = err as { response?: { data?: { title?: string } | string } };
      const apiError = error.response?.data;
      const errorMessage = typeof apiError === 'object' && apiError !== null && 'title' in apiError 
        ? (apiError.title || "Erreur lors de la réinitialisation.")
        : (typeof apiError === 'string' ? apiError : "Erreur lors de la réinitialisation.");
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Token manquant
  if (!token) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12">
        <div className="bg-white rounded-2xl border border-gray-200 w-full max-w-md p-8">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-[#4F46E5]">AxiaAbonnement</h1>
            <h2 className="text-lg font-bold text-gray-900 mt-1">Lien invalide</h2>
          </div>
          <hr className="border-gray-100 mb-6" />
          <div className="flex flex-col items-center py-4">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mb-4">
              <svg className="w-10 h-10 text-red-500" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
              </svg>
            </div>
            <p className="text-sm text-gray-500 text-center mb-6">
              Ce lien de réinitialisation est invalide ou a expiré.<br />
              Veuillez demander un nouveau lien.
            </p>
            <div className="flex gap-3 w-full">
              <button
                onClick={() => navigate("/forgot-password")}
                className="flex-1 border border-[#4F46E5] text-[#4F46E5] hover:bg-[#4F46E5] hover:text-white font-semibold py-3 rounded-xl transition-colors text-sm"
              >
                Demander un nouveau lien
              </button>
              <button
                onClick={() => navigate("/login")}
                className="flex-1 bg-[#4F46E5] hover:bg-[#3730A3] text-white font-semibold py-3 rounded-xl transition-colors text-sm"
              >
                Se connecter
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12">
      <div className="bg-white rounded-2xl border border-gray-200 w-full max-w-md p-8">

        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-[#4F46E5]">AxiaAbonnement</h1>
          <h2 className="text-lg font-bold text-gray-900 mt-1">
            {!resetComplete ? "Réinitialiser le mot de passe" : "Mot de passe réinitialisé !"}
          </h2>
          <p className="text-gray-500 text-sm mt-1">
            {!resetComplete ? "Créez un nouveau mot de passe sécurisé" : "Vous pouvez maintenant vous connecter"}
          </p>
        </div>

        <hr className="border-gray-100 mb-6" />

        {!resetComplete ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email affiché */}
            {userEmail && (
              <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                <svg className="w-5 h-5 text-[#4F46E5] shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <div>
                  <p className="text-xs text-gray-400">Réinitialisation pour :</p>
                  <p className="text-sm font-semibold text-gray-800">{userEmail}</p>
                </div>
              </div>
            )}

            {/* Info box */}
            <div className="flex items-center gap-3 p-4 bg-blue-50 border border-blue-100 rounded-xl">
              <svg className="w-5 h-5 text-[#4F46E5] shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
              </svg>
              <p className="text-sm text-blue-800">
                Votre mot de passe doit contenir au moins 8 caractères
              </p>
            </div>

            {error && (
              <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-100 rounded-xl">
                <svg className="w-5 h-5 text-red-500 shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                </svg>
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-800 mb-1">Nouveau mot de passe</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Entrez votre nouveau mot de passe"
                className="w-full bg-gray-100 rounded-xl px-4 py-3 text-sm text-gray-700 placeholder-gray-400 outline-none focus:ring-2 focus:ring-[#4F46E5]"
                required
                minLength={8}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-800 mb-1">Confirmer le mot de passe</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirmez votre nouveau mot de passe"
                className="w-full bg-gray-100 rounded-xl px-4 py-3 text-sm text-gray-700 placeholder-gray-400 outline-none focus:ring-2 focus:ring-[#4F46E5]"
                required
                minLength={8}
              />
            </div>

            {/* Password strength */}
            {password.length > 0 && (
                <div className="space-y-1">
                    <div className="flex gap-2">
                        <div className={`h-1.5 flex-1 rounded-full transition-colors ${password.length > 0 ? "bg-[#C7C5F7]" : "bg-gray-200"}`} />
                        <div className={`h-1.5 flex-1 rounded-full transition-colors ${/[A-Z]/.test(password) ? "bg-[#9B97F0]" : "bg-gray-200"}`} />
                        <div className={`h-1.5 flex-1 rounded-full transition-colors ${/[A-Z]/.test(password) && /[0-9]/.test(password) ? "bg-[#6F6AE9]" : "bg-gray-200"}`} />
                        <div className={`h-1.5 flex-1 rounded-full transition-colors ${/[A-Z]/.test(password) && /[0-9]/.test(password) && /[^a-zA-Z0-9]/.test(password) && password.length >= 8 ? "bg-[#4F46E5]" : "bg-gray-200"}`} />
                    </div>
                    <p className="text-xs text-gray-400">
                        {!/[A-Z]/.test(password) && "Faible — ajoutez une majuscule"}
                        {/[A-Z]/.test(password) && !/[0-9]/.test(password) && "Moyen — ajoutez un chiffre"}
                        {/[A-Z]/.test(password) && /[0-9]/.test(password) && !/[^a-zA-Z0-9]/.test(password) && "Bon — ajoutez un symbole"}
                        {/[A-Z]/.test(password) && /[0-9]/.test(password) && /[^a-zA-Z0-9]/.test(password) && password.length < 8 && "Presque — minimum 8 caractères"}
                        {/[A-Z]/.test(password) && /[0-9]/.test(password) && /[^a-zA-Z0-9]/.test(password) && password.length >= 8 && "Excellent !"}
                    </p>
                </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#4F46E5] hover:bg-[#3730A3] text-white font-semibold py-3.5 rounded-xl transition-colors mt-2 disabled:opacity-50"
            >
              {loading ? "Réinitialisation..." : "Réinitialiser le mot de passe"}
            </button>

            <p className="text-center">
              <button type="button" onClick={() => navigate("/login")} className="text-sm text-gray-500 hover:text-[#4F46E5]">
                Retour à la connexion
              </button>
            </p>
          </form>
        ) : (
          <div className="space-y-4">
            <div className="flex flex-col items-center py-4">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <svg className="w-10 h-10 text-green-500" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-1">Succès !</h3>
              <p className="text-sm text-gray-500 text-center">
                Votre mot de passe a été réinitialisé avec succès.<br />
                Vous pouvez maintenant vous connecter.
              </p>
            </div>

            <div className="bg-gray-50 rounded-xl p-4">
              <p className="text-sm text-gray-500">
                <span className="font-semibold text-gray-700">Conseil de sécurité :</span><br />
                Utilisez un mot de passe unique que vous n'utilisez nulle part ailleurs.
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => navigate("/login")}
                className="flex-1 bg-[#4F46E5] hover:bg-[#3730A3] text-white font-semibold py-3 rounded-xl transition-colors text-sm"
              >
                Se connecter maintenant
              </button>
              <button
                onClick={() => navigate("/")}
                className="flex-1 border border-[#4F46E5] text-[#4F46E5] hover:bg-[#4F46E5] hover:text-white font-semibold py-3 rounded-xl transition-colors text-sm"
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