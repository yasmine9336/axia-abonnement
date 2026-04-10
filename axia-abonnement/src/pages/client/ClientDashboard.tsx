import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import ProfileSection from "../../components/private_layout/ProfileSection";
import PaymentSection from "../../components/private_layout/PaymentSection";
import SubscriptionsSection from "../../components/private_layout/MesAbonnementsSection";
import HistoriqueSection from "../../components/private_layout/HistoriqueSection";
import axiosInstance from "../../api/axiosInstance";
import { useNotifications } from "../../context/NotificationContext";

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
  statut: string;
}

interface PaiementItem {
  id: string;
  intituleOffre: string;
  montant: number;
  statut: string;
  createdAt: string;
}

export default function ClientDashboard({ section = "dashboard" }: Props) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { notifications, unreadCount } = useNotifications();

  const [abonnements, setAbonnements] = useState<AbonnementItem[]>([]);
  const [paiements, setPaiements] = useState<PaiementItem[]>([]);
  const [loadingData, setLoadingData] = useState(true);

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
        if (cancelled) return;
        setAbonnements([]);
        setPaiements([]);
      })
      .finally(() => {
        if (cancelled) return;
        setLoadingData(false);
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

  if (section === "profile") return <ProfileSection />;
  if (section === "payment") return <PaymentSection />;
  if (section === "subscriptions") return <SubscriptionsSection />;
  if (section === "history") return <HistoriqueSection />;

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Tableau de bord</h1>
        <p className="text-gray-500 text-sm mt-1">
          Bienvenue {user?.username} ! Voici un aperçu de vos abonnements.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          {
            label: "Abonnements actifs",
            value: abonnementsActifs.length.toString(),
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
            label: "Total dépensé",
            value: `${totalDepense.toFixed(2)} TND`,
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
                  d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            ),
          },
          {
            label: "Notifications",
            value: unreadCount.toString(),
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
                  d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                />
              </svg>
            ),
          },
          {
            label: "Ce mois-ci",
            value: `${totalCeMois.toFixed(2)} TND`,
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
                  d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                />
              </svg>
            ),
          },
        ].map((stat) => (
          <div
            key={stat.label}
            className="bg-white rounded-2xl border border-gray-200 p-5"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 mb-1">{stat.label}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              </div>
              <div className="w-11 h-11 bg-[#4F46E5]/10 text-[#4F46E5] rounded-xl flex items-center justify-center">
                {stat.icon}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Abonnements actifs */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">
            Abonnements actifs
          </h2>
          {loadingData ? (
            <div className="h-16 bg-gray-100 rounded-xl animate-pulse" />
          ) : abonnementsActifs.length === 0 ? (
            <p className="text-gray-400 text-sm text-center py-6">
              Aucun abonnement actif
            </p>
          ) : (
            <div className="space-y-3">
              {abonnementsActifs.map((a) => (
                <div
                  key={a.id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-xl"
                >
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">
                      {a.intituleOffre}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Expire : {new Date(a.dateFin).toLocaleDateString("fr-FR")}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900 text-sm">
                      {a.montant} TND/{a.type === "annuel" ? "an" : "mois"}
                    </p>
                    <span className="inline-block mt-1 bg-green-100 text-green-700 text-xs font-semibold px-2 py-0.5 rounded-full">
                      Actif
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Notifications récentes */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">
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
                  className={`flex items-start gap-3 p-3 rounded-xl border-l-4 ${
                    n.type === "success"
                      ? "bg-green-50 border-green-400"
                      : n.type === "warning"
                        ? "bg-orange-50 border-orange-400"
                        : "bg-blue-50 border-blue-400"
                  }`}
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
          <h2 className="text-lg font-bold text-gray-900 mb-4">
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
            <div className="space-y-3">
              {paiements.slice(0, 4).map((p) => (
                <div
                  key={p.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-xl"
                >
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {p.intituleOffre}
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(p.createdAt).toLocaleDateString("fr-FR")}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-gray-900">
                      {p.montant} TND
                    </p>
                    <span
                      className={`inline-block text-xs font-semibold px-2 py-0.5 rounded-full ${
                        p.statut === "completed" || p.statut === "succeeded"
                          ? "bg-green-100 text-green-700"
                          : p.statut === "pending"
                            ? "bg-yellow-100 text-yellow-700"
                            : "bg-red-100 text-red-700"
                      }`}
                    >
                      {p.statut === "completed" || p.statut === "succeeded"
                        ? "Complété"
                        : p.statut === "pending"
                          ? "En cours"
                          : "Échoué"}
                    </span>
                  </div>
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
          <h2 className="text-lg font-bold text-gray-900 mb-4">
            Actions rapides
          </h2>
          <div className="space-y-3">
            {[
              {
                label: "Effectuer un paiement",
                path: "/dashboard/client/payment",
                icon: "💳",
              },
              {
                label: "Gérer les abonnements",
                path: "/dashboard/client/subscriptions",
                icon: "📦",
              },
              {
                label: "Contacter le support",
                path: "/dashboard/client/chat",
                icon: "💬",
              },
              { label: "Explorer les offres", path: "/", icon: "🔍" },
            ].map((action) => (
              <button
                key={action.label}
                onClick={() => navigate(action.path)}
                className="w-full flex items-center gap-3 px-4 py-3 border border-[#4F46E5] text-[#4F46E5] hover:bg-[#4F46E5] hover:text-white rounded-xl transition-colors text-sm font-medium"
              >
                <span>{action.icon}</span>
                {action.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
