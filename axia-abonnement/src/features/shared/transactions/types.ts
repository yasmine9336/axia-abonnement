export interface Paiement {
  id: string;
  montant: number;
  statut: string;
  createdAt: string;
  intituleOffre: string;
  typeAbonnement: string;
  clientUsername: string;
  clientEmail: string;
}

export type SourceFilter = "tous" | "clients" | "responsables";
export type StatusFilter = "tous" | "completed" | "pending" | "failed";

export interface CountsBySource {
  clients: number;
  responsables: number;
  total: number;
}

export interface CountsByStatus {
  total: number;
  completed: number;
  pending: number;
  failed: number;
}

export type StatusBadgeVariant = "success" | "warning" | "danger";