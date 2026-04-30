import { Calendar, Search } from "lucide-react";
import ExportButton from "../../../../components/common/ExportButton";
import UiCard from "../../../../components/common/UiCard";
import { formatDateFR } from "../../../../utils/exportUtils";
import type {
  CountsBySource,
  CountsByStatus,
  Paiement,
  SourceFilter,
  StatusFilter,
} from "../types";

interface TransactionsFiltersProps {
  isAdmin: boolean;
  filtered: Paiement[];
  searchTerm: string;
  filterDate: string;
  filterSource: SourceFilter;
  filterStatus: StatusFilter;
  countsBySource: CountsBySource;
  countsByStatus: CountsByStatus;
  hasFilters: boolean;
  onSearchChange: (value: string) => void;
  onDateChange: (value: string) => void;
  onSourceChange: (value: SourceFilter) => void;
  onStatusChange: (value: StatusFilter) => void;
  onResetFilters: () => void;
}

export default function TransactionsFilters({
  isAdmin,
  filtered,
  searchTerm,
  filterDate,
  filterSource,
  filterStatus,
  countsBySource,
  countsByStatus,
  hasFilters,
  onSearchChange,
  onDateChange,
  onSourceChange,
  onStatusChange,
  onResetFilters,
}: TransactionsFiltersProps) {
  return (
    <UiCard className="p-4 mb-4">
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {isAdmin ? (
            <div className="flex items-center gap-3">
              <span className="text-sm font-semibold text-gray-700">
                Type de transactions
              </span>

              <div className="flex items-center gap-1 bg-gray-100 rounded-xl p-1">
                {(["tous", "clients", "responsables"] as const).map((type) => {
                  const count =
                    type === "tous"
                      ? countsBySource.total
                      : type === "clients"
                        ? countsBySource.clients
                        : countsBySource.responsables;

                  return (
                    <button
                      key={type}
                      type="button"
                      onClick={() => onSourceChange(type)}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                        filterSource === type
                          ? "bg-white text-(--color-primary) shadow-sm"
                          : "text-gray-500 hover:text-gray-700"
                      }`}
                    >
                      {type === "tous"
                        ? "Tous"
                        : type === "clients"
                          ? "Clients"
                          : "Responsables"}{" "}
                      <span className="ml-1 text-xs font-semibold">
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          ) : (
            <span className="text-sm font-semibold text-gray-700">
              Liste des paiements reçus
            </span>
          )}

          <ExportButton
            data={filtered}
            columns={[
              {
                key: "createdAt",
                label: "Date",
                format: (value) => formatDateFR(String(value)),
              },
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

        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-72">
            <Search
              className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
              size={16}
            />

            <input
              type="text"
              placeholder="Rechercher par client, email, type ou offre..."
              className="ui-input pl-11! pr-4"
              value={searchTerm}
              onChange={(event) => onSearchChange(event.target.value)}
            />
          </div>

          <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 h-10">
            <Calendar size={14} className="text-gray-400" />

            <input
              type="date"
              className="text-sm text-gray-600 bg-transparent outline-none"
              value={filterDate}
              onChange={(event) => onDateChange(event.target.value)}
            />

            {filterDate && (
              <button
                type="button"
                onClick={() => onDateChange("")}
                className="text-gray-400 hover:text-gray-600 text-xs ml-1"
              >
                ✕
              </button>
            )}
          </div>

          <select
            value={filterStatus}
            onChange={(event) =>
              onStatusChange(event.target.value as StatusFilter)
            }
            className="h-10 min-w-44 rounded-xl border border-gray-200 bg-white px-3 text-sm text-gray-700 outline-none focus:border-(--color-primary)"
          >
            <option value="tous">Tous les statuts</option>
            <option value="completed">
              Complétés ({countsByStatus.completed})
            </option>
            <option value="pending">
              En attente ({countsByStatus.pending})
            </option>
            <option value="failed">Échoués ({countsByStatus.failed})</option>
          </select>

          {hasFilters && (
            <button
              type="button"
              onClick={onResetFilters}
              className="h-10 px-3 rounded-xl border border-gray-200 text-sm font-medium text-(--color-primary) hover:bg-gray-50"
            >
              Réinitialiser
            </button>
          )}
        </div>
      </div>
    </UiCard>
  );
}