export type FilterTab = "tous" | "actif" | "inactif";
export type MemberSinceFilter = "all" | "30days" | "90days" | "year";
export type PhoneFilter = "all" | "withPhone" | "withoutPhone";

export interface Client {
  id: string;
  username: string;
  email: string;
  phoneNumber: string | null;
  isActive: boolean;
  createdAt?: string | null;
}

export interface AbonnementClientDto {
  id: string;
  intituleOffre: string;
  type: string;
  montant: number;
  dateDebut: string;
  dateFin: string;
  statut: string;
}

export const PAGE_SIZE = 4;