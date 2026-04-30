export type AbonnementTab = "actifs" | "expires";
export type DemandeStatut = "en_attente" | "acceptée" | "refusée";
export type AbonnementStatut = "actif" | "expiré" | "aucun" | string;
export type ExpirationFilter = "all" | "7days" | "30days";

export interface Abonnement {
  id: string;
  intituleOffre: string;
  description?: string;
  type: string;
  montant: number;
  dateDebut: string;
  dateFin?: string;
  isActive: boolean;
  statut: AbonnementStatut;
  clientUsername: string;
  clientEmail: string;
}

export interface Demande {
  id: string;
  abonnementId: string;
  clientUsername: string;
  clientEmail: string;
  intituleOffre: string;
  type: string;
  montant: number;
  statut: DemandeStatut | string;
  createdAt: string;
}

export const PAGE_SIZE = 4;