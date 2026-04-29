import { useCallback, useEffect, useMemo, useState } from "react";
import axiosInstance from "../../api/axiosInstance";
import { Search, MailCheck } from "lucide-react";
import ExportButton from "../common/ExportButton";
import { formatDateFR } from "../../utils/exportUtils";

type AbonnementTab = "actifs" | "expires";
type DemandeStatut = "en_attente" | "acceptée" | "refusée";
type AbonnementStatut = "actif" | "expiré" | "aucun" | string;
type ExpirationFilter = "all" | "7days" | "30days";

interface Abonnement {
  id: string;
  intituleOffre: string;
  description?: string;
  type: string;
  montant: number;
  dateDebut: string;
  dateFin?: string;
  isActive: boolean;
  statut: AbonnementStatut;
  clientUsername: string;
  clientEmail: string;
}

interface Demande {
  id: string;
  abonnementId: string;
  clientUsername: string;
  clientEmail: string;
  intituleOffre: string;
  type: string;
  montant: number;
  statut: DemandeStatut | string;
  createdAt: string;
}

const PAGE_SIZE = 4;

function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function formatDate(date: string) {
  try {
    return new Date(date).toLocaleDateString("fr-FR");
  } catch {
    return date;
  }
}

function daysLeft(dateFin?: string) {
  if (!dateFin) return null;

  const end = new Date(dateFin).getTime();
  const now = Date.now();

  if (!Number.isFinite(end)) return null;

  return Math.ceil((end - now) / (1000 * 60 * 60 * 24));
}

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

function progressPercent(dateDebut: string, dateFin?: string) {
  if (!dateFin) return 0;

  const start = new Date(dateDebut).getTime();
  const end = new Date(dateFin).getTime();
  const now = Date.now();

  if (!Number.isFinite(start) || !Number.isFinite(end) || end <= start) {
    return 0;
  }

  return clamp(Math.round(((now - start) / (end - start)) * 100), 0, 100);
}

function totalSubscriptionDays(dateDebut: string, dateFin?: string) {
  if (!dateFin) return 0;

  const start = new Date(dateDebut).getTime();
  const end = new Date(dateFin).getTime();

  if (!Number.isFinite(start) || !Number.isFinite(end) || end <= start) {
    return 0;
  }

  return Math.ceil((end - start) / (1000 * 60 * 60 * 24));
}

function usedSubscriptionDays(dateDebut: string, dateFin?: string) {
  if (!dateFin) return 0;

  const start = new Date(dateDebut).getTime();
  const end = new Date(dateFin).getTime();
  const now = Date.now();

  if (!Number.isFinite(start) || !Number.isFinite(end) || end <= start) {
    return 0;
  }

  const used = Math.floor((now - start) / (1000 * 60 * 60 * 24));
  const total = totalSubscriptionDays(dateDebut, dateFin);

  return clamp(used, 0, total);
}

function pluralJour(n: number) {
  return `${n} jour${n > 1 ? "s" : ""}`;
}

function StatusPill({ statut }: { statut: string }) {
  const cls =
    statut === "actif"
      ? "bg-green-100 text-green-700"
      : statut === "expiré"
        ? "bg-red-100 text-red-700"
        : "bg-gray-100 text-gray-600";

  return (
    <span
      className={`px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${cls}`}
    >
      {statut}
    </span>
  );
}

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

  const renderPagination = (
    currentPage: number,
    totalPages: number,
    totalItems: number,
    onPageChange: (page: number) => void,
  ) => {
    if (totalPages <= 1) return null;

    return (
      <div className="flex items-center justify-between px-5 py-3 mt-4 border border-gray-100 rounded-2xl bg-gray-50">
        <p className="text-xs text-gray-500">
          Affichage de {(currentPage - 1) * PAGE_SIZE + 1} à{" "}
          {Math.min(currentPage * PAGE_SIZE, totalItems)} sur {totalItems}
        </p>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onPageChange(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            className="ui-btn-secondary text-xs disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Précédent
          </button>

          <span className="text-xs text-gray-500">
            {currentPage} / {totalPages}
          </span>

          <button
            onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
            className="ui-btn-secondary text-xs disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Suivant
          </button>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-100">
        <div className="ui-spinner" />
      </div>
    );
  }

  return (
    <div className="ui-page">
      {/* Header */}
      <div className="mb-6">
        <h1 className="ui-title">Suivi abonnements</h1>

        <p className="ui-subtitle">
          Gérez les demandes de renouvellement et consultez l'historique des
          abonnements.
        </p>
      </div>

      {/* KPI */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-2xl border border-gray-200 border-t-4 border-t-blue-400 p-5">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs text-gray-400 font-medium tracking-wide mb-2">
                TOTAL ABONNEMENTS
              </p>

              <p className="text-3xl font-bold text-gray-900">
                {abonnements.length}
              </p>

              <p className="text-xs text-gray-400 mt-1">
                tous statuts confondus
              </p>
            </div>

            <div className="mt-1 w-11 h-11 rounded-xl bg-blue-50 flex items-center justify-center">
              <span className="text-blue-500 font-bold">▦</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 border-t-4 border-t-green-400 p-5">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs text-gray-400 font-medium tracking-wide mb-2">
                ACTIFS
              </p>

              <p className="text-3xl font-bold text-gray-900">{totalActifs}</p>

              <p className="text-xs text-gray-400 mt-1">abonnements en cours</p>
            </div>

            <div className="mt-1 w-11 h-11 rounded-xl bg-green-50 flex items-center justify-center">
              <span className="text-green-600 font-bold">✓</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 border-t-4 border-t-red-400 p-5">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs text-gray-400 font-medium tracking-wide mb-2">
                EXPIRÉS
              </p>

              <p className="text-3xl font-bold text-gray-900">{totalExpires}</p>

              <p className="text-xs text-gray-400 mt-1">à renouveler</p>
            </div>

            <div className="mt-1 w-11 h-11 rounded-xl bg-red-50 flex items-center justify-center">
              <span className="text-red-600 font-bold">⏱</span>
            </div>
          </div>
        </div>
      </div>

      {/* DEMANDES */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 mb-4">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-semibold text-gray-800">
              Demandes de renouvellement
            </h2>

            {enAttente.length > 0 && (
              <span className="bg-yellow-100 text-yellow-700 text-xs font-semibold px-2.5 py-0.5 rounded-full">
                {enAttente.length}
              </span>
            )}
          </div>

          {enAttente.length > 0 && (
            <div className="relative w-full lg:w-90">
              <Search
                className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                size={16}
              />

              <input
                type="text"
                placeholder="Rechercher une demande..."
                className="ui-input w-full pl-11! pr-4"
                value={searchDemande}
                onChange={(e) => setSearchDemande(e.target.value)}
              />
            </div>
          )}
        </div>

        {enAttente.length === 0 ? (
          <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6 flex items-center justify-center">
            <div className="text-center">
              <div
                className="mx-auto mb-2 w-10 h-10 rounded-2xl flex items-center justify-center"
                style={{ background: "var(--color-primary-soft)" }}
              >
                <MailCheck
                  className="w-5 h-5"
                  style={{ color: "var(--color-primary)" }}
                />
              </div>

              <p className="font-semibold text-gray-700">
                Aucune demande en attente
              </p>

              <p className="text-sm text-gray-400 mt-1">
                Les nouvelles demandes apparaîtront ici.
              </p>
            </div>
          </div>
        ) : filteredDemandes.length === 0 ? (
          <div className="text-center py-12 text-gray-400 text-sm border border-gray-100 rounded-2xl bg-gray-50">
            Aucune demande ne correspond à votre recherche.
          </div>
        ) : (
          <>
            <div className="space-y-3">
              {paginatedDemandes.map((d) => (
                <div
                  key={d.id}
                  className="rounded-2xl border border-yellow-200 bg-yellow-50/30 p-5"
                >
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-semibold text-gray-900">
                          {d.clientUsername}
                        </p>

                        <span className="text-xs text-gray-400">
                          {d.clientEmail}
                        </span>
                      </div>

                      <p className="text-sm text-gray-600">
                        Offre :{" "}
                        <span className="font-medium text-gray-900">
                          {d.intituleOffre}
                        </span>
                      </p>

                      <p className="text-sm text-gray-600">
                        Type :{" "}
                        <span className="capitalize font-medium">{d.type}</span>
                        {" · "}Montant :{" "}
                        <span className="font-medium">{d.montant} TND</span>
                      </p>

                      <p className="text-xs text-gray-400">
                        Envoyée le {formatDate(d.createdAt)}
                      </p>
                    </div>

                    <div className="flex gap-2 shrink-0">
                      <button
                        disabled={submittingDemandeId === d.id}
                        onClick={() => accepter(d.id)}
                        className="px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-xl text-xs font-semibold disabled:opacity-60"
                      >
                        Accepter
                      </button>

                      <button
                        disabled={submittingDemandeId === d.id}
                        onClick={() => refuser(d.id)}
                        className="px-3 py-2 border border-red-200 text-red-600 hover:bg-red-50 rounded-xl text-xs font-semibold disabled:opacity-60"
                      >
                        Refuser
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {renderPagination(
              demandesPage,
              totalDemandesPages,
              filteredDemandes.length,
              setDemandesPage,
            )}
          </>
        )}
      </div>

      {/* HISTORIQUE ABONNEMENTS */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <div className="flex flex-col gap-4 mb-4">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
            <h2 className="text-lg font-semibold text-gray-800">
              Historique des abonnements
            </h2>

            <div className="shrink-0">
              <ExportButton
                data={filteredAbos}
                columns={[
                  { key: "clientUsername", label: "Client" },
                  { key: "clientEmail", label: "Email" },
                  { key: "intituleOffre", label: "Offre" },
                  { key: "type", label: "Type" },
                  { key: "montant", label: "Montant (TND)" },
                  {
                    key: "dateDebut",
                    label: "Début",
                    format: (v) => formatDateFR(v),
                  },
                  {
                    key: "dateFin",
                    label: "Fin",
                    format: (v) => formatDateFR(v),
                  },
                  { key: "statut", label: "Statut" },
                ]}
                filename="abonnements"
                label="Exporter"
                sheetName="Abonnements"
                pdfTitle="Historique des abonnements"
              />
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-1 bg-gray-100 rounded-xl p-1">
              {(["actifs", "expires"] as const).map((t) => {
                const count =
                  t === "actifs" ? tabCounts.actifs : tabCounts.expires;

                return (
                  <button
                    key={t}
                    onClick={() => setTab(t)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                      tab === t
                        ? "bg-white shadow-sm text-(--color-primary)"
                        : "text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    {t === "actifs" ? "Actifs" : "Expirés"}{" "}
                    <span className="ml-1 text-xs font-semibold">{count}</span>
                  </button>
                );
              })}
            </div>

            <div className="relative flex-1 min-w-72">
              <Search
                className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                size={16}
              />

              <input
                type="text"
                placeholder="Rechercher par client, email, type ou offre..."
                className="ui-input w-full pl-11! pr-4"
                value={searchAbo}
                onChange={(e) => setSearchAbo(e.target.value)}
              />
            </div>

            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="h-10 min-w-40 rounded-xl border border-gray-200 bg-white px-3 text-sm text-gray-700 outline-none focus:border-(--color-primary)"
            >
              <option value="all">Tous les types</option>

              {typeOptions.map((type) => (
                <option key={type} value={type}>
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </option>
              ))}
            </select>

            {tab === "actifs" && (
              <select
                value={expirationFilter}
                onChange={(e) =>
                  setExpirationFilter(e.target.value as ExpirationFilter)
                }
                className="h-10 min-w-44 rounded-xl border border-gray-200 bg-white px-3 text-sm text-gray-700 outline-none focus:border-(--color-primary)"
              >
                <option value="all">Toutes les échéances</option>
                <option value="7days">Expire dans 7 jours</option>
                <option value="30days">Expire dans 30 jours</option>
              </select>
            )}

            {hasHistoryFilters && (
              <button
                onClick={resetHistoryFilters}
                className="h-10 px-3 rounded-xl border border-gray-200 text-sm font-medium text-(--color-primary) hover:bg-gray-50"
              >
                Réinitialiser
              </button>
            )}
          </div>
        </div>

        {filteredAbos.length === 0 ? (
          <div className="text-center py-16 text-gray-400 text-sm">
            Aucun abonnement trouvé
          </div>
        ) : (
          <>
            <div className="space-y-3">
              {paginatedAbos.map((a) => {
                const left = daysLeft(a.dateFin);
                const progress =
                  a.statut === "actif"
                    ? progressPercent(a.dateDebut, a.dateFin)
                    : 0;

                const totalDays = totalSubscriptionDays(a.dateDebut, a.dateFin);
                const usedDays = usedSubscriptionDays(a.dateDebut, a.dateFin);
                const remainingDays = left !== null ? Math.max(0, left) : 0;

                return (
                  <div
                    key={a.id}
                    className="rounded-2xl border border-gray-200 p-5 bg-white"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-3">
                        <div
                          className="w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold"
                          style={{
                            background: "var(--color-primary-soft)",
                            color: "var(--color-primary)",
                          }}
                        >
                          {getInitials(a.clientUsername)}
                        </div>

                        <div className="space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="font-semibold text-gray-900">
                              {a.clientUsername}
                            </p>

                            <span className="text-xs text-gray-400">
                              {a.clientEmail}
                            </span>
                          </div>

                          <p className="text-sm text-gray-700">
                            <span
                              className="font-semibold"
                              style={{ color: "var(--color-primary)" }}
                            >
                              {a.intituleOffre}
                            </span>
                            {" · "}
                            <span className="capitalize">{a.type}</span>
                            {" · "}
                            <span className="font-semibold">
                              {Number(a.montant).toFixed(2)} TND
                            </span>
                          </p>

                          <p className="text-xs text-gray-400">
                            Du {formatDate(a.dateDebut)} au{" "}
                            {a.dateFin ? formatDate(a.dateFin) : "—"}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <StatusPill statut={String(a.statut)} />

                        {a.statut === "actif" &&
                          left !== null &&
                          left <= 7 &&
                          left >= 0 && (
                            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-orange-100 text-orange-700">
                              Renouvelle dans {left}j
                            </span>
                          )}
                      </div>
                    </div>

                    {a.statut === "actif" && a.dateFin && (
                      <div className="mt-4">
                        <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
                          <span>Cycle de facturation</span>

                          <span
                            className="font-semibold"
                            style={{ color: "var(--color-primary)" }}
                          >
                            {progress}%
                          </span>
                        </div>

                        <div className="w-full bg-gray-100 rounded-full h-2">
                          <div
                            className="h-2 rounded-full"
                            style={{
                              width: `${progress}%`,
                              background: "var(--color-primary)",
                            }}
                          />
                        </div>

                        {totalDays > 0 && (
                          <p className="text-xs text-gray-400 mt-2">
                            {pluralJour(usedDays)} utilisé
                            {usedDays > 1 ? "s" : ""} sur{" "}
                            {pluralJour(totalDays)} ·{" "}
                            {pluralJour(remainingDays)} restant
                            {remainingDays > 1 ? "s" : ""}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {renderPagination(
              abonnementsPage,
              totalAbonnementsPages,
              filteredAbos.length,
              setAbonnementsPage,
            )}
          </>
        )}
      </div>
    </div>
  );
}
