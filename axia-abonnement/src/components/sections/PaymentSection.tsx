import { useState, useEffect } from "react";
import axiosInstance from "../../api/axiosInstance";
import axios from "axios";
import { API_URL } from "../../api/config";

interface Offre {
  id: string;
  intituleOffre: string;
  description: string;
  parMois: number;
  parAnnee: number;
  services: string[];
}

interface Service {
  id: string;
  intituleService: string;
  description: string;
  parMois: number;
  parAnnee: number;
}

type Selection =
  | { kind: "offre"; item: Offre }
  | { kind: "service"; item: Service };

export default function PaymentSection() {
  const [offres, setOffres] = useState<Offre[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [selection, setSelection] = useState<Selection | null>(null);
  const [relatedOffres, setRelatedOffres] = useState<Offre[]>([]);
  const [type, setType] = useState<"mensuel" | "annuel">("mensuel");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      const [offresRes, servicesRes] = await Promise.all([
        axiosInstance.get("/offres/public"),
        axios.get(`${API_URL}/api/services/public`),
      ]);
      const offresData: Offre[] = offresRes.data;
      const servicesData: Service[] = servicesRes.data;
      setOffres(offresData);
      setServices(servicesData);

      // Pré-sélection depuis la landing
      const pendingOffreId = localStorage.getItem("pendingOffreId");
      const pendingServiceId = localStorage.getItem("pendingServiceId");

      if (pendingServiceId) {
        const found = servicesData.find((s) => s.id === pendingServiceId);
        if (found) {
          setSelection({ kind: "service", item: found });
          // Offres qui incluent ce service
          setRelatedOffres(
            offresData.filter((o) => o.services.includes(found.intituleService))
          );
        }
        localStorage.removeItem("pendingServiceId");
      } else if (pendingOffreId) {
        const found = offresData.find((o) => o.id === pendingOffreId);
        if (found) setSelection({ kind: "offre", item: found });
        localStorage.removeItem("pendingOffreId");
      }
    };
    loadData();
  }, []);

  // Quand on sélectionne un service, calculer les offres liées
  const selectService = (s: Service) => {
    setSelection({ kind: "service", item: s });
    setRelatedOffres(
      offres.filter((o) => o.services.includes(s.intituleService))
    );
  };

  const selectOffre = (o: Offre) => {
    setSelection({ kind: "offre", item: o });
    setRelatedOffres([]);
  };

  const handlePay = async () => {
    if (!selection) return;
    setLoading(true);
    try {
      const body =
        selection.kind === "offre"
          ? { offreId: selection.item.id, type }
          : { serviceId: selection.item.id, type };

      const res = await axiosInstance.post(
        "/payment/create-checkout-session",
        body
      );
      window.location.href = res.data.url;
    } catch {
      setLoading(false);
    }
  };

  const montant = selection
    ? type === "annuel"
      ? selection.kind === "offre"
        ? (selection.item as Offre).parAnnee
        : (selection.item as Service).parAnnee
      : selection.kind === "offre"
        ? (selection.item as Offre).parMois
        : (selection.item as Service).parMois
    : null;

  const selectionName = selection
    ? selection.kind === "offre"
      ? (selection.item as Offre).intituleOffre
      : (selection.item as Service).intituleService
    : "";

  const selectionLabel = selection?.kind === "offre" ? "Offre" : "Service";

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Paiement</h1>
        <p className="text-gray-500 text-sm mt-1">
          Choisissez un service ou une offre et complétez votre abonnement.
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Colonne gauche — sélection */}
        <div className="space-y-6">
          {/* Services */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Services</h2>
            <div className="space-y-3">
              {services.map((s) => (
                <button
                  key={s.id}
                  onClick={() => selectService(s)}
                  className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                    selection?.kind === "service" && selection.item.id === s.id
                      ? "border-[#4F46E5] bg-indigo-50"
                      : "border-gray-200 hover:border-[#4F46E5]"
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-semibold text-gray-900 text-sm">
                        {s.intituleService}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {s.description}
                      </p>
                    </div>
                    <div className="text-right shrink-0 ml-3">
                      <p className="text-sm font-bold text-[#4F46E5]">
                        {s.parMois} TND
                      </p>
                      <p className="text-xs text-gray-400">/mois</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Offres (ou offres liées si service sélectionné) */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-1">
              {selection?.kind === "service"
                ? "Offres incluant ce service"
                : "Offres / Packs"}
            </h2>
            {selection?.kind === "service" && relatedOffres.length > 0 && (
              <p className="text-xs text-green-600 mb-4">
                Économisez avec un pack !
              </p>
            )}
            <div className="space-y-3">
              {(selection?.kind === "service" ? relatedOffres : offres).map(
                (o) => (
                  <button
                    key={o.id}
                    onClick={() => selectOffre(o)}
                    className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                      selection?.kind === "offre" && selection.item.id === o.id
                        ? "border-[#4F46E5] bg-indigo-50"
                        : "border-gray-200 hover:border-[#4F46E5]"
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-semibold text-gray-900 text-sm">
                          {o.intituleOffre}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {o.description}
                        </p>
                        {o.services.length > 0 && (
                          <p className="text-xs text-[#4F46E5] mt-1">
                            {o.services.join(", ")}
                          </p>
                        )}
                      </div>
                      <div className="text-right shrink-0 ml-3">
                        <p className="text-sm font-bold text-[#4F46E5]">
                          {o.parMois} TND
                        </p>
                        <p className="text-xs text-gray-400">/mois</p>
                      </div>
                    </div>
                  </button>
                )
              )}
              {selection?.kind === "service" &&
                relatedOffres.length === 0 && (
                  <p className="text-gray-400 text-sm text-center py-4">
                    Aucune offre disponible pour ce service.
                  </p>
                )}
            </div>
          </div>
        </div>

        {/* Colonne droite — récapitulatif */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">
            Récapitulatif
          </h2>

          {!selection ? (
            <div className="flex items-center justify-center h-48 text-gray-400 text-sm">
              Sélectionnez un service ou une offre
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
                </button>
              </div>

              <div className="bg-gray-50 rounded-xl p-4 mb-6 space-y-2">
                <div className="flex justify-between text-sm text-gray-600">
                  <span>{selectionLabel}</span>
                  <span className="font-medium">{selectionName}</span>
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
                {loading
                  ? "Redirection vers Stripe..."
                  : `Payer ${montant} TND`}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
