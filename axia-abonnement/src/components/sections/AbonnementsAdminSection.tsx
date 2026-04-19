import { useState, useEffect, useMemo } from "react";
import axiosInstance from "../../api/axiosInstance";
import ExportButton from "./../common/ExportButton";
import { formatDateFR } from "../../utils/exportUtils";

interface Abonnement {
  id: string;
  intituleOffre: string;
  type: string;
  montant: number;
  dateDebut: string;
  dateFin: string;
  statut: string;
  clientUsername: string;
  clientEmail: string;
  responsableUsername?: string;
}

type FilterTab = "tous" | "actifs" | "expirés";

function getInitials(name: string) {
  return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
}

const AVATAR_COLORS = [
  "bg-violet-100 text-violet-700",
  "bg-blue-100 text-blue-700",
  "bg-green-100 text-green-700",
  "bg-orange-100 text-orange-700",
  "bg-pink-100 text-pink-700",
];

function avatarColor(name: string) {
  return AVATAR_COLORS[name.charCodeAt(0) % AVATAR_COLORS.length];
}

function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export default function AbonnementsAdminSection() {
  const [abonnements, setAbonnements] = useState<Abonnement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [tab, setTab] = useState<FilterTab>("tous");

  useEffect(() => {
    axiosInstance
      .get<Abonnement[]>("/abonnements/all")
      .then((r) => setAbonnements(r.data ?? []))
      .catch(() => setError("Erreur lors du chargement des abonnements."))
      .finally(() => setLoading(false));
  }, []);

  const formatDate = (d: string) => new Date(d).toLocaleDateString("fr-FR");

  const totalActifs = useMemo(
    () => abonnements.filter((a) => a.statut === "actif").length,
    [abonnements]
  );
  const totalExpires = useMemo(
    () => abonnements.filter((a) => a.statut === "expiré").length,
    [abonnements]
  );
  const revenusActifs = useMemo(
    () =>
      abonnements
        .filter((a) => a.statut === "actif")
        .reduce((sum, a) => sum + a.montant, 0),
    [abonnements]
  );

  const filtered = useMemo(() => {
    let result = abonnements;
    if (tab === "actifs") result = result.filter((a) => a.statut === "actif");
    if (tab === "expirés") result = result.filter((a) => a.statut === "expiré");
    if (searchTerm)
      result = result.filter(
        (a) =>
          a.clientUsername?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          a.clientEmail?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          a.intituleOffre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          a.responsableUsername?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    return result;
  }, [abonnements, tab, searchTerm]);

  const kpiCards = [
    {
      label: "TOTAL ABONNEMENTS",
      value: abonnements.length,
      sub: "tous statuts",
      icon: "📋",
      border: "border-t-violet-400",
    },
    {
      label: "ACTIFS",
      value: totalActifs,
      sub: "en cours",
      icon: "✅",
      border: "border-t-green-400",
    },
    {
      label: "EXPIRÉS",
      value: totalExpires,
      sub: "à renouveler",
      icon: "⏰",
      border: "border-t-red-400",
    },
    {
      label: "REVENUS GÉNÉRÉS",
      value: `${revenusActifs.toFixed(2)} TND`,
      sub: "ce mois",
      icon: "💰",
      border: "border-t-blue-400",
      large: true,
    },
  ];

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Abonnements globaux</h1>
        <p className="text-sm text-gray-500 mt-1">
          {totalActifs} actif(s) · {totalExpires} expiré(s) · {abonnements.length} total
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
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
                <p className={`font-bold text-gray-900 ${card.large ? "text-2xl" : "text-3xl"}`}>
                  {card.value}
                </p>
                <p className="text-xs text-gray-400 mt-1">{card.sub}</p>
              </div>
              <span className="text-2xl">{card.icon}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Filters + Search + Export */}
      <div className="bg-white rounded-2xl border border-gray-200 p-4 mb-4">
        <div className="flex flex-wrap items-center gap-3">
          {/* Tabs */}
          <div className="flex items-center gap-1 bg-gray-100 rounded-xl p-1">
            {(["tous", "actifs", "expirés"] as FilterTab[]).map((t) => {
              const count =
                t === "tous"
                  ? abonnements.length
                  : t === "actifs"
                  ? totalActifs
                  : totalExpires;
              return (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    tab === t
                      ? "bg-white text-[#4F46E5] shadow-sm"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  {capitalize(t)}{" "}
                  <span className="ml-1 text-xs font-semibold">{count}</span>
                </button>
              );
            })}
          </div>

          {/* Search */}
          <div className="relative flex-1 min-w-48">
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
              />
            </svg>
            <input
              type="text"
              placeholder="Rechercher par client, responsable ou offre..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#4F46E5]/30 focus:border-[#4F46E5]"
            />
          </div>

          {/* Export */}
          <ExportButton
            data={filtered}
            columns={[
              { key: "clientUsername", label: "Client" },
              { key: "clientEmail", label: "Email" },
              { key: "responsableUsername", label: "Responsable" },
              { key: "intituleOffre", label: "Offre / Service" },
              { key: "type", label: "Type" },
              { key: "montant", label: "Montant (TND)" },
              { key: "dateDebut", label: "Date début", format: (v) => formatDateFR(v) },
              { key: "dateFin", label: "Date fin", format: (v) => formatDateFR(v) },
              { key: "statut", label: "Statut" },
            ]}
            filename="abonnements"
            label="Exporter"
            sheetName="Abonnements"
            pdfTitle="Abonnements globaux"
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
            <div className="w-8 h-8 border-4 border-[#4F46E5] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-gray-400 text-sm">
            Aucun abonnement trouvé
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                {["Client", "Responsable", "Offre / Service", "Période", "Type", "Montant", "Statut"].map((h) => (
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
              {filtered.map((a) => (
                <tr key={a.id} className="hover:bg-gray-50 transition-colors">
                  <td className="py-4 px-5">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${avatarColor(a.clientUsername)}`}
                      >
                        {getInitials(a.clientUsername)}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">{a.clientUsername}</p>
                        <p className="text-xs text-gray-400">{a.clientEmail}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-5 text-gray-600">
                    {a.responsableUsername ?? "—"}
                  </td>
                  <td className="py-4 px-5">
                    <span className="text-[#4F46E5] font-medium">{a.intituleOffre}</span>
                  </td>
                  <td className="py-4 px-5 text-gray-500 text-xs whitespace-nowrap">
                    {formatDate(a.dateDebut)} → {formatDate(a.dateFin)}
                  </td>
                  <td className="py-4 px-5">
                    <span className="bg-gray-100 text-gray-600 text-xs font-medium px-2.5 py-1 rounded-lg">
                      {capitalize(a.type)}
                    </span>
                  </td>
                  <td className="py-4 px-5 font-semibold text-gray-900 whitespace-nowrap">
                    {a.montant} TND
                  </td>
                  <td className="py-4 px-5">
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-xs font-semibold ${
                          a.statut === "actif"
                            ? "text-green-600"
                            : a.statut === "expiré"
                            ? "text-red-500"
                            : "text-amber-600"
                        }`}
                      >
                        {a.statut}
                      </span>
                      <div
                        className={`w-8 h-1.5 rounded-full ${
                          a.statut === "actif"
                            ? "bg-green-200"
                            : a.statut === "expiré"
                            ? "bg-red-200"
                            : "bg-amber-200"
                        }`}
                      >
                        <div
                          className={`h-full rounded-full ${
                            a.statut === "actif"
                              ? "bg-green-500 w-full"
                              : a.statut === "expiré"
                              ? "bg-red-400 w-1/3"
                              : "bg-amber-400 w-2/3"
                          }`}
                        />
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
