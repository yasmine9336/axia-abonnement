import { useAuth } from "../../context/AuthContext";
import ProfileSection from "../../components/private_layout/ProfileSection";
import ResponsablesSection from "../../components/private_layout/ResponsablesSection";
import AbonnementsAdminSection from "../../components/private_layout/AbonnementsAdminSection";
import CatalogueAdminSection from "../../components/private_layout/CatalogueAdminSection";
import ArchiveAdminSection from "../../components/private_layout/ArchiveAdminSection";

type Section =
  | "dashboard"
  | "responsables"
  | "abonnements"
  | "catalogue"
  | "archive"
  | "profile";

interface Props {
  section?: Section;
}

export default function AdminDashboard({ section = "dashboard" }: Props) {
  const { user } = useAuth();

  if (section === "profile") return <ProfileSection />;
  if (section === "responsables") return <ResponsablesSection />;
  if (section === "abonnements") return <AbonnementsAdminSection />;
  if (section === "catalogue") return <CatalogueAdminSection />;
  if (section === "archive") return <ArchiveAdminSection />;

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Tableau de bord</h1>
        <p className="text-gray-500 text-sm mt-1">
          Bienvenue {user?.username} ! Vue complète de la plateforme.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          {
            label: "Revenu total",
            value: "367kTND",
            sub: "+24% vs période précédente",
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
            label: "Total abonnés",
            value: "1 247",
            sub: "+15% ce mois",
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
            label: "Responsables actifs",
            value: "3",
            sub: "Tous départements",
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
                  d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                />
              </svg>
            ),
          },
          {
            label: "Revenu moy/utilisateur",
            value: "294TND",
            sub: "+8% d'augmentation",
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
                <p className={`text-xs mt-1 ${stat.color}`}>{stat.sub}</p>
              </div>
              <div className="w-11 h-11 bg-[#4F46E5]/10 text-[#4F46E5] rounded-xl flex items-center justify-center">
                {stat.icon}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6 mb-6">
        {/* Statistiques plateforme */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-6">
            Statistiques plateforme
          </h2>
          <div className="space-y-5">
            {[
              {
                label: "Santé système",
                value: "99.9%",
                color: "bg-green-500",
                width: "99.9%",
              },
              {
                label: "Stockage utilisé",
                value: "67%",
                color: "bg-[#4F46E5]",
                width: "67%",
              },
              {
                label: "Utilisation API",
                value: "43%",
                color: "bg-[#4F46E5]",
                width: "43%",
              },
            ].map((item) => (
              <div key={item.label}>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-500 text-xs">{item.label}</span>
                  <span className="text-xs font-semibold text-gray-900">
                    {item.value}
                  </span>
                </div>
                <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                  <div
                    className={`${item.color} h-full rounded-full`}
                    style={{ width: item.width }}
                  />
                </div>
              </div>
            ))}
            <div className="pt-4 border-t border-gray-100">
              <h4 className="text-sm font-semibold text-gray-900 mb-3">
                Activité récente
              </h4>
              <div className="space-y-2 text-xs text-gray-500">
                <p>• 47 nouveaux abonnements aujourd'hui</p>
                <p>• 3 245TND de revenu généré</p>
                <p>• 2 nouveaux responsables intégrés</p>
              </div>
            </div>
          </div>
        </div>

        {/* Performance responsables */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 lg:col-span-2">
          <h2 className="text-lg font-bold text-gray-900 mb-4">
            Performance des responsables
          </h2>
          <div className="space-y-4">
            {[
              {
                name: "John Smith",
                revenue: "32 450TND",
                subscribers: 145,
                percent: 75,
              },
              {
                name: "Sarah Johnson",
                revenue: "28 920TND",
                subscribers: 98,
                percent: 60,
              },
              {
                name: "Mike Davis",
                revenue: "15 430TND",
                subscribers: 67,
                percent: 35,
              },
            ].map((resp) => (
              <div key={resp.name} className="p-4 bg-gray-50 rounded-xl">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-[#4F46E5] rounded-full flex items-center justify-center text-white text-sm font-bold">
                      {resp.name.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">
                        {resp.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {resp.subscribers} abonnés
                      </p>
                    </div>
                  </div>
                  <p className="text-sm font-bold text-[#4F46E5]">
                    {resp.revenue}
                  </p>
                </div>
                <div className="w-full bg-gray-200 h-1.5 rounded-full overflow-hidden">
                  <div
                    className="bg-[#4F46E5] h-full rounded-full"
                    style={{ width: `${resp.percent}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Utilisateurs récents */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-4">
          Utilisateurs récents
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left py-3 px-2 text-xs text-gray-500 font-medium">
                  Utilisateur
                </th>
                <th className="text-left py-3 px-2 text-xs text-gray-500 font-medium">
                  Rôle
                </th>
                <th className="text-left py-3 px-2 text-xs text-gray-500 font-medium">
                  Plan
                </th>
                <th className="text-left py-3 px-2 text-xs text-gray-500 font-medium">
                  Revenu
                </th>
                <th className="text-left py-3 px-2 text-xs text-gray-500 font-medium">
                  Statut
                </th>
              </tr>
            </thead>
            <tbody>
              {[
                {
                  name: "John Smith",
                  role: "Client",
                  plan: "Professional",
                  revenue: "79TND",
                  status: "active",
                },
                {
                  name: "Sarah Johnson",
                  role: "Client",
                  plan: "Basic",
                  revenue: "29TND",
                  status: "active",
                },
                {
                  name: "Mike Davis",
                  role: "Responsable",
                  plan: "Enterprise",
                  revenue: "199TND",
                  status: "active",
                },
                {
                  name: "Emily Brown",
                  role: "Client",
                  plan: "Professional",
                  revenue: "79TND",
                  status: "pending",
                },
              ].map((row, i) => (
                <tr
                  key={i}
                  className="border-b border-gray-50 hover:bg-gray-50"
                >
                  <td className="py-3 px-2">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 bg-[#4F46E5]/10 text-[#4F46E5] rounded-full flex items-center justify-center text-xs font-bold">
                        {row.name.charAt(0)}
                      </div>
                      <span className="text-gray-900">{row.name}</span>
                    </div>
                  </td>
                  <td className="py-3 px-2 text-gray-600">{row.role}</td>
                  <td className="py-3 px-2 text-gray-600">{row.plan}</td>
                  <td className="py-3 px-2 text-gray-900 font-medium">
                    {row.revenue}
                  </td>
                  <td className="py-3 px-2">
                    <span
                      className={`inline-block text-xs font-semibold px-2 py-0.5 rounded-full ${
                        row.status === "active"
                          ? "bg-green-100 text-green-700"
                          : "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      {row.status === "active" ? "Actif" : "En attente"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
