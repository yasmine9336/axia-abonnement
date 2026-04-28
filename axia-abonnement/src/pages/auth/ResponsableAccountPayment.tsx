import { useEffect, useRef, useState, useCallback } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import axiosInstance from "../../api/axiosInstance";
import LogoAxia from "../../assets/logo-axia.svg";

export default function ResponsableAccountPayment() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const userId = searchParams.get("userId") || "";
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
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
      .post("/payment/create-responsable-account-session", { userId })
      .then((res) => {
        window.location.href = res.data.url;
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
    if (!launched.current) {
      launched.current = true;
      launchCheckout();
    }
  }, [launchCheckout]);

  return (
    <div className="min-h-screen flex">
      {/* Côté gauche */}
      <div className="w-full lg:w-[55%] flex flex-col justify-center px-8 sm:px-16 py-12 bg-white">
        <div className="max-w-md w-full mx-auto">
          <div className="mb-8">
            <img src={LogoAxia} alt="AxiaAbonnement" className="h-20 mb-4" />
            <h1 className="text-3xl font-bold text-gray-900">
              Activation du compte.
            </h1>
            <h2 className="text-3xl font-bold text-gray-900">
              Paiement sécurisé.
            </h2>
            <p className="text-gray-400 text-sm mt-3">
              Redirection vers Stripe pour le paiement de 500 TND.
            </p>
          </div>

          {status === "loading" && (
            <div className="flex flex-col items-center gap-4 py-8">
              <div
                className="w-12 h-12 border-4 border-gray-200 rounded-full animate-spin"
                style={{ borderTopColor: "var(--color-primary)" }}
              />
              <p className="text-sm text-gray-500">
                Préparation du paiement...
              </p>
            </div>
          )}

          {status === "error" && (
            <div className="space-y-4">
              <p className="text-sm text-red-600 bg-red-50 px-4 py-3 rounded-xl">
                {error}
              </p>
              <button
                onClick={launchCheckout}
                className="w-full py-3 text-white font-semibold rounded-xl text-sm"
                style={{ background: "var(--color-primary)" }}
              >
                Réessayer
              </button>
              <button
                onClick={() => navigate("/login")}
                className="w-full py-3 font-semibold rounded-xl text-sm border-2 border-gray-200 text-gray-600 hover:bg-gray-50"
              >
                Retour à la connexion
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Côté droit */}
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
          src="/src/assets/undraw_newsletter-subscriber_plsr.svg"
          alt="Paiement"
          className="w-72 relative z-10"
        />
      </div>
    </div>
  );
}
