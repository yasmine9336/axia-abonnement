import { ChevronLeft, MessageCircle, X } from "lucide-react";
import type { ResponsableChatItem } from "../types";

interface ClientChatHeaderProps {
  selected: ResponsableChatItem | null;
  onBack: () => void;
  onClose: () => void;
}

export default function ClientChatHeader({
  selected,
  onBack,
  onClose,
}: ClientChatHeaderProps) {
  return (
    <div className="px-4 py-3 flex items-center gap-3 shrink-0 bg-(--color-primary)">
      {selected ? (
        <button
          type="button"
          onClick={onBack}
          className="w-7 h-7 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors shrink-0"
          aria-label="Retour à la liste des responsables"
        >
          <ChevronLeft size={16} className="text-white" />
        </button>
      ) : (
        <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center shrink-0">
          <MessageCircle size={16} className="text-white" />
        </div>
      )}

      <div className="flex-1 min-w-0">
        <p className="text-white font-semibold text-sm leading-none truncate">
          {selected ? selected.username : "Support AxiaAbonnement"}
        </p>

        {selected && (selected.abonnementsLies?.length ?? 0) > 0 && (
          <p className="text-white/70 text-xs mt-0.5 truncate">
            {selected.abonnementsLies?.join(", ")}
          </p>
        )}

        {!selected && (
          <div className="flex items-center gap-1.5 mt-1">
            <span className="w-1.5 h-1.5 bg-green-400 rounded-full" />
            <p className="text-white/80 text-xs">En ligne</p>
          </div>
        )}
      </div>

      <button
        type="button"
        onClick={onClose}
        className="w-7 h-7 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors shrink-0"
        aria-label="Fermer le chat"
      >
        <X size={16} className="text-white" />
      </button>
    </div>
  );
}