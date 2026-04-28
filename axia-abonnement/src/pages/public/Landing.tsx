import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Navbar from "../../components/layout/Navbar";
import Footer from "../../components/layout/Footer";
import { useAuth } from "../../hooks/useAuth";
import { API_URL } from "../../api/config";
import { Zap, Shield, BarChart3, Check, ChevronLeft } from "lucide-react";

interface Service {
  id: string;
  intituleService: string;
  description: string;
  parMois: number;
  parAnnee: number;
  moyenneNote?: number | null;
  nombreAvis?: number | null;
}

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

function StarRating({ moyenne, nombreAvis }: { moyenne?: number | null; nombreAvis?: number | null }) {
  if (!moyenne || !nombreAvis || nombreAvis < 3) return null;
  return (
    <div className="flex items-center gap-1 mb-3">
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

const heroFeatures = [
  {
    icon: <Zap className="w-6 h-6" />,
    title: "Ultra Rapide",
    description: "Mises à jour instantanées et synchronisation en temps réel sur tous vos appareils",
  },
  {
    icon: <Shield className="w-6 h-6" />,
    title: "Sécurisé & Privé",
    description: "Chiffrement bancaire pour protéger vos données en toute sécurité",
  },
  {
    icon: <BarChart3 className="w-6 h-6" />,
    title: "Analyses IA",
    description: "Insights intelligents pour optimiser et économiser sur vos abonnements",
  },
];

export default function Landing() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleSubscribe = (offreId: string) => {
    localStorage.setItem("pendingOffreId", offreId);
    navigate(user ? "/dashboard/client/payment" : "/login");
  };

  const handleSubscribeService = (serviceId: string) => {
    localStorage.setItem("pendingServiceId", serviceId);
    navigate(user ? "/dashboard/client/payment" : "/login");
  };

  const [services, setServices] = useState<Service[]>([]);
  const [offres, setOffres] = useState<Offre[]>([]);
  const [servicesLoading, setServicesLoading] = useState(true);
  const [offresLoading, setOffresLoading] = useState(true);
  const [selectedService, setSelectedService] = useState<string | null>(null);
  const offresRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    axios.get(`${API_URL}/api/services/public`)
      .then((res) => setServices(res.data))
      .catch(() => console.error("Erreur chargement services publics"))
      .finally(() => setServicesLoading(false));

    axios.get(`${API_URL}/api/offres/public`)
      .then((res) => setOffres(res.data))
      .catch(() => console.error("Erreur chargement offres publics"))
      .finally(() => setOffresLoading(false));
  }, []);

  const filteredOffres = selectedService
    ? offres.filter((o) => o.services.includes(selectedService))
        .sort((a, b) => b.services.length - a.services.length)
    : offres;

  useEffect(() => {
    const el = offresRef.current;
    if (!el || filteredOffres.length === 0) return;
    if (selectedService) { el.scrollLeft = 0; return; }
    const third = el.scrollWidth / 3;
    el.scrollLeft = third;
    const handleScroll = () => {
      const third = el.scrollWidth / 3;
      if (el.scrollLeft >= third * 2) el.scrollLeft -= third;
      else if (el.scrollLeft <= 0) el.scrollLeft += third;
    };
    el.addEventListener("scroll", handleScroll);
    return () => el.removeEventListener("scroll", handleScroll);
  }, [filteredOffres, selectedService]);

  const handleServiceClick = (intituleService: string) => {
    setSelectedService(intituleService);
    document.getElementById("offres")?.scrollIntoView({ behavior: "smooth" });
  };

  const loopServices = [...services, ...services];
  const loopOffres = [...filteredOffres, ...filteredOffres, ...filteredOffres];

  const offreCardClass = "relative rounded-2xl p-8 flex flex-col shrink-0 w-80 border border-gray-200 bg-white hover:shadow-md transition-all duration-300 justify-between";

  const SubscribeButton = ({ onClick }: { onClick: () => void }) => (
    <button
      onClick={onClick}
      className="w-full py-3 rounded-xl font-semibold text-sm transition-all duration-300 mt-auto border"
      style={{ borderColor: "var(--color-primary)", color: "var(--color-primary)" }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = "var(--color-primary)";
        e.currentTarget.style.color = "white";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = "transparent";
        e.currentTarget.style.color = "var(--color-primary)";
      }}
    >
      Choisir cette offre
    </button>
  );

  return (
    <div className="min-h-screen bg-white font-sans">
      <Navbar />

      {/* Hero */}
      <section className="pt-36 pb-24 px-6 bg-linear-to-b from-gray-50 to-white">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-extrabold text-gray-900 leading-tight mb-6">
            Gérez vos abonnements{" "}
            <span style={{ color: "var(--color-primary)" }}>en toute simplicité</span>
          </h1>
          <p className="text-lg text-gray-500 max-w-2xl mx-auto mb-10 leading-relaxed">
            AxiaAbonnement est la plateforme moderne pour gérer tous vos abonnements en un seul endroit.
            Suivez, analysez et optimisez vos paiements récurrents avec des analyses intelligentes.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-20">
            <button
              onClick={() => navigate("/register")}
              className="text-white font-semibold px-8 py-3.5 rounded-xl transition-colors flex items-center gap-2"
              style={{ background: "var(--color-primary)" }}
            >
              Commencer
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {heroFeatures.map((f) => (
              <div key={f.title} className="flex flex-col items-center text-center gap-3">
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center"
                  style={{ background: "var(--color-primary-soft)", color: "var(--color-primary)" }}
                >
                  {f.icon}
                </div>
                <h4 className="font-bold text-gray-900">{f.title}</h4>
                <p className="text-gray-500 text-sm leading-relaxed">{f.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Services */}
      <section id="services" className="py-20 bg-gray-50">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-3">Nos Services</h2>
            <p className="text-gray-500">Cliquez sur un service pour voir les offres disponibles</p>
          </div>
        </div>

        {servicesLoading ? (
          <div className="flex justify-center py-16">
            <div className="ui-spinner" />
          </div>
        ) : services.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-gray-400 text-sm">Aucun service disponible pour le moment.</p>
          </div>
        ) : (
          <div className="overflow-hidden">
            <div className="flex gap-4 animate-scroll-loop w-max pb-2">
              {loopServices.map((s, i) => (
                <div
                  key={`${s.id}-${i}`}
                  onClick={() => handleServiceClick(s.intituleService)}
                  className="bg-white rounded-2xl p-6 flex flex-col cursor-pointer hover:shadow-lg transition-all duration-300 shrink-0 w-64 border-2"
                  style={{
                    borderColor: selectedService === s.intituleService
                      ? "var(--color-primary)"
                      : "#e5e7eb",
                  }}
                >
                  <h3 className="text-base font-bold text-gray-900 mb-2">{s.intituleService}</h3>
                  <p className="text-gray-500 text-sm mb-3">{s.description}</p>
                  <div className="flex items-baseline gap-1 mb-3">
                    <span className="text-xl font-bold" style={{ color: "var(--color-primary)" }}>
                      {s.parMois}
                    </span>
                    <span className="text-xs" style={{ color: "var(--color-primary)" }}>TND</span>
                    <span className="text-gray-400 text-xs">/mois</span>
                  </div>
                  <StarRating moyenne={s.moyenneNote} nombreAvis={s.nombreAvis} />
                  <button
                    onClick={(e) => { e.stopPropagation(); handleSubscribeService(s.id); }}
                    className="w-full py-2 rounded-lg text-xs font-semibold border transition-all"
                    style={{ borderColor: "var(--color-primary)", color: "var(--color-primary)" }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = "var(--color-primary)";
                      e.currentTarget.style.color = "white";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = "transparent";
                      e.currentTarget.style.color = "var(--color-primary)";
                    }}
                  >
                    Choisir ce service
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* Offres */}
      <section id="offres" className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-4">
            <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-3">Nos Offres</h2>
            <p className="text-gray-500">
              {selectedService ? `Offres incluant "${selectedService}"` : "Économisez avec nos packs combinés"}
            </p>
          </div>

          {selectedService && (
            <div className="flex justify-center mb-8">
              <button
                onClick={() => setSelectedService(null)}
                className="flex items-center gap-2 text-sm text-gray-500 transition-colors"
                style={{ color: undefined }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "var(--color-primary)")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "#6b7280")}
              >
                <ChevronLeft className="w-4 h-4" />
                Voir toutes les offres
              </button>
            </div>
          )}
        </div>

        {offresLoading ? (
          <div className="flex justify-center py-16">
            <div className="ui-spinner" />
          </div>
        ) : filteredOffres.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-gray-400 text-sm">Aucune offre disponible pour ce service.</p>
          </div>
        ) : selectedService ? (
          <div className="flex flex-col gap-6 w-full">
            {filteredOffres.filter((o) => o.services.length > 1).length > 0 && (
              <div className="flex justify-center gap-6 overflow-x-auto scrollbar-hide pb-2">
                {filteredOffres.filter((o) => o.services.length > 1).map((o, index) => (
                  <div key={`multi-${o.id}-${index}`} className={offreCardClass}>
                    <h3 className="text-xl font-bold text-gray-900 mb-1">{o.intituleOffre}</h3>
                    <p className="text-gray-500 text-sm mb-4">{o.description}</p>
                    {o.services.length > 1 && (
                      <div className="bg-gray-50 rounded-xl p-4 mb-4 overflow-y-auto scrollbar-hide max-h-38">
                        <p className="text-xs text-gray-500 mb-2">Inclut :</p>
                        <ul className="flex flex-col gap-1.5">
                          {o.services.map((s) => (
                            <li key={s} className="flex items-center gap-2 text-sm text-gray-700">
                              <Check className="w-4 h-4 shrink-0" style={{ color: "var(--color-primary)" }} />
                              {s}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    <div className="flex items-baseline gap-2 mb-1">
                      <span className="text-3xl font-bold" style={{ color: "var(--color-primary)" }}>{o.parMois}</span>
                      <span className="text-sm font-medium" style={{ color: "var(--color-primary)" }}>TND</span>
                      <span className="text-gray-400 text-sm">/mois</span>
                    </div>
                    <p className="text-gray-500 text-sm mb-6">
                      <span className="font-semibold text-gray-700">{o.parAnnee}</span>
                      <span className="text-xs text-gray-500 ml-1">TND</span> /an
                    </p>
                    <StarRating moyenne={o.moyenneNote} nombreAvis={o.nombreAvis} />
                    <SubscribeButton onClick={() => handleSubscribe(o.id)} />
                  </div>
                ))}
              </div>
            )}

            {filteredOffres.filter((o) => o.services.length === 1).length > 0 && (
              <div className="flex justify-center gap-6">
                {filteredOffres.filter((o) => o.services.length === 1).map((o, index) => (
                  <div key={`solo-${o.id}-${index}`} className={offreCardClass}>
                    <h3 className="text-xl font-bold text-gray-900 mb-1">{o.intituleOffre}</h3>
                    <p className="text-gray-500 text-sm mb-4">{o.description}</p>
                    <div className="flex items-baseline gap-2 mb-1">
                      <span className="text-3xl font-bold" style={{ color: "var(--color-primary)" }}>{o.parMois}</span>
                      <span className="text-sm font-medium" style={{ color: "var(--color-primary)" }}>TND</span>
                      <span className="text-gray-400 text-sm">/mois</span>
                    </div>
                    <p className="text-gray-500 text-sm mb-6">
                      <span className="font-semibold text-gray-700">{o.parAnnee}</span>
                      <span className="text-xs text-gray-500 ml-1">TND</span> /an
                    </p>
                    <SubscribeButton onClick={() => handleSubscribe(o.id)} />
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div ref={offresRef} className="flex gap-6 overflow-x-auto scrollbar-hide scroll-instant items-stretch pb-4 pt-4">
            {loopOffres.map((o, index) => (
              <div key={`${o.id}-${index}`} className={offreCardClass}>
                <h3 className="text-xl font-bold text-gray-900 mb-1">{o.intituleOffre}</h3>
                <p className="text-gray-500 text-sm mb-4">{o.description}</p>

                {o.services.length > 1 && (
                  <div className="bg-gray-50 rounded-xl p-4 mb-4 overflow-y-auto scrollbar-hide max-h-38">
                    <p className="text-xs text-gray-500 mb-2">Inclut :</p>
                    <ul className="flex flex-col gap-1.5">
                      {o.services.map((s) => (
                        <li key={s} className="flex items-center gap-2 text-sm text-gray-700">
                          <Check className="w-4 h-4 shrink-0" style={{ color: "var(--color-primary)" }} />
                          {s}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="flex items-baseline gap-2 mb-1">
                  <span className="text-3xl font-bold" style={{ color: "var(--color-primary)" }}>{o.parMois}</span>
                  <span className="text-sm font-medium" style={{ color: "var(--color-primary)" }}>TND</span>
                  <span className="text-gray-400 text-sm">/mois</span>
                </div>
                <p className="text-gray-500 text-sm mb-6">
                  <span className="font-semibold text-gray-700">{o.parAnnee}</span>
                  <span className="text-xs text-gray-500 ml-1">TND</span> /an
                </p>

                <button
                  onClick={() => handleSubscribe(o.id)}
                  className="w-full py-3 rounded-xl font-semibold text-sm transition-all duration-300 mt-auto border"
                  style={{ borderColor: "var(--color-primary)", color: "var(--color-primary)" }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "var(--color-primary)";
                    e.currentTarget.style.color = "white";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "transparent";
                    e.currentTarget.style.color = "var(--color-primary)";
                  }}
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