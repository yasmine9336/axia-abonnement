import ExportButton from "../../../../components/common/ExportButton";
import SearchInput from "../../../../components/common/SearchInput";
import { formatDateFR } from "../../../../utils/exportUtils";
import type { Abonnement, AbonnementTab, ExpirationFilter } from "../types";

interface AbonnementsFiltersProps {
  filteredAbos: Abonnement[];
  tab: AbonnementTab;
  tabCounts: {
    actifs: number;
    expires: number;
  };
  searchAbo: string;
  typeFilter: string;
  typeOptions: string[];
  expirationFilter: ExpirationFilter;
  hasHistoryFilters: boolean;
  onTabChange: (value: AbonnementTab) => void;
  onSearchChange: (value: string) => void;
  onTypeFilterChange: (value: string) => void;
  onExpirationFilterChange: (value: ExpirationFilter) => void;
  onResetFilters: () => void;
}

export default function AbonnementsFilters({
  filteredAbos,
  tab,
  tabCounts,
  searchAbo,
  typeFilter,
  typeOptions,
  expirationFilter,
  hasHistoryFilters,
  onTabChange,
  onSearchChange,
  onTypeFilterChange,
  onExpirationFilterChange,
  onResetFilters,
}: AbonnementsFiltersProps) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-6">
      <div className="flex flex-col gap-4">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
          <h2 className="text-lg font-semibold text-gray-800">
            Historique des abonnements
          </h2>

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
                  format: (value: unknown) =>
                    formatDateFR(String(value ?? "")),
                },
                {
                  key: "dateFin",
                  label: "Fin",
                  format: (value: unknown) =>
                    formatDateFR(String(value ?? "")),
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

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1 bg-gray-100 rounded-xl p-1">
            {(["actifs", "expires"] as const).map((item) => {
              const count =
                item === "actifs" ? tabCounts.actifs : tabCounts.expires;

              return (
                <button
                  key={item}
                  type="button"
                  onClick={() => onTabChange(item)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    tab === item
                      ? "bg-white shadow-sm text-(--color-primary)"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  {item === "actifs" ? "Actifs" : "Expirés"}{" "}
                  <span className="ml-1 text-xs font-semibold">{count}</span>
                </button>
              );
            })}
          </div>

          <SearchInput
            value={searchAbo}
            onChange={onSearchChange}
            placeholder="Rechercher par client, email, type ou offre..."
            className="min-w-72"
          />

          <select
            value={typeFilter}
            onChange={(event) => onTypeFilterChange(event.target.value)}
            className="h-10 min-w-40 rounded-xl border border-gray-200 bg-white px-3 text-sm text-gray-700 outline-none focus:border-(--color-primary)"
          >
            <option value="all">Tous les types</option>

            {typeOptions.map((type) => (
              <option key={type} value={type}>
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </option>
            ))}
          </select>

          {tab === "actifs" && (
            <select
              value={expirationFilter}
              onChange={(event) =>
                onExpirationFilterChange(
                  event.target.value as ExpirationFilter,
                )
              }
              className="h-10 min-w-44 rounded-xl border border-gray-200 bg-white px-3 text-sm text-gray-700 outline-none focus:border-(--color-primary)"
            >
              <option value="all">Toutes les échéances</option>
              <option value="7days">Expire dans 7 jours</option>
              <option value="30days">Expire dans 30 jours</option>
            </select>
          )}

          {hasHistoryFilters && (
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
    </div>
  );
}