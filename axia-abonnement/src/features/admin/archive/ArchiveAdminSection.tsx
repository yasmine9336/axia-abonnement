import { useEffect, useMemo, useState } from "react";
import axiosInstance from "../../../services/api/axiosInstance";

import ArchiveAdminFilters from "./components/ArchiveAdminFilters";
import ArchiveAdminTable from "./components/ArchiveAdminTable";

import type { Client, FilterTab } from "./types";
import { PAGE_SIZE } from "./types";

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
      .then((response) => setClients(response.data ?? []))
      .catch(() => setError("Erreur lors du chargement des clients."))
      .finally(() => setLoading(false));
  }, []);

  const totalActifs = useMemo(
    () =>
      clients.filter((client) => client.statutAbonnement === "actif").length,
    [clients],
  );

  const totalInactifs = useMemo(
    () =>
      clients.filter((client) => client.statutAbonnement !== "actif").length,
    [clients],
  );

  const responsablesOptions = useMemo(() => {
    return Array.from(
      new Set(
        clients
          .map((client) => client.responsableUsername)
          .filter((value): value is string => Boolean(value)),
      ),
    ).sort((a, b) => a.localeCompare(b));
  }, [clients]);

  const abonnementsOptions = useMemo(() => {
    return Array.from(
      new Set(
        clients
          .map((client) => client.abonnementActif)
          .filter((value): value is string => Boolean(value)),
      ),
    ).sort((a, b) => a.localeCompare(b));
  }, [clients]);

  const filtered = useMemo(() => {
    let result = clients;

    if (filterStatut === "actif") {
      result = result.filter((client) => client.statutAbonnement === "actif");
    }

    if (filterStatut === "inactif") {
      result = result.filter((client) => client.statutAbonnement !== "actif");
    }

    if (responsableFilter === "none") {
      result = result.filter((client) => !client.responsableUsername);
    } else if (responsableFilter !== "all") {
      result = result.filter(
        (client) => client.responsableUsername === responsableFilter,
      );
    }

    if (abonnementFilter === "none") {
      result = result.filter((client) => !client.abonnementActif);
    } else if (abonnementFilter !== "all") {
      result = result.filter(
        (client) => client.abonnementActif === abonnementFilter,
      );
    }

    const query = searchTerm.toLowerCase().trim();

    if (query) {
      result = result.filter(
        (client) =>
          client.username.toLowerCase().includes(query) ||
          client.email.toLowerCase().includes(query) ||
          client.responsableUsername?.toLowerCase().includes(query) ||
          client.abonnementActif?.toLowerCase().includes(query),
      );
    }

    return result;
  }, [clients, searchTerm, filterStatut, responsableFilter, abonnementFilter]);

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

  return (
    <div className="ui-page">
      <div className="mb-6">
        <h1 className="ui-title">Archive clients</h1>
        <p className="ui-subtitle">
          Consultez l'historique de tous les clients de la plateforme.
        </p>
        <div className="flex flex-wrap gap-2 mt-3">
          <span className="text-xs px-3 py-1 rounded-full bg-gray-100 text-gray-600 font-medium">
            {clients.length} total
          </span>
          <span className="text-xs px-3 py-1 rounded-full bg-green-100 text-green-700 font-medium">
            ● {totalActifs} actifs
          </span>
          <span className="text-xs px-3 py-1 rounded-full bg-red-100 text-red-700 font-medium">
            ● {totalInactifs} inactifs
          </span>
        </div>
      </div>

      <ArchiveAdminFilters
        clients={clients}
        filtered={filtered}
        filterStatut={filterStatut}
        searchTerm={searchTerm}
        responsableFilter={responsableFilter}
        abonnementFilter={abonnementFilter}
        responsablesOptions={responsablesOptions}
        abonnementsOptions={abonnementsOptions}
        totalActifs={totalActifs}
        totalInactifs={totalInactifs}
        hasAdvancedFilters={hasAdvancedFilters}
        onFilterStatutChange={setFilterStatut}
        onSearchChange={setSearchTerm}
        onResponsableFilterChange={setResponsableFilter}
        onAbonnementFilterChange={setAbonnementFilter}
        onResetAdvancedFilters={resetAdvancedFilters}
      />

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm">
          {error}
        </div>
      )}

      <ArchiveAdminTable
        clients={paginatedClients}
        loading={loading}
        totalItems={filtered.length}
        currentPage={page}
        totalPages={totalPages}
        pageSize={PAGE_SIZE}
        onPageChange={setPage}
      />
    </div>
  );
}
