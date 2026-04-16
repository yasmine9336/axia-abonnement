import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/useAuth";

type Role = "Client" | "Responsable";

interface RegisterForm {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
  role: Role;
  phoneNumber: string;
  nomEntreprise: string;
  matriculeFiscal: string;
  secteurActivite: string;
  adresseProfessionnelle: string;
}

const INITIAL_FORM: RegisterForm = {
  fullName: "",
  email: "",
  password: "",
  confirmPassword: "",
  role: "Client",
  phoneNumber: "",
  nomEntreprise: "",
  matriculeFiscal: "",
  secteurActivite: "",
  adresseProfessionnelle: "",
};

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState<RegisterForm>(INITIAL_FORM);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<1 | 2>(1);

  const isResponsable = form.role === "Responsable";

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const selectRole = (role: Role) => {
    setForm((prev) => ({ ...prev, role }));
    setError("");
    setStep(1);
  };

  const validatePasswordRules = (): string | null => {
    if (form.password !== form.confirmPassword) return "Les mots de passe ne correspondent pas.";
    if (form.password.length < 8) return "Le mot de passe doit contenir au moins 8 caractères.";
    if (!/[A-Z]/.test(form.password)) return "Le mot de passe doit contenir au moins une majuscule.";
    if (!/[0-9]/.test(form.password)) return "Le mot de passe doit contenir au moins un chiffre.";
    return null;
  };

  const validateStep1 = (): string | null => {
    if (!form.fullName.trim()) return "Le nom complet est requis.";
    if (!form.email.trim()) return "L'email est requis.";
    return validatePasswordRules();
  };

  const validateStep2 = (): string | null => {
    if (!isResponsable) return null;
    if (!form.nomEntreprise.trim()) return "Le nom de l'entreprise est requis.";
    if (!form.matriculeFiscal.trim()) return "Le matricule fiscal est requis.";
    if (!form.secteurActivite.trim()) return "Le secteur d'activité est requis.";
    if (!form.adresseProfessionnelle.trim()) return "L'adresse professionnelle est requise.";
    return null;
  };

  const goNext = () => {
    const e1 = validateStep1();
    if (e1) {
      setError(e1);
      return;
    }
    setError("");
    setStep(2);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Responsable = 2 étapes
    if (isResponsable && step === 1) {
      goNext();
      return;
    }

    // Validation finale
    const validationError = isResponsable ? validateStep2() : validateStep1();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    setError("");

    try {
      const result = await register({
        username: form.fullName,
        email: form.email,
        password: form.password,
        role: form.role,
        phoneNumber: form.phoneNumber || undefined,
        nomEntreprise: isResponsable ? form.nomEntreprise : undefined,
        matriculeFiscal: isResponsable ? form.matriculeFiscal : undefined,
        secteurActivite: isResponsable ? form.secteurActivite : undefined,
        adresseProfessionnelle: isResponsable ? form.adresseProfessionnelle : undefined,
      });

      if (result.role === "Responsable") {
        navigate("/register/demande-en-cours", { state: { email: form.email } });
      } else {
        navigate("/login");
      }
    } catch (err) {
      const error = err as { response?: { data?: { message?: string } | string } };
      const data = error.response?.data;
      const message =
        typeof data === "string" ? data : data?.message || "Erreur lors de l'inscription";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12">
      <div className="bg-white rounded-2xl border border-gray-200 w-full max-w-md p-8">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-[#4F46E5]">AxiaAbonnement</h1>
          <h2 className="text-lg font-bold text-gray-900 mt-1">Créer un compte</h2>
          <p className="text-gray-500 text-sm mt-1">
            Commencez à gérer vos abonnements dès aujourd'hui
          </p>
        </div>

        {/* Switch */}
        <div className="grid grid-cols-2 gap-2 bg-gray-100 p-1 rounded-xl mb-4">
          <button
            type="button"
            onClick={() => selectRole("Client")}
            className={`py-2.5 rounded-lg text-sm font-semibold transition-colors ${
              form.role === "Client"
                ? "bg-white text-[#4F46E5] shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Je suis Client
          </button>
          <button
            type="button"
            onClick={() => selectRole("Responsable")}
            className={`py-2.5 rounded-lg text-sm font-semibold transition-colors ${
              form.role === "Responsable"
                ? "bg-white text-[#4F46E5] shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Je suis Responsable
          </button>
        </div>

        {/* Progress Responsable */}
        {isResponsable && (
          <>
            <div className="mb-3">
              <div className="flex gap-2">
                <div className={`h-1.5 flex-1 rounded-full ${step >= 1 ? "bg-[#4F46E5]" : "bg-gray-200"}`} />
                <div className={`h-1.5 flex-1 rounded-full ${step >= 2 ? "bg-[#4F46E5]" : "bg-gray-200"}`} />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Étape {step}/2 • {step === 1 ? "Informations personnelles" : "Informations entreprise"}
              </p>
            </div>

            <div className="mb-5 p-3 bg-indigo-50 border border-indigo-100 rounded-xl text-xs text-indigo-700">
              Après validation admin, un paiement de <strong>500 TND</strong> sera demandé
              pour activer votre compte.
            </div>
          </>
        )}

        {error && <p className="text-red-500 text-sm text-center mb-4">{error}</p>}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* ÉTAPE 1 : perso + sécurité */}
          {(step === 1 || !isResponsable) && (
            <>
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
                <label className="block text-sm font-medium text-gray-800 mb-1">
                  Téléphone {!isResponsable && <span className="text-gray-400 font-normal">(optionnel)</span>}
                </label>
                <input
                  type="tel"
                  name="phoneNumber"
                  value={form.phoneNumber}
                  onChange={handleChange}
                  placeholder="ex: 20123456"
                  className="w-full bg-gray-100 rounded-xl px-4 py-3 text-sm text-gray-700 placeholder-gray-400 outline-none focus:ring-2 focus:ring-[#4F46E5]"
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
                    <div className={`h-1.5 flex-1 rounded-full ${form.password.length > 0 ? "bg-[#C7C5F7]" : "bg-gray-200"}`} />
                    <div className={`h-1.5 flex-1 rounded-full ${/[A-Z]/.test(form.password) ? "bg-[#9B97F0]" : "bg-gray-200"}`} />
                    <div className={`h-1.5 flex-1 rounded-full ${/[A-Z]/.test(form.password) && /[0-9]/.test(form.password) ? "bg-[#6F6AE9]" : "bg-gray-200"}`} />
                    <div className={`h-1.5 flex-1 rounded-full ${/[A-Z]/.test(form.password) && /[0-9]/.test(form.password) && /[^a-zA-Z0-9]/.test(form.password) && form.password.length >= 8 ? "bg-[#4F46E5]" : "bg-gray-200"}`} />
                  </div>
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
            </>
          )}

          {/* ÉTAPE 2 : entreprise */}
          {isResponsable && step === 2 && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-800 mb-1">Nom de l'entreprise</label>
                <input
                  type="text"
                  name="nomEntreprise"
                  value={form.nomEntreprise}
                  onChange={handleChange}
                  placeholder="Ex: Axia SARL"
                  className="w-full bg-gray-100 rounded-xl px-4 py-3 text-sm text-gray-700 placeholder-gray-400 outline-none focus:ring-2 focus:ring-[#4F46E5]"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-800 mb-1">Matricule fiscal</label>
                <input
                  type="text"
                  name="matriculeFiscal"
                  value={form.matriculeFiscal}
                  onChange={handleChange}
                  placeholder="Ex: 1234567/A/M/000"
                  className="w-full bg-gray-100 rounded-xl px-4 py-3 text-sm text-gray-700 placeholder-gray-400 outline-none focus:ring-2 focus:ring-[#4F46E5]"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-800 mb-1">Secteur d'activité</label>
                <input
                  type="text"
                  name="secteurActivite"
                  value={form.secteurActivite}
                  onChange={handleChange}
                  placeholder="Ex: Informatique, Santé, Formation..."
                  className="w-full bg-gray-100 rounded-xl px-4 py-3 text-sm text-gray-700 placeholder-gray-400 outline-none focus:ring-2 focus:ring-[#4F46E5]"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-800 mb-1">Adresse professionnelle</label>
                <textarea
                  name="adresseProfessionnelle"
                  value={form.adresseProfessionnelle}
                  onChange={handleChange}
                  rows={2}
                  placeholder="Adresse complète de l'entreprise"
                  className="w-full bg-gray-100 rounded-xl px-4 py-3 text-sm text-gray-700 placeholder-gray-400 outline-none focus:ring-2 focus:ring-[#4F46E5] resize-none"
                  required
                />
              </div>
            </>
          )}

          {/* Actions */}
          {isResponsable && step === 2 ? (
            <div className="flex gap-2 pt-1">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="w-1/3 border border-gray-300 text-gray-700 font-semibold py-3.5 rounded-xl"
              >
                Retour
              </button>
              <button
                type="submit"
                disabled={loading}
                className="w-2/3 bg-[#4F46E5] hover:bg-[#3730A3] text-white font-semibold py-3.5 rounded-xl transition-colors disabled:opacity-50"
              >
                {loading ? "Inscription..." : "Envoyer ma demande"}
              </button>
            </div>
          ) : (
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#4F46E5] hover:bg-[#3730A3] text-white font-semibold py-3.5 rounded-xl transition-colors mt-2 disabled:opacity-50"
            >
              {loading ? "Inscription..." : isResponsable ? "Suivant" : "Créer un compte"}
            </button>
          )}
        </form>

        <p className="text-center text-sm text-gray-500 mt-6">
          Vous avez déjà un compte ?{" "}
          <button
            onClick={() => navigate("/login")}
            className="text-[#4F46E5] font-medium hover:underline"
          >
            Se connecter
          </button>
        </p>

        <p className="text-center mt-4">
          <button
            onClick={() => navigate("/")}
            className="text-sm text-[#4F46E5] hover:underline"
          >
            ← Retour à l'accueil
          </button>
        </p>
      </div>
    </div>
  );
}