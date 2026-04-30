import { Filter } from "lucide-react";
import ExportButton from "../../../../components/common/ExportButton";
import SearchInput from "../../../../components/common/SearchInput";
import type { Client, FilterTab } from "../types";
import { formatDate } from "../utils";

interface ArchiveAdminFiltersProps {
  clients: Client[];
  filtered: Client[];
  filterStatut: FilterTab;
  searchTerm: string;
  responsableFilter: string;
  abonnementFilter: string;
  responsablesOptions: string[];
  abonnementsOptions: string[];
  totalActifs: number;
  totalInactifs: number;
  hasAdvancedFilters: boolean;
  onFilterStatutChange: (value: FilterTab) => void;
  onSearchChange: (value: string) => void;
  onResponsableFilterChange: (value: string) => void;
  onAbonnementFilterChange: (value: string) => void;
  onResetAdvancedFilters: () => void;
}

export default function ArchiveAdminFilters({
  clients,
  filtered,
  filterStatut,
  searchTerm,
  responsableFilter,
  abonnementFilter,
  responsablesOptions,
  abonnementsOptions,
  totalActifs,
  totalInactifs,
  hasAdvancedFilters,
  onFilterStatutChange,
  onSearchChange,
  onResponsableFilterChange,
  onAbonnementFilterChange,
  onResetAdvancedFilters,
}: ArchiveAdminFiltersProps) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-4 mb-4">
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-1 bg-gray-100 rounded-xl p-1">
          {(["tous", "actif", "inactif"] as const).map((tab) => {
            const count =
              tab === "tous"
                ? clients.length
                : tab === "actif"
                  ? totalActifs
                  : totalInactifs;

            return (
              <button
                key={tab}
                type="button"
                onClick={() => onFilterStatutChange(tab)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  filterStatut === tab
                    ? "bg-white text-(--color-primary) shadow-sm"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                {tab === "tous" ? "Tous" : tab === "actif" ? "Actifs" : "Inactifs"}
                <span className="ml-1 text-xs font-semibold">{count}</span>
              </button>
            );
          })}
        </div>

        <SearchInput
          value={searchTerm}
          onChange={onSearchChange}
          placeholder="Rechercher par nom, email, responsable ou offre..."
          className="min-w-48"
        />

        <ExportButton
          data={filtered}
          columns={[
            { key: "username", label: "Client" },
            { key: "email", label: "Email" },
            { key: "phoneNumber", label: "Téléphone" },
            { key: "responsableUsername", label: "Responsable" },
            { key: "abonnementActif", label: "Abonnement actif" },
            { key: "montantActif", label: "Montant (TND)" },
            { key: "statutAbonnement", label: "Statut" },
            {
              key: "createdAt",
              label: "Membre depuis",
              format: (value: unknown) => formatDate(String(value ?? "")),
            },
          ]}
          filename="clients"
          label="Exporter clients"
          sheetName="Clients"
          pdfTitle="Archive clients"
        />
      </div>

      <div className="mt-3 pt-3 border-t border-gray-100">
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-2 mr-1">
            <Filter size={15} className="text-gray-400" />
            <span className="text-sm font-semibold text-gray-700">
              Filtres
            </span>
          </div>

          <select
            value={responsableFilter}
            onChange={(event) =>
              onResponsableFilterChange(event.target.value)
            }
            className="h-9 min-w-48 rounded-xl border border-gray-200 bg-white px-3 text-sm text-gray-700 outline-none focus:border-(--color-primary)"
          >
            <option value="all">Tous les responsables</option>
            <option value="none">Sans responsable</option>

            {responsablesOptions.map((responsable) => (
              <option key={responsable} value={responsable}>
                {responsable}
              </option>
            ))}
          </select>

          <select
            value={abonnementFilter}
            onChange={(event) =>
              onAbonnementFilterChange(event.target.value)
            }
            className="h-9 min-w-48 rounded-xl border border-gray-200 bg-white px-3 text-sm text-gray-700 outline-none focus:border-(--color-primary)"
          >
            <option value="all">Tous les abonnements</option>
            <option value="none">Sans abonnement</option>

            {abonnementsOptions.map((abonnement) => (
              <option key={abonnement} value={abonnement}>
                {abonnement}
              </option>
            ))}
          </select>

          {hasAdvancedFilters && (
            <button
              type="button"
              onClick={onResetAdvancedFilters}
              className="h-9 px-3 rounded-xl border border-gray-200 text-sm font-medium text-(--color-primary) hover:bg-gray-50"
            >
              Réinitialiser
            </button>
          )}
        </div>
      </div>
    </div>
  );
}