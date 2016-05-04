import {
  Search,
  Mail,
  Phone,
  Power,
  Trash2,
  Users,
} from "lucide-react";

import ExportButton from "../../../../components/common/ExportButton";

import type {
  Responsable,
  ResponsableStatusFilter,
} from "../types";

interface ResponsableTab {
  key: ResponsableStatusFilter;
  label: string;
  count: number;
}

interface ResponsablesListProps {
  responsables: Responsable[];
  filteredResponsables: Responsable[];
  loading: boolean;

  responsableTabs: ResponsableTab[];
  responsableStatusFilter: ResponsableStatusFilter;
  searchTerm: string;

  currentPage: number;
  totalPages: number;

  getPhotoUrl: (photoPath?: string | null) => string | null;
  onStatusChange: (value: ResponsableStatusFilter) => void;
  onSearchChange: (value: string) => void;
  onPageChange: (page: number) => void;
  onToggle: (responsable: Responsable) => void;
  onDelete: (responsable: Responsable) => void;
}

export default function ResponsablesList({
  responsables,
  filteredResponsables,
  loading,
  responsableTabs,
  responsableStatusFilter,
  searchTerm,
  currentPage,
  totalPages,
  getPhotoUrl,
  onStatusChange,
  onSearchChange,
  onPageChange,
  onToggle,
  onDelete,
}: ResponsablesListProps) {
  const renderPagination = () => {
    if (totalPages <= 1) return null;

    return (
      <div className="flex items-center justify-end gap-2 mt-5">
        <button
          type="button"
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
          className="px-3 py-1.5 rounded-lg border border-gray-200 text-sm text-gray-600 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50"
        >
          Précédent
        </button>

        <span className="text-sm text-gray-500">
          Page {currentPage} sur {totalPages}
        </span>

        <button
          type="button"
          onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage === totalPages}
          className="px-3 py-1.5 rounded-lg border border-gray-200 text-sm text-gray-600 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50"
        >
          Suivant
        </button>
      </div>
    );
  };

  return (
    <section className="bg-white rounded-2xl border border-gray-200 p-6">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-5">
        <div>
          <h2 className="text-xl font-bold text-gray-900">
            Responsables validés
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Consultez et gérez les comptes responsables actifs ou désactivés.
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3 mb-5">
        <div className="flex flex-wrap gap-2">
          {responsableTabs.map((item) => (
            <button
              key={item.key}
              type="button"
              onClick={() => onStatusChange(item.key)}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${
                responsableStatusFilter === item.key
                  ? "bg-(--color-primary) text-white"
                  : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
              }`}
            >
              {item.label}
              <span className="ml-1 text-xs font-semibold">{item.count}</span>
            </button>
          ))}
        </div>

        <div className="relative flex-1 min-w-64">
          <Search
            className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
            size={16}
          />

          <input
            type="text"
            placeholder="Rechercher par nom ou email..."
            className="ui-input pl-11! pr-4"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>

        <ExportButton
          data={filteredResponsables}
          columns={[
            { key: "username", label: "Nom d'utilisateur" },
            { key: "email", label: "Email" },
            { key: "phoneNumber", label: "Téléphone" },
            {
              key: "isActive",
              label: "Statut",
              format: (value: unknown) => (value ? "Actif" : "Inactif"),
            },
          ]}
          filename="responsables"
          label="Exporter responsables"
          sheetName="Responsables"
          pdfTitle="Liste des responsables"
        />
      </div>

      {loading ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="bg-white rounded-2xl border border-gray-200 p-6 animate-pulse"
            >
              <div className="flex justify-between mb-4">
                <div className="w-12 h-12 bg-gray-200 rounded-full" />
                <div className="w-16 h-6 bg-gray-200 rounded-full" />
              </div>
              <div className="w-32 h-4 bg-gray-200 rounded mb-3" />
              <div className="w-48 h-3 bg-gray-200 rounded mb-2" />
              <div className="w-24 h-3 bg-gray-200 rounded mb-6" />
              <div className="flex gap-2 mt-4">
                <div className="flex-1 h-9 bg-gray-200 rounded-xl" />
                <div className="w-9 h-9 bg-gray-200 rounded-xl" />
              </div>
            </div>
          ))}
        </div>
      ) : filteredResponsables.length === 0 ? (
        <div className="text-center py-12 text-gray-400 border border-gray-100 rounded-2xl bg-gray-50">
          <Users className="mx-auto mb-3" size={32} />
          <p className="text-lg font-medium">Aucun responsable trouvé</p>
          <p className="text-sm mt-1">
            Aucun responsable ne correspond au filtre sélectionné.
          </p>
        </div>
      ) : (
        <>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {responsables.map((resp) => {
              const photoUrl = getPhotoUrl(resp.profileImageUrl);

              return (
                <div
                  key={resp.id}
                  className="bg-white rounded-2xl border border-gray-200 p-5 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between mb-4">
                    {photoUrl ? (
                      <img
                        src={photoUrl}
                        alt={`Photo de ${resp.username}`}
                        className="w-12 h-12 rounded-full object-cover border border-gray-200"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg bg-(--color-primary)">
                        {resp.username.charAt(0).toUpperCase()}
                      </div>
                    )}

                    <span
                      className={`text-xs font-semibold px-3 py-1 rounded-full ${
                        resp.isActive
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-600"
                      }`}
                    >
                      {resp.isActive ? "Actif" : "Inactif"}
                    </span>
                  </div>

                  <h3 className="font-semibold text-gray-900 mb-3">
                    {resp.username}
                  </h3>

                  <div className="space-y-1.5 mb-6">
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Mail size={13} />
                      <span className="truncate">{resp.email}</span>
                    </div>

                    {resp.phoneNumber && (
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Phone size={13} />
                        <span>{resp.phoneNumber}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2 mt-4">
                    <button
                      type="button"
                      onClick={() => onToggle(resp)}
                      className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl border transition-colors text-sm font-medium ${
                        resp.isActive
                          ? "border-orange-200 text-orange-600 hover:bg-orange-50"
                          : "border-green-200 text-green-700 hover:bg-green-50"
                      }`}
                    >
                      <Power size={15} />
                      {resp.isActive ? "Désactiver" : "Activer"}
                    </button>

                    <button
                      type="button"
                      onClick={() => onDelete(resp)}
                      className="p-2 rounded-xl border border-red-200 text-red-500 hover:bg-red-50 transition-colors"
                      aria-label={`Supprimer ${resp.username}`}
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {renderPagination()}
        </>
      )}
    </section>
  );
}