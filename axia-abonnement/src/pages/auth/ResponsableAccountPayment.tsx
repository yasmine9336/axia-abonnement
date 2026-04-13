import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import axiosInstance from "../../api/axiosInstance";

export default function ResponsableAccountPayment() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const userId = searchParams.get("userId") || "";

  const [status, setStatus] = useState<'idle' | 'loading' | 'error'>('idle');
  const [error, setError] = useState('');

  const launchCheckout = async () => {
    if (!userId) {
      setError("Identifiant utilisateur manquant dans l'URL.");
      setStatus('error');
      return;
    }
    setStatus('loading');
    setError('');
    try {
      const res = await axiosInstance.post(
        "/payment/create-responsable-account-session",
        { userId }
      );
      window.location.href = res.data.url;
    } catch (err) {
      const e = err as { response?: { data?: string | { message?: string } } };
      const data = e.response?.data;
      setError(typeof data === 'string' ? data : data?.message || "Impossible de créer la session de paiement.");
      setStatus('error');
    }
  };

  // Lancement auto à l'arrivée sur la page
  useEffect(() => {
    launchCheckout();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="bg-white rounded-2xl shadow-md p-10 w-full max-w-md text-center">
        {status === 'loading' && (
          <>
            <div className="w-16 h-16 mx-auto mb-4 border-4 border-indigo-200 border-t-[#4F46E5] rounded-full animate-spin" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Redirection vers Stripe...</h2>
            <p className="text-gray-500 text-sm">
              Merci de patienter, nous préparons votre paiement sécurisé de <strong>500 TND</strong>.
            </p>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Erreur</h2>
            <p className="text-gray-500 text-sm mb-6">{error}</p>
            <button onClick={launchCheckout}
              className="w-full py-3 bg-[#4F46E5] text-white rounded-xl font-semibold text-sm hover:bg-[#3730A3] transition-all mb-3">
              Réessayer
            </button>
            <button onClick={() => navigate("/login")}
              className="w-full py-3 border border-gray-200 text-gray-600 rounded-xl font-semibold text-sm hover:bg-gray-50">
              Retour à la connexion
            </button>
          </>
        )}
      </div>
    </div>
  );
}
