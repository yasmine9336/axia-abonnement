import { useLocation, useNavigate } from "react-router-dom";

export default function DemandeEnCours() {
  const navigate = useNavigate();
  const location = useLocation();
  const email = (location.state as { email?: string })?.email;

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="bg-white rounded-2xl shadow-md p-10 w-full max-w-md text-center">
        <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-[#4F46E5]" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Demande envoyée</h2>
        <p className="text-gray-600 text-sm mb-2">
          Votre demande est en cours d'examen par l'administrateur.
        </p>
        <p className="text-gray-500 text-sm mb-6">
          Vous recevrez un email {email && <strong>à {email}</strong>} une fois qu'elle aura été traitée.
        </p>
        <div className="p-3 bg-indigo-50 border border-indigo-100 rounded-xl text-xs text-indigo-700 mb-6">
          Si votre demande est acceptée, un lien de paiement de <strong>500 TND</strong> vous sera envoyé
          pour activer votre compte.
        </div>
        <button
          onClick={() => navigate("/")}
          className="w-full py-3 bg-[#4F46E5] text-white rounded-xl font-semibold text-sm hover:bg-[#3730A3] transition-all"
        >
          Retour à l'accueil
        </button>
      </div>
    </div>
  );
}