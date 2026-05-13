import type { ResponsableItem, Stats } from "../types";
import { formatMoney } from "../utils";

interface AdminDashboardHeroProps {
  stats: Stats;
  responsables: ResponsableItem[];
  loading: boolean;
  currentMonth: string;
}

export default function AdminDashboardHero({
  stats,
  responsables,
  loading,
  currentMonth,
}: AdminDashboardHeroProps) {
  return (
    <div
      className="mb-4 rounded-2xl px-6 py-4 text-white"
      style={{
        background:
          "linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-strong) 100%)",
      }}
    >
      <div className="flex items-center justify-between gap-6">
        <div>
          <p className="text-xs font-semibold text-white/70 uppercase tracking-wider mb-2">
            TABLEAU DE BORD ADMIN · {currentMonth}
          </p>

          {loading ? (
            <div className="w-48 h-10 bg-white/20 rounded-xl animate-pulse mb-2" />
          ) : (
            <p className="text-4xl font-bold mb-1">
              {formatMoney(stats.revenuMensuel)}
            </p>
          )}

          <p className="text-white/70 text-sm">
            Revenu total consolidé de la plateforme
          </p>
        </div>

        {!loading && (
          <div className="hidden lg:flex gap-10">
            <div className="text-center">
              <p className="text-2xl font-bold">{responsables.length}</p>
              <p className="text-xs text-white/70 mt-0.5">Responsables</p>
            </div>

            <div className="text-center">
              <p className="text-2xl font-bold">{stats.totalAbonnes}</p>
              <p className="text-xs text-white/70 mt-0.5">Clients actifs</p>
            </div>

            <div className="text-center">
              <p className="text-2xl font-bold">{stats.abonnementsActifs}</p>
              <p className="text-xs text-white/70 mt-0.5">Abonnements actifs</p>
            </div>

            <div className="text-center">
              <p
                className={`text-2xl font-bold ${
                  stats.demandesEnAttente > 0 ? "text-sky-200" : ""
                }`}
              >
                {stats.demandesEnAttente}
              </p>
              <p className="text-xs text-white/70 mt-0.5">En attente</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
