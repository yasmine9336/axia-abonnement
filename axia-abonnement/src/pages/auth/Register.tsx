import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from '../../context/AuthContext';

interface RegisterForm {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export default function Register() {
  const { register } = useAuth();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [form, setForm] = useState<RegisterForm>({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
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
    if (form.password !== form.confirmPassword) {
      setError('Les mots de passe ne correspondent pas.');
      return;
    }
    if (form.password.length < 8) {
      setError('Le mot de passe doit contenir au moins 8 caractères.');
      return;
    }
    if (!/[A-Z]/.test(form.password)) {
      setError('Le mot de passe doit contenir au moins une majuscule.');
      return;
    }
    if (!/[0-9]/.test(form.password)) {
      setError('Le mot de passe doit contenir au moins un chiffre.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await register(form.fullName, form.email, form.password);
      navigate('/login');
    } catch (err: any) {
      setError(err.response?.data || 'Erreur lors de l\'inscription');
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
          <h2 className="text-lg font-bold text-gray-900 mt-1">Créer un compte</h2>
          <p className="text-gray-500 text-sm mt-1">Commencez à gérer vos abonnements dès aujourd'hui</p>
        </div>

        <hr className="border-gray-100 mb-6" />

        {error && (
          <p className="text-red-500 text-sm text-center mb-4">{error}</p>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-800 mb-1">Nom complet</label>
            <input
              type="text"
              name="fullName"
              value={form.fullName}
              onChange={handleChange}
              placeholder="Jean Dupont"
              className="w-full bg-gray-100 rounded-xl px-4 py-3 text-sm text-gray-700 placeholder-gray-400 outline-none focus:ring-2 focus:ring-[#4F46E5]"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-800 mb-1">Email</label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="votre.email@exemple.com"
              autoComplete="off"
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
              placeholder="Créez un mot de passe"
              autoComplete="new-password"
              className="w-full bg-gray-100 rounded-xl px-4 py-3 text-sm text-gray-700 placeholder-gray-400 outline-none focus:ring-2 focus:ring-[#4F46E5]"
              required
            />
          </div>

          {form.password.length > 0 && (
            <div className="space-y-1 mt-2">
              <div className="flex gap-2">
                <div className={`h-1.5 flex-1 rounded-full transition-colors ${form.password.length > 0 ? "bg-[#C7C5F7]" : "bg-gray-200"}`} />
                <div className={`h-1.5 flex-1 rounded-full transition-colors ${/[A-Z]/.test(form.password) ? "bg-[#9B97F0]" : "bg-gray-200"}`} />
                <div className={`h-1.5 flex-1 rounded-full transition-colors ${/[A-Z]/.test(form.password) && /[0-9]/.test(form.password) ? "bg-[#6F6AE9]" : "bg-gray-200"}`} />
                <div className={`h-1.5 flex-1 rounded-full transition-colors ${/[A-Z]/.test(form.password) && /[0-9]/.test(form.password) && /[^a-zA-Z0-9]/.test(form.password) && form.password.length >= 8 ? "bg-[#4F46E5]" : "bg-gray-200"}`} />
              </div>
              <p className="text-xs text-gray-400">
                {!/[A-Z]/.test(form.password) && "Faible — ajoutez une majuscule"}
                {/[A-Z]/.test(form.password) && !/[0-9]/.test(form.password) && "Moyen — ajoutez un chiffre"}
                {/[A-Z]/.test(form.password) && /[0-9]/.test(form.password) && !/[^a-zA-Z0-9]/.test(form.password) && "Bon — ajoutez un symbole"}
                {/[A-Z]/.test(form.password) && /[0-9]/.test(form.password) && /[^a-zA-Z0-9]/.test(form.password) && form.password.length < 8 && "Presque — minimum 8 caractères"}
                {/[A-Z]/.test(form.password) && /[0-9]/.test(form.password) && /[^a-zA-Z0-9]/.test(form.password) && form.password.length >= 8 && "Excellent !"}
              </p>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-800 mb-1">Confirmer le mot de passe</label>
            <input
              type="password"
              name="confirmPassword"
              value={form.confirmPassword}
              onChange={handleChange}
              placeholder="Confirmez votre mot de passe"
              autoComplete="new-password"
              className="w-full bg-gray-100 rounded-xl px-4 py-3 text-sm text-gray-700 placeholder-gray-400 outline-none focus:ring-2 focus:ring-[#4F46E5]"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#4F46E5] hover:bg-[#3730A3] text-white font-semibold py-3.5 rounded-xl transition-colors mt-2 disabled:opacity-50"
          >
            {loading ? 'Inscription...' : 'Créer un compte'}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-6">
          Vous avez déjà un compte ?{" "}
          <button onClick={() => navigate("/login")} className="text-[#4F46E5] font-medium hover:underline">
            Se connecter
          </button>
        </p>

        <p className="text-center mt-4">
          <button onClick={() => navigate("/")} className="text-sm text-[#4F46E5] hover:underline">
            ← Retour à l'accueil
          </button>
        </p>
      </div>
    </div>
  );
}