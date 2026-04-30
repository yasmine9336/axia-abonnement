export interface Abonnement {
  id: string;
  intituleOffre: string;
  type: string;
  montant: number;
  dateDebut: string;
  dateFin: string;
  statut: string;
  clientUsername: string;
  clientEmail: string;
  responsableUsername?: string;
}

export type FilterTab = "tous" | "actifs" | "expirés" | "en_attente";
export type ExpirationFilter = "all" | "7days" | "30days" | "expired";

export const ABONNEMENTS_PAGE_SIZE = 4;