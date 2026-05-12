import { useState, type ChangeEvent, type FormEvent } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../../hooks/useAuth";
import LoginHeader from "./components/LoginHeader";

import AuthStatusBanner from "./components/AuthStatusBanner";
import LoginForm from "./components/LoginForm";
import LoginIllustration from "./components/LoginIllustration";

import type { LoginFormValues, StatusBanner } from "./types";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: string })?.from;
  const [error, setError] = useState("");
  const [banner, setBanner] = useState<StatusBanner>(null);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState<LoginFormValues>({
    email: "",
    password: "",
    remember: false,
  });

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setLoading(true);
    setError("");
    setBanner(null);

    try {
      const outcome = await login(form.email, form.password, form.remember);

      switch (outcome.kind) {
        case "success":
          if (outcome.role === "Admin") {
            navigate("/dashboard/admin");
          } else if (outcome.role === "Responsable") {
            navigate("/dashboard/responsable");
          } else {
            navigate(from ?? "/dashboard/client");
          }
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

  return (
    <div className="min-h-screen flex">
      <div className="w-full lg:w-[55%] flex flex-col justify-center px-8 sm:px-16 py-12 bg-white">
        <div className="max-w-md w-full mx-auto">
          <LoginHeader />

          <AuthStatusBanner banner={banner} />

          {error && (
            <p className="text-blue-500 text-sm text-center mb-4">{error}</p>
          )}

          <LoginForm
            form={form}
            loading={loading}
            onChange={handleChange}
            onSubmit={handleSubmit}
            onForgotPassword={() => navigate("/forgot-password")}
            onRegister={() => navigate("/register")}
          />

          <p className="text-center mt-8">
            <button
              type="button"
              onClick={() => navigate("/")}
              className="text-sm text-gray-400 hover:text-gray-600 transition-colors"
            >
              ← Retour à l'accueil
            </button>
          </p>
        </div>
      </div>

      <LoginIllustration />
    </div>
  );
}
