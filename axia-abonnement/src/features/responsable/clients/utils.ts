export function formatDateFR(date?: string | null) {
  if (!date) return "—";

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) return "—";

  return parsedDate.toLocaleDateString("fr-FR");
}

export function isWithinLastDays(date?: string | null, days = 30) {
  if (!date) return false;

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) return false;

  const limit = new Date();
  limit.setDate(limit.getDate() - days);

  return parsedDate >= limit;
}

export function isInCurrentYear(date?: string | null) {
  if (!date) return false;

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) return false;

  return parsedDate.getFullYear() === new Date().getFullYear();
}