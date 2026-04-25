import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { GOUVERNORATS, getVillesByGouvernorat } from "../../data/villes";
import LogoAxia from "../../assets/logo-axia.svg";

type Role = "Client" | "Responsable";

interface RegisterForm {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
  role: Role;
  phoneNumber: string;
  gouvernorat: string;
  ville: string;
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
  gouvernorat: "",
  ville: "",
  nomEntreprise: "",
  matriculeFiscal: "",
  secteurActivite: "",
  adresseProfessionnelle: "",
};

const inputClass =
  "w-full border-0 border-b-2 border-gray-200 pb-2 text-sm text-gray-800 placeholder-gray-300 outline-none transition-colors bg-transparent";

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState<RegisterForm>(INITIAL_FORM);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<1 | 2>(1);

  const isResponsable = form.role === "Responsable";
  const villesDisponibles = getVillesByGouvernorat(form.gouvernorat);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleGouvernoratChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setForm((prev) => ({ ...prev, gouvernorat: e.target.value, ville: "" }));
  };

  const selectRole = (role: Role) => {
    setForm((prev) => ({ ...prev, role }));
    setError("");
    setStep(1);
  };

  const validateStep1 = (): string | null => {
    if (!form.fullName.trim()) return "Le nom complet est requis.";
    if (!form.email.trim()) return "L'email est requis.";
    if (!form.gouvernorat) return "Le gouvernorat est requis.";
    if (!form.ville) return "La ville est requise.";
    if (form.password !== form.confirmPassword)
      return "Les mots de passe ne correspondent pas.";
    if (form.password.length < 8)
      return "Le mot de passe doit contenir au moins 8 caractères.";
    if (!/[A-Z]/.test(form.password))
      return "Le mot de passe doit contenir au moins une majuscule.";
    if (!/[0-9]/.test(form.password))
      return "Le mot de passe doit contenir au moins un chiffre.";
    return null;
  };

  const validateStep2 = (): string | null => {
    if (!form.nomEntreprise.trim()) return "Le nom de l'entreprise est requis.";
    if (!form.matriculeFiscal.trim()) return "Le matricule fiscal est requis.";
    if (!form.secteurActivite.trim())
      return "Le secteur d'activité est requis.";
    if (!form.adresseProfessionnelle.trim())
      return "L'adresse professionnelle est requise.";
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isResponsable && step === 1) {
      const err = validateStep1();
      if (err) {
        setError(err);
        return;
      }
      setError("");
      setStep(2);
      return;
    }
    const err = isResponsable ? validateStep2() : validateStep1();
    if (err) {
      setError(err);
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
        gouvernorat: form.gouvernorat,
        ville: form.ville,
        nomEntreprise: isResponsable ? form.nomEntreprise : undefined,
        matriculeFiscal: isResponsable ? form.matriculeFiscal : undefined,
        secteurActivite: isResponsable ? form.secteurActivite : undefined,
        adresseProfessionnelle: isResponsable
          ? form.adresseProfessionnelle
          : undefined,
      });
      if (result.role === "Responsable") {
        navigate("/register/demande-en-cours", {
          state: { email: form.email },
        });
      } else {
        navigate("/login");
      }
    } catch (err) {
      const error = err as {
        response?: { data?: { message?: string } | string };
      };
      const data = error.response?.data;
      setError(
        typeof data === "string"
          ? data
          : data?.message || "Erreur lors de l'inscription",
      );
    } finally {
      setLoading(false);
    }
  };

  const focusStyle = (
    e: React.FocusEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => (e.target.style.borderBottomColor = "var(--color-primary)");
  const blurStyle = (
    e: React.FocusEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => (e.target.style.borderBottomColor = "#e5e7eb");

  return (
    <div className="min-h-screen flex">
      {/* ── Côté gauche : formulaire ── */}
      <div className="w-full lg:w-[55%] flex flex-col justify-center px-8 sm:px-16 py-12 bg-white overflow-y-auto">
        <div className="max-w-md w-full mx-auto">
          {/* Logo */}
          <div className="mb-6">
            <img src={LogoAxia} alt="AxiaAbonnement" className="h-14 mb-2" />
            <h1 className="text-3xl font-bold text-gray-900">Bienvenue.</h1>
            <h2 className="text-3xl font-bold text-gray-900">
              Créer un compte.
            </h2>
            <p className="text-gray-400 text-sm mt-3">
              Entrez vos informations pour commencer
            </p>
          </div>

          {/* Switch rôle */}
          <div className="flex gap-2 bg-gray-100 p-1 rounded-xl mb-6">
            {(["Client", "Responsable"] as Role[]).map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => selectRole(r)}
                className="flex-1 py-2.5 rounded-lg text-sm font-semibold transition-colors"
                style={
                  form.role === r
                    ? { background: "var(--color-primary)", color: "white" }
                    : { color: "#6b7280" }
                }
              >
                {r === "Client" ? "Je suis Client" : "Je suis Responsable"}
              </button>
            ))}
          </div>

          {/* Progress Responsable */}
          {isResponsable && (
            <div className="mb-6">
              <div className="flex gap-2 mb-1">
                <div
                  className="h-1 flex-1 rounded-full transition-colors"
                  style={{
                    background: step >= 1 ? "var(--color-primary)" : "#e5e7eb",
                  }}
                />
                <div
                  className="h-1 flex-1 rounded-full transition-colors"
                  style={{
                    background: step >= 2 ? "var(--color-primary)" : "#e5e7eb",
                  }}
                />
              </div>
              <p className="text-xs text-gray-400">
                Étape {step}/2 ·{" "}
                {step === 1
                  ? "Informations personnelles"
                  : "Informations entreprise"}
              </p>
            </div>
          )}

          {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* ÉTAPE 1 */}
            {(step === 1 || !isResponsable) && (
              <>
                <div>
                  <label className="block text-xs text-gray-400 mb-1 uppercase tracking-wide">
                    Nom complet
                  </label>
                  <input
                    type="text"
                    name="fullName"
                    value={form.fullName}
                    onChange={handleChange}
                    placeholder="Jean Dupont"
                    required
                    className={inputClass}
                    onFocus={focusStyle}
                    onBlur={blurStyle}
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1 uppercase tracking-wide">
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="votre.email@exemple.com"
                    required
                    className={inputClass}
                    onFocus={focusStyle}
                    onBlur={blurStyle}
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1 uppercase tracking-wide">
                    Téléphone (optionnel)
                  </label>
                  <input
                    type="tel"
                    name="phoneNumber"
                    value={form.phoneNumber}
                    onChange={handleChange}
                    placeholder="ex: 20123456"
                    className={inputClass}
                    onFocus={focusStyle}
                    onBlur={blurStyle}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-gray-400 mb-1 uppercase tracking-wide">
                      Gouvernorat
                    </label>
                    <select
                      name="gouvernorat"
                      value={form.gouvernorat}
                      onChange={handleGouvernoratChange}
                      required
                      className={inputClass}
                      onFocus={focusStyle}
                      onBlur={blurStyle}
                    >
                      <option value="">Sélectionner...</option>
                      {GOUVERNORATS.map((g) => (
                        <option key={g} value={g}>
                          {g}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400 mb-1 uppercase tracking-wide">
                      Ville
                    </label>
                    <select
                      name="ville"
                      value={form.ville}
                      onChange={handleChange}
                      required
                      disabled={!form.gouvernorat}
                      className={`${inputClass} disabled:opacity-50`}
                      onFocus={focusStyle}
                      onBlur={blurStyle}
                    >
                      <option value="">
                        {form.gouvernorat ? "Sélectionner..." : "—"}
                      </option>
                      {villesDisponibles.map((v) => (
                        <option key={v} value={v}>
                          {v}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1 uppercase tracking-wide">
                    Mot de passe
                  </label>
                  <input
                    type="password"
                    name="password"
                    value={form.password}
                    onChange={handleChange}
                    placeholder="Start typing..."
                    autoComplete="new-password"
                    required
                    className={inputClass}
                    onFocus={focusStyle}
                    onBlur={blurStyle}
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1 uppercase tracking-wide">
                    Confirmer le mot de passe
                  </label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={form.confirmPassword}
                    onChange={handleChange}
                    placeholder="Start typing..."
                    autoComplete="new-password"
                    required
                    className={inputClass}
                    onFocus={focusStyle}
                    onBlur={blurStyle}
                  />
                </div>
              </>
            )}

            {/* ÉTAPE 2 */}
            {isResponsable && step === 2 && (
              <>
                <div>
                  <label className="block text-xs text-gray-400 mb-1 uppercase tracking-wide">
                    Nom de l'entreprise
                  </label>
                  <input
                    type="text"
                    name="nomEntreprise"
                    value={form.nomEntreprise}
                    onChange={handleChange}
                    placeholder="Ex: Axia SARL"
                    required
                    className={inputClass}
                    onFocus={focusStyle}
                    onBlur={blurStyle}
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1 uppercase tracking-wide">
                    Matricule fiscal
                  </label>
                  <input
                    type="text"
                    name="matriculeFiscal"
                    value={form.matriculeFiscal}
                    onChange={handleChange}
                    placeholder="Ex: 1234567/A/M/000"
                    required
                    className={inputClass}
                    onFocus={focusStyle}
                    onBlur={blurStyle}
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1 uppercase tracking-wide">
                    Secteur d'activité
                  </label>
                  <input
                    type="text"
                    name="secteurActivite"
                    value={form.secteurActivite}
                    onChange={handleChange}
                    placeholder="Ex: Informatique, Santé..."
                    required
                    className={inputClass}
                    onFocus={focusStyle}
                    onBlur={blurStyle}
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1 uppercase tracking-wide">
                    Adresse professionnelle
                  </label>
                  <textarea
                    name="adresseProfessionnelle"
                    value={form.adresseProfessionnelle}
                    onChange={handleChange}
                    placeholder="Adresse complète"
                    required
                    rows={2}
                    className="w-full border-0 border-b-2 border-gray-200 pb-2 text-sm text-gray-800 placeholder-gray-300 outline-none transition-colors bg-transparent resize-none"
                    onFocus={focusStyle}
                    onBlur={blurStyle}
                  />
                </div>
              </>
            )}

            {/* Actions */}
            {isResponsable && step === 2 ? (
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="w-1/3 py-3 border-2 rounded-xl font-semibold text-sm text-gray-600 border-gray-200 hover:bg-gray-50"
                >
                  Retour
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-2/3 py-3 text-white font-semibold rounded-xl text-sm disabled:opacity-50"
                  style={{ background: "var(--color-primary)" }}
                >
                  {loading ? "Inscription..." : "Envoyer ma demande"}
                </button>
              </div>
            ) : (
              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-3 text-white font-semibold rounded-xl text-sm disabled:opacity-50"
                  style={{ background: "var(--color-primary)" }}
                >
                  {loading
                    ? "..."
                    : isResponsable
                      ? "Suivant"
                      : "Créer un compte"}
                </button>
                <button
                  type="button"
                  onClick={() => navigate("/login")}
                  className="flex-1 py-3 font-semibold rounded-xl text-sm border-2 bg-white"
                  style={{
                    borderColor: "var(--color-primary)",
                    color: "var(--color-primary)",
                  }}
                >
                  Se connecter
                </button>
              </div>
            )}
          </form>

          <p className="text-center mt-6">
            <button
              onClick={() => navigate("/")}
              className="text-sm text-gray-400 hover:text-gray-600"
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
        <div
          className="absolute w-96 h-96 rounded-full opacity-10"
          style={{ background: "white", top: "-80px", right: "-80px" }}
        />
        <div
          className="absolute w-64 h-64 rounded-full opacity-10"
          style={{ background: "white", bottom: "-40px", left: "-40px" }}
        />
        <img
          src="/src/assets/undraw_sign-up_qamz.svg"
          alt="Inscription"
          className="w-80 relative z-10"
        />
      </div>
    </div>
  );
}
