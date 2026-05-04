import { ArrowRight } from "lucide-react";
import type { AbonnementRecent } from "../types";

interface RecentSubscriptionsCardProps {
  abonnements: AbonnementRecent[];
  loading: boolean;
  onViewAll: () => void;
}

export default function RecentSubscriptionsCard({
  abonnements,
  loading,
  onViewAll,
}: RecentSubscriptionsCardProps) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base font-bold text-gray-900">Abonnements récents</h2>
        <button
          type="button"
          onClick={onViewAll}
          className="text-sm font-semibold flex items-center gap-1 hover:underline"
          style={{ color: "var(--color-primary)" }}
        >
          Tout voir <ArrowRight size={16} />
        </button>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((item) => (
            <div key={item} className="h-14 bg-gray-100 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : abonnements.length === 0 ? (
        <p className="text-sm text-gray-400 text-center py-10">Aucun abonnement récent</p>
      ) : (
        <div className="space-y-3">
          {abonnements.map((abonnement) => (
            <div key={abonnement.id} className="flex items-center justify-between gap-3 p-2 rounded-xl hover:bg-gray-50 transition-colors">
              <div className="flex items-center gap-3 min-w-0">
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
                  style={{ background: "var(--color-primary-soft)", color: "var(--color-primary)" }}
                >
                  {abonnement.clientUsername.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-gray-900 truncate">
                    {abonnement.clientUsername}
                  </p>
                  <p className="text-xs text-gray-400 truncate">{abonnement.intituleOffre}</p>
                </div>
              </div>
              <div className="text-right shrink-0">
                <p className="text-sm font-semibold text-gray-900">
                  {Number(abonnement.montant).toFixed(2)} TND
                </p>
                <span
                  className={`inline-block mt-1 text-xs font-semibold px-2 py-0.5 rounded-full ${
                    abonnement.statut === "actif"
                      ? "bg-green-100 text-green-700"
                      : abonnement.statut === "expiré"
                        ? "bg-red-100 text-red-700"
                        : "bg-amber-100 text-amber-700"
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