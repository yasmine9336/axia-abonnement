import { useState, useEffect, useMemo, type FormEvent } from "react";
import axiosInstance from "../../api/axiosInstance";
import ExportButton from "../common/ExportButton";
import { Search } from "lucide-react";

interface Service {
  id: string;
  intituleService: string;
}

interface Offre {
  id: string;
  intituleOffre: string;
  description: string;
  parMois: number;
  parAnnee: number;
  nbAbonnes: number;
  isActive: boolean;
  createdAt: string;
  creePar: string;
  cbModification: string | null;
  cbModificateur: string | null;
  services: string[];
}

interface OffreForm {
  intituleOffre: string;
  description: string;
  parMois: number | "";
  parAnnee: number | "";
  serviceIds: string[];
}

type StatusFilter = "tous" | "actif" | "inactif";
type ServicesFilter = "all" | "withServices" | "withoutServices";
type AbonnesFilter = "all" | "withAbonnes" | "withoutAbonnes";

const emptyForm: OffreForm = {
  intituleOffre: "",
  description: "",
  parMois: "",
  parAnnee: "",
  serviceIds: [],
};

const PAGE_SIZE = 3;

export default function OffresSection() {
  const [offres, setOffres] = useState<Offre[]>([]);
  const [allServices, setAllServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("tous");
  const [creatorFilter, setCreatorFilter] = useState("all");
  const [servicesFilter, setServicesFilter] =
    useState<ServicesFilter>("all");
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

    if (creatorFilter !== "all") {
      result = result.filter((o) => o.creePar === creatorFilter);
    }

    if (servicesFilter === "withServices") {
      result = result.filter((o) => o.services.length > 0);
    }

    if (servicesFilter === "withoutServices") {
      result = result.filter((o) => o.services.length === 0);
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
  }, [
    offres,
    searchTerm,
    statusFilter,
    creatorFilter,
    servicesFilter,
    abonnesFilter,
  ]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredOffres.length / PAGE_SIZE),
  );

  const paginatedOffres = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredOffres.slice(start, start + PAGE_SIZE);
  }, [filteredOffres, currentPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [
    searchTerm,
    statusFilter,
    creatorFilter,
    servicesFilter,
    abonnesFilter,
  ]);

  useEffect(() => {
    setCurrentPage((page) => Math.min(page, totalPages));
  }, [totalPages]);

  const hasFilters =
    searchTerm.trim() !== "" ||
    statusFilter !== "tous" ||
    creatorFilter !== "all" ||
    servicesFilter !== "all" ||
    abonnesFilter !== "all";

  const resetFilters = () => {
    setSearchTerm("");
    setStatusFilter("tous");
    setCreatorFilter("all");
    setServicesFilter("all");
    setAbonnesFilter("all");
  };

  const handleParMoisChange = (value: number | "") => {
    if (value === "" || isNaN(Number(value))) {
      setForm({ ...form, parMois: "" });
      return;
    }

    const parAnnee = parseFloat((Number(value) * 12 * 0.8).toFixed(2));
    setForm({ ...form, parMois: value, parAnnee });
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
      parMois: offre.parMois,
      parAnnee: offre.parAnnee,
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
      const error = err as { response?: { data?: string } };
      setFormError(error.response?.data || "Une erreur est survenue.");
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

  const renderPagination = () => {
    if (totalPages <= 1) return null;

    return (
      <div className="flex items-center justify-between mt-6 pt-5 border-t border-gray-100">
        <p className="text-xs text-gray-500">
          Affichage de {(currentPage - 1) * PAGE_SIZE + 1} à{" "}
          {Math.min(currentPage * PAGE_SIZE, filteredOffres.length)} sur{" "}
          {filteredOffres.length} offre(s)
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
      label: "TOTAL OFFRES",
      value: offres.length,
      sub: `${activeCount} active${activeCount !== 1 ? "s" : ""}`,
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
            d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 005.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 009.568 3z"
          />
        </svg>
      ),
    },
    {
      label: "OFFRES ACTIVES",
      value: activeCount,
      sub: `${inactiveCount} inactive${inactiveCount !== 1 ? "s" : ""}`,
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
      sub: "toutes offres confondues",
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
      label: "SERVICES UNIQUES",
      value: totalServices,
      sub: "utilisés dans les offres",
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
            d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z"
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
        <h1 className="ui-title">Gestion des offres</h1>
        <p className="ui-subtitle">Créez et gérez les offres d'abonnement.</p>
      </div>

      {/* KPI Cards */}
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

      {/* Bloc principal */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-6">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <h2 className="text-lg font-bold text-gray-900">
              Toutes les offres ({filteredOffres.length})
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
                Ajouter une offre
              </button>

              <ExportButton
                data={filteredOffres}
                columns={[
                  { key: "intituleOffre", label: "Intitulé" },
                  { key: "description", label: "Description" },
                  { key: "parMois", label: "Prix/mois (TND)" },
                  { key: "parAnnee", label: "Prix/an (TND)" },
                  { key: "nbAbonnes", label: "Abonnés" },
                  {
                    key: "services",
                    label: "Services inclus",
                    format: (v) => (Array.isArray(v) ? v.join(", ") : ""),
                  },
                  { key: "creePar", label: "Créé par" },
                  {
                    key: "isActive",
                    label: "Statut",
                    format: (v) => (v ? "Active" : "Inactive"),
                  },
                ]}
                filename="offres"
                label="Exporter"
                sheetName="Offres"
                pdfTitle="Liste des offres"
              />
            </div>
          </div>

          {/* Filtres */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="inline-flex bg-gray-50 border border-gray-200 rounded-xl p-1">
              {(["tous", "actif", "inactif"] as const).map((t) => {
                const active = statusFilter === t;

                const count =
                  t === "tous"
                    ? offres.length
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
                        ? "Actives"
                        : "Inactives"}
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
                placeholder="Rechercher par offre, description, service ou créateur..."
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
      </div>

      {/* Cards */}
      {filteredOffres.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
          <p className="text-gray-500 text-sm">Aucune offre trouvée</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {paginatedOffres.map((offre) => (
              <div
                key={offre.id}
                className="bg-white rounded-2xl border border-gray-200 hover:shadow-sm transition-shadow flex flex-col"
              >
                {/* Card Header */}
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
                        onClick={() => handleToggle(offre.id)}
                        title={offre.isActive ? "Désactiver" : "Activer"}
                        className={`relative inline-flex h-6 w-10 shrink-0 items-center rounded-full transition-colors duration-300 ${
                          offre.isActive
                            ? "bg-(--color-primary)"
                            : "bg-gray-300"
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform duration-300 ${
                            offre.isActive ? "translate-x-5" : "translate-x-1"
                          }`}
                        />
                      </button>

                      <button
                        onClick={() => openEdit(offre)}
                        className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors"
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
                        onClick={() => setDeleteConfirm(offre.id)}
                        className="p-1.5 rounded-lg text-red-400 hover:bg-red-50 transition-colors"
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

                {/* Card Body */}
                <div className="p-5 space-y-4 flex-1 flex flex-col">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-gray-50 rounded-xl border border-gray-100 p-3">
                      <p className="text-xs text-gray-400 font-semibold tracking-wide mb-1">
                        PAR MOIS
                      </p>

                      <p className="text-lg font-extrabold text-(--color-primary)">
                        {offre.parMois}{" "}
                        <span className="text-xs font-semibold text-gray-400">
                          TND
                        </span>
                      </p>
                    </div>

                    <div className="bg-gray-50 rounded-xl border border-gray-100 p-3">
                      <p className="text-xs text-gray-400 font-semibold tracking-wide mb-1">
                        PAR AN
                      </p>

                      <p className="text-lg font-extrabold text-green-600">
                        {offre.parAnnee}{" "}
                        <span className="text-xs font-semibold text-gray-400">
                          TND
                        </span>
                      </p>
                    </div>
                  </div>

                  {offre.services.length > 0 && (
                    <div>
                      <p className="text-xs text-gray-400 mb-2">
                        SERVICES INCLUS
                      </p>

                      <div className="flex flex-wrap gap-1.5">
                        {offre.services.map((s, i) => (
                          <span
                            key={i}
                            className="text-xs bg-(--color-primary-soft) text-(--color-primary) px-2 py-0.5 rounded-full"
                          >
                            ✓ {s}
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

          {renderPagination()}
        </>
      )}

      {/* Modal création/modification */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-gray-900">
                {editingOffre ? "Modifier l'offre" : "Ajouter une offre"}
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
                  Intitulé de l'offre
                </label>

                <input
                  type="text"
                  value={form.intituleOffre}
                  onChange={(e) =>
                    setForm({ ...form, intituleOffre: e.target.value })
                  }
                  placeholder="Ex: Pack Entrepreneur"
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
                  placeholder="Décrivez l'offre..."
                  rows={2}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-700 placeholder-gray-400 outline-none focus:ring-2 focus:ring-[#0F6CBD]/30 focus:border-[#0F6CBD] resize-none"
                  required
                />
              </div>

              {/* Services */}
              <div>
                <label className="block text-sm font-medium text-gray-800 mb-2">
                  Services inclus
                </label>

                <div className="space-y-2 max-h-40 overflow-y-auto bg-gray-50 border border-gray-200 rounded-xl p-3">
                  {allServices.length === 0 ? (
                    <p className="text-xs text-gray-400 text-center py-2">
                      Aucun service disponible
                    </p>
                  ) : (
                    allServices.map((s) => (
                      <label
                        key={s.id}
                        className="flex items-center gap-2 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={form.serviceIds.includes(s.id)}
                          onChange={() => toggleService(s.id)}
                          className="rounded accent-(--color-primary)"
                        />

                        <span className="text-sm text-gray-700">
                          {s.intituleService}
                        </span>
                      </label>
                    ))
                  )}
                </div>
              </div>

              {/* Prix */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-800 mb-1">
                    Prix / mois <span className="text-gray-400">(TND)</span>
                  </label>

                  <input
                    type="number"
                    value={form.parMois}
                    onChange={(e) =>
                      handleParMoisChange(
                        e.target.value === ""
                          ? ""
                          : parseFloat(e.target.value),
                      )
                    }
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
                    <span className="px-2 py-0.5 text-xs bg-(--color-primary-soft) text-(--color-primary) rounded-full">
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
                    : editingOffre
                      ? "Modifier"
                      : "Créer"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal suppression */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl w-full max-w-sm p-6 text-center">
            <h3 className="text-lg font-bold text-gray-900 mb-2">
              Supprimer l'offre ?
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