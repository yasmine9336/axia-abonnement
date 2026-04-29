import { useEffect, useMemo, useState } from "react";
import axiosInstance from "../../api/axiosInstance";
import ExportButton from "../common/ExportButton";
import {
  ClipboardList,
  CheckCircle,
  Tag,
  Zap,
  Filter,
  Search,
} from "lucide-react";
import StatusBadge from "../common/StatusBadge";

interface ServiceItem {
  id: string;
  intituleService: string;
  description: string;
  parMois: number;
  parAnnee: number;
  isActive: boolean;
  creePar: string;
  nbOffres: number;
}

interface OffreItem {
  id: string;
  intituleOffre: string;
  description: string;
  parMois: number;
  parAnnee: number;
  isActive: boolean;
  creePar: string;
  services: string[];
}

const PAGE_SIZE = 4;

export default function CatalogueAdminSection() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [offres, setOffres] = useState<OffreItem[]>([]);

  const [searchTerm, setSearchTerm] = useState("");
  const [createdByFilter, setCreatedByFilter] = useState("all");

  const [currentServicesPage, setCurrentServicesPage] = useState(1);
  const [currentOffresPage, setCurrentOffresPage] = useState(1);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        const [s, o] = await Promise.all([
          axiosInstance.get<ServiceItem[]>("/services"),
          axiosInstance.get<OffreItem[]>("/offres"),
        ]);

        setServices(s.data ?? []);
        setOffres(o.data ?? []);
      } catch {
        setError("Erreur lors du chargement du catalogue.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const activeServices = services.filter((s) => s.isActive).length;
  const activeOffres = offres.filter((o) => o.isActive).length;

  const creators = useMemo(() => {
    const allCreators = [
      ...services.map((s) => s.creePar),
      ...offres.map((o) => o.creePar),
    ].filter(Boolean);

    return Array.from(new Set(allCreators)).sort((a, b) =>
      a.localeCompare(b),
    );
  }, [services, offres]);

  const filteredServices = useMemo(() => {
    const q = searchTerm.toLowerCase().trim();

    return services.filter((service) => {
      const matchesCreator =
        createdByFilter === "all" || service.creePar === createdByFilter;

      const matchesSearch =
        !q ||
        service.intituleService.toLowerCase().includes(q) ||
        service.description.toLowerCase().includes(q) ||
        service.creePar.toLowerCase().includes(q);

      return matchesCreator && matchesSearch;
    });
  }, [services, createdByFilter, searchTerm]);

  const filteredOffres = useMemo(() => {
    const q = searchTerm.toLowerCase().trim();

    return offres.filter((offre) => {
      const matchesCreator =
        createdByFilter === "all" || offre.creePar === createdByFilter;

      const matchesSearch =
        !q ||
        offre.intituleOffre.toLowerCase().includes(q) ||
        offre.description.toLowerCase().includes(q) ||
        offre.creePar.toLowerCase().includes(q) ||
        offre.services.some((service) => service.toLowerCase().includes(q));

      return matchesCreator && matchesSearch;
    });
  }, [offres, createdByFilter, searchTerm]);

  const totalServicesPages = Math.max(
    1,
    Math.ceil(filteredServices.length / PAGE_SIZE),
  );

  const paginatedServices = useMemo(() => {
    const start = (currentServicesPage - 1) * PAGE_SIZE;

    return filteredServices.slice(start, start + PAGE_SIZE);
  }, [filteredServices, currentServicesPage]);

  const totalOffresPages = Math.max(
    1,
    Math.ceil(filteredOffres.length / PAGE_SIZE),
  );

  const paginatedOffres = useMemo(() => {
    const start = (currentOffresPage - 1) * PAGE_SIZE;

    return filteredOffres.slice(start, start + PAGE_SIZE);
  }, [filteredOffres, currentOffresPage]);

  useEffect(() => {
    setCurrentServicesPage(1);
    setCurrentOffresPage(1);
  }, [createdByFilter, searchTerm]);

  useEffect(() => {
    setCurrentServicesPage((page) => Math.min(page, totalServicesPages));
  }, [totalServicesPages]);

  useEffect(() => {
    setCurrentOffresPage((page) => Math.min(page, totalOffresPages));
  }, [totalOffresPages]);

  const hasFilters = createdByFilter !== "all" || searchTerm.trim() !== "";

  const resetFilters = () => {
    setCreatedByFilter("all");
    setSearchTerm("");
  };

  const renderPagination = (
    currentPage: number,
    totalPages: number,
    totalItems: number,
    onPageChange: (page: number) => void,
  ) => {
    if (totalPages <= 1) return null;

    return (
      <div className="flex items-center justify-between px-5 py-3 border-t border-gray-100 bg-gray-50">
        <p className="text-xs text-gray-500">
          {(currentPage - 1) * PAGE_SIZE + 1}–
          {Math.min(currentPage * PAGE_SIZE, totalItems)} sur {totalItems}
        </p>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onPageChange(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            className="ui-btn-secondary text-xs disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Précédent
          </button>

          <span className="text-xs text-gray-500">
            {currentPage} / {totalPages}
          </span>

          <button
            onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
            className="ui-btn-secondary text-xs disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Suivant
          </button>
        </div>
      </div>
    );
  };

  const kpiCards = [
    {
      label: "TOTAL SERVICES",
      value: services.length,
      sub: `${activeServices} actifs`,
      icon: <ClipboardList className="w-5 h-5 text-blue-600" />,
      border: "border-t-blue-500",
    },
    {
      label: "SERVICES ACTIFS",
      value: activeServices,
      sub: `${services.length - activeServices} inactifs`,
      icon: <CheckCircle className="w-5 h-5 text-green-500" />,
      border: "border-t-green-400",
    },
    {
      label: "TOTAL OFFRES",
      value: offres.length,
      sub: `${activeOffres} actives`,
      icon: <Tag className="w-5 h-5 text-blue-500" />,
      border: "border-t-blue-400",
    },
    {
      label: "OFFRES ACTIVES",
      value: activeOffres,
      sub: `${offres.length - activeOffres} inactives`,
      icon: <Zap className="w-5 h-5 text-orange-500" />,
      border: "border-t-orange-400",
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-40">
        <div className="ui-spinner" />
      </div>
    );
  }

  return (
    <div className="ui-page">
      <div className="mb-6">
        <h1 className="ui-title">Catalogue</h1>

        <p className="ui-subtitle">
          {services.length} service(s) · {offres.length} offre(s)
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {kpiCards.map((card) => (
          <div
            key={card.label}
            className={`bg-white rounded-2xl border border-gray-200 border-t-4 ${card.border} p-5`}
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs text-gray-400 font-medium tracking-wide mb-2">
                  {card.label}
                </p>

                <p className="text-3xl font-bold text-gray-900">
                  {card.value}
                </p>

                <p className="text-xs text-gray-400 mt-1">{card.sub}</p>
              </div>

              <div className="mt-1">{card.icon}</div>
            </div>
          </div>
        ))}
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm">
          {error}
        </div>
      )}

      {/* Recherche + filtre global */}
      <div className="bg-white rounded-2xl border border-gray-200 p-4 mb-6">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-64">
            <Search
              className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
              size={16}
            />

            <input
              type="text"
              placeholder="Rechercher par service, offre, description ou créateur..."
              className="ui-input pl-11! pr-4"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter size={16} className="text-gray-400" />

            <select
              value={createdByFilter}
              onChange={(e) => setCreatedByFilter(e.target.value)}
              className="h-10 min-w-56 rounded-xl border border-gray-200 bg-white px-3 text-sm text-gray-700 outline-none focus:border-(--color-primary)"
            >
              <option value="all">Tous les créateurs</option>

              {creators.map((creator) => (
                <option key={creator} value={creator}>
                  {creator}
                </option>
              ))}
            </select>
          </div>

          {hasFilters && (
            <button
              onClick={resetFilters}
              className="h-10 px-3 rounded-xl border border-gray-200 text-sm font-medium text-(--color-primary) hover:bg-gray-50"
            >
              Réinitialiser
            </button>
          )}
        </div>
      </div>

      {/* Services */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-800">Services</h2>
            <p className="text-xs text-gray-400 mt-1">
              {filteredServices.length} service(s) trouvé(s)
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
                format: (v) => (v ? "Actif" : "Inactif"),
              },
            ]}
            filename="services"
            label="Exporter services"
            sheetName="Services"
            pdfTitle="Catalogue des services"
          />
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 p-0 overflow-hidden">
          {filteredServices.length === 0 ? (
            <div className="text-center py-12 text-gray-400 text-sm">
              Aucun service trouvé
            </div>
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
                    ].map((h) => (
                      <th
                        key={h}
                        className="text-left py-3 px-5 text-xs text-gray-400 font-medium uppercase tracking-wide"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-50">
                  {paginatedServices.map((s) => (
                    <tr
                      key={s.id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="py-4 px-5 font-semibold text-gray-900">
                        {s.intituleService}
                      </td>

                      <td className="py-4 px-5 text-gray-500 max-w-xs truncate">
                        {s.description}
                      </td>

                      <td className="py-4 px-5 font-semibold text-(--color-primary)">
                        {s.parMois} TND
                      </td>

                      <td className="py-4 px-5 text-gray-600">
                        {s.parAnnee} TND
                      </td>

                      <td className="py-4 px-5 text-center">
                        <span className="bg-(--color-primary-soft) text-(--color-primary) text-xs font-semibold px-2.5 py-1 rounded-lg">
                          {s.nbOffres} offre{s.nbOffres !== 1 ? "s" : ""}
                        </span>
                      </td>

                      <td className="py-4 px-5 text-gray-500">{s.creePar}</td>

                      <td className="py-4 px-5">
                        <StatusBadge
                          label={s.isActive ? "Actif" : "Inactif"}
                          variant={s.isActive ? "success" : "neutral"}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {renderPagination(
                currentServicesPage,
                totalServicesPages,
                filteredServices.length,
                setCurrentServicesPage,
              )}
            </>
          )}
        </div>
      </div>

      {/* Offres */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-800">Offres</h2>
            <p className="text-xs text-gray-400 mt-1">
              {filteredOffres.length} offre(s) trouvée(s)
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
                format: (v) => (Array.isArray(v) ? v.join(", ") : ""),
              },
              { key: "creePar", label: "Créé par" },
              {
                key: "isActive",
                label: "Statut",
                format: (v) => (v ? "Actif" : "Inactif"),
              },
            ]}
            filename="offres"
            label="Exporter offres"
            sheetName="Offres"
            pdfTitle="Catalogue des offres"
          />
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 p-0 overflow-hidden">
          {filteredOffres.length === 0 ? (
            <div className="text-center py-12 text-gray-400 text-sm">
              Aucune offre trouvée
            </div>
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
                    ].map((h) => (
                      <th
                        key={h}
                        className="text-left py-3 px-5 text-xs text-gray-400 font-medium uppercase tracking-wide"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-50">
                  {paginatedOffres.map((o) => (
                    <tr
                      key={o.id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="py-4 px-5 font-semibold text-gray-900">
                        {o.intituleOffre}
                      </td>

                      <td className="py-4 px-5 font-semibold text-(--color-primary)">
                        {o.parMois} TND
                      </td>

                      <td className="py-4 px-5 text-gray-600">
                        {o.parAnnee} TND
                      </td>

                      <td className="py-4 px-5">
                        {o.services.length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {o.services.map((s, i) => (
                              <span
                                key={i}
                                className="bg-(--color-primary-soft) text-(--color-primary) text-xs px-2 py-0.5 rounded-full"
                              >
                                {s}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span className="text-gray-400">—</span>
                        )}
                      </td>

                      <td className="py-4 px-5 text-gray-500">{o.creePar}</td>

                      <td className="py-4 px-5">
                        <StatusBadge
                          label={o.isActive ? "Actif" : "Inactif"}
                          variant={o.isActive ? "success" : "neutral"}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {renderPagination(
                currentOffresPage,
                totalOffresPages,
                filteredOffres.length,
                setCurrentOffresPage,
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}