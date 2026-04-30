export function formatDateFR(date: string) {
  return new Date(date).toLocaleDateString("fr-FR");
}

export function getBillingProgress(dateDebut: string, dateFin: string) {
  const now = Date.now();
  const debut = new Date(dateDebut).getTime();
  const fin = new Date(dateFin).getTime();

  if (!Number.isFinite(debut) || !Number.isFinite(fin) || fin <= debut) {
    return 0;
  }

  return Math.round(
    Math.min(100, Math.max(0, ((now - debut) / (fin - debut)) * 100)),
  );
}

export function daysBetween(from: string, to: string) {
  const start = new Date(from).getTime();
  const end = new Date(to).getTime();

  if (!Number.isFinite(start) || !Number.isFinite(end)) {
    return 0;
  }

  return Math.ceil((end - start) / (1000 * 60 * 60 * 24));
}

export function totalSubscriptionDays(dateDebut: string, dateFin: string) {
  const start = new Date(dateDebut).getTime();
  const end = new Date(dateFin).getTime();

  if (!Number.isFinite(start) || !Number.isFinite(end) || end <= start) {
    return 0;
  }

  return Math.ceil((end - start) / (1000 * 60 * 60 * 24));
}

export function usedSubscriptionDays(dateDebut: string, dateFin: string) {
  const start = new Date(dateDebut).getTime();
  const end = new Date(dateFin).getTime();
  const now = Date.now();

  if (!Number.isFinite(start) || !Number.isFinite(end) || end <= start) {
    return 0;
  }

  const total = totalSubscriptionDays(dateDebut, dateFin);
  const used = Math.floor((now - start) / (1000 * 60 * 60 * 24));

  return Math.max(0, Math.min(used, total));
}

export function pluralJour(value: number) {
  return `${value} jour${value > 1 ? "s" : ""}`;
}