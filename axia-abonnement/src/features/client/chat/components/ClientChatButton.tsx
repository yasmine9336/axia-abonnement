import { MessageCircle } from "lucide-react";
import { formatBadge } from "../utils";

interface ClientChatButtonProps {
  unreadChat: number;
  onOpen: () => void;
}

export default function ClientChatButton({
  unreadChat,
  onOpen,
}: ClientChatButtonProps) {
  return (
    <button
      type="button"
      onClick={onOpen}
      className="w-14 h-14 text-white rounded-full shadow-lg flex items-center justify-center transition-all relative hover:scale-105"
      style={{ background: "var(--color-primary)" }}
      aria-label="Ouvrir le chat"
    >
      <MessageCircle size={22} />

      {unreadChat > 0 && (
        <span className="absolute -top-1 -right-1 min-w-5 h-5 px-1 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
          {formatBadge(unreadChat)}
        </span>
      )}
    </button>
  );
}