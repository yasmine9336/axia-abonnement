import { ArrowRight } from "lucide-react";
import type { AbonnementRecent } from "../types";

interface RecentSubscriptionsCardProps {
  abonnements: AbonnementRecent[];
  loading: boolean;
  onViewAll: () => void;
}

const STATUT_STYLES: Record<string, string> = {
  actif:     "bg-blue-100 text-blue-700",
  expiré:    "bg-blue-100 text-blue-700",
  suspendu:  "bg-blue-100 text-blue-600",
  annulé:    "bg-gray-100 text-gray-500",
};

export default function RecentSubscriptionsCard({
  abonnements,
  loading,
  onViewAll,
}: RecentSubscriptionsCardProps) {
  return (
    <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base font-bold text-gray-900">
          Abonnements récents
        </h2>

        <button
          type="button"
          onClick={onViewAll}
          className="text-sm font-semibold flex items-center gap-1 hover:underline text-(--color-primary)"
        >
          Tout voir <ArrowRight size={16} />
        </button>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2].map((item) => (
            <div
              key={item}
              className="h-14 bg-gray-100 rounded-xl animate-pulse"
            />
          ))}
        </div>
      ) : abonnements.length === 0 ? (
        <p className="text-sm text-gray-400 text-center py-10">
          Aucun abonnement récent
        </p>
      ) : (
        <div className="space-y-4">
          {abonnements.map((abonnement) => (
            <div
              key={abonnement.id}
              className="flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold bg-(--color-primary-soft) text-(--color-primary)">
                  {abonnement.clientUsername.charAt(0).toUpperCase()}
                </div>

                <div>
                  <p className="text-sm font-semibold text-gray-900">
                    {abonnement.clientUsername}
                  </p>

                  <p className="text-xs text-gray-400">
                    {abonnement.intituleOffre}
                  </p>

                  <div className="mt-2 h-1.5 w-72 max-w-[55vw] bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full w-2/3 rounded-full bg-(--color-primary)" />
                  </div>
                </div>
              </div>

              <div className="text-right">
                <p className="text-sm font-semibold text-gray-900">
                  {Number(abonnement.montant).toFixed(2)} TND
                </p>

                <span
                  className={`inline-block mt-1 text-xs font-semibold px-2.5 py-0.5 rounded-full ${
                    STATUT_STYLES[abonnement.statut] ?? "bg-gray-100 text-gray-500"
                  }`}
                >
                  {abonnement.statut}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}