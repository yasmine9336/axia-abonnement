import type { Stats } from "../types";
import { formatMoney } from "../utils";

interface ResponsableDashboardHeroProps {
  username?: string;
  period: string;
  stats: Stats;
}

export default function ResponsableDashboardHero({
  username,
  period,
  stats,
}: ResponsableDashboardHeroProps) {
  return (
    <div className="mb-6 rounded-2xl overflow-hidden border border-gray-200 shadow-sm">
      <div
        className="p-6"
        style={{
          background:
            "linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-strong) 100%)",
        }}
      >
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div>
            <p className="text-xs font-semibold text-white/80 tracking-wide">
              BIENVENUE, {String(username ?? "").toUpperCase()}
            </p>

            <h2 className="text-2xl lg:text-3xl font-extrabold text-white mt-1">
              Tableau de bord · {period}
            </h2>

            <p className="text-white/80 text-sm mt-1">
              Aperçu complet de vos opérations
            </p>
          </div>

          <div className="flex items-center gap-8 text-white">
            <div className="text-center">
              <div className="text-xl font-bold">
                {Number(stats.totalAbonnes) || 0}
              </div>
              <div className="text-xs text-white/80">Clients actifs</div>
            </div>

            <div className="text-center">
              <div className="text-xl font-bold">
                {formatMoney(stats.revenuMensuel)}
              </div>
              <div className="text-xs text-white/80">Revenu ce mois</div>
            </div>

            <div className="text-center">
              <div className="text-xl font-bold">
                {Number(stats.servicesActifs) || 0}
              </div>
              <div className="text-xs text-white/80">Services actifs</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}