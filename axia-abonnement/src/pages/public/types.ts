export interface Service {
  id: string;
  intituleService: string;
  description: string;
  parMois: number;
  parAnnee: number;
  moyenneNote?: number | null;
  nombreAvis?: number | null;
}

export interface Offre {
  id: string;
  intituleOffre: string;
  description: string;
  parMois: number;
  parAnnee: number;
  services: string[];
  moyenneNote?: number | null;
  nombreAvis?: number | null;
}