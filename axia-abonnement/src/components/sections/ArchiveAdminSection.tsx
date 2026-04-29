import { useState, useEffect, useMemo } from "react";
import axiosInstance from "../../api/axiosInstance";
import { Search, Users, CheckCircle, Clock, Filter } from "lucide-react";
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

type FilterTab = "tous" | "actif" | "inactif";

const PAGE_SIZE = 4;

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
  "bg-teal-100 text-teal-700",
];

function avatarColor(name: string) {
  const index = name ? name.charCodeAt(0) % AVATAR_COLORS.length : 0;
  return AVATAR_COLORS[index];
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

export default function ArchiveAdminSection() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatut, setFilterStatut] = useState<FilterTab>("tous");
  const [responsableFilter, setResponsableFilter] = useState("all");
  const [abonnementFilter, setAbonnementFilter] = useState("all");

  const [page, setPage] = useState(1);

  useEffect(() => {
    axiosInstance
      .get<Client[]>("/users/clients")
      .then((r) => setClients(r.data ?? []))
      .catch(() => setError("Erreur lors du chargement des clients."))
      .finally(() => setLoading(false));
  }, []);

  const formatDate = (d: string) => new Date(d).toLocaleDateString("fr-FR");

  const totalActifs = useMemo(
    () => clients.filter((c) => c.statutAbonnement === "actif").length,
    [clients],
  );

  const totalInactifs = useMemo(
    () => clients.filter((c) => c.statutAbonnement !== "actif").length,
    [clients],
  );

  const responsablesOptions = useMemo(() => {
    return Array.from(
      new Set(
        clients
          .map((c) => c.responsableUsername)
          .filter((v): v is string => Boolean(v)),
      ),
    ).sort((a, b) => a.localeCompare(b));
  }, [clients]);

  const abonnementsOptions = useMemo(() => {
    return Array.from(
      new Set(
        clients
          .map((c) => c.abonnementActif)
          .filter((v): v is string => Boolean(v)),
      ),
    ).sort((a, b) => a.localeCompare(b));
  }, [clients]);

  const filtered = useMemo(() => {
    let result = clients;

    if (filterStatut === "actif") {
      result = result.filter((c) => c.statutAbonnement === "actif");
    }

    if (filterStatut === "inactif") {
      result = result.filter((c) => c.statutAbonnement !== "actif");
    }

    if (responsableFilter === "none") {
      result = result.filter((c) => !c.responsableUsername);
    } else if (responsableFilter !== "all") {
      result = result.filter((c) => c.responsableUsername === responsableFilter);
    }

    if (abonnementFilter === "none") {
      result = result.filter((c) => !c.abonnementActif);
    } else if (abonnementFilter !== "all") {
      result = result.filter((c) => c.abonnementActif === abonnementFilter);
    }

    const q = searchTerm.toLowerCase().trim();

    if (q) {
      result = result.filter(
        (c) =>
          c.username.toLowerCase().includes(q) ||
          c.email.toLowerCase().includes(q) ||
          c.responsableUsername?.toLowerCase().includes(q) ||
          c.abonnementActif?.toLowerCase().includes(q),
      );
    }

    return result;
  }, [
    clients,
    searchTerm,
    filterStatut,
    responsableFilter,
    abonnementFilter,
  ]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));

  const paginatedClients = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return filtered.slice(start, start + PAGE_SIZE);
  }, [filtered, page]);

  useEffect(() => {
    setPage(1);
  }, [searchTerm, filterStatut, responsableFilter, abonnementFilter]);

  useEffect(() => {
    setPage((currentPage) => Math.min(currentPage, totalPages));
  }, [totalPages]);

  const hasAdvancedFilters =
    responsableFilter !== "all" || abonnementFilter !== "all";

  const resetAdvancedFilters = () => {
    setResponsableFilter("all");
    setAbonnementFilter("all");
  };

  const renderPagination = () => {
    if (totalPages <= 1) return null;

    return (
      <div className="flex items-center justify-between px-5 py-3 border-t border-gray-100 bg-gray-50">
        <p className="text-xs text-gray-500">
          Affichage de {(page - 1) * PAGE_SIZE + 1} à{" "}
          {Math.min(page * PAGE_SIZE, filtered.length)} sur {filtered.length}{" "}
          client(s)
        </p>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="ui-btn-secondary text-xs disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Précédent
          </button>

          <span className="text-xs text-gray-500">
            {page} / {totalPages}
          </span>

          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="ui-btn-secondary text-xs disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Suivant
          </button>
        </div>
      </div>
    );
  };

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
    <div className="ui-page">
      <div className="mb-6">
        <h1 className="ui-title">Archive clients</h1>

        <p className="ui-subtitle">
          {clients.length} client(s) au total · {totalActifs} actif(s) ·{" "}
          {totalInactifs} inactif(s)
        </p>
      </div>

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

                <p className="text-3xl font-bold text-gray-900">
                  {card.value}
                </p>

                <p className="text-xs text-gray-400 mt-1">{card.sub}</p>
              </div>

              <div className="mt-1">{card.icon}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 p-4 mb-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1 bg-gray-100 rounded-xl p-1">
            {(["tous", "actif", "inactif"] as const).map((t) => {
              const count =
                t === "tous"
                  ? clients.length
                  : t === "actif"
                    ? totalActifs
                    : totalInactifs;

              return (
                <button
                  key={t}
                  onClick={() => setFilterStatut(t)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    filterStatut === t
                      ? "bg-white text-(--color-primary) shadow-sm"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  {t === "tous"
                    ? "Tous"
                    : t === "actif"
                      ? "Actifs"
                      : "Inactifs"}

                  <span className="ml-1 text-xs font-semibold">{count}</span>
                </button>
              );
            })}
          </div>

          <div className="relative flex-1 min-w-48">
            <Search
              className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
              size={16}
            />

            <input
              type="text"
              placeholder="Rechercher par nom, email, responsable ou offre..."
              className="ui-input pl-11! pr-4"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

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
              className="h-9 min-w-48 rounded-xl border border-gray-200 bg-white px-3 text-sm text-gray-700 outline-none focus:border-(--color-primary)"
            >
              <option value="all">Tous les responsables</option>
              <option value="none">Sans responsable</option>

              {responsablesOptions.map((responsable) => (
                <option key={responsable} value={responsable}>
                  {responsable}
                </option>
              ))}
            </select>

            <select
              value={abonnementFilter}
              onChange={(e) => setAbonnementFilter(e.target.value)}
              className="h-9 min-w-48 rounded-xl border border-gray-200 bg-white px-3 text-sm text-gray-700 outline-none focus:border-(--color-primary)"
            >
              <option value="all">Tous les abonnements</option>
              <option value="none">Sans abonnement</option>

              {abonnementsOptions.map((abonnement) => (
                <option key={abonnement} value={abonnement}>
                  {abonnement}
                </option>
              ))}
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
                {paginatedClients.map((c) => (
                  <tr key={c.id} className="hover:bg-gray-50 transition-colors">
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

                    <td className="py-4 px-5 text-gray-500 text-xs">
                      {c.email}
                    </td>

                    <td className="py-4 px-5">
                      {c.responsableUsername ? (
                        <ResponsableAvatar name={c.responsableUsername} />
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </td>

                    <td className="py-4 px-5">
                      {c.abonnementActif ? (
                        <span className="text-(--color-primary) font-medium">
                          {c.abonnementActif}
                        </span>
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </td>

                    <td className="py-4 px-5 font-semibold text-gray-900 whitespace-nowrap">
                      {c.montantActif != null ? `${c.montantActif} TND` : "—"}
                    </td>

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

            {renderPagination()}

            <div className="px-5 py-3 border-t border-gray-100 bg-gray-50">
              <p className="text-xs text-gray-500">
                {filtered.length} client(s) filtré(s)
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}