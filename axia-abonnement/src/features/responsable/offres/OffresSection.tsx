import { useState, useEffect, useMemo, type FormEvent } from "react";
import axiosInstance from "../../../services/api/axiosInstance";

import LoadingState from "../../../components/common/LoadingState";

import OffresFilters from "./components/OffresFilters";
import OffresGrid from "./components/OffresGrid";
import OffreFormModal from "./components/OffreFormModal";
import DeleteOffreModal from "./components/DeleteOffreModal";

import type {
  Service,
  Offre,
  OffreForm,
  StatusFilter,
  AbonnesFilter,
} from "./types";

import { emptyForm, PAGE_SIZE } from "./types";

export default function OffresSection() {
  const [offres, setOffres] = useState<Offre[]>([]);
  const [allServices, setAllServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("tous");
  const [abonnesFilter, setAbonnesFilter] = useState<AbonnesFilter>("all");

  const [showModal, setShowModal] = useState(false);
  const [editingOffre, setEditingOffre] = useState<Offre | null>(null);
  const [form, setForm] = useState<OffreForm>(emptyForm);
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const [currentPage, setCurrentPage] = useState(1);

  const fetchOffres = async () => {
    try {
      const res = await axiosInstance.get("/offres");
      setOffres(res.data ?? []);
    } catch {
      console.error("Erreur chargement offres");
    } finally {
      setLoading(false);
    }
  };

  const fetchServices = async () => {
    try {
      const res = await axiosInstance.get("/services");
      setAllServices(res.data ?? []);
    } catch {
      console.error("Erreur chargement services");
    }
  };

  useEffect(() => {
    fetchOffres();
    fetchServices();
  }, []);

  const activeCount = useMemo(
    () => offres.filter((o) => o.isActive).length,
    [offres],
  );

  const inactiveCount = offres.length - activeCount;

  const totalAbonnes = useMemo(
    () => offres.reduce((sum, o) => sum + o.nbAbonnes, 0),
    [offres],
  );

  const totalServices = useMemo(
    () => new Set(offres.flatMap((o) => o.services)).size,
    [offres],
  );

  const filteredOffres = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();

    let result = offres;

    if (statusFilter === "actif") {
      result = result.filter((o) => o.isActive);
    }

    if (statusFilter === "inactif") {
      result = result.filter((o) => !o.isActive);
    }

    if (abonnesFilter === "withAbonnes") {
      result = result.filter((o) => o.nbAbonnes > 0);
    }

    if (abonnesFilter === "withoutAbonnes") {
      result = result.filter((o) => o.nbAbonnes === 0);
    }

    if (!term) return result;

    return result.filter(
      (o) =>
        o.intituleOffre.toLowerCase().includes(term) ||
        o.description.toLowerCase().includes(term) ||
        o.creePar.toLowerCase().includes(term) ||
        o.services.some((s) => s.toLowerCase().includes(term)),
    );
  }, [offres, searchTerm, statusFilter, abonnesFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredOffres.length / PAGE_SIZE));

  const paginatedOffres = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredOffres.slice(start, start + PAGE_SIZE);
  }, [filteredOffres, currentPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, abonnesFilter]);

  useEffect(() => {
    setCurrentPage((page) => Math.min(page, totalPages));
  }, [totalPages]);

  const hasFilters =
    searchTerm.trim() !== "" ||
    statusFilter !== "tous" ||
    abonnesFilter !== "all";

  const resetFilters = () => {
    setSearchTerm("");
    setStatusFilter("tous");
    setAbonnesFilter("all");
  };

  const handleDureeEnMoisChange = (value: number | "") => {
    setForm({ ...form, dureeEnMois: value });
  };

  const toggleService = (id: string) => {
    const selected = form.serviceIds.includes(id)
      ? form.serviceIds.filter((s) => s !== id)
      : [...form.serviceIds, id];

    setForm({ ...form, serviceIds: selected });
  };

  const openCreate = () => {
    setEditingOffre(null);
    setForm(emptyForm);
    setFormError("");
    setShowModal(true);
  };

  const openEdit = (offre: Offre) => {
    setEditingOffre(offre);

    setForm({
      intituleOffre: offre.intituleOffre,
      description: offre.description,
      dureeEnMois: offre.dureeEnMois,
      prix: offre.prix,
      serviceIds: allServices
        .filter((s) => offre.services.includes(s.intituleService))
        .map((s) => s.id),
    });

    setFormError("");
    setShowModal(true);
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFormError("");
    setFormLoading(true);

    try {
      if (editingOffre) {
        await axiosInstance.patch(`/offres/${editingOffre.id}`, form);
      } else {
        await axiosInstance.post("/offres", form);
      }

      setShowModal(false);
      await fetchOffres();
    } catch (err) {
      const error = err as { response?: { data?: unknown } };
      const data = error.response?.data;
      const msg =
        typeof data === "string"
          ? data
          : ((data as { title?: string })?.title ?? "Une erreur est survenue.");
      setFormError(msg);
    } finally {
      setFormLoading(false);
    }
  };

  const handleToggle = async (id: string) => {
    try {
      await axiosInstance.patch(`/offres/${id}/toggle`);
      await fetchOffres();
    } catch {
      console.error("Erreur toggle");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await axiosInstance.delete(`/offres/${id}`);
      setDeleteConfirm(null);
      await fetchOffres();
    } catch {
      console.error("Erreur suppression");
    }
  };

  if (loading) return <LoadingState />;

  return (
    <div className="ui-page">
      <div className="mb-6">
        <h1 className="ui-title">Gestion des offres</h1>
        <p className="ui-subtitle">Créez et gérez les offres d'abonnement.</p>
        <div className="flex flex-wrap gap-2 mt-3">
          <span className="text-xs px-3 py-1 rounded-full bg-gray-100 text-gray-600 font-medium">
            {offres.length} total
          </span>
          <span className="text-xs px-3 py-1 rounded-full bg-blue-100 text-blue-700 font-medium">
            ● {activeCount} actives
          </span>
          <span className="text-xs px-3 py-1 rounded-full bg-blue-100 text-blue-700 font-medium">
            ● {inactiveCount} inactives
          </span>
          <span className="text-xs px-3 py-1 rounded-full bg-blue-100 text-blue-600 font-medium">
            ● {totalAbonnes} abonnés
          </span>
          <span className="text-xs px-3 py-1 rounded-full bg-blue-100 text-blue-800 font-medium">
            ● {totalServices} services utilisés
          </span>
        </div>
      </div>

      <OffresFilters
        offres={offres}
        filteredOffres={filteredOffres}
        activeCount={activeCount}
        inactiveCount={inactiveCount}
        searchTerm={searchTerm}
        statusFilter={statusFilter}
        abonnesFilter={abonnesFilter}
        hasFilters={hasFilters}
        onSearchChange={setSearchTerm}
        onStatusChange={setStatusFilter}
        onAbonnesFilterChange={setAbonnesFilter}
        onResetFilters={resetFilters}
        onCreate={openCreate}
      />

      <OffresGrid
        offres={paginatedOffres}
        totalItems={filteredOffres.length}
        currentPage={currentPage}
        totalPages={totalPages}
        pageSize={PAGE_SIZE}
        onPageChange={setCurrentPage}
        onToggle={handleToggle}
        onEdit={openEdit}
        onDeleteRequest={setDeleteConfirm}
      />

      <OffreFormModal
        open={showModal}
        editingOffre={editingOffre}
        form={form}
        services={allServices}
        formLoading={formLoading}
        formError={formError}
        onClose={() => setShowModal(false)}
        onSubmit={handleSubmit}
        onFormChange={setForm}
        onDureeEnMoisChange={handleDureeEnMoisChange}
        onToggleService={toggleService}
      />

      <DeleteOffreModal
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
