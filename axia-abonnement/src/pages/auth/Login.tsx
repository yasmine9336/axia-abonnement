import { useAuth } from '../../context/AuthContext';
import { useState } from "react";
import { useNavigate } from "react-router-dom";

interface LoginForm {
  email: string;
  password: string;
  remember: boolean;
}

export default function Login() {
  const { login } = useAuth();
  const [error, setError] = useState('');
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
    setError('');
    try {
      const role = await login(form.email, form.password, form.remember);
      if (role === 'Admin') navigate('/dashboard/admin');
      else if (role === 'Responsable') navigate('/dashboard/responsable');
      else navigate('/dashboard/client');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Email ou mot de passe incorrect');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12">
      <div className="bg-white rounded-2xl border border-gray-200 w-full max-w-md p-8">

        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-[#4F46E5]">AxiaAbonnement</h1>
          <h2 className="text-lg font-bold text-gray-900 mt-1">Bienvenue</h2>
          <p className="text-gray-500 text-sm mt-1">Connectez-vous à votre compte pour continuer</p>
        </div>

        <hr className="border-gray-100 mb-6" />
        {error && (
          <p className="text-red-500 text-sm text-center mb-4">{error}</p>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-800 mb-1">Email</label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="votre.email@exemple.com"
              autoComplete='email'
              className="w-full bg-gray-100 rounded-xl px-4 py-3 text-sm text-gray-700 placeholder-gray-400 outline-none focus:ring-2 focus:ring-[#4F46E5]"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-800 mb-1">Mot de passe</label>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder="Entrez votre mot de passe"
              autoComplete='current-password'
              className="w-full bg-gray-100 rounded-xl px-4 py-3 text-sm text-gray-700 placeholder-gray-400 outline-none focus:ring-2 focus:ring-[#4F46E5]"
              required
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="remember"
                name="remember"
                checked={form.remember}
                onChange={handleChange}
                className="accent-[#4F46E5]"
              />
              <label htmlFor="remember" className="text-sm text-gray-600">Se souvenir de moi</label>
            </div>
            <button type="button" onClick={() => navigate("/forgot-password")} className="text-sm text-[#4F46E5] hover:underline">
              Mot de passe oublié ?
            </button>
          </div>

          <button
          type="submit"
          disabled={loading}
          className="w-full bg-[#4F46E5] hover:bg-[#3730A3] text-white font-semibold py-3.5 rounded-xl transition-colors mt-2 disabled:opacity-50"
          >
            {loading ? 'Connexion...' : 'Se connecter'}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-6">
          Vous n'avez pas de compte ?{" "}
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