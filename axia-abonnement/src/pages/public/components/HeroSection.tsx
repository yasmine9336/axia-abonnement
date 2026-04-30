import { useNavigate } from "react-router-dom";
import { heroFeatures } from "../constants";

export default function HeroSection() {
  const navigate = useNavigate();

  return (
    <section className="pt-36 pb-24 px-6 bg-linear-to-b from-gray-50 to-white">
      <div className="max-w-4xl mx-auto text-center">
        <h1 className="text-5xl md:text-6xl font-extrabold text-gray-900 leading-tight mb-6">
          Gérez vos abonnements{" "}
          <span style={{ color: "var(--color-primary)" }}>
            en toute simplicité
          </span>
        </h1>

        <p className="text-lg text-gray-500 max-w-2xl mx-auto mb-10 leading-relaxed">
          AxiaAbonnement est la plateforme moderne pour gérer tous vos
          abonnements en un seul endroit. Suivez, analysez et optimisez vos
          paiements récurrents avec des analyses intelligentes.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-20">
          <button
            type="button"
            onClick={() => navigate("/register")}
            className="text-white font-semibold px-8 py-3.5 rounded-xl transition-colors flex items-center gap-2"
            style={{ background: "var(--color-primary)" }}
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
          {heroFeatures.map((feature) => (
            <div
              key={feature.title}
              className="flex flex-col items-center text-center gap-3"
            >
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center"
                style={{
                  background: "var(--color-primary-soft)",
                  color: "var(--color-primary)",
                }}
              >
                {feature.icon}
              </div>

              <h4 className="font-bold text-gray-900">{feature.title}</h4>

              <p className="text-gray-500 text-sm leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}