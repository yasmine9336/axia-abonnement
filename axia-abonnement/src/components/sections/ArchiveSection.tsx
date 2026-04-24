import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../api/axiosInstance";
import { Search, MessageSquare, Phone, CalendarDays, X } from "lucide-react";
import UiCard from "../common/UiCard";

type FilterTab = "tous" | "actif" | "inactif";

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

function formatDateFR(d?: string | null) {
  if (!d) return "—";
  const dt = new Date(d);
  if (Number.isNaN(dt.getTime())) return "—";
  return dt.toLocaleDateString("fr-FR");
}

export default function ArchiveSection() {
  const navigate = useNavigate();

  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<FilterTab>("tous");
  const [searchTerm, setSearchTerm] = useState("");

  const [openSubs, setOpenSubs] = useState(false);
  const [subsLoading, setSubsLoading] = useState(false);
  const [subs, setSubs] = useState<AbonnementClientDto[]>([]);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    axiosInstance
      .get("/users/clients")
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

  const filtered = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    let result = clients;

    if (tab === "actif") result = result.filter((c) => c.isActive);
    if (tab === "inactif") result = result.filter((c) => !c.isActive);

    if (!term) return result;
    return result.filter(
      (c) =>
        c.username.toLowerCase().includes(term) ||
        c.email.toLowerCase().includes(term),
    );
  }, [clients, tab, searchTerm]);

  const actifs = useMemo(() => clients.filter((c) => c.isActive).length, [clients]);
  const inactifs = useMemo(() => clients.filter((c) => !c.isActive).length, [clients]);

  const totalActifsFiltres = useMemo(
    () => filtered.filter((c) => c.isActive).length,
    [filtered],
  );
  const totalInactifsFiltres = useMemo(
    () => filtered.filter((c) => !c.isActive).length,
    [filtered],
  );

  const openConversation = (c: Client) => {
    navigate(`/dashboard/responsable/messages?clientId=${encodeURIComponent(c.id)}`);
  };

  const openClientSubs = async (c: Client) => {
    setSelectedClient(c);
    setOpenSubs(true);
    setSubs([]);
    setSubsLoading(true);

    try {
      const res = await axiosInstance.get(`/abonnements/by-client/${c.id}`);
      setSubs(res.data ?? []);
    } catch {
      try {
        const res = await axiosInstance.get(`/abonnements/all`);
        setSubs((res.data ?? []) as AbonnementClientDto[]);
      } catch {
        setSubs([]);
      }
    } finally {
      setSubsLoading(false);
    }
  };

  const kpiCards = [
    {
      label: "TOTAL CLIENTS",
      value: clients.length,
      sub: "tous statuts confondus",
      border: "border-t-blue-400",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"
          />
        </svg>
      ),
    },
    {
      label: "ACTIFS",
      value: actifs,
      sub: "comptes actifs",
      border: "border-t-green-400",
      icon: (
        <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
    {
      label: "INACTIFS",
      value: inactifs,
      sub: "comptes inactifs",
      border: "border-t-gray-400",
      icon: (
        <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
        </svg>
      ),
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
          <UiCard key={card.label} className={`border-t-4 ${card.border}`}>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs text-gray-400 font-medium tracking-wide mb-2">{card.label}</p>
                <p className="text-3xl font-bold text-gray-900">{card.value}</p>
                <p className="text-xs text-gray-400 mt-1">{card.sub}</p>
              </div>
              <div className="mt-1">{card.icon}</div>
            </div>
          </UiCard>
        ))}
      </div>

      <UiCard className="p-5 mb-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-semibold text-gray-800">
              {tab === "tous" ? "Tous les clients" : tab === "actif" ? "Clients actifs" : "Clients inactifs"}
            </h2>
            <span className="bg-(--color-primary-soft) text-(--color-primary) text-xs font-semibold px-2.5 py-1 rounded-full">
              {tab === "tous" ? filtered.length : tab === "actif" ? totalActifsFiltres : totalInactifsFiltres}
            </span>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
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
                    {t === "tous" ? "Tous" : t === "actif" ? "Actifs" : "Inactifs"}
                  </button>
                );
              })}
            </div>

            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input
                type="text"
                placeholder="Rechercher par nom ou email..."
                className="ui-input w-full sm:w-[320px] pl-10 pr-4 py-2.5"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </div>
      </UiCard>

      {loading ? (
        <div className="flex items-center justify-center min-h-40">
          <div className="ui-spinner" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-gray-400 text-sm">Aucun client trouvé</div>
      ) : (
        <div className="grid gap-3 grid-cols-[repeat(auto-fit,minmax(240px,300px))] justify-items-start">
          {filtered.map((c) => (
            <div key={c.id} className="bg-white rounded-2xl border border-gray-200 p-3 w-full max-w-75">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-full bg-(--color-primary-soft) flex items-center justify-center font-bold text-(--color-primary)">
                    {c.username?.charAt(0)?.toUpperCase() || "U"}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-gray-900 truncate">{c.username}</p>
                      <span
                        className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                          c.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {c.isActive ? "actif" : "inactif"}
                      </span>
                    </div>
                    <p className="text-xs text-gray-400 truncate">{c.email}</p>
                  </div>
                </div>
              </div>

              <div className="my-3 border-t border-gray-100" />

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-xs text-gray-400 font-semibold tracking-wide mb-1 flex items-center gap-2">
                    <Phone size={14} /> TÉLÉPHONE
                  </p>
                  <p className="font-semibold text-gray-900">{c.phoneNumber || "—"}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 font-semibold tracking-wide mb-1 flex items-center gap-2">
                    <CalendarDays size={14} /> MEMBRE DEPUIS
                  </p>
                  <p className="font-semibold text-gray-900">{formatDateFR(c.createdAt)}</p>
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
      )}

      {openSubs && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-3">
          <div className="bg-white w-full max-w-3xl rounded-2xl shadow-2xl border border-gray-200 overflow-hidden">
            <div className="p-5 border-b border-gray-100 flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500">Abonnements du client</p>
                <h3 className="text-lg font-bold text-gray-900">{selectedClient?.username ?? "—"}</h3>
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
                    <div key={a.id} className="border border-gray-200 rounded-2xl p-3">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-semibold text-gray-900">{a.intituleOffre}</p>
                          <p className="text-xs text-gray-500 mt-1">
                            {a.type} · {Number(a.montant).toFixed(2)} TND
                          </p>
                          <p className="text-xs text-gray-400 mt-1">
                            {formatDateFR(a.dateDebut)} → {formatDateFR(a.dateFin)}
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