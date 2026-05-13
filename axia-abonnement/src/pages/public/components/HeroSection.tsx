import { useNavigate } from "react-router-dom";
import { heroFeatures } from "../constants";

export default function HeroSection() {
  const navigate = useNavigate();

  return (
    <section className="pt-36 pb-24 px-6">
      <div className="max-w-4xl mx-auto text-center">
        <h1 className="text-5xl md:text-6xl font-extrabold text-gray-900 leading-tight mb-6">
          Gérez vos abonnements{" "}
          <span className="text-(--color-primary)">en toute simplicité</span>
        </h1>

        <p className="text-lg text-gray-500 max-w-2xl mx-auto mb-10 leading-relaxed">
          AxiaAbonnement connecte clients et responsables autour d'une gestion
          d'abonnements claire, rapide et intelligente — dans un seul espace partagé.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
          <button
            type="button"
            onClick={() => navigate("/register")}
            className="text-white font-semibold px-8 py-3.5 rounded-xl bg-(--color-primary) hover:opacity-90 transition flex items-center gap-2"
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

        <div className="flex justify-center gap-12 mb-20">
          {[
            { val: "2 min", label: "Pour s'inscrire" },
            { val: "100%", label: "Suivi en temps réel" },
            { val: "7j/7", label: "Accès à la plateforme" },
          ].map((s) => (
            <div key={s.label} className="text-center">
              <p className="text-2xl font-extrabold text-blue-700">{s.val}</p>
              <p className="text-xs text-gray-400 mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {heroFeatures.map((feature) => (
            <div
              key={feature.title}
              className="flex flex-col items-center text-center gap-3"
            >
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center bg-(--color-primary-soft) text-(--color-primary)">
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