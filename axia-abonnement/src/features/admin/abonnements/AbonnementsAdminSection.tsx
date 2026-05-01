import { useEffect, useMemo, useState } from "react";
import axiosInstance from "../../../services/api/axiosInstance";

import AbonnementsAdminKpiCards from "./components/AbonnementsAdminKpiCards";
import AbonnementsAdminFilters from "./components/AbonnementsAdminFilters";
import AbonnementsAdminTable from "./components/AbonnementsAdminTable";

import type { Abonnement, ExpirationFilter, FilterTab } from "./types";
import { ABONNEMENTS_PAGE_SIZE } from "./types";
import { expiresWithinDays, isExpired } from "./utils";

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
      .then((response) => setAbonnements(response.data ?? []))
      .catch(() => setError("Erreur lors du chargement des abonnements."))
      .finally(() => setLoading(false));
  }, []);

  const totalActifs = useMemo(
    () => abonnements.filter((abonnement) => abonnement.statut === "actif").length,
    [abonnements],
  );

  const totalExpires = useMemo(
    () => abonnements.filter((abonnement) => abonnement.statut === "expiré").length,
    [abonnements],
  );

  const totalEnAttente = useMemo(
    () =>
      abonnements.filter((abonnement) => abonnement.statut === "en_attente")
        .length,
    [abonnements],
  );

  const revenusActifs = useMemo(
    () =>
      abonnements
        .filter((abonnement) => abonnement.statut === "actif")
        .reduce((sum, abonnement) => sum + abonnement.montant, 0),
    [abonnements],
  );

  const responsablesOptions = useMemo(() => {
    return Array.from(
      new Set(
        abonnements
          .map((abonnement) => abonnement.responsableUsername)
          .filter((value): value is string => Boolean(value)),
      ),
    ).sort((a, b) => a.localeCompare(b));
  }, [abonnements]);

  const offresOptions = useMemo(() => {
    return Array.from(
      new Set(
        abonnements
          .map((abonnement) => abonnement.intituleOffre)
          .filter((value): value is string => Boolean(value)),
      ),
    ).sort((a, b) => a.localeCompare(b));
  }, [abonnements]);

  const typesOptions = useMemo(() => {
    return Array.from(
      new Set(
        abonnements
          .map((abonnement) => abonnement.type)
          .filter((value): value is string => Boolean(value)),
      ),
    ).sort((a, b) => a.localeCompare(b));
  }, [abonnements]);

  const filtered = useMemo(() => {
    let result = abonnements;

    if (tab === "actifs") {
      result = result.filter((abonnement) => abonnement.statut === "actif");
    }

    if (tab === "expirés") {
      result = result.filter((abonnement) => abonnement.statut === "expiré");
    }

    if (tab === "en_attente") {
      result = result.filter(
        (abonnement) => abonnement.statut === "en_attente",
      );
    }

    if (responsableFilter !== "all") {
      result = result.filter(
        (abonnement) => abonnement.responsableUsername === responsableFilter,
      );
    }

    if (offreFilter !== "all") {
      result = result.filter(
        (abonnement) => abonnement.intituleOffre === offreFilter,
      );
    }

    if (typeFilter !== "all") {
      result = result.filter((abonnement) => abonnement.type === typeFilter);
    }

    if (expirationFilter === "7days") {
      result = result.filter((abonnement) =>
        expiresWithinDays(abonnement.dateFin, 7),
      );
    }

    if (expirationFilter === "30days") {
      result = result.filter((abonnement) =>
        expiresWithinDays(abonnement.dateFin, 30),
      );
    }

    if (expirationFilter === "expired") {
      result = result.filter(
        (abonnement) =>
          abonnement.statut === "expiré" || isExpired(abonnement.dateFin),
      );
    }

    const query = searchTerm.toLowerCase().trim();

    if (query) {
      result = result.filter(
        (abonnement) =>
          abonnement.clientUsername?.toLowerCase().includes(query) ||
          abonnement.clientEmail?.toLowerCase().includes(query) ||
          abonnement.intituleOffre?.toLowerCase().includes(query) ||
          abonnement.responsableUsername?.toLowerCase().includes(query),
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

  return (
    <div className="ui-page">
      <div className="mb-6">
        <h1 className="ui-title">Abonnements globaux</h1>

        <p className="ui-subtitle">
          {totalActifs} actif(s) · {totalExpires} expiré(s) · {totalEnAttente}{" "}
          en attente · {abonnements.length} total
        </p>
      </div>

      <AbonnementsAdminKpiCards
        totalAbonnements={abonnements.length}
        totalActifs={totalActifs}
        totalExpires={totalExpires}
        totalEnAttente={totalEnAttente}
        revenusActifs={revenusActifs}
      />

      <AbonnementsAdminFilters
        abonnements={abonnements}
        filtered={filtered}
        tab={tab}
        searchTerm={searchTerm}
        responsableFilter={responsableFilter}
        offreFilter={offreFilter}
        typeFilter={typeFilter}
        expirationFilter={expirationFilter}
        responsablesOptions={responsablesOptions}
        offresOptions={offresOptions}
        typesOptions={typesOptions}
        totalActifs={totalActifs}
        totalExpires={totalExpires}
        totalEnAttente={totalEnAttente}
        hasAdvancedFilters={hasAdvancedFilters}
        onTabChange={setTab}
        onSearchChange={setSearchTerm}
        onResponsableFilterChange={setResponsableFilter}
        onOffreFilterChange={setOffreFilter}
        onTypeFilterChange={setTypeFilter}
        onExpirationFilterChange={setExpirationFilter}
        onResetAdvancedFilters={resetAdvancedFilters}
      />

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm">
          {error}
        </div>
      )}

      <AbonnementsAdminTable
        abonnements={paginatedAbonnements}
        loading={loading}
        totalItems={filtered.length}
        currentPage={page}
        totalPages={totalPages}
        pageSize={ABONNEMENTS_PAGE_SIZE}
        onPageChange={setPage}
      />
    </div>
  );
}