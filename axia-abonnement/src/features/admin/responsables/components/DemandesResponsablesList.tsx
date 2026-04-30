import {
  Search,
  Mail,
  Phone,
  Building2,
  FileText,
  MapPin,
  Briefcase,
  CheckCircle2,
  XCircle,
  Clock,
} from "lucide-react";

import type {
  DemandeResponsable,
  DemandeStatusFilter,
} from "../types";

import {
  STATUT_LABEL,
  STATUT_STYLES,
} from "../types";

interface DemandeTab {
  key: DemandeStatusFilter;
  label: string;
  count: number;
}

interface DemandesResponsablesListProps {
  demandes: DemandeResponsable[];
  loading: boolean;
  filteredCount: number;
  pendingCount: number;

  demandeTabs: DemandeTab[];
  demandeStatusFilter: DemandeStatusFilter;
  searchDemandes: string;

  currentPage: number;
  totalPages: number;

  onStatusChange: (value: DemandeStatusFilter) => void;
  onSearchChange: (value: string) => void;
  onPageChange: (page: number) => void;
  onAccept: (demande: DemandeResponsable) => void;
  onReject: (demande: DemandeResponsable) => void;
}

export default function DemandesResponsablesList({
  demandes,
  loading,
  filteredCount,
  pendingCount,
  demandeTabs,
  demandeStatusFilter,
  searchDemandes,
  currentPage,
  totalPages,
  onStatusChange,
  onSearchChange,
  onPageChange,
  onAccept,
  onReject,
}: DemandesResponsablesListProps) {
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
    <section className="bg-white rounded-2xl border border-gray-200 p-6 mb-6">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-5">
        <div>
          <h2 className="text-xl font-bold text-gray-900">
            Demandes de création de compte
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Validez ou consultez les demandes d’inscription des responsables.
          </p>
        </div>

        {pendingCount > 0 && (
          <span className="inline-flex items-center gap-2 bg-orange-50 text-orange-600 border border-orange-100 px-3 py-1.5 rounded-full text-sm font-semibold">
            <Clock size={15} />
            {pendingCount} demande(s) à traiter
          </span>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-3 mb-5">
        <div className="flex flex-wrap gap-2">
          {demandeTabs.map((item) => (
            <button
              key={item.key}
              type="button"
              onClick={() => onStatusChange(item.key)}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${
                demandeStatusFilter === item.key
                  ? "text-white"
                  : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
              }`}
              style={
                demandeStatusFilter === item.key
                  ? { background: "var(--color-primary)" }
                  : undefined
              }
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
            placeholder="Rechercher par nom, email ou entreprise..."
            className="ui-input pl-11! pr-4"
            value={searchDemandes}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-[repeat(auto-fill,minmax(330px,1fr))]">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="bg-white rounded-2xl border border-gray-200 p-5 animate-pulse"
            >
              <div className="w-40 h-4 bg-gray-200 rounded mb-3" />
              <div className="w-56 h-3 bg-gray-200 rounded mb-2" />
              <div className="w-48 h-3 bg-gray-200 rounded mb-6" />
              <div className="flex gap-2 mt-4">
                <div className="flex-1 h-9 bg-gray-200 rounded-xl" />
                <div className="flex-1 h-9 bg-gray-200 rounded-xl" />
              </div>
            </div>
          ))}
        </div>
      ) : filteredCount === 0 ? (
        <div className="text-center py-12 text-gray-400 border border-gray-100 rounded-2xl bg-gray-50">
          <Clock className="mx-auto mb-3" size={32} />
          <p className="text-lg font-medium">Aucune demande</p>
          <p className="text-sm mt-1">
            Les demandes correspondant au filtre apparaîtront ici.
          </p>
        </div>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-[repeat(auto-fill,minmax(330px,1fr))]">
            {demandes.map((d) => (
              <div
                key={d.id}
                className="bg-white rounded-2xl border border-gray-200 p-5 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg"
                      style={{ background: "var(--color-primary)" }}
                    >
                      {d.username.charAt(0).toUpperCase()}
                    </div>

                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {d.username}
                      </h3>

                      <p className="text-xs text-gray-400">
                        Demande du{" "}
                        {new Date(d.createdAt).toLocaleDateString("fr-FR")}
                      </p>
                    </div>
                  </div>

                  <span
                    className={`text-xs font-semibold px-3 py-1 rounded-full ${
                      STATUT_STYLES[d.statut] ?? "bg-gray-100 text-gray-500"
                    }`}
                  >
                    {STATUT_LABEL[d.statut] ?? d.statut}
                  </span>
                </div>

                <div className="space-y-2 mb-5 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <Mail size={14} />
                    <span className="truncate">{d.email}</span>
                  </div>

                  {d.phoneNumber && (
                    <div className="flex items-center gap-2">
                      <Phone size={14} />
                      <span>{d.phoneNumber}</span>
                    </div>
                  )}

                  {d.nomEntreprise && (
                    <div className="flex items-center gap-2">
                      <Building2 size={14} />
                      <span>{d.nomEntreprise}</span>
                    </div>
                  )}

                  {d.matriculeFiscal && (
                    <div className="flex items-center gap-2">
                      <FileText size={14} />
                      <span>{d.matriculeFiscal}</span>
                    </div>
                  )}

                  {d.secteurActivite && (
                    <div className="flex items-center gap-2">
                      <Briefcase size={14} />
                      <span>{d.secteurActivite}</span>
                    </div>
                  )}

                  {d.adresseProfessionnelle && (
                    <div className="flex items-start gap-2">
                      <MapPin size={14} className="mt-0.5" />
                      <span>{d.adresseProfessionnelle}</span>
                    </div>
                  )}
                </div>

                {d.statut === "Rejected" && d.motifRefus && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-100 rounded-lg text-xs text-red-700">
                    <strong>Motif du refus : </strong>
                    {d.motifRefus}
                  </div>
                )}

                {d.statut === "Accepted" && d.dateAcceptation && (
                  <div className="mb-4 p-3 bg-green-50 border border-green-100 rounded-lg text-xs text-green-700">
                    Acceptée le{" "}
                    {new Date(d.dateAcceptation).toLocaleDateString("fr-FR")} —
                    en attente de paiement.
                  </div>
                )}

                {d.statut === "Pending" && (
                  <div className="flex gap-2 mt-4">
                    <button
                      type="button"
                      onClick={() => onAccept(d)}
                      className="flex-1 flex items-center justify-center gap-1.5 bg-green-600 hover:bg-green-700 text-white text-sm font-medium py-2 rounded-xl transition-colors"
                    >
                      <CheckCircle2 size={15} />
                      Accepter
                    </button>

                    <button
                      type="button"
                      onClick={() => onReject(d)}
                      className="flex-1 flex items-center justify-center gap-1.5 border border-red-200 text-red-600 hover:bg-red-50 text-sm font-medium py-2 rounded-xl transition-colors"
                    >
                      <XCircle size={15} />
                      Refuser
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>

          {renderPagination()}
        </>
      )}
    </section>
  );
}