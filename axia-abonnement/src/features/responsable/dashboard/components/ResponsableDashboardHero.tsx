import type { Stats } from "../types";
import { formatMoney } from "../utils";

interface ResponsableDashboardHeroProps {
  username?: string;
  period: string;
  stats: Stats;
}

export default function ResponsableDashboardHero({ username, period, stats }: ResponsableDashboardHeroProps) {
  return (
    <div className="mb-6 rounded-2xl overflow-hidden border border-blue-200 shadow-md">
      <div
        className="p-8"
        style={{
          background: "linear-gradient(135deg, #3d5afe 0%, #1a237e 100%)",
        }}
      >
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div>
            <p className="text-xs font-semibold text-blue-200 tracking-widest uppercase">
              Bienvenue, {String(username ?? "").toUpperCase()}
            </p>

            <h2 className="text-3xl font-extrabold text-white mt-1">
              Tableau de bord
            </h2>

            <p className="text-blue-200 text-sm mt-1">
              {period} · Aperçu de vos opérations
            </p>
          </div>

          <div className="flex items-center gap-6">
            {[
              { value: Number(stats.totalAbonnes) || 0, label: "Clients actifs" },
              { value: formatMoney(stats.revenuMensuel), label: "Revenu ce mois" },
              { value: Number(stats.servicesActifs) || 0, label: "Services actifs" },
            ].map(({ value, label }) => (
              <div
                key={label}
                className="text-center bg-white/10 backdrop-blur-sm rounded-xl px-5 py-3 border border-white/20"
              >
                <div className="text-xl font-bold text-white">{value}</div>
                <div className="text-xs text-blue-200 mt-0.5">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}