import type { BillingType, Offre, Selection, Service } from "./types";

export function getPrice(
  item: {
    dureeEnMois?: number;
    prix?: number;
    parMois?: number;
    parAnnee?: number;
  },
  type: BillingType,
) {
  if (item.prix !== undefined) return item.prix;
  return type === "annuel" ? (item.parAnnee ?? 0) : (item.parMois ?? 0);
}

export function getSelectionName(selection: Selection | null) {
  if (!selection) return "";

  return selection.kind === "offre"
    ? selection.item.intituleOffre
    : selection.item.intituleService;
}

export function getSelectionLabel(selection: Selection | null) {
  return selection?.kind === "offre" ? "Offre" : "Service";
}

export function getSelectedAmount(
  selection: Selection | null,
  type: BillingType,
) {
  if (!selection) return null;

  return getPrice(selection.item, type);
}

export function getRelatedOffres(service: Service, offres: Offre[]) {
  return offres.filter((offre) =>
    offre.services.includes(service.intituleService),
  );
}

export function getOptionSelectedClass(isSelected: boolean) {
  return `text-left rounded-2xl border p-5 bg-white shadow-sm transition-all cursor-pointer ${
    isSelected
      ? "border-blue-500 ring-4 ring-blue-500/10 bg-blue-50/30"
      : "border-gray-200 hover:border-blue-300 hover:shadow-md hover:bg-blue-50/20"
  }`;
}
