import SearchInput from "../../../../components/common/SearchInput";
import ExportButton from "../../../../components/common/ExportButton";
import type { AbonnesFilter, Offre, StatusFilter } from "../types";

interface OffresFiltersProps {
  offres: Offre[];
  filteredOffres: Offre[];
  activeCount: number;
  inactiveCount: number;
  searchTerm: string;
  statusFilter: StatusFilter;
  abonnesFilter: AbonnesFilter;
  hasFilters: boolean;
  onSearchChange: (value: string) => void;
  onStatusChange: (value: StatusFilter) => void;
  onAbonnesFilterChange: (value: AbonnesFilter) => void;
  onResetFilters: () => void;
  onCreate: () => void;
}

export default function OffresFilters({
  offres,
  filteredOffres,
  activeCount,
  inactiveCount,
  searchTerm,
  statusFilter,
  abonnesFilter,
  hasFilters,
  onSearchChange,
  onStatusChange,
  onAbonnesFilterChange,
  onResetFilters,
  onCreate,
}: OffresFiltersProps) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-6">
      <div className="flex flex-col gap-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <h2 className="text-lg font-bold text-gray-900">
            Toutes les offres ({filteredOffres.length})
          </h2>

          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <button
              type="button"
              onClick={onCreate}
              className="ui-btn-primary flex items-center justify-center gap-2 px-4 py-2.5"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 4.5v15m7.5-7.5h-15"
                />
              </svg>
              Ajouter une offre
            </button>

            <ExportButton
              data={filteredOffres}
              columns={[
                { key: "intituleOffre", label: "Intitulé" },
                { key: "description", label: "Description" },
                { key: "dureeEnMois", label: "Durée (mois)" },
                { key: "prix", label: "Prix (TND)" },
                { key: "nbAbonnes", label: "Abonnés" },
                {
                  key: "services",
                  label: "Services inclus",
                  format: (value) =>
                    Array.isArray(value) ? value.join(", ") : "",
                },
                { key: "creePar", label: "Créé par" },
                {
                  key: "isActive",
                  label: "Statut",
                  format: (value) => (value ? "Active" : "Inactive"),
                },
              ]}
              filename="offres"
              label="Exporter"
              sheetName="Offres"
              pdfTitle="Liste des offres"
            />
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="inline-flex bg-gray-50 border border-gray-200 rounded-xl p-1">
            {(["tous", "actif", "inactif"] as const).map((status) => {
              const active = statusFilter === status;

              const count =
                status === "tous"
                  ? offres.length
                  : status === "actif"
                    ? activeCount
                    : inactiveCount;

              return (
                <button
                  key={status}
                  type="button"
                  onClick={() => onStatusChange(status)}
                  className={`px-3 py-2 text-sm rounded-lg font-medium transition ${
                    active
                      ? "bg-white shadow-sm text-(--color-primary)"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  {status === "tous"
                    ? "Tous"
                    : status === "actif"
                      ? "Actives"
                      : "Inactives"}

                  <span className="ml-1 text-xs font-semibold">{count}</span>
                </button>
              );
            })}
          </div>

          <SearchInput
            value={searchTerm}
            onChange={onSearchChange}
            placeholder="Rechercher par offre, description, service ou créateur..."
          />

          <select
            value={abonnesFilter}
            onChange={(e) =>
              onAbonnesFilterChange(e.target.value as AbonnesFilter)
            }
            className="h-10 min-w-44 rounded-xl border border-gray-200 bg-white px-3 text-sm text-gray-700 outline-none focus:border-(--color-primary)"
          >
            <option value="all">Tous les abonnés</option>
            <option value="withAbonnes">Avec abonnés</option>
            <option value="withoutAbonnes">Sans abonné</option>
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
    </div>
  );
}
