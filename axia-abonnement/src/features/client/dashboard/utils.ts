import type { PaiementItem } from "./types";

export function getProgress(dateDebut: string, dateFin: string, now: number) {
  const debut = new Date(dateDebut).getTime();
  const fin = new Date(dateFin).getTime();

  if (!Number.isFinite(debut) || !Number.isFinite(fin) || fin <= debut) {
    return 0;
  }

  return Math.round(
    Math.min(100, Math.max(0, ((now - debut) / (fin - debut)) * 100)),
  );
}

export function joursRestants(dateFin: string, now: number) {
  const diff = new Date(dateFin).getTime() - now;
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

export function totalJours(dateDebut: string, dateFin: string) {
  const debut = new Date(dateDebut).getTime();
  const fin = new Date(dateFin).getTime();

  if (!Number.isFinite(debut) || !Number.isFinite(fin) || fin <= debut) {
    return 0;
  }

  return Math.ceil((fin - debut) / (1000 * 60 * 60 * 24));
}

export function buildDepensesParMois(paiements: PaiementItem[]) {
  const now = new Date();

  return Array.from({ length: 6 }, (_, index) => {
    const mois = new Date(now.getFullYear(), now.getMonth() - (5 - index), 1);

    const total = paiements
      .filter((paiement) => {
        const date = new Date(paiement.createdAt);

        return (
          date.getMonth() === mois.getMonth() &&
          date.getFullYear() === mois.getFullYear()
        );
      })
      .reduce((sum, paiement) => sum + paiement.montant, 0);

    return {
      mois: mois.toLocaleDateString("fr-FR", { month: "short" }),
      depense: total,
    };
  });
}

export function getChartLabel(firstMonth?: string) {
  const currentMonth = new Date().toLocaleDateString("fr-FR", {
    month: "short",
    year: "numeric",
  });

  return `${firstMonth ?? ""} — ${currentMonth}`;
}

export function formatLongDate(date: string) {
  return new Date(date).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}