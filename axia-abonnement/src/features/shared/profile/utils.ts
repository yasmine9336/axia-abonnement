import { API_URL } from "../../../services/api/config";
import type { ProfileData, ProfileStats, StatCard } from "./types";

export function getInitial(profile: ProfileData | null) {
  return profile?.username?.charAt(0).toUpperCase() || "U";
}

export function getPhotoUrl(path?: string | null) {
  if (!path) return null;
  if (path.startsWith("http")) return path;
  return `${API_URL}${path}`;
}

export function getRoleLabel(role?: string) {
  if (role === "Admin") return "Admin";
  if (role === "Responsable") return "Responsable";
  return "Client";
}

export function formatMemberSince(date?: string) {
  if (!date) return "—";

  return new Date(date).toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

export function inputClass(editing: boolean) {
  return `w-full rounded-xl px-4 py-3 text-sm text-gray-700 outline-none transition-colors ${
    editing
      ? "bg-gray-100 focus:ring-2 focus:ring-(--color-primary)"
      : "bg-gray-50 cursor-default"
  }`;
}

export function buildStatCards(
  profile: ProfileData | null,
  stats: ProfileStats | null,
): StatCard[] {
  if (!profile || !stats) return [];

  if (profile.role === "Admin") {
    return [
      {
        label: "Responsables gérés",
        value: stats.nombreResponsables ?? 0,
        icon: "userCheck",
        iconClassName: "w-4 h-4 text-blue-600",
      },
      {
        label: "Clients plateforme",
        value: stats.nombreClients ?? 0,
        icon: "users",
        iconClassName: "w-4 h-4 text-blue-500",
      },
      {
        label: "Abonnements actifs",
        value: stats.abonnementsActifs ?? 0,
        icon: "creditCard",
        iconClassName: "w-4 h-4 text-blue-500",
      },
      {
        label: "Revenus ce mois",
        value: `${(stats.revenusMois ?? 0).toFixed(2)} TND`,
        icon: "trendingUp",
        iconClassName: "w-4 h-4 text-blue-500",
      },
      {
        label: "Catalogue",
        value: `${stats.nombreServices ?? 0} services · ${
          stats.nombreOffres ?? 0
        } offres`,
        icon: "package",
        iconClassName: "w-4 h-4 text-pink-500",
      },
      {
        label: "Membre depuis",
        value: formatMemberSince(profile.createdAt),
        icon: "clock",
        iconClassName: "w-4 h-4 text-gray-400",
      },
    ];
  }

  if (profile.role === "Responsable") {
    return [
      {
        label: "Mes services",
        value: stats.mesServices ?? 0,
        icon: "briefcase",
        iconClassName: "w-4 h-4 text-blue-600",
      },
      {
        label: "Mes offres",
        value: stats.mesOffres ?? 0,
        icon: "package",
        iconClassName: "w-4 h-4 text-indigo-500",
      },
      {
        label: "Mes clients",
        value: stats.mesClients ?? 0,
        icon: "users",
        iconClassName: "w-4 h-4 text-blue-500",
      },
      {
        label: "Abonnements actifs",
        value: stats.abonnementsActifs ?? 0,
        icon: "creditCard",
        iconClassName: "w-4 h-4 text-blue-500",
      },
      {
        label: "Revenus ce mois",
        value: `${(stats.revenusMois ?? 0).toFixed(2)} TND`,
        icon: "trendingUp",
        iconClassName: "w-4 h-4 text-blue-500",
      },
      {
        label: "Membre depuis",
        value: formatMemberSince(profile.createdAt),
        icon: "clock",
        iconClassName: "w-4 h-4 text-gray-400",
      },
    ];
  }

  return [
    {
      label: "Abonnements actifs",
      value: stats.abonnementsActifs ?? 0,
      icon: "creditCard",
      iconClassName: "w-4 h-4 text-blue-500",
    },
    {
      label: "Abonnements expirés",
      value: stats.abonnementsExpires ?? 0,
      icon: "clock",
      iconClassName: "w-4 h-4 text-blue-400",
    },
    {
      label: "Total payé",
      value: `${(stats.totalPaye ?? 0).toFixed(2)} TND`,
      icon: "trendingUp",
      iconClassName: "w-4 h-4 text-blue-500",
    },
    {
      label: "Membre depuis",
      value: formatMemberSince(profile.createdAt),
      icon: "clock",
      iconClassName: "w-4 h-4 text-gray-400",
    },
  ];
}