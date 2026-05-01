import { useState, type FormEvent } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import axiosInstance from "../../../services/api/axiosInstance";

import InvalidResetLink from "./components/InvalidResetLink";
import ResetPasswordHeader from "./components/ResetPasswordHeader";
import ResetPasswordForm from "./components/ResetPasswordForm";
import ResetPasswordSuccess from "./components/ResetPasswordSuccess";
import ResetPasswordIllustration from "./components/ResetPasswordIllustration";

import {
  getResetPasswordApiError,
  normalizeResetToken,
  validateResetPassword,
} from "./utils";

export default function ResetPassword() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const rawToken = searchParams.get("token") ?? "";
  const token = normalizeResetToken(rawToken);
  const userEmail = searchParams.get("email");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [resetComplete, setResetComplete] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setError("");

    const validationError = validateResetPassword(password, confirmPassword);

    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);

    try {
      await axiosInstance.post("/auth/reset-password", {
        email: userEmail,
        token,
        password,
        confirmPassword: password,
      });

      setResetComplete(true);
    } catch (err) {
      setError(getResetPasswordApiError(err));
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <InvalidResetLink
        onNewLink={() => navigate("/forgot-password")}
        onLogin={() => navigate("/login")}
      />
    );
  }

  return (
    <div className="min-h-screen flex">
      <div className="w-full lg:w-[55%] flex flex-col justify-center px-8 sm:px-16 py-12 bg-white overflow-y-auto">
        <div className="max-w-md w-full mx-auto">
          <ResetPasswordHeader resetComplete={resetComplete} />

          {!resetComplete ? (
            <ResetPasswordForm
              userEmail={userEmail}
              password={password}
              confirmPassword={confirmPassword}
              loading={loading}
              error={error}
              onPasswordChange={setPassword}
              onConfirmPasswordChange={setConfirmPassword}
              onSubmit={handleSubmit}
              onBackToLogin={() => navigate("/login")}
            />
          ) : (
            <ResetPasswordSuccess
              onLogin={() => navigate("/login")}
              onHome={() => navigate("/")}
            />
          )}
        </div>
      </div>

      <ResetPasswordIllustration />
    </div>
  );
}