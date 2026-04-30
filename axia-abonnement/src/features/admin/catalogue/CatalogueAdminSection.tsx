import { useEffect, useMemo, useState } from "react";
import axiosInstance from "../../../api/axiosInstance";
import LoadingState from "../../../components/common/LoadingState";

import CatalogueAdminKpiCards from "./components/CatalogueAdminKpiCards";
import CatalogueAdminFilters from "./components/CatalogueAdminFilters";
import CatalogueAdminServicesTable from "./components/CatalogueAdminServicesTable";
import CatalogueAdminOffresTable from "./components/CatalogueAdminOffresTable";

import type { OffreItem, ServiceItem } from "./types";
import { PAGE_SIZE } from "./types";

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

        const [servicesResponse, offresResponse] = await Promise.all([
          axiosInstance.get<ServiceItem[]>("/services"),
          axiosInstance.get<OffreItem[]>("/offres"),
        ]);

        setServices(servicesResponse.data ?? []);
        setOffres(offresResponse.data ?? []);
      } catch {
        setError("Erreur lors du chargement du catalogue.");
      } finally {
        setLoading(false);
      }
    };

    void fetchData();
  }, []);

  const activeServices = useMemo(
    () => services.filter((service) => service.isActive).length,
    [services],
  );

  const activeOffres = useMemo(
    () => offres.filter((offre) => offre.isActive).length,
    [offres],
  );

  const creators = useMemo(() => {
    const allCreators = [
      ...services.map((service) => service.creePar),
      ...offres.map((offre) => offre.creePar),
    ].filter(Boolean);

    return Array.from(new Set(allCreators)).sort((a, b) =>
      a.localeCompare(b),
    );
  }, [services, offres]);

  const filteredServices = useMemo(() => {
    const query = searchTerm.toLowerCase().trim();

    return services.filter((service) => {
      const matchesCreator =
        createdByFilter === "all" || service.creePar === createdByFilter;

      const matchesSearch =
        !query ||
        service.intituleService.toLowerCase().includes(query) ||
        service.description.toLowerCase().includes(query) ||
        service.creePar.toLowerCase().includes(query);

      return matchesCreator && matchesSearch;
    });
  }, [services, createdByFilter, searchTerm]);

  const filteredOffres = useMemo(() => {
    const query = searchTerm.toLowerCase().trim();

    return offres.filter((offre) => {
      const matchesCreator =
        createdByFilter === "all" || offre.creePar === createdByFilter;

      const matchesSearch =
        !query ||
        offre.intituleOffre.toLowerCase().includes(query) ||
        offre.description.toLowerCase().includes(query) ||
        offre.creePar.toLowerCase().includes(query) ||
        offre.services.some((service) => service.toLowerCase().includes(query));

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

  if (loading) return <LoadingState heightClassName="min-h-40" />;

  return (
    <div className="ui-page">
      <div className="mb-6">
        <h1 className="ui-title">Catalogue</h1>

        <p className="ui-subtitle">
          {services.length} service(s) · {offres.length} offre(s)
        </p>
      </div>

      <CatalogueAdminKpiCards
        totalServices={services.length}
        activeServices={activeServices}
        totalOffres={offres.length}
        activeOffres={activeOffres}
      />

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm">
          {error}
        </div>
      )}

      <CatalogueAdminFilters
        searchTerm={searchTerm}
        createdByFilter={createdByFilter}
        creators={creators}
        hasFilters={hasFilters}
        onSearchChange={setSearchTerm}
        onCreatedByFilterChange={setCreatedByFilter}
        onResetFilters={resetFilters}
      />

      <CatalogueAdminServicesTable
        services={paginatedServices}
        filteredServices={filteredServices}
        totalItems={filteredServices.length}
        currentPage={currentServicesPage}
        totalPages={totalServicesPages}
        pageSize={PAGE_SIZE}
        onPageChange={setCurrentServicesPage}
      />

      <CatalogueAdminOffresTable
        offres={paginatedOffres}
        filteredOffres={filteredOffres}
        totalItems={filteredOffres.length}
        currentPage={currentOffresPage}
        totalPages={totalOffresPages}
        pageSize={PAGE_SIZE}
        onPageChange={setCurrentOffresPage}
      />
    </div>
  );
}