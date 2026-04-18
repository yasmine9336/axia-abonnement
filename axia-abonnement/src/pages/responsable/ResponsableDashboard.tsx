import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import ProfileSection from "../../components/sections/ProfileSection";
import ServicesSection from "../../components/sections/ServicesSection";
import OffresSection from "../../components/sections/OffresSection";
import SuiviClientsSection from "../../components/sections/SuiviClientsSection";
import AbonnementsSection from "../../components/sections/GestionAbonnementsSection";
import ArchiveSection from "../../components/sections/ArchiveSection";
import TransactionsAdminSection from "../../components/sections/TransactionsAdminSection";
import StaffInbox from "../../components/chat/StaffInbox";
import axiosInstance from "../../api/axiosInstance";
import {
  Bar, BarChart, CartesianGrid, Cell, Legend,
  Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from "recharts";

type Section =
  | "dashboard" | "subscriptions" | "clients" | "stats"
  | "transactions" | "profile" | "services" | "offres"
  | "suivi-clients" | "messages";

interface Props { section?: Section; }

interface AbonnementRecent {
  id: string; intituleOffre: string; type: string;
  montant: number; dateDebut: string; dateFin: string;
  isActive: boolean; statut: string;
  clientUsername: string; clientEmail: string;
}

interface RevenuMois { mois: string; revenu: number; }

interface Stats {
  totalAbonnes: number; revenuMensuel: number;
  servicesActifs: number; demandesEnAttente: number;
  abonnementsRecents: AbonnementRecent[];
  revenuParMois: RevenuMois[];
  abonnementsActifs: number;
  abonnementsExpires: number;
  abonnementsDesactives: number;
}

const EMPTY_STATS: Stats = {
  totalAbonnes: 0, revenuMensuel: 0, servicesActifs: 0,
  demandesEnAttente: 0, abonnementsRecents: [], revenuParMois: [],
  abonnementsActifs: 0, abonnementsExpires: 0, abonnementsDesactives: 0,
};

const PIE_COLORS = ["#22c55e", "#ef4444", "#9ca3af"];

function KpiCard({ icon, label, value, sub, bg, iconColor }: {
  icon: React.ReactNode; label: string; value: React.ReactNode;
  sub: string; bg: string; iconColor: string;
}) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-5 flex items-start gap-4">
      <div className={`w-11 h-11 ${bg} rounded-xl flex items-center justify-center shrink-0`}>
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

export default function ResponsableDashboard({ section = "dashboard" }: Props) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState<Stats>(EMPTY_STATS);
  const [loading, setLoading] = useState(section === "dashboard");

  useEffect(() => {
    if (section !== "dashboard") return;
    let cancelled = false;
    axiosInstance.get("/abonnements/stats")
      .then(r => { if (!cancelled) setStats(r.data ?? EMPTY_STATS); })
      .catch(() => { if (!cancelled) setStats(EMPTY_STATS); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [section]);

  if (section === "profile") return <ProfileSection />;
  if (section === "services") return <ServicesSection />;
  if (section === "offres") return <OffresSection />;
  if (section === "suivi-clients") return <SuiviClientsSection />;
  if (section === "subscriptions") return <AbonnementsSection />;
  if (section === "clients") return <ArchiveSection />;
  if (section === "transactions") return <TransactionsAdminSection />;
  if (section === "messages") return <StaffInbox />;

  const pieData = [
    { name: "Actifs", value: stats.abonnementsActifs },
    { name: "Expirés", value: stats.abonnementsExpires },
    { name: "Désactivés", value: stats.abonnementsDesactives },
  ].filter(item => item.value > 0);

  const shortcuts = [
    { label: "Gérer mes abonnements", path: "/dashboard/responsable/subscriptions" },
    { label: "Suivi clients", path: "/dashboard/responsable/suivi-clients" },
    { label: "Mes services", path: "/dashboard/responsable/services" },
    { label: "Mes offres", path: "/dashboard/responsable/offres" },
  ];

  return (
    <div className="p-6 lg:p-8">
      {/* Header indigo */}
      <div className="mb-8 p-5 bg-white rounded-2xl border-l-4 border-[#4F46E5] shadow-sm">
        <h1 className="text-2xl font-bold text-gray-900">Vue générale</h1>
        <p className="text-gray-500 text-sm mt-1">
          Bienvenue <span className="font-semibold text-[#4F46E5]">{user?.username}</span> — aperçu de vos opérations
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {loading ? (
          [1,2,3,4].map(item => (
            <div key={item} className="bg-white rounded-2xl border border-gray-200 p-5 animate-pulse">
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
              icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>}
              label="Total abonnés" value={stats.totalAbonnes} sub="abonnés actifs"
              bg="bg-blue-100" iconColor="text-blue-600"
            />
            <KpiCard
              icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
              label="Revenu mensuel" value={`${stats.revenuMensuel} TND`} sub="abonnements mensuels"
              bg="bg-green-100" iconColor="text-green-600"
            />
            <KpiCard
              icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>}
              label="Services actifs" value={stats.servicesActifs} sub="services disponibles"
              bg="bg-indigo-100" iconColor="text-indigo-600"
            />
            <KpiCard
              icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
              label="Demandes en attente" value={stats.demandesEnAttente} sub="à traiter"
              bg={stats.demandesEnAttente > 0 ? "bg-yellow-100" : "bg-gray-100"}
              iconColor={stats.demandesEnAttente > 0 ? "text-yellow-600" : "text-gray-400"}
            />
          </>
        )}
      </div>

      {!loading && stats.demandesEnAttente > 0 && (
        <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-xl flex items-center justify-between">
          <p className="text-sm font-medium text-yellow-800">
            {stats.demandesEnAttente} demande(s) de renouvellement en attente
          </p>
          <button onClick={() => navigate("/dashboard/responsable/suivi-clients")} className="text-sm font-semibold text-yellow-700 hover:underline">
            Traiter →
          </button>
        </div>
      )}

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-200 p-6">
          <h2 className="text-base font-bold text-gray-900 mb-4">Revenus des 6 derniers mois</h2>
          {loading ? (
            <div className="h-48 bg-gray-100 rounded-xl animate-pulse" />
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={stats.revenuParMois} barSize={32}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="mois" tick={{ fontSize: 12, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
                <Tooltip formatter={v => [`${Number(v) || 0} TND`, "Revenu"]} contentStyle={{ borderRadius: "12px", border: "1px solid #e5e7eb", fontSize: 12 }} />
                <Bar dataKey="revenu" fill="#4F46E5" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <h2 className="text-base font-bold text-gray-900 mb-4">Répartition abonnements</h2>
          {loading ? (
            <div className="h-48 bg-gray-100 rounded-xl animate-pulse" />
          ) : pieData.length === 0 ? (
            <div className="h-48 flex items-center justify-center text-sm text-gray-400">Aucune donnée</div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3} dataKey="value">
                  {pieData.map((_, index) => <Cell key={index} fill={PIE_COLORS[index % PIE_COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: "12px", border: "1px solid #e5e7eb", fontSize: 12 }} />
                <Legend iconType="circle" iconSize={8} formatter={v => <span className="text-xs text-gray-600">{v}</span>} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Abonnements récents + Raccourcis */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-200 p-6">
          <h2 className="text-base font-bold text-gray-900 mb-4">Abonnements récents</h2>
          {loading ? (
            <div className="space-y-3">{[1,2,3].map(item => <div key={item} className="h-12 bg-gray-100 rounded-xl animate-pulse" />)}</div>
          ) : (
            <div className="space-y-2">
              {stats.abonnementsRecents.map(abonnement => (
                <div key={abonnement.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center text-xs font-bold text-indigo-600">
                      {abonnement.clientUsername.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{abonnement.clientUsername}</p>
                      <p className="text-xs text-gray-400">{abonnement.intituleOffre} · <span className="capitalize">{abonnement.type}</span> · {abonnement.montant} TND</p>
                    </div>
                  </div>
                  <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${abonnement.statut === "actif" ? "bg-green-100 text-green-700" : abonnement.statut === "expiré" ? "bg-red-100 text-red-700" : "bg-gray-100 text-gray-600"}`}>
                    {abonnement.statut}
                  </span>
                </div>
              ))}
              {!stats.abonnementsRecents.length && <p className="text-sm text-gray-400 text-center py-4">Aucun abonnement récent</p>}
            </div>
          )}
        </div>

        {/* Raccourcis */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <h2 className="text-base font-bold text-gray-900 mb-4">Mes raccourcis</h2>
          <div className="space-y-3">
            {shortcuts.map(s => (
              <button key={s.path} onClick={() => navigate(s.path)}
                className="w-full text-left px-4 py-3 rounded-xl border border-gray-200 hover:border-[#4F46E5] hover:bg-[#4F46E5]/5 text-sm font-semibold text-gray-700 hover:text-[#4F46E5] transition-colors">
                {s.label} →
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
