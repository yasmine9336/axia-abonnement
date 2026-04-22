import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import ProfileSection from "../../components/sections/ProfileSection";
import ServicesSection from "../../components/sections/ServicesSection";
import OffresSection from "../../components/sections/OffresSection";
import SuiviAbonnementsSection from "../../components/sections/SuiviAbonnementsSection";
import ArchiveSection from "../../components/sections/ArchiveSection";
import TransactionsAdminSection from "../../components/sections/TransactionsSection";
import StaffInbox from "../../components/chat/StaffInbox";
import axiosInstance from "../../api/axiosInstance";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Label,
} from "recharts";
import { Users, TrendingUp, Boxes, Hourglass, ArrowRight } from "lucide-react";

type Section =
  | "dashboard"
  | "clients"
  | "stats"
  | "transactions"
  | "profile"
  | "services"
  | "offres"
  | "suivi-abonnements"
  | "messages";

interface Props {
  section?: Section;
}

interface AbonnementRecent {
  id: string;
  intituleOffre: string;
  type: string;
  montant: number;
  dateDebut: string;
  dateFin: string;
  isActive: boolean;
  statut: string;
  clientUsername: string;
  clientEmail: string;
}

interface RevenuMois {
  mois: string;
  revenu: number;
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

const PIE_COLORS = ["#22c55e", "#ef4444", "#f59e0b"]; // actifs / expirés / en attente

function monthLabelFR(d = new Date()) {
  const s = d.toLocaleString("fr-FR", { month: "long", year: "numeric" });
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function monthShortFR(d = new Date()) {
  const s = d.toLocaleString("fr-FR", { month: "short" });
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function KpiBorderCard({
  label,
  value,
  sub,
  icon,
  border,
  large,
}: {
  label: string;
  value: React.ReactNode;
  sub: string;
  icon: React.ReactNode;
  border: string;
  large?: boolean;
}) {
  return (
    <div className={`bg-white rounded-2xl border border-gray-200 border-t-4 ${border} p-5`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs text-gray-400 font-medium tracking-wide mb-2">{label}</p>
          <p className={`font-bold text-gray-900 ${large ? "text-2xl" : "text-3xl"}`}>
            {value}
          </p>
          <p className="text-xs text-gray-400 mt-1">{sub}</p>
        </div>
        <div className="mt-1">{icon}</div>
      </div>
    </div>
  );
}

export default function ResponsableDashboard({ section = "dashboard" }: Props) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState<Stats>(EMPTY_STATS);
  const [loading, setLoading] = useState(section === "dashboard");

  useEffect(() => {
    if (section !== "dashboard") return;

    let cancelled = false;

    axiosInstance
      .get("/abonnements/stats")
      .then((r) => {
        if (!cancelled) setStats(r.data ?? EMPTY_STATS);
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

  // Hooks AVANT les early returns
  const period = useMemo(() => monthLabelFR(new Date()), []);
  const periodShort = useMemo(() => monthShortFR(new Date()), []);

  const pieData = useMemo(
    () =>
      [
        { name: "Actifs", value: Number(stats.abonnementsActifs) || 0 },
        { name: "Expirés", value: Number(stats.abonnementsExpires) || 0 },
        { name: "En attente", value: Number(stats.demandesEnAttente) || 0 },
      ].filter((x) => x.value > 0),
    [stats.abonnementsActifs, stats.abonnementsExpires, stats.demandesEnAttente],
  );

  const pieTotal = useMemo(() => {
    const a = Number(stats.abonnementsActifs) || 0;
    const e = Number(stats.abonnementsExpires) || 0;
    const p = Number(stats.demandesEnAttente) || 0;
    return a + e + p;
  }, [stats.abonnementsActifs, stats.abonnementsExpires, stats.demandesEnAttente]);

  const kpiCards = useMemo(
    () => [
      {
        label: "TOTAL ABONNÉS",
        value: Number(stats.totalAbonnes) || 0,
        sub: "abonnés actifs",
        icon: <Users className="w-5 h-5 text-blue-600" />,
        border: "border-t-blue-500",
      },
      {
        label: "REVENU MENSUEL",
        value: `${Number(stats.revenuMensuel || 0).toFixed(2)} TND`,
        sub: "abonnements mensuels",
        icon: <TrendingUp className="w-5 h-5 text-green-500" />,
        border: "border-t-green-400",
        large: true,
      },
      {
        label: "SERVICES ACTIFS",
        value: Number(stats.servicesActifs) || 0,
        sub: "services disponibles",
        icon: <Boxes className="w-5 h-5 text-blue-500" />,
        border: "border-t-blue-400",
      },
      {
        label: "DEMANDES EN ATTENTE",
        value: Number(stats.demandesEnAttente) || 0,
        sub: "à traiter",
        icon: <Hourglass className="w-5 h-5 text-orange-500" />,
        border: "border-t-orange-400",
      },
    ],
    [stats.totalAbonnes, stats.revenuMensuel, stats.servicesActifs, stats.demandesEnAttente],
  );

  // Early returns après hooks
  if (section === "profile") return <ProfileSection />;
  if (section === "services") return <ServicesSection />;
  if (section === "offres") return <OffresSection />;
  if (section === "suivi-abonnements") return <SuiviAbonnementsSection />;
  if (section === "clients") return <ArchiveSection />;
  if (section === "transactions") return <TransactionsAdminSection />;
  if (section === "messages") return <StaffInbox />;

  // ✅ Alertes (sans désactivés)
  const demandes = Number(stats.demandesEnAttente) || 0;
  const expires = Number(stats.abonnementsExpires) || 0;
  const totalAlertes = demandes + expires;

  return (
    <div className="p-6 lg:p-8">
      {/* Bannière bleue */}
      <div className="mb-6 rounded-2xl overflow-hidden border border-gray-200 shadow-sm">
        <div className="bg-linear-to-r from-[#3B82F6] to-[#6366F1] p-6">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            <div>
              <p className="text-xs font-semibold text-white/80 tracking-wide">
                BIENVENUE, {String(user?.username ?? "").toUpperCase()}
              </p>
              <h2 className="text-2xl lg:text-3xl font-extrabold text-white mt-1">
                Vue générale · {period}
              </h2>
              <p className="text-white/80 text-sm mt-1">
                Aperçu complet de vos opérations
              </p>
            </div>

            <div className="flex items-center gap-8 text-white">
              <div className="text-center">
                <div className="text-xl font-bold">{Number(stats.totalAbonnes) || 0}</div>
                <div className="text-xs text-white/80">Clients actifs</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold">
                  {Number(stats.revenuMensuel || 0).toFixed(2)} TND
                </div>
                <div className="text-xs text-white/80">Revenu ce mois</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold">{Number(stats.servicesActifs) || 0}</div>
                <div className="text-xs text-white/80">Services actifs</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {loading
          ? [1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="bg-white rounded-2xl border border-gray-200 p-5 animate-pulse"
              >
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <div className="h-3 bg-gray-200 rounded w-24" />
                    <div className="h-8 bg-gray-200 rounded w-20" />
                    <div className="h-3 bg-gray-200 rounded w-32" />
                  </div>
                  <div className="h-6 w-6 bg-gray-200 rounded" />
                </div>
              </div>
            ))
          : kpiCards.map((c) => (
              <KpiBorderCard
                key={c.label}
                label={c.label}
                value={c.value}
                sub={c.sub}
                icon={c.icon}
                border={c.border}
                large={c.large}
              />
            ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-gray-900">
              Revenus des 6 derniers mois
            </h2>
            <span className="text-xs text-gray-400">
              {periodShort} – {period}
            </span>
          </div>

          {loading ? (
            <div className="h-56 bg-gray-100 rounded-xl animate-pulse" />
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={stats.revenuParMois} barSize={46}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis
                  dataKey="mois"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: "#9ca3af" }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: "#9ca3af" }}
                />
                <Tooltip
                  formatter={(v) => [`${Number(v) || 0} TND`, "Revenu"]}
                  contentStyle={{
                    borderRadius: 12,
                    border: "1px solid #e5e7eb",
                    fontSize: 12,
                  }}
                />
                <Bar dataKey="revenu" fill="#4F46E5" radius={[10, 10, 10, 10]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <h2 className="text-base font-bold text-gray-900 mb-4">Répartition</h2>

          {loading ? (
            <div className="h-56 bg-gray-100 rounded-xl animate-pulse" />
          ) : pieTotal === 0 ? (
            <div className="h-56 flex items-center justify-center text-sm text-gray-400">
              Aucune donnée
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              <div className="h-44">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      dataKey="value"
                      innerRadius={55}
                      outerRadius={80}
                      paddingAngle={3}
                      stroke="none"
                    >
                      {pieData.map((_, i) => (
                        <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                      ))}
                      <Label
                        value={`${pieTotal}\n total`}
                        position="center"
                        style={{
                          fill: "#111827",
                          fontSize: 14,
                          fontWeight: 700,
                          whiteSpace: "pre-line",
                        }}
                      />
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        borderRadius: 12,
                        border: "1px solid #e5e7eb",
                        fontSize: 12,
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-gray-700">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#22c55e]" />
                    Actifs
                  </div>
                  <span className="font-semibold text-gray-900">
                    {Number(stats.abonnementsActifs) || 0}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-gray-700">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#ef4444]" />
                    Expirés
                  </div>
                  <span className="font-semibold text-gray-900">
                    {Number(stats.abonnementsExpires) || 0}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-gray-700">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#f59e0b]" />
                    En attente
                  </div>
                  <span className="font-semibold text-gray-900">
                    {Number(stats.demandesEnAttente) || 0}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Recent + À surveiller */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-gray-900">Abonnements récents</h2>
            <button
              onClick={() => navigate("/dashboard/responsable/subscriptions")}
              className="text-sm font-semibold text-[#0F6CBD] hover:underline flex items-center gap-1"
            >
              Tout voir <ArrowRight size={16} />
            </button>
          </div>

          {loading ? (
            <div className="space-y-3">
              {[1, 2].map((i) => (
                <div key={i} className="h-14 bg-gray-100 rounded-xl animate-pulse" />
              ))}
            </div>
          ) : stats.abonnementsRecents.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-10">
              Aucun abonnement récent
            </p>
          ) : (
            <div className="space-y-4">
              {stats.abonnementsRecents.map((a) => (
                <div key={a.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-indigo-100 rounded-full flex items-center justify-center text-xs font-bold text-indigo-600">
                      {a.clientUsername.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{a.clientUsername}</p>
                      <p className="text-xs text-gray-400">{a.intituleOffre}</p>
                      <div className="mt-2 h-1.5 w-72 max-w-[55vw] bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-[#4F46E5] w-2/3 rounded-full" />
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="text-sm font-semibold text-gray-900">
                      {Number(a.montant).toFixed(2)} TND
                    </p>
                    <span
                      className={`inline-block mt-1 text-xs font-semibold px-2.5 py-0.5 rounded-full ${
                        a.statut === "actif"
                          ? "bg-green-100 text-green-700"
                          : a.statut === "expiré"
                            ? "bg-red-100 text-red-700"
                            : "bg-amber-100 text-amber-700"
                      }`}
                    >
                      {a.statut}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <h2 className="text-base font-bold text-gray-900 mb-4">À surveiller</h2>

          <div className="space-y-3">
            <div className="flex items-start justify-between gap-3 p-3 rounded-xl bg-gray-50">
              <div>
                <p className="text-sm font-semibold text-gray-900">Demandes en attente</p>
                <p className="text-xs text-gray-400 mt-0.5">Renouvellements à traiter</p>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-gray-900">{demandes}</p>
                <button
                  disabled={demandes === 0}
                  onClick={() => navigate("/dashboard/responsable/suivi-clients")}
                  className={`text-xs font-semibold mt-1 ${
                    demandes === 0
                      ? "text-gray-300 cursor-not-allowed"
                      : "text-[#0F6CBD] hover:underline"
                  }`}
                >
                  Voir →
                </button>
              </div>
            </div>

            <div className="flex items-start justify-between gap-3 p-3 rounded-xl bg-gray-50">
              <div>
                <p className="text-sm font-semibold text-gray-900">Abonnements expirés</p>
                <p className="text-xs text-gray-400 mt-0.5">À suivre</p>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-gray-900">{expires}</p>
                <button
                  disabled={expires === 0}
                  onClick={() => navigate("/dashboard/responsable/subscriptions")}
                  className={`text-xs font-semibold mt-1 ${
                    expires === 0
                      ? "text-gray-300 cursor-not-allowed"
                      : "text-[#0F6CBD] hover:underline"
                  }`}
                >
                  Voir →
                </button>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
            <p className="text-xs text-gray-400">Total alertes</p>
            <p className="text-sm font-bold text-gray-900">{totalAlertes}</p>
          </div>
        </div>
      </div>
    </div>
  );
}