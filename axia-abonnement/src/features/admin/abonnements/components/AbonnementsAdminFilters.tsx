import { Filter } from "lucide-react";
import ExportButton from "../../../../components/common/ExportButton";
import SearchInput from "../../../../components/common/SearchInput";
import { formatDateFR } from "../../../../utils/exportUtils";
import type { Abonnement, ExpirationFilter, FilterTab } from "../types";
import { capitalize } from "../utils";

interface AbonnementsAdminFiltersProps {
  abonnements: Abonnement[];
  filtered: Abonnement[];
  tab: FilterTab;
  searchTerm: string;
  responsableFilter: string;
  offreFilter: string;
  typeFilter: string;
  expirationFilter: ExpirationFilter;
  responsablesOptions: string[];
  offresOptions: string[];
  typesOptions: string[];
  totalActifs: number;
  totalExpires: number;
  totalEnAttente: number;
  hasAdvancedFilters: boolean;
  onTabChange: (tab: FilterTab) => void;
  onSearchChange: (value: string) => void;
  onResponsableFilterChange: (value: string) => void;
  onOffreFilterChange: (value: string) => void;
  onTypeFilterChange: (value: string) => void;
  onExpirationFilterChange: (value: ExpirationFilter) => void;
  onResetAdvancedFilters: () => void;
}

export default function AbonnementsAdminFilters({
  abonnements,
  filtered,
  tab,
  searchTerm,
  responsableFilter,
  offreFilter,
  typeFilter,
  expirationFilter,
  responsablesOptions,
  offresOptions,
  typesOptions,
  totalActifs,
  totalExpires,
  totalEnAttente,
  hasAdvancedFilters,
  onTabChange,
  onSearchChange,
  onResponsableFilterChange,
  onOffreFilterChange,
  onTypeFilterChange,
  onExpirationFilterChange,
  onResetAdvancedFilters,
}: AbonnementsAdminFiltersProps) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-4 mb-4">
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-1 bg-gray-100 rounded-xl p-1">
          {(["tous", "actifs", "expirés", "en_attente"] as FilterTab[]).map(
            (item) => {
              const count =
                item === "tous"
                  ? abonnements.length
                  : item === "actifs"
                    ? totalActifs
                    : item === "expirés"
                      ? totalExpires
                      : totalEnAttente;

              return (
                <button
                  key={item}
                  type="button"
                  onClick={() => onTabChange(item)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    tab === item
                      ? "bg-white text-(--color-primary) shadow-sm"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  {item === "en_attente" ? "En attente" : capitalize(item)}
                  <span className="ml-1 text-xs font-semibold">{count}</span>
                </button>
              );
            },
          )}
        </div>

        <SearchInput
          value={searchTerm}
          onChange={onSearchChange}
          placeholder="Rechercher par client, responsable ou offre..."
          className="min-w-48"
        />

        <ExportButton
          data={filtered}
          columns={[
            { key: "clientUsername", label: "Client" },
            { key: "clientEmail", label: "Email" },
            { key: "responsableUsername", label: "Responsable" },
            { key: "intituleOffre", label: "Offre / Service" },
            { key: "type", label: "Type" },
            { key: "montant", label: "Montant (TND)" },
            {
              key: "dateDebut",
              label: "Date début",
              format: (value: unknown) => formatDateFR(String(value ?? "")),
            },
            {
              key: "dateFin",
              label: "Date fin",
              format: (value: unknown) => formatDateFR(String(value ?? "")),
            },
            { key: "statut", label: "Statut" },
          ]}
          filename="abonnements"
          label="Exporter"
          sheetName="Abonnements"
          pdfTitle="Abonnements globaux"
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
            className="h-9 min-w-44 rounded-xl border border-gray-200 bg-white px-3 text-sm text-gray-700 outline-none focus:border-(--color-primary)"
          >
            <option value="all">Tous les responsables</option>
            {responsablesOptions.map((responsable) => (
              <option key={responsable} value={responsable}>
                {responsable}
              </option>
            ))}
          </select>

          <select
            value={offreFilter}
            onChange={(event) => onOffreFilterChange(event.target.value)}
            className="h-9 min-w-48 rounded-xl border border-gray-200 bg-white px-3 text-sm text-gray-700 outline-none focus:border-(--color-primary)"
          >
            <option value="all">Toutes les offres/services</option>
            {offresOptions.map((offre) => (
              <option key={offre} value={offre}>
                {offre}
              </option>
            ))}
          </select>

          <select
            value={typeFilter}
            onChange={(event) => onTypeFilterChange(event.target.value)}
            className="h-9 min-w-36 rounded-xl border border-gray-200 bg-white px-3 text-sm text-gray-700 outline-none focus:border-(--color-primary)"
          >
            <option value="all">Tous les types</option>
            {typesOptions.map((type) => (
              <option key={type} value={type}>
                {capitalize(type)}
              </option>
            ))}
          </select>

          <select
            value={expirationFilter}
            onChange={(event) =>
              onExpirationFilterChange(event.target.value as ExpirationFilter)
            }
            className="h-9 min-w-44 rounded-xl border border-gray-200 bg-white px-3 text-sm text-gray-700 outline-none focus:border-(--color-primary)"
          >
            <option value="all">Toutes les expirations</option>
            <option value="7days">Expire dans 7 jours</option>
            <option value="30days">Expire dans 30 jours</option>
            <option value="expired">Déjà expirés</option>
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