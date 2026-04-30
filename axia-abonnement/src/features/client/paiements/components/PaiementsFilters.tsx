import SearchInput from "../../../../components/common/SearchInput";
import type { FilterKey } from "../types";

interface PaiementsFiltersProps {
  filter: FilterKey;
  searchTerm: string;
  onFilterChange: (value: FilterKey) => void;
  onSearchChange: (value: string) => void;
}

export default function PaiementsFilters({
  filter,
  searchTerm,
  onFilterChange,
  onSearchChange,
}: PaiementsFiltersProps) {
  return (
    <div className="px-5 py-4 border-b border-gray-100 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
      <h2 className="text-sm font-semibold text-gray-900 no-underline">
        Tous les paiements
      </h2>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="inline-flex bg-gray-100 rounded-xl p-1">
          <button
            type="button"
            onClick={() => onFilterChange("all")}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition ${
              filter === "all"
                ? "bg-white shadow-sm text-(--color-primary)"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Tous
          </button>

          <button
            type="button"
            onClick={() => onFilterChange("completed")}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition ${
              filter === "completed"
                ? "bg-white shadow-sm text-(--color-primary)"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Complétées
          </button>
        </div>

        <SearchInput
          value={searchTerm}
          onChange={onSearchChange}
          placeholder="Rechercher..."
          className="w-full sm:w-72"
        />
      </div>
    </div>
  );
}