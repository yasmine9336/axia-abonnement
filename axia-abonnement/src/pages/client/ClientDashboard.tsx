import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import ProfileSection from "../../components/sections/ProfileSection";
import PaymentSection from "../../components/sections/PaymentSection";
import SubscriptionsSection from "../../components/sections/MesAbonnementsSection";
import HistoriqueSection from "../../components/sections/HistoriqueSection";
import ClientChat from "../../components/chat/ClientChat";
import axiosInstance from "../../api/axiosInstance";
import { useNotifications } from "../../hooks/useNotifications";
import { Package, Wallet, Bell, BarChart3, Plus, CreditCard, History, User } from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";

type Section = "dashboard" | "payment" | "subscriptions" | "history" | "chat" | "profile";
interface Props { section?: Section; }

interface AbonnementItem {
  id: string; intituleOffre: string; type: string;
  montant: number; dateFin: string; dateDebut: string; statut: string;
}

interface PaiementItem {
  id: string; intituleOffre: string; montant: number; statut: string; createdAt: string;
}

export default function ClientDashboard({ section = "dashboard" }: Props) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { unreadCount } = useNotifications();
  const [abonnements, setAbonnements] = useState<AbonnementItem[]>([]);
  const [paiements, setPaiements] = useState<PaiementItem[]>([]);
  const [loadingData, setLoadingData] = useState(section === "dashboard");
  const [now] = useState(() => Date.now());

  const abonnementsActifs = useMemo(
    () => abonnements.filter((a) => a.statut === "actif"),
    [abonnements]
  );

  const totalDepense = useMemo(
    () => paiements.reduce((sum, p) => sum + p.montant, 0),
    [paiements]
  );

  const totalCeMois = useMemo(() => {
    const n = new Date();
    return paiements
      .filter((p) => {
        const d = new Date(p.createdAt);
        return d.getMonth() === n.getMonth() && d.getFullYear() === n.getFullYear();
      })
      .reduce((sum, p) => sum + p.montant, 0);
  }, [paiements]);

  const depensesParMois = useMemo(() => {
    const n = new Date();
    return Array.from({ length: 6 }, (_, i) => {
      const mois = new Date(n.getFullYear(), n.getMonth() - (5 - i), 1);
      const total = paiements
        .filter((p) => {
          const d = new Date(p.createdAt);
          return d.getMonth() === mois.getMonth() && d.getFullYear() === mois.getFullYear();
        })
        .reduce((sum, p) => sum + p.montant, 0);
      return {
        mois: mois.toLocaleDateString("fr-FR", { month: "short" }),
        depense: total,
      };
    });
  }, [paiements]);

  useEffect(() => {
    if (section !== "dashboard") return;
    let cancelled = false;
    Promise.all([
      axiosInstance.get("/abonnements"),
      axiosInstance.get("/payment/history"),
    ])
      .then(([abRes, paRes]) => {
        if (cancelled) return;
        setAbonnements(abRes.data);
        setPaiements(paRes.data);
      })
      .catch(() => { if (!cancelled) { setAbonnements([]); setPaiements([]); } })
      .finally(() => { if (!cancelled) setLoadingData(false); });
    return () => { cancelled = true; };
  }, [section]);

  if (section === "profile") return <ProfileSection />;
  if (section === "payment") return <PaymentSection />;
  if (section === "subscriptions") return <SubscriptionsSection />;
  if (section === "chat") return <ClientChat />;
  if (section === "history") return <HistoriqueSection />;

  const getProgress = (dateDebut: string, dateFin: string) => {
    const debut = new Date(dateDebut).getTime();
    const fin = new Date(dateFin).getTime();
    return Math.round(Math.min(100, Math.max(0, ((now - debut) / (fin - debut)) * 100)));
  };

  const joursRestants = (dateFin: string) => {
    const diff = new Date(dateFin).getTime() - now;
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  };

  const totalJours = (dateDebut: string, dateFin: string) => {
    const debut = new Date(dateDebut).getTime();
    const fin = new Date(dateFin).getTime();
    return Math.ceil((fin - debut) / (1000 * 60 * 60 * 24));
  };

  const prochainRenouvellement = abonnementsActifs
    .slice()
    .sort((a, b) => new Date(a.dateFin).getTime() - new Date(b.dateFin).getTime())[0];

  const joursAvantRenouvellement = prochainRenouvellement
    ? joursRestants(prochainRenouvellement.dateFin)
    : null;

  const kpiCards = [
    {
      label: "ABONNEMENTS ACTIFS",
      value: abonnementsActifs.length,
      sub: "en cours",
      icon: <Package className="w-5 h-5 text-blue-600" />,
      border: "border-t-blue-500",
    },
    {
      label: "TOTAL DÉPENSÉ",
      value: `${totalDepense.toFixed(2)} TND`,
      sub: "tous paiements",
      icon: <Wallet className="w-5 h-5 text-green-500" />,
      border: "border-t-green-400",
      large: true,
    },
    {
      label: "NOTIFICATIONS",
      value: unreadCount,
      sub: "non lues",
      icon: <Bell className={`w-5 h-5 ${unreadCount > 0 ? "text-red-400" : "text-gray-400"}`} />,
      border: unreadCount > 0 ? "border-t-red-400" : "border-t-gray-300",
    },
    {
      label: "CE MOIS-CI",
      value: `${totalCeMois.toFixed(2)} TND`,
      sub: "dépensé",
      icon: <BarChart3 className="w-5 h-5 text-orange-500" />,
      border: "border-t-orange-400",
      large: true,
    },
  ];

  const actions = [
    {
      label: "Nouvel abonnement",
      sub: "Parcourir les offres",
      path: "/",
      icon: <Plus className="w-6 h-6" style={{ color: "var(--color-primary)" }} />,
    },
    {
      label: "Mes abonnements",
      sub: "Gérer et suivre",
      path: "/dashboard/client/subscriptions",
      icon: <CreditCard className="w-6 h-6 text-blue-500" />,
    },
    {
      label: "Historique",
      sub: "Dernière transaction",
      path: "/dashboard/client/history",
      icon: <History className="w-6 h-6 text-orange-500" />,
    },
    {
      label: "Mon profil",
      sub: "Informations compte",
      path: "/dashboard/client/profile",
      icon: <User className="w-6 h-6 text-gray-500" />,
    },
  ];

  const chartLabel = `${depensesParMois[0]?.mois} — ${new Date().toLocaleDateString("fr-FR", { month: "short", year: "numeric" })}`;

  return (
    <div className="ui-page">
      {/* Header */}
      <div className="mb-6">
        <h1 className="ui-title">Tableau de bord</h1>
        <p className="ui-subtitle">
          Bienvenue {user?.username} ! Voici un aperçu de vos abonnements.
        </p>
      </div>

      {/* Bannière renouvellement */}
      {prochainRenouvellement && joursAvantRenouvellement !== null && joursAvantRenouvellement <= 30 && (
        <div
          className="mb-6 rounded-2xl px-5 py-4 flex items-center justify-between gap-4 border"
          style={{ background: "var(--color-primary-soft)", borderColor: "var(--color-primary-soft)" }}
        >
          <div className="flex items-center gap-3">
            <BarChart3 className="w-6 h-6 shrink-0" style={{ color: "var(--color-primary)" }} />
            <div>
              <p className="text-sm font-semibold" style={{ color: "var(--color-primary)" }}>
                Renouvellement dans {joursAvantRenouvellement} jours
              </p>
              <p className="text-xs text-gray-500">
                {prochainRenouvellement.intituleOffre} — {prochainRenouvellement.montant} TND le{" "}
                {new Date(prochainRenouvellement.dateFin).toLocaleDateString("fr-FR", {
                  day: "numeric", month: "long", year: "numeric",
                })}
              </p>
            </div>
          </div>
          <button
            onClick={() => navigate("/dashboard/client/subscriptions")}
            className="shrink-0 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors"
            style={{ background: "var(--color-primary)" }}
          >
            Gérer →
          </button>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {loadingData ? (
          [1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white rounded-2xl border border-gray-200 p-5 animate-pulse">
              <div className="h-3 bg-gray-200 rounded w-3/4 mb-3" />
              <div className="h-8 bg-gray-200 rounded w-1/2 mb-2" />
              <div className="h-2 bg-gray-200 rounded w-2/3" />
            </div>
          ))
        ) : (
          kpiCards.map((card) => (
            <div
              key={card.label}
              className={`bg-white rounded-2xl border border-gray-200 border-t-4 ${card.border} p-5`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs text-gray-400 font-medium tracking-wide mb-2">{card.label}</p>
                  <p className={`font-bold text-gray-900 ${card.large ? "text-2xl" : "text-3xl"}`}>
                    {card.value}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">{card.sub}</p>
                </div>
                <div className="mt-1">{card.icon}</div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Chart + Abonnement actif */}
      <div className="grid lg:grid-cols-3 gap-6 mb-6">
        {/* Chart */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-gray-900">Dépenses des 6 derniers mois</h2>
            <span className="text-xs text-gray-400">{chartLabel}</span>
          </div>
          {loadingData ? (
            <div className="h-48 bg-gray-100 rounded-xl animate-pulse" />
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={depensesParMois}>
                <defs>
                  <linearGradient id="colorDepense" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--color-primary)" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="var(--color-primary)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="mois" tick={{ fontSize: 12, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
                <Tooltip
                  formatter={(v) => [`${Number(v) || 0} TND`, "Dépense"]}
                  contentStyle={{ borderRadius: "12px", border: "1px solid #e5e7eb", fontSize: 12 }}
                />
                <Area
                  type="monotone"
                  dataKey="depense"
                  stroke="var(--color-primary)"
                  strokeWidth={2.5}
                  fill="url(#colorDepense)"
                  dot={{ fill: "var(--color-primary)", r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Abonnement actif */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <h2 className="text-base font-bold text-gray-900 mb-4">Abonnement actif</h2>
          {loadingData ? (
            <div className="h-32 bg-gray-100 rounded-xl animate-pulse" />
          ) : abonnementsActifs.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-32 text-center">
              <p className="text-gray-400 text-sm">Aucun abonnement actif</p>
              <button
                onClick={() => navigate("/")}
                className="mt-3 text-xs font-semibold hover:underline"
                style={{ color: "var(--color-primary)" }}
              >
                Explorer les offres →
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {abonnementsActifs.slice(0, 2).map((a) => {
                const jr = joursRestants(a.dateFin);
                const tj = totalJours(a.dateDebut, a.dateFin);
                const prog = getProgress(a.dateDebut, a.dateFin);
                return (
                  <div key={a.id} className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                    <div className="flex items-center justify-between mb-1">
                      <p className="font-semibold text-gray-900 text-sm">{a.intituleOffre}</p>
                      <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-semibold">
                        actif
                      </span>
                    </div>
                    <p className="text-xs text-gray-400 mb-3">
                      {a.type === "annuel" ? "Annuel" : "Mensuel"} · renouvelle le{" "}
                      {new Date(a.dateFin).toLocaleDateString("fr-FR")}
                    </p>
                    <p className="text-xl font-extrabold mb-3" style={{ color: "var(--color-primary)" }}>
                      {a.montant}{" "}
                      <span className="text-xs font-semibold text-gray-400">
                        TND/{a.type === "annuel" ? "an" : "mois"}
                      </span>
                    </p>
                    <div className="w-full bg-gray-200 rounded-full h-1.5 mb-1">
                      <div
                        className="h-1.5 rounded-full"
                        style={{ width: `${prog}%`, background: "var(--color-primary)" }}
                      />
                    </div>
                    <div className="flex items-center justify-between text-xs text-gray-400">
                      <span>{jr} jours restants</span>
                      <span>sur {tj} jours</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Actions rapides */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <h2 className="text-base font-bold text-gray-900 mb-4">Actions rapides</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {actions.map((action) => (
            <button
              key={action.label}
              onClick={() => navigate(action.path)}
              className="flex flex-col items-center gap-2 p-5 bg-gray-50 hover:bg-gray-100 rounded-2xl border border-gray-200 transition-colors text-center"
            >
              <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center border border-gray-200 shadow-sm">
                {action.icon}
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900">{action.label}</p>
                <p className="text-xs text-gray-400 mt-0.5">{action.sub}</p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}