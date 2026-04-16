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
    // SignalR ajoute le message via ReceiveMessage
  };

  const formatTime = (d: string) =>
    new Date(d).toLocaleTimeString("fr-FR", {
      hour: "2-digit",
      minute: "2-digit",
    });

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
      {open && (
        <div className="w-80 h-112.5 bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col overflow-hidden">
          <div className="bg-[#4F46E5] px-4 py-3 flex items-center justify-between">
            <div>
              <p className="text-white font-semibold text-sm">
                Support AxiaAbonnement
              </p>
              <p className="text-indigo-200 text-xs">Nous répondons rapidement</p>
            </div>
            <button
              onClick={() => void handleToggle()}
              className="text-indigo-200 hover:text-white"
            >
              <X size={18} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
            {messages.length === 0 && (
              <div className="text-center text-gray-400 text-xs mt-8">
                <MessageCircle className="mx-auto mb-2" size={28} />
                Envoyez un message pour commencer
              </div>
            )}
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${
                  msg.senderType === "Client" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[75%] px-3 py-2 rounded-2xl text-sm ${
                    msg.senderType === "Client"
                      ? "bg-[#4F46E5] text-white rounded-br-sm"
                      : "bg-white text-gray-800 shadow-sm rounded-bl-sm"
                  }`}
                >
                  <p>{msg.content}</p>
                  <p
                    className={`text-xs mt-1 ${
                      msg.senderType === "Client"
                        ? "text-indigo-200"
                        : "text-gray-400"
                    }`}
                  >
                    {formatTime(msg.createdAt)}
                  </p>
                </div>
              </div>
            ))}
            <div ref={bottomRef} />
          </div>

          <div className="p-3 border-t border-gray-100 bg-white flex gap-2">
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
              className="flex-1 text-sm px-3 py-2 bg-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-[#4F46E5]"
            />
            <button
              onClick={() => void handleSend()}
              disabled={!input.trim() || sending}
              className="p-2 bg-[#4F46E5] hover:bg-[#4338CA] text-white rounded-xl disabled:opacity-50 transition-colors"
            >
              {sending ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Send size={16} />
              )}
            </button>
          </div>
        </div>
      )}

      <button
        onClick={() => void handleToggle()}
        className="w-14 h-14 bg-[#4F46E5] hover:bg-[#4338CA] text-white rounded-full shadow-lg flex items-center justify-center transition-all relative"
      >
        {open ? <X size={22} /> : <MessageCircle size={22} />}
        {!open && unreadChat > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
            {unreadChat > 9 ? "9+" : unreadChat}
          </span>
        )}
      </button>
    </div>
  );
}
