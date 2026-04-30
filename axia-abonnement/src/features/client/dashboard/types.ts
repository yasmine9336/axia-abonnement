export interface AbonnementItem {
  id: string;
  intituleOffre: string;
  type: string;
  montant: number;
  dateFin: string;
  dateDebut: string;
  statut: string;
}

export interface PaiementItem {
  id: string;
  intituleOffre: string;
  montant: number;
  statut: string;
  createdAt: string;
}

export interface DepenseMois {
  mois: string;
  depense: number;
}