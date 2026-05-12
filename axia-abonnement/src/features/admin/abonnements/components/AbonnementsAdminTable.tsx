import EmptyState from "../../../../components/common/EmptyState";
import LoadingState from "../../../../components/common/LoadingState";
import Pagination from "../../../../components/common/Pagination";
import type { Abonnement } from "../types";
import {
  avatarColor,
  capitalize,
  formatDate,
  getInitials,
  normalizeStatusLabel,
} from "../utils";

interface AbonnementsAdminTableProps {
  abonnements: Abonnement[];
  loading: boolean;
  totalItems: number;
  currentPage: number;
  totalPages: number;
  pageSize: number;
  onPageChange: (page: number) => void;
}

export default function AbonnementsAdminTable({
  abonnements,
  loading,
  totalItems,
  currentPage,
  totalPages,
  pageSize,
  onPageChange,
}: AbonnementsAdminTableProps) {
  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-gray-200 p-0 overflow-hidden">
        <LoadingState heightClassName="h-40" />
      </div>
    );
  }

  if (totalItems === 0) {
    return <EmptyState title="Aucun abonnement trouvé" />;
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-0 overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-100">
            {[
              "Client",
              "Responsable",
              "Offre / Service",
              "Période",
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
          {abonnements.map((abonnement) => (
            <tr
              key={abonnement.id}
              className="hover:bg-gray-50 transition-colors"
            >
              <td className="py-4 px-5">
                <div className="flex items-center gap-2">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${avatarColor(
                      abonnement.clientUsername,
                    )}`}
                  >
                    {getInitials(abonnement.clientUsername)}
                  </div>

                  <div>
                    <p className="font-semibold text-gray-900">
                      {abonnement.clientUsername}
                    </p>

                    <p className="text-xs text-gray-400">
                      {abonnement.clientEmail}
                    </p>
                  </div>
                </div>
              </td>

              <td className="py-4 px-5 text-gray-600">
                {abonnement.responsableUsername ?? "—"}
              </td>

              <td className="py-4 px-5">
                <span className="text-(--color-primary) font-medium">
                  {abonnement.intituleOffre}
                </span>
              </td>

              <td className="py-4 px-5 text-gray-500 text-xs whitespace-nowrap">
                {formatDate(abonnement.dateDebut)} →{" "}
                {formatDate(abonnement.dateFin)}
              </td>

              <td className="py-4 px-5">
                <span className="bg-gray-100 text-gray-600 text-xs font-medium px-2.5 py-1 rounded-lg">
                  {capitalize(abonnement.type)}
                </span>
              </td>

              <td className="py-4 px-5 font-semibold text-gray-900 whitespace-nowrap">
                {abonnement.montant} TND
              </td>

              <td className="py-4 px-5">
                <div className="flex items-center gap-2">
                  <span
                    className={`text-xs font-semibold ${
                      abonnement.statut === "actif"
                        ? "text-blue-600"
                        : abonnement.statut === "expiré"
                          ? "text-blue-500"
                          : "text-amber-600"
                    }`}
                  >
                    {normalizeStatusLabel(abonnement.statut)}
                  </span>

                  <div
                    className={`w-8 h-1.5 rounded-full ${
                      abonnement.statut === "actif"
                        ? "bg-blue-200"
                        : abonnement.statut === "expiré"
                          ? "bg-blue-200"
                          : "bg-amber-200"
                    }`}
                  >
                    <div
                      className={`h-full rounded-full ${
                        abonnement.statut === "actif"
                          ? "bg-blue-500 w-full"
                          : abonnement.statut === "expiré"
                            ? "bg-blue-400 w-1/3"
                            : "bg-blue-300 w-2/3"
                      }`}
                    />
                  </div>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={totalItems}
        pageSize={pageSize}
        itemLabel="abonnement(s)"
        onPageChange={onPageChange}
      />
    </div>
  );
}