import { useEffect, useMemo, useState } from "react";
import axiosInstance from "../../api/axiosInstance";
import { Download, Search, Wallet, Receipt, BarChart3 } from "lucide-react";

interface Paiement {
  id: string;
  montant: number;
  statut: string; // pending | completed | failed
  createdAt: string;
  intituleOffre: string;
  typeAbonnement: string; // mensuel/annuel...
}

type FilterKey = "all" | "completed";

const isCompleted = (s: string) => s === "completed";

const formatStatut = (s: string) =>
  s === "completed" ? "Complété" : s === "pending" ? "En cours" : "Échoué";

const statutBadge = (s: string) =>
  s === "completed"
    ? "bg-green-100 text-green-700"
    : s === "pending"
      ? "bg-yellow-100 text-yellow-700"
      : "bg-red-100 text-red-700";

function formatDateFR(d: string) {
  return new Date(d).toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function safeFileNamePart(input: string) {
  return input
    .trim()
    .replace(/[^\w\- ]+/g, "")
    .replace(/\s+/g, "_")
    .slice(0, 40);
}

export default function HistoriqueSection() {
  const [paiements, setPaiements] = useState<Paiement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [filter, setFilter] = useState<FilterKey>("all");
  const [q, setQ] = useState("");
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  useEffect(() => {
    axiosInstance
      .get("/payment/history")
      .then((r) => setPaiements(r.data))
      .catch(() => setError("Erreur lors du chargement des transactions."))
      .finally(() => setLoading(false));
  }, []);

  const totalDepense = useMemo(
    () =>
      paiements
        .filter((p) => isCompleted(p.statut))
        .reduce((s, p) => s + p.montant, 0),
    [paiements],
  );

  const ceMois = useMemo(() => {
    const now = new Date();
    return paiements
      .filter((p) => {
        if (!isCompleted(p.statut)) return false;
        const d = new Date(p.createdAt);
        return (
          d.getMonth() === now.getMonth() &&
          d.getFullYear() === now.getFullYear()
        );
      })
      .reduce((s, p) => s + p.montant, 0);
  }, [paiements]);

  const filtered = useMemo(() => {
    const qq = q.trim().toLowerCase();

    return paiements
      .filter((p) => {
        if (filter === "completed") return p.statut === "completed";
        return true;
      })
      .filter((p) => {
        if (!qq) return true;
        return (
          p.intituleOffre.toLowerCase().includes(qq) ||
          p.typeAbonnement.toLowerCase().includes(qq) ||
          formatStatut(p.statut).toLowerCase().includes(qq)
        );
      })
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );
  }, [paiements, filter, q]);

  const downloadReceiptPdf = async (p: Paiement) => {
    if (!isCompleted(p.statut)) return;

    try {
      setDownloadingId(p.id);

      const res = await axiosInstance.get(`/payment/history/${p.id}/receipt`, {
        responseType: "blob",
      });

      const blob = new Blob([res.data], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = `recu_${safeFileNamePart(p.intituleOffre)}_${p.id.slice(0, 8)}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();

      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Erreur téléchargement reçu :", error);
      alert("Impossible de télécharger le reçu.");
    } finally {
      setDownloadingId(null);
    }
  };

  const kpiCards = [
    {
      label: "TOTAL DÉPENSÉ",
      value: `${totalDepense.toFixed(2)} TND`,
      sub: "paiements complétés",
      icon: <Wallet className="w-5 h-5 text-green-500" />,
      border: "border-t-green-400",
    },
    {
      label: "TRANSACTIONS",
      value: paiements.length,
      sub: `${paiements.filter((p) => isCompleted(p.statut)).length} complétée${paiements.filter((p) => isCompleted(p.statut)).length !== 1 ? "s" : ""}`,
      icon: <Receipt className="w-5 h-5 text-blue-600" />,
      border: "border-t-blue-500",
    },
    {
      label: "CE MOIS-CI",
      value: `${ceMois.toFixed(2)} TND`,
      sub: "dépensé ce mois",
      icon: <BarChart3 className="w-5 h-5 text-orange-500" />,
      border: "border-t-orange-400",
    },
  ];

  return (
    <div className="ui-page">
      <div className="mb-6">
        <h1 className="ui-title">Historique des transactions</h1>
      </div>

      {/* KPI Cards */}
      {!loading && !error && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
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
                <div className="mt-1">{card.icon}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center min-h-40">
          <div className="ui-spinner" />
        </div>
      ) : error ? (
        <div className="text-center py-16 text-red-500 text-sm">{error}</div>
      ) : paiements.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-200 text-center py-16 text-gray-400 text-sm">
          Aucune transaction
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          {/* Header bloc */}
          <div className="px-5 py-4 border-b border-gray-100 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <h2 className="text-sm font-semibold text-gray-900 no-underline">
              Toutes les transactions
            </h2>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              {/* Tabs */}
              <div className="inline-flex bg-gray-100 rounded-xl p-1">
                <button
                  onClick={() => setFilter("all")}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition ${
                    filter === "all"
                      ? "bg-white shadow-sm text-(--color-primary)"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  Tous
                </button>
                <button
                  onClick={() => setFilter("completed")}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition ${
                    filter === "completed"
                      ? "bg-white shadow-sm text-(--color-primary)"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  Complétées
                </button>
              </div>

              {/* Search */}
              <div className="relative">
                <Search
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  size={16}
                />
                <input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Rechercher..."
                  className="ui-input w-full sm:w-72 pl-10 pr-3"
                />
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="w-full overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  {[
                    "Service",
                    "Date",
                    "Période",
                    "Montant",
                    "Statut",
                    "Reçu",
                  ].map((h, i) => (
                    <th
                      key={h}
                      className={`text-xs text-gray-400 font-medium uppercase tracking-wide px-5 py-3 ${
                        i === 3
                          ? "text-right"
                          : i === 5
                            ? "text-center w-40"
                            : "text-left"
                      }`}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-50">
                {filtered.map((p) => {
                  const canDownload = p.statut === "completed";
                  const isDownloading = downloadingId === p.id;

                  return (
                    <tr
                      key={p.id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-5 py-4">
                        <div className="font-semibold text-gray-900">
                          {p.intituleOffre}
                        </div>
                        <div className="text-xs text-gray-400">
                          {p.id.slice(0, 8).toUpperCase()}
                        </div>
                      </td>

                      <td className="px-5 py-4 text-gray-500 text-xs">
                        {formatDateFR(p.createdAt)}
                      </td>

                      <td className="px-5 py-4 text-gray-600 capitalize">
                        {p.typeAbonnement}
                      </td>

                      <td className="px-5 py-4 text-right font-bold text-gray-900 whitespace-nowrap">
                        {p.montant.toFixed(2)} TND
                      </td>

                      <td className="px-5 py-4">
                        <span
                          className={`text-xs font-semibold px-2.5 py-1 rounded-full ${statutBadge(p.statut)}`}
                        >
                          {formatStatut(p.statut)}
                        </span>
                      </td>

                      <td className="px-4 py-4 text-center w-40">
                        <button
                          onClick={() => void downloadReceiptPdf(p)}
                          disabled={!canDownload || isDownloading}
                          className={`inline-flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold border transition ${
                            canDownload
                              ? "border-(--color-primary) text-(--color-primary) hover:bg-(--color-primary) hover:text-white"
                              : "border-gray-200 text-gray-400 cursor-not-allowed bg-gray-50"
                          } ${isDownloading ? "opacity-60 cursor-wait" : ""}`}
                          title={
                            canDownload
                              ? "Télécharger le reçu"
                              : "Reçu disponible après paiement complété"
                          }
                        >
                          <Download size={14} />
                          {isDownloading ? "..." : "Télécharger"}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {filtered.length === 0 && (
              <div className="text-center py-12 text-gray-400 text-sm">
                Aucun résultat
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-5 py-3 border-t border-gray-100 bg-gray-50">
            <p className="text-xs text-gray-500">
              Affichage de {filtered.length} sur {paiements.length} transaction
              {paiements.length !== 1 ? "s" : ""}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
