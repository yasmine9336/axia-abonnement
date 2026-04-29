import { useEffect, useMemo, useState, type FormEvent } from "react";
import axiosInstance from "../../api/axiosInstance";
import ExportButton from "./../common/ExportButton";
import { Search } from "lucide-react";

interface Service {
  id: string;
  intituleService: string;
  description: string;
  parMois: number;
  parAnnee: number;
  nbAbonnes: number;
  nbOffres: number;
  isActive: boolean;
  createdAt: string;
  creePar: string;
  cbModification: string | null;
  cbModificateur: string | null;
}

interface ServiceForm {
  intituleService: string;
  description: string;
  parMois: number | "";
  parAnnee: number | "";
}

type StatusFilter = "tous" | "actif" | "inactif";
type OffersFilter = "all" | "withOffers" | "withoutOffers";
type AbonnesFilter = "all" | "withAbonnes" | "withoutAbonnes";

const emptyForm: ServiceForm = {
  intituleService: "",
  description: "",
  parMois: "",
  parAnnee: "",
};

const PAGE_SIZE = 3;

export default function ServicesPage() {
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

  const fetchServices = async () => {
    try {
      const res = await axiosInstance.get("/services");
      setServices(res.data ?? []);
    } catch {
      console.error("Erreur chargement services");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  const activeCount = useMemo(
    () => services.filter((s) => s.isActive).length,
    [services],
  );

  const inactiveCount = services.length - activeCount;

  const totalAbonnes = useMemo(
    () => services.reduce((sum, s) => sum + s.nbAbonnes, 0),
    [services],
  );

  const totalOffres = useMemo(
    () => services.reduce((sum, s) => sum + s.nbOffres, 0),
    [services],
  );

  const filteredServices = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();

    let result = services;

    if (statusFilter === "actif") {
      result = result.filter((s) => s.isActive);
    }

    if (statusFilter === "inactif") {
      result = result.filter((s) => !s.isActive);
    }

    if (creatorFilter !== "all") {
      result = result.filter((s) => s.creePar === creatorFilter);
    }

    if (abonnesFilter === "withAbonnes") {
      result = result.filter((s) => s.nbAbonnes > 0);
    }

    if (abonnesFilter === "withoutAbonnes") {
      result = result.filter((s) => s.nbAbonnes === 0);
    }

    if (offersFilter === "withOffers") {
      result = result.filter((s) => s.nbOffres > 0);
    }

    if (offersFilter === "withoutOffers") {
      result = result.filter((s) => s.nbOffres === 0);
    }

    if (!term) return result;

    return result.filter(
      (s) =>
        s.intituleService.toLowerCase().includes(term) ||
        (s.description ?? "").toLowerCase().includes(term) ||
        (s.creePar ?? "").toLowerCase().includes(term),
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

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
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

  const renderPagination = () => {
    if (totalPages <= 1) return null;

    return (
      <div className="flex items-center justify-between pt-5 mt-6 border-t border-gray-100">
        <p className="text-xs text-gray-500">
          Affichage de {(currentPage - 1) * PAGE_SIZE + 1} à{" "}
          {Math.min(currentPage * PAGE_SIZE, filteredServices.length)} sur{" "}
          {filteredServices.length} service(s)
        </p>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="ui-btn-secondary text-xs disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Précédent
          </button>

          <span className="text-xs text-gray-500">
            {currentPage} / {totalPages}
          </span>

          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
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
      sub: `${activeCount} actif${activeCount !== 1 ? "s" : ""}`,
      border: "border-t-blue-500",
      icon: (
        <svg
          className="w-5 h-5 text-blue-600"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586"
          />
        </svg>
      ),
    },
    {
      label: "SERVICES ACTIFS",
      value: activeCount,
      sub: `${inactiveCount} inactif${inactiveCount !== 1 ? "s" : ""}`,
      border: "border-t-green-400",
      icon: (
        <svg
          className="w-5 h-5 text-green-500"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      ),
    },
    {
      label: "TOTAL ABONNÉS",
      value: totalAbonnes,
      sub: "tous services confondus",
      border: "border-t-orange-400",
      icon: (
        <svg
          className="w-5 h-5 text-orange-500"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z"
          />
        </svg>
      ),
    },
    {
      label: "OFFRES LIÉES",
      value: totalOffres,
      sub: "offres utilisant ces services",
      border: "border-t-indigo-400",
      icon: (
        <svg
          className="w-5 h-5 text-indigo-500"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 005.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 009.568 3z"
          />
        </svg>
      ),
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="ui-spinner" />
      </div>
    );
  }

  return (
    <div className="ui-page">
      <div className="mb-8">
        <h1 className="ui-title">Gestion des services</h1>
        <p className="ui-subtitle">Créez et gérez les services d'abonnement.</p>
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

      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <div className="flex flex-col gap-4 mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <h2 className="text-lg font-bold text-gray-900">
              Tous les services ({filteredServices.length})
            </h2>

            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              <button
                onClick={openCreate}
                className="ui-btn-primary flex items-center justify-center gap-2 px-4 py-2.5"
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
                    d="M12 4.5v15m7.5-7.5h-15"
                  />
                </svg>
                Ajouter un service
              </button>

              <ExportButton
                data={filteredServices}
                columns={[
                  { key: "intituleService", label: "Intitulé" },
                  { key: "description", label: "Description" },
                  { key: "parMois", label: "Prix/mois (TND)" },
                  { key: "parAnnee", label: "Prix/an (TND)" },
                  { key: "nbAbonnes", label: "Abonnés" },
                  { key: "nbOffres", label: "Offres liées" },
                  { key: "creePar", label: "Créé par" },
                  {
                    key: "isActive",
                    label: "Statut",
                    format: (v) => (v ? "Actif" : "Inactif"),
                  },
                ]}
                filename="services"
                label="Exporter"
                sheetName="Services"
                pdfTitle="Liste des services"
              />
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="inline-flex bg-gray-50 border border-gray-200 rounded-xl p-1">
              {(["tous", "actif", "inactif"] as const).map((t) => {
                const active = statusFilter === t;

                const count =
                  t === "tous"
                    ? services.length
                    : t === "actif"
                      ? activeCount
                      : inactiveCount;

                return (
                  <button
                    key={t}
                    onClick={() => setStatusFilter(t)}
                    className={`px-3 py-2 text-sm rounded-lg font-medium transition ${
                      active
                        ? "bg-white shadow-sm text-(--color-primary)"
                        : "text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    {t === "tous"
                      ? "Tous"
                      : t === "actif"
                        ? "Actifs"
                        : "Inactifs"}
                    <span className="ml-1 text-xs font-semibold">{count}</span>
                  </button>
                );
              })}
            </div>

            <div className="relative flex-1 min-w-64">
              <Search
                className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                size={16}
              />

              <input
                type="text"
                placeholder="Rechercher par service, description ou créateur..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="ui-input w-full pl-11! pr-4"
              />
            </div>


            <select
              value={abonnesFilter}
              onChange={(e) =>
                setAbonnesFilter(e.target.value as AbonnesFilter)
              }
              className="h-10 min-w-44 rounded-xl border border-gray-200 bg-white px-3 text-sm text-gray-700 outline-none focus:border-(--color-primary)"
            >
              <option value="all">Tous les abonnés</option>
              <option value="withAbonnes">Avec abonnés</option>
              <option value="withoutAbonnes">Sans abonné</option>
            </select>

            <select
              value={offersFilter}
              onChange={(e) => setOffersFilter(e.target.value as OffersFilter)}
              className="h-10 min-w-44 rounded-xl border border-gray-200 bg-white px-3 text-sm text-gray-700 outline-none focus:border-(--color-primary)"
            >
              <option value="all">Toutes les liaisons</option>
              <option value="withOffers">Liés à une offre</option>
              <option value="withoutOffers">Sans offre liée</option>
            </select>

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

        {filteredServices.length === 0 ? (
          <div className="py-12 text-center">
            <p className="text-gray-500 text-sm">Aucun service trouvé</p>
          </div>
        ) : (
          <>
            <div className="grid gap-4 grid-cols-[repeat(auto-fit,minmax(260px,360px))] justify-start">
              {paginatedServices.map((service) => (
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
                      onClick={() => handleToggle(service.id)}
                      title={service.isActive ? "Désactiver" : "Activer"}
                      className={`relative inline-flex h-7 w-12 shrink-0 items-center rounded-full transition-colors duration-300 ${
                        service.isActive
                          ? "bg-(--color-primary)"
                          : "bg-gray-300"
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
                        onClick={() => openEdit(service)}
                        className="px-3 py-2 rounded-xl border text-sm font-semibold transition flex items-center gap-1.5 hover:opacity-80"
                        style={{
                          borderColor: "var(--color-primary)",
                          color: "var(--color-primary)",
                        }}
                      >
                        <svg
                          className="w-3.5 h-3.5"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth={2}
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z"
                          />
                        </svg>
                        Modifier
                      </button>

                      <button
                        onClick={() => setDeleteConfirm(service.id)}
                        className="w-9 h-9 rounded-xl border border-red-200 text-red-400 hover:bg-red-50 transition flex items-center justify-center"
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
              ))}
            </div>

            {renderPagination()}
          </>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl w-full max-w-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-gray-900">
                {editingService ? "Modifier le service" : "Ajouter un service"}
              </h2>

              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-800 mb-1">
                  Intitulé du service
                </label>

                <input
                  type="text"
                  value={form.intituleService}
                  onChange={(e) =>
                    setForm({ ...form, intituleService: e.target.value })
                  }
                  placeholder="Ex: Salle de sport"
                  className="ui-input"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-800 mb-1">
                  Description
                </label>

                <textarea
                  value={form.description}
                  onChange={(e) =>
                    setForm({ ...form, description: e.target.value })
                  }
                  placeholder="Décrivez le service..."
                  rows={3}
                  className="ui-input resize-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-800 mb-1">
                    Prix / mois <span className="text-gray-400">(TND)</span>
                  </label>

                  <input
                    type="number"
                    value={form.parMois}
                    onChange={(e) => {
                      const val =
                        e.target.value === "" ? "" : parseFloat(e.target.value);
                      const annee =
                        val === ""
                          ? ""
                          : parseFloat((Number(val) * 12 * 0.8).toFixed(2));

                      setForm({ ...form, parMois: val, parAnnee: annee });
                    }}
                    placeholder="0.00"
                    min="0.01"
                    step="0.01"
                    className="ui-input"
                    required
                  />
                </div>

                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-800 mb-1">
                    Prix annuel <span className="text-gray-400">(TND)</span>
                    <span
                      className="px-2 py-0.5 text-xs rounded-full"
                      style={{
                        background: "var(--color-primary-soft)",
                        color: "var(--color-primary)",
                      }}
                    >
                      -20%
                    </span>
                  </label>

                  <input
                    type="number"
                    value={form.parAnnee}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        parAnnee:
                          e.target.value === ""
                            ? ""
                            : parseFloat(e.target.value),
                      })
                    }
                    placeholder="0.00"
                    min="0.01"
                    step="0.01"
                    className="ui-input"
                    required
                  />
                </div>
              </div>

              {formError && (
                <div className="p-3 bg-red-50 border border-red-100 rounded-xl">
                  <p className="text-sm text-red-700">{formError}</p>
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 border border-gray-200 text-gray-600 hover:bg-gray-50 font-semibold py-3 rounded-xl transition-colors text-sm"
                >
                  Annuler
                </button>

                <button
                  type="submit"
                  disabled={formLoading}
                  className="flex-1 ui-btn-primary py-3 disabled:opacity-50"
                >
                  {formLoading
                    ? "Enregistrement..."
                    : editingService
                      ? "Modifier"
                      : "Créer"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl w-full max-w-sm p-6 text-center">
            <h3 className="text-lg font-bold text-gray-900 mb-2">
              Supprimer le service ?
            </h3>

            <p className="text-sm text-gray-500 mb-6">
              Cette action est irréversible.
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 border border-gray-200 text-gray-600 hover:bg-gray-50 font-semibold py-3 rounded-xl transition-colors text-sm"
              >
                Annuler
              </button>

              <button
                onClick={() => handleDelete(deleteConfirm)}
                className="flex-1 bg-red-500 hover:bg-red-600 text-white font-semibold py-3 rounded-xl transition-colors text-sm"
              >
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}