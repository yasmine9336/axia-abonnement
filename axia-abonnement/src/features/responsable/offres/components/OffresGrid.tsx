import type { Offre } from "../types";
import EmptyState from "../../../../components/common/EmptyState";
import Pagination from "../../../../components/common/Pagination";

interface OffresGridProps {
  offres: Offre[];
  totalItems: number;
  currentPage: number;
  totalPages: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onToggle: (id: string) => void;
  onEdit: (offre: Offre) => void;
  onDeleteRequest: (id: string) => void;
}

export default function OffresGrid({
  offres,
  totalItems,
  currentPage,
  totalPages,
  pageSize,
  onPageChange,
  onToggle,
  onEdit,
  onDeleteRequest,
}: OffresGridProps) {
  if (totalItems === 0) {
    return <EmptyState title="Aucune offre trouvée" />;
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {offres.map((offre) => (
          <div
            key={offre.id}
            className="bg-white rounded-2xl border border-gray-200 hover:shadow-sm transition-shadow flex flex-col"
          >
            <div className="p-5 border-b border-gray-100">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="font-bold text-gray-900 text-base">
                    {offre.intituleOffre}
                  </h3>

                  <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                    {offre.description}
                  </p>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <button
                    type="button"
                    onClick={() => onToggle(offre.id)}
                    title={offre.isActive ? "Désactiver" : "Activer"}
                    aria-label={
                      offre.isActive ? "Désactiver l'offre" : "Activer l'offre"
                    }
                    className={`relative inline-flex h-6 w-10 shrink-0 items-center rounded-full transition-colors duration-300 ${
                      offre.isActive ? "bg-(--color-primary)" : "bg-gray-300"
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform duration-300 ${
                        offre.isActive ? "translate-x-5" : "translate-x-1"
                      }`}
                    />
                  </button>

                  <button
                    type="button"
                    onClick={() => onEdit(offre)}
                    className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors"
                    aria-label={`Modifier ${offre.intituleOffre}`}
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
                        d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125"
                      />
                    </svg>
                  </button>

                  <button
                    type="button"
                    onClick={() => onDeleteRequest(offre.id)}
                    className="p-1.5 rounded-lg text-red-400 hover:bg-red-50 transition-colors"
                    aria-label={`Supprimer ${offre.intituleOffre}`}
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
                        d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            </div>

            <div className="p-5 space-y-4 flex-1 flex flex-col">
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-gray-50 rounded-xl border border-gray-100 p-3">
                  <p className="text-xs text-gray-400 font-semibold tracking-wide mb-1">
                    DURÉE
                  </p>
                  <p className="text-lg font-extrabold text-(--color-primary)">
                    {offre.dureeEnMois}{" "}
                    <span className="text-xs font-semibold text-gray-400">
                      mois
                    </span>
                  </p>
                </div>
                <div className="bg-gray-50 rounded-xl border border-gray-100 p-3">
                  <p className="text-xs text-gray-400 font-semibold tracking-wide mb-1">
                    PRIX
                  </p>
                  <p className="text-lg font-extrabold text-green-600">
                    {offre.prix}{" "}
                    <span className="text-xs font-semibold text-gray-400">
                      TND
                    </span>
                  </p>
                </div>
              </div>

              {offre.services.length > 0 && (
                <div>
                  <p className="text-xs text-gray-400 mb-2">SERVICES INCLUS</p>

                  <div className="flex flex-wrap gap-1.5">
                    {offre.services.map((service, index) => (
                      <span
                        key={`${service}-${index}`}
                        className="text-xs bg-(--color-primary-soft) text-(--color-primary) px-2 py-0.5 rounded-full"
                      >
                        ✓ {service}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between pt-2 border-t border-gray-100 mt-auto">
                <div className="flex items-center gap-2">
                  <span
                    className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                      offre.isActive
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {offre.isActive ? "Active" : "Inactive"}
                  </span>

                  <span className="text-xs text-gray-500">
                    {offre.nbAbonnes} abonné
                    {offre.nbAbonnes !== 1 ? "s" : ""}
                  </span>
                </div>
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
        itemLabel="offre(s)"
        onPageChange={onPageChange}
      />
    </>
  );
}
