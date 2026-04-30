export interface Client {
  id: string;
  username: string;
  email: string;
  phoneNumber: string | null;
  isActive: boolean;
  createdAt: string;
  abonnementActif: string | null;
  montantActif: number | null;
  statutAbonnement: string | null;
  responsableUsername: string | null;
}

export type FilterTab = "tous" | "actif" | "inactif";

export const PAGE_SIZE = 4;