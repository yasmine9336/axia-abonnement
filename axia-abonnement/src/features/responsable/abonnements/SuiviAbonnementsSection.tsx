import { useCallback, useEffect, useMemo, useState } from "react";
import axiosInstance from "../../../services/api/axiosInstance";
import LoadingState from "../../../components/common/LoadingState";

import AbonnementsFilters from "./components/AbonnementsFilters";
import AbonnementsTable from "./components/AbonnementsTable";
import RenouvellementRequestsList from "./components/RenouvellementRequestList";

import type {
  Abonnement,
  AbonnementTab,
  Demande,
  ExpirationFilter,
} from "./types";

import { PAGE_SIZE } from "./types";

import { daysLeft } from "./utils";

export default function SuiviAbonnementsSection() {
  const [abonnements, setAbonnements] = useState<Abonnement[]>([]);
  const [demandes, setDemandes] = useState<Demande[]>([]);
  const [loading, setLoading] = useState(true);

  const [tab, setTab] = useState<AbonnementTab>("actifs");
  const [searchAbo, setSearchAbo] = useState("");
  const [searchDemande, setSearchDemande] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [expirationFilter, setExpirationFilter] =
    useState<ExpirationFilter>("all");

  const [demandesPage, setDemandesPage] = useState(1);
  const [abonnementsPage, setAbonnementsPage] = useState(1);

  const [submittingDemandeId, setSubmittingDemandeId] = useState<string | null>(
    null,
  );

  const loadData = useCallback(async () => {
    const [d, a] = await Promise.all([
      axiosInstance.get("/demandes"),
      axiosInstance.get("/abonnements/all"),
    ]);

    setDemandes(d.data ?? []);
    setAbonnements(a.data ?? []);
  }, []);

  useEffect(() => {
    let active = true;

    const fetchData = async () => {
      try {
        await loadData();
      } finally {
        if (active) setLoading(false);
      }
    };

    fetchData();

    return () => {
      active = false;
    };
  }, [loadData]);

  const refresh = async () => {
    await loadData();
  };

  const accepter = async (id: string) => {
    setSubmittingDemandeId(id);

    try {
      await axiosInstance.patch(`/demandes/${id}/accepter`);
      await refresh();
    } finally {
      setSubmittingDemandeId(null);
    }
  };

  const refuser = async (id: string) => {
    setSubmittingDemandeId(id);

    try {
      await axiosInstance.patch(`/demandes/${id}/refuser`);
      await refresh();
    } finally {
      setSubmittingDemandeId(null);
    }
  };

  const enAttente = useMemo(
    () => demandes.filter((d) => d.statut === "en_attente"),
    [demandes],
  );

  const filteredDemandes = useMemo(() => {
    const q = searchDemande.trim().toLowerCase();

    if (!q) return enAttente;

    return enAttente.filter(
      (d) =>
        d.clientUsername.toLowerCase().includes(q) ||
        d.clientEmail.toLowerCase().includes(q) ||
        d.intituleOffre.toLowerCase().includes(q) ||
        d.type.toLowerCase().includes(q),
    );
  }, [enAttente, searchDemande]);

  const totalDemandesPages = Math.max(
    1,
    Math.ceil(filteredDemandes.length / PAGE_SIZE),
  );

  const paginatedDemandes = useMemo(() => {
    const start = (demandesPage - 1) * PAGE_SIZE;
    return filteredDemandes.slice(start, start + PAGE_SIZE);
  }, [filteredDemandes, demandesPage]);

  const totalActifs = useMemo(
    () => abonnements.filter((a) => a.statut === "actif").length,
    [abonnements],
  );

  const totalExpires = useMemo(
    () => abonnements.filter((a) => a.statut === "expiré").length,
    [abonnements],
  );

  const tabCounts = useMemo(
    () => ({
      actifs: abonnements.filter((a) => a.statut === "actif").length,
      expires: abonnements.filter((a) => a.statut === "expiré").length,
    }),
    [abonnements],
  );

  const typeOptions = useMemo(() => {
    return Array.from(
      new Set(abonnements.map((a) => a.type).filter(Boolean)),
    ).sort((a, b) => a.localeCompare(b));
  }, [abonnements]);

  const filteredAbos = useMemo(() => {
    const q = searchAbo.trim().toLowerCase();

    let res = [...abonnements];

    if (tab === "actifs") {
      res = res.filter((a) => a.statut === "actif");
    }

    if (tab === "expires") {
      res = res.filter((a) => a.statut === "expiré");
    }

    if (typeFilter !== "all") {
      res = res.filter((a) => a.type === typeFilter);
    }

    if (tab === "actifs" && expirationFilter === "7days") {
      res = res.filter((a) => {
        const left = daysLeft(a.dateFin);
        return left !== null && left >= 0 && left <= 7;
      });
    }

    if (tab === "actifs" && expirationFilter === "30days") {
      res = res.filter((a) => {
        const left = daysLeft(a.dateFin);
        return left !== null && left >= 0 && left <= 30;
      });
    }

    if (q) {
      res = res.filter(
        (a) =>
          a.clientUsername.toLowerCase().includes(q) ||
          a.clientEmail.toLowerCase().includes(q) ||
          a.intituleOffre.toLowerCase().includes(q) ||
          a.type.toLowerCase().includes(q),
      );
    }

    return res;
  }, [abonnements, tab, searchAbo, typeFilter, expirationFilter]);

  const totalAbonnementsPages = Math.max(
    1,
    Math.ceil(filteredAbos.length / PAGE_SIZE),
  );

  const paginatedAbos = useMemo(() => {
    const start = (abonnementsPage - 1) * PAGE_SIZE;
    return filteredAbos.slice(start, start + PAGE_SIZE);
  }, [filteredAbos, abonnementsPage]);

  useEffect(() => {
    if (tab === "expires") {
      setExpirationFilter("all");
    }
  }, [tab]);

  useEffect(() => {
    setDemandesPage(1);
  }, [searchDemande]);

  useEffect(() => {
    setAbonnementsPage(1);
  }, [tab, searchAbo, typeFilter, expirationFilter]);

  useEffect(() => {
    setDemandesPage((page) => Math.min(page, totalDemandesPages));
  }, [totalDemandesPages]);

  useEffect(() => {
    setAbonnementsPage((page) => Math.min(page, totalAbonnementsPages));
  }, [totalAbonnementsPages]);

  const hasHistoryFilters =
    searchAbo.trim() !== "" ||
    typeFilter !== "all" ||
    expirationFilter !== "all";

  const resetHistoryFilters = () => {
    setSearchAbo("");
    setTypeFilter("all");
    setExpirationFilter("all");
  };

  if (loading) return <LoadingState heightClassName="min-h-100" />;

  return (
    <div className="ui-page">
      {/* Header */}
      <div className="mb-6">
        <h1 className="ui-title">Suivi abonnements</h1>
        <p className="ui-subtitle">
          Gérez les demandes de renouvellement et consultez l'historique des
          abonnements.
        </p>
        <div className="flex flex-wrap gap-2 mt-3">
          <span className="text-xs px-3 py-1 rounded-full bg-slate-100 text-slate-500 font-medium">
            {abonnements.length} total
          </span>
          <span className="text-xs px-3 py-1 rounded-full bg-blue-100 text-blue-700 font-medium">
            ● {totalActifs} actifs
          </span>
          <span className="text-xs px-3 py-1 rounded-full bg-blue-100 text-blue-700 font-medium">
            ● {totalExpires} expirés
          </span>
        </div>
      </div>

      <RenouvellementRequestsList
        enAttenteCount={enAttente.length}
        demandes={paginatedDemandes}
        filteredCount={filteredDemandes.length}
        searchDemande={searchDemande}
        currentPage={demandesPage}
        totalPages={totalDemandesPages}
        pageSize={PAGE_SIZE}
        submittingDemandeId={submittingDemandeId}
        onSearchChange={setSearchDemande}
        onAccept={accepter}
        onReject={refuser}
        onPageChange={setDemandesPage}
      />

      <AbonnementsFilters
        filteredAbos={filteredAbos}
        tab={tab}
        tabCounts={tabCounts}
        searchAbo={searchAbo}
        typeFilter={typeFilter}
        typeOptions={typeOptions}
        expirationFilter={expirationFilter}
        hasHistoryFilters={hasHistoryFilters}
        onTabChange={setTab}
        onSearchChange={setSearchAbo}
        onTypeFilterChange={setTypeFilter}
        onExpirationFilterChange={setExpirationFilter}
        onResetFilters={resetHistoryFilters}
      />

      <AbonnementsTable
        abonnements={paginatedAbos}
        totalItems={filteredAbos.length}
        currentPage={abonnementsPage}
        totalPages={totalAbonnementsPages}
        pageSize={PAGE_SIZE}
        onPageChange={setAbonnementsPage}
      />
    </div>
  );
}
