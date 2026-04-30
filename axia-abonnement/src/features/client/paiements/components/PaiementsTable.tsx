import { Download } from "lucide-react";
import type { Paiement } from "../types";
import { formatDateFR, formatStatut, isCompleted, statutBadge } from "../utils";

interface PaiementsTableProps {
  paiements: Paiement[];
  totalPaiements: number;
  downloadingId: string | null;
  onDownloadReceipt: (paiement: Paiement) => void;
}

export default function PaiementsTable({
  paiements,
  totalPaiements,
  downloadingId,
  onDownloadReceipt,
}: PaiementsTableProps) {
  return (
    <>
      <div className="w-full overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100">
              {[
                "Service / Offre",
                "Date",
                "Période",
                "Montant",
                "Statut",
                "Reçu",
              ].map((header, index) => (
                <th
                  key={header}
                  className={`text-xs text-gray-400 font-medium uppercase tracking-wide px-5 py-3 ${
                    index === 3
                      ? "text-right"
                      : index === 5
                        ? "text-center w-40"
                        : "text-left"
                  }`}
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-50">
            {paiements.map((paiement) => {
              const canDownload = isCompleted(paiement.statut);
              const isDownloading = downloadingId === paiement.id;

              return (
                <tr
                  key={paiement.id}
                  className="hover:bg-gray-50 transition-colors"
                >
                  <td className="px-5 py-4">
                    <div className="font-semibold text-gray-900">
                      {paiement.intituleOffre}
                    </div>

                    <div className="text-xs text-gray-400">
                      {paiement.id.slice(0, 8).toUpperCase()}
                    </div>
                  </td>

                  <td className="px-5 py-4 text-gray-500 text-xs">
                    {formatDateFR(paiement.createdAt)}
                  </td>

                  <td className="px-5 py-4 text-gray-600 capitalize">
                    {paiement.typeAbonnement}
                  </td>

                  <td className="px-5 py-4 text-right font-bold text-gray-900 whitespace-nowrap">
                    {paiement.montant.toFixed(2)} TND
                  </td>

                  <td className="px-5 py-4">
                    <span
                      className={`text-xs font-semibold px-2.5 py-1 rounded-full ${statutBadge(
                        paiement.statut,
                      )}`}
                    >
                      {formatStatut(paiement.statut)}
                    </span>
                  </td>

                  <td className="px-4 py-4 text-center w-40">
                    <button
                      type="button"
                      onClick={() => onDownloadReceipt(paiement)}
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

        {paiements.length === 0 && (
          <div className="text-center py-12 text-gray-400 text-sm">
            Aucun résultat
          </div>
        )}
      </div>

      <div className="px-5 py-3 border-t border-gray-100 bg-gray-50">
        <p className="text-xs text-gray-500">
          Affichage de {paiements.length} sur {totalPaiements} transaction
          {totalPaiements !== 1 ? "s" : ""}
        </p>
      </div>
    </>
  );
}