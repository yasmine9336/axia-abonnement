export type ConversationFilter = "all" | "unread" | "read";

export interface ConversationFilterTab {
  key: ConversationFilter;
  label: string;
  count: number;
}