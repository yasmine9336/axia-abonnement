export interface AbonnementRecent {
  id: string;
  intituleOffre: string;
  type: string;
  montant: number;
  dateDebut: string;
  dateFin: string;
  isActive: boolean;
  statut: string;
  clientUsername: string;
  clientEmail: string;
}

export interface RevenuMois {
  mois: string;
  revenu: number;
}

export interface Stats {
  totalAbonnes: number;
  revenuMensuel: number;
  servicesActifs: number;
  demandesEnAttente: number;
  abonnementsRecents: AbonnementRecent[];
  revenuParMois: RevenuMois[];
  abonnementsActifs: number;
  abonnementsExpires: number;
}

export const EMPTY_STATS: Stats = {
  totalAbonnes: 0,
  revenuMensuel: 0,
  servicesActifs: 0,
  demandesEnAttente: 0,
  abonnementsRecents: [],
  revenuParMois: [],
  abonnementsActifs: 0,
  abonnementsExpires: 0,
};