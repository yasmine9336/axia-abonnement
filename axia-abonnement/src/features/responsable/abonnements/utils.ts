export function getInitials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function formatDate(date: string) {
  try {
    return new Date(date).toLocaleDateString("fr-FR");
  } catch {
    return date;
  }
}

export function daysLeft(dateFin?: string) {
  if (!dateFin) return null;

  const end = new Date(dateFin).getTime();
  const now = Date.now();

  if (!Number.isFinite(end)) return null;

  return Math.ceil((end - now) / (1000 * 60 * 60 * 24));
}

export function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

export function progressPercent(dateDebut: string, dateFin?: string) {
  if (!dateFin) return 0;

  const start = new Date(dateDebut).getTime();
  const end = new Date(dateFin).getTime();
  const now = Date.now();

  if (!Number.isFinite(start) || !Number.isFinite(end) || end <= start) {
    return 0;
  }

  return clamp(Math.round(((now - start) / (end - start)) * 100), 0, 100);
}

export function totalSubscriptionDays(dateDebut: string, dateFin?: string) {
  if (!dateFin) return 0;

  const start = new Date(dateDebut).getTime();
  const end = new Date(dateFin).getTime();

  if (!Number.isFinite(start) || !Number.isFinite(end) || end <= start) {
    return 0;
  }

  return Math.ceil((end - start) / (1000 * 60 * 60 * 24));
}

export function usedSubscriptionDays(dateDebut: string, dateFin?: string) {
  if (!dateFin) return 0;

  const start = new Date(dateDebut).getTime();
  const end = new Date(dateFin).getTime();
  const now = Date.now();

  if (!Number.isFinite(start) || !Number.isFinite(end) || end <= start) {
    return 0;
  }

  const used = Math.floor((now - start) / (1000 * 60 * 60 * 24));
  const total = totalSubscriptionDays(dateDebut, dateFin);

  return clamp(used, 0, total);
}

export function pluralJour(value: number) {
  return `${value} jour${value > 1 ? "s" : ""}`;
}