import type { Paiement, StatusBadgeVariant } from "./types";

export const TRANSACTIONS_PAGE_SIZE = 4;

const AVATAR_COLORS = [
  "bg-blue-100 text-blue-700",
  "bg-sky-100 text-sky-700",
  "bg-green-100 text-green-700",
  "bg-orange-100 text-orange-700",
  "bg-pink-100 text-pink-700",
  "bg-teal-100 text-teal-700",
];

export function getInitials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function avatarColor(name: string) {
  const index = name ? name.charCodeAt(0) % AVATAR_COLORS.length : 0;
  return AVATAR_COLORS[index];
}

export function txnRef(index: number) {
  return `TXN-${String(index + 1).padStart(3, "0")}`;
}

export function isCompletedPayment(paiement: Paiement) {
  const statut = (paiement.statut ?? "").toLowerCase();
  return statut === "completed" || statut === "succeeded";
}

export function isPendingPayment(paiement: Paiement) {
  const statut = (paiement.statut ?? "").toLowerCase();
  return statut === "pending";
}

export function isFailedPayment(paiement: Paiement) {
  const statut = (paiement.statut ?? "").toLowerCase();
  return !isCompletedPayment(paiement) && !isPendingPayment(paiement) && statut !== "";
}

export function isResponsableTxn(paiement: Paiement) {
  return (paiement.typeAbonnement ?? "").toLowerCase().includes("responsable");
}

export function formatTransactionDate(date: string) {
  return new Date(date).toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function getStatusBadge(statut: string): {
  variant: StatusBadgeVariant;
  label: string;
} {
  const normalized = (statut || "").toLowerCase();

  if (normalized === "completed" || normalized === "succeeded") {
    return {
      variant: "success",
      label: "Complété",
    };
  }

  if (normalized === "pending") {
    return {
      variant: "warning",
      label: "En attente",
    };
  }

  return {
    variant: "danger",
    label: "Échoué",
  };
}

export function getCurrentMonthLabel(date = new Date()) {
  const currentMonth = date.toLocaleString("fr-FR", {
    month: "long",
    year: "numeric",
  });

  return currentMonth.charAt(0).toUpperCase() + currentMonth.slice(1);
}