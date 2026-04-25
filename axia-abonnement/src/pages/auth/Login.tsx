import { useAuth } from "../../hooks/useAuth";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import LogoAxia from "../../assets/logo-axia.svg";

interface LoginForm {
  email: string;
  password: string;
  remember: boolean;
}

type StatusBanner = {
  tone: "info" | "warning" | "error" | "success";
  title: string;
  message: string;
  action?: { label: string; onClick: () => void };
} | null;

export default function Login() {
  const { login } = useAuth();
  const [error, setError] = useState("");
  const [banner, setBanner] = useState<StatusBanner>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [form, setForm] = useState<LoginForm>({
    email: "",
    password: "",
    remember: false,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setBanner(null);
    try {
      const outcome = await login(form.email, form.password, form.remember);
      switch (outcome.kind) {
        case "success":
          if (outcome.role === "Admin") navigate("/dashboard/admin");
          else if (outcome.role === "Responsable")
            navigate("/dashboard/responsable");
          else navigate("/dashboard/client");
          break;
        case "pending":
          setBanner({
            tone: "info",
            title: "Demande en cours d'examen",
            message: outcome.message,
          });
          break;
        case "payment_required":
          setBanner({
            tone: "warning",
            title: "Paiement requis",
            message: outcome.message,
            action: {
              label: "Procéder au paiement (500 TND)",
              onClick: () =>
                navigate(
                  `/payment/responsable-account?userId=${outcome.userId}`,
                ),
            },
          });
          break;
        case "rejected":
          setBanner({
            tone: "error",
            title: "Demande refusée",
            message: outcome.message,
          });
          break;
        case "invalid":
        default:
          setError(outcome.message);
          break;
      }
    } finally {
      setLoading(false);
    }
  };

  const bannerStyles: Record<NonNullable<StatusBanner>["tone"], string> = {
    info: "bg-blue-50 border-blue-200 text-blue-800",
    warning: "bg-yellow-50 border-yellow-200 text-yellow-800",
    error: "bg-red-50 border-red-200 text-red-800",
    success: "bg-green-50 border-green-200 text-green-800",
  };

  return (
    <div className="min-h-screen flex">
      {/* ── Côté gauche : formulaire ── */}
      <div className="w-full lg:w-[55%] flex flex-col justify-center px-8 sm:px-16 py-12 bg-white">
        <div className="max-w-md w-full mx-auto">
          {/* Logo */}
          <div className="mb-6">
            <img src={LogoAxia} alt="AxiaAbonnement" className="h-14 mb-2" />
            <h1 className="text-3xl font-bold text-gray-900 leading-tight">
              Bienvenue.
            </h1>
            <h2 className="text-3xl font-bold text-gray-900">
              Connectez-vous à votre compte.
            </h2>
            <p className="text-gray-400 text-sm mt-3">
              Entrez vos identifiants pour continuer
            </p>
          </div>

          {/* Banner */}
          {banner && (
            <div
              className={`mb-5 p-4 rounded-xl border ${bannerStyles[banner.tone]}`}
            >
              <p className="font-semibold text-sm">{banner.title}</p>
              <p className="text-sm mt-1">{banner.message}</p>
              {banner.action && (
                <button
                  type="button"
                  onClick={banner.action.onClick}
                  className="mt-3 w-full py-2 text-white font-semibold rounded-lg text-sm"
                  style={{ background: "var(--color-primary)" }}
                >
                  {banner.action.label}
                </button>
              )}
            </div>
          )}

          {error && (
            <p className="text-red-500 text-sm text-center mb-4">{error}</p>
          )}

          {/* Formulaire */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email */}
            <div>
              <label className="block text-xs text-gray-400 mb-1 uppercase tracking-wide">
                Email
              </label>
              <div className="relative">
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="john.doe@gmail.com"
                  autoComplete="email"
                  required
                  className="w-full border-0 border-b-2 border-gray-200 focus:border-b-2 pb-2 text-sm text-gray-800 placeholder-gray-300 outline-none transition-colors bg-transparent"
                  style={{ "--tw-border-opacity": 1 } as React.CSSProperties}
                  onFocus={(e) =>
                    (e.target.style.borderBottomColor = "var(--color-primary)")
                  }
                  onBlur={(e) => (e.target.style.borderBottomColor = "#e5e7eb")}
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

            {/* Password */}
            <div>
              <label className="block text-xs text-gray-400 mb-1 uppercase tracking-wide">
                Mot de passe
              </label>
              <div className="relative">
                <input
                  type="password"
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="Start typing..."
                  autoComplete="current-password"
                  required
                  className="w-full border-0 border-b-2 border-gray-200 pb-2 text-sm text-gray-800 placeholder-gray-300 outline-none transition-colors bg-transparent"
                  onFocus={(e) =>
                    (e.target.style.borderBottomColor = "var(--color-primary)")
                  }
                  onBlur={(e) => (e.target.style.borderBottomColor = "#e5e7eb")}
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
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                  />
                </svg>
              </div>
            </div>

            {/* Remember + Forgot */}
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <div className="relative">
                  <input
                    type="checkbox"
                    name="remember"
                    checked={form.remember}
                    onChange={handleChange}
                    className="sr-only"
                  />
                  <div
                    className="w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors"
                    style={{
                      borderColor: form.remember
                        ? "var(--color-primary)"
                        : "#d1d5db",
                      background: form.remember
                        ? "var(--color-primary)"
                        : "white",
                    }}
                  >
                    {form.remember && (
                      <svg
                        className="w-3 h-3 text-white"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    )}
                  </div>
                </div>
                <span className="text-sm text-gray-600">
                  Se souvenir de moi
                </span>
              </label>

              <button
                type="button"
                onClick={() => navigate("/forgot-password")}
                className="text-sm font-medium transition-colors"
                style={{ color: "var(--color-primary)" }}
              >
                Récupérer le mot de passe
              </button>
            </div>

            {/* Boutons */}
            <div className="flex gap-3 pt-2">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 py-3 text-white font-semibold rounded-xl text-sm transition-colors disabled:opacity-50"
                style={{ background: "var(--color-primary)" }}
              >
                {loading ? "Connexion..." : "Se connecter"}
              </button>
              <button
                type="button"
                onClick={() => navigate("/register")}
                className="flex-1 py-3 font-semibold rounded-xl text-sm border-2 transition-colors bg-white"
                style={{
                  borderColor: "var(--color-primary)",
                  color: "var(--color-primary)",
                }}
              >
                S'inscrire
              </button>
            </div>
          </form>

          <p className="text-center mt-8">
            <button
              onClick={() => navigate("/")}
              className="text-sm text-gray-400 hover:text-gray-600 transition-colors"
            >
              ← Retour à l'accueil
            </button>
          </p>
        </div>
      </div>

      {/* ── Côté droit : fond bleu + illustration ── */}
      <div
        className="hidden lg:flex lg:w-[45%] flex-col items-center justify-center relative overflow-hidden"
        style={{ background: "var(--color-primary)" }}
      >
        {/* Cercles décoratifs */}
        <div
          className="absolute w-96 h-96 rounded-full opacity-10"
          style={{ background: "white", top: "-80px", right: "-80px" }}
        />
        <div
          className="absolute w-64 h-64 rounded-full opacity-10"
          style={{ background: "white", bottom: "-40px", left: "-40px" }}
        />

        {/* Illustration */}
        <img
          src="/src/assets/undraw_login_weas.svg"
          alt="Connexion"
          className="w-80 relative z-10"
        />
      </div>
    </div>
  );
}
