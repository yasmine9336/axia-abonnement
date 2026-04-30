import { Filter } from "lucide-react";
import UiCard from "../../../../components/common/UiCard";
import ExportButton from "../../../../components/common/ExportButton";
import SearchInput from "../../../../components/common/SearchInput";
import type {
  Client,
  FilterTab,
  MemberSinceFilter,
  PhoneFilter,
} from "../types";
import { formatDateFR } from "../utils";

interface ResponsableClientsFiltersProps {
  clients: Client[];
  filtered: Client[];
  tab: FilterTab;
  searchTerm: string;
  memberSinceFilter: MemberSinceFilter;
  phoneFilter: PhoneFilter;
  totalActifsFiltres: number;
  totalInactifsFiltres: number;
  hasFilters: boolean;
  onTabChange: (value: FilterTab) => void;
  onSearchChange: (value: string) => void;
  onMemberSinceFilterChange: (value: MemberSinceFilter) => void;
  onPhoneFilterChange: (value: PhoneFilter) => void;
  onResetFilters: () => void;
}

export default function ResponsableClientsFilters({
  filtered,
  tab,
  searchTerm,
  memberSinceFilter,
  phoneFilter,
  totalActifsFiltres,
  totalInactifsFiltres,
  hasFilters,
  onTabChange,
  onSearchChange,
  onMemberSinceFilterChange,
  onPhoneFilterChange,
  onResetFilters,
}: ResponsableClientsFiltersProps) {
  const selectedCount =
    tab === "tous"
      ? filtered.length
      : tab === "actif"
        ? totalActifsFiltres
        : totalInactifsFiltres;

  return (
    <UiCard className="p-4 mb-6">
      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-semibold text-gray-800">
              {tab === "tous"
                ? "Tous les clients"
                : tab === "actif"
                  ? "Clients actifs"
                  : "Clients inactifs"}
            </h2>

            <span className="bg-(--color-primary-soft) text-(--color-primary) text-xs font-semibold px-2.5 py-1 rounded-full">
              {selectedCount}
            </span>
          </div>

          <ExportButton
            data={filtered}
            columns={[
              { key: "username", label: "Client" },
              { key: "email", label: "Email" },
              { key: "phoneNumber", label: "Téléphone" },
              {
                key: "isActive",
                label: "Statut",
                format: (value: unknown) => (value ? "Actif" : "Inactif"),
              },
              {
                key: "createdAt",
                label: "Membre depuis",
                format: (value: unknown) => formatDateFR(String(value ?? "")),
              },
            ]}
            filename="clients"
            label="Exporter clients"
            sheetName="Clients"
            pdfTitle="Archive clients"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="inline-flex bg-gray-50 border border-gray-200 rounded-xl p-1">
            {(["tous", "actif", "inactif"] as const).map((item) => {
              const active = tab === item;

              return (
                <button
                  key={item}
                  type="button"
                  onClick={() => onTabChange(item)}
                  className={`px-3 py-2 text-sm rounded-lg font-medium transition ${
                    active
                      ? "bg-white shadow-sm text-(--color-primary)"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  {item === "tous"
                    ? "Tous"
                    : item === "actif"
                      ? "Actifs"
                      : "Inactifs"}
                </button>
              );
            })}
          </div>

          <SearchInput
            value={searchTerm}
            onChange={onSearchChange}
            placeholder="Rechercher par nom, email ou téléphone..."
          />

          <div className="flex items-center gap-2">
            <Filter size={15} className="text-gray-400" />

            <select
              value={memberSinceFilter}
              onChange={(event) =>
                onMemberSinceFilterChange(
                  event.target.value as MemberSinceFilter,
                )
              }
              className="h-10 min-w-44 rounded-xl border border-gray-200 bg-white px-3 text-sm text-gray-700 outline-none focus:border-(--color-primary)"
            >
              <option value="all">Toutes les dates</option>
              <option value="30days">30 derniers jours</option>
              <option value="90days">90 derniers jours</option>
              <option value="year">Cette année</option>
            </select>
          </div>

          <select
            value={phoneFilter}
            onChange={(event) =>
              onPhoneFilterChange(event.target.value as PhoneFilter)
            }
            className="h-10 min-w-44 rounded-xl border border-gray-200 bg-white px-3 text-sm text-gray-700 outline-none focus:border-(--color-primary)"
          >
            <option value="all">Tous les contacts</option>
            <option value="withPhone">Avec téléphone</option>
            <option value="withoutPhone">Sans téléphone</option>
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