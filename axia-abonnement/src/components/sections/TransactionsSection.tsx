import { useState, useEffect, useMemo } from "react";
import axiosInstance from "../../api/axiosInstance";
import { Search, TrendingUp, Calendar, Receipt, Clock } from "lucide-react";
import ExportButton from "../common/ExportButton";
import { formatDateFR } from "../../utils/exportUtils";
import { useAuth } from "../../hooks/useAuth";
import UiCard from "../common/UiCard";
import StatusBadge from "../common/StatusBadge";

interface Paiement {
  id: string;
  montant: number;
  statut: string;
  createdAt: string;
  intituleOffre: string;
  typeAbonnement: string;
  clientUsername: string;
  clientEmail: string;
}

type SourceFilter = "tous" | "clients" | "responsables";
type StatusFilter = "tous" | "completed" | "pending" | "failed";

const TRANSACTIONS_PAGE_SIZE = 4;

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

function txnRef(index: number) {
  return `TXN-${String(index + 1).padStart(3, "0")}`;
}

function isCompletedPayment(p: Paiement) {
  const s = (p.statut ?? "").toLowerCase();
  return s === "completed" || s === "succeeded";
}

function isPendingPayment(p: Paiement) {
  const s = (p.statut ?? "").toLowerCase();
  return s === "pending";
}

function isFailedPayment(p: Paiement) {
  const s = (p.statut ?? "").toLowerCase();
  return !isCompletedPayment(p) && !isPendingPayment(p) && s !== "";
}

function isResponsableTxn(p: Paiement) {
  return (p.typeAbonnement ?? "").toLowerCase().includes("responsable");
}

const now = new Date();

export default function TransactionsAdminSection() {
  const { user } = useAuth();
  const isAdmin = user?.role === "Admin";

  const [paiements, setPaiements] = useState<Paiement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [searchTerm, setSearchTerm] = useState("");
  const [filterDate, setFilterDate] = useState("");
  const [filterSource, setFilterSource] = useState<SourceFilter>("tous");
  const [filterStatus, setFilterStatus] = useState<StatusFilter>("tous");
  const [page, setPage] = useState(1);

  useEffect(() => {
    axiosInstance
      .get<Paiement[]>("/payment/history/all")
      .then((r) => setPaiements(r.data ?? []))
      .catch(() => setError("Erreur lors du chargement des transactions."))
      .finally(() => setLoading(false));
  }, []);

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  const currentMonth = now.toLocaleString("fr-FR", {
    month: "long",
    year: "numeric",
  });

  const revenuTotal = useMemo(
    () =>
      paiements.filter(isCompletedPayment).reduce((s, p) => s + p.montant, 0),
    [paiements],
  );

  const revenuMoisCi = useMemo(() => {
    const debut = new Date(now.getFullYear(), now.getMonth(), 1);

    return paiements
      .filter((p) => isCompletedPayment(p) && new Date(p.createdAt) >= debut)
      .reduce((s, p) => s + p.montant, 0);
  }, [paiements]);

  const countsBySource = useMemo(() => {
    const clients = paiements.filter((p) => !isResponsableTxn(p)).length;
    const responsables = paiements.filter(isResponsableTxn).length;

    return {
      clients,
      responsables,
      total: paiements.length,
    };
  }, [paiements]);

  const countsByStatus = useMemo(() => {
    const completed = paiements.filter(isCompletedPayment).length;
    const pending = paiements.filter(isPendingPayment).length;
    const failed = paiements.filter(isFailedPayment).length;

    return {
      total: paiements.length,
      completed,
      pending,
      failed,
    };
  }, [paiements]);

  const filtered = useMemo(() => {
    let result = [...paiements];

    if (isAdmin) {
      if (filterSource === "clients") {
        result = result.filter((p) => !isResponsableTxn(p));
      }

      if (filterSource === "responsables") {
        result = result.filter(isResponsableTxn);
      }
    }

    if (filterStatus === "completed") {
      result = result.filter(isCompletedPayment);
    }

    if (filterStatus === "pending") {
      result = result.filter(isPendingPayment);
    }

    if (filterStatus === "failed") {
      result = result.filter(isFailedPayment);
    }

    const q = searchTerm.toLowerCase().trim();

    if (q) {
      result = result.filter(
        (p) =>
          p.clientUsername?.toLowerCase().includes(q) ||
          p.clientEmail?.toLowerCase().includes(q) ||
          p.intituleOffre?.toLowerCase().includes(q) ||
          p.typeAbonnement?.toLowerCase().includes(q),
      );
    }

    if (filterDate) {
      result = result.filter((p) => p.createdAt.startsWith(filterDate));
    }

    return result.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
  }, [paiements, searchTerm, filterDate, filterSource, filterStatus, isAdmin]);

  const totalFiltered = filtered
    .filter(isCompletedPayment)
    .reduce((s, p) => s + p.montant, 0);

  const totalPages = Math.max(
    1,
    Math.ceil(filtered.length / TRANSACTIONS_PAGE_SIZE),
  );

  const paginatedPaiements = useMemo(() => {
    const start = (page - 1) * TRANSACTIONS_PAGE_SIZE;
    return filtered.slice(start, start + TRANSACTIONS_PAGE_SIZE);
  }, [filtered, page]);

  useEffect(() => {
    setPage(1);
  }, [searchTerm, filterDate, filterSource, filterStatus]);

  useEffect(() => {
    setPage((currentPage) => Math.min(currentPage, totalPages));
  }, [totalPages]);

  const hasFilters =
    searchTerm.trim() !== "" ||
    filterDate !== "" ||
    filterStatus !== "tous" ||
    (isAdmin && filterSource !== "tous");

  const resetFilters = () => {
    setSearchTerm("");
    setFilterDate("");
    setFilterStatus("tous");
    setFilterSource("tous");
  };

  const statutBadge = (statut: string) => {
    const s = (statut || "").toLowerCase();

    if (s === "completed" || s === "succeeded") {
      return { variant: "success" as const, label: "Complété" };
    }

    if (s === "pending") {
      return { variant: "warning" as const, label: "En attente" };
    }

    return { variant: "danger" as const, label: "Échoué" };
  };

  const renderPagination = () => {
    if (totalPages <= 1) return null;

    return (
      <div className="px-5 py-4 border-t border-gray-100 bg-gray-50 flex items-center justify-between">
        <p className="text-xs text-gray-500">
          Affichage de {(page - 1) * TRANSACTIONS_PAGE_SIZE + 1} à{" "}
          {Math.min(page * TRANSACTIONS_PAGE_SIZE, filtered.length)} sur{" "}
          {filtered.length} transaction(s)
        </p>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-3 py-1.5 rounded-lg border border-gray-200 text-sm text-gray-600 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-white"
          >
            Précédent
          </button>

          <span className="text-sm text-gray-500">
            Page {page} sur {totalPages}
          </span>

          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="px-3 py-1.5 rounded-lg border border-gray-200 text-sm text-gray-600 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-white"
          >
            Suivant
          </button>
        </div>
      </div>
    );
  };

  const pageTitle = isAdmin ? "Transactions financières" : "Paiements reçus";

  const pageSubtitle = isAdmin
    ? `${paiements.length} transaction(s) · ${revenuTotal.toFixed(2)} TND total`
    : `${paiements.length} paiement(s) · ${revenuTotal.toFixed(2)} TND reçu(s)`;

  const kpiCards = [
    {
      label: isAdmin ? "REVENUS TOTAUX" : "TOTAL REÇU",
      value: `${revenuTotal.toFixed(2)} TND`,
      sub: `${countsByStatus.completed} paiement(s) complété(s)`,
      icon: <TrendingUp className="w-5 h-5 text-green-500" />,
      border: "border-t-green-400",
      large: true,
    },
    {
      label: "CE MOIS-CI",
      value: `${revenuMoisCi.toFixed(2)} TND`,
      sub: currentMonth.charAt(0).toUpperCase() + currentMonth.slice(1),
      icon: <Calendar className="w-5 h-5 text-blue-600" />,
      border: "border-t-blue-500",
      large: true,
    },
    {
      label: "TOTAL TRANSACTIONS",
      value: paiements.length,
      sub: "toutes périodes",
      icon: <Receipt className="w-5 h-5 text-orange-500" />,
      border: "border-t-orange-400",
    },
    {
      label: "EN ATTENTE",
      value: countsByStatus.pending,
      sub: "paiements non finalisés",
      icon: <Clock className="w-5 h-5 text-amber-500" />,
      border: "border-t-amber-400",
    },
  ];

  return (
    <div className="ui-page pl-8">
      <div className="mb-6">
        <h1 className="ui-title">{pageTitle}</h1>
        <p className="ui-subtitle">{pageSubtitle}</p>
      </div>

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

                <p
                  className={`font-bold text-gray-900 ${
                    card.large ? "text-2xl" : "text-3xl"
                  }`}
                >
                  {card.value}
                </p>

                <p className="text-xs text-gray-400 mt-1">{card.sub}</p>
              </div>

              <div className="mt-1">{card.icon}</div>
            </div>
          </div>
        ))}
      </div>

      <UiCard className="p-4 mb-4">
        <div className="space-y-4">
          {/* Ligne 1 : source + export */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            {isAdmin ? (
              <div className="flex items-center gap-3">
                <span className="text-sm font-semibold text-gray-700">
                  Type de transactions
                </span>

                <div className="flex items-center gap-1 bg-gray-100 rounded-xl p-1">
                  {(["tous", "clients", "responsables"] as const).map((t) => {
                    const count =
                      t === "tous"
                        ? countsBySource.total
                        : t === "clients"
                          ? countsBySource.clients
                          : countsBySource.responsables;

                    return (
                      <button
                        key={t}
                        onClick={() => setFilterSource(t)}
                        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                          filterSource === t
                            ? "bg-white text-(--color-primary) shadow-sm"
                            : "text-gray-500 hover:text-gray-700"
                        }`}
                      >
                        {t === "tous"
                          ? "Tous"
                          : t === "clients"
                            ? "Clients"
                            : "Responsables"}{" "}
                        <span className="ml-1 text-xs font-semibold">
                          {count}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : (
              <span className="text-sm font-semibold text-gray-700">
                Liste des paiements reçus
              </span>
            )}

            <ExportButton
              data={filtered}
              columns={[
                {
                  key: "createdAt",
                  label: "Date",
                  format: (v) => formatDateFR(v),
                },
                { key: "clientUsername", label: "Client" },
                { key: "clientEmail", label: "Email" },
                { key: "intituleOffre", label: "Offre / Service" },
                { key: "typeAbonnement", label: "Type" },
                { key: "montant", label: "Montant (TND)" },
                { key: "statut", label: "Statut" },
              ]}
              filename="transactions"
              label="Exporter"
              sheetName="Transactions"
              pdfTitle="Historique des transactions"
            />
          </div>

          {/* Ligne 2 : recherche + date + statut */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative flex-1 min-w-72">
              <Search
                className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                size={16}
              />

              <input
                type="text"
                placeholder="Rechercher par client, email, type ou offre..."
                className="ui-input pl-11! pr-4"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 h-10">
              <Calendar size={14} className="text-gray-400" />

              <input
                type="date"
                className="text-sm text-gray-600 bg-transparent outline-none"
                value={filterDate}
                onChange={(e) => setFilterDate(e.target.value)}
              />

              {filterDate && (
                <button
                  onClick={() => setFilterDate("")}
                  className="text-gray-400 hover:text-gray-600 text-xs ml-1"
                >
                  ✕
                </button>
              )}
            </div>

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as StatusFilter)}
              className="h-10 min-w-44 rounded-xl border border-gray-200 bg-white px-3 text-sm text-gray-700 outline-none focus:border-(--color-primary)"
            >
              <option value="tous">Tous les statuts</option>
              <option value="completed">
                Complétés ({countsByStatus.completed})
              </option>
              <option value="pending">
                En attente ({countsByStatus.pending})
              </option>
              <option value="failed">Échoués ({countsByStatus.failed})</option>
            </select>

            {hasFilters && (
              <button
                onClick={resetFilters}
                className="h-10 px-3 rounded-xl border border-gray-200 text-sm font-medium text-(--color-primary) hover:bg-gray-50"
              >
                Réinitialiser
              </button>
            )}
          </div>
        </div>
      </UiCard>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center min-h-40">
          <div className="ui-spinner" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-gray-400 text-sm">
          Aucune transaction
        </div>
      ) : (
        <UiCard className="p-0 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                {[
                  "Référence",
                  "Date",
                  "Client",
                  "Offre / Service",
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
              {paginatedPaiements.map((p, i) => {
                const badge = statutBadge(p.statut);
                const responsable = isResponsableTxn(p);
                const globalIndex = (page - 1) * TRANSACTIONS_PAGE_SIZE + i;

                return (
                  <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                    <td className="py-4 px-5">
                      <span className="text-(--color-primary) font-semibold text-xs">
                        {txnRef(globalIndex)}
                      </span>
                    </td>

                    <td className="py-4 px-5 text-gray-500 text-xs whitespace-nowrap">
                      {formatDate(p.createdAt)}
                    </td>

                    <td className="py-4 px-5">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${avatarColor(
                            p.clientUsername,
                          )}`}
                        >
                          {getInitials(p.clientUsername)}
                        </div>

                        <div>
                          <p className="font-semibold text-gray-900">
                            {p.clientUsername}
                          </p>

                          <p className="text-xs text-gray-400">
                            {p.clientEmail}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="py-4 px-5 font-medium text-gray-900">
                      {p.intituleOffre}
                    </td>

                    <td className="py-4 px-5">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="bg-gray-100 text-gray-600 text-xs font-medium px-2.5 py-1 rounded-lg capitalize">
                          {p.typeAbonnement}
                        </span>

                        {isAdmin && (
                          <span
                            className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                              responsable
                                ? "bg-slate-100 text-slate-700"
                                : "bg-blue-100 text-blue-700"
                            }`}
                          >
                            {responsable ? "Responsable" : "Client"}
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="py-4 px-5 font-semibold text-green-600 whitespace-nowrap">
                      {p.montant.toFixed(2)} TND
                    </td>

                    <td className="py-4 px-5">
                      <StatusBadge
                        label={badge.label}
                        variant={badge.variant}
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {renderPagination()}

          <div className="px-5 py-3 border-t border-gray-100 bg-gray-50 flex items-center justify-between">
            <p className="text-xs text-gray-500">
              {filtered.length} transaction(s) filtrée(s)
            </p>

            <p className="text-sm font-semibold text-gray-900">
              Total complété :{" "}
              <span className="text-green-600">
                {totalFiltered.toFixed(2)} TND
              </span>
            </p>
          </div>
        </UiCard>
      )}
    </div>
  );
}
