import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Navbar from "../../components/public_layout/Navbar";
import Footer from "../../components/public_layout/Footer";
import { useAuth } from "../../context/useAuth";
import { API_URL } from "../../api/config";

interface Service {
  id: string;
  intituleService: string;
  description: string;
  parMois: number;
  parAnnee: number;
}

interface Offre {
  id: string;
  intituleOffre: string;
  description: string;
  parMois: number;
  parAnnee: number;
  services: string[];
}

const heroFeatures = [
  {
    icon: (
      <svg
        className="w-6 h-6"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M13 10V3L4 14h7v7l9-11h-7z"
        />
      </svg>
    ),
    title: "Ultra Rapide",
    description:
      "Mises à jour instantanées et synchronisation en temps réel sur tous vos appareils",
  },
  {
    icon: (
      <svg
        className="w-6 h-6"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z"
        />
      </svg>
    ),
    title: "Sécurisé & Privé",
    description:
      "Chiffrement bancaire pour protéger vos données en toute sécurité",
  },
  {
    icon: (
      <svg
        className="w-6 h-6"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z"
        />
      </svg>
    ),
    title: "Analyses IA",
    description:
      "Insights intelligents pour optimiser et économiser sur vos abonnements",
  },
];

function CheckIcon() {
  return (
    <svg
      className="w-4 h-4 shrink-0 text-[#4F46E5]"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.5}
      viewBox="0 0 24 24"
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  );
}

export default function Landing() {
  const navigate = useNavigate();
  const { user } = useAuth(); // ← ici

  const handleSubscribe = (offreId: string) => {
    // ← et ici
    if (user) {
      localStorage.setItem("pendingOffreId", offreId);
      navigate("/dashboard/client/payment");
    } else {
      localStorage.setItem("pendingOffreId", offreId);
      navigate("/login");
    }
  };

  const handleSubscribeService = (serviceId: string) => {
    localStorage.setItem("pendingServiceId", serviceId);
    if (user) {
      navigate("/dashboard/client/payment");
    } else {
      navigate("/login");
    }
  };
  const [services, setServices] = useState<Service[]>([]);
  const [offres, setOffres] = useState<Offre[]>([]);
  const [servicesLoading, setServicesLoading] = useState(true);
  const [offresLoading, setOffresLoading] = useState(true);
  const [selectedService, setSelectedService] = useState<string | null>(null);
  const offresRef = useRef<HTMLDivElement>(null);
  

  useEffect(() => {
    axios
      .get(`${API_URL}/api/services/public`)
      .then((res) => setServices(res.data))
      .catch(() => console.error("Erreur chargement services publics"))
      .finally(() => setServicesLoading(false));

    axios
      .get(`${API_URL}/api/offres/public`)
      .then((res) => setOffres(res.data))
      .catch(() => console.error("Erreur chargement offres publics"))
      .finally(() => setOffresLoading(false));
  }, []);

  const filteredOffres = selectedService
    ? offres
        .filter((o) => o.services.includes(selectedService))
        .sort((a, b) => b.services.length - a.services.length) // multi-services en premier
    : offres;

  // Scroll infini manuel pour les offres
  useEffect(() => {
    const el = offresRef.current;
    if (!el || filteredOffres.length === 0) return;
    // Si service sélectionné → scroll normal
    if (selectedService) {
      el.scrollLeft = 0;
      return;
    }
    // Sinon → boucle infinie
    const third = el.scrollWidth / 3;
    el.scrollLeft = third;

    const handleScroll = () => {
      const third = el.scrollWidth / 3;
      if (el.scrollLeft >= third * 2) {
        el.scrollLeft -= third;
      } else if (el.scrollLeft <= 0) {
        el.scrollLeft += third;
      }
    };

    el.addEventListener("scroll", handleScroll);
    return () => el.removeEventListener("scroll", handleScroll);
  }, [filteredOffres, selectedService]);

  const handleServiceClick = (intituleService: string) => {
    setSelectedService(intituleService);
    document.getElementById("offres")?.scrollIntoView({ behavior: "smooth" });
  };

  // Services x2 pour CSS loop, Offres x3 pour scroll manuel infini
  const loopServices = [...services, ...services];
  const loopOffres = [...filteredOffres, ...filteredOffres, ...filteredOffres];

  return (
    <div className="min-h-screen bg-white font-sans">
      <Navbar />

      {/* Hero */}
      <section className="pt-36 pb-24 px-6 bg-linear-to-b from-gray-50 to-white">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-extrabold text-gray-900 leading-tight mb-6">
            Gérez vos abonnements{" "}
            <span className="text-[#4F46E5]">en toute simplicité</span>
          </h1>
          <p className="text-lg text-gray-500 max-w-2xl mx-auto mb-10 leading-relaxed">
            AxiaAbonnement est la plateforme moderne pour gérer tous vos
            abonnements en un seul endroit. Suivez, analysez et optimisez vos
            paiements récurrents avec des analyses intelligentes.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-20">
            <button
              onClick={() => navigate("/register")}
              className="bg-[#4F46E5] hover:bg-[#3730A3] text-white font-semibold px-8 py-3.5 rounded-xl transition-colors flex items-center gap-2"
            >
              Commencer
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"
                />
              </svg>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {heroFeatures.map((f) => (
              <div
                key={f.title}
                className="flex flex-col items-center text-center gap-3"
              >
                <div className="w-14 h-14 bg-[#4F46E5]/10 text-[#4F46E5] rounded-2xl flex items-center justify-center">
                  {f.icon}
                </div>
                <h4 className="font-bold text-gray-900">{f.title}</h4>
                <p className="text-gray-500 text-sm leading-relaxed">
                  {f.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Services — défilement automatique lent */}
      <section id="services" className="py-20 bg-gray-50">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-3">
              Nos Services
            </h2>
            <p className="text-gray-500">
              Cliquez sur un service pour voir les offres disponibles
            </p>
          </div>
        </div>

        {servicesLoading ? (
          <div className="flex justify-center py-16">
            <div className="w-8 h-8 border-4 border-[#4F46E5] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : services.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-gray-400 text-sm">
              Aucun service disponible pour le moment.
            </p>
          </div>
        ) : (
          <div className="overflow-hidden">
            <div className="flex gap-4 animate-scroll-loop w-max pb-2">
              {loopServices.map((s, i) => (
                <div
                  key={`${s.id}-${i}`}
                  onClick={() => handleServiceClick(s.intituleService)}
                  className={`bg-white border-2 rounded-2xl p-6 flex flex-col cursor-pointer hover:shadow-lg transition-all duration-300 shrink-0 w-64 ${
                    selectedService === s.intituleService
                      ? "border-[#4F46E5]"
                      : "border-gray-200"
                  }`}
                >
                  <h3 className="text-base font-bold text-gray-900 mb-2">
                    {s.intituleService}
                  </h3>
                  <p className="text-gray-500 text-sm">{s.description}</p>
                  <div className="flex items-baseline gap-1 mb-3">
                    <span className="text-xl font-bold text-[#4F46E5]">
                      {s.parMois}
                    </span>
                    <span className="text-xs text-[#4F46E5]">TND</span>
                    <span className="text-gray-400 text-xs">/mois</span>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSubscribeService(s.id);
                    }}
                    className="w-full py-2 rounded-lg text-xs font-semibold border border-[#4F46E5] text-[#4F46E5] hover:bg-[#4F46E5] hover:text-white transition-all"
                  >
                    Choisir ce service
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* Offres — scroll manuel infini */}
      <section id="offres" className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-4">
            <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-3">
              Nos Offres
            </h2>
            <p className="text-gray-500">
              {selectedService
                ? `Offres incluant "${selectedService}"`
                : "Économisez avec nos packs combinés"}
            </p>
          </div>

          {selectedService && (
            <div className="flex justify-center mb-8">
              <button
                onClick={() => setSelectedService(null)}
                className="flex items-center gap-2 text-sm text-gray-500 hover:text-[#4F46E5] transition-colors"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
                Voir toutes les offres
              </button>
            </div>
          )}
        </div>

        {offresLoading ? (
          <div className="flex justify-center py-16">
            <div className="w-8 h-8 border-4 border-[#4F46E5] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filteredOffres.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-gray-400 text-sm">
              Aucune offre disponible pour ce service.
            </p>
          </div>
        ) : selectedService ? (
          <div className="flex flex-col gap-6 w-full">
            {/* Ligne 1 — multi-services */}
            {filteredOffres.filter((o) => o.services.length > 1).length > 0 && (
              <div className="flex justify-center gap-6 overflow-x-auto scrollbar-hide pb-2">
                {filteredOffres
                  .filter((o) => o.services.length > 1)
                  .map((o, index) => (
                    <div
                      key={`multi-${o.id}-${index}`}
                      className="relative rounded-2xl p-8 flex flex-col shrink-0 w-80 border border-gray-200 bg-white hover:shadow-md transition-all duration-300 justify-between"
                    >
                      {/* contenu carte */}
                      <h3 className="text-xl font-bold text-gray-900 mb-1">
                        {o.intituleOffre}
                      </h3>
                      <p className="text-gray-500 text-sm mb-4">
                        {o.description}
                      </p>
                      {o.services.length > 1 && (
                        <div className="bg-gray-50 rounded-xl p-4 mb-4 overflow-y-auto scrollbar-hide max-h-38">
                          <p className="text-xs text-gray-500 mb-2">Inclut :</p>
                          <ul className="flex flex-col gap-1.5">
                            {o.services.map((s) => (
                              <li
                                key={s}
                                className="flex items-center gap-2 text-sm text-gray-700"
                              >
                                <CheckIcon />
                                {s}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      <div className="flex items-baseline gap-2 mb-1">
                        <span className="text-3xl font-bold text-[#4F46E5]">
                          {o.parMois}
                        </span>
                        <span className="text-sm text-[#4F46E5] font-medium">
                          TND
                        </span>
                        <span className="text-gray-400 text-sm">/mois</span>
                      </div>
                      <p className="text-gray-500 text-sm mb-6">
                        <span className="font-semibold text-gray-700">
                          {o.parAnnee}
                        </span>
                        <span className="text-xs text-gray-500 ml-1">TND</span>{" "}
                        /an
                      </p>
                      <button
                        onClick={() => handleSubscribe(o.id)}
                        className="w-full py-3 rounded-xl font-semibold text-sm transition-all duration-300 mt-auto border border-[#4F46E5] text-[#4F46E5] hover:bg-[#4F46E5] hover:text-white"
                      >
                        Choisir cette offre
                      </button>
                    </div>
                  ))}
              </div>
            )}
            {/* Ligne 2 — service unique */}
            {filteredOffres.filter((o) => o.services.length === 1).length >
              0 && (
              <div className="flex justify-center gap-6">
                {filteredOffres
                  .filter((o) => o.services.length === 1)
                  .map((o, index) => (
                    <div
                      key={`solo-${o.id}-${index}`}
                      className="relative rounded-2xl p-8 flex flex-col shrink-0 w-80 border border-gray-200 bg-white hover:shadow-md transition-all duration-300 justify-between"
                    >
                      <h3 className="text-xl font-bold text-gray-900 mb-1">
                        {o.intituleOffre}
                      </h3>
                      <p className="text-gray-500 text-sm mb-4">
                        {o.description}
                      </p>
                      <div className="flex items-baseline gap-2 mb-1">
                        <span className="text-3xl font-bold text-[#4F46E5]">
                          {o.parMois}
                        </span>
                        <span className="text-sm text-[#4F46E5] font-medium">
                          TND
                        </span>
                        <span className="text-gray-400 text-sm">/mois</span>
                      </div>
                      <p className="text-gray-500 text-sm mb-6">
                        <span className="font-semibold text-gray-700">
                          {o.parAnnee}
                        </span>
                        <span className="text-xs text-gray-500 ml-1">TND</span>{" "}
                        /an
                      </p>
                      <button
                        onClick={() => handleSubscribe(o.id)}
                        className="w-full py-3 rounded-xl font-semibold text-sm transition-all duration-300 mt-auto border border-[#4F46E5] text-[#4F46E5] hover:bg-[#4F46E5] hover:text-white"
                      >
                        Choisir cette offre
                      </button>
                    </div>
                  ))}
              </div>
            )}
          </div>
        ) : (
          <div
            ref={offresRef}
            className="flex gap-6 overflow-x-auto scrollbar-hide scroll-instant items-stretch pb-4 pt-4"
          >
            {loopOffres.map((o, index) => (
              <div
                key={`${o.id}-${index}`}
                className="relative rounded-2xl p-8 flex flex-col shrink-0 w-80 border border-gray-200 bg-white hover:shadow-md transition-all duration-300 justify-between"
              >
                <h3 className="text-xl font-bold text-gray-900 mb-1">
                  {o.intituleOffre}
                </h3>
                <p className="text-gray-500 text-sm mb-4">{o.description}</p>

                {o.services.length > 1 && (
                  <div className="bg-gray-50 rounded-xl p-4 mb-4 overflow-y-auto scrollbar-hide max-h-38">
                    <p className="text-xs text-gray-500 mb-2">Inclut :</p>
                    <ul className="flex flex-col gap-1.5">
                      {o.services.map((s) => (
                        <li
                          key={s}
                          className="flex items-center gap-2 text-sm text-gray-700"
                        >
                          <CheckIcon />
                          {s}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="flex items-baseline gap-2 mb-1">
                  <span className="text-3xl font-bold text-[#4F46E5]">
                    {o.parMois}
                  </span>
                  <span className="text-sm text-[#4F46E5] font-medium">
                    TND
                  </span>
                  <span className="text-gray-400 text-sm">/mois</span>
                </div>
                <p className="text-gray-500 text-sm mb-6">
                  <span className="font-semibold text-gray-700">
                    {o.parAnnee}
                  </span>
                  <span className="text-xs text-gray-500 ml-1">TND</span> /an
                </p>

                <button
                  onClick={() => handleSubscribe(o.id)}
                  className="w-full py-3 rounded-xl font-semibold text-sm transition-all duration-300 mt-auto border border-[#4F46E5] text-[#4F46E5] hover:bg-[#4F46E5] hover:text-white"
                >
                  S'abonner
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      <Footer />
    </div>
  );
}
