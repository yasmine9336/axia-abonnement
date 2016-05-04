import { BarChart3 } from "lucide-react";
import type { AbonnementItem } from "../types";
import { formatLongDate } from "../utils";

interface RenewalBannerProps {
  abonnement: AbonnementItem | undefined;
  joursAvantRenouvellement: number | null;
  onManage: () => void;
}

export default function RenewalBanner({
  abonnement,
  joursAvantRenouvellement,
  onManage,
}: RenewalBannerProps) {
  if (
    !abonnement ||
    joursAvantRenouvellement === null ||
    joursAvantRenouvellement > 30
  ) {
    return null;
  }

  return (
    <div className="mb-6 rounded-2xl px-5 py-4 flex items-center justify-between gap-4 border bg-(--color-primary-soft) border-(--color-primary-soft)">
      <div className="flex items-center gap-3">
        <BarChart3 className="w-6 h-6 shrink-0 text-(--color-primary)" />

        <div>
          <p className="text-sm font-semibold text-(--color-primary)">
            Renouvellement dans {joursAvantRenouvellement} jours
          </p>

          <p className="text-xs text-gray-500">
            {abonnement.intituleOffre} — {abonnement.montant} TND le{" "}
            {formatLongDate(abonnement.dateFin)}
          </p>
        </div>
      </div>

      <button
        type="button"
        onClick={onManage}
        className="shrink-0 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors bg-(--color-primary)"
      >
        Gérer →
      </button>
    </div>
  );
}