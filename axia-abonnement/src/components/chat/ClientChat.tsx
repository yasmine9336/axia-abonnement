import { useState } from "react";
import { useAutoScroll } from "../../hooks/useAutoScroll";
import { useClientChat } from "../../hooks/useChat";
import { useNotifications } from "../../hooks/useNotifications";
import { MessageCircle, X, Send, Loader2 } from "lucide-react";

export default function ClientChat() {
  const [open, setOpenState] = useState(false);
  const [input, setInput] = useState("");
  const { messages, sending, loadMessages, sendMessage } = useClientChat();
  const { unreadChat, resetUnreadChat } = useNotifications();
  const bottomRef = useAutoScroll(messages);

  const handleToggle = async () => {
    const next = !open;
    setOpenState(next);
    if (next) {
      await loadMessages();
      resetUnreadChat();
    }
  };

  const handleSend = async () => {
    if (!input.trim()) return;
    await sendMessage(input);
    setInput("");
  };

  const formatTime = (d: string) =>
    new Date(d).toLocaleTimeString("fr-FR", {
      hour: "2-digit",
      minute: "2-digit",
    });

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
      {open && (
        <div className="w-82 bg-white rounded-2xl border border-gray-200 shadow-2xl flex flex-col overflow-hidden"
          style={{ height: "480px" }}>

          {/* Header */}
          <div
            className="px-4 py-3 flex items-center gap-3"
            style={{ background: "var(--color-primary)" }}
          >
            {/* Avatar support */}
            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center shrink-0">
              <MessageCircle size={16} className="text-white" />
            </div>

            <div className="flex-1 min-w-0">
              <p className="text-white font-semibold text-sm leading-none">
                Support AxiaAbonnement
              </p>
              <div className="flex items-center gap-1.5 mt-1">
                <span className="w-1.5 h-1.5 bg-green-400 rounded-full" />
                <p className="text-white/80 text-xs">En ligne</p>
              </div>
            </div>

            <button
              onClick={() => void handleToggle()}
              className="w-7 h-7 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors shrink-0"
            >
              <X size={16} className="text-white" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
            {messages.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center mb-3"
                  style={{ background: "var(--color-primary-soft)" }}
                >
                  <MessageCircle
                    size={22}
                    style={{ color: "var(--color-primary)" }}
                  />
                </div>
                <p className="text-sm font-medium text-gray-700">
                  Comment pouvons-nous vous aider ?
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  Envoyez un message pour commencer
                </p>
              </div>
            )}

            {messages.map((msg) => {
              const isClient = msg.senderType === "Client";
              return (
                <div
                  key={msg.id}
                  className={`flex items-end gap-2 ${isClient ? "justify-end" : "justify-start"}`}
                >
                  {/* Avatar staff */}
                  {!isClient && (
                    <div
                      className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0 mb-1"
                      style={{ background: "var(--color-primary)" }}
                    >
                      A
                    </div>
                  )}

                  <div
                    className={`max-w-[75%] px-3 py-2.5 text-sm ${
                      isClient
                        ? "text-white rounded-2xl rounded-br-sm"
                        : "bg-white text-gray-800 shadow-sm rounded-2xl rounded-bl-sm border border-gray-100"
                    }`}
                    style={isClient ? { background: "var(--color-primary)" } : undefined}
                  >
                    <p className="leading-relaxed">{msg.content}</p>
                    <p
                      className={`text-[10px] mt-1.5 ${
                        isClient ? "text-white/70 text-right" : "text-gray-400"
                      }`}
                    >
                      {formatTime(msg.createdAt)}
                    </p>
                  </div>
                </div>
              );
            })}

            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="p-3 border-t border-gray-100 bg-white">
            <div className="flex items-center gap-2 bg-gray-50 rounded-xl px-3 py-2 border border-gray-200 focus-within:border-gray-300 transition-colors">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    void handleSend();
                  }
                }}
                placeholder="Écrivez un message..."
                className="flex-1 bg-transparent text-sm text-gray-700 placeholder-gray-400 outline-none"
              />
              <button
                onClick={() => void handleSend()}
                disabled={!input.trim() || sending}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-white disabled:opacity-40 transition-all shrink-0"
                style={{ background: "var(--color-primary)" }}
              >
                {sending
                  ? <Loader2 size={14} className="animate-spin" />
                  : <Send size={14} />
                }
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bouton flottant */}
      <button
        onClick={() => void handleToggle()}
        className="w-14 h-14 text-white rounded-full shadow-lg flex items-center justify-center transition-all relative hover:scale-105"
        style={{ background: "var(--color-primary)" }}
      >
        {open ? <X size={22} /> : <MessageCircle size={22} />}

        {!open && unreadChat > 0 && (
          <span className="absolute -top-1 -right-1 min-w-5 h-5 px-1 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
            {unreadChat > 9 ? "9+" : unreadChat}
          </span>
        )}
      </button>
    </div>
  );
}