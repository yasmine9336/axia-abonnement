import type { AbonnementItem } from "../types";
import { getProgress, joursRestants, totalJours } from "../utils";
import { useNavigate } from "react-router-dom";

interface ActiveSubscriptionsCardProps {
  loading: boolean;
  abonnementsActifs: AbonnementItem[];
  now: number;
  onExplore: () => void;
}

export default function ActiveSubscriptionsCard({
  loading,
  abonnementsActifs,
  now,
  onExplore,
}: ActiveSubscriptionsCardProps) {
  const navigate = useNavigate();
  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6">
      <h2 className="text-base font-bold text-gray-900 mb-4">
        Abonnement actif
      </h2>

      {loading ? (
        <div className="h-32 bg-gray-100 rounded-xl animate-pulse" />
      ) : abonnementsActifs.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-32 text-center">
          <p className="text-gray-400 text-sm">Aucun abonnement actif</p>

          <button
            type="button"
            onClick={onExplore}
            className="mt-3 text-xs font-semibold text-(--color-primary) hover:underline"
          >
            Explorer les offres →
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {abonnementsActifs.slice(0, 2).map((abonnement) => {
            const total = totalJours(abonnement.dateDebut, abonnement.dateFin);
            const jours = Math.min(
              joursRestants(abonnement.dateFin, now),
              total,
            );
            const progress = getProgress(
              abonnement.dateDebut,
              abonnement.dateFin,
              now,
            );

            return (
              <div
                key={abonnement.id}
                className="p-4 bg-gray-50 rounded-xl border border-gray-100"
              >
                <div className="flex items-center justify-between mb-1">
                  <p className="font-semibold text-gray-900 text-sm">
                    {abonnement.intituleOffre}
                  </p>

                  <span className="flex items-center gap-1 text-xs bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 rounded-full font-semibold">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                    actif
                  </span>
                </div>

                <p className="text-xs text-gray-400 mb-3">
                  {abonnement.type === "annuel"
                    ? "Annuel"
                    : abonnement.type === "mensuel"
                      ? "Mensuel"
                      : abonnement.type}{" "}
                  · renouvelle le{" "}
                  {new Date(abonnement.dateFin).toLocaleDateString("fr-FR")}
                </p>

                <p className="text-xl font-extrabold mb-3 text-(--color-primary)">
                  {abonnement.montant}{" "}
                  <span className="text-xs font-semibold text-gray-400">
                    TND/{abonnement.type === "annuel" ? "an" : "mois"}
                  </span>
                </p>

                <div className="w-full bg-gray-200 rounded-full h-1.5 mb-1">
                  <div
                    className="h-1.5 rounded-full bg-(--color-primary)"
                    style={{ width: `${progress}%` }}
                  />
                </div>

                <div className="flex items-center justify-between text-xs text-gray-400">
                  <span>{jours} jours restants</span>
                  <span>sur {total} jours</span>
                </div>
                <button
                  type="button"
                  onClick={() => navigate("/dashboard/client/subscriptions")}
                  className="mt-4 w-full text-center text-xs font-semibold text-blue-600 hover:text-blue-800 hover:underline transition-colors"
                >
                  Voir tous mes abonnements →
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
