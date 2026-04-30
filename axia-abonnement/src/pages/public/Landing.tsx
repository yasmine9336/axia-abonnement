import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

import Navbar from "../../components/layout/Navbar";
import Footer from "../../components/layout/Footer";
import { useAuth } from "../../hooks/useAuth";
import { API_URL } from "../../api/config";

import HeroSection from "./components/HeroSection";
import ServicesSection from "./components/ServicesSection";
import OffresSection from "./components/OffresSection";

import type { Offre, Service } from "./types";

export default function Landing() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [services, setServices] = useState<Service[]>([]);
  const [offres, setOffres] = useState<Offre[]>([]);
  const [servicesLoading, setServicesLoading] = useState(true);
  const [offresLoading, setOffresLoading] = useState(true);
  const [selectedService, setSelectedService] = useState<string | null>(null);

  useEffect(() => {
    axios
      .get<Service[]>(`${API_URL}/api/services/public`)
      .then((response) => setServices(response.data ?? []))
      .catch(() => console.error("Erreur chargement services publics"))
      .finally(() => setServicesLoading(false));

    axios
      .get<Offre[]>(`${API_URL}/api/offres/public`)
      .then((response) => setOffres(response.data ?? []))
      .catch(() => console.error("Erreur chargement offres publics"))
      .finally(() => setOffresLoading(false));
  }, []);

  const handleSubscribe = (offreId: string) => {
    localStorage.setItem("pendingOffreId", offreId);
    navigate(user ? "/dashboard/client/subscribe" : "/login");
  };

  const handleSubscribeService = (serviceId: string) => {
    localStorage.setItem("pendingServiceId", serviceId);
    navigate(user ? "/dashboard/client/subscribe" : "/login");
  };

  const filteredOffres = useMemo(() => {
    if (!selectedService) return offres;

    return offres
      .filter((offre) => offre.services.includes(selectedService))
      .sort((first, second) => second.services.length - first.services.length);
  }, [offres, selectedService]);

  const handleServiceClick = (intituleService: string) => {
    setSelectedService(intituleService);

    document.getElementById("offres")?.scrollIntoView({
      behavior: "smooth",
    });
  };

  return (
    <div className="min-h-screen bg-white font-sans">
      <Navbar />

      <HeroSection />

      <ServicesSection
        services={services}
        loading={servicesLoading}
        selectedService={selectedService}
        onSelectService={handleServiceClick}
        onSubscribeService={handleSubscribeService}
      />

      <OffresSection
        offres={filteredOffres}
        loading={offresLoading}
        selectedService={selectedService}
        onClearSelectedService={() => setSelectedService(null)}
        onSubscribe={handleSubscribe}
      />

      <Footer />
    </div>
  );
}