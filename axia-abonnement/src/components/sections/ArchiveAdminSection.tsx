import { useState, useEffect, useMemo } from "react";
import axiosInstance from "../../api/axiosInstance";
import { Search, Users, CheckCircle, Clock } from "lucide-react";
import ExportButton from "../common/ExportButton";

interface Client {
  id: string;
  username: string;
  email: string;
  phoneNumber: string | null;
  isActive: boolean;
  createdAt: string;
  abonnementActif: string | null;
  montantActif: number | null;
  statutAbonnement: string | null;
  responsableUsername: string | null;
}

function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

const AVATAR_COLORS = [
  "bg-blue-100 text-blue-700",
  "bg-blue-100 text-blue-700",
  "bg-green-100 text-green-700",
  "bg-orange-100 text-orange-700",
  "bg-pink-100 text-pink-700",
  "bg-teal-100 text-teal-700",
];

function avatarColor(name: string) {
  return AVATAR_COLORS[name.charCodeAt(0) % AVATAR_COLORS.length];
}

function ResponsableAvatar({ name }: { name: string }) {
  return (
    <div className="flex items-center gap-2">
      <div
        className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${avatarColor(
          name,
        )}`}
      >
        {getInitials(name)}
      </div>
      <span className="text-sm text-gray-600">{name}</span>
    </div>
  );
}

// ✅ Remplacer
type FilterTab = "tous" | "actif" | "inactif";

export default function ArchiveAdminSection() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  // ✅ Remplacer
  const [filterStatut, setFilterStatut] = useState<FilterTab>("tous");

  useEffect(() => {
    axiosInstance
      .get("/users/clients")
      .then((r) => setClients(r.data))
      .catch(() => setError("Erreur lors du chargement des clients."))
      .finally(() => setLoading(false));
  }, []);

  const formatDate = (d: string) => new Date(d).toLocaleDateString("fr-FR");

  // ✅ Remplacer KPI counts
  const totalActifs = useMemo(
    () => clients.filter((c) => c.statutAbonnement === "actif").length,
    [clients],
  );
  const totalInactifs = useMemo(
    () => clients.filter((c) => c.statutAbonnement !== "actif").length,
    [clients],
  );

  const filtered = useMemo(() => {
    let result = clients;

    if (searchTerm)
      result = result.filter(
        (c) =>
          c.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
          c.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          c.responsableUsername
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          c.abonnementActif?.toLowerCase().includes(searchTerm.toLowerCase()),
      );

    // ✅ Remplacer le filtre
    if (filterStatut === "actif")
      result = result.filter((c) => c.statutAbonnement === "actif");
    if (filterStatut === "inactif")
      result = result.filter((c) => c.statutAbonnement !== "actif"); // expiré + null

    return result;
  }, [clients, searchTerm, filterStatut]);

  // ✅ Remplacer les KPI cards
  const kpiCards = [
    {
      label: "TOTAL CLIENTS",
      value: clients.length,
      sub: "tous responsables confondus",
      icon: <Users className="w-5 h-5 text-blue-600" />,
      border: "border-t-blue-500",
    },
    {
      label: "CLIENTS ACTIFS",
      value: totalActifs,
      sub: "abonnements en cours",
      icon: <CheckCircle className="w-5 h-5 text-green-500" />,
      border: "border-t-green-400",
    },
    {
      label: "CLIENTS INACTIFS",
      value: totalInactifs,
      sub: "expirés ou sans abonnement",
      icon: <Clock className="w-5 h-5 text-red-400" />,
      border: "border-t-red-400",
    },
  ];

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Archive clients</h1>
        <p className="text-gray-500 text-sm mt-1">
          {clients.length} client(s) au total
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {kpiCards.map((card) => (
          <div
            key={card.label}
            className={`bg-white rounded-2xl border border-gray-200 border-t-4 ${card.border} p-5`}
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs text-gray-400 font-medium tracking-wide mb-2">
                  {card.label}
                </p>
                <p className="text-3xl font-bold text-gray-900">{card.value}</p>
                <p className="text-xs text-gray-400 mt-1">{card.sub}</p>
              </div>
              <div className="mt-1">{card.icon}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Search + Filter + Export */}
      <div className="bg-white rounded-2xl border border-gray-200 p-4 mb-4">
        <div className="flex flex-wrap items-center gap-3">
          {/* Tabs */}
          <div className="flex items-center gap-1 bg-gray-100 rounded-xl p-1">
            {/* ✅ Remplacer les tabs */}
            {(["tous", "actif", "inactif"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setFilterStatut(t)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  filterStatut === t
                    ? "bg-white text-[#0F6CBD] shadow-sm"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                {t === "tous" ? "Tous" : t === "actif" ? "Actifs" : "Inactifs"}
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="relative flex-1 min-w-48">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              size={16}
            />
            <input
              type="text"
              placeholder="Rechercher par nom, email, responsable ou offre..."
              className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#0F6CBD]/30 focus:border-[#0F6CBD]"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Export */}
          <ExportButton
            data={filtered}
            columns={[
              { key: "username", label: "Client" },
              { key: "email", label: "Email" },
              { key: "phoneNumber", label: "Téléphone" },
              { key: "responsableUsername", label: "Responsable" },
              { key: "abonnementActif", label: "Abonnement actif" },
              { key: "montantActif", label: "Montant (TND)" },
              { key: "statutAbonnement", label: "Statut" },
              {
                key: "createdAt",
                label: "Membre depuis",
                format: (v) => formatDate(v as string),
              },
            ]}
            filename="clients"
            label="Exporter clients"
            sheetName="Clients"
            pdfTitle="Archive clients"
          />
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm">
          {error}
        </div>
      )}
      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-40">
            <div className="w-8 h-8 border-4 border-[#0F6CBD] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-gray-400 text-sm">
            Aucun client trouvé
          </div>
        ) : (
          <>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  {[
                    "Client",
                    "Email",
                    "Responsable",
                    "Abonnement actif",
                    "Mensuel",
                    "Statut",
                  ].map((h) => (
                    <th
                      key={h}
                      className="text-left py-3 px-5 text-xs text-gray-400 font-medium uppercase tracking-wide"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map((c) => (
                  <tr key={c.id} className="hover:bg-gray-50 transition-colors">
                    {/* Client */}
                    <td className="py-4 px-5">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${avatarColor(
                            c.username,
                          )}`}
                        >
                          {getInitials(c.username)}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">
                            {c.username}
                          </p>
                          <p className="text-xs text-gray-400">
                            Membre depuis {formatDate(c.createdAt)}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Email */}
                    <td className="py-4 px-5 text-gray-500 text-xs">
                      {c.email}
                    </td>

                    {/* Responsable */}
                    <td className="py-4 px-5">
                      {c.responsableUsername ? (
                        <ResponsableAvatar name={c.responsableUsername} />
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </td>

                    {/* Abonnement */}
                    <td className="py-4 px-5">
                      {c.abonnementActif ? (
                        <span className="text-[#0F6CBD] font-medium">
                          {c.abonnementActif}
                        </span>
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </td>

                    {/* Montant */}
                    <td className="py-4 px-5 font-semibold text-gray-900 whitespace-nowrap">
                      {c.montantActif != null ? `${c.montantActif} TND` : "—"}
                    </td>

                    {/* Statut */}
                    <td className="py-4 px-5">
                      {c.statutAbonnement ? (
                        <span
                          className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                            c.statutAbonnement === "actif"
                              ? "bg-green-100 text-green-700"
                              : "bg-red-100 text-red-600"
                          }`}
                        >
                          {c.statutAbonnement}
                        </span>
                      ) : (
                        <span className="text-xs text-gray-400 bg-gray-100 px-2.5 py-1 rounded-full">
                          aucun
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Footer */}
            <div className="px-5 py-3 border-t border-gray-100 bg-gray-50">
              <p className="text-xs text-gray-500">
                {filtered.length} client(s) affiché(s)
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
