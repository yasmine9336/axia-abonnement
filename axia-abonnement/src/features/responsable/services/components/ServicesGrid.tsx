import type { Service } from "../types";
import EmptyState from "../../../../components/common/EmptyState";
import Pagination from "../../../../components/common/Pagination";

interface ServicesGridProps {
  services: Service[];
  totalItems: number;
  currentPage: number;
  totalPages: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onToggle: (id: string) => void;
  onEdit: (service: Service) => void;
  onDeleteRequest: (id: string) => void;
}

export default function ServicesGrid({
  services,
  totalItems,
  currentPage,
  totalPages,
  pageSize,
  onPageChange,
  onToggle,
  onEdit,
  onDeleteRequest,
}: ServicesGridProps) {
  if (totalItems === 0) {
    return <EmptyState title="Aucun service trouvé" />;
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6">
      <div className="grid gap-4 grid-cols-[repeat(auto-fit,minmax(260px,360px))] justify-start">
        {services.map((service) => (
          <div
            key={service.id}
            className="rounded-2xl border border-gray-200 p-5 bg-white hover:shadow-sm transition-shadow w-full"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="font-bold text-gray-900 truncate">
                  {service.intituleService}
                </p>

                <p className="text-sm text-gray-500 line-clamp-2 mt-0.5">
                  {service.description}
                </p>
              </div>

              <button
                type="button"
                onClick={() => onToggle(service.id)}
                title={service.isActive ? "Désactiver" : "Activer"}
                aria-label={
                  service.isActive
                    ? "Désactiver le service"
                    : "Activer le service"
                }
                className={`relative inline-flex h-7 w-12 shrink-0 items-center rounded-full transition-colors duration-300 ${
                  service.isActive ? "bg-(--color-primary)" : "bg-gray-300"
                }`}
              >
                <span
                  className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-sm transition-transform duration-300 ${
                    service.isActive ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3">
              <div className="bg-gray-50 rounded-xl border border-gray-100 p-3">
                <p className="text-xs text-gray-400 font-semibold tracking-wide mb-1">
                  MENSUEL
                </p>
                <p className="text-lg font-extrabold text-orange-500">
                  {service.parMois}{" "}
                  <span className="text-xs font-semibold text-gray-400">
                    TND/mois
                  </span>
                </p>
              </div>

              <div className="bg-gray-50 rounded-xl border border-gray-100 p-3">
                <p className="text-xs text-gray-400 font-semibold tracking-wide mb-1">
                  ANNUEL
                </p>
                <p className="text-lg font-extrabold text-green-600">
                  {service.parAnnee}{" "}
                  <span className="text-xs font-semibold text-gray-400">
                    TND/an
                  </span>
                </p>
              </div>
            </div>

            <div className="mt-4 flex items-center justify-between gap-3">
              <div className="flex items-center gap-4 text-sm text-gray-500">
                <span>
                  {service.nbAbonnes} abonné
                  {service.nbAbonnes !== 1 ? "s" : ""}
                </span>

                <span>
                  {service.nbOffres} offre
                  {service.nbOffres !== 1 ? "s" : ""}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => onEdit(service)}
                  className="px-3 py-2 rounded-xl border text-sm font-semibold transition flex items-center gap-1.5 hover:opacity-80 border-(--color-primary) text-(--color-primary)"
                >
                  Modifier
                </button>

                <button
                  type="button"
                  onClick={() => onDeleteRequest(service.id)}
                  className="w-9 h-9 rounded-xl border border-red-200 text-red-400 hover:bg-red-50 transition flex items-center justify-center"
                  aria-label={`Supprimer ${service.intituleService}`}
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
                      d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79"
                    />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={totalItems}
        pageSize={pageSize}
        itemLabel="service(s)"
        onPageChange={onPageChange}
      />
    </div>
  );
}
