import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type FormEvent,
} from "react";

import axiosInstance from "../../../api/axiosInstance";

import LoadingState from "../../../components/common/LoadingState";

import ServicesKpiCards from "./components/ServicesKpiCards";
import ServicesFilters from "./components/ServicesFilters";
import ServicesGrid from "./components/ServicesGrid";
import ServiceFormModal from "./components/ServiceFormModal";
import DeleteServiceModal from "./components/DeleteServiceModal";

import type {
  Service,
  ServiceForm,
  StatusFilter,
  OffersFilter,
  AbonnesFilter,
} from "./types";

import { emptyForm, PAGE_SIZE } from "./types";

export default function ServicesSection() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("tous");
  const [creatorFilter, setCreatorFilter] = useState("all");
  const [abonnesFilter, setAbonnesFilter] = useState<AbonnesFilter>("all");
  const [offersFilter, setOffersFilter] = useState<OffersFilter>("all");

  const [showModal, setShowModal] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [form, setForm] = useState<ServiceForm>(emptyForm);
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const [currentPage, setCurrentPage] = useState(1);

  const fetchServices = useCallback(async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.get("/services");
      setServices(res.data ?? []);
    } catch {
      console.error("Erreur chargement services");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchServices();
  }, [fetchServices]);

  const activeCount = useMemo(
    () => services.filter((service) => service.isActive).length,
    [services],
  );

  const inactiveCount = services.length - activeCount;

  const totalAbonnes = useMemo(
    () => services.reduce((sum, service) => sum + service.nbAbonnes, 0),
    [services],
  );

  const totalOffres = useMemo(
    () => services.reduce((sum, service) => sum + service.nbOffres, 0),
    [services],
  );

  const filteredServices = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();

    let result = services;

    if (statusFilter === "actif") {
      result = result.filter((service) => service.isActive);
    }

    if (statusFilter === "inactif") {
      result = result.filter((service) => !service.isActive);
    }

    if (creatorFilter !== "all") {
      result = result.filter((service) => service.creePar === creatorFilter);
    }

    if (abonnesFilter === "withAbonnes") {
      result = result.filter((service) => service.nbAbonnes > 0);
    }

    if (abonnesFilter === "withoutAbonnes") {
      result = result.filter((service) => service.nbAbonnes === 0);
    }

    if (offersFilter === "withOffers") {
      result = result.filter((service) => service.nbOffres > 0);
    }

    if (offersFilter === "withoutOffers") {
      result = result.filter((service) => service.nbOffres === 0);
    }

    if (!term) return result;

    return result.filter(
      (service) =>
        service.intituleService.toLowerCase().includes(term) ||
        (service.description ?? "").toLowerCase().includes(term) ||
        (service.creePar ?? "").toLowerCase().includes(term),
    );
  }, [
    services,
    searchTerm,
    statusFilter,
    creatorFilter,
    abonnesFilter,
    offersFilter,
  ]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredServices.length / PAGE_SIZE),
  );

  const paginatedServices = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredServices.slice(start, start + PAGE_SIZE);
  }, [filteredServices, currentPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, creatorFilter, abonnesFilter, offersFilter]);

  useEffect(() => {
    setCurrentPage((page) => Math.min(page, totalPages));
  }, [totalPages]);

  const hasFilters =
    searchTerm.trim() !== "" ||
    statusFilter !== "tous" ||
    creatorFilter !== "all" ||
    abonnesFilter !== "all" ||
    offersFilter !== "all";

  const resetFilters = () => {
    setSearchTerm("");
    setStatusFilter("tous");
    setCreatorFilter("all");
    setAbonnesFilter("all");
    setOffersFilter("all");
  };

  const openCreate = () => {
    setEditingService(null);
    setForm(emptyForm);
    setFormError("");
    setShowModal(true);
  };

  const openEdit = (service: Service) => {
    setEditingService(service);

    setForm({
      intituleService: service.intituleService,
      description: service.description,
      parMois: service.parMois,
      parAnnee: service.parAnnee,
    });

    setFormError("");
    setShowModal(true);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setFormError("");
    setFormLoading(true);

    try {
      if (editingService) {
        await axiosInstance.patch(`/services/${editingService.id}`, form);
      } else {
        await axiosInstance.post("/services", form);
      }

      setShowModal(false);
      await fetchServices();
    } catch (err) {
      const error = err as { response?: { data?: string } };
      setFormError(error.response?.data || "Une erreur est survenue.");
    } finally {
      setFormLoading(false);
    }
  };

  const handleToggle = async (id: string) => {
    try {
      await axiosInstance.patch(`/services/${id}/toggle`);
      await fetchServices();
    } catch {
      console.error("Erreur toggle");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await axiosInstance.delete(`/services/${id}`);
      setDeleteConfirm(null);
      await fetchServices();
    } catch {
      console.error("Erreur suppression");
    }
  };

  if (loading) return <LoadingState />;

  return (
    <div className="ui-page">
      <div className="mb-8">
        <h1 className="ui-title">Gestion des services</h1>
        <p className="ui-subtitle">Créez et gérez les services d'abonnement.</p>
      </div>

      <ServicesKpiCards
        totalServices={services.length}
        activeCount={activeCount}
        inactiveCount={inactiveCount}
        totalAbonnes={totalAbonnes}
        totalOffres={totalOffres}
      />

      <ServicesFilters
        services={services}
        filteredServices={filteredServices}
        activeCount={activeCount}
        inactiveCount={inactiveCount}
        searchTerm={searchTerm}
        statusFilter={statusFilter}
        abonnesFilter={abonnesFilter}
        offersFilter={offersFilter}
        hasFilters={hasFilters}
        onSearchChange={setSearchTerm}
        onStatusChange={setStatusFilter}
        onAbonnesFilterChange={setAbonnesFilter}
        onOffersFilterChange={setOffersFilter}
        onResetFilters={resetFilters}
        onCreate={openCreate}
      />

      <ServicesGrid
        services={paginatedServices}
        totalItems={filteredServices.length}
        currentPage={currentPage}
        totalPages={totalPages}
        pageSize={PAGE_SIZE}
        onPageChange={setCurrentPage}
        onToggle={handleToggle}
        onEdit={openEdit}
        onDeleteRequest={setDeleteConfirm}
      />

      <ServiceFormModal
        open={showModal}
        editingService={editingService}
        form={form}
        formLoading={formLoading}
        formError={formError}
        onClose={() => setShowModal(false)}
        onSubmit={handleSubmit}
        onFormChange={setForm}
      />

      <DeleteServiceModal
        open={Boolean(deleteConfirm)}
        onCancel={() => setDeleteConfirm(null)}
        onConfirm={() => {
          if (deleteConfirm) {
            void handleDelete(deleteConfirm);
          }
        }}
      />
    </div>
  );
}