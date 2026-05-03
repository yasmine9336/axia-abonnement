export interface ServiceItem {
  id: string;
  intituleService: string;
  description: string;
  parMois: number;
  parAnnee: number;
  isActive: boolean;
  creePar: string;
  nbOffres: number;
}

export interface OffreItem {
  id: string;
  intituleOffre: string;
  description: string;
  dureeEnMois: number;
  prix: number;
  isActive: boolean;
  creePar: string;
  services: string[];
}

export const PAGE_SIZE = 4;
