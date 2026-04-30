export interface ResponsableChatItem {
  id: string;
  username: string;
  email?: string;
  abonnementsLies?: string[];
  unreadCount: number;
}