export type AbonnementStatut = "actif" | "en_attente" | "expiré";

export interface Abonnement {
  id: string;
  intituleOffre: string;
  description: string;
  type: string;
  montant: number;
  dateDebut: string;
  dateFin: string;
  isActive: boolean;
  statut: AbonnementStatut;
  statutDemande?: string | null;
  noteFeedback?: number | null;
  peutRenouveler?: boolean;
}