import { useState, useEffect, useCallback, useMemo } from "react";
import axiosInstance from "../../api/axiosInstance";
import ExportButton from "../common/ExportButton";
import { API_URL } from "../../api/config";
import {
  Trash2, Search, Mail, Phone, Power, X, Eye, EyeOff,
  Building2, FileText, MapPin, Briefcase, CheckCircle2,
  XCircle, Clock, Users, ClipboardList,
} from "lucide-react";

interface Responsable {
  id: string;
  username: string;
  email: string;
  phoneNumber: string | null;
  isActive: boolean;
  profileImageUrl?: string | null;
}

interface DemandeResponsable {
  id: string;
  username: string;
  email: string;
  phoneNumber: string | null;
  nomEntreprise: string | null;
  matriculeFiscal: string | null;
  secteurActivite: string | null;
  adresseProfessionnelle: string | null;
  statut: string;
  createdAt: string;
  dateAcceptation: string | null;
  motifRefus: string | null;
}

interface FormData {
  username: string;
  email: string;
  password: string;
  phoneNumber: string;
}

type Tab = "actifs" | "demandes";
type FilterStatut = "All" | "Pending" | "Accepted" | "Rejected";
type ConfirmAction =
  | { type: "accept"; demande: DemandeResponsable }
  | { type: "reject"; demande: DemandeResponsable }
  | null;

const STATUT_LABEL: Record<string, string> = {
  Pending: "En attente",
  Accepted: "Acceptée",
  Rejected: "Refusée",
};

const STATUT_STYLES: Record<string, string> = {
  Pending: "bg-yellow-100 text-yellow-700",
  Accepted: "bg-green-100 text-green-700",
  Rejected: "bg-red-100 text-red-600",
};

export default function ResponsablesSection() {
  const [tab, setTab] = useState<Tab>("actifs");
  const [responsables, setResponsables] = useState<Responsable[]>([]);
  const [loadingActifs, setLoadingActifs] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState<FormData>({ username: "", email: "", password: "", phoneNumber: "" });
  const [demandes, setDemandes] = useState<DemandeResponsable[]>([]);
  const [loadingDemandes, setLoadingDemandes] = useState(true);
  const [filter, setFilter] = useState<FilterStatut>("Pending");
  const [searchDemandes, setSearchDemandes] = useState("");
  const [confirmAction, setConfirmAction] = useState<ConfirmAction>(null);
  const [motifRefus, setMotifRefus] = useState("");
  const [submittingDemande, setSubmittingDemande] = useState(false);
  const [toast, setToast] = useState("");

  const fetchResponsables = useCallback(async () => {
    try {
      setLoadingActifs(true);
      const res = await axiosInstance.get("/users/responsables");
      setResponsables(res.data);
    } catch {
      setError("Erreur lors du chargement des responsables.");
    } finally {
      setLoadingActifs(false);
    }
  }, []);

  const fetchDemandes = useCallback(async () => {
    try {
      setLoadingDemandes(true);
      const params = filter === "All" ? "" : `?statut=${filter}`;
      const res = await axiosInstance.get(`/demandes-responsables${params}`);
      setDemandes(res.data);
    } catch {
      setError("Erreur lors du chargement des demandes.");
    } finally {
      setLoadingDemandes(false);
    }
  }, [filter]);

  useEffect(() => { fetchResponsables(); }, [fetchResponsables]);
  useEffect(() => { fetchDemandes(); }, [fetchDemandes]);

  const closeModal = () => { setShowModal(false); setError(""); };

  const handleSubmit = async (e: React.BaseSyntheticEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      await axiosInstance.post("/users/responsables", {
        username: form.username, email: form.email,
        password: form.password, phoneNumber: form.phoneNumber || null,
      });
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
      setResponsables((prev) => prev.map((r) => r.id === resp.id ? { ...r, isActive: !r.isActive } : r));
    } catch {
      setError("Erreur lors du changement de statut.");
    }
  };

  const handleDelete = async (resp: Responsable) => {
    if (!confirm(`Supprimer ${resp.username} ? Cette action est irréversible.`)) return;
    try {
      await axiosInstance.delete(`/users/responsables/${resp.id}`);
      setResponsables((prev) => prev.filter((r) => r.id !== resp.id));
    } catch {
      setError("Erreur lors de la suppression.");
    }
  };

  const showToastMsg = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(""), 3500);
  };

  const handleConfirmDemande = async () => {
    if (!confirmAction) return;
    setSubmittingDemande(true);
    setError("");
    try {
      if (confirmAction.type === "accept") {
        await axiosInstance.patch(`/demandes-responsables/${confirmAction.demande.id}/accepter`);
        showToastMsg(`Demande de ${confirmAction.demande.username} acceptée. Un email avec le lien de paiement a été envoyé.`);
      } else {
        await axiosInstance.patch(`/demandes-responsables/${confirmAction.demande.id}/refuser`, { motif: motifRefus.trim() || null });
        showToastMsg(`Demande de ${confirmAction.demande.username} refusée.`);
      }
      setConfirmAction(null);
      setMotifRefus("");
      await fetchDemandes();
    } catch {
      setError("Une erreur est survenue. Réessayez.");
    } finally {
      setSubmittingDemande(false);
    }
  };

  const activeCount = useMemo(() => responsables.filter((r) => r.isActive).length, [responsables]);
  const inactiveCount = responsables.length - activeCount;
  const pendingCount = useMemo(() => demandes.filter((d) => d.statut === "Pending").length, [demandes]);

  const filteredActifs = useMemo(() => {
    const q = searchTerm.toLowerCase().trim();
    if (!q) return responsables;
    return responsables.filter((r) => r.username.toLowerCase().includes(q) || r.email.toLowerCase().includes(q));
  }, [responsables, searchTerm]);

  const filteredDemandes = useMemo(() => {
    const q = searchDemandes.toLowerCase().trim();
    if (!q) return demandes;
    return demandes.filter((d) =>
      d.username.toLowerCase().includes(q) ||
      d.email.toLowerCase().includes(q) ||
      (d.nomEntreprise ?? "").toLowerCase().includes(q)
    );
  }, [demandes, searchDemandes]);

  const getPhotoUrl = (photoPath?: string | null) => {
    if (!photoPath) return null;
    if (photoPath.startsWith("http")) return photoPath;
    return `${API_URL}${photoPath}`;
  };

  const kpiCards = [
    { label: "TOTAL RESPONSABLES", value: responsables.length, sub: `${activeCount} actif(s)`, icon: <Users className="w-5 h-5 text-blue-600" />, border: "border-t-blue-500" },
    { label: "ACTIFS", value: activeCount, sub: `${inactiveCount} inactif(s)`, icon: <CheckCircle2 className="w-5 h-5 text-green-500" />, border: "border-t-green-400" },
    { label: "TOTAL DEMANDES", value: demandes.length, sub: "toutes confondues", icon: <ClipboardList className="w-5 h-5 text-blue-500" />, border: "border-t-blue-400" },
    { label: "EN ATTENTE", value: pendingCount, sub: "demandes à traiter", icon: <Clock className="w-5 h-5 text-orange-500" />, border: "border-t-orange-400" },
  ];

  return (
    <div className="ui-page">
      {/* Header */}
      <div className="mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="ui-title">Gérer les Responsables</h1>
          <p className="ui-subtitle">
            {activeCount} actif(s) · {pendingCount} en attente · {responsables.length} total
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {kpiCards.map((card) => (
          <div key={card.label} className={`bg-white rounded-2xl border border-gray-200 border-t-4 ${card.border} p-5`}>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs text-gray-400 font-medium tracking-wide mb-2">{card.label}</p>
                <p className="text-3xl font-bold text-gray-900">{card.value}</p>
                <p className="text-xs text-gray-400 mt-1">{card.sub}</p>
              </div>
              <div className="mt-1">{card.icon}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Toast / Errors */}
      {toast && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded-xl text-sm">{toast}</div>
      )}
      {error && !showModal && !confirmAction && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm">{error}</div>
      )}

      {/* Filters + Search + Export */}
      <div className="bg-white rounded-2xl border border-gray-200 p-4 mb-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1 bg-gray-100 rounded-xl p-1">
            {(["actifs", "demandes"] as const).map((t) => {
              const count = t === "actifs" ? responsables.length : demandes.length;
              return (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    tab === t ? "bg-white shadow-sm text-(--color-primary)" : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  {t === "actifs" ? "Responsables" : "Demandes"}{" "}
                  <span className="ml-1 text-xs font-semibold">{count}</span>
                </button>
              );
            })}
          </div>

          <div className="relative flex-1 min-w-48">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input
              type="text"
              placeholder={tab === "actifs" ? "Rechercher par nom ou email..." : "Rechercher par nom, email ou entreprise..."}
              className="ui-input pl-9 pr-4"
              value={tab === "actifs" ? searchTerm : searchDemandes}
              onChange={(e) => tab === "actifs" ? setSearchTerm(e.target.value) : setSearchDemandes(e.target.value)}
            />
          </div>

          {tab === "actifs" && (
            <ExportButton
              data={filteredActifs}
              columns={[
                { key: "username", label: "Nom d'utilisateur" },
                { key: "email", label: "Email" },
                { key: "phoneNumber", label: "Téléphone" },
                { key: "isActive", label: "Statut", format: (v: unknown) => (v ? "Actif" : "Inactif") },
              ]}
              filename="responsables"
              label="Exporter responsables"
              sheetName="Responsables"
              pdfTitle="Liste des responsables"
            />
          )}
        </div>
      </div>

      {/* TAB : ACTIFS */}
      {tab === "actifs" && (
        <>
          {loadingActifs ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="bg-white rounded-2xl border border-gray-200 p-6 animate-pulse">
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
                  </div>
                </div>
              ))}
            </div>
          ) : filteredActifs.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <p className="text-lg font-medium">Aucun responsable trouvé</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredActifs.map((resp) => (
                <div key={resp.id} className="bg-white rounded-2xl border border-gray-200 p-6 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-4">
                    {getPhotoUrl(resp.profileImageUrl) ? (
                      <img
                        src={getPhotoUrl(resp.profileImageUrl)!}
                        alt={`Photo de ${resp.username}`}
                        className="w-12 h-12 rounded-full object-cover border border-gray-200"
                      />
                    ) : (
                      <div
                        className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg"
                        style={{ background: "var(--color-primary)" }}
                      >
                        {resp.username.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <span className={`text-xs font-semibold px-3 py-1 rounded-full ${resp.isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"}`}>
                      {resp.isActive ? "Actif" : "Inactif"}
                    </span>
                  </div>

                  <h3 className="font-semibold text-gray-900 mb-3">{resp.username}</h3>

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

                  <div className="flex gap-2">
                    <button
                      onClick={() => handleToggle(resp)}
                      className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl border transition-colors text-sm font-medium ${
                        resp.isActive
                          ? "border-orange-200 text-orange-600 hover:bg-orange-50"
                          : "border-green-200 text-green-700 hover:bg-green-50"
                      }`}
                    >
                      <Power size={15} />
                      {resp.isActive ? "Désactiver" : "Activer"}
                    </button>
                    <button
                      onClick={() => handleDelete(resp)}
                      className="p-2 rounded-xl border border-red-200 text-red-500 hover:bg-red-50 transition-colors"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* TAB : DEMANDES */}
      {tab === "demandes" && (
        <>
          <div className="flex flex-wrap gap-2 mb-4">
            {(["Pending", "Accepted", "Rejected", "All"] as FilterStatut[]).map((s) => (
              <button
                key={s}
                onClick={() => setFilter(s)}
                className={`px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${
                  filter === s ? "text-white" : "bg-white border border-gray-200 text-gray-600"
                }`}
                style={filter === s ? { background: "var(--color-primary)" } : undefined}
              >
                {s === "All" ? "Toutes" : STATUT_LABEL[s]}
              </button>
            ))}
          </div>

          {loadingDemandes ? (
            <div className="grid md:grid-cols-2 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="bg-white rounded-2xl border border-gray-200 p-6 animate-pulse">
                  <div className="w-40 h-4 bg-gray-200 rounded mb-3" />
                  <div className="w-56 h-3 bg-gray-200 rounded mb-2" />
                  <div className="w-48 h-3 bg-gray-200 rounded mb-6" />
                  <div className="flex gap-2">
                    <div className="flex-1 h-9 bg-gray-200 rounded-xl" />
                    <div className="flex-1 h-9 bg-gray-200 rounded-xl" />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredDemandes.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <Clock className="mx-auto mb-3" size={32} />
              <p className="text-lg font-medium">Aucune demande</p>
              <p className="text-sm mt-1">Les nouvelles demandes apparaîtront ici.</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-6">
              {filteredDemandes.map((d) => (
                <div key={d.id} className="bg-white rounded-2xl border border-gray-200 p-6 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg"
                        style={{ background: "var(--color-primary)" }}
                      >
                        {d.username.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{d.username}</h3>
                        <p className="text-xs text-gray-400">
                          Demande du {new Date(d.createdAt).toLocaleDateString("fr-FR")}
                        </p>
                      </div>
                    </div>
                    <span className={`text-xs font-semibold px-3 py-1 rounded-full ${STATUT_STYLES[d.statut] ?? "bg-gray-100 text-gray-500"}`}>
                      {STATUT_LABEL[d.statut] ?? d.statut}
                    </span>
                  </div>

                  <div className="space-y-2 mb-5 text-sm text-gray-600">
                    <div className="flex items-center gap-2"><Mail size={14} /><span className="truncate">{d.email}</span></div>
                    {d.phoneNumber && <div className="flex items-center gap-2"><Phone size={14} />{d.phoneNumber}</div>}
                    {d.nomEntreprise && <div className="flex items-center gap-2"><Building2 size={14} />{d.nomEntreprise}</div>}
                    {d.matriculeFiscal && <div className="flex items-center gap-2"><FileText size={14} />{d.matriculeFiscal}</div>}
                    {d.secteurActivite && <div className="flex items-center gap-2"><Briefcase size={14} />{d.secteurActivite}</div>}
                    {d.adresseProfessionnelle && <div className="flex items-start gap-2"><MapPin size={14} className="mt-0.5" /><span>{d.adresseProfessionnelle}</span></div>}
                  </div>

                  {d.statut === "Rejected" && d.motifRefus && (
                    <div className="mb-4 p-3 bg-red-50 border border-red-100 rounded-lg text-xs text-red-700">
                      <strong>Motif du refus : </strong>{d.motifRefus}
                    </div>
                  )}
                  {d.statut === "Accepted" && d.dateAcceptation && (
                    <div className="mb-4 p-3 bg-green-50 border border-green-100 rounded-lg text-xs text-green-700">
                      Acceptée le {new Date(d.dateAcceptation).toLocaleDateString("fr-FR")} — en attente de paiement.
                    </div>
                  )}

                  {d.statut === "Pending" && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => { setConfirmAction({ type: "accept", demande: d }); setMotifRefus(""); }}
                        className="flex-1 flex items-center justify-center gap-1.5 bg-green-600 hover:bg-green-700 text-white text-sm font-medium py-2 rounded-xl transition-colors"
                      >
                        <CheckCircle2 size={15} /> Accepter
                      </button>
                      <button
                        onClick={() => { setConfirmAction({ type: "reject", demande: d }); setMotifRefus(""); }}
                        className="flex-1 flex items-center justify-center gap-1.5 border border-red-200 text-red-600 hover:bg-red-50 text-sm font-medium py-2 rounded-xl transition-colors"
                      >
                        <XCircle size={15} /> Refuser
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* Modal création responsable */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-900">Ajouter un responsable</h2>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm">{error}</div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Nom d'utilisateur</label>
                <input type="text" required autoComplete="off" value={form.username}
                  onChange={(e) => setForm({ ...form, username: e.target.value })}
                  className="ui-input" placeholder="ex: responsable1" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
                <input type="email" required autoComplete="off" value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="ui-input" placeholder="ex: resp@axia.com" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Mot de passe</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    required autoComplete="new-password" value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    className="ui-input pr-10" placeholder="Minimum 8 caractères"
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Téléphone <span className="text-gray-400 font-normal">(optionnel)</span>
                </label>
                <input type="tel" value={form.phoneNumber}
                  onChange={(e) => setForm({ ...form, phoneNumber: e.target.value })}
                  className="ui-input" placeholder="ex: 0612345678" />
              </div>

              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={submitting} className="flex-1 ui-btn-primary py-2.5 disabled:opacity-60">
                  {submitting ? "En cours..." : "Créer"}
                </button>
                <button type="button" onClick={closeModal}
                  className="flex-1 border border-gray-200 hover:bg-gray-50 text-gray-700 py-2.5 rounded-xl font-medium text-sm">
                  Annuler
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal accepter/refuser demande */}
      {confirmAction && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-900">
                {confirmAction.type === "accept" ? "Accepter la demande ?" : "Refuser la demande ?"}
              </h2>
              <button onClick={() => { setConfirmAction(null); setMotifRefus(""); }}
                className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
            </div>

            <div className="p-6 space-y-4">
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm">{error}</div>
              )}

              <p className="text-sm text-gray-600">
                {confirmAction.type === "accept" ? (
                  <>Vous allez accepter la demande de <strong>{confirmAction.demande.username}</strong> ({confirmAction.demande.email}). Un email lui sera envoyé avec le <strong>lien de paiement de 500 TND</strong>.</>
                ) : (
                  <>Vous allez refuser la demande de <strong>{confirmAction.demande.username}</strong> ({confirmAction.demande.email}). Un email l'informera.</>
                )}
              </p>

              {confirmAction.type === "reject" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Motif du refus <span className="text-gray-400 font-normal">(optionnel)</span>
                  </label>
                  <textarea rows={3} value={motifRefus} onChange={(e) => setMotifRefus(e.target.value)}
                    placeholder="Ex: Informations professionnelles incomplètes..."
                    className="ui-input resize-none" />
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  onClick={handleConfirmDemande}
                  disabled={submittingDemande}
                  className={`flex-1 text-white py-2.5 rounded-xl font-medium text-sm transition-colors disabled:opacity-60 ${
                    confirmAction.type === "accept" ? "bg-green-600 hover:bg-green-700" : "bg-red-600 hover:bg-red-700"
                  }`}
                >
                  {submittingDemande ? "En cours..." : confirmAction.type === "accept" ? "Confirmer l'acceptation" : "Confirmer le refus"}
                </button>
                <button onClick={() => { setConfirmAction(null); setMotifRefus(""); }}
                  className="flex-1 border border-gray-200 hover:bg-gray-50 text-gray-700 py-2.5 rounded-xl font-medium text-sm">
                  Annuler
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}