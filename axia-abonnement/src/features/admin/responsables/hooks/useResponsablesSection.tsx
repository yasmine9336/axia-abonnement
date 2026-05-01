import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type FormEvent,
} from "react";

import axiosInstance from "../../../../services/api/axiosInstance";
import { API_URL } from "../../../../services/api/config";

import type {
  ConfirmAction,
  DemandeResponsable,
  DemandeStatusFilter,
  Responsable,
  ResponsableFormData,
  ResponsableStatusFilter,
} from "../types";

import { DEMANDES_PAGE_SIZE, RESPONSABLES_PAGE_SIZE } from "../constants";

export function useResponsablesSection() {
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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

  const [form, setForm] = useState<ResponsableFormData>({
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

      const response = await axiosInstance.get<Responsable[]>(
        "/users/responsables",
      );

      setResponsables(response.data ?? []);
    } catch {
      setError("Erreur lors du chargement des responsables.");
    } finally {
      setLoadingActifs(false);
    }
  }, []);

  const fetchDemandes = useCallback(async () => {
    try {
      setLoadingDemandes(true);

      const response = await axiosInstance.get<DemandeResponsable[]>(
        "/demandes-responsables",
      );

      setDemandes(response.data ?? []);
    } catch {
      setError("Erreur lors du chargement des demandes.");
    } finally {
      setLoadingDemandes(false);
    }
  }, []);

  useEffect(() => {
    void fetchResponsables();
  }, [fetchResponsables]);

  useEffect(() => {
    void fetchDemandes();
  }, [fetchDemandes]);

  const closeModal = () => {
    setShowModal(false);
    setError("");
  };

  const openAddModal = () => {
    setError("");
    setShowModal(true);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

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
      const apiError = err as { response?: { data?: string } };
      setError(apiError.response?.data || "Une erreur est survenue.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggle = async (responsable: Responsable) => {
    try {
      await axiosInstance.patch(`/users/responsables/${responsable.id}/toggle`);

      setResponsables((prev) =>
        prev.map((item) =>
          item.id === responsable.id
            ? { ...item, isActive: !item.isActive }
            : item,
        ),
      );
    } catch {
      setError("Erreur lors du changement de statut.");
    }
  };

  const handleDelete = async (responsable: Responsable) => {
    if (
      !confirm(
        `Supprimer ${responsable.username} ? Cette action est irréversible.`,
      )
    ) {
      return;
    }

    try {
      await axiosInstance.delete(`/users/responsables/${responsable.id}`);

      setResponsables((prev) =>
        prev.filter((item) => item.id !== responsable.id),
      );
    } catch {
      setError("Erreur lors de la suppression.");
    }
  };

  const showToastMsg = (message: string) => {
    setToast(message);

    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);

    toastTimerRef.current = setTimeout(() => setToast(""), 3500);
  };

  useEffect(
    () => () => {
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    },
    [],
  );

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
    () => responsables.filter((responsable) => responsable.isActive).length,
    [responsables],
  );

  const inactiveCount = responsables.length - activeCount;

  const pendingCount = useMemo(
    () => demandes.filter((demande) => demande.statut === "Pending").length,
    [demandes],
  );

  const acceptedCount = useMemo(
    () => demandes.filter((demande) => demande.statut === "Accepted").length,
    [demandes],
  );

  const rejectedCount = useMemo(
    () => demandes.filter((demande) => demande.statut === "Rejected").length,
    [demandes],
  );

  const filteredDemandes = useMemo(() => {
    const query = searchDemandes.toLowerCase().trim();

    return demandes.filter((demande) => {
      const matchesStatus =
        demandeStatusFilter === "All" ||
        demande.statut === demandeStatusFilter;

      const matchesSearch =
        !query ||
        demande.username.toLowerCase().includes(query) ||
        demande.email.toLowerCase().includes(query) ||
        (demande.nomEntreprise ?? "").toLowerCase().includes(query);

      return matchesStatus && matchesSearch;
    });
  }, [demandes, demandeStatusFilter, searchDemandes]);

  const filteredActifs = useMemo(() => {
    const query = searchTerm.toLowerCase().trim();

    return responsables.filter((responsable) => {
      const matchesSearch =
        !query ||
        responsable.username.toLowerCase().includes(query) ||
        responsable.email.toLowerCase().includes(query);

      const matchesStatus =
        responsableStatusFilter === "All" ||
        (responsableStatusFilter === "Active" && responsable.isActive) ||
        (responsableStatusFilter === "Inactive" && !responsable.isActive);

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

  return {
    responsables,
    demandes,
    loadingActifs,
    loadingDemandes,
    searchTerm,
    responsableStatusFilter,
    responsablesPage,
    demandeStatusFilter,
    searchDemandes,
    demandesPage,
    showModal,
    showPassword,
    submitting,
    error,
    form,
    confirmAction,
    motifRefus,
    submittingDemande,
    toast,

    activeCount,
    inactiveCount,
    pendingCount,
    filteredActifs,
    filteredDemandes,
    totalDemandesPages,
    totalResponsablesPages,
    paginatedDemandes,
    paginatedResponsables,
    demandeTabs,
    responsableTabs,

    setSearchTerm,
    setResponsableStatusFilter,
    setResponsablesPage,
    setDemandeStatusFilter,
    setSearchDemandes,
    setDemandesPage,
    setForm,
    setMotifRefus,
    setConfirmAction,

    openAddModal,
    closeModal,
    handleSubmit,
    handleToggle,
    handleDelete,
    handleConfirmDemande,
    setShowPassword,
    getPhotoUrl,
  };
}