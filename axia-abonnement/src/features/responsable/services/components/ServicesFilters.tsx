import SearchInput from "../../../../components/common/SearchInput";
import ExportButton from "../../../../components/common/ExportButton";
import type {
  AbonnesFilter,
  OffersFilter,
  Service,
  StatusFilter,
} from "../types";

interface ServicesFiltersProps {
  services: Service[];
  filteredServices: Service[];
  activeCount: number;
  inactiveCount: number;
  searchTerm: string;
  statusFilter: StatusFilter;
  abonnesFilter: AbonnesFilter;
  offersFilter: OffersFilter;
  hasFilters: boolean;
  onSearchChange: (value: string) => void;
  onStatusChange: (value: StatusFilter) => void;
  onAbonnesFilterChange: (value: AbonnesFilter) => void;
  onOffersFilterChange: (value: OffersFilter) => void;
  onResetFilters: () => void;
  onCreate: () => void;
}

export default function ServicesFilters({
  services,
  filteredServices,
  activeCount,
  inactiveCount,
  searchTerm,
  statusFilter,
  abonnesFilter,
  offersFilter,
  hasFilters,
  onSearchChange,
  onStatusChange,
  onAbonnesFilterChange,
  onOffersFilterChange,
  onResetFilters,
  onCreate,
}: ServicesFiltersProps) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-6">
      <div className="flex flex-col gap-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <h2 className="text-lg font-bold text-gray-900">
            Tous les services ({filteredServices.length})
          </h2>

          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <button
              type="button"
              onClick={onCreate}
              className="ui-btn-primary flex items-center justify-center gap-2 px-4 py-2.5"
            >
              + Ajouter un service
            </button>

            <ExportButton
              data={filteredServices}
              columns={[
                { key: "intituleService", label: "Intitulé" },
                { key: "description", label: "Description" },
                { key: "parMois", label: "Prix/mois (TND)" },
                { key: "parAnnee", label: "Prix/an (TND)" },
                { key: "nbAbonnes", label: "Abonnés" },
                { key: "nbOffres", label: "Offres liées" },
                { key: "creePar", label: "Créé par" },
                {
                  key: "isActive",
                  label: "Statut",
                  format: (value) => (value ? "Actif" : "Inactif"),
                },
              ]}
              filename="services"
              label="Exporter"
              sheetName="Services"
              pdfTitle="Liste des services"
            />
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="inline-flex bg-gray-50 border border-gray-200 rounded-xl p-1">
            {(["tous", "actif", "inactif"] as const).map((status) => {
              const active = statusFilter === status;

              const count =
                status === "tous"
                  ? services.length
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
                      ? "Actifs"
                      : "Inactifs"}

                  <span className="ml-1 text-xs font-semibold">{count}</span>
                </button>
              );
            })}
          </div>

          <SearchInput
            value={searchTerm}
            onChange={onSearchChange}
            placeholder="Rechercher par service, description ou créateur..."
          />

          <select
            value={abonnesFilter}
            onChange={(event) =>
              onAbonnesFilterChange(event.target.value as AbonnesFilter)
            }
            className="h-10 min-w-44 rounded-xl border border-gray-200 bg-white px-3 text-sm text-gray-700 outline-none focus:border-(--color-primary)"
          >
            <option value="all">Tous les abonnés</option>
            <option value="withAbonnes">Avec abonnés</option>
            <option value="withoutAbonnes">Sans abonné</option>
          </select>

          <select
            value={offersFilter}
            onChange={(event) =>
              onOffersFilterChange(event.target.value as OffersFilter)
            }
            className="h-10 min-w-44 rounded-xl border border-gray-200 bg-white px-3 text-sm text-gray-700 outline-none focus:border-(--color-primary)"
          >
            <option value="all">Toutes les liaisons</option>
            <option value="withOffers">Liés à une offre</option>
            <option value="withoutOffers">Sans offre liée</option>
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
