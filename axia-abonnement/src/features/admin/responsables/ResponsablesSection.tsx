import ConfirmDemandeModal from "./components/ConfirmDemandeModal";
import DemandesResponsablesList from "./components/DemandesResponsablesList";
import ResponsablesList from "./components/ResponsablesList";
import { useResponsablesSection } from "./hooks/useResponsablesSection";

export default function ResponsablesSection() {
  const {
    responsables,
    loadingActifs,
    loadingDemandes,
    searchTerm,
    responsableStatusFilter,
    responsablesPage,
    demandeStatusFilter,
    searchDemandes,
    demandesPage,
    showModal,
    error,
    confirmAction,
    motifRefus,
    submittingDemande,
    toast,

    activeCount,
    inactiveCount,
    pendingCount,
    filteredActifs,
    filteredDemandes,
    totalDemandesPages,
    totalResponsablesPages,
    paginatedDemandes,
    paginatedResponsables,
    demandeTabs,
    responsableTabs,

    setSearchTerm,
    setResponsableStatusFilter,
    setResponsablesPage,
    setDemandeStatusFilter,
    setSearchDemandes,
    setDemandesPage,
    setMotifRefus,
    setConfirmAction,
    handleToggle,
    handleDelete,
    handleConfirmDemande,
    getPhotoUrl,
  } = useResponsablesSection();

  return (
    <div className="ui-page">
      <div className="mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="ui-title">Gestion des responsables</h1>
          <p className="ui-subtitle">
            Gérez les comptes responsables et leurs demandes.
          </p>
          <div className="flex flex-wrap gap-2 mt-3">
            <span className="text-xs px-3 py-1 rounded-full bg-gray-100 text-gray-600 font-medium">
              {responsables.length} total
            </span>
            <span className="text-xs px-3 py-1 rounded-full bg-green-100 text-green-700 font-medium">
              ● {activeCount} actifs
            </span>
            <span className="text-xs px-3 py-1 rounded-full bg-red-100 text-red-700 font-medium">
              ● {inactiveCount} inactifs
            </span>
            {pendingCount > 0 && (
              <span className="text-xs px-3 py-1 rounded-full bg-orange-100 text-orange-700 font-medium">
                ● {pendingCount} en attente
              </span>
            )}
          </div>
        </div>
      </div>

      {toast && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded-xl text-sm">
          {toast}
        </div>
      )}

      {error && !showModal && !confirmAction && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm">
          {error}
        </div>
      )}

      <DemandesResponsablesList
        demandes={paginatedDemandes}
        loading={loadingDemandes}
        filteredCount={filteredDemandes.length}
        pendingCount={pendingCount}
        demandeTabs={demandeTabs}
        demandeStatusFilter={demandeStatusFilter}
        searchDemandes={searchDemandes}
        currentPage={demandesPage}
        totalPages={totalDemandesPages}
        onStatusChange={setDemandeStatusFilter}
        onSearchChange={setSearchDemandes}
        onPageChange={setDemandesPage}
        onAccept={(demande) => {
          setConfirmAction({ type: "accept", demande });
          setMotifRefus("");
        }}
        onReject={(demande) => {
          setConfirmAction({ type: "reject", demande });
          setMotifRefus("");
        }}
      />

      <ResponsablesList
        responsables={paginatedResponsables}
        filteredResponsables={filteredActifs}
        loading={loadingActifs}
        responsableTabs={responsableTabs}
        responsableStatusFilter={responsableStatusFilter}
        searchTerm={searchTerm}
        currentPage={responsablesPage}
        totalPages={totalResponsablesPages}
        getPhotoUrl={getPhotoUrl}
        onStatusChange={setResponsableStatusFilter}
        onSearchChange={setSearchTerm}
        onPageChange={setResponsablesPage}
        onToggle={handleToggle}
        onDelete={handleDelete}
      />

      <ConfirmDemandeModal
        confirmAction={confirmAction}
        motifRefus={motifRefus}
        submitting={submittingDemande}
        onMotifRefusChange={setMotifRefus}
        onCancel={() => {
          setConfirmAction(null);
          setMotifRefus("");
        }}
        onConfirm={handleConfirmDemande}
      />
    </div>
  );
}
