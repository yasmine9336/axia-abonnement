export function formatChatTime(date: string) {
  return new Date(date).toLocaleTimeString("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatBadge(count: number) {
  return count > 9 ? "9+" : count;
}