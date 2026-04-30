export interface Service {
  id: string;
  intituleService: string;
}

export interface Offre {
  id: string;
  intituleOffre: string;
  description: string;
  parMois: number;
  parAnnee: number;
  nbAbonnes: number;
  isActive: boolean;
  createdAt: string;
  creePar: string;
  cbModification: string | null;
  cbModificateur: string | null;
  services: string[];
}

export interface OffreForm {
  intituleOffre: string;
  description: string;
  parMois: number | "";
  parAnnee: number | "";
  serviceIds: string[];
}

export type StatusFilter = "tous" | "actif" | "inactif";
export type ServicesFilter = "all" | "withServices" | "withoutServices";
export type AbonnesFilter = "all" | "withAbonnes" | "withoutAbonnes";

export const emptyForm: OffreForm = {
  intituleOffre: "",
  description: "",
  parMois: "",
  parAnnee: "",
  serviceIds: [],
};

export const PAGE_SIZE = 3;