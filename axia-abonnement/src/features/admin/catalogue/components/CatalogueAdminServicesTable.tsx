import EmptyState from "../../../../components/common/EmptyState";
import ExportButton from "../../../../components/common/ExportButton";
import Pagination from "../../../../components/common/Pagination";
import StatusBadge from "../../../../components/common/StatusBadge";
import type { ServiceItem } from "../types";

interface CatalogueAdminServicesTableProps {
  services: ServiceItem[];
  filteredServices: ServiceItem[];
  totalItems: number;
  currentPage: number;
  totalPages: number;
  pageSize: number;
  onPageChange: (page: number) => void;
}

export default function CatalogueAdminServicesTable({
  services,
  filteredServices,
  totalItems,
  currentPage,
  totalPages,
  pageSize,
  onPageChange,
}: CatalogueAdminServicesTableProps) {
  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-semibold text-gray-800">Services</h2>
          <p className="text-xs text-gray-400 mt-1">
            {totalItems} service(s) trouvé(s)
          </p>
        </div>

        <ExportButton
          data={filteredServices}
          columns={[
            { key: "intituleService", label: "Intitulé" },
            { key: "description", label: "Description" },
            { key: "parMois", label: "Prix/mois (TND)" },
            { key: "parAnnee", label: "Prix/an (TND)" },
            { key: "nbOffres", label: "Nombre d'offres" },
            { key: "creePar", label: "Créé par" },
            {
              key: "isActive",
              label: "Statut",
              format: (value: unknown) => (value ? "Actif" : "Inactif"),
            },
          ]}
          filename="services"
          label="Exporter services"
          sheetName="Services"
          pdfTitle="Catalogue des services"
        />
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 p-0 overflow-hidden">
        {totalItems === 0 ? (
          <EmptyState title="Aucun service trouvé" />
        ) : (
          <>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  {[
                    "Intitulé",
                    "Description",
                    "Prix/mois",
                    "Prix/an",
                    "Nombre d'offres",
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
                {services.map((service) => (
                  <tr
                    key={service.id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="py-4 px-5 font-semibold text-gray-900">
                      {service.intituleService}
                    </td>

                    <td className="py-4 px-5 text-gray-500 max-w-xs truncate">
                      {service.description}
                    </td>

                    <td className="py-4 px-5 font-semibold text-(--color-primary)">
                      {service.parMois} TND
                    </td>

                    <td className="py-4 px-5 text-gray-600">
                      {service.parAnnee} TND
                    </td>

                    <td className="py-4 px-5 text-center">
                      <span className="bg-(--color-primary-soft) text-(--color-primary) text-xs font-semibold px-2.5 py-1 rounded-lg">
                        {service.nbOffres} offre
                        {service.nbOffres !== 1 ? "s" : ""}
                      </span>
                    </td>

                    <td className="py-4 px-5 text-gray-500">
                      {service.creePar}
                    </td>

                    <td className="py-4 px-5">
                      <StatusBadge
                        label={service.isActive ? "Actif" : "Inactif"}
                        variant={service.isActive ? "success" : "neutral"}
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
              itemLabel="service(s)"
              onPageChange={onPageChange}
            />
          </>
        )}
      </div>
    </div>
  );
}