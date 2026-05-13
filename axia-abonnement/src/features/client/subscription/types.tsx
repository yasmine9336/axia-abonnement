export interface Offre {
  id: string;
  intituleOffre: string;
  description: string;
  dureeEnMois: number;
  prix: number;
  services: string[];
  moyenneNote?: number | null;
  nombreAvis?: number | null;
  secteurActivite?: string | null; 
}

export interface Service {
  id: string;
  intituleService: string;
  description: string;
  parMois: number;
  parAnnee: number;
  moyenneNote?: number | null;
  nombreAvis?: number | null;
  secteurActivite?: string | null; 
}

export type BillingType = "mensuel" | "annuel";

export type Selection =
  | { kind: "offre"; item: Offre }
  | { kind: "service"; item: Service };
