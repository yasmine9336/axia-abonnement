export interface ProfileData {
  id: string;
  username: string;
  email: string;
  phoneNumber: string | null;
  role: string;
  profileImageUrl?: string | null;
  gouvernorat?: string | null;
  ville?: string | null;
  nomEntreprise?: string | null;
  matriculeFiscal?: string | null;
  secteurActivite?: string | null;
  adresseProfessionnelle?: string | null;
  createdAt?: string;
}

export interface ProfileStats {
  nombreResponsables?: number;
  nombreClients?: number;
  abonnementsActifs?: number;
  revenusMois?: number;
  nombreServices?: number;
  nombreOffres?: number;
  mesServices?: number;
  mesClients?: number;
  mesOffres?: number;
  abonnementsExpires?: number;
  totalPaye?: number;
}

export interface ProfileForm {
  username: string;
  email: string;
  phoneNumber: string;
  gouvernorat: string;
  ville: string;
}

export interface PasswordForm {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export type StatIconKey =
  | "userCheck"
  | "users"
  | "creditCard"
  | "trendingUp"
  | "package"
  | "briefcase"
  | "clock";

export interface StatCard {
  label: string;
  value: string | number;
  icon: StatIconKey;
  iconClassName: string;
}