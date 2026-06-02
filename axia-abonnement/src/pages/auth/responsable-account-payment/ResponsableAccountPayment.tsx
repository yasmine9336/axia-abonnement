import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import axiosInstance from "../../../services/api/axiosInstance";

import ResponsablePaymentHeader from "./components/ResponsablePaymentHeader";
import ResponsablePaymentStatus from "./components/ResponsablePaymentStatus";
import ResponsablePaymentIllustration from "./components/ResponsablePaymentIllustration";

type PaymentStatus = "idle" | "loading" | "error";

export default function ResponsableAccountPayment() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const userId = searchParams.get("userId") || "";

  const [status, setStatus] = useState<PaymentStatus>("idle");
  const [error, setError] = useState("");

  const launched = useRef(false);

  const launchCheckout = useCallback(() => {
    if (!userId) {
      setError("Identifiant utilisateur manquant dans l'URL.");
      setStatus("error");
      return;
    }

    setStatus("loading");
    setError("");

    axiosInstance
      .post<{ url: string }>("/payment/create-responsable-account-session", {
        userId,
      })
      .then((response) => {
        window.location.href = response.data.url;
      })
      .catch((err: { response?: { data?: string | { message?: string } } }) => {
        const data = err.response?.data;

        setError(
          typeof data === "string"
            ? data
            : data?.message || "Impossible de créer la session de paiement.",
        );

        setStatus("error");
      });
  }, [userId]);

  useEffect(() => {
    if (launched.current) return;

    launched.current = true;
    launchCheckout();
  }, [launchCheckout]);

  return (
    <div className="min-h-screen flex">
      <div className="w-full lg:w-[55%] flex flex-col justify-center px-8 sm:px-16 py-12 bg-white">
        <div className="max-w-md w-full mx-auto">
          <ResponsablePaymentHeader />

          <ResponsablePaymentStatus
            status={status}
            error={error}
            onRetry={launchCheckout}
            onBackToLogin={() => navigate("/login")}
          />
        </div>
      </div>

      <ResponsablePaymentIllustration />
    </div>
  );
}
