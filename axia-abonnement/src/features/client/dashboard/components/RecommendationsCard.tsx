import { Sparkles, Star, Clock, Package, Compass } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useRecommendations } from "../../../../hooks/useRecommendations";

export default function RecommendationsCard() {
  const { recommendations, loading, error } = useRecommendations();
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <h2 className="text-base font-bold text-gray-900 mb-4">
          Recommandations pour vous
        </h2>
        <div className="space-y-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-20 bg-gray-100 rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (error || recommendations.length === 0) return null;

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-(--color-primary)" />
          <h2 className="text-base font-bold text-gray-900">
            Recommandations pour vous
          </h2>
        </div>
        <span className="text-xs text-gray-400">
          {recommendations[0]?.reason === "popular"
            ? "Populaires en ce moment"
            : "Basé sur vos abonnements"}
        </span>
      </div>

      <div className="space-y-3">
        {recommendations.map((rec, index) => (
          <div
            key={rec.offre_id}
            onClick={() => navigate("/dashboard/client/subscriptions")}
            className="p-4 bg-gray-50 rounded-xl border border-gray-100 hover:border-(--color-primary) hover:bg-(--color-primary-soft) transition-colors cursor-pointer"
          >
            <div className="flex items-start justify-between gap-2 mb-2">
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-5 h-5 rounded-full bg-(--color-primary) text-white text-xs flex items-center justify-center font-bold shrink-0">
                  {index + 1}
                </div>
                <p className="font-semibold text-gray-900 text-sm truncate">
                  {rec.intitule}
                </p>
              </div>
              <span className="text-sm font-extrabold text-(--color-primary) shrink-0">
                {rec.prix.toLocaleString("fr-TN")} TND
              </span>
            </div>

            <p className="text-xs text-gray-400 mb-2 line-clamp-1 ml-7">
              {rec.description}
            </p>

            <div className="flex items-center gap-3 ml-7 text-xs text-gray-400">
              <span className="flex items-center gap-0.5">
                <Clock className="w-3 h-3" />
                {rec.duree_mois} mois
              </span>
              <span className="flex items-center gap-0.5">
                <Package className="w-3 h-3" />
                {rec.nb_services} service{rec.nb_services > 1 ? "s" : ""}
              </span>
              <span className="flex items-center gap-0.5">
                <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                {rec.avg_rating}/5
              </span>
              {rec.is_diversity && (
                <span className="flex items-center gap-0.5 text-(--color-primary) font-semibold">
                  <Compass className="w-3 h-3" />
                  Découverte
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={() => navigate("/dashboard/client/subscriptions")}
        className="mt-4 w-full text-sm text-(--color-primary) font-semibold hover:underline text-center"
      >
        Voir toutes les offres →
      </button>
    </div>
  );
}