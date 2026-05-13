export function getInitials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

const AVATAR_COLORS = [
  "bg-blue-100 text-blue-700",
  "bg-sky-100 text-sky-700",
  "bg-indigo-100 text-indigo-700",
  "bg-blue-100 text-blue-600",
  "bg-sky-50 text-sky-600",
];

export function avatarColor(name: string) {
  const index = name ? name.charCodeAt(0) % AVATAR_COLORS.length : 0;
  return AVATAR_COLORS[index];
}

export function capitalize(value: string) {
  if (!value) return "";
  return value.charAt(0).toUpperCase() + value.slice(1);
}

export function normalizeStatusLabel(status: string) {
  if (status === "actif") return "Actif";
  if (status === "expiré") return "Expiré";
  if (status === "en_attente") return "En attente";
  return capitalize(status);
}

export function formatDate(date: string) {
  return new Date(date).toLocaleDateString("fr-FR");
}

export function isExpired(dateFin: string) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const end = new Date(dateFin);
  end.setHours(0, 0, 0, 0);

  return end < today;
}

export function expiresWithinDays(dateFin: string, days: number) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const limit = new Date(today);
  limit.setDate(today.getDate() + days);

  const end = new Date(dateFin);
  end.setHours(0, 0, 0, 0);

  return end >= today && end <= limit;
}