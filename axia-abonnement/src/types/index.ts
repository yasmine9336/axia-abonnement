// ─── Auth ────────────────────────────────────────────────────
export interface UserInfo {
  id: string;
  username: string;
  email: string;
  role: 'Admin' | 'Responsable' | 'Client';
}

// ─── Abonnements ─────────────────────────────────────────────
export interface AbonnementItem {
  id: string;
  intituleOffre: string;
  description: string;
  type: string;
  montant: number;
  dateDebut: string;
  dateFin: string;
  isActive: boolean;
  statut: 'actif' | 'Actif' | 'expiré' | 'Expiré' | 'suspendu' | 'désactivé';
  clientUsername?: string;
  clientEmail?: string;
}

export interface StatsData {
  totalAbonnes: number;
  revenuMensuel: number;
  servicesActifs: number;
  demandesEnAttente: number;
  abonnementsRecents: AbonnementItem[];
}

// ─── Paiements ───────────────────────────────────────────────
export interface PaiementItem {
  id: string;
  montant: number;
  statut: string;
  createdAt: string;
  abonnementId: string;
  clientUsername?: string;
  clientEmail?: string;
}

// ─── Chat ────────────────────────────────────────────────────
export interface ChatMessage {
  id: string;
  content: string;
  senderType: 'Client' | 'Responsable' | 'Bot';
  senderUserId: string | null;
  createdAt: string;
  isRead: boolean;
}

export interface LastMessage {
  content: string;
  senderType: string;
  createdAt: string;
}

export interface Conversation {
  id: string;
  clientId: string;
  clientName: string;
  clientEmail: string;
  statut: 'Open' | 'Closed';
  updatedAt: string;
  unreadCount: number;
  lastMessage: LastMessage | null;
}

// ─── Notifications ───────────────────────────────────────────
export interface NotificationItem {
  id: string;
  message: string;
  type: string;
  isRead: boolean;
  createdAt: string;
  route?: string; 
}

export interface ResponsableInfo {
  id: string;
  username: string;
  email: string;
  abonnementsLies: string[];
}
