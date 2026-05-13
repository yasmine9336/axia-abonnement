export interface Service {
  id: string;
  intituleService: string;
  description: string;
  parMois: number;
  parAnnee: number;
  nbAbonnes: number;
  nbOffres: number;
  isActive: boolean;
  createdAt: string;
  creePar: string;
  modifieLe: string | null;
  modifiePar: string | null;
}

export interface ServiceForm {
  intituleService: string;
  description: string;
  parMois: number | "";
  parAnnee: number | "";
}

export type StatusFilter = "tous" | "actif" | "inactif";
export type OffersFilter = "all" | "withOffers" | "withoutOffers";
export type AbonnesFilter = "all" | "withAbonnes" | "withoutAbonnes";

export const emptyForm: ServiceForm = {
  intituleService: "",
  description: "",
  parMois: "",
  parAnnee: "",
};

export const PAGE_SIZE = 3;
