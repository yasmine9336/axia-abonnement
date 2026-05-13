import { formatMoney } from "../utils";
import type { Stats } from "../types";

export default function ResponsableDashboardHero({
  username,
  period,
  stats,
}: {
  username?: string;
  period: string;
  stats: Stats;
}) {
  const boxes = [
    { value: Number(stats.totalAbonnes) || 0, label: "Clients actifs" },
    { value: formatMoney(stats.revenuMensuel), label: "Revenu ce mois", raw: Number(stats.revenuMensuel) },
    { value: Number(stats.servicesActifs) || 0, label: "Services actifs" },
    { value: Number(stats.demandesEnAttente) || 0, label: "Demandes en attente" },
  ].filter((b) => (b.raw !== undefined ? b.raw > 0 : Number(b.value) > 0));

  return (
    <div className="mb-4 rounded-2xl overflow-hidden border border-blue-200 shadow-md">
      <div
        className="px-6 py-5"
        style={{ background: "linear-gradient(135deg, #3d5afe 0%, #1a237e 100%)" }}
      >
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold text-blue-200 tracking-widest uppercase">
              Bienvenue, {String(username ?? "").toUpperCase()}
            </p>
            <h2 className="text-2xl font-extrabold text-white mt-0.5">
              Tableau de bord
            </h2>
            <p className="text-blue-200 text-sm mt-0.5">
              {period} · Aperçu de vos opérations
            </p>
          </div>

          {boxes.length > 0 && (
            <div className="flex flex-wrap items-center gap-3">
              {boxes.map(({ value, label }) => (
                <div
                  key={label}
                  className="text-center bg-white/10 backdrop-blur-sm rounded-xl px-5 py-3 border border-white/20"
                >
                  <div className="text-xl font-bold text-white">{value}</div>
                  <div className="text-xs text-blue-200 mt-0.5">{label}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}