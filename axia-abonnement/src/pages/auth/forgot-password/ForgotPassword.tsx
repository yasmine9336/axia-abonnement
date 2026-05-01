import { useEffect, useRef, useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../../services/api/axiosInstance";

import ForgotPasswordHeader from "./components/ForgotPasswordHeader";
import ForgotPasswordForm from "./components/ForgotPasswordForm";
import ForgotPasswordSuccess from "./components/ForgotPasswordSuccess";
import ForgotPasswordIllustration from "./components/ForgotPasswordIllustration";

export default function ForgotPassword() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [cooldown, setCooldown] = useState(0);

  const intervalRef = useRef<number | null>(null);

  const requestResetLink = async () => {
    await axiosInstance.post("/auth/forgot-password", {
      email,
      clientUri: `${import.meta.env.VITE_APP_URL}/reset-password`,
    });
  };

  const startCooldown = () => {
    setCooldown(60);

    if (intervalRef.current) {
      window.clearInterval(intervalRef.current);
    }

    intervalRef.current = window.setInterval(() => {
      setCooldown((previous) => {
        if (previous <= 1) {
          if (intervalRef.current) {
            window.clearInterval(intervalRef.current);
            intervalRef.current = null;
          }

          return 0;
        }

        return previous - 1;
      });
    }, 1000);
  };

  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        window.clearInterval(intervalRef.current);
      }
    };
  }, []);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setLoading(true);
    setError("");

    try {
      await requestResetLink();
      setSubmitted(true);
    } catch (err) {
      const apiError = err as {
        response?: {
          data?: string;
        };
      };

      setError(apiError.response?.data || "Une erreur est survenue.");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (cooldown > 0) return;

    setError("");

    try {
      await requestResetLink();
      startCooldown();
    } catch {
      setError("Erreur lors du renvoi");
    }
  };

  return (
    <div className="min-h-screen flex">
      <div className="w-full lg:w-[55%] flex flex-col justify-center px-8 sm:px-16 py-12 bg-white">
        <div className="max-w-md w-full mx-auto">
          <ForgotPasswordHeader submitted={submitted} email={email} />

          {!submitted ? (
            <ForgotPasswordForm
              email={email}
              loading={loading}
              error={error}
              onEmailChange={setEmail}
              onSubmit={handleSubmit}
              onBackToLogin={() => navigate("/login")}
            />
          ) : (
            <ForgotPasswordSuccess
              error={error}
              cooldown={cooldown}
              onResend={() => void handleResend()}
              onBackToLogin={() => navigate("/login")}
              onBackHome={() => navigate("/")}
            />
          )}
        </div>
      </div>

      <ForgotPasswordIllustration />
    </div>
  );
}