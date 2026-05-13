export interface Responsable {
  id: string;
  username: string;
  email: string;
  phoneNumber: string | null;
  isActive: boolean;
  profileImageUrl?: string | null;
}

export interface DemandeResponsable {
  id: string;
  username: string;
  email: string;
  phoneNumber: string | null;
  nomEntreprise: string | null;
  matriculeFiscal: string | null;
  secteurActivite: string | null;
  adresseProfessionnelle: string | null;
  statut: string;
  createdAt: string;
  dateAcceptation: string | null;
  motifRefus: string | null;
}

export interface ResponsableFormData {
  username: string;
  email: string;
  password: string;
  phoneNumber: string;
}

export type DemandeStatusFilter = "Pending" | "Accepted" | "Rejected" | "All";
export type ResponsableStatusFilter = "All" | "Active" | "Inactive";

export type ConfirmAction =
  | { type: "accept"; demande: DemandeResponsable }
  | { type: "reject"; demande: DemandeResponsable }
  | null;

export const STATUT_LABEL: Record<string, string> = {
  Pending: "En attente",
  Accepted: "Acceptée",
  Rejected: "Refusée",
};

export const STATUT_STYLES: Record<string, string> = {
  Pending: "bg-blue-50 text-indigo-600",
  Accepted: "bg-blue-100 text-blue-700",
  Rejected: "bg-blue-100 text-blue-800",
};