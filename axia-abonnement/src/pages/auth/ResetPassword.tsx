import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import axiosInstance from "../../api/axiosInstance";
import LogoAxia from "../../assets/logo-axia.svg";

export default function ResetPassword() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const rawToken = searchParams.get("token") ?? "";
  const token = rawToken.replace(/ /g, "+");
  const userEmail = searchParams.get("email");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [resetComplete, setResetComplete] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (password.length < 8) { setError("Le mot de passe doit contenir au moins 8 caractères."); return; }
    if (password !== confirmPassword) { setError("Les mots de passe ne correspondent pas."); return; }
    setLoading(true);
    try {
      await axiosInstance.post("/auth/reset-password", {
        email: userEmail, token, password, confirmPassword: password,
      });
      setResetComplete(true);
    } catch (err) {
      const error = err as { response?: { data?: { title?: string } | string } };
      const apiError = error.response?.data;
      setError(
        typeof apiError === "object" && apiError !== null && "title" in apiError
          ? apiError.title || "Erreur lors de la réinitialisation."
          : typeof apiError === "string" ? apiError : "Erreur lors de la réinitialisation."
      );
    } finally {
      setLoading(false);
    }
  };

  const focusStyle = (e: React.FocusEvent<HTMLInputElement>) =>
    (e.target.style.borderBottomColor = "var(--color-primary)");
  const blurStyle = (e: React.FocusEvent<HTMLInputElement>) =>
    (e.target.style.borderBottomColor = "#e5e7eb");

  const inputClass = "w-full border-0 border-b-2 border-gray-200 pb-2 text-sm text-gray-800 placeholder-gray-300 outline-none transition-colors bg-transparent";

  if (!token) {
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
              <button onClick={() => navigate("/forgot-password")}
                className="flex-1 py-3 font-semibold rounded-xl text-sm border-2"
                style={{ borderColor: "var(--color-primary)", color: "var(--color-primary)" }}>
                Nouveau lien
              </button>
              <button onClick={() => navigate("/login")}
                className="flex-1 py-3 text-white font-semibold rounded-xl text-sm"
                style={{ background: "var(--color-primary)" }}>
                Se connecter
              </button>
            </div>
          </div>
        </div>
        <div className="hidden lg:flex lg:w-[45%] flex-col items-center justify-center relative overflow-hidden"
          style={{ background: "var(--color-primary)" }}>
          <div className="absolute w-96 h-96 rounded-full opacity-10" style={{ background: "white", top: "-80px", right: "-80px" }} />
          <div className="absolute w-64 h-64 rounded-full opacity-10" style={{ background: "white", bottom: "-40px", left: "-40px" }} />
          <img src="/src/assets/undraw_forgot-password_nttj.svg" alt="" className="w-72 relative z-10" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex">
      {/* Côté gauche */}
      <div className="w-full lg:w-[55%] flex flex-col justify-center px-8 sm:px-16 py-12 bg-white overflow-y-auto">
        <div className="max-w-md w-full mx-auto">
          <div className="mb-8">
            <img src={LogoAxia} alt="AxiaAbonnement" className="h-20 mb-4" />
            {!resetComplete ? (
              <>
                <h1 className="text-3xl font-bold text-gray-900">Nouveau mot de passe.</h1>
                <h2 className="text-3xl font-bold text-gray-900">Créez-en un sécurisé.</h2>
                <p className="text-gray-400 text-sm mt-3">Minimum 8 caractères avec majuscule et chiffre</p>
              </>
            ) : (
              <>
                <h1 className="text-3xl font-bold text-gray-900">Mot de passe</h1>
                <h2 className="text-3xl font-bold text-gray-900">réinitialisé !</h2>
                <p className="text-gray-400 text-sm mt-3">Vous pouvez maintenant vous connecter.</p>
              </>
            )}
          </div>

          {!resetComplete ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              {userEmail && (
                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                  <svg className="w-4 h-4 text-gray-400 shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <p className="text-sm text-gray-700 font-medium">{userEmail}</p>
                </div>
              )}

              {error && (
                <p className="text-sm text-red-600 bg-red-50 px-4 py-3 rounded-xl">{error}</p>
              )}

              <div>
                <label className="block text-xs text-gray-400 mb-1 uppercase tracking-wide">Nouveau mot de passe</label>
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                  placeholder="Start typing..." required minLength={8}
                  className={inputClass} onFocus={focusStyle} onBlur={blurStyle} />
              </div>

              <div>
                <label className="block text-xs text-gray-400 mb-1 uppercase tracking-wide">Confirmer le mot de passe</label>
                <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Start typing..." required minLength={8}
                  className={inputClass} onFocus={focusStyle} onBlur={blurStyle} />
              </div>

              {/* Indicateur force */}
              {password.length > 0 && (
                <div className="space-y-1">
                  <div className="flex gap-2">
                    <div className={`h-1 flex-1 rounded-full ${password.length > 0 ? "bg-blue-200" : "bg-gray-200"}`} />
                    <div className={`h-1 flex-1 rounded-full ${/[A-Z]/.test(password) ? "bg-blue-400" : "bg-gray-200"}`} />
                    <div className={`h-1 flex-1 rounded-full ${/[A-Z]/.test(password) && /[0-9]/.test(password) ? "bg-blue-500" : "bg-gray-200"}`} />
                    <div className={`h-1 flex-1 rounded-full ${/[A-Z]/.test(password) && /[0-9]/.test(password) && /[^a-zA-Z0-9]/.test(password) && password.length >= 8 ? "bg-blue-700" : "bg-gray-200"}`}
                      style={{ background: /[A-Z]/.test(password) && /[0-9]/.test(password) && /[^a-zA-Z0-9]/.test(password) && password.length >= 8 ? "var(--color-primary)" : undefined }} />
                  </div>
                </div>
              )}

              <button type="submit" disabled={loading}
                className="w-full py-3 text-white font-semibold rounded-xl text-sm disabled:opacity-50"
                style={{ background: "var(--color-primary)" }}>
                {loading ? "Réinitialisation..." : "Réinitialiser le mot de passe"}
              </button>

              <p className="text-center">
                <button type="button" onClick={() => navigate("/login")}
                  className="text-sm text-gray-400 hover:text-gray-600">
                  ← Retour à la connexion
                </button>
              </p>
            </form>
          ) : (
            <div className="space-y-5">
              <div className="p-4 bg-green-50 border border-green-100 rounded-xl">
                <p className="text-sm text-green-700 font-medium">✓ Mot de passe modifié avec succès</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-xl">
                <p className="text-sm text-gray-500">
                  <span className="font-semibold text-gray-700">Conseil :</span> Utilisez un mot de passe unique que vous n'utilisez nulle part ailleurs.
                </p>
              </div>
              <div className="flex gap-3">
                <button onClick={() => navigate("/login")}
                  className="flex-1 py-3 text-white font-semibold rounded-xl text-sm"
                  style={{ background: "var(--color-primary)" }}>
                  Se connecter
                </button>
                <button onClick={() => navigate("/")}
                  className="flex-1 py-3 font-semibold rounded-xl text-sm border-2"
                  style={{ borderColor: "var(--color-primary)", color: "var(--color-primary)" }}>
                  Accueil
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Côté droit */}
      <div className="hidden lg:flex lg:w-[45%] flex-col items-center justify-center relative overflow-hidden"
        style={{ background: "var(--color-primary)" }}>
        <div className="absolute w-96 h-96 rounded-full opacity-10" style={{ background: "white", top: "-80px", right: "-80px" }} />
        <div className="absolute w-64 h-64 rounded-full opacity-10" style={{ background: "white", bottom: "-40px", left: "-40px" }} />
        <img src="/src/assets/undraw_forgot-password_nttj.svg" alt="Reset password" className="w-72 relative z-10" />
      </div>
    </div>
  );
}