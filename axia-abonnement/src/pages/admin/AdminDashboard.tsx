import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import ProfileSection from "../../components/sections/ProfileSection";
import ResponsablesSection from "../../components/sections/ResponsablesSection";
import AbonnementsAdminSection from "../../components/sections/AbonnementsAdminSection";
import CatalogueAdminSection from "../../components/sections/CatalogueAdminSection";
import ArchiveAdminSection from "../../components/sections/ArchiveAdminSection";
import TransactionsAdminSection from "../../components/sections/TransactionsSection";
import axiosInstance from "../../api/axiosInstance";
import ExportButton from "../../components/common/ExportButton";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

type Section =
  | "dashboard"
  | "transactions"
  | "responsables"
  | "abonnements"
  | "catalogue"
  | "archive"
  | "profile";

interface Props {
  section?: Section;
}

interface AbonnementRecent {
  id: string;
  intituleOffre: string;
  type: string;
  montant: number;
  statut: string;
  clientUsername: string;
  clientEmail: string;
}

interface RevenuMois {
  mois: string;
  revenu: number;
}

interface ResponsableItem {
  id: string;
  username: string;
  email: string;
  isActive: boolean;
  nombreAbonnes: number;
  createdAt: string;
}

interface Paiement {
  id: string;
  montant: number;
  statut: string;
  createdAt: string;
  intituleOffre: string;
  typeAbonnement: string;
  clientUsername: string;
  clientEmail: string;
}

interface Stats {
  totalAbonnes: number;
  revenuMensuel: number;
  servicesActifs: number;
  demandesEnAttente: number;
  abonnementsRecents: AbonnementRecent[];
  revenuParMois: RevenuMois[];
  abonnementsActifs: number;
  abonnementsExpires: number;
}

const EMPTY_STATS: Stats = {
  totalAbonnes: 0,
  revenuMensuel: 0,
  servicesActifs: 0,
  demandesEnAttente: 0,
  abonnementsRecents: [],
  revenuParMois: [],
  abonnementsActifs: 0,
  abonnementsExpires: 0,
};

const PIE_COLORS = ["#22c55e", "#f59e0b", "#ef4444"];

function KpiCard({
  emoji,
  label,
  value,
  sub,
  borderColor,
}: {
  emoji: string;
  label: string;
  value: React.ReactNode;
  sub: string;
  borderColor: string;
}) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
      <div className="h-1" style={{ backgroundColor: borderColor }} />
      <div className="p-5">
        <div className="flex items-start justify-between mb-3">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider leading-tight">
            {label}
          </p>
          <span className="text-xl">{emoji}</span>
        </div>
        <p className="text-3xl font-bold text-gray-900">{value}</p>
        <p className="text-xs text-gray-400 mt-1">{sub}</p>
      </div>
    </div>
  );
}

export default function AdminDashboard({ section = "dashboard" }: Props) {
  const navigate = useNavigate();
  const [stats, setStats] = useState<Stats>(EMPTY_STATS);
  const [responsables, setResponsables] = useState<ResponsableItem[]>([]);
  const [paiements, setPaiements] = useState<Paiement[]>([]);
  const [loading, setLoading] = useState(section === "dashboard");

  useEffect(() => {
    if (section !== "dashboard") return;

    let cancelled = false;

    Promise.all([
      axiosInstance.get("/abonnements/stats"),
      axiosInstance.get("/users/responsables"),
      axiosInstance.get("/payment/history/all"),
    ])
      .then(([s, r, p]) => {
        if (cancelled) return;
        setStats(s.data ?? EMPTY_STATS);
        setResponsables(r.data ?? []);
        setPaiements(p.data ?? []);
      })
      .catch(() => {
        if (!cancelled) setStats(EMPTY_STATS);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [section]);

  if (section === "profile") return <ProfileSection />;
  if (section === "responsables") return <ResponsablesSection />;
  if (section === "abonnements") return <AbonnementsAdminSection />;
  if (section === "catalogue") return <CatalogueAdminSection />;
  if (section === "archive") return <ArchiveAdminSection />;
  if (section === "transactions") return <TransactionsAdminSection />;

  const pieData = [
    { name: "Actifs", value: stats.abonnementsActifs },
    { name: "En attente", value: stats.demandesEnAttente },
    { name: "Expirés", value: stats.abonnementsExpires },
  ];

  const currentMonth = new Date()
    .toLocaleDateString("fr-FR", { month: "long", year: "numeric" })
    .toUpperCase();

  return (
    <div className="p-6 lg:p-8">
      {/* Banner header */}
      <div
        className="mb-6 rounded-2xl p-6 text-white"
        style={{
          background: "linear-gradient(135deg, #0F6CBD 0%, #0B5CAD 100%)",
        }}
      >
        <div className="flex items-center justify-between gap-6">
          <div>
            <p className="text-xs font-semibold text-blue-100 uppercase tracking-wider mb-2">
              TABLEAU DE BORD ADMIN · {currentMonth}
            </p>

            {loading ? (
              <div className="w-48 h-10 bg-white/20 rounded-xl animate-pulse mb-2" />
            ) : (
              <p className="text-4xl font-bold mb-1">
                {stats.revenuMensuel} TND
              </p>
            )}

            <p className="text-blue-100 text-sm">
              Revenu total consolidé de la plateforme
            </p>
          </div>

          {!loading && (
            <div className="hidden lg:flex gap-10">
              <div className="text-center">
                <p className="text-2xl font-bold">{responsables.length}</p>
                <p className="text-xs text-blue-100 mt-0.5">Responsables</p>
              </div>

              <div className="text-center">
                <p className="text-2xl font-bold">{stats.totalAbonnes}</p>
                <p className="text-xs text-blue-100 mt-0.5">Clients actifs</p>
              </div>

              <div className="text-center">
                <p className="text-2xl font-bold">{stats.abonnementsActifs}</p>
                <p className="text-xs text-blue-100 mt-0.5">
                  Abonnements actifs
                </p>
              </div>

              <div className="text-center">
                <p
                  className={`text-2xl font-bold ${
                    stats.demandesEnAttente > 0 ? "text-yellow-300" : ""
                  }`}
                >
                  {stats.demandesEnAttente}
                </p>
                <p className="text-xs text-blue-100 mt-0.5">En attente</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        {loading ? (
          [1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className="bg-white rounded-2xl border border-gray-200 overflow-hidden animate-pulse"
            >
              <div className="h-1 bg-gray-200" />
              <div className="p-5 space-y-3">
                <div className="h-3 bg-gray-200 rounded w-3/4" />
                <div className="h-8 bg-gray-200 rounded w-1/2" />
                <div className="h-3 bg-gray-200 rounded w-full" />
              </div>
            </div>
          ))
        ) : (
          <>
            <KpiCard
              emoji="💰"
              label="Revenu plateforme"
              value={`${stats.revenuMensuel} TND`}
              sub="total mensuel consolidé"
              borderColor="#22c55e"
            />
            <KpiCard
              emoji="👥"
              label="Clients actifs globaux"
              value={stats.totalAbonnes}
              sub="tous responsables confondus"
              borderColor="#22c55e"
            />
            <KpiCard
              emoji="🛡️"
              label="Responsables actifs"
              value={responsables.filter((r) => r.isActive).length}
              sub={`sur ${responsables.length} total`}
              borderColor="#f59e0b"
            />
            <KpiCard
              emoji="📋"
              label="Abonnements actifs"
              value={stats.abonnementsActifs}
              sub="en cours"
              borderColor="#0F6CBD"
            />
            <KpiCard
              emoji="⏳"
              label="En attente"
              value={stats.demandesEnAttente}
              sub="nécessitent validation"
              borderColor={stats.demandesEnAttente > 0 ? "#f59e0b" : "#9ca3af"}
            />
          </>
        )}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-gray-900">
              Évolution des revenus
            </h2>

            <ExportButton
              data={stats.revenuParMois}
              columns={[
                { key: "mois", label: "Mois" },
                { key: "revenu", label: "Revenu (TND)" },
              ]}
              filename="revenus-mensuels"
              label="Exporter"
              sheetName="Revenus"
              pdfTitle="Évolution des revenus mensuels"
            />
          </div>

          {loading ? (
            <div className="h-48 bg-gray-100 rounded-xl animate-pulse" />
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={stats.revenuParMois} barSize={32}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis
                  dataKey="mois"
                  tick={{ fontSize: 12, fill: "#9ca3af" }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 12, fill: "#9ca3af" }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  formatter={(v) => [`${Number(v) || 0} TND`, "Revenu"]}
                  contentStyle={{
                    borderRadius: "12px",
                    border: "1px solid #e5e7eb",
                    fontSize: 12,
                  }}
                />
                <Bar dataKey="revenu" fill="#0F6CBD" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <h2 className="text-base font-bold text-gray-900 mb-4">
            Répartition abonnements
          </h2>

          {loading ? (
            <div className="h-48 bg-gray-100 rounded-xl animate-pulse" />
          ) : (
            (() => {
              const total = pieData.reduce((s, d) => s + d.value, 0);

              return (
                <div className="flex items-center gap-6">
                  <div
                    className="relative shrink-0"
                    style={{ width: 150, height: 150 }}
                  >
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
                        <Pie
                          data={pieData}
                          cx="50%"
                          cy="50%"
                          innerRadius={45}
                          outerRadius={70}
                          paddingAngle={3}
                          dataKey="value"
                        >
                          {pieData.map((_, i) => (
                            <Cell
                              key={i}
                              fill={PIE_COLORS[i % PIE_COLORS.length]}
                            />
                          ))}
                        </Pie>
                        <Tooltip
                          contentStyle={{
                            borderRadius: "12px",
                            border: "1px solid #e5e7eb",
                            fontSize: 12,
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>

                    <div
                      className="absolute pointer-events-none text-center"
                      style={{
                        left: "50%",
                        top: "50%",
                        transform: "translate(-50%, -50%)",
                      }}
                    >
                      <p className="text-2xl font-bold text-gray-900 leading-none">
                        {total}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">total</p>
                    </div>
                  </div>

                  <div className="space-y-3 flex-1">
                    {pieData.map((item, i) => {
                      const pct =
                        total > 0 ? Math.round((item.value / total) * 100) : 0;

                      return (
                        <div
                          key={item.name}
                          className="flex items-center gap-2"
                        >
                          <div
                            className="w-2.5 h-2.5 rounded-full shrink-0"
                            style={{ backgroundColor: PIE_COLORS[i] }}
                          />
                          <span className="text-xs text-gray-600 flex-1">
                            {item.name}
                          </span>
                          <span className="text-xs text-gray-400 w-8 text-right">
                            {pct}%
                          </span>
                          <span className="text-xs font-bold text-gray-900 w-4 text-right">
                            {item.value}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })()
          )}
        </div>
      </div>

      {/* Bottom 3 sections */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top Responsables */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-gray-900">
              Top Responsables
            </h2>
            <button
              onClick={() => navigate("/dashboard/admin/responsables")}
              className="text-xs font-semibold text-[#0F6CBD] hover:underline"
            >
              Voir tous →
            </button>
          </div>

          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-12 bg-gray-100 rounded-xl animate-pulse"
                />
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {responsables.slice(0, 5).map((r) => (
                <div key={r.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-blue-100 rounded-full flex items-center justify-center text-xs font-bold text-blue-700">
                      {r.username.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">
                        {r.username}
                      </p>
                      <p className="text-xs text-gray-400">
                        {r.nombreAbonnes} client
                        {r.nombreAbonnes !== 1 ? "s" : ""}
                      </p>
                    </div>
                  </div>
                </div>
              ))}

              {responsables.length === 0 && (
                <p className="text-sm text-gray-400 text-center py-4">
                  Aucun responsable
                </p>
              )}
            </div>
          )}
        </div>

        {/* Abonnements récents */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-gray-900">
              Abonnements récents
            </h2>
            <button
              onClick={() => navigate("/dashboard/admin/abonnements")}
              className="text-xs font-semibold text-[#0F6CBD] hover:underline"
            >
              Voir tous →
            </button>
          </div>

          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-12 bg-gray-100 rounded-xl animate-pulse"
                />
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {stats.abonnementsRecents.map((a) => (
                <div key={a.id} className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-gray-900">
                      {a.clientUsername}
                    </p>
                    <p className="text-xs text-gray-400">{a.intituleOffre}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-gray-900">
                      {a.montant} TND
                    </p>
                    <span
                      className={`text-xs font-semibold ${
                        a.statut === "actif"
                          ? "text-green-600"
                          : a.statut === "expiré"
                            ? "text-red-500"
                            : "text-gray-400"
                      }`}
                    >
                      {a.statut}
                    </span>
                  </div>
                </div>
              ))}

              {!stats.abonnementsRecents.length && (
                <p className="text-sm text-gray-400 text-center py-4">
                  Aucun abonnement
                </p>
              )}
            </div>
          )}
        </div>

        {/* Transactions récentes */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-gray-900">
              Transactions récentes
            </h2>
            <button
              onClick={() => navigate("/dashboard/admin/transactions")}
              className="text-xs font-semibold text-[#0F6CBD] hover:underline"
            >
              Voir toutes →
            </button>
          </div>

          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-12 bg-gray-100 rounded-xl animate-pulse"
                />
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {paiements.slice(0, 5).map((p, index) => (
                <div key={p.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-blue-100 rounded-xl flex items-center justify-center">
                      <svg
                        className="w-4 h-4 text-blue-600"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={2}
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                        />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">
                        {p.clientUsername}
                      </p>
                      <p className="text-xs text-gray-400">
                        TXN-{String(index + 1).padStart(3, "0")}
                      </p>
                    </div>
                  </div>
                  <p className="text-sm font-bold text-green-600">
                    +{p.montant} TND
                  </p>
                </div>
              ))}

              {paiements.length === 0 && (
                <p className="text-sm text-gray-400 text-center py-4">
                  Aucune transaction
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}