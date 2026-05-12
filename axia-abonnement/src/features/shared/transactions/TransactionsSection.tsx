import { useEffect, useMemo, useState } from "react";
import axiosInstance from "../../../services/api/axiosInstance";
import LoadingState from "../../../components/common/LoadingState";
import { useAuth } from "../../../hooks/useAuth";

import TransactionsFilters from "./components/TransactionsFilters";
import TransactionsTable from "./components/TransactionsTable";

import type { Paiement, SourceFilter, StatusFilter } from "./types";
import {
  isCompletedPayment,
  isFailedPayment,
  isPendingPayment,
  isResponsableTxn,
  TRANSACTIONS_PAGE_SIZE,
} from "./utils";

const now = new Date();

export default function TransactionsSection() {
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
      .then((response) => setPaiements(response.data ?? []))
      .catch(() => setError("Erreur lors du chargement des transactions."))
      .finally(() => setLoading(false));
  }, []);

  const revenuTotal = useMemo(
    () =>
      paiements
        .filter(isCompletedPayment)
        .reduce((sum, paiement) => sum + paiement.montant, 0),
    [paiements],
  );

  const revenuMoisCi = useMemo(() => {
    const debut = new Date(now.getFullYear(), now.getMonth(), 1);

    return paiements
      .filter(
        (paiement) =>
          isCompletedPayment(paiement) && new Date(paiement.createdAt) >= debut,
      )
      .reduce((sum, paiement) => sum + paiement.montant, 0);
  }, [paiements]);

  const countsBySource = useMemo(() => {
    const clients = paiements.filter(
      (paiement) => !isResponsableTxn(paiement),
    ).length;

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
        result = result.filter((paiement) => !isResponsableTxn(paiement));
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

    const query = searchTerm.toLowerCase().trim();

    if (query) {
      result = result.filter(
        (paiement) =>
          paiement.clientUsername?.toLowerCase().includes(query) ||
          paiement.clientEmail?.toLowerCase().includes(query) ||
          paiement.intituleOffre?.toLowerCase().includes(query) ||
          paiement.typeAbonnement?.toLowerCase().includes(query),
      );
    }

    if (filterDate) {
      result = result.filter((paiement) =>
        paiement.createdAt.startsWith(filterDate),
      );
    }

    return result.sort(
      (first, second) =>
        new Date(second.createdAt).getTime() -
        new Date(first.createdAt).getTime(),
    );
  }, [paiements, searchTerm, filterDate, filterSource, filterStatus, isAdmin]);

  const totalFiltered = useMemo(
    () =>
      filtered
        .filter(isCompletedPayment)
        .reduce((sum, paiement) => sum + paiement.montant, 0),
    [filtered],
  );

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

  const pageTitle = isAdmin ? "Transactions financières" : "Paiements reçus";

  const pageSubtitle = isAdmin
    ? `${paiements.length} transaction(s) · ${revenuTotal.toFixed(2)} TND total`
    : `${paiements.length} paiement(s) · ${revenuTotal.toFixed(2)} TND reçu(s)`;

  return (
    <div className="ui-page pl-8">
      <div className="mb-6">
        <h1 className="ui-title">{pageTitle}</h1>
        <p className="ui-subtitle">{pageSubtitle}</p>
        <div className="flex flex-wrap gap-2 mt-3">
          <span className="text-xs px-3 py-1 rounded-full bg-green-100 text-green-700 font-medium">
            ● {revenuTotal.toFixed(2)} TND total
          </span>
          <span className="text-xs px-3 py-1 rounded-full bg-blue-100 text-blue-700 font-medium">
            ● {revenuMoisCi.toFixed(2)} TND ce mois
          </span>
          <span className="text-xs px-3 py-1 rounded-full bg-gray-100 text-gray-600 font-medium">
            {paiements.length} transactions
          </span>
          {countsByStatus.pending > 0 && (
            <span className="text-xs px-3 py-1 rounded-full bg-orange-100 text-orange-700 font-medium">
              ● {countsByStatus.pending} en attente
            </span>
          )}
        </div>
      </div>

      <TransactionsFilters
        isAdmin={isAdmin}
        filtered={filtered}
        searchTerm={searchTerm}
        filterDate={filterDate}
        filterSource={filterSource}
        filterStatus={filterStatus}
        countsBySource={countsBySource}
        countsByStatus={countsByStatus}
        hasFilters={hasFilters}
        onSearchChange={setSearchTerm}
        onDateChange={setFilterDate}
        onSourceChange={setFilterSource}
        onStatusChange={setFilterStatus}
        onResetFilters={resetFilters}
      />

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm">
          {error}
        </div>
      )}

      {loading ? (
        <LoadingState heightClassName="min-h-40" />
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-gray-400 text-sm">
          Aucune transaction
        </div>
      ) : (
        <TransactionsTable
          isAdmin={isAdmin}
          paiements={paginatedPaiements}
          page={page}
          totalPages={totalPages}
          filteredLength={filtered.length}
          totalFiltered={totalFiltered}
          onPageChange={setPage}
        />
      )}
    </div>
  );
}
