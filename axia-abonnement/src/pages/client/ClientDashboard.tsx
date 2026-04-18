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
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

type Section =
  | "dashboard"
  | "payment"
  | "subscriptions"
  | "history"
  | "chat"
  | "profile";
interface Props {
  section?: Section;
}

interface AbonnementItem {
  id: string;
  intituleOffre: string;
  type: string;
  montant: number;
  dateFin: string;
  dateDebut: string;
  statut: string;
}
interface PaiementItem {
  id: string;
  intituleOffre: string;
  montant: number;
  statut: string;
  createdAt: string;
}

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

export default function ClientDashboard({ section = "dashboard" }: Props) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { notifications, unreadCount } = useNotifications();
  const [abonnements, setAbonnements] = useState<AbonnementItem[]>([]);
  const [paiements, setPaiements] = useState<PaiementItem[]>([]);
  const [loadingData, setLoadingData] = useState(section === "dashboard");
  const [now] = useState(() => Date.now());

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
      .catch(() => {
        if (!cancelled) {
          setAbonnements([]);
          setPaiements([]);
        }
      })
      .finally(() => {
        if (!cancelled) setLoadingData(false);
      });
    return () => {
      cancelled = true;
    };
  }, [section]);

  const abonnementsActifs = useMemo(
    () => abonnements.filter((a) => a.statut === "actif"),
    [abonnements],
  );
  const totalDepense = useMemo(
    () => paiements.reduce((sum, p) => sum + p.montant, 0),
    [paiements],
  );
  const totalCeMois = useMemo(() => {
    const now = new Date();
    return paiements
      .filter((p) => {
        const d = new Date(p.createdAt);
        return (
          d.getMonth() === now.getMonth() &&
          d.getFullYear() === now.getFullYear()
        );
      })
      .reduce((sum, p) => sum + p.montant, 0);
  }, [paiements]);

  const depensesParMois = useMemo(() => {
    const now = new Date();
    return Array.from({ length: 6 }, (_, i) => {
      const mois = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
      const total = paiements
        .filter((p) => {
          const d = new Date(p.createdAt);
          return (
            d.getMonth() === mois.getMonth() &&
            d.getFullYear() === mois.getFullYear()
          );
        })
        .reduce((sum, p) => sum + p.montant, 0);
      return {
        mois: mois.toLocaleDateString("fr-FR", { month: "short" }),
        depense: total,
      };
    });
  }, [paiements]);

  const getProgress = (dateDebut: string, dateFin: string) => {
    const debut = new Date(dateDebut).getTime();
    const fin = new Date(dateFin).getTime();
    return Math.round(
      Math.min(100, Math.max(0, ((now - debut) / (fin - debut)) * 100)),
    );
  };

  const joursRestants = (dateFin: string) => {
    const diff = new Date(dateFin).getTime() - now;
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  };

  if (section === "profile") return <ProfileSection />;
  if (section === "payment") return <PaymentSection />;
  if (section === "subscriptions") return <SubscriptionsSection />;
  if (section === "chat") return <ClientChat />;
  if (section === "history") return <HistoriqueSection />;

  const actions = [
    {
      label: "Effectuer un paiement",
      path: "/dashboard/client/payment",
      bg: "bg-indigo-600",
      icon: (
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
            d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
          />
        </svg>
      ),
    },
    {
      label: "Gérer les abonnements",
      path: "/dashboard/client/subscriptions",
      bg: "bg-blue-500",
      icon: (
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
            d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
          />
        </svg>
      ),
    },
    {
      label: "Contacter le support",
      path: "/dashboard/client/chat",
      bg: "bg-purple-500",
      icon: (
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
            d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
          />
        </svg>
      ),
    },
    {
      label: "Explorer les offres",
      path: "/",
      bg: "bg-green-500",
      icon: (
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
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
      ),
    },
  ];

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Tableau de bord</h1>
        <p className="text-gray-500 text-sm mt-1">
          Bienvenue {user?.username} ! Voici un aperçu de vos abonnements.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {loadingData ? (
          [1, 2, 3, 4].map((i) => (
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
                    d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                  />
                </svg>
              }
              label="Abonnements actifs"
              value={abonnementsActifs.length}
              sub="en cours"
              bg="bg-indigo-100"
              iconColor="text-indigo-600"
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
                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              }
              label="Total dépensé"
              value={`${totalDepense.toFixed(2)} TND`}
              sub="tous paiements"
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
                    d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                  />
                </svg>
              }
              label="Notifications"
              value={unreadCount}
              sub="non lues"
              bg={unreadCount > 0 ? "bg-red-100" : "bg-gray-100"}
              iconColor={unreadCount > 0 ? "text-red-600" : "text-gray-400"}
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
                    d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                  />
                </svg>
              }
              label="Ce mois-ci"
              value={`${totalCeMois.toFixed(2)} TND`}
              sub="dépensé ce mois"
              bg="bg-yellow-100"
              iconColor="text-yellow-600"
            />
          </>
        )}
      </div>

      {/* Line chart */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-6">
        <h2 className="text-base font-bold text-gray-900 mb-4">
          Dépenses des 6 derniers mois
        </h2>
        {loadingData ? (
          <div className="h-48 bg-gray-100 rounded-xl animate-pulse" />
        ) : (
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={depensesParMois}>
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
                formatter={(v) => [`${Number(v) || 0} TND`, "Dépense"]}
                contentStyle={{
                  borderRadius: "12px",
                  border: "1px solid #e5e7eb",
                  fontSize: 12,
                }}
              />
              <Line
                type="monotone"
                dataKey="depense"
                stroke="#4F46E5"
                strokeWidth={2.5}
                dot={{ fill: "#4F46E5", r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Abonnements actifs */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <h2 className="text-base font-bold text-gray-900 mb-4">
            Abonnements actifs
          </h2>
          {loadingData ? (
            <div className="h-16 bg-gray-100 rounded-xl animate-pulse" />
          ) : abonnementsActifs.length === 0 ? (
            <p className="text-gray-400 text-sm text-center py-6">
              Aucun abonnement actif
            </p>
          ) : (
            <div className="space-y-4">
              {abonnementsActifs.map((a) => (
                <div key={a.id} className="p-4 bg-gray-50 rounded-xl">
                  <div className="flex items-center justify-between mb-2">
                    <p className="font-semibold text-gray-900 text-sm">
                      {a.intituleOffre}
                    </p>
                    <p className="font-semibold text-gray-900 text-sm">
                      {a.montant} TND/{a.type === "annuel" ? "an" : "mois"}
                    </p>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-1.5 mb-1">
                    <div
                      className="bg-indigo-500 h-1.5 rounded-full"
                      style={{
                        width: `${getProgress(a.dateDebut ?? a.dateFin, a.dateFin)}%`,
                      }}
                    />
                  </div>
                  <p className="text-xs text-gray-400">
                    {joursRestants(a.dateFin)} jours restants
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Notifications récentes */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <h2 className="text-base font-bold text-gray-900 mb-4">
            Notifications récentes
          </h2>
          {notifications.length === 0 ? (
            <p className="text-gray-400 text-sm text-center py-6">
              Aucune notification
            </p>
          ) : (
            <div className="space-y-3">
              {notifications.slice(0, 3).map((n) => (
                <div
                  key={n.id}
                  className={`flex items-start gap-3 p-3 rounded-xl border-l-4 ${n.type === "success" ? "bg-green-50 border-green-400" : n.type === "warning" ? "bg-orange-50 border-orange-400" : "bg-blue-50 border-blue-400"}`}
                >
                  <p className="text-xs text-gray-700 flex-1">{n.message}</p>
                  <p className="text-xs text-gray-400 shrink-0">
                    {new Date(n.createdAt).toLocaleDateString("fr-FR")}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Paiements récents */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <h2 className="text-base font-bold text-gray-900 mb-4">
            Paiements récents
          </h2>
          {loadingData ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-12 bg-gray-100 rounded-xl animate-pulse"
                />
              ))}
            </div>
          ) : paiements.length === 0 ? (
            <p className="text-gray-400 text-sm text-center py-6">
              Aucun paiement
            </p>
          ) : (
            <div className="space-y-2">
              {paiements.slice(0, 4).map((p) => (
                <div
                  key={p.id}
                  className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center ${p.statut === "completed" || p.statut === "succeeded" ? "bg-green-100" : p.statut === "pending" ? "bg-yellow-100" : "bg-red-100"}`}
                    >
                      {p.statut === "completed" || p.statut === "succeeded" ? (
                        <svg
                          className="w-4 h-4 text-green-600"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth={2.5}
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      ) : p.statut === "pending" ? (
                        <svg
                          className="w-4 h-4 text-yellow-600"
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
                      ) : (
                        <svg
                          className="w-4 h-4 text-red-600"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth={2.5}
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {p.intituleOffre}
                      </p>
                      <p className="text-xs text-gray-400">
                        {new Date(p.createdAt).toLocaleDateString("fr-FR")}
                      </p>
                    </div>
                  </div>
                  <p className="text-sm font-semibold text-gray-900">
                    {p.montant} TND
                  </p>
                </div>
              ))}
            </div>
          )}
          <button
            onClick={() => navigate("/dashboard/client/history")}
            className="w-full mt-4 text-sm text-[#4F46E5] hover:underline font-medium"
          >
            Voir tous les paiements
          </button>
        </div>

        {/* Actions rapides */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <h2 className="text-base font-bold text-gray-900 mb-4">
            Actions rapides
          </h2>
          <div className="grid grid-cols-2 gap-3">
            {actions.map((action) => (
              <button
                key={action.label}
                onClick={() => navigate(action.path)}
                className={`${action.bg} text-white rounded-xl p-4 flex flex-col items-center gap-2 hover:opacity-90 transition-opacity`}
              >
                {action.icon}
                <span className="text-xs font-medium text-center">
                  {action.label}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
