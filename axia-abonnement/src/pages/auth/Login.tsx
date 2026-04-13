import { useAuth } from '../../context/AuthContext';
import { useState } from "react";
import { useNavigate } from "react-router-dom";

interface LoginForm {
  email: string;
  password: string;
  remember: boolean;
}

type StatusBanner = {
  tone: 'info' | 'warning' | 'error' | 'success';
  title: string;
  message: string;
  action?: { label: string; onClick: () => void };
} | null;

export default function Login() {
  const { login } = useAuth();
  const [error, setError] = useState('');
  const [banner, setBanner] = useState<StatusBanner>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [form, setForm] = useState<LoginForm>({ email: "", password: "", remember: false });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setBanner(null);
    try {
      const outcome = await login(form.email, form.password, form.remember);

      switch (outcome.kind) {
        case 'success':
          if (outcome.role === 'Admin') navigate('/dashboard/admin');
          else if (outcome.role === 'Responsable') navigate('/dashboard/responsable');
          else navigate('/dashboard/client');
          break;

        case 'pending':
          setBanner({
            tone: 'info',
            title: "Demande en cours d'examen",
            message: outcome.message,
          });
          break;

        case 'payment_required':
          setBanner({
            tone: 'warning',
            title: 'Paiement requis',
            message: outcome.message,
            action: {
              label: 'Procéder au paiement (500 TND)',
              onClick: () => navigate(`/payment/responsable-account?userId=${outcome.userId}`),
            },
          });
          break;

        case 'rejected':
          setBanner({
            tone: 'error',
            title: 'Demande refusée',
            message: outcome.message,
          });
          break;

        case 'invalid':
        default:
          setError(outcome.message);
          break;
      }
    } finally {
      setLoading(false);
    }
  };

  const bannerStyles: Record<NonNullable<StatusBanner>['tone'], string> = {
    info: 'bg-indigo-50 border-indigo-200 text-indigo-800',
    warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
    error: 'bg-red-50 border-red-200 text-red-800',
    success: 'bg-green-50 border-green-200 text-green-800',
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12">
      <div className="bg-white rounded-2xl border border-gray-200 w-full max-w-md p-8">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-[#4F46E5]">AxiaAbonnement</h1>
          <h2 className="text-lg font-bold text-gray-900 mt-1">Bienvenue</h2>
          <p className="text-gray-500 text-sm mt-1">Connectez-vous à votre compte pour continuer</p>
        </div>

        <hr className="border-gray-100 mb-6" />

        {banner && (
          <div className={`mb-4 p-4 rounded-xl border ${bannerStyles[banner.tone]}`}>
            <p className="font-semibold text-sm">{banner.title}</p>
            <p className="text-sm mt-1">{banner.message}</p>
            {banner.action && (
              <button
                type="button"
                onClick={banner.action.onClick}
                className="mt-3 w-full py-2 bg-[#4F46E5] hover:bg-[#3730A3] text-white font-semibold rounded-lg text-sm"
              >
                {banner.action.label}
              </button>
            )}
          </div>
        )}

        {error && <p className="text-red-500 text-sm text-center mb-4">{error}</p>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-800 mb-1">Email</label>
            <input type="email" name="email" value={form.email} onChange={handleChange}
              placeholder="votre.email@exemple.com" autoComplete='email'
              className="w-full bg-gray-100 rounded-xl px-4 py-3 text-sm text-gray-700 placeholder-gray-400 outline-none focus:ring-2 focus:ring-[#4F46E5]" required />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-800 mb-1">Mot de passe</label>
            <input type="password" name="password" value={form.password} onChange={handleChange}
              placeholder="Entrez votre mot de passe" autoComplete='current-password'
              className="w-full bg-gray-100 rounded-xl px-4 py-3 text-sm text-gray-700 placeholder-gray-400 outline-none focus:ring-2 focus:ring-[#4F46E5]" required />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <input type="checkbox" id="remember" name="remember" checked={form.remember}
                onChange={handleChange} className="accent-[#4F46E5]" />
              <label htmlFor="remember" className="text-sm text-gray-600">Se souvenir de moi</label>
            </div>
            <button type="button" onClick={() => navigate("/forgot-password")}
              className="text-sm text-[#4F46E5] hover:underline">
              Mot de passe oublié ?
            </button>
          </div>

          <button type="submit" disabled={loading}
            className="w-full bg-[#4F46E5] hover:bg-[#3730A3] text-white font-semibold py-3.5 rounded-xl transition-colors mt-2 disabled:opacity-50">
            {loading ? 'Connexion...' : 'Se connecter'}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-6">
          Vous n'avez pas de compte ?{' '}
          <button onClick={() => navigate("/register")} className="text-[#4F46E5] font-medium hover:underline">
            S'inscrire
          </button>
        </p>

        <hr className="border-gray-100 my-6" />
        <p className="text-center mt-6">
          <button onClick={() => navigate("/")} className="text-sm text-[#4F46E5] hover:underline">
            ← Retour à l'accueil
          </button>
        </p>
      </div>
    </div>
  );
}
