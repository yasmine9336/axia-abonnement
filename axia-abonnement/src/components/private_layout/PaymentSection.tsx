import { useState, useEffect } from "react";
import axiosInstance from "../../api/axiosInstance";

interface Offre {
  id: string;
  intituleOffre: string;
  description: string;
  parMois: number;
  parAnnee: number;
  services: string[];
}

export default function PaymentSection() {
  const [offres, setOffres] = useState<Offre[]>([]);
  const [selectedOffre, setSelectedOffre] = useState<Offre | null>(null);
  const [type, setType] = useState<"mensuel" | "annuel">("mensuel");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    axiosInstance.get("/offres/public").then(r => {
      setOffres(r.data);
      const pendingId = localStorage.getItem("pendingOffreId");
      if (pendingId) {
        const found = r.data.find((o: Offre) => o.id === pendingId);
        if (found) setSelectedOffre(found);
        localStorage.removeItem("pendingOffreId");
      }
    });
  }, []);

  const handlePay = async () => {
    if (!selectedOffre) return;
    setLoading(true);
    try {
      const res = await axiosInstance.post("/payment/create-checkout-session", {
        offreId: selectedOffre.id,
        type,
      });
      window.location.href = res.data.url;
    } catch {
      setLoading(false);
    }
  };

  const montant = selectedOffre
    ? type === "annuel" ? selectedOffre.parAnnee : selectedOffre.parMois
    : null;

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Paiement</h1>
        <p className="text-gray-500 text-sm mt-1">Choisissez une offre et complétez votre abonnement.</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Sélection offre */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Choisir une offre</h2>
          <div className="space-y-3">
            {offres.map((o) => (
              <button
                key={o.id}
                onClick={() => setSelectedOffre(o)}
                className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                  selectedOffre?.id === o.id
                    ? "border-[#4F46E5] bg-indigo-50"
                    : "border-gray-200 hover:border-[#4F46E5]"
                }`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">{o.intituleOffre}</p>
                    <p className="text-xs text-gray-500 mt-1">{o.description}</p>
                    {o.services.length > 0 && (
                      <p className="text-xs text-[#4F46E5] mt-1">{o.services.join(", ")}</p>
                    )}
                  </div>
                  <div className="text-right shrink-0 ml-3">
                    <p className="text-sm font-bold text-[#4F46E5]">{o.parMois} TND</p>
                    <p className="text-xs text-gray-400">/mois</p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Récapitulatif */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Récapitulatif</h2>

          {!selectedOffre ? (
            <div className="flex items-center justify-center h-48 text-gray-400 text-sm">
              Sélectionnez une offre
            </div>
          ) : (
            <>
              <div className="flex gap-3 mb-6">
                <button
                  onClick={() => setType("mensuel")}
                  className={`flex-1 py-3 rounded-xl font-semibold text-sm transition-all ${
                    type === "mensuel"
                      ? "bg-[#4F46E5] text-white"
                      : "border border-gray-200 text-gray-600 hover:border-[#4F46E5]"
                  }`}
                >
                  Mensuel
                </button>
                <button
                  onClick={() => setType("annuel")}
                  className={`flex-1 py-3 rounded-xl font-semibold text-sm transition-all ${
                    type === "annuel"
                      ? "bg-[#4F46E5] text-white"
                      : "border border-gray-200 text-gray-600 hover:border-[#4F46E5]"
                  }`}
                >
                  Annuel
                  <span className="ml-1 text-xs text-green-500">-20%</span>
                </button>
              </div>

              <div className="bg-gray-50 rounded-xl p-4 mb-6 space-y-2">
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Offre</span>
                  <span className="font-medium">{selectedOffre.intituleOffre}</span>
                </div>
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Type</span>
                  <span className="capitalize">{type}</span>
                </div>
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Durée</span>
                  <span>{type === "annuel" ? "12 mois" : "1 mois"}</span>
                </div>
                <div className="flex justify-between font-bold text-gray-900 text-base pt-2 border-t border-gray-200">
                  <span>Total</span>
                  <span>{montant} TND</span>
                </div>
              </div>

              <button
                onClick={handlePay}
                disabled={loading}
                className="w-full py-3 bg-[#4F46E5] text-white rounded-xl font-semibold text-sm hover:bg-[#3730A3] transition-all disabled:opacity-50"
              >
                {loading ? "Redirection vers Stripe..." : `Payer ${montant} TND`}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}