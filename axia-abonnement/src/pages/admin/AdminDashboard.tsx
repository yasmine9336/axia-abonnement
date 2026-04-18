import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import ProfileSection from "../../components/sections/ProfileSection";
import ResponsablesSection from "../../components/sections/ResponsablesSection";
import AbonnementsAdminSection from "../../components/sections/AbonnementsAdminSection";
import CatalogueAdminSection from "../../components/sections/CatalogueAdminSection";
import ArchiveAdminSection from "../../components/sections/ArchiveAdminSection";
import TransactionsAdminSection from "../../components/sections/TransactionsAdminSection";
import axiosInstance from "../../api/axiosInstance";
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
  Legend,
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

interface ClientItem {
  id: string;
  username: string;
  email: string;
  isActive: boolean;
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

interface Stats {
  totalAbonnes: number;
  revenuMensuel: number;
  servicesActifs: number;
  demandesEnAttente: number;
  abonnementsRecents: AbonnementRecent[];
  revenuParMois: RevenuMois[];
  abonnementsActifs: number;
  abonnementsExpires: number;
  abonnementsDesactives: number;
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
  abonnementsDesactives: 0,
};

const PIE_COLORS = ["#22c55e", "#ef4444", "#9ca3af"];

function KpiCard({
  icon,
  label,
  value,
  sub,
  bg,
  iconColor,
}: {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
  sub: string;
  bg: string;
  iconColor: string;
}) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-5 flex items-start gap-4">
      <div
        className={`w-11 h-11 ${bg} rounded-xl flex items-center justify-center shrink-0`}
      >
        <span className={iconColor}>{icon}</span>
      </div>
      <div>
        <p className="text-xs text-gray-500 mb-1">{label}</p>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
        <p className="text-xs text-gray-400 mt-0.5">{sub}</p>
      </div>
    </div>
  );
}

export default function AdminDashboard({ section = "dashboard" }: Props) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState<Stats>(EMPTY_STATS);
  const [clients, setClients] = useState<ClientItem[]>([]);
  const [responsables, setResponsables] = useState<ResponsableItem[]>([]);
  const [loading, setLoading] = useState(section === "dashboard");

  useEffect(() => {
    if (section !== "dashboard") return;
    let cancelled = false;
    Promise.all([
      axiosInstance.get("/abonnements/stats"),
      axiosInstance.get("/users/clients"),
      axiosInstance.get("/users/responsables"),
    ])
      .then(([s, c, r]) => {
        if (cancelled) return;
        setStats(s.data ?? EMPTY_STATS);
        setClients(c.data ?? []);
        setResponsables(r.data ?? []);
      })

      .catch(() => {
        if (!cancelled) {
          setStats(EMPTY_STATS);
          setClients([]);
        }
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
    { name: "Expirés", value: stats.abonnementsExpires },
    { name: "Désactivés", value: stats.abonnementsDesactives },
  ].filter((d) => d.value > 0);

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Tableau de bord</h1>
        <p className="text-gray-500 text-sm mt-1">
          Bienvenue {user?.username} ! Vue complète de la plateforme.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        {loading ? (
          [1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className="bg-white rounded-2xl border border-gray-200 p-5 animate-pulse"
            >
              <div className="flex gap-4">
                <div className="w-11 h-11 bg-gray-200 rounded-xl" />
                <div className="flex-1 space-y-2 pt-1">
                  <div className="h-3 bg-gray-200 rounded w-3/4" />
                  <div className="h-6 bg-gray-200 rounded w-1/2" />
                </div>
              </div>
            </div>
          ))
        ) : (
          <>
            <KpiCard
              icon={
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              }
              label="Revenu plateforme"
              value={`${stats.revenuMensuel} TND`}
              sub="total mensuel consolidé"
              bg="bg-green-100"
              iconColor="text-green-600"
            />
            <KpiCard
              icon={
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656-.126-1.283-.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
              }
              label="Clients actifs globaux"
              value={stats.totalAbonnes}
              sub="tous responsables confondus"
              bg="bg-blue-100"
              iconColor="text-blue-600"
            />
            <KpiCard
              icon={
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
              }
              label="Responsables actifs"
              value={responsables.filter((r) => r.isActive).length}
              sub={`sur ${responsables.length} total`}
              bg="bg-purple-100"
              iconColor="text-purple-600"
            />
            <KpiCard
              icon={
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              }
              label="Demandes en attente globales"
              value={stats.demandesEnAttente}
              sub="nécessitent validation"
              bg={stats.demandesEnAttente > 0 ? "bg-yellow-100" : "bg-gray-100"}
              iconColor={
                stats.demandesEnAttente > 0
                  ? "text-yellow-600"
                  : "text-gray-400"
              }
            />
            <KpiCard
              icon={
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
              }
              label="Affectations responsables"
              value={responsables.length}
              sub="à gérer"
              bg="bg-pink-100"
              iconColor="text-pink-600"
            />
          </>
        )}
      </div>

      {/* Alert */}
      {!loading && stats.demandesEnAttente > 0 && (
        <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-xl flex items-center justify-between">
          <p className="text-sm font-medium text-yellow-800">
            {stats.demandesEnAttente} demande(s) de renouvellement en attente
          </p>
          <button
            onClick={() => navigate("/dashboard/admin/abonnements")}
            className="text-sm font-semibold text-yellow-700 hover:underline"
          >
            Voir les demandes →
          </button>
        </div>
      )}

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Bar chart */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-200 p-6">
          <h2 className="text-base font-bold text-gray-900 mb-4">
            Évolution des revenus (plateforme)
          </h2>
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
                <Bar dataKey="revenu" fill="#4F46E5" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Pie chart */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <h2 className="text-base font-bold text-gray-900 mb-4">
            Répartition abonnements (globale)
          </h2>
          {loading ? (
            <div className="h-48 bg-gray-100 rounded-xl animate-pulse" />
          ) : pieData.length === 0 ? (
            <div className="h-48 flex items-center justify-center text-sm text-gray-400">
              Aucune donnée
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {pieData.map((_, i) => (
                    <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    borderRadius: "12px",
                    border: "1px solid #e5e7eb",
                    fontSize: 12,
                  }}
                />
                <Legend
                  iconType="circle"
                  iconSize={8}
                  formatter={(v) => (
                    <span className="text-xs text-gray-600">{v}</span>
                  )}
                />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Clients récents */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <h2 className="text-base font-bold text-gray-900 mb-4">
            Clients récents
          </h2>
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
            <div className="space-y-2">
              {clients.slice(0, 5).map((c) => (
                <div
                  key={c.id}
                  className="flex items-center justify-between py-2"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center text-xs font-bold text-indigo-600">
                      {c.username.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {c.username}
                      </p>
                      <p className="text-xs text-gray-400">{c.email}</p>
                    </div>
                  </div>
                  <span
                    className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${c.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}
                  >
                    {c.isActive ? "Actif" : "Inactif"}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Abonnements récents */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <h2 className="text-base font-bold text-gray-900 mb-4">
            Abonnements récents — plateforme
          </h2>
          <p className="text-xs text-gray-400 mb-4">Périmètre: Plateforme entière</p>
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
            <div className="space-y-2">
              {stats.abonnementsRecents.map((a) => (
                <div
                  key={a.id}
                  className="flex items-center justify-between py-2"
                >
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {a.clientUsername}
                    </p>
                    <p className="text-xs text-gray-400">
                      {a.intituleOffre} ·{" "}
                      <span className="capitalize">{a.type}</span> · {a.montant}{" "}
                      TND
                    </p>
                  </div>
                  <span
                    className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${
                      a.statut === "actif"
                        ? "bg-green-100 text-green-700"
                        : a.statut === "expiré"
                          ? "bg-red-100 text-red-700"
                          : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {a.statut}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
        {/* Responsables récents */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <h2 className="text-base font-bold text-gray-900 mb-4">
            Responsables récents
          </h2>
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
            <div className="space-y-2">
              {responsables.slice(0, 5).map((r) => (
                <div
                  key={r.id}
                  className="flex items-center justify-between py-2"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-pink-100 rounded-full flex items-center justify-center text-xs font-bold text-pink-600">
                      {r.username.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {r.username}
                      </p>
                      <p className="text-xs text-gray-400">
                        {r.nombreAbonnes} abonné(s)
                      </p>
                    </div>
                  </div>
                  <span
                    className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${r.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}
                  >
                    {r.isActive ? "Actif" : "Inactif"}
                  </span>
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
      </div>
    </div>
  );
}