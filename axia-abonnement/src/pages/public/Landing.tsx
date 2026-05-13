import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

import Navbar from "../../components/layout/Navbar";
import Footer from "../../components/layout/Footer";
import { useAuth } from "../../hooks/useAuth";
import { API_URL } from "../../services/api/config";

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
    navigate(user ? "/dashboard/client/subscribe" : "/login", {
      state: { from: "/dashboard/client/subscribe" },
    });
  };

  const handleSubscribeService = (serviceId: string) => {
    localStorage.setItem("pendingServiceId", serviceId);
    navigate(user ? "/dashboard/client/subscribe" : "/login", {
      state: { from: "/dashboard/client/subscribe" },
    });
  };

  const handleVoirPlus = () => {
    navigate(user ? "/dashboard/client/subscribe" : "/login", {
      state: { from: "/dashboard/client/subscribe" },
    });
  };

  return (
    <div className="min-h-screen bg-linear-to-b from-blue-50 via-indigo-50/40 to-white font-sans">
      <Navbar />
      <HeroSection />

      <section className="py-20 border-t border-gray-100">
        <h2 className="text-2xl font-bold text-center text-gray-900 mb-12">
          Simple en 3 étapes
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto px-6">
          {[
            {
              step: "01",
              title: "Créez votre compte",
              desc: "Client ou responsable, l'inscription prend moins de 2 minutes.",
            },
            {
              step: "02",
              title: "Gérez vos offres & services",
              desc: "Les responsables configurent, les clients choisissent et s'abonnent.",
            },
            {
              step: "03",
              title: "Suivez en temps réel",
              desc: "Tableaux de bord personnalisés selon votre rôle, alertes intelligentes incluses.",
            },
          ].map((s) => (
            <div key={s.step} className="text-center px-4">
              <span className="text-6xl font-black text-blue-100 leading-none">
                {s.step}
              </span>
              <h3 className="text-base font-bold text-gray-900 mt-2">
                {s.title}
              </h3>
              <p className="text-sm text-gray-500 mt-1">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <ServicesSection
        services={services}
        loading={servicesLoading}
        onSubscribeService={handleSubscribeService}
        onVoirPlus={handleVoirPlus}
      />
      <OffresSection
        offres={offres}
        loading={offresLoading}
        onSubscribe={handleSubscribe}
        onVoirPlus={handleVoirPlus}
      />

      <Footer />
    </div>
  );
}