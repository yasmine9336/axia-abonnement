import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../api/axiosInstance";
import {
  Search,
  MessageSquare,
  Phone,
  CalendarDays,
  X,
  Users,
  CheckCircle,
  CircleSlash,
  Filter,
} from "lucide-react";
import UiCard from "../common/UiCard";
import ExportButton from "../common/ExportButton";

type FilterTab = "tous" | "actif" | "inactif";
type MemberSinceFilter = "all" | "30days" | "90days" | "year";
type PhoneFilter = "all" | "withPhone" | "withoutPhone";

interface Client {
  id: string;
  username: string;
  email: string;
  phoneNumber: string | null;
  isActive: boolean;
  createdAt?: string | null;
}

interface AbonnementClientDto {
  id: string;
  intituleOffre: string;
  type: string;
  montant: number;
  dateDebut: string;
  dateFin: string;
  statut: string;
}

const PAGE_SIZE = 4;

function formatDateFR(d?: string | null) {
  if (!d) return "—";

  const dt = new Date(d);

  if (Number.isNaN(dt.getTime())) return "—";

  return dt.toLocaleDateString("fr-FR");
}

function isWithinLastDays(date?: string | null, days = 30) {
  if (!date) return false;

  const d = new Date(date);

  if (Number.isNaN(d.getTime())) return false;

  const limit = new Date();
  limit.setDate(limit.getDate() - days);

  return d >= limit;
}

function isInCurrentYear(date?: string | null) {
  if (!date) return false;

  const d = new Date(date);

  if (Number.isNaN(d.getTime())) return false;

  return d.getFullYear() === new Date().getFullYear();
}

export default function ArchiveSection() {
  const navigate = useNavigate();

  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);

  const [tab, setTab] = useState<FilterTab>("tous");
  const [searchTerm, setSearchTerm] = useState("");
  const [memberSinceFilter, setMemberSinceFilter] =
    useState<MemberSinceFilter>("all");
  const [phoneFilter, setPhoneFilter] = useState<PhoneFilter>("all");
  const [page, setPage] = useState(1);

  const [openSubs, setOpenSubs] = useState(false);
  const [subsLoading, setSubsLoading] = useState(false);
  const [subs, setSubs] = useState<AbonnementClientDto[]>([]);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);

  useEffect(() => {
    let cancelled = false;

    setLoading(true);

    axiosInstance
      .get<Client[]>("/users/clients")
      .then((r) => {
        if (!cancelled) setClients(r.data ?? []);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const actifs = useMemo(
    () => clients.filter((c) => c.isActive).length,
    [clients],
  );

  const inactifs = useMemo(
    () => clients.filter((c) => !c.isActive).length,
    [clients],
  );

  const filtered = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();

    let result = clients;

    if (tab === "actif") {
      result = result.filter((c) => c.isActive);
    }

    if (tab === "inactif") {
      result = result.filter((c) => !c.isActive);
    }

    if (memberSinceFilter === "30days") {
      result = result.filter((c) => isWithinLastDays(c.createdAt, 30));
    }

    if (memberSinceFilter === "90days") {
      result = result.filter((c) => isWithinLastDays(c.createdAt, 90));
    }

    if (memberSinceFilter === "year") {
      result = result.filter((c) => isInCurrentYear(c.createdAt));
    }

    if (phoneFilter === "withPhone") {
      result = result.filter((c) => Boolean(c.phoneNumber));
    }

    if (phoneFilter === "withoutPhone") {
      result = result.filter((c) => !c.phoneNumber);
    }

    if (!term) return result;

    return result.filter(
      (c) =>
        c.username.toLowerCase().includes(term) ||
        c.email.toLowerCase().includes(term) ||
        c.phoneNumber?.toLowerCase().includes(term),
    );
  }, [clients, tab, searchTerm, memberSinceFilter, phoneFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));

  const paginatedClients = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;

    return filtered.slice(start, start + PAGE_SIZE);
  }, [filtered, page]);

  useEffect(() => {
    setPage(1);
  }, [tab, searchTerm, memberSinceFilter, phoneFilter]);

  useEffect(() => {
    setPage((currentPage) => Math.min(currentPage, totalPages));
  }, [totalPages]);

  const totalActifsFiltres = useMemo(
    () => filtered.filter((c) => c.isActive).length,
    [filtered],
  );

  const totalInactifsFiltres = useMemo(
    () => filtered.filter((c) => !c.isActive).length,
    [filtered],
  );

  const hasFilters =
    tab !== "tous" ||
    searchTerm.trim() !== "" ||
    memberSinceFilter !== "all" ||
    phoneFilter !== "all";

  const resetFilters = () => {
    setTab("tous");
    setSearchTerm("");
    setMemberSinceFilter("all");
    setPhoneFilter("all");
  };

  const openConversation = (c: Client) => {
    navigate(
      `/dashboard/responsable/messages?clientId=${encodeURIComponent(c.id)}`,
    );
  };

  const openClientSubs = async (c: Client) => {
    setSelectedClient(c);
    setOpenSubs(true);
    setSubs([]);
    setSubsLoading(true);

    try {
      const res = await axiosInstance.get<AbonnementClientDto[]>(
        `/abonnements/by-client/${c.id}`,
      );

      setSubs(res.data ?? []);
    } catch {
      setSubs([]);
    } finally {
      setSubsLoading(false);
    }
  };

  const renderPagination = () => {
    if (totalPages <= 1) return null;

    return (
      <div className="flex items-center justify-between mt-5 px-4 py-3 bg-white border border-gray-200 rounded-2xl">
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
      sub: "tous statuts confondus",
      border: "border-t-blue-500",
      iconBg: "bg-blue-50",
      icon: <Users className="w-5 h-5 text-blue-600" />,
    },
    {
      label: "ACTIFS",
      value: actifs,
      sub: "comptes actifs",
      border: "border-t-green-400",
      iconBg: "bg-green-50",
      icon: <CheckCircle className="w-5 h-5 text-green-500" />,
    },
    {
      label: "INACTIFS",
      value: inactifs,
      sub: "comptes inactifs",
      border: "border-t-red-400",
      iconBg: "bg-red-50",
      icon: <CircleSlash className="w-5 h-5 text-red-500" />,
    },
  ];

  return (
    <div className="ui-page">
      <div className="mb-6">
        <h1 className="ui-title">Archive clients</h1>

        <p className="ui-subtitle">
          {actifs} actif(s) · {inactifs} inactif(s) · {clients.length} total
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

              <div
                className={`mt-1 w-10 h-10 rounded-xl flex items-center justify-center ${card.iconBg}`}
              >
                {card.icon}
              </div>
            </div>
          </div>
        ))}
      </div>

      <UiCard className="p-4 mb-6">
        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <h2 className="text-lg font-semibold text-gray-800">
                {tab === "tous"
                  ? "Tous les clients"
                  : tab === "actif"
                    ? "Clients actifs"
                    : "Clients inactifs"}
              </h2>

              <span className="bg-(--color-primary-soft) text-(--color-primary) text-xs font-semibold px-2.5 py-1 rounded-full">
                {tab === "tous"
                  ? filtered.length
                  : tab === "actif"
                    ? totalActifsFiltres
                    : totalInactifsFiltres}
              </span>
            </div>

            <ExportButton
              data={filtered}
              columns={[
                { key: "username", label: "Client" },
                { key: "email", label: "Email" },
                { key: "phoneNumber", label: "Téléphone" },
                {
                  key: "isActive",
                  label: "Statut",
                  format: (v) => (v ? "Actif" : "Inactif"),
                },
                {
                  key: "createdAt",
                  label: "Membre depuis",
                  format: (v) => formatDateFR(v as string),
                },
              ]}
              filename="clients"
              label="Exporter clients"
              sheetName="Clients"
              pdfTitle="Archive clients"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="inline-flex bg-gray-50 border border-gray-200 rounded-xl p-1">
              {(["tous", "actif", "inactif"] as const).map((t) => {
                const active = tab === t;

                return (
                  <button
                    key={t}
                    onClick={() => setTab(t)}
                    className={`px-3 py-2 text-sm rounded-lg font-medium transition ${
                      active
                        ? "bg-white shadow-sm text-(--color-primary)"
                        : "text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    {t === "tous"
                      ? "Tous"
                      : t === "actif"
                        ? "Actifs"
                        : "Inactifs"}
                  </button>
                );
              })}
            </div>

            <div className="relative flex-1 min-w-64">
              <Search
                className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                size={16}
              />

              <input
                type="text"
                placeholder="Rechercher par nom, email ou téléphone..."
                className="ui-input w-full pl-11! pr-4"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="flex items-center gap-2">
              <Filter size={15} className="text-gray-400" />

              <select
                value={memberSinceFilter}
                onChange={(e) =>
                  setMemberSinceFilter(e.target.value as MemberSinceFilter)
                }
                className="h-10 min-w-44 rounded-xl border border-gray-200 bg-white px-3 text-sm text-gray-700 outline-none focus:border-(--color-primary)"
              >
                <option value="all">Toutes les dates</option>
                <option value="30days">30 derniers jours</option>
                <option value="90days">90 derniers jours</option>
                <option value="year">Cette année</option>
              </select>
            </div>

            <select
              value={phoneFilter}
              onChange={(e) => setPhoneFilter(e.target.value as PhoneFilter)}
              className="h-10 min-w-44 rounded-xl border border-gray-200 bg-white px-3 text-sm text-gray-700 outline-none focus:border-(--color-primary)"
            >
              <option value="all">Tous les contacts</option>
              <option value="withPhone">Avec téléphone</option>
              <option value="withoutPhone">Sans téléphone</option>
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

      {loading ? (
        <div className="flex items-center justify-center min-h-40">
          <div className="ui-spinner" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-gray-400 text-sm">
          Aucun client trouvé
        </div>
      ) : (
        <>
          <div className="grid gap-3 grid-cols-[repeat(auto-fit,minmax(240px,300px))] justify-items-start">
            {paginatedClients.map((c) => (
              <div
                key={c.id}
                className="bg-white rounded-2xl border border-gray-200 p-3 w-full max-w-75"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-full bg-(--color-primary-soft) flex items-center justify-center font-bold text-(--color-primary)">
                      {c.username?.charAt(0)?.toUpperCase() || "U"}
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-gray-900 truncate">
                          {c.username}
                        </p>

                        <span
                          className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                            c.isActive
                              ? "bg-green-100 text-green-700"
                              : "bg-gray-100 text-gray-600"
                          }`}
                        >
                          {c.isActive ? "actif" : "inactif"}
                        </span>
                      </div>

                      <p className="text-xs text-gray-400 truncate">
                        {c.email}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="my-3 border-t border-gray-100" />

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-xs text-gray-400 font-semibold tracking-wide mb-1 flex items-center gap-2">
                      <Phone size={14} /> TÉLÉPHONE
                    </p>

                    <p className="font-semibold text-gray-900">
                      {c.phoneNumber || "—"}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-gray-400 font-semibold tracking-wide mb-1 flex items-center gap-2">
                      <CalendarDays size={14} /> MEMBRE DEPUIS
                    </p>

                    <p className="font-semibold text-gray-900">
                      {formatDateFR(c.createdAt)}
                    </p>
                  </div>
                </div>

                <div className="mt-3 grid grid-cols-2 gap-2">
                  <button
                    onClick={() => void openClientSubs(c)}
                    className="w-full border border-(--color-primary)/30 text-(--color-primary) hover:bg-(--color-primary-soft) rounded-lg px-2.5 py-1.5 text-xs font-semibold transition whitespace-nowrap truncate"
                    title="Voir abonnements"
                  >
                    Voir abonnements
                  </button>

                  <button
                    onClick={() => openConversation(c)}
                    className="w-full border border-gray-200 text-gray-700 hover:bg-gray-50 rounded-lg px-2.5 py-1.5 text-xs font-semibold transition flex items-center justify-center gap-1.5 whitespace-nowrap"
                    title="Message"
                  >
                    <MessageSquare size={14} />
                    Message
                  </button>
                </div>
              </div>
            ))}
          </div>

          {renderPagination()}
        </>
      )}

      {openSubs && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-3">
          <div className="bg-white w-full max-w-3xl rounded-2xl shadow-2xl border border-gray-200 overflow-hidden">
            <div className="p-5 border-b border-gray-100 flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500">Abonnements du client</p>

                <h3 className="text-lg font-bold text-gray-900">
                  {selectedClient?.username ?? "—"}
                </h3>
              </div>

              <button
                onClick={() => setOpenSubs(false)}
                className="w-10 h-10 rounded-xl border border-gray-200 hover:bg-gray-50 flex items-center justify-center"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-5">
              {subsLoading ? (
                <div className="flex items-center justify-center min-h-40">
                  <div className="ui-spinner" />
                </div>
              ) : subs.length === 0 ? (
                <div className="text-center py-10 text-sm text-gray-500">
                  Aucun abonnement trouvé pour ce client.
                </div>
              ) : (
                <div className="space-y-3">
                  {subs.map((a) => (
                    <div
                      key={a.id}
                      className="border border-gray-200 rounded-2xl p-3"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-semibold text-gray-900">
                            {a.intituleOffre}
                          </p>

                          <p className="text-xs text-gray-500 mt-1">
                            {a.type} · {Number(a.montant).toFixed(2)} TND
                          </p>

                          <p className="text-xs text-gray-400 mt-1">
                            {formatDateFR(a.dateDebut)} →{" "}
                            {formatDateFR(a.dateFin)}
                          </p>
                        </div>

                        <span
                          className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                            a.statut === "actif"
                              ? "bg-green-100 text-green-700"
                              : "bg-red-100 text-red-600"
                          }`}
                        >
                          {a.statut}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="p-5 border-t border-gray-100 flex justify-end">
              <button
                onClick={() => setOpenSubs(false)}
                className="px-4 py-2.5 rounded-xl border border-gray-200 hover:bg-gray-50 text-sm font-semibold"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}