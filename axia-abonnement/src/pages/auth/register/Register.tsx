import { useState, type ChangeEvent, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../hooks/useAuth";
import RegisterHeader from "./components/RegisterHeader";

import RoleSwitch from "./components/RoleSwitch";
import ResponsableProgress from "./components/ResponsableProgress";
import PersonalInfoFields from "./components/PersonalInfoFields";
import CompanyInfoFields from "./components/CompanyInfoFields";
import RegisterActions from "./components/RegisterActions";
import RegisterIllustration from "./components/RegisterIllustration";

import { INITIAL_FORM } from "./constants";
import type { RegisterForm, RegisterStep, Role } from "./types";
import { validateCompanyStep, validatePersonalStep } from "./utils";

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState<RegisterForm>(INITIAL_FORM);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<RegisterStep>(1);

  const isResponsable = form.role === "Responsable";

  const handleChange = (
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleGouvernoratChange = (event: ChangeEvent<HTMLSelectElement>) => {
    setForm((previous) => ({
      ...previous,
      gouvernorat: event.target.value,
      ville: "",
    }));
  };

  const selectRole = (role: Role) => {
    setForm((previous) => ({
      ...previous,
      role,
    }));

    setError("");
    setStep(1);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (isResponsable && step === 1) {
      const validationError = validatePersonalStep(form, isResponsable);

      if (validationError) {
        setError(validationError);
        return;
      }

      setError("");
      setStep(2);
      return;
    }

    const validationError = isResponsable
      ? validateCompanyStep(form)
      : validatePersonalStep(form, isResponsable);

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
        gouvernorat: form.gouvernorat,
        ville: form.ville,
        nomEntreprise: isResponsable ? form.nomEntreprise : undefined,
        matriculeFiscal: isResponsable ? form.matriculeFiscal : undefined,
        secteurActivite: isResponsable ? form.secteurActivite : undefined,
        adresseProfessionnelle: isResponsable
          ? form.adresseProfessionnelle
          : undefined,
        dateNaissance:
          !isResponsable && form.dateNaissance
            ? form.dateNaissance
            : undefined,
        sexe: !isResponsable ? form.sexe || undefined : undefined,
      });

      if (result.role === "Responsable") {
        navigate("/register/demande-en-cours", {
          state: { email: form.email },
        });
      } else {
        navigate("/login");
      }
    } catch (err) {
      const apiError = err as {
        response?: {
          data?: {
            message?: string;
          } | string;
        };
      };

      const data = apiError.response?.data;

      setError(
        typeof data === "string"
          ? data
          : data?.message || "Erreur lors de l'inscription",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      <div className="w-full lg:w-[55%] flex flex-col justify-center px-8 sm:px-16 py-12 bg-white overflow-y-auto">
        <div className="max-w-md w-full mx-auto">
          <RegisterHeader />

          <RoleSwitch role={form.role} onSelectRole={selectRole} />

          {isResponsable && <ResponsableProgress step={step} />}

          {error && <p className="text-blue-500 text-sm mb-4">{error}</p>}

          <form onSubmit={handleSubmit} className="space-y-5">
            {(step === 1 || !isResponsable) && (
              <PersonalInfoFields
                form={form}
                isResponsable={isResponsable}
                onChange={handleChange}
                onGouvernoratChange={handleGouvernoratChange}
              />
            )}

            {isResponsable && step === 2 && (
              <CompanyInfoFields form={form} onChange={handleChange} />
            )}

            <RegisterActions
              isResponsable={isResponsable}
              step={step}
              loading={loading}
              onBack={() => setStep(1)}
              onLogin={() => navigate("/login")}
            />
          </form>

          <p className="text-center mt-6">
            <button
              type="button"
              onClick={() => navigate("/")}
              className="text-sm text-gray-400 hover:text-gray-600"
            >
              ← Retour à l'accueil
            </button>
          </p>
        </div>
      </div>

      <RegisterIllustration />
    </div>
  );
}