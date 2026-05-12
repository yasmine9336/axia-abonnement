export const isCompleted = (statut: string) => statut === "completed";

export const formatStatut = (statut: string) =>
  statut === "completed"
    ? "Complété"
    : statut === "pending"
      ? "En cours"
      : statut === "expiré"
        ? "Expiré"
        : "Échoué";

export const statutBadge = (statut: string) =>
  statut === "completed"
    ? "bg-blue-100 text-blue-700"
    : statut === "pending"
      ? "bg-blue-50 text-yellow-700"
      : statut === "expiré"
        ? "bg-blue-100 text-blue-600"
        : "bg-blue-100 text-blue-700";

export function formatDateFR(date: string) {
  return new Date(date).toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function safeFileNamePart(input: string) {
  return input
    .trim()
    .replace(/[^\w\- ]+/g, "")
    .replace(/\s+/g, "_")
    .slice(0, 40);
}