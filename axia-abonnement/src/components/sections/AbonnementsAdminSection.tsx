import { useState, useEffect, useMemo } from "react";
import axiosInstance from "../../api/axiosInstance";
import ExportButton from "../common/ExportButton";
import { formatDateFR } from "../../utils/exportUtils";
import {
  ClipboardList,
  CheckCircle,
  Clock,
  Hourglass,
  TrendingUp,
  Search,
  Filter,
} from "lucide-react";

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

type FilterTab = "tous" | "actifs" | "expirés" | "en_attente";
type ExpirationFilter = "all" | "7days" | "30days" | "expired";

const ABONNEMENTS_PAGE_SIZE = 4;

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
  "bg-sky-100 text-sky-700",
  "bg-green-100 text-green-700",
  "bg-orange-100 text-orange-700",
  "bg-pink-100 text-pink-700",
];

function avatarColor(name: string) {
  const index = name ? name.charCodeAt(0) % AVATAR_COLORS.length : 0;
  return AVATAR_COLORS[index];
}

function capitalize(s: string) {
  if (!s) return "";
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function normalizeStatusLabel(status: string) {
  if (status === "actif") return "Actif";
  if (status === "expiré") return "Expiré";
  if (status === "en_attente") return "En attente";
  return capitalize(status);
}

function isExpired(dateFin: string) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const end = new Date(dateFin);
  end.setHours(0, 0, 0, 0);

  return end < today;
}

function expiresWithinDays(dateFin: string, days: number) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const limit = new Date(today);
  limit.setDate(today.getDate() + days);

  const end = new Date(dateFin);
  end.setHours(0, 0, 0, 0);

  return end >= today && end <= limit;
}

export default function AbonnementsAdminSection() {
  const [abonnements, setAbonnements] = useState<Abonnement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [searchTerm, setSearchTerm] = useState("");
  const [tab, setTab] = useState<FilterTab>("tous");

  const [responsableFilter, setResponsableFilter] = useState("all");
  const [offreFilter, setOffreFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [expirationFilter, setExpirationFilter] =
    useState<ExpirationFilter>("all");

  const [page, setPage] = useState(1);

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
    [abonnements],
  );

  const totalExpires = useMemo(
    () => abonnements.filter((a) => a.statut === "expiré").length,
    [abonnements],
  );

  const totalEnAttente = useMemo(
    () => abonnements.filter((a) => a.statut === "en_attente").length,
    [abonnements],
  );

  const revenusActifs = useMemo(
    () =>
      abonnements
        .filter((a) => a.statut === "actif")
        .reduce((sum, a) => sum + a.montant, 0),
    [abonnements],
  );

  const responsablesOptions = useMemo(() => {
    return Array.from(
      new Set(
        abonnements
          .map((a) => a.responsableUsername)
          .filter((v): v is string => Boolean(v)),
      ),
    ).sort((a, b) => a.localeCompare(b));
  }, [abonnements]);

  const offresOptions = useMemo(() => {
    return Array.from(
      new Set(
        abonnements
          .map((a) => a.intituleOffre)
          .filter((v): v is string => Boolean(v)),
      ),
    ).sort((a, b) => a.localeCompare(b));
  }, [abonnements]);

  const typesOptions = useMemo(() => {
    return Array.from(
      new Set(
        abonnements.map((a) => a.type).filter((v): v is string => Boolean(v)),
      ),
    ).sort((a, b) => a.localeCompare(b));
  }, [abonnements]);

  const filtered = useMemo(() => {
    let result = abonnements;

    if (tab === "actifs") {
      result = result.filter((a) => a.statut === "actif");
    }

    if (tab === "expirés") {
      result = result.filter((a) => a.statut === "expiré");
    }

    if (tab === "en_attente") {
      result = result.filter((a) => a.statut === "en_attente");
    }

    if (responsableFilter !== "all") {
      result = result.filter(
        (a) => a.responsableUsername === responsableFilter,
      );
    }

    if (offreFilter !== "all") {
      result = result.filter((a) => a.intituleOffre === offreFilter);
    }

    if (typeFilter !== "all") {
      result = result.filter((a) => a.type === typeFilter);
    }

    if (expirationFilter === "7days") {
      result = result.filter((a) => expiresWithinDays(a.dateFin, 7));
    }

    if (expirationFilter === "30days") {
      result = result.filter((a) => expiresWithinDays(a.dateFin, 30));
    }

    if (expirationFilter === "expired") {
      result = result.filter(
        (a) => a.statut === "expiré" || isExpired(a.dateFin),
      );
    }

    const q = searchTerm.toLowerCase().trim();

    if (q) {
      result = result.filter(
        (a) =>
          a.clientUsername?.toLowerCase().includes(q) ||
          a.clientEmail?.toLowerCase().includes(q) ||
          a.intituleOffre?.toLowerCase().includes(q) ||
          a.responsableUsername?.toLowerCase().includes(q),
      );
    }

    return result;
  }, [
    abonnements,
    tab,
    searchTerm,
    responsableFilter,
    offreFilter,
    typeFilter,
    expirationFilter,
  ]);

  const totalPages = Math.max(
    1,
    Math.ceil(filtered.length / ABONNEMENTS_PAGE_SIZE),
  );

  const paginatedAbonnements = useMemo(() => {
    const start = (page - 1) * ABONNEMENTS_PAGE_SIZE;
    return filtered.slice(start, start + ABONNEMENTS_PAGE_SIZE);
  }, [filtered, page]);

  useEffect(() => {
    setPage(1);
  }, [
    tab,
    searchTerm,
    responsableFilter,
    offreFilter,
    typeFilter,
    expirationFilter,
  ]);

  useEffect(() => {
    setPage((currentPage) => Math.min(currentPage, totalPages));
  }, [totalPages]);

  const resetAdvancedFilters = () => {
    setResponsableFilter("all");
    setOffreFilter("all");
    setTypeFilter("all");
    setExpirationFilter("all");
  };

  const hasAdvancedFilters =
    responsableFilter !== "all" ||
    offreFilter !== "all" ||
    typeFilter !== "all" ||
    expirationFilter !== "all";

  const renderPagination = () => {
    if (totalPages <= 1) return null;

    return (
      <div className="flex items-center justify-between px-5 py-4 border-t border-gray-100">
        <p className="text-sm text-gray-500">
          Affichage de {(page - 1) * ABONNEMENTS_PAGE_SIZE + 1} à{" "}
          {Math.min(page * ABONNEMENTS_PAGE_SIZE, filtered.length)} sur{" "}
          {filtered.length} abonnement(s)
        </p>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-3 py-1.5 rounded-lg border border-gray-200 text-sm text-gray-600 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50"
          >
            Précédent
          </button>

          <span className="text-sm text-gray-500">
            Page {page} sur {totalPages}
          </span>

          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="px-3 py-1.5 rounded-lg border border-gray-200 text-sm text-gray-600 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50"
          >
            Suivant
          </button>
        </div>
      </div>
    );
  };

  const kpiCards = [
    {
      label: "TOTAL ABONNEMENTS",
      value: abonnements.length,
      sub: "tous statuts",
      icon: <ClipboardList className="w-6 h-6 text-blue-600" />,
      border: "border-t-blue-500",
    },
    {
      label: "ACTIFS",
      value: totalActifs,
      sub: "en cours",
      icon: <CheckCircle className="w-6 h-6 text-green-500" />,
      border: "border-t-green-400",
    },
    {
      label: "EXPIRÉS",
      value: totalExpires,
      sub: "non renouvelés",
      icon: <Clock className="w-6 h-6 text-red-400" />,
      border: "border-t-red-400",
    },
    {
      label: "EN ATTENTE",
      value: totalEnAttente,
      sub: "en cours de traitement",
      icon: <Hourglass className="w-6 h-6 text-yellow-400" />,
      border: "border-t-yellow-400",
    },
    {
      label: "REVENUS GÉNÉRÉS",
      value: `${revenusActifs.toFixed(2)} TND`,
      sub: "ce mois",
      icon: <TrendingUp className="w-6 h-6 text-blue-500" />,
      border: "border-t-blue-400",
      large: true,
    },
  ];

  return (
    <div className="ui-page">
      <div className="mb-6">
        <h1 className="ui-title">Abonnements globaux</h1>

        <p className="ui-subtitle">
          {totalActifs} actif(s) · {totalExpires} expiré(s) · {totalEnAttente}{" "}
          en attente · {abonnements.length} total
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
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

                <p
                  className={`font-bold text-gray-900 ${
                    card.large ? "text-2xl" : "text-3xl"
                  }`}
                >
                  {card.value}
                </p>

                <p className="text-xs text-gray-400 mt-1">{card.sub}</p>
              </div>

              <span className="mt-1">{card.icon}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 p-4 mb-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1 bg-gray-100 rounded-xl p-1">
            {(["tous", "actifs", "expirés", "en_attente"] as FilterTab[]).map(
              (t) => {
                const count =
                  t === "tous"
                    ? abonnements.length
                    : t === "actifs"
                      ? totalActifs
                      : t === "expirés"
                        ? totalExpires
                        : totalEnAttente;

                return (
                  <button
                    key={t}
                    onClick={() => setTab(t)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                      tab === t
                        ? "bg-white text-(--color-primary) shadow-sm"
                        : "text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    {t === "en_attente" ? "En attente" : capitalize(t)}

                    <span className="ml-1 text-xs font-semibold">{count}</span>
                  </button>
                );
              },
            )}
          </div>

          <div className="relative flex-1 min-w-48">
            <Search
              className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
              size={16}
            />

            <input
              type="text"
              placeholder="Rechercher par client, responsable ou offre..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="ui-input pl-11! pr-4"
            />
          </div>

          <ExportButton
            data={filtered}
            columns={[
              { key: "clientUsername", label: "Client" },
              { key: "clientEmail", label: "Email" },
              { key: "responsableUsername", label: "Responsable" },
              { key: "intituleOffre", label: "Offre / Service" },
              { key: "type", label: "Type" },
              { key: "montant", label: "Montant (TND)" },
              {
                key: "dateDebut",
                label: "Date début",
                format: (v) => formatDateFR(v),
              },
              {
                key: "dateFin",
                label: "Date fin",
                format: (v) => formatDateFR(v),
              },
              { key: "statut", label: "Statut" },
            ]}
            filename="abonnements"
            label="Exporter"
            sheetName="Abonnements"
            pdfTitle="Abonnements globaux"
          />
        </div>

        <div className="mt-3 pt-3 border-t border-gray-100">
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-2 mr-1">
              <Filter size={15} className="text-gray-400" />
              <span className="text-sm font-semibold text-gray-700">
                Filtres
              </span>
            </div>

            <select
              value={responsableFilter}
              onChange={(e) => setResponsableFilter(e.target.value)}
              className="h-9 min-w-44 rounded-xl border border-gray-200 bg-white px-3 text-sm text-gray-700 outline-none focus:border-(--color-primary)"
            >
              <option value="all">Tous les responsables</option>
              {responsablesOptions.map((responsable) => (
                <option key={responsable} value={responsable}>
                  {responsable}
                </option>
              ))}
            </select>

            <select
              value={offreFilter}
              onChange={(e) => setOffreFilter(e.target.value)}
              className="h-9 min-w-48 rounded-xl border border-gray-200 bg-white px-3 text-sm text-gray-700 outline-none focus:border-(--color-primary)"
            >
              <option value="all">Toutes les offres/services</option>
              {offresOptions.map((offre) => (
                <option key={offre} value={offre}>
                  {offre}
                </option>
              ))}
            </select>

            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="h-9 min-w-36 rounded-xl border border-gray-200 bg-white px-3 text-sm text-gray-700 outline-none focus:border-(--color-primary)"
            >
              <option value="all">Tous les types</option>
              {typesOptions.map((type) => (
                <option key={type} value={type}>
                  {capitalize(type)}
                </option>
              ))}
            </select>

            <select
              value={expirationFilter}
              onChange={(e) =>
                setExpirationFilter(e.target.value as ExpirationFilter)
              }
              className="h-9 min-w-44 rounded-xl border border-gray-200 bg-white px-3 text-sm text-gray-700 outline-none focus:border-(--color-primary)"
            >
              <option value="all">Toutes les expirations</option>
              <option value="7days">Expire dans 7 jours</option>
              <option value="30days">Expire dans 30 jours</option>
              <option value="expired">Déjà expirés</option>
            </select>

            {hasAdvancedFilters && (
              <button
                onClick={resetAdvancedFilters}
                className="h-9 px-3 rounded-xl border border-gray-200 text-sm font-medium text-(--color-primary) hover:bg-gray-50"
              >
                Réinitialiser
              </button>
            )}
          </div>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm">
          {error}
        </div>
      )}

      <div className="bg-white rounded-2xl border border-gray-200 p-0 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-40">
            <div className="ui-spinner" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-gray-400 text-sm">
            Aucun abonnement trouvé
          </div>
        ) : (
          <>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  {[
                    "Client",
                    "Responsable",
                    "Offre / Service",
                    "Période",
                    "Type",
                    "Montant",
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
                {paginatedAbonnements.map((a) => (
                  <tr key={a.id} className="hover:bg-gray-50 transition-colors">
                    <td className="py-4 px-5">
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${avatarColor(
                            a.clientUsername,
                          )}`}
                        >
                          {getInitials(a.clientUsername)}
                        </div>

                        <div>
                          <p className="font-semibold text-gray-900">
                            {a.clientUsername}
                          </p>

                          <p className="text-xs text-gray-400">
                            {a.clientEmail}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="py-4 px-5 text-gray-600">
                      {a.responsableUsername ?? "—"}
                    </td>

                    <td className="py-4 px-5">
                      <span className="text-(--color-primary) font-medium">
                        {a.intituleOffre}
                      </span>
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
                          {normalizeStatusLabel(a.statut)}
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

            {renderPagination()}
          </>
        )}
      </div>
    </div>
  );
}
