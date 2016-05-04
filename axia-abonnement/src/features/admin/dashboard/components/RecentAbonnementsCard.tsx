import type { AbonnementRecent } from "../types";

interface RecentAbonnementsCardProps {
  abonnements: AbonnementRecent[];
  loading: boolean;
  onViewAll: () => void;
}

export default function RecentAbonnementsCard({
  abonnements,
  loading,
  onViewAll,
}: RecentAbonnementsCardProps) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base font-bold text-gray-900">
          Abonnements récents
        </h2>

        <button
          type="button"
          onClick={onViewAll}
          className="text-xs font-semibold text-(--color-primary) hover:underline"
        >
          Voir tous →
        </button>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((item) => (
            <div
              key={item}
              className="h-12 bg-gray-100 rounded-xl animate-pulse"
            />
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {abonnements.map((abonnement) => (
            <div
              key={abonnement.id}
              className="flex items-center justify-between"
            >
              <div>
                <p className="text-sm font-semibold text-gray-900">
                  {abonnement.clientUsername}
                </p>

                <p className="text-xs text-gray-400">
                  {abonnement.intituleOffre}
                </p>
              </div>

              <div className="text-right">
                <p className="text-sm font-semibold text-gray-900">
                  {abonnement.montant} TND
                </p>

                <span
                  className={`text-xs font-semibold ${
                    abonnement.statut === "actif"
                      ? "text-green-600"
                      : abonnement.statut === "expiré"
                        ? "text-red-500"
                        : "text-gray-400"
                  }`}
                >
                  {abonnement.statut}
                </span>
              </div>
            </div>
          ))}

          {abonnements.length === 0 && (
            <p className="text-sm text-gray-400 text-center py-4">
              Aucun abonnement
            </p>
          )}
        </div>
      )}
    </div>
  );
}