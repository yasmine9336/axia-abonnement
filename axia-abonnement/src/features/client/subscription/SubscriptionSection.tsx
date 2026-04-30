import { useEffect, useState } from "react";
import axios from "axios";
import axiosInstance from "../../../api/axiosInstance";
import { API_URL } from "../../../api/config";

import BillingTypeSwitch from "./components/BillingTypeSwitch";
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

  useEffect(() => {
    const loadData = async () => {
      const [offresResponse, servicesResponse] = await Promise.all([
        axiosInstance.get<Offre[]>("/offres/public"),
        axios.get<Service[]>(`${API_URL}/api/services/public`),
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

      <BillingTypeSwitch type={type} onChange={setType} />

      <div className="grid lg:grid-cols-[1fr_420px] gap-6 items-start">
        <div className="space-y-8">
          <ServicesList
            services={services}
            selection={selection}
            type={type}
            onSelect={selectService}
          />

          <OffresList
            offres={shownOffres}
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
          onPay={() => void handlePay()}
        />
      </div>
    </div>
  );
}