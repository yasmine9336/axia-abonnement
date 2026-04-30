// ─── Auth ────────────────────────────────────────────────────
export interface UserInfo {
  id: string;
  username: string;
  email: string;
  role: "Admin" | "Responsable" | "Client";
}

// ─── Chat ────────────────────────────────────────────────────
export interface ChatMessage {
  id: string;
  content: string;
  senderType: "Client" | "Responsable";
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
  statut: "Open" | "Closed";
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

// ─── Responsable lié au chat client ──────────────────────────
export interface ResponsableInfo {
  id: string;
  username: string;
  email: string;
  abonnementsLies: string[];
}