import { createContext } from "react";

export interface User {
  id: string;
  username: string;
  email: string;
  role: string;
}

export interface RegisterData {
  username: string;
  email: string;
  password: string;
  role: "Client" | "Responsable";
  phoneNumber?: string;
  nomEntreprise?: string;
  matriculeFiscal?: string;
  secteurActivite?: string;
  adresseProfessionnelle?: string;
}

export interface RegisterResult {
  role: string;
  statut?: string;
  message?: string;
}

export type LoginOutcome =
  | { kind: "success"; role: string }
  | { kind: "pending"; message: string }
  | { kind: "payment_required"; message: string; userId: string }
  | { kind: "rejected"; message: string }
  | { kind: "invalid"; message: string };

export interface AuthContextType {
  user: User | null;
  login: (email: string, password: string, remember: boolean) => Promise<LoginOutcome>;
  logout: () => void;
  register: (data: RegisterData) => Promise<RegisterResult>;
  loading: boolean;
}

export const AuthContext = createContext<AuthContextType | null>(null);