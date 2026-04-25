import { useState, useEffect, useMemo } from "react";
import axiosInstance from "../../api/axiosInstance";
import { Search, TrendingUp, Calendar, Receipt } from "lucide-react";
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
  return AVATAR_COLORS[name.charCodeAt(0) % AVATAR_COLORS.length];
}

function txnRef(index: number) {
  return `TXN-${String(index + 1).padStart(3, "0")}`;
}

const now = new Date();

type SourceFilter = "tous" | "clients" | "responsables";

export default function TransactionsAdminSection() {
  const { user } = useAuth();
  const isAdmin = user?.role === "Admin";

  const [paiements, setPaiements] = useState<Paiement[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterDate, setFilterDate] = useState("");
  const [filterSource, setFilterSource] = useState<SourceFilter>("tous");

  useEffect(() => {
    axiosInstance
      .get("/payment/history/all")
      .then((r) => setPaiements(r.data))
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
      paiements
        .filter((p) => p.statut === "completed")
        .reduce((s, p) => s + p.montant, 0),
    [paiements],
  );

  const revenuMoisCi = useMemo(() => {
    const debut = new Date(now.getFullYear(), now.getMonth(), 1);
    return paiements
      .filter((p) => p.statut === "completed" && new Date(p.createdAt) >= debut)
      .reduce((s, p) => s + p.montant, 0);
  }, [paiements]);

  const isResponsableTxn = (p: Paiement) =>
    (p.typeAbonnement ?? "").toLowerCase().includes("responsable");

  const filtered = useMemo(() => {
    let result = paiements;

    if (isAdmin) {
      if (filterSource === "clients") {
        result = result.filter((p) => !isResponsableTxn(p));
      }
      if (filterSource === "responsables") {
        result = result.filter((p) => isResponsableTxn(p));
      }
    }

    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      result = result.filter(
        (p) =>
          p.clientUsername.toLowerCase().includes(q) ||
          p.clientEmail.toLowerCase().includes(q) ||
          p.intituleOffre.toLowerCase().includes(q),
      );
    }

    if (filterDate) {
      result = result.filter((p) => p.createdAt.startsWith(filterDate));
    }

    return result;
  }, [paiements, searchTerm, filterDate, filterSource, isAdmin]);

  const totalFiltered = filtered.reduce((s, p) => s + p.montant, 0);

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

  const kpiCards = [
    {
      label: "REVENUS TOTAUX",
      value: `${revenuTotal.toFixed(2)} TND`,
      sub: `${paiements.filter((p) => p.statut === "completed").length} transactions`,
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
      icon: <Receipt className="w-5 h-5 text-red-500" />,
      border: "border-t-red-400",
    },
  ];

  const countsBySource = useMemo(() => {
    const clients = paiements.filter((p) => !isResponsableTxn(p)).length;
    const responsables = paiements.filter((p) => isResponsableTxn(p)).length;
    return { clients, responsables, total: paiements.length };
  }, [paiements]);

  return (
    <div className="ui-page pl-8">
      <div className="mb-6">
        <h1 className="ui-title">Transactions</h1>
        <p className="ui-subtitle">
          {paiements.length} transaction(s) · {revenuTotal.toFixed(2)} TND total
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {kpiCards.map((card) => (
          <UiCard key={card.label} className={`border-t-4 ${card.border}`}>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs text-gray-400 font-medium tracking-wide mb-2">{card.label}</p>
                <p className={`font-bold text-gray-900 ${card.large ? "text-2xl" : "text-3xl"}`}>
                  {card.value}
                </p>
                <p className="text-xs text-gray-400 mt-1">{card.sub}</p>
              </div>
              <div className="mt-1">{card.icon}</div>
            </div>
          </UiCard>
        ))}
      </div>

      <UiCard className="p-4 mb-4">
        <div className="flex flex-wrap items-center gap-3">
          {isAdmin && (
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
                    {t === "tous" ? "Tous" : t === "clients" ? "Clients" : "Responsables"}{" "}
                    <span className="ml-1 text-xs font-semibold">{count}</span>
                  </button>
                );
              })}
            </div>
          )}

          <div className="relative flex-1 min-w-48">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input
              type="text"
              placeholder="Rechercher par client, email ou offre..."
              className="ui-input pl-9 pr-4"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2">
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

          <ExportButton
            data={filtered}
            columns={[
              { key: "createdAt", label: "Date", format: (v) => formatDateFR(v) },
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
      </UiCard>

      {loading ? (
        <div className="flex items-center justify-center min-h-40">
          <div className="ui-spinner" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-gray-400 text-sm">Aucune transaction</div>
      ) : (
        <UiCard className="p-0 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                {["Référence", "Date", "Client", "Offre / Service", "Type", "Montant", "Statut"].map(
                  (h) => (
                    <th
                      key={h}
                      className="text-left py-3 px-5 text-xs text-gray-400 font-medium uppercase tracking-wide"
                    >
                      {h}
                    </th>
                  ),
                )}
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-50">
              {filtered.map((p, i) => {
                const badge = statutBadge(p.statut);
                const responsable = isResponsableTxn(p);

                return (
                  <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                    <td className="py-4 px-5">
                      <span className="text-(--color-primary) font-semibold text-xs">
                        {txnRef(i)}
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
                          <p className="font-semibold text-gray-900">{p.clientUsername}</p>
                          <p className="text-xs text-gray-400">{p.clientEmail}</p>
                        </div>
                      </div>
                    </td>

                    <td className="py-4 px-5 font-medium text-gray-900">{p.intituleOffre}</td>

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
                      <StatusBadge label={badge.label} variant={badge.variant} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          <div className="px-5 py-3 border-t border-gray-100 bg-gray-50 flex items-center justify-between">
            <p className="text-xs text-gray-500">{filtered.length} transaction(s)</p>
            <p className="text-sm font-semibold text-gray-900">
              Total : <span className="text-green-600">{totalFiltered.toFixed(2)} TND</span>
            </p>
          </div>
        </UiCard>
      )}
    </div>
  );
}