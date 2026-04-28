import { useEffect, useState } from "react";
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
  moyenneNote?: number | null;
  nombreAvis?: number | null;
}

interface Service {
  id: string;
  intituleService: string;
  description: string;
  parMois: number;
  parAnnee: number;
  moyenneNote?: number | null;
  nombreAvis?: number | null;
}

type Selection =
  | { kind: "offre"; item: Offre }
  | { kind: "service"; item: Service };

function StarRating({ moyenne, nombreAvis }: { moyenne?: number | null; nombreAvis?: number | null }) {
  if (!moyenne || !nombreAvis || nombreAvis < 3) return null;
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((i) => (
        <svg
          key={i}
          className={`w-4 h-4 ${i <= Math.round(moyenne) ? "text-yellow-400" : "text-gray-200"}`}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
      <span className="text-xs text-gray-400 ml-1">{moyenne.toFixed(1)} ({nombreAvis} avis)</span>
    </div>
  );
}

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

      const pendingOffreId = localStorage.getItem("pendingOffreId");
      const pendingServiceId = localStorage.getItem("pendingServiceId");

      if (pendingServiceId) {
        const found = servicesData.find((s) => s.id === pendingServiceId);
        if (found) {
          setSelection({ kind: "service", item: found });
          setRelatedOffres(
            offresData.filter((o) => o.services.includes(found.intituleService)),
          );
        }
        localStorage.removeItem("pendingServiceId");
      } else if (pendingOffreId) {
        const found = offresData.find((o) => o.id === pendingOffreId);
        if (found) setSelection({ kind: "offre", item: found });
        localStorage.removeItem("pendingOffreId");
      }
    };

    void loadData();
  }, []);

  const selectService = (s: Service) => {
    setSelection({ kind: "service", item: s });
    setRelatedOffres(offres.filter((o) => o.services.includes(s.intituleService)));
  };

  const selectOffre = (o: Offre) => {
    setSelection({ kind: "offre", item: o });
    setRelatedOffres([]);
  };

  const getPrice = (x: { parMois: number; parAnnee: number }) =>
    type === "annuel" ? x.parAnnee : x.parMois;

  const montant =
    selection == null
      ? null
      : type === "annuel"
        ? selection.item.parAnnee
        : selection.item.parMois;

  const selectionName = selection
    ? selection.kind === "offre"
      ? (selection.item as Offre).intituleOffre
      : (selection.item as Service).intituleService
    : "";

  const selectionLabel = selection?.kind === "offre" ? "Offre" : "Service";

  const handlePay = async () => {
    if (!selection) return;
    setLoading(true);
    try {
      const body =
        selection.kind === "offre"
          ? { offreId: selection.item.id, type }
          : { serviceId: selection.item.id, type };
      const res = await axiosInstance.post("/payment/create-checkout-session", body);
      window.location.href = res.data.url;
    } catch {
      setLoading(false);
    }
  };

  const shownOffres = selection?.kind === "service" ? relatedOffres : offres;

  const cardClass = (isSelected: boolean) =>
    `text-left rounded-2xl border p-5 bg-white shadow-sm transition-all ${
      isSelected
        ? "ring-4"
        : "border-gray-200"
    }`;

  return (
    <div className="ui-page">
      <div className="mb-6">
        <h1 className="ui-title">Paiement</h1>
        <p className="ui-subtitle">
          Choisissez un service ou une offre et complétez votre abonnement.
        </p>
      </div>

      {/* Switch Mensuel/Annuel */}
      <div className="mb-6">
        <div className="inline-flex p-1 rounded-2xl border border-gray-200 bg-white shadow-sm">
          <button
            onClick={() => setType("mensuel")}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition ${
              type === "mensuel" ? "text-white" : "text-gray-600 hover:bg-gray-50"
            }`}
            style={type === "mensuel" ? { background: "var(--color-primary)" } : undefined}
          >
            Mensuel
          </button>
          <button
            onClick={() => setType("annuel")}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition ${
              type === "annuel" ? "text-white" : "text-gray-600 hover:bg-gray-50"
            }`}
            style={type === "annuel" ? { background: "var(--color-primary)" } : undefined}
          >
            Annuel
          </button>
        </div>
      </div>

      {/* Layout principal */}
      <div className="grid lg:grid-cols-[1fr_420px] gap-6 items-start">
        {/* Colonne gauche */}
        <div className="space-y-8">
          {/* SERVICES */}
          <div>
            <h2 className="text-xs font-bold tracking-widest text-gray-400 mb-4">
              SERVICES
            </h2>
            <div className="grid sm:grid-cols-2 gap-4">
              {services.map((s) => {
                const isSelected =
                  selection?.kind === "service" && selection.item.id === s.id;
                const price = getPrice(s);

                return (
                  <button
                    key={s.id}
                    onClick={() => selectService(s)}
                    className={cardClass(isSelected)}
                    style={
                      isSelected
                        ? {
                            borderColor: "var(--color-primary)",
                            boxShadow: `0 0 0 4px color-mix(in srgb, var(--color-primary) 10%, transparent)`,
                          }
                        : undefined
                    }
                  >
                    <p className="font-bold text-gray-900">{s.intituleService}</p>
                    <p className="text-sm text-gray-500 mt-1 line-clamp-2">{s.description}</p>
                    <StarRating moyenne={s.moyenneNote} nombreAvis={s.nombreAvis} />
                    <div className="mt-4">
                      <p className="text-2xl font-extrabold" style={{ color: "var(--color-primary)" }}>
                        {price}{" "}
                        <span className="text-sm font-semibold text-gray-400">
                          TND/{type === "annuel" ? "an" : "mois"}
                        </span>
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* OFFRES / PACKS */}
          <div>
            <div className="flex items-end justify-between gap-3 mb-4">
              <div>
                <h2 className="text-xs font-bold tracking-widest text-gray-400">
                  {selection?.kind === "service" ? "OFFRES LIÉES" : "OFFRES / PACKS"}
                </h2>
                {selection?.kind === "service" && (
                  <p className="text-xs text-green-600 mt-1">
                    {relatedOffres.length > 0
                      ? "Économisez avec un pack !"
                      : "Aucune offre liée à ce service."}
                  </p>
                )}
              </div>
            </div>

            {shownOffres.length === 0 ? (
              <div className="bg-white rounded-2xl border border-gray-200 p-6 text-sm text-gray-400">
                Aucune offre disponible.
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 gap-4">
                {shownOffres.map((o) => {
                  const isSelected =
                    selection?.kind === "offre" && selection.item.id === o.id;
                  const price = getPrice(o);

                  return (
                    <button
                      key={o.id}
                      onClick={() => selectOffre(o)}
                      className={cardClass(isSelected)}
                      style={
                        isSelected
                          ? {
                              borderColor: "var(--color-primary)",
                              boxShadow: `0 0 0 4px color-mix(in srgb, var(--color-primary) 10%, transparent)`,
                            }
                          : undefined
                      }
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="font-bold text-gray-900 truncate">{o.intituleOffre}</p>
                          <p className="text-sm text-gray-500 mt-1 line-clamp-2">{o.description}</p>
                          <StarRating moyenne={o.moyenneNote} nombreAvis={o.nombreAvis} />
                        </div>
                      </div>

                      <div className="mt-4">
                        <p className="text-2xl font-extrabold" style={{ color: "var(--color-primary)" }}>
                          {price}{" "}
                          <span className="text-sm font-semibold text-gray-400">
                            TND/{type === "annuel" ? "an" : "mois"}
                          </span>
                        </p>
                      </div>

                      {o.services?.length > 0 && (
                        <div className="mt-4 flex flex-wrap gap-2">
                          {o.services.slice(0, 4).map((srv) => (
                            <span
                              key={srv}
                              className="px-3 py-1 rounded-full text-xs font-semibold"
                              style={{
                                background: "var(--color-primary-soft)",
                                color: "var(--color-primary)",
                              }}
                            >
                              {srv}
                            </span>
                          ))}
                          {o.services.length > 4 && (
                            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-600">
                              +{o.services.length - 4}
                            </span>
                          )}
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Colonne droite — Récap sticky */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 lg:sticky lg:top-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Récapitulatif</h2>

          {!selection ? (
            <div className="flex items-center justify-center h-56 text-gray-400 text-sm">
              Sélectionnez un service ou une offre
            </div>
          ) : (
            <>
              <div className="bg-gray-50 rounded-xl p-4 mb-6 space-y-2">
                <div className="flex justify-between text-sm text-gray-600">
                  <span>{selectionLabel}</span>
                  <span className="font-medium">{selectionName}</span>
                </div>
                <StarRating moyenne={selection.item.moyenneNote} nombreAvis={selection.item.nombreAvis} />
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
                className="w-full py-3 text-white rounded-xl font-semibold text-sm transition-all disabled:opacity-50"
                style={{ background: "var(--color-primary)" }}
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