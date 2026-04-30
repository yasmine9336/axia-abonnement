import StatusBadge from "../../../../components/common/StatusBadge";
import UiCard from "../../../../components/common/UiCard";
import type { Paiement } from "../types";
import {
  avatarColor,
  formatTransactionDate,
  getInitials,
  getStatusBadge,
  isResponsableTxn,
  TRANSACTIONS_PAGE_SIZE,
  txnRef,
} from "../utils";

interface TransactionsTableProps {
  isAdmin: boolean;
  paiements: Paiement[];
  page: number;
  totalPages: number;
  filteredLength: number;
  totalFiltered: number;
  onPageChange: (page: number) => void;
}

export default function TransactionsTable({
  isAdmin,
  paiements,
  page,
  totalPages,
  filteredLength,
  totalFiltered,
  onPageChange,
}: TransactionsTableProps) {
  return (
    <UiCard className="p-0 overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-100">
            {[
              "Référence",
              "Date",
              "Client",
              "Offre / Service",
              "Type",
              "Montant",
              "Statut",
            ].map((header) => (
              <th
                key={header}
                className="text-left py-3 px-5 text-xs text-gray-400 font-medium uppercase tracking-wide"
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>

        <tbody className="divide-y divide-gray-50">
          {paiements.map((paiement, index) => {
            const badge = getStatusBadge(paiement.statut);
            const responsable = isResponsableTxn(paiement);
            const globalIndex = (page - 1) * TRANSACTIONS_PAGE_SIZE + index;

            return (
              <tr
                key={paiement.id}
                className="hover:bg-gray-50 transition-colors"
              >
                <td className="py-4 px-5">
                  <span className="text-(--color-primary) font-semibold text-xs">
                    {txnRef(globalIndex)}
                  </span>
                </td>

                <td className="py-4 px-5 text-gray-500 text-xs whitespace-nowrap">
                  {formatTransactionDate(paiement.createdAt)}
                </td>

                <td className="py-4 px-5">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${avatarColor(
                        paiement.clientUsername,
                      )}`}
                    >
                      {getInitials(paiement.clientUsername)}
                    </div>

                    <div>
                      <p className="font-semibold text-gray-900">
                        {paiement.clientUsername}
                      </p>

                      <p className="text-xs text-gray-400">
                        {paiement.clientEmail}
                      </p>
                    </div>
                  </div>
                </td>

                <td className="py-4 px-5 font-medium text-gray-900">
                  {paiement.intituleOffre}
                </td>

                <td className="py-4 px-5">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="bg-gray-100 text-gray-600 text-xs font-medium px-2.5 py-1 rounded-lg capitalize">
                      {paiement.typeAbonnement}
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
                  {paiement.montant.toFixed(2)} TND
                </td>

                <td className="py-4 px-5">
                  <StatusBadge label={badge.label} variant={badge.variant} />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {totalPages > 1 && (
        <div className="px-5 py-4 border-t border-gray-100 bg-gray-50 flex items-center justify-between">
          <p className="text-xs text-gray-500">
            Affichage de {(page - 1) * TRANSACTIONS_PAGE_SIZE + 1} à{" "}
            {Math.min(page * TRANSACTIONS_PAGE_SIZE, filteredLength)} sur{" "}
            {filteredLength} transaction(s)
          </p>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onPageChange(Math.max(1, page - 1))}
              disabled={page === 1}
              className="px-3 py-1.5 rounded-lg border border-gray-200 text-sm text-gray-600 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-white"
            >
              Précédent
            </button>

            <span className="text-sm text-gray-500">
              Page {page} sur {totalPages}
            </span>

            <button
              type="button"
              onClick={() => onPageChange(Math.min(totalPages, page + 1))}
              disabled={page === totalPages}
              className="px-3 py-1.5 rounded-lg border border-gray-200 text-sm text-gray-600 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-white"
            >
              Suivant
            </button>
          </div>
        </div>
      )}

      <div className="px-5 py-3 border-t border-gray-100 bg-gray-50 flex items-center justify-between">
        <p className="text-xs text-gray-500">
          {filteredLength} transaction(s) filtrée(s)
        </p>

        <p className="text-sm font-semibold text-gray-900">
          Total complété :{" "}
          <span className="text-green-600">
            {totalFiltered.toFixed(2)} TND
          </span>
        </p>
      </div>
    </UiCard>
  );
}