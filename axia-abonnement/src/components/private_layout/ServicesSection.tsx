import { useState, useEffect } from "react";
import axiosInstance from "../../api/axiosInstance";

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

const emptyForm: ServiceForm = {
  intituleService: "",
  description: "",
  parMois: "",
  parAnnee: "",
};

export default function ServicesPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [form, setForm] = useState<ServiceForm>(emptyForm);
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 5;

  const fetchServices = async () => {
    try {
      const res = await axiosInstance.get("/services");
      setServices(res.data);
    } catch {
      console.error("Erreur chargement services");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  const filteredServices = services.filter((s) =>
    s.intituleService.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const totalPages = Math.ceil(filteredServices.length / pageSize);
  const paginatedServices = filteredServices.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  );

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

  const handleSubmit = async (e: React.BaseSyntheticEvent) => {
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
      fetchServices();
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
      fetchServices();
    } catch {
      console.error("Erreur toggle");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await axiosInstance.delete(`/services/${id}`);
      setDeleteConfirm(null);
      fetchServices();
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
            Gestion des services
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Créez et gérez les services d'abonnement
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
          Ajouter un service
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
            placeholder="Rechercher un service..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pl-9 pr-4 py-2.5 bg-gray-100 rounded-xl text-sm text-gray-700 placeholder-gray-400 outline-none focus:ring-2 focus:ring-[#4F46E5]"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-200">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-900">
            Tous les services ({filteredServices.length})
          </h2>
        </div>
        <div className="overflow-x-auto">
          {filteredServices.length === 0 ? (
            <div className="p-12 text-center">
              <p className="text-gray-500 text-sm">Aucun service trouvé</p>
            </div>
          ) : (
            <table className="w-full text-sm table-auto">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left py-3 px-4 text-xs text-gray-500 font-medium w-28">
                    Intitulé
                  </th>
                  <th className="text-left py-3 px-4 text-xs text-gray-500 font-medium w-44">
                    Description
                  </th>
                  <th className="text-left py-3 px-4 text-xs text-gray-500 font-medium w-32">
                    Prix
                  </th>

                  <th className="text-left py-3 px-4 text-xs text-gray-500 font-medium w-24">
                    Abonnés
                  </th>
                  <th className="text-left py-3 px-4 text-xs text-gray-500 font-medium w-24">
                    Offres
                  </th>
                  <th className="text-left py-3 px-4 text-xs text-gray-500 font-medium w-32">
                    Créé par
                  </th>
                  <th className="text-left py-3 px-4 text-xs text-gray-500 font-medium w-32">
                    Modifié par
                  </th>
                  <th className="text-left py-3 px-4 text-xs text-gray-500 font-medium w-20">
                    Statut
                  </th>
                  <th className="text-left py-3 px-4 text-xs text-gray-500 font-medium w-28">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {paginatedServices.map((service) => (
                  <tr
                    key={service.id}
                    className="border-b border-gray-50 hover:bg-gray-50 transition-colors"
                  >
                    <td className="py-4 px-4">
                      <p className="font-semibold text-gray-900">
                        {service.intituleService}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {new Date(service.createdAt).toLocaleDateString(
                          "fr-FR",
                        )}
                      </p>
                    </td>
                    <td className="py-4 px-4">
                      <p className="text-gray-500 text-xs max-w-xs line-clamp-2">
                        {service.description}
                      </p>
                    </td>
                    <td className="py-4 px-4">
                      <p className="text-sm font-bold text-[#4F46E5]">
                        {service.parMois} TND
                        <span className="text-xs text-gray-400 font-normal">
                          {" "}
                          /mois
                        </span>
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {service.parAnnee} TND
                        <span className="text-gray-400"> /an</span>
                      </p>
                    </td>

                    <td className="py-4 px-4">
                      <span className="text-xs font-semibold text-green-700 bg-green-50 px-2.5 py-1 rounded-full whitespace-nowrap">
                        {service.nbAbonnes} abonné
                        {service.nbAbonnes !== 1 ? "s" : ""}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <span className="text-xs font-semibold text-[#4F46E5] bg-indigo-50 px-2.5 py-1 rounded-full whitespace-nowrap">
                        {service.nbOffres} offre
                        {service.nbOffres !== 1 ? "s" : ""}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <span className="text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded-lg">
                        {service.creePar}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      {service.cbModificateur ? (
                        <div>
                          <span className="text-xs text-gray-600 bg-blue-50 px-2 py-1 rounded-lg">
                            {service.cbModificateur}
                          </span>
                          <p className="text-xs text-gray-400 mt-0.5">
                            {new Date(
                              service.cbModification!,
                            ).toLocaleDateString("fr-FR")}
                          </p>
                        </div>
                      ) : (
                        <span className="text-xs text-gray-400">—</span>
                      )}
                    </td>
                    <td className="py-4 px-4">
                      <span
                        className={`inline-block text-xs font-semibold px-2.5 py-1 rounded-full ${
                          service.isActive
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {service.isActive ? "Actif" : "Inactif"}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2">
                        {/* Toggle */}
                        <button
                          onClick={() => handleToggle(service.id)}
                          title={service.isActive ? "Désactiver" : "Activer"}
                          className={`relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors duration-300 ${
                            service.isActive ? "bg-green-500" : "bg-gray-300"
                          }`}
                        >
                          <span
                            className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow-sm transition-transform duration-300 ${
                              service.isActive
                                ? "translate-x-4"
                                : "translate-x-1"
                            }`}
                          />
                        </button>
                        {/* Edit */}
                        <button
                          onClick={() => openEdit(service)}
                          title="Modifier"
                          className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors"
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
                          onClick={() => setDeleteConfirm(service.id)}
                          title="Supprimer"
                          className="p-2 rounded-lg text-red-400 hover:bg-red-50 transition-colors"
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
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100">
              <p className="text-xs text-gray-500">
                {(currentPage - 1) * pageSize + 1}-
                {Math.min(currentPage * pageSize, filteredServices.length)} sur{" "}
                {filteredServices.length} services
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
        </div>
      </div>

      {/* Modal création/modification */}
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
                  placeholder="Décrivez le service..."
                  rows={3}
                  className="w-full bg-gray-100 rounded-xl px-4 py-3 text-sm text-gray-700 placeholder-gray-400 outline-none focus:ring-2 focus:ring-[#4F46E5] resize-none"
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
                    : editingService
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
              Supprimer le service ?
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
