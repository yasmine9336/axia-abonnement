export type Role = "Client" | "Responsable";

export interface RegisterForm {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
  role: Role;
  phoneNumber: string;
  gouvernorat: string;
  ville: string;
  nomEntreprise: string;
  matriculeFiscal: string;
  secteurActivite: string;
  adresseProfessionnelle: string;
  dateNaissance: string;
  sexe: string;
}

export type RegisterStep = 1 | 2;