import { MailCheck } from "lucide-react";
import EmptyState from "../../../../components/common/EmptyState";
import Pagination from "../../../../components/common/Pagination";
import SearchInput from "../../../../components/common/SearchInput";
import type { Demande } from "../types";
import { formatDate } from "../utils";

interface RenouvellementRequestsListProps {
  enAttenteCount: number;
  demandes: Demande[];
  filteredCount: number;
  searchDemande: string;
  currentPage: number;
  totalPages: number;
  pageSize: number;
  submittingDemandeId: string | null;
  onSearchChange: (value: string) => void;
  onAccept: (id: string) => void;
  onReject: (id: string) => void;
  onPageChange: (page: number) => void;
}

export default function RenouvellementRequestsList({
  enAttenteCount,
  demandes,
  filteredCount,
  searchDemande,
  currentPage,
  totalPages,
  pageSize,
  submittingDemandeId,
  onSearchChange,
  onAccept,
  onReject,
  onPageChange,
}: RenouvellementRequestsListProps) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-6">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 mb-4">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-semibold text-gray-800">
            Demandes de renouvellement
          </h2>

          {enAttenteCount > 0 && (
            <span className="bg-blue-50 text-blue-600 text-xs font-semibold px-2.5 py-0.5 rounded-full">
              {enAttenteCount}
            </span>
          )}
        </div>

        {enAttenteCount > 0 && (
          <SearchInput
            value={searchDemande}
            onChange={onSearchChange}
            placeholder="Rechercher une demande..."
            className="w-full lg:w-90 flex-none"
          />
        )}
      </div>

      {enAttenteCount === 0 ? (
        <EmptyState
          icon={
            <div className="mx-auto w-10 h-10 rounded-2xl flex items-center justify-center bg-(--color-primary-soft)">
              <MailCheck className="w-5 h-5 text-(--color-primary)" />
            </div>
          }
          title="Aucune demande en attente"
          description="Les nouvelles demandes apparaîtront ici."
        />
      ) : filteredCount === 0 ? (
        <EmptyState title="Aucune demande ne correspond à votre recherche." />
      ) : (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
            {demandes.map((demande) => (
              <div
                key={demande.id}
                className="rounded-2xl border border-blue-200 bg-blue-50/30 p-5"
              >
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-semibold text-gray-900">
                        {demande.clientUsername}
                      </p>

                      <span className="text-xs text-gray-400">
                        {demande.clientEmail}
                      </span>
                    </div>

                    <p className="text-sm text-gray-600">
                      Offre :{" "}
                      <span className="font-medium text-gray-900">
                        {demande.intituleOffre}
                      </span>
                    </p>

                    <p className="text-sm text-gray-600">
                      Type :{" "}
                      <span className="capitalize font-medium">
                        {demande.type}
                      </span>
                      {" · "}Montant :{" "}
                      <span className="font-medium">{demande.montant} TND</span>
                    </p>

                    <p className="text-xs text-gray-400">
                      Envoyée le {formatDate(demande.createdAt)}
                    </p>
                  </div>

                  <div className="flex gap-2 shrink-0">
                    <button
                      type="button"
                      disabled={submittingDemandeId === demande.id}
                      onClick={() => onAccept(demande.id)}
                      className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold disabled:opacity-60"
                    >
                      Accepter
                    </button>

                    <button
                      type="button"
                      disabled={submittingDemandeId === demande.id}
                      onClick={() => onReject(demande.id)}
                      className="px-3 py-2 border border-blue-200 text-blue-600 hover:bg-blue-50 rounded-xl text-xs font-semibold disabled:opacity-60"
                    >
                      Refuser
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={filteredCount}
            pageSize={pageSize}
            itemLabel="demande(s)"
            onPageChange={onPageChange}
          />
        </>
      )}
    </div>
  );
}
