import { Filter } from "lucide-react";
import SearchInput from "../../../../components/common/SearchInput";

interface CatalogueAdminFiltersProps {
  searchTerm: string;
  createdByFilter: string;
  creators: string[];
  hasFilters: boolean;
  onSearchChange: (value: string) => void;
  onCreatedByFilterChange: (value: string) => void;
  onResetFilters: () => void;
}

export default function CatalogueAdminFilters({
  searchTerm,
  createdByFilter,
  creators,
  hasFilters,
  onSearchChange,
  onCreatedByFilterChange,
  onResetFilters,
}: CatalogueAdminFiltersProps) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-4 mb-6">
      <div className="flex flex-wrap items-center gap-3">
        <SearchInput
          value={searchTerm}
          onChange={onSearchChange}
          placeholder="Rechercher par service, offre, description ou créateur..."
        />

        <div className="flex items-center gap-2">
          <Filter size={16} className="text-gray-400" />

          <select
            value={createdByFilter}
            onChange={(event) => onCreatedByFilterChange(event.target.value)}
            className="h-10 min-w-56 rounded-xl border border-gray-200 bg-white px-3 text-sm text-gray-700 outline-none focus:border-(--color-primary)"
          >
            <option value="all">Tous les créateurs</option>

            {creators.map((creator) => (
              <option key={creator} value={creator}>
                {creator}
              </option>
            ))}
          </select>
        </div>

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
  );
}