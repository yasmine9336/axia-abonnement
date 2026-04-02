import { useState, useEffect } from "react";
import axiosInstance from "../../api/axiosInstance";
import {
  Plus,
  Edit2,
  Trash2,
  Search,
  Mail,
  Phone,
  Power,
  X,
  Eye,
  EyeOff,
} from "lucide-react";

interface Responsable {
  id: string;
  username: string;
  email: string;
  phoneNumber: string | null;
  isActive: boolean;
  profileImageUrl?: string | null;
}

interface FormData {
  username: string;
  email: string;
  password: string;
  phoneNumber: string;
}

export default function ResponsablesSection() {
  const [responsables, setResponsables] = useState<Responsable[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingResp, setEditingResp] = useState<Responsable | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState<FormData>({
    username: "",
    email: "",
    password: "",
    phoneNumber: "",
  });

  useEffect(() => {
    fetchResponsables();
  }, []);

  const fetchResponsables = async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.get("/users/responsables");
      setResponsables(res.data);
    } catch {
      setError("Erreur lors du chargement des responsables.");
    } finally {
      setLoading(false);
    }
  };

  const openCreateModal = () => {
    setEditingResp(null);
    setForm({ username: "", email: "", password: "", phoneNumber: "" });
    setError("");
    setShowModal(true);
  };

  const openEditModal = (resp: Responsable) => {
    setEditingResp(resp);
    setForm({
      username: resp.username,
      email: resp.email,
      password: "",
      phoneNumber: resp.phoneNumber || "",
    });
    setError("");
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingResp(null);
    setError("");
  };

  const handleSubmit = async (e: React.BaseSyntheticEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      if (editingResp) {
        const payload: Record<string, string> = {};
        if (form.username) payload.username = form.username;
        if (form.email) payload.email = form.email;
        if (form.phoneNumber !== undefined)
          payload.phoneNumber = form.phoneNumber;
        await axiosInstance.patch(
          `/users/responsables/${editingResp.id}`,
          payload,
        );
      } else {
        await axiosInstance.post("/users/responsables", {
          username: form.username,
          email: form.email,
          password: form.password,
          phoneNumber: form.phoneNumber || null,
        });
      }
      await fetchResponsables();
      closeModal();
    } catch (err) {
      const error = err as { response?: { data?: string } };
      setError(error.response?.data || "Une erreur est survenue.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggle = async (resp: Responsable) => {
    try {
      await axiosInstance.patch(`/users/responsables/${resp.id}/toggle`);
      setResponsables((prev) =>
        prev.map((r) =>
          r.id === resp.id ? { ...r, isActive: !r.isActive } : r,
        ),
      );
    } catch {
      setError("Erreur lors du changement de statut.");
    }
  };

  const handleDelete = async (resp: Responsable) => {
    if (!confirm(`Supprimer ${resp.username} ? Cette action est irréversible.`))
      return;
    try {
      await axiosInstance.delete(`/users/responsables/${resp.id}`);
      setResponsables((prev) => prev.filter((r) => r.id !== resp.id));
    } catch {
      setError("Erreur lors de la suppression.");
    }
  };

  const filtered = responsables.filter(
    (r) =>
      r.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.email.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const activeCount = responsables.filter((r) => r.isActive).length;

  const getPhotoUrl = (photoPath?: string | null) => {
    if (!photoPath) return null;
    if (photoPath.startsWith("http")) return photoPath;
    return `https://localhost:7000${photoPath}`;
  };

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Gérer les Responsables
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            {activeCount} actif{activeCount > 1 ? "s" : ""} sur{" "}
            {responsables.length} responsable
            {responsables.length > 1 ? "s" : ""}
          </p>
        </div>
        <button
          onClick={openCreateModal}
          className="flex items-center gap-2 bg-[#4F46E5] hover:bg-[#4338CA] text-white px-5 py-2.5 rounded-xl font-medium text-sm transition-colors"
        >
          <Plus size={16} />
          Ajouter Responsable
        </button>
      </div>

      {/* Error global */}
      {error && !showModal && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm">
          {error}
        </div>
      )}

      {/* Search */}
      <div className="bg-white rounded-2xl border border-gray-200 p-4 mb-6">
        <div className="relative">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            size={16}
          />
          <input
            type="text"
            placeholder="Rechercher par nom ou email..."
            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#4F46E5]/30 focus:border-[#4F46E5] transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="bg-white rounded-2xl border border-gray-200 p-6 animate-pulse"
            >
              <div className="flex justify-between mb-4">
                <div className="w-12 h-12 bg-gray-200 rounded-full" />
                <div className="w-16 h-6 bg-gray-200 rounded-full" />
              </div>
              <div className="w-32 h-4 bg-gray-200 rounded mb-3" />
              <div className="w-48 h-3 bg-gray-200 rounded mb-2" />
              <div className="w-24 h-3 bg-gray-200 rounded mb-6" />
              <div className="flex gap-2">
                <div className="flex-1 h-9 bg-gray-200 rounded-xl" />
                <div className="w-9 h-9 bg-gray-200 rounded-xl" />
                <div className="w-9 h-9 bg-gray-200 rounded-xl" />
              </div>
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <p className="text-lg font-medium">Aucun responsable trouvé</p>
          <p className="text-sm mt-1">
            Créez votre premier responsable avec le bouton ci-dessus
          </p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((resp) => (
            <div
              key={resp.id}
              className="bg-white rounded-2xl border border-gray-200 p-6 hover:shadow-md transition-shadow"
            >
              {/* Top */}
              <div className="flex items-start justify-between mb-4">
                {getPhotoUrl(resp.profileImageUrl) ? (
                  <img
                    src={getPhotoUrl(resp.profileImageUrl)!}
                    alt={`Photo de ${resp.username}`}
                    className="w-12 h-12 rounded-full object-cover border border-gray-200"
                  />
                ) : (
                  <div className="w-12 h-12 bg-[#4F46E5] rounded-full flex items-center justify-center text-white font-bold text-lg">
                    {resp.username.charAt(0).toUpperCase()}
                  </div>
                )}
                <span
                  className={`text-xs font-semibold px-3 py-1 rounded-full ${
                    resp.isActive
                      ? "bg-green-100 text-green-700"
                      : "bg-red-100 text-red-600"
                  }`}
                >
                  {resp.isActive ? "Actif" : "Inactif"}
                </span>
              </div>

              {/* Info */}
              <h3 className="font-semibold text-gray-900 mb-3">
                {resp.username}
              </h3>
              <div className="space-y-1.5 mb-6">
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Mail size={13} />
                  <span className="truncate">{resp.email}</span>
                </div>
                {resp.phoneNumber && (
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Phone size={13} />
                    <span>{resp.phoneNumber}</span>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <button
                  onClick={() => openEditModal(resp)}
                  className="flex-1 flex items-center justify-center gap-1.5 border border-gray-200 hover:border-[#4F46E5] hover:text-[#4F46E5] text-gray-600 text-sm font-medium py-2 rounded-xl transition-colors"
                >
                  <Edit2 size={13} />
                  Modifier
                </button>
                <button
                  onClick={() => handleToggle(resp)}
                  title={resp.isActive ? "Désactiver" : "Activer"}
                  className={`p-2 rounded-xl border transition-colors ${
                    resp.isActive
                      ? "border-orange-200 text-orange-500 hover:bg-orange-50"
                      : "border-green-200 text-green-600 hover:bg-green-50"
                  }`}
                >
                  <Power size={15} />
                </button>
                <button
                  onClick={() => handleDelete(resp)}
                  title="Supprimer"
                  className="p-2 rounded-xl border border-red-200 text-red-500 hover:bg-red-50 transition-colors"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-900">
                {editingResp
                  ? "Modifier le responsable"
                  : "Ajouter un responsable"}
              </h2>
              <button
                onClick={closeModal}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Nom d'utilisateur
                </label>
                <input
                  type="text"
                  required
                  autoComplete="off"
                  value={form.username}
                  onChange={(e) =>
                    setForm({ ...form, username: e.target.value })
                  }
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#4F46E5]/30 focus:border-[#4F46E5] transition-all"
                  placeholder="ex: responsable1"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Email
                </label>
                <input
                  type="email"
                  required
                  autoComplete="off"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#4F46E5]/30 focus:border-[#4F46E5] transition-all"
                  placeholder="ex: resp@axia.com"
                />
              </div>

              {!editingResp && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Mot de passe
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      autoComplete="new-password"
                      value={form.password}
                      onChange={(e) =>
                        setForm({ ...form, password: e.target.value })
                      }
                      className="w-full px-4 py-2.5 pr-10 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#4F46E5]/30 focus:border-[#4F46E5] transition-all"
                      placeholder="Minimum 8 caractères"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Téléphone{" "}
                  <span className="text-gray-400 font-normal">(optionnel)</span>
                </label>
                <input
                  type="tel"
                  value={form.phoneNumber}
                  onChange={(e) =>
                    setForm({ ...form, phoneNumber: e.target.value })
                  }
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#4F46E5]/30 focus:border-[#4F46E5] transition-all"
                  placeholder="ex: 0612345678"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 bg-[#4F46E5] hover:bg-[#4338CA] disabled:opacity-60 text-white py-2.5 rounded-xl font-medium text-sm transition-colors"
                >
                  {submitting
                    ? "En cours..."
                    : editingResp
                      ? "Mettre à jour"
                      : "Créer"}
                </button>
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 border border-gray-200 hover:bg-gray-50 text-gray-700 py-2.5 rounded-xl font-medium text-sm transition-colors"
                >
                  Annuler
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
