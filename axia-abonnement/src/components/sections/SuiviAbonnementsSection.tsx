import { useEffect, useMemo, useState } from "react";
import axiosInstance from "../../api/axiosInstance";
import { Search, MailCheck } from "lucide-react";
import ExportButton from "../common/ExportButton";
import { formatDateFR } from "../../utils/exportUtils";

type AbonnementTab = "actifs" | "expires";
type DemandeStatut = "en_attente" | "acceptée" | "refusée";
type AbonnementStatut = "actif" | "expiré" | "aucun" | string;

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
  if (!Number.isFinite(start) || !Number.isFinite(end) || end <= start)
    return 0;
  return clamp(Math.round(((now - start) / (end - start)) * 100), 0, 100);
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
  const [submittingDemandeId, setSubmittingDemandeId] = useState<string | null>(
    null,
  );

  const loadData = async () => {
    const [d, a] = await Promise.all([
      axiosInstance.get("/demandes"),
      axiosInstance.get("/abonnements/all"),
    ]);
    setDemandes(d.data ?? []);
    setAbonnements(a.data ?? []);
  };

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
  }, []);

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

  const filteredAbos = useMemo(() => {
    const q = searchAbo.trim().toLowerCase();
    let res = [...abonnements];
    if (tab === "actifs") res = res.filter((a) => a.statut === "actif");
    if (tab === "expires") res = res.filter((a) => a.statut === "expiré");
    if (q) {
      res = res.filter(
        (a) =>
          a.clientUsername.toLowerCase().includes(q) ||
          a.clientEmail.toLowerCase().includes(q) ||
          a.intituleOffre.toLowerCase().includes(q),
      );
    }
    return res;
  }, [abonnements, tab, searchAbo]);

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
        <h1 className="ui-title">Suivi clients</h1>
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
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-800">
            Demandes de renouvellement
          </h2>
          {enAttente.length > 0 && (
            <span className="bg-yellow-100 text-yellow-700 text-xs font-semibold px-2.5 py-0.5 rounded-full">
              {enAttente.length}
            </span>
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
        ) : (
          <div className="space-y-3">
            {enAttente.map((d) => (
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
        )}
      </div>

      {/* HISTORIQUE ABONNEMENTS */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-4">
          <h2 className="text-lg font-semibold text-gray-800">
            Historique des abonnements
          </h2>

          <div className="flex flex-wrap items-center gap-3">
            {/* Tabs */}
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

            {/* Search */}
            <div className="relative w-full sm:w-70">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                size={16}
              />
              <input
                type="text"
                placeholder="Rechercher par client, email ou offre..."
                className="ui-input w-full pl-10 pr-4"
                value={searchAbo}
                onChange={(e) => setSearchAbo(e.target.value)}
              />
            </div>

            {/* Export */}
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
        </div>

        {filteredAbos.length === 0 ? (
          <div className="text-center py-16 text-gray-400 text-sm">
            Aucun abonnement trouvé
          </div>
        ) : (
          <div className="space-y-3">
            {filteredAbos.map((a) => {
              const left = daysLeft(a.dateFin);
              const progress =
                a.statut === "actif"
                  ? progressPercent(a.dateDebut, a.dateFin)
                  : 0;

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
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
