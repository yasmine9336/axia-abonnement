import { useEffect, useMemo, useState } from "react";
import axiosInstance from "../../../services/api/axiosInstance";

import ServicesList from "./components/ServicesList";
import OffresList from "./components/OffresList";
import SubscriptionSummary from "./components/SubscriptionSummary";

import type { BillingType, Offre, Selection, Service } from "./types";
import { getRelatedOffres } from "./utils";

export default function SubscriptionSection() {
  const [offres, setOffres] = useState<Offre[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [selection, setSelection] = useState<Selection | null>(null);
  const [relatedOffres, setRelatedOffres] = useState<Offre[]>([]);
  const [type, setType] = useState<BillingType>("mensuel");
  const [loading, setLoading] = useState(false);
  const [payError, setPayError] = useState("");

  const [secteurActif, setSecteurActif] = useState<string | null>(null);

  const secteurs = useMemo(() => {
    const all = [
      ...services.map((s) => s.secteurActivite),
      ...offres.map((o) => o.secteurActivite),
    ].filter((s): s is string => !!s);
    return [...new Set(all)];
  }, [services, offres]);

  const servicesFiltres = secteurActif
    ? services.filter((s) => s.secteurActivite === secteurActif)
    : services;

  const offresFiltrees = secteurActif
    ? offres.filter((o) => o.secteurActivite === secteurActif)
    : offres;

  useEffect(() => {
    const loadData = async () => {
      const [offresResponse, servicesResponse] = await Promise.all([
        axiosInstance.get<Offre[]>("/offres"),
        axiosInstance.get<Service[]>("/services"),
      ]);

      const offresData = offresResponse.data ?? [];
      const servicesData = servicesResponse.data ?? [];

      setOffres(offresData);
      setServices(servicesData);

      const pendingOffreId = localStorage.getItem("pendingOffreId");
      const pendingServiceId = localStorage.getItem("pendingServiceId");

      if (pendingServiceId) {
        const foundService = servicesData.find(
          (service) => service.id === pendingServiceId,
        );

        if (foundService) {
          setSelection({ kind: "service", item: foundService });
          setRelatedOffres(getRelatedOffres(foundService, offresData));
        }

        localStorage.removeItem("pendingServiceId");
        return;
      }

      if (pendingOffreId) {
        const foundOffre = offresData.find(
          (offre) => offre.id === pendingOffreId,
        );

        if (foundOffre) {
          setSelection({ kind: "offre", item: foundOffre });
        }

        localStorage.removeItem("pendingOffreId");
      }
    };

    void loadData();
  }, []);

  const selectService = (service: Service) => {
    setSelection({ kind: "service", item: service });
    setRelatedOffres(getRelatedOffres(service, offres));
  };

  const selectOffre = (offre: Offre) => {
    setSelection({ kind: "offre", item: offre });
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

      const response = await axiosInstance.post<{
        url: string;
      }>("/payment/create-checkout-session", body);

      window.location.href = response.data.url;
    } catch {
      setPayError(
        "Une erreur est survenue lors du traitement de votre paiement.",
      );
      setLoading(false);
    }
  };

  const shownOffres = selection?.kind === "service" ? relatedOffres : offres;

  return (
    <div className="ui-page">
      <div className="mb-6">
        <h1 className="ui-title">Souscrire un abonnement</h1>
        <p className="ui-subtitle">
          Choisissez un service ou une offre, puis finalisez votre souscription.
        </p>
      </div>

      <div className="grid lg:grid-cols-[220px_1fr_320px] gap-6 items-start">
        <div className="bg-white rounded-2xl border border-gray-200 p-4 lg:sticky lg:top-6 h-full">
          <p className="text-xs font-bold tracking-widest text-gray-400 mb-3 px-1">
            SECTEURS
          </p>
          <div className="space-y-0.5">
            <button
              type="button"
              onClick={() => setSecteurActif(null)}
              className={`w-full text-left text-sm px-3 py-2.5 rounded-xl transition-all font-semibold flex items-center justify-between ${
                secteurActif === null
                  ? "bg-blue-600 text-white"
                  : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              <span>Tous</span>
              <span
                className={`text-xs rounded-full px-2 py-0.5 ${secteurActif === null ? "bg-white/20 text-white" : "bg-gray-100 text-gray-500"}`}
              >
                {services.length + offres.length}
              </span>
            </button>
            {secteurs.map((secteur) => {
              const count =
                services.filter((s) => s.secteurActivite === secteur).length +
                offres.filter((o) => o.secteurActivite === secteur).length;
              return (
                <button
                  key={secteur}
                  type="button"
                  onClick={() => setSecteurActif(secteur)}
                  className={`w-full text-left text-sm px-3 py-2.5 rounded-xl transition-all font-medium flex items-center justify-between gap-2 ${
                    secteurActif === secteur
                      ? "bg-blue-600 text-white"
                      : "text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  <span className="leading-tight">{secteur}</span>
                  <span
                    className={`shrink-0 text-xs rounded-full px-2 py-0.5 ${secteurActif === secteur ? "bg-white/20 text-white" : "bg-gray-100 text-gray-500"}`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="space-y-8">
          <ServicesList
            services={servicesFiltres}
            selection={selection}
            type={type}
            onSelect={selectService}
          />

          <OffresList
            offres={secteurActif ? offresFiltrees : shownOffres}
            relatedOffresCount={relatedOffres.length}
            selection={selection}
            type={type}
            onSelect={selectOffre}
          />
        </div>

        <SubscriptionSummary
          selection={selection}
          type={type}
          loading={loading}
          payError={payError}
          onTypeChange={setType}
          onPay={() => void handlePay()}
        />
      </div>
    </div>
  );
}
