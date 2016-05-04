import { useEffect } from "react";
import { Loader2, MessageCircle, Send } from "lucide-react";
import { useAutoScroll } from "../../../../hooks/useAutoScroll";
import type { ChatMessage } from "../../../../types";
import type { ResponsableChatItem } from "../types";
import { formatChatTime } from "../utils";

interface ClientMessagesPanelProps {
  selected: ResponsableChatItem;
  messages: ChatMessage[];
  input: string;
  sending: boolean;
  onInputChange: (value: string) => void;
  onSend: () => void;
}

export default function ClientMessagesPanel({
  selected,
  messages,
  input,
  sending,
  onInputChange,
  onSend,
}: ClientMessagesPanelProps) {
  const bottomRef = useAutoScroll(messages);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      bottomRef.current?.scrollIntoView({
        behavior: "auto",
        block: "end",
      });
    }, 50);

    return () => window.clearTimeout(timeoutId);
  }, [messages.length, selected.id, bottomRef]);

  return (
    <>
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-3 bg-(--color-primary-soft)">
              <MessageCircle size={22} className="text-(--color-primary)" />
            </div>

            <p className="text-sm font-medium text-gray-700">
              Comment pouvons-nous vous aider ?
            </p>

            <p className="text-xs text-gray-400 mt-1">
              Envoyez un message pour commencer
            </p>
          </div>
        )}

        {messages.map((message) => {
          const isClient = message.senderType === "Client";

          return (
            <div
              key={message.id}
              className={`flex items-end gap-2 ${
                isClient ? "justify-end" : "justify-start"
              }`}
            >
              {!isClient && (
                <div className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0 mb-1 bg-(--color-primary)">
                  {selected.username.charAt(0).toUpperCase()}
                </div>
              )}

              <div
                className={`max-w-[75%] px-3 py-2.5 text-sm ${
                  isClient
                    ? "text-white rounded-2xl rounded-br-sm bg-(--color-primary)"
                    : "bg-white text-gray-800 shadow-sm rounded-2xl rounded-bl-sm border border-gray-100"
                }`}
              >
                <p className="leading-relaxed">{message.content}</p>

                <p
                  className={`text-[10px] mt-1.5 ${
                    isClient ? "text-white/70 text-right" : "text-gray-400"
                  }`}
                >
                  {formatChatTime(message.createdAt)}
                </p>
              </div>
            </div>
          );
        })}

        <div ref={bottomRef} />
      </div>

      <div className="p-3 border-t border-gray-100 bg-white shrink-0">
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
            placeholder="Écrivez un message..."
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
    </>
  );
}