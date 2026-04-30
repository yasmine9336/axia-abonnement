import type { RegisterForm } from "./types";

export const INITIAL_FORM: RegisterForm = {
  fullName: "",
  email: "",
  password: "",
  confirmPassword: "",
  role: "Client",
  phoneNumber: "",
  gouvernorat: "",
  ville: "",
  nomEntreprise: "",
  matriculeFiscal: "",
  secteurActivite: "",
  adresseProfessionnelle: "",
  dateNaissance: "",
  sexe: "",
};

export const inputClass =
  "w-full border-0 border-b-2 border-gray-200 pb-2 text-sm text-gray-800 placeholder-gray-300 outline-none transition-colors bg-transparent focus:border-(--color-primary)";