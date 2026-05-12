import { useNavigate } from "react-router-dom";
import { Clock, Star, Compass, Layers } from "lucide-react";
import { useRecommendations } from "../../../../hooks/useRecommendations";

export default function RecommendationsCard() {
  const { recommendations, loading, error } = useRecommendations();
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="ui-card space-y-3">
        <div className="h-4 w-40 rounded bg-gray-200 animate-pulse" />
        {[0, 1, 2].map((i) => (
          <div key={i} className="h-20 rounded-lg bg-gray-100 animate-pulse" />
        ))}
      </div>
    );
  }

  if (error || recommendations.length === 0) return null;

  return (
    <div className="ui-card">
      <h2 className="ui-card-title mb-4">Recommandations pour vous</h2>

      <div className="space-y-3">
        {recommendations.map((rec, i) => (
          <button
            key={rec.item_id}
            onClick={() => navigate("/dashboard/client/subscriptions")}
            className="w-full text-left rounded-lg border border-gray-100 p-3 hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-start gap-3">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                {i + 1}
              </span>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-medium text-sm truncate">
                    {rec.intitule}
                  </span>

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

                <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">
                  {rec.description}
                </p>

                <div className="flex items-center gap-3 mt-1.5 text-xs text-gray-500">
                  <span className="font-semibold text-gray-800">
                    {rec.prix.toFixed(2)} €/mois
                  </span>

                  {rec.duree_mois != null && (
                    <span className="flex items-center gap-1">
                      <Clock size={11} />
                      {rec.duree_mois} mois
                    </span>
                  )}

                  {rec.nb_services != null && rec.nb_services > 0 && (
                    <span className="flex items-center gap-1">
                      <Layers size={11} />
                      {rec.nb_services} service{rec.nb_services > 1 ? "s" : ""}
                    </span>
                  )}

                  <span className="flex items-center gap-1">
                    <Star size={11} className="text-yellow-400" />
                    {rec.avg_rating.toFixed(1)}
                  </span>
                </div>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}