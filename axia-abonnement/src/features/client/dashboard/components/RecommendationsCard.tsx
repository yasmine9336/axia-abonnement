import { useNavigate } from "react-router-dom";
import { Clock, Star, Compass, Layers } from "lucide-react";
import { useRecommendations } from "../../../../hooks/useRecommendations";

export default function RecommendationsCard() {
  const { recommendations, loading, error } = useRecommendations();
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-6">
        <div className="h-4 w-48 rounded bg-gray-200 animate-pulse mb-4" />
        <div className="grid lg:grid-cols-3 gap-4">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-36 rounded-xl bg-gray-100 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (error || recommendations.length === 0) return null;

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-6">
      <h2 className="text-base font-bold text-gray-900 mb-4">
        Recommandations pour vous
      </h2>

      <div className="grid lg:grid-cols-3 gap-4">
        {recommendations.map((rec, i) => (
          <button
            key={rec.item_id}
            onClick={() => {
              if (rec.type === "offre") {
                localStorage.setItem("pendingOffreId", rec.item_id);
              } else {
                localStorage.setItem("pendingServiceId", rec.item_id);
              }
              navigate("/dashboard/client/subscribe");
            }}
            className="text-left rounded-xl border border-gray-100 p-4 hover:border-primary hover:shadow-sm transition-all group"
          >
            <div className="flex items-start justify-between mb-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                {i + 1}
              </span>

              <div className="flex gap-1.5">
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                  rec.type === "service"
                    ? "bg-blue-100 text-blue-700"
                    : "bg-purple-100 text-purple-700"
                }`}>
                  {rec.type === "service" ? "Service" : "Offre"}
                </span>

                {rec.is_diversity && (
                  <span className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 font-medium">
                    <Compass size={10} />
                    Découverte
                  </span>
                )}
              </div>
            </div>

            <p className="font-semibold text-sm text-gray-900 mb-1 group-hover:text-primary transition-colors line-clamp-1">
              {rec.intitule}
            </p>

            <p className="text-xs text-gray-400 line-clamp-2 mb-3">
              {rec.description}
            </p>

            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-gray-800">
                {rec.prix.toFixed(2)} TND/mois
              </span>

              <div className="flex items-center gap-2 text-xs text-gray-400">
                {rec.duree_mois != null && (
                  <span className="flex items-center gap-1">
                    <Clock size={11} />
                    {rec.duree_mois}m
                  </span>
                )}
                {rec.nb_services != null && rec.nb_services > 0 && (
                  <span className="flex items-center gap-1">
                    <Layers size={11} />
                    {rec.nb_services}
                  </span>
                )}
                <span className="flex items-center gap-1">
                  <Star size={11} className="text-yellow-400" />
                  {rec.avg_rating.toFixed(1)}
                </span>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}