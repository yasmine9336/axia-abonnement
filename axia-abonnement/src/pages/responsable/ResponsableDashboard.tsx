import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/useAuth";
import ProfileSection from "../../components/private_layout/ProfileSection";
import ServicesSection from "../../components/private_layout/ServicesSection";
import OffresSection from "../../components/private_layout/OffresSection";
import SuiviClientsSection from "../../components/private_layout/SuiviClientsSection";
import AbonnementsSection from "../../components/private_layout/GestionAbonnementsSection";
import ArchiveSection from "../../components/private_layout/ArchiveSection";
import axiosInstance from "../../api/axiosInstance";
import TransactionsAdminSection from "../../components/private_layout/TransactionsAdminSection";
import StaffInbox from "../../components/chat/StaffInbox";

type Section =
  | "dashboard"
  | "subscriptions"
  | "clients"
  | "stats"
  | "transactions"
  | "profile"
  | "services"
  | "offres"
  | "suivi-clients"
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

interface Stats {
  totalAbonnes: number;
  revenuMensuel: number;
  servicesActifs: number;
  demandesEnAttente: number;
  abonnementsRecents: AbonnementRecent[];
}

export default function ResponsableDashboard({ section = "dashboard" }: Props) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (section !== "dashboard") return;

    let cancelled = false;

    axiosInstance
      .get("/abonnements/stats")
      .then((r) => {
        if (!cancelled) setStats(r.data);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [section]);

  if (section === "profile") return <ProfileSection />;
  if (section === "services") return <ServicesSection />;
  if (section === "offres") return <OffresSection />;
  if (section === "suivi-clients") return <SuiviClientsSection />;
  if (section === "subscriptions") return <AbonnementsSection />;
  if (section === "clients") return <ArchiveSection />;
  if (section === "transactions") return <TransactionsAdminSection />;
  if (section === "messages") return <StaffInbox />;

  const formatDate = (date: string) =>
    new Date(date).toLocaleDateString("fr-FR");

  const statCards = stats
    ? [
        {
          label: "Total abonnés",
          value: stats.totalAbonnes.toString(),
          sub: "abonnés actifs",
          color: "text-green-600",
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
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
          ),
        },
        {
          label: "Revenu mensuel",
          value: `${stats.revenuMensuel} TND`,
          sub: "abonnements mensuels",
          color: "text-green-600",
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
          label: "Services actifs",
          value: stats.servicesActifs.toString(),
          sub: "services disponibles",
          color: "text-gray-500",
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
        {
          label: "Demandes en attente",
          value: stats.demandesEnAttente.toString(),
          sub: "à traiter",
          color:
            stats.demandesEnAttente > 0 ? "text-yellow-600" : "text-gray-500",
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
                d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
              />
            </svg>
          ),
        },
      ]
    : [];

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Vue générale</h1>
        <p className="text-gray-500 text-sm mt-1">
          Bienvenue {user?.username} ! Voici un aperçu de vos opérations.
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {loading
          ? [1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="bg-white rounded-2xl border border-gray-200 p-5 animate-pulse"
              >
                <div className="w-24 h-4 bg-gray-200 rounded mb-3" />
                <div className="w-16 h-8 bg-gray-200 rounded mb-2" />
                <div className="w-20 h-3 bg-gray-200 rounded" />
              </div>
            ))
          : statCards.map((stat) => (
              <div
                key={stat.label}
                className="bg-white rounded-2xl border border-gray-200 p-5"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">{stat.label}</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {stat.value}
                    </p>
                    <p className={`text-xs mt-1 ${stat.color}`}>{stat.sub}</p>
                  </div>
                  <div className="w-11 h-11 bg-[#4F46E5]/10 text-[#4F46E5] rounded-xl flex items-center justify-center">
                    {stat.icon}
                  </div>
                </div>
              </div>
            ))}
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-4">
          Abonnements récents
        </h2>
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-10 bg-gray-100 rounded-xl animate-pulse"
              />
            ))}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left py-3 px-2 text-xs text-gray-500 font-medium">
                    Client
                  </th>
                  <th className="text-left py-3 px-2 text-xs text-gray-500 font-medium">
                    Offre
                  </th>
                  <th className="text-left py-3 px-2 text-xs text-gray-500 font-medium">
                    Type
                  </th>
                  <th className="text-left py-3 px-2 text-xs text-gray-500 font-medium">
                    Début
                  </th>
                  <th className="text-left py-3 px-2 text-xs text-gray-500 font-medium">
                    Montant
                  </th>
                  <th className="text-left py-3 px-2 text-xs text-gray-500 font-medium">
                    Statut
                  </th>
                </tr>
              </thead>
              <tbody>
                {stats?.abonnementsRecents.map((a) => (
                  <tr
                    key={a.id}
                    className="border-b border-gray-50 hover:bg-gray-50"
                  >
                    <td className="py-3 px-2">
                      <p className="font-medium text-gray-900">
                        {a.clientUsername}
                      </p>
                      <p className="text-xs text-gray-400">{a.clientEmail}</p>
                    </td>
                    <td className="py-3 px-2 text-gray-600">
                      {a.intituleOffre}
                    </td>
                    <td className="py-3 px-2 capitalize text-gray-600">
                      {a.type}
                    </td>
                    <td className="py-3 px-2 text-gray-600">
                      {formatDate(a.dateDebut)}
                    </td>
                    <td className="py-3 px-2 font-medium text-gray-900">
                      {a.montant} TND
                    </td>
                    <td className="py-3 px-2">
                      <span
                        className={`inline-block text-xs font-semibold px-2 py-0.5 rounded-full ${
                          a.statut === "actif" || a.statut === "Actif"
                            ? "bg-green-100 text-green-700"
                            : a.statut === "expiré" || a.statut === "Expiré"
                              ? "bg-red-100 text-red-700"
                              : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {a.statut}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {!loading && stats && stats.demandesEnAttente > 0 && (
        <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-xl flex items-center justify-between">
          <p className="text-sm font-medium text-yellow-800">
            {stats.demandesEnAttente} demande(s) de renouvellement en attente
          </p>
          <button
            onClick={() => navigate("/dashboard/responsable/subscriptions")}
            className="text-sm font-semibold text-yellow-700 hover:underline"
          >
            Traiter →
          </button>
        </div>
      )}
    </div>
  );
}
