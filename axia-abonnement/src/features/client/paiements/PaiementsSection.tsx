import { useEffect, useMemo, useState } from "react";
import axiosInstance from "../../../services/api/axiosInstance";
import EmptyState from "../../../components/common/EmptyState";
import LoadingState from "../../../components/common/LoadingState";

import PaiementsFilters from "./components/PaiementsFilters";
import PaiementsTable from "./components/PaiementsTable";

import type { FilterKey, Paiement } from "./types";
import { formatStatut, isCompleted, safeFileNamePart } from "./utils";

export default function PaiementsSection() {
  const [paiements, setPaiements] = useState<Paiement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [filter, setFilter] = useState<FilterKey>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  useEffect(() => {
    axiosInstance
      .get<Paiement[]>("/payment/history")
      .then((response) => setPaiements(response.data ?? []))
      .catch(() => setError("Erreur lors du chargement des paiements."))
      .finally(() => setLoading(false));
  }, []);

  const completedCount = useMemo(
    () => paiements.filter((paiement) => isCompleted(paiement.statut)).length,
    [paiements],
  );

  const totalDepense = useMemo(
    () =>
      paiements
        .filter((paiement) => isCompleted(paiement.statut))
        .reduce((sum, paiement) => sum + paiement.montant, 0),
    [paiements],
  );

  const ceMois = useMemo(() => {
    const now = new Date();

    return paiements
      .filter((paiement) => {
        if (!isCompleted(paiement.statut)) return false;

        const date = new Date(paiement.createdAt);

        return (
          date.getMonth() === now.getMonth() &&
          date.getFullYear() === now.getFullYear()
        );
      })
      .reduce((sum, paiement) => sum + paiement.montant, 0);
  }, [paiements]);

  const filtered = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();

    return paiements
      .filter((paiement) => {
        if (filter === "completed") return isCompleted(paiement.statut);
        return true;
      })
      .filter((paiement) => {
        if (!query) return true;

        return (
          paiement.intituleOffre.toLowerCase().includes(query) ||
          paiement.typeAbonnement.toLowerCase().includes(query) ||
          formatStatut(paiement.statut).toLowerCase().includes(query)
        );
      })
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );
  }, [paiements, filter, searchTerm]);

  const downloadReceiptPdf = async (paiement: Paiement) => {
    if (!isCompleted(paiement.statut)) return;

    try {
      setDownloadingId(paiement.id);

      const response = await axiosInstance.get(
        `/payment/history/${paiement.id}/receipt`,
        {
          responseType: "blob",
        },
      );

      const blob = new Blob([response.data], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.download = `recu_${safeFileNamePart(
        paiement.intituleOffre,
      )}_${paiement.id.slice(0, 8)}.pdf`;

      document.body.appendChild(link);
      link.click();
      link.remove();

      URL.revokeObjectURL(url);
    } catch (downloadError) {
      console.error("Erreur téléchargement reçu :", downloadError);
      alert("Impossible de télécharger le reçu.");
    } finally {
      setDownloadingId(null);
    }
  };

  return (
    <div className="ui-page">
      <div className="mb-6">
        <h1 className="ui-title">Mes paiements</h1>
        <p className="ui-subtitle">
          Consultez vos paiements, statuts et reçus.
        </p>
        <div className="flex flex-wrap gap-2 mt-3">
          <span className="text-xs px-3 py-1 rounded-full bg-blue-100 text-blue-700 font-medium">
            ● {totalDepense.toFixed(2)} TND total
          </span>
          <span className="text-xs px-3 py-1 rounded-full bg-gray-100 text-gray-600 font-medium">
            {completedCount} complétés
          </span>
          <span className="text-xs px-3 py-1 rounded-full bg-blue-100 text-blue-700 font-medium">
            ● {ceMois.toFixed(2)} TND ce mois
          </span>
        </div>
      </div>

      {loading ? (
        <LoadingState heightClassName="min-h-40" />
      ) : error ? (
        <div className="text-center py-16 text-blue-500 text-sm">{error}</div>
      ) : paiements.length === 0 ? (
        <EmptyState title="Aucun paiement" />
      ) : (
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          <PaiementsFilters
            filter={filter}
            searchTerm={searchTerm}
            onFilterChange={setFilter}
            onSearchChange={setSearchTerm}
          />

          <PaiementsTable
            paiements={filtered}
            totalPaiements={paiements.length}
            downloadingId={downloadingId}
            onDownloadReceipt={(paiement) => void downloadReceiptPdf(paiement)}
          />
        </div>
      )}
    </div>
  );
}
