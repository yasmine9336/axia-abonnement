import { ArrowRight } from "lucide-react";
import type { AbonnementRecent } from "../types";

interface RecentSubscriptionsCardProps {
  abonnements: AbonnementRecent[];
  loading: boolean;
  onViewAll: () => void;
}

const STATUT_STYLES: Record<string, string> = {
  actif:    "bg-green-100 text-green-700",
  expiré:   "bg-red-100 text-red-700",
  suspendu: "bg-orange-100 text-orange-700",
  annulé:   "bg-gray-100 text-gray-500",
};

const AVATAR_COLORS = [
  "bg-blue-100 text-blue-700",
  "bg-purple-100 text-purple-700",
  "bg-emerald-100 text-emerald-700",
  "bg-amber-100 text-amber-700",
  "bg-rose-100 text-rose-700",
];

function timeAgo(dateStr: string): string {
  const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 86400000);
  if (diff === 0) return "Aujourd'hui";
  if (diff === 1) return "Hier";
  if (diff < 30) return `Il y a ${diff} j`;
  if (diff < 365) return `Il y a ${Math.floor(diff / 30)} mois`;
  return `Il y a ${Math.floor(diff / 365)} an`;
}

export default function RecentSubscriptionsCard({
  abonnements,
  loading,
  onViewAll,
}: RecentSubscriptionsCardProps) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-base font-bold text-gray-900">Abonnements récents</h2>
          <p className="text-xs text-gray-400 mt-0.5">{abonnements.length} derniers abonnements</p>
        </div>
        <button
          type="button"
          onClick={onViewAll}
          className="text-sm font-semibold flex items-center gap-1 hover:underline text-(--color-primary)"
        >
          Tout voir <ArrowRight size={15} />
        </button>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 bg-gray-100 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : abonnements.length === 0 ? (
        <p className="text-sm text-gray-400 text-center py-10">Aucun abonnement récent</p>
      ) : (
        <div className="divide-y divide-gray-50">
          {abonnements.map((abonnement, idx) => (
            <div key={abonnement.id} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
              <div className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${AVATAR_COLORS[idx % AVATAR_COLORS.length]}`}>
                {abonnement.clientUsername.charAt(0).toUpperCase()}
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 truncate">
                  {abonnement.clientUsername}
                </p>
                <p className="text-xs text-gray-400 truncate">{abonnement.intituleOffre}</p>
              </div>

              <div className="text-right shrink-0">
                <p className="text-sm font-bold text-gray-900">
                  {Number(abonnement.montant).toFixed(2)} TND
                </p>
                <div className="flex items-center gap-1.5 justify-end mt-0.5">
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${STATUT_STYLES[abonnement.statut] ?? "bg-gray-100 text-gray-500"}`}>
                    {abonnement.statut}
                  </span>
                  {abonnement.dateDebut && (
                    <span className="text-xs text-gray-400">{timeAgo(abonnement.dateDebut)}</span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}