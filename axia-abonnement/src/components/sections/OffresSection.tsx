import { useState, useEffect } from "react";
import axiosInstance from "../../api/axiosInstance";

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

const emptyForm: OffreForm = {
  intituleOffre: "",
  description: "",
  parMois: "",
  parAnnee: "",
  serviceIds: [],
};

export default function OffresSection() {
  const [offres, setOffres] = useState<Offre[]>([]);
  const [allServices, setAllServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingOffre, setEditingOffre] = useState<Offre | null>(null);
  const [form, setForm] = useState<OffreForm>(emptyForm);
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 3;

  const fetchOffres = async () => {
    try {
      const res = await axiosInstance.get("/offres");
      setOffres(res.data);
    } catch {
      console.error("Erreur chargement offres");
    } finally {
      setLoading(false);
    }
  };

  const fetchServices = async () => {
    try {
      const res = await axiosInstance.get("/services");
      setAllServices(res.data);
    } catch {
      console.error("Erreur chargement services");
    }
  };

  useEffect(() => {
    fetchOffres();
    fetchServices();
  }, []);

  // Calcul automatique parAnnee quand parMois change
  const handleParMoisChange = (value: number | "") => {
    if (value === "" || isNaN(Number(value))) {
      setForm({ ...form, parMois: "" });
      return;
    }
    const parAnnee = parseFloat((Number(value) * 12 * 0.8).toFixed(2));
    setForm({ ...form, parMois: value, parAnnee });
  };

  // Toggle service dans la sélection
  const toggleService = (id: string) => {
    const selected = form.serviceIds.includes(id)
      ? form.serviceIds.filter((s) => s !== id)
      : [...form.serviceIds, id];
    setForm({ ...form, serviceIds: selected });
  };

  const filteredOffres = offres.filter((o) =>
    o.intituleOffre.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const totalPages = Math.ceil(filteredOffres.length / pageSize);
  const paginatedOffres = filteredOffres.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  );

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

  const handleSubmit = async (e: React.BaseSyntheticEvent) => {
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
      fetchOffres();
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
      fetchOffres();
    } catch {
      console.error("Erreur toggle");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await axiosInstance.delete(`/offres/${id}`);
      setDeleteConfirm(null);
      fetchOffres();
    } catch {
      console.error("Erreur suppression");
    }
  };

  if (loading)
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-[#4F46E5] border-t-transparent rounded-full animate-spin" />
      </div>
    );

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Gestion des offres
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Créez et gérez les offres d'abonnement
          </p>
        </div>
        <button
          onClick={openCreate}
          className="bg-[#4F46E5] hover:bg-[#3730A3] text-white font-semibold px-5 py-2.5 rounded-xl transition-colors flex items-center gap-2 text-sm"
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
      </div>

      {/* Search */}
      <div className="bg-white rounded-2xl border border-gray-200 p-4 mb-6">
        <div className="relative">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
            />
          </svg>
          <input
            type="text"
            placeholder="Rechercher une offre..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pl-9 pr-4 py-2.5 bg-gray-100 rounded-xl text-sm text-gray-700 placeholder-gray-400 outline-none focus:ring-2 focus:ring-[#4F46E5]"
          />
        </div>
      </div>

      {/* Cards */}
      {filteredOffres.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
          <p className="text-gray-500 text-sm">Aucune offre trouvée</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 min-h-95">
            {paginatedOffres.map((offre) => (
              <div
                key={offre.id}
                className={`bg-white rounded-2xl border-2 transition-all h-95 flex flex-col ${
                  offre.isActive
                    ? "border-[#4F46E5]"
                    : "border-gray-200 opacity-70"
                }`}
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
                      {/* Toggle */}
                      <button
                        onClick={() => handleToggle(offre.id)}
                        title={offre.isActive ? "Désactiver" : "Activer"}
                        className={`relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors duration-300 ${
                          offre.isActive ? "bg-green-500" : "bg-gray-300"
                        }`}
                      >
                        <span
                          className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow-sm transition-transform duration-300 ${
                            offre.isActive ? "translate-x-4" : "translate-x-1"
                          }`}
                        />
                      </button>
                      {/* Edit */}
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
                      {/* Delete */}
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
                  {/* Prix */}
                  <div className="flex items-end gap-4">
                    <div>
                      <p className="text-xs text-gray-400 mb-0.5">Par mois</p>
                      <div className="flex items-baseline gap-1">
                        <span className="text-2xl font-bold text-[#4F46E5]">
                          {offre.parMois}
                        </span>
                        <span className="text-xs text-[#4F46E5] font-medium">
                          TND
                        </span>
                      </div>
                    </div>
                    <div className="text-gray-300 text-xl mb-1">/</div>
                    <div>
                      <p className="text-xs text-gray-400 mb-0.5">Par an</p>
                      <div className="flex items-baseline gap-1">
                        <span className="text-lg font-semibold text-gray-600">
                          {offre.parAnnee}
                        </span>
                        <span className="text-xs text-gray-500">TND</span>
                      </div>
                    </div>
                  </div>

                  {/* Services inclus */}
                  {offre.services.length > 0 && (
                    <div>
                      <p className="text-xs text-gray-400 mb-2">
                        Services inclus :
                      </p>
                      <div className="flex flex-wrap gap-1.5 max-h-20 overflow-y-auto">
                        {offre.services.map((s, i) => (
                          <span
                            key={i}
                            className="text-xs bg-indigo-50 text-[#4F46E5] px-2 py-0.5 rounded-full"
                          >
                            ✓ {s}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Footer */}
                  <div className="flex items-center justify-between pt-2 border-t border-gray-100 mt-auto">
                    <div className="flex items-center gap-1.5">
                      <svg
                        className="w-3.5 h-3.5 text-gray-400"
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
                      <span className="text-xs text-gray-500">
                        {offre.nbAbonnes} abonné
                        {offre.nbAbonnes !== 1 ? "s" : ""}
                      </span>
                    </div>
                    <span
                      className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                        offre.isActive
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {offre.isActive ? "Active" : "Inactive"}
                    </span>
                  </div>

                  {/* Créé par */}
                  <div className="text-xs text-gray-400">
                    Créé par{" "}
                    <span className="text-gray-600 font-medium">
                      {offre.creePar}
                    </span>
                    {offre.cbModificateur && (
                      <span>
                        {" "}
                        · Modifié par{" "}
                        <span className="text-gray-600 font-medium">
                          {offre.cbModificateur}
                        </span>
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-6">
              <p className="text-xs text-gray-500">
                {(currentPage - 1) * pageSize + 1}-
                {Math.min(currentPage * pageSize, filteredOffres.length)} sur{" "}
                {filteredOffres.length} offres
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage((p) => p - 1)}
                  disabled={currentPage === 1}
                  className="px-3 py-1.5 text-xs font-medium rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Précédent
                </button>
                <span className="text-xs text-gray-500">
                  {currentPage} / {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage((p) => p + 1)}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1.5 text-xs font-medium rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Suivant
                </button>
              </div>
            </div>
          )}
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
                  className="w-full bg-gray-100 rounded-xl px-4 py-3 text-sm text-gray-700 placeholder-gray-400 outline-none focus:ring-2 focus:ring-[#4F46E5]"
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
                  className="w-full bg-gray-100 rounded-xl px-4 py-3 text-sm text-gray-700 placeholder-gray-400 outline-none focus:ring-2 focus:ring-[#4F46E5] resize-none"
                  required
                />
              </div>

              {/* Services */}
              <div>
                <label className="block text-sm font-medium text-gray-800 mb-2">
                  Services inclus
                </label>
                <div className="space-y-2 max-h-40 overflow-y-auto bg-gray-50 rounded-xl p-3">
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
                          className="rounded accent-[#4F46E5]"
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
                        e.target.value === "" ? "" : parseFloat(e.target.value),
                      )
                    }
                    placeholder="0.00"
                    min="0.01"
                    step="0.01"
                    className="w-full bg-gray-100 rounded-xl px-4 py-3 text-sm text-gray-700 placeholder-gray-400 outline-none focus:ring-2 focus:ring-[#4F46E5]"
                    required
                  />
                </div>
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-800 mb-1">
                    Prix annuel <span className="text-gray-400">(TND)</span>
                    <span className="px-2 py-0.5 text-xs bg-[#EEF2FF] text-[#4F46E5] rounded-full">
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
                    className="w-full bg-gray-100 rounded-xl px-4 py-3 text-sm text-gray-700 placeholder-gray-400 outline-none focus:ring-2 focus:ring-[#4F46E5]"
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
                  className="flex-1 border border-gray-300 text-gray-600 hover:bg-gray-50 font-semibold py-3 rounded-xl transition-colors text-sm"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={formLoading}
                  className="flex-1 bg-[#4F46E5] hover:bg-[#3730A3] text-white font-semibold py-3 rounded-xl transition-colors text-sm disabled:opacity-50"
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

      {/* Modal confirmation suppression */}
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
                className="flex-1 border border-gray-300 text-gray-600 hover:bg-gray-50 font-semibold py-3 rounded-xl transition-colors text-sm"
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
