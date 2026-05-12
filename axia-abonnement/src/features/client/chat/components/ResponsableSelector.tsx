import { Loader2, MessageCircle } from "lucide-react";
import type { ResponsableChatItem } from "../types";
import { formatBadge } from "../utils";

interface ResponsableSelectorProps {
  responsables: ResponsableChatItem[];
  loading: boolean;
  onOpenConversation: (responsable: ResponsableChatItem) => void;
}

export default function ResponsableSelector({
  responsables,
  loading,
  onOpenConversation,
}: ResponsableSelectorProps) {
  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 size={22} className="animate-spin text-(--color-primary)" />
      </div>
    );
  }

  if (responsables.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center px-6">
        <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-3 bg-(--color-primary-soft)">
          <MessageCircle size={22} className="text-(--color-primary)" />
        </div>

        <p className="text-sm font-medium text-gray-700">
          Aucun responsable disponible
        </p>

        <p className="text-xs text-gray-400 mt-1">
          Vous devez avoir un abonnement actif pour contacter un responsable.
        </p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto">
      {responsables.map((responsable) => {
        const unreadCount = responsable.unreadCount ?? 0;

        return (
          <button
            key={responsable.id}
            type="button"
            onClick={() => onOpenConversation(responsable)}
            className="w-full px-4 py-3 flex items-center gap-3 hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-0 text-left"
          >
            <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0 bg-(--color-primary)">
              {responsable.username.charAt(0).toUpperCase()}
            </div>

            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-800 truncate">
                {responsable.username}
              </p>

              {(responsable.abonnementsLies?.length ?? 0) > 0 && (
                <p className="text-xs text-gray-400 truncate">
                  {responsable.abonnementsLies?.join(", ")}
                </p>
              )}
            </div>

            {unreadCount > 0 && (
              <span className="min-w-5 h-5 px-1 bg-blue-500 text-white text-xs font-bold rounded-full flex items-center justify-center shrink-0">
                {formatBadge(unreadCount)}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}