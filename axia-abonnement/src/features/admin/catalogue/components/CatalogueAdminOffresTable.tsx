import EmptyState from "../../../../components/common/EmptyState";
import ExportButton from "../../../../components/common/ExportButton";
import Pagination from "../../../../components/common/Pagination";
import StatusBadge from "../../../../components/common/StatusBadge";
import type { OffreItem } from "../types";

interface CatalogueAdminOffresTableProps {
  offres: OffreItem[];
  filteredOffres: OffreItem[];
  totalItems: number;
  currentPage: number;
  totalPages: number;
  pageSize: number;
  onPageChange: (page: number) => void;
}

export default function CatalogueAdminOffresTable({
  offres,
  filteredOffres,
  totalItems,
  currentPage,
  totalPages,
  pageSize,
  onPageChange,
}: CatalogueAdminOffresTableProps) {
  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-semibold text-gray-800">Offres</h2>
          <p className="text-xs text-gray-400 mt-1">
            {totalItems} offre(s) trouvée(s)
          </p>
        </div>

        <ExportButton
          data={filteredOffres}
          columns={[
            { key: "intituleOffre", label: "Intitulé" },
            { key: "parMois", label: "Prix/mois (TND)" },
            { key: "parAnnee", label: "Prix/an (TND)" },
            {
              key: "services",
              label: "Services inclus",
              format: (value: unknown) =>
                Array.isArray(value) ? value.join(", ") : "",
            },
            { key: "creePar", label: "Créé par" },
            {
              key: "isActive",
              label: "Statut",
              format: (value: unknown) => (value ? "Actif" : "Inactif"),
            },
          ]}
          filename="offres"
          label="Exporter offres"
          sheetName="Offres"
          pdfTitle="Catalogue des offres"
        />
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 p-0 overflow-hidden">
        {totalItems === 0 ? (
          <EmptyState title="Aucune offre trouvée" />
        ) : (
          <>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  {[
                    "Intitulé",
                    "Prix/mois",
                    "Prix/an",
                    "Services inclus",
                    "Créé par",
                    "Statut",
                  ].map((header) => (
                    <th
                      key={header}
                      className="text-left py-3 px-5 text-xs text-gray-400 font-medium uppercase tracking-wide"
                    >
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-50">
                {offres.map((offre) => (
                  <tr
                    key={offre.id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="py-4 px-5 font-semibold text-gray-900">
                      {offre.intituleOffre}
                    </td>

                    <td className="py-4 px-5 font-semibold text-(--color-primary)">
                      {offre.parMois} TND
                    </td>

                    <td className="py-4 px-5 text-gray-600">
                      {offre.parAnnee} TND
                    </td>

                    <td className="py-4 px-5">
                      {offre.services.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {offre.services.map((service, index) => (
                            <span
                              key={`${service}-${index}`}
                              className="bg-(--color-primary-soft) text-(--color-primary) text-xs px-2 py-0.5 rounded-full"
                            >
                              {service}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </td>

                    <td className="py-4 px-5 text-gray-500">
                      {offre.creePar}
                    </td>

                    <td className="py-4 px-5">
                      <StatusBadge
                        label={offre.isActive ? "Actif" : "Inactif"}
                        variant={offre.isActive ? "success" : "neutral"}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={totalItems}
              pageSize={pageSize}
              itemLabel="offre(s)"
              onPageChange={onPageChange}
            />
          </>
        )}
      </div>
    </div>
  );
}