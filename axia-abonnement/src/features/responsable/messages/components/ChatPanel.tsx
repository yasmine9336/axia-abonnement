import { Clock, Loader2, MessageSquare, Send } from "lucide-react";
import UiCard from "../../../../components/common/UiCard";
import { useAutoScroll } from "../../../../hooks/useAutoScroll";
import type { ChatMessage, Conversation } from "../../../../types";
import { formatMessageTime } from "../utils";

interface ChatPanelProps {
  selected: Conversation | null;
  messages: ChatMessage[];
  input: string;
  sending: boolean;
  onInputChange: (value: string) => void;
  onSend: () => void;
  onCloseConversation: () => void;
}

export default function ChatPanel({
  selected,
  messages,
  input,
  sending,
  onInputChange,
  onSend,
  onCloseConversation,
}: ChatPanelProps) {
  const bottomRef = useAutoScroll(messages);

  if (!selected) {
    return (
      <UiCard className="flex-1 p-0 flex flex-col overflow-hidden min-h-0">
        <div className="flex items-center justify-center h-full text-gray-400">
          <div className="text-center">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-3 bg-(--color-primary-soft)">
              <MessageSquare size={26} className="text-(--color-primary)" />
            </div>

            <p className="text-sm font-medium text-gray-600">
              Sélectionnez une conversation
            </p>

            <p className="text-xs text-gray-400 mt-1">
              Les messages apparaîtront ici
            </p>
          </div>
        </div>
      </UiCard>
    );
  }

  return (
    <UiCard className="flex-1 p-0 flex flex-col overflow-hidden min-h-0">
      <div className="p-4 border-b border-gray-100 flex items-center justify-between">
        <div>
          <p className="font-semibold text-gray-900">{selected.clientName}</p>
          <p className="text-xs text-gray-400">{selected.clientEmail}</p>
        </div>

        {selected.statut === "Open" && (
          <button
            type="button"
            onClick={onCloseConversation}
            className="flex items-center gap-1.5 text-xs text-blue-500 hover:bg-blue-50 px-3 py-1.5 rounded-xl border border-red-200"
          >
            Fermer
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
        {messages.map((message) => {
          const isClient = message.senderType === "Client";

          return (
            <div
              key={message.id}
              className={`flex items-end gap-2 ${
                isClient ? "justify-start" : "justify-end"
              }`}
            >
              {isClient && (
                <div className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0 mb-1 bg-(--color-primary-soft)">
                  {selected.clientName?.charAt(0).toUpperCase() ?? "C"}
                </div>
              )}

              <div
                className={`max-w-[70%] px-3 py-2.5 text-sm ${
                  isClient
                    ? "bg-white text-gray-800 shadow-sm rounded-2xl rounded-bl-sm border border-gray-100"
                    : "text-white rounded-2xl rounded-br-sm bg-(--color-primary)"
                }`}
              >
                <p className="leading-relaxed">{message.content}</p>

                <p
                  className={`text-[10px] mt-1.5 ${
                    isClient ? "text-gray-400" : "text-white/70 text-right"
                  }`}
                >
                  {formatMessageTime(message.createdAt)}
                </p>
              </div>
            </div>
          );
        })}

        <div ref={bottomRef} />
      </div>

      {selected.statut === "Open" ? (
        <div className="p-3 border-t border-gray-100">
          <div className="flex items-center gap-2 bg-gray-50 rounded-xl px-3 py-2 border border-gray-200 focus-within:border-gray-300 transition-colors">
            <input
              value={input}
              onChange={(event) => onInputChange(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter" && !event.shiftKey) {
                  event.preventDefault();
                  onSend();
                }
              }}
              placeholder="Répondre au client..."
              className="flex-1 bg-transparent text-sm text-gray-700 placeholder-gray-400 outline-none"
            />

            <button
              type="button"
              onClick={onSend}
              disabled={!input.trim() || sending}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-white disabled:opacity-40 transition-all shrink-0 bg-(--color-primary)"
              aria-label="Envoyer le message"
            >
              {sending ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <Send size={14} />
              )}
            </button>
          </div>
        </div>
      ) : (
        <div className="p-3 border-t border-gray-100 text-center text-sm text-gray-400 flex items-center justify-center gap-2">
          <Clock size={14} /> Conversation fermée
        </div>
      )}
    </UiCard>
  );
}