import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import ProfileSection from "../../components/private_layout/ProfileSection";
import ResponsablesSection from "../../components/private_layout/ResponsablesSection";
import AbonnementsAdminSection from "../../components/private_layout/AbonnementsAdminSection";
import CatalogueAdminSection from "../../components/private_layout/CatalogueAdminSection";
import ArchiveAdminSection from "../../components/private_layout/ArchiveAdminSection";
import TransactionsAdminSection from "../../components/private_layout/TransactionsAdminSection";
import axiosInstance from "../../api/axiosInstance";

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

interface Stats {
  totalAbonnes: number;
  revenuMensuel: number;
  demandesEnAttente: number;
  abonnementsRecents: AbonnementRecent[];
}

const EMPTY_STATS: Stats = {
  totalAbonnes: 0,
  revenuMensuel: 0,
  demandesEnAttente: 0,
  abonnementsRecents: [],
};

export default function AdminDashboard({ section = "dashboard" }: Props) {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [stats, setStats] = useState<Stats>(EMPTY_STATS);
  const [clients, setClients] = useState<ClientItem[]>([]);
  const [loading, setLoading] = useState(section === "dashboard");

  useEffect(() => {
    if (section !== "dashboard") return;

    let cancelled = false;

    Promise.all([
      axiosInstance.get("/abonnements/stats"),
      axiosInstance.get("/users/clients"),
    ])
      .then(([statsRes, clientsRes]) => {
        if (cancelled) return;
        setStats(statsRes.data ?? EMPTY_STATS);
        setClients(clientsRes.data ?? []);
      })
      .catch(() => {
        if (cancelled) return;
        setStats(EMPTY_STATS);
        setClients([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [section]);

  const statCards = [
    {
      label: "Revenu mensuel",
      value: `${stats.revenuMensuel} TND`,
      sub: "abonnements actifs mensuels",
      color: "text-green-600",
    },
    {
      label: "Total abonnés",
      value: stats.totalAbonnes,
      sub: "abonnés actifs",
      color: "text-green-600",
    },
    {
      label: "Total clients",
      value: clients.length,
      sub: `${clients.filter((c) => c.isActive).length} actifs`,
      color: "text-gray-500",
    },
    {
      label: "Demandes en attente",
      value: stats.demandesEnAttente,
      sub: "à traiter",
      color: stats.demandesEnAttente > 0 ? "text-yellow-600" : "text-gray-500",
    },
  ];

  if (section === "profile") return <ProfileSection />;
  if (section === "responsables") return <ResponsablesSection />;
  if (section === "abonnements") return <AbonnementsAdminSection />;
  if (section === "catalogue") return <CatalogueAdminSection />;
  if (section === "archive") return <ArchiveAdminSection />;
  if (section === "transactions") return <TransactionsAdminSection />;

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Tableau de bord</h1>
        <p className="text-gray-500 text-sm mt-1">
          Bienvenue {user?.username} ! Vue complète de la plateforme.
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
                <p className="text-xs text-gray-500 mb-1">{stat.label}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                <p className={`text-xs mt-1 ${stat.color}`}>{stat.sub}</p>
              </div>
            ))}
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-4">
          Clients récents
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
                    Email
                  </th>
                  <th className="text-left py-3 px-2 text-xs text-gray-500 font-medium">
                    Statut
                  </th>
                </tr>
              </thead>
              <tbody>
                {clients.slice(0, 5).map((c) => (
                  <tr
                    key={c.id}
                    className="border-b border-gray-50 hover:bg-gray-50"
                  >
                    <td className="py-3 px-2">{c.username}</td>
                    <td className="py-3 px-2 text-gray-500">{c.email}</td>
                    <td className="py-3 px-2">
                      <span
                        className={`inline-block text-xs font-semibold px-2 py-0.5 rounded-full ${
                          c.isActive
                            ? "bg-green-100 text-green-700"
                            : "bg-gray-100 text-gray-500"
                        }`}
                      >
                        {c.isActive ? "Actif" : "Inactif"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 p-6 mt-6">
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
                    Offre / Service
                  </th>
                  <th className="text-left py-3 px-2 text-xs text-gray-500 font-medium">
                    Type
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
                {stats.abonnementsRecents.map((a) => (
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
                    <td className="py-3 px-2 font-medium text-gray-900">
                      {a.montant} TND
                    </td>
                    <td className="py-3 px-2">
                      <span
                        className={`inline-block text-xs font-semibold px-2 py-0.5 rounded-full ${
                          a.statut === "actif"
                            ? "bg-green-100 text-green-700"
                            : a.statut === "expiré"
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

      {!loading && stats.demandesEnAttente > 0 && (
        <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-xl flex items-center justify-between">
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
    </div>
  );
}
