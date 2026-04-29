import {
  useState,
  useEffect,
  useCallback,
  useMemo,
  type FormEvent,
} from "react";
import axiosInstance from "../../api/axiosInstance";
import ExportButton from "../common/ExportButton";
import { API_URL } from "../../api/config";
import {
  Trash2,
  Search,
  Mail,
  Phone,
  Power,
  X,
  Eye,
  EyeOff,
  Building2,
  FileText,
  MapPin,
  Briefcase,
  CheckCircle2,
  XCircle,
  Clock,
  Users,
  ClipboardList,
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

type DemandeStatusFilter = "Pending" | "Accepted" | "Rejected" | "All";
type ResponsableStatusFilter = "All" | "Active" | "Inactive";

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

const DEMANDES_PAGE_SIZE = 3;
const RESPONSABLES_PAGE_SIZE = 4;

export default function ResponsablesSection() {
  const [responsables, setResponsables] = useState<Responsable[]>([]);
  const [loadingActifs, setLoadingActifs] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [responsableStatusFilter, setResponsableStatusFilter] =
    useState<ResponsableStatusFilter>("All");
  const [responsablesPage, setResponsablesPage] = useState(1);

  const [demandes, setDemandes] = useState<DemandeResponsable[]>([]);
  const [loadingDemandes, setLoadingDemandes] = useState(true);
  const [demandeStatusFilter, setDemandeStatusFilter] =
    useState<DemandeStatusFilter>("Pending");
  const [searchDemandes, setSearchDemandes] = useState("");
  const [demandesPage, setDemandesPage] = useState(1);

  const [showModal, setShowModal] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState<FormData>({
    username: "",
    email: "",
    password: "",
    phoneNumber: "",
  });

  const [confirmAction, setConfirmAction] = useState<ConfirmAction>(null);
  const [motifRefus, setMotifRefus] = useState("");
  const [submittingDemande, setSubmittingDemande] = useState(false);
  const [toast, setToast] = useState("");

  const fetchResponsables = useCallback(async () => {
    try {
      setLoadingActifs(true);
      const res = await axiosInstance.get("/users/responsables");
      setResponsables(res.data ?? []);
    } catch {
      setError("Erreur lors du chargement des responsables.");
    } finally {
      setLoadingActifs(false);
    }
  }, []);

  const fetchDemandes = useCallback(async () => {
    try {
      setLoadingDemandes(true);
      const res = await axiosInstance.get("/demandes-responsables");
      setDemandes(res.data ?? []);
    } catch {
      setError("Erreur lors du chargement des demandes.");
    } finally {
      setLoadingDemandes(false);
    }
  }, []);

  useEffect(() => {
    fetchResponsables();
  }, [fetchResponsables]);

  useEffect(() => {
    fetchDemandes();
  }, [fetchDemandes]);

  const closeModal = () => {
    setShowModal(false);
    setError("");
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setSubmitting(true);
    setError("");

    try {
      await axiosInstance.post("/users/responsables", {
        username: form.username,
        email: form.email,
        password: form.password,
        phoneNumber: form.phoneNumber || null,
      });

      await fetchResponsables();
      closeModal();

      setForm({
        username: "",
        email: "",
        password: "",
        phoneNumber: "",
      });
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
        await axiosInstance.patch(
          `/demandes-responsables/${confirmAction.demande.id}/accepter`,
        );

        showToastMsg(
          `Demande de ${confirmAction.demande.username} acceptée. Un email avec le lien de paiement a été envoyé.`,
        );
      } else {
        await axiosInstance.patch(
          `/demandes-responsables/${confirmAction.demande.id}/refuser`,
          {
            motif: motifRefus.trim() || null,
          },
        );

        showToastMsg(`Demande de ${confirmAction.demande.username} refusée.`);
      }

      setConfirmAction(null);
      setMotifRefus("");

      await fetchDemandes();
      await fetchResponsables();
    } catch {
      setError("Une erreur est survenue. Réessayez.");
    } finally {
      setSubmittingDemande(false);
    }
  };

  const activeCount = useMemo(
    () => responsables.filter((r) => r.isActive).length,
    [responsables],
  );

  const inactiveCount = responsables.length - activeCount;

  const pendingCount = useMemo(
    () => demandes.filter((d) => d.statut === "Pending").length,
    [demandes],
  );

  const acceptedCount = useMemo(
    () => demandes.filter((d) => d.statut === "Accepted").length,
    [demandes],
  );

  const rejectedCount = useMemo(
    () => demandes.filter((d) => d.statut === "Rejected").length,
    [demandes],
  );

  const filteredDemandes = useMemo(() => {
    const q = searchDemandes.toLowerCase().trim();

    return demandes.filter((d) => {
      const matchesStatus =
        demandeStatusFilter === "All" || d.statut === demandeStatusFilter;

      const matchesSearch =
        !q ||
        d.username.toLowerCase().includes(q) ||
        d.email.toLowerCase().includes(q) ||
        (d.nomEntreprise ?? "").toLowerCase().includes(q);

      return matchesStatus && matchesSearch;
    });
  }, [demandes, demandeStatusFilter, searchDemandes]);

  const filteredActifs = useMemo(() => {
    const q = searchTerm.toLowerCase().trim();

    return responsables.filter((r) => {
      const matchesSearch =
        !q ||
        r.username.toLowerCase().includes(q) ||
        r.email.toLowerCase().includes(q);

      const matchesStatus =
        responsableStatusFilter === "All" ||
        (responsableStatusFilter === "Active" && r.isActive) ||
        (responsableStatusFilter === "Inactive" && !r.isActive);

      return matchesSearch && matchesStatus;
    });
  }, [responsables, searchTerm, responsableStatusFilter]);

  const totalDemandesPages = Math.max(
    1,
    Math.ceil(filteredDemandes.length / DEMANDES_PAGE_SIZE),
  );

  const paginatedDemandes = useMemo(() => {
    const start = (demandesPage - 1) * DEMANDES_PAGE_SIZE;
    return filteredDemandes.slice(start, start + DEMANDES_PAGE_SIZE);
  }, [filteredDemandes, demandesPage]);

  const totalResponsablesPages = Math.max(
    1,
    Math.ceil(filteredActifs.length / RESPONSABLES_PAGE_SIZE),
  );

  const paginatedResponsables = useMemo(() => {
    const start = (responsablesPage - 1) * RESPONSABLES_PAGE_SIZE;
    return filteredActifs.slice(start, start + RESPONSABLES_PAGE_SIZE);
  }, [filteredActifs, responsablesPage]);

  useEffect(() => {
    setDemandesPage(1);
  }, [demandeStatusFilter, searchDemandes]);

  useEffect(() => {
    setResponsablesPage(1);
  }, [responsableStatusFilter, searchTerm]);

  useEffect(() => {
    setDemandesPage((page) => Math.min(page, totalDemandesPages));
  }, [totalDemandesPages]);

  useEffect(() => {
    setResponsablesPage((page) => Math.min(page, totalResponsablesPages));
  }, [totalResponsablesPages]);

  const getPhotoUrl = (photoPath?: string | null) => {
    if (!photoPath) return null;
    if (photoPath.startsWith("http")) return photoPath;
    return `${API_URL}${photoPath}`;
  };

  const renderPagination = (
    currentPage: number,
    totalPages: number,
    onPageChange: (page: number) => void,
  ) => {
    if (totalPages <= 1) return null;

    return (
      <div className="flex items-center justify-end gap-2 mt-5">
        <button
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
          className="px-3 py-1.5 rounded-lg border border-gray-200 text-sm text-gray-600 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50"
        >
          Précédent
        </button>

        <span className="text-sm text-gray-500">
          Page {currentPage} sur {totalPages}
        </span>

        <button
          onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage === totalPages}
          className="px-3 py-1.5 rounded-lg border border-gray-200 text-sm text-gray-600 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50"
        >
          Suivant
        </button>
      </div>
    );
  };

  const kpiCards = [
    {
      label: "TOTAL RESPONSABLES",
      value: responsables.length,
      sub: `${activeCount} actif(s)`,
      icon: <Users className="w-5 h-5 text-blue-600" />,
      border: "border-t-blue-500",
    },
    {
      label: "ACTIFS",
      value: activeCount,
      sub: `${inactiveCount} inactif(s)`,
      icon: <CheckCircle2 className="w-5 h-5 text-green-500" />,
      border: "border-t-green-400",
    },
    {
      label: "TOTAL DEMANDES",
      value: demandes.length,
      sub: "toutes confondues",
      icon: <ClipboardList className="w-5 h-5 text-blue-500" />,
      border: "border-t-blue-400",
    },
    {
      label: "EN ATTENTE",
      value: pendingCount,
      sub: "demandes à traiter",
      icon: <Clock className="w-5 h-5 text-orange-500" />,
      border: "border-t-orange-400",
    },
  ];

  const demandeTabs: Array<{
    key: DemandeStatusFilter;
    label: string;
    count: number;
  }> = [
    { key: "Pending", label: "En attente", count: pendingCount },
    { key: "Accepted", label: "Acceptées", count: acceptedCount },
    { key: "Rejected", label: "Refusées", count: rejectedCount },
    { key: "All", label: "Toutes", count: demandes.length },
  ];

  const responsableTabs: Array<{
    key: ResponsableStatusFilter;
    label: string;
    count: number;
  }> = [
    { key: "All", label: "Tous", count: responsables.length },
    { key: "Active", label: "Actifs", count: activeCount },
    { key: "Inactive", label: "Inactifs", count: inactiveCount },
  ];

  return (
    <div className="ui-page">
      {/* Header */}
      <div className="mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="ui-title">Gestion des responsables</h1>
          <p className="ui-subtitle">
            {activeCount} actif(s) · {inactiveCount} inactif(s) · {pendingCount}{" "}
            demande(s) en attente
          </p>
        </div>

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
        <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded-xl text-sm">
          {toast}
        </div>
      )}

      {error && !showModal && !confirmAction && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm">
          {error}
        </div>
      )}

      {/* Section demandes */}
      <section className="bg-white rounded-2xl border border-gray-200 p-6 mb-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-5">
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              Demandes de création de compte
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Validez ou consultez les demandes d’inscription des responsables.
            </p>
          </div>

          {pendingCount > 0 && (
            <span className="inline-flex items-center gap-2 bg-orange-50 text-orange-600 border border-orange-100 px-3 py-1.5 rounded-full text-sm font-semibold">
              <Clock size={15} />
              {pendingCount} demande(s) à traiter
            </span>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-3 mb-5">
          <div className="flex flex-wrap gap-2">
            {demandeTabs.map((item) => (
              <button
                key={item.key}
                onClick={() => setDemandeStatusFilter(item.key)}
                className={`px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${
                  demandeStatusFilter === item.key
                    ? "text-white"
                    : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
                }`}
                style={
                  demandeStatusFilter === item.key
                    ? { background: "var(--color-primary)" }
                    : undefined
                }
              >
                {item.label}
                <span className="ml-1 text-xs font-semibold">{item.count}</span>
              </button>
            ))}
          </div>

          <div className="relative flex-1 min-w-64">
            <div className="relative flex-1 min-w-64">
              <Search
                className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                size={16}
              />

              <input
                type="text"
                placeholder="Rechercher par nom, email ou entreprise..."
                className="ui-input pl-11! pr-4"
                value={searchDemandes}
                onChange={(e) => setSearchDemandes(e.target.value)}
              />
            </div>
          </div>
        </div>

        {loadingDemandes ? (
          <div className="grid gap-4 sm:grid-cols-[repeat(auto-fill,minmax(330px,1fr))]">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="bg-white rounded-2xl border border-gray-200 p-5 animate-pulse"
              >
                <div className="w-40 h-4 bg-gray-200 rounded mb-3" />
                <div className="w-56 h-3 bg-gray-200 rounded mb-2" />
                <div className="w-48 h-3 bg-gray-200 rounded mb-6" />
                <div className="flex gap-2 mt-4">
                  <div className="flex-1 h-9 bg-gray-200 rounded-xl" />
                  <div className="flex-1 h-9 bg-gray-200 rounded-xl" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredDemandes.length === 0 ? (
          <div className="text-center py-12 text-gray-400 border border-gray-100 rounded-2xl bg-gray-50">
            <Clock className="mx-auto mb-3" size={32} />
            <p className="text-lg font-medium">Aucune demande</p>
            <p className="text-sm mt-1">
              Les demandes correspondant au filtre apparaîtront ici.
            </p>
          </div>
        ) : (
          <>
            <div className="grid gap-4 sm:grid-cols-[repeat(auto-fill,minmax(330px,1fr))]">
              {paginatedDemandes.map((d) => (
                <div
                  key={d.id}
                  className="bg-white rounded-2xl border border-gray-200 p-5 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg"
                        style={{ background: "var(--color-primary)" }}
                      >
                        {d.username.charAt(0).toUpperCase()}
                      </div>

                      <div>
                        <h3 className="font-semibold text-gray-900">
                          {d.username}
                        </h3>

                        <p className="text-xs text-gray-400">
                          Demande du{" "}
                          {new Date(d.createdAt).toLocaleDateString("fr-FR")}
                        </p>
                      </div>
                    </div>

                    <span
                      className={`text-xs font-semibold px-3 py-1 rounded-full ${
                        STATUT_STYLES[d.statut] ?? "bg-gray-100 text-gray-500"
                      }`}
                    >
                      {STATUT_LABEL[d.statut] ?? d.statut}
                    </span>
                  </div>

                  <div className="space-y-2 mb-5 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <Mail size={14} />
                      <span className="truncate">{d.email}</span>
                    </div>

                    {d.phoneNumber && (
                      <div className="flex items-center gap-2">
                        <Phone size={14} />
                        <span>{d.phoneNumber}</span>
                      </div>
                    )}

                    {d.nomEntreprise && (
                      <div className="flex items-center gap-2">
                        <Building2 size={14} />
                        <span>{d.nomEntreprise}</span>
                      </div>
                    )}

                    {d.matriculeFiscal && (
                      <div className="flex items-center gap-2">
                        <FileText size={14} />
                        <span>{d.matriculeFiscal}</span>
                      </div>
                    )}

                    {d.secteurActivite && (
                      <div className="flex items-center gap-2">
                        <Briefcase size={14} />
                        <span>{d.secteurActivite}</span>
                      </div>
                    )}

                    {d.adresseProfessionnelle && (
                      <div className="flex items-start gap-2">
                        <MapPin size={14} className="mt-0.5" />
                        <span>{d.adresseProfessionnelle}</span>
                      </div>
                    )}
                  </div>

                  {d.statut === "Rejected" && d.motifRefus && (
                    <div className="mb-4 p-3 bg-red-50 border border-red-100 rounded-lg text-xs text-red-700">
                      <strong>Motif du refus : </strong>
                      {d.motifRefus}
                    </div>
                  )}

                  {d.statut === "Accepted" && d.dateAcceptation && (
                    <div className="mb-4 p-3 bg-green-50 border border-green-100 rounded-lg text-xs text-green-700">
                      Acceptée le{" "}
                      {new Date(d.dateAcceptation).toLocaleDateString("fr-FR")}{" "}
                      — en attente de paiement.
                    </div>
                  )}

                  {d.statut === "Pending" && (
                    <div className="flex gap-2 mt-4">
                      <button
                        onClick={() => {
                          setConfirmAction({ type: "accept", demande: d });
                          setMotifRefus("");
                        }}
                        className="flex-1 flex items-center justify-center gap-1.5 bg-green-600 hover:bg-green-700 text-white text-sm font-medium py-2 rounded-xl transition-colors"
                      >
                        <CheckCircle2 size={15} />
                        Accepter
                      </button>

                      <button
                        onClick={() => {
                          setConfirmAction({ type: "reject", demande: d });
                          setMotifRefus("");
                        }}
                        className="flex-1 flex items-center justify-center gap-1.5 border border-red-200 text-red-600 hover:bg-red-50 text-sm font-medium py-2 rounded-xl transition-colors"
                      >
                        <XCircle size={15} />
                        Refuser
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {renderPagination(
              demandesPage,
              totalDemandesPages,
              setDemandesPage,
            )}
          </>
        )}
      </section>

      {/* Section responsables validés */}
      <section className="bg-white rounded-2xl border border-gray-200 p-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-5">
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              Responsables validés
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Consultez et gérez les comptes responsables actifs ou désactivés.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 mb-5">
          <div className="flex flex-wrap gap-2">
            {responsableTabs.map((item) => (
              <button
                key={item.key}
                onClick={() => setResponsableStatusFilter(item.key)}
                className={`px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${
                  responsableStatusFilter === item.key
                    ? "text-white"
                    : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
                }`}
                style={
                  responsableStatusFilter === item.key
                    ? { background: "var(--color-primary)" }
                    : undefined
                }
              >
                {item.label}
                <span className="ml-1 text-xs font-semibold">{item.count}</span>
              </button>
            ))}
          </div>

          <div className="relative flex-1 min-w-64">
            <div className="relative flex-1 min-w-64">
              <Search
                className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                size={16}
              />

              <input
                type="text"
                placeholder="Rechercher par nom ou email..."
                className="ui-input pl-11! pr-4"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <ExportButton
            data={filteredActifs}
            columns={[
              { key: "username", label: "Nom d'utilisateur" },
              { key: "email", label: "Email" },
              { key: "phoneNumber", label: "Téléphone" },
              {
                key: "isActive",
                label: "Statut",
                format: (v: unknown) => (v ? "Actif" : "Inactif"),
              },
            ]}
            filename="responsables"
            label="Exporter responsables"
            sheetName="Responsables"
            pdfTitle="Liste des responsables"
          />
        </div>

        {loadingActifs ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
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
                <div className="flex gap-2 mt-4">
                  <div className="flex-1 h-9 bg-gray-200 rounded-xl" />
                  <div className="w-9 h-9 bg-gray-200 rounded-xl" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredActifs.length === 0 ? (
          <div className="text-center py-12 text-gray-400 border border-gray-100 rounded-2xl bg-gray-50">
            <Users className="mx-auto mb-3" size={32} />
            <p className="text-lg font-medium">Aucun responsable trouvé</p>
            <p className="text-sm mt-1">
              Aucun responsable ne correspond au filtre sélectionné.
            </p>
          </div>
        ) : (
          <>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {paginatedResponsables.map((resp) => (
                <div
                  key={resp.id}
                  className="bg-white rounded-2xl border border-gray-200 p-5 hover:shadow-md transition-shadow"
                >
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

                  <div className="flex gap-2 mt-4">
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

            {renderPagination(
              responsablesPage,
              totalResponsablesPages,
              setResponsablesPage,
            )}
          </>
        )}
      </section>

      {/* Modal création responsable */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">

              <button
                onClick={closeModal}
                className="text-gray-400 hover:text-gray-600"
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
                  className="ui-input"
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
                  className="ui-input"
                  placeholder="ex: resp@axia.com"
                />
              </div>

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
                    className="ui-input pr-10"
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
                  className="ui-input"
                  placeholder="ex: 0612345678"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 ui-btn-primary py-2.5 disabled:opacity-60"
                >
                  {submitting ? "En cours..." : "Créer"}
                </button>

                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 border border-gray-200 hover:bg-gray-50 text-gray-700 py-2.5 rounded-xl font-medium text-sm"
                >
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
                {confirmAction.type === "accept"
                  ? "Accepter la demande ?"
                  : "Refuser la demande ?"}
              </h2>

              <button
                onClick={() => {
                  setConfirmAction(null);
                  setMotifRefus("");
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm">
                  {error}
                </div>
              )}

              <p className="text-sm text-gray-600">
                {confirmAction.type === "accept" ? (
                  <>
                    Vous allez accepter la demande de{" "}
                    <strong>{confirmAction.demande.username}</strong> (
                    {confirmAction.demande.email}). Un email lui sera envoyé
                    avec le <strong>lien de paiement de 500 TND</strong>.
                  </>
                ) : (
                  <>
                    Vous allez refuser la demande de{" "}
                    <strong>{confirmAction.demande.username}</strong> (
                    {confirmAction.demande.email}). Un email l'informera.
                  </>
                )}
              </p>

              {confirmAction.type === "reject" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Motif du refus{" "}
                    <span className="text-gray-400 font-normal">
                      (optionnel)
                    </span>
                  </label>

                  <textarea
                    rows={3}
                    value={motifRefus}
                    onChange={(e) => setMotifRefus(e.target.value)}
                    placeholder="Ex: Informations professionnelles incomplètes..."
                    className="ui-input resize-none"
                  />
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  onClick={handleConfirmDemande}
                  disabled={submittingDemande}
                  className={`flex-1 text-white py-2.5 rounded-xl font-medium text-sm transition-colors disabled:opacity-60 ${
                    confirmAction.type === "accept"
                      ? "bg-green-600 hover:bg-green-700"
                      : "bg-red-600 hover:bg-red-700"
                  }`}
                >
                  {submittingDemande
                    ? "En cours..."
                    : confirmAction.type === "accept"
                      ? "Confirmer l'acceptation"
                      : "Confirmer le refus"}
                </button>

                <button
                  onClick={() => {
                    setConfirmAction(null);
                    setMotifRefus("");
                  }}
                  className="flex-1 border border-gray-200 hover:bg-gray-50 text-gray-700 py-2.5 rounded-xl font-medium text-sm"
                >
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
