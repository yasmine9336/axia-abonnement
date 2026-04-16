import { useState } from "react";
import { Send, Loader2, MessageSquare, X, Clock } from "lucide-react";
import axiosInstance from "../../api/axiosInstance";
import type { ChatMessage, Conversation } from "../../types";
import { useStaffChat } from "../../hooks/useChat";
import { useNotifications } from "../../context/useNotifications";

export default function StaffInbox() {
  const {
    conversations,
    selected,
    messages,
    sending,
    loading,
    totalUnread,
    openConversation,
    sendMessage,
    closeConversation,
  } = useStaffChat();

  const { resetUnreadMessages } = useNotifications();

  const [input, setInput] = useState("");
  const [localMessages, setLocalMessages] = useState<ChatMessage[]>([]);

  const displayMessages = localMessages.length > 0 ? localMessages : messages;

  const handleSend = async () => {
    if (!input.trim()) return;
    await sendMessage(input);
    setInput("");

    if (selected) {
      const res = await axiosInstance.get(
        `/chat/conversations/${selected.id}/messages`
      );
      setLocalMessages(res.data);
    }
  };

  const handleOpenConversation = async (conv: Conversation) => {
    setLocalMessages([]);
    await openConversation(conv);

    // ✅ badge disparaît seulement après ouverture réelle d'une conversation
    resetUnreadMessages();
  };

  const handleClose = async () => {
    if (!selected || !confirm("Fermer cette conversation ?")) return;
    await closeConversation(selected);
  };

  const formatTime = (d: string) =>
    new Date(d).toLocaleString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Messages</h1>
        <p className="text-gray-500 text-sm mt-1">
          {totalUnread > 0
            ? `${totalUnread} message(s) non lu(s)`
            : `${conversations.length} conversation(s)`}
        </p>
      </div>

      <div className="flex gap-6 h-150">
        <div className="w-72 bg-white rounded-2xl border border-gray-200 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <Loader2 className="animate-spin text-[#4F46E5]" size={24} />
            </div>
          ) : conversations.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <MessageSquare className="mx-auto mb-2" size={28} />
              <p className="text-sm">Aucune conversation</p>
            </div>
          ) : (
            conversations.map((conv: Conversation) => (
              <button
                key={conv.id}
                onClick={() => handleOpenConversation(conv)}
                className={`w-full text-left p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors ${
                  selected?.id === conv.id
                    ? "bg-indigo-50 border-l-2 border-l-[#4F46E5]"
                    : ""
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold text-gray-900 truncate">
                        {conv.clientName}
                      </p>
                      {conv.statut === "Closed" && (
                        <span className="text-xs bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded-full shrink-0">
                          Fermé
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-400 truncate mt-0.5">
                      {conv.lastMessage?.content ?? "Aucun message"}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-1 shrink-0">
                    <span className="text-xs text-gray-400">
                      {formatTime(conv.updatedAt)}
                    </span>
                    {conv.unreadCount > 0 && (
                      <span className="w-5 h-5 bg-[#4F46E5] text-white text-xs font-bold rounded-full flex items-center justify-center">
                        {conv.unreadCount}
                      </span>
                    )}
                  </div>
                </div>
              </button>
            ))
          )}
        </div>

        <div className="flex-1 bg-white rounded-2xl border border-gray-200 flex flex-col overflow-hidden">
          {!selected ? (
            <div className="flex items-center justify-center h-full text-gray-400">
              <div className="text-center">
                <MessageSquare className="mx-auto mb-3" size={36} />
                <p className="text-sm">Sélectionnez une conversation</p>
              </div>
            </div>
          ) : (
            <>
              <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                <div>
                  <p className="font-semibold text-gray-900">
                    {selected.clientName}
                  </p>
                  <p className="text-xs text-gray-400">
                    {selected.clientEmail}
                  </p>
                </div>
                {selected.statut === "Open" && (
                  <button
                    onClick={handleClose}
                    className="flex items-center gap-1.5 text-xs text-red-500 hover:bg-red-50 px-3 py-1.5 rounded-lg border border-red-200 transition-colors"
                  >
                    <X size={13} /> Fermer
                  </button>
                )}
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
                {displayMessages.map((msg: ChatMessage) => (
                  <div
                    key={msg.id}
                    className={`flex ${
                      msg.senderType === "Client"
                        ? "justify-start"
                        : "justify-end"
                    }`}
                  >
                    <div
                      className={`max-w-[70%] px-3 py-2 rounded-2xl text-sm ${
                        msg.senderType === "Client"
                          ? "bg-white text-gray-800 shadow-sm rounded-bl-sm"
                          : "bg-[#4F46E5] text-white rounded-br-sm"
                      }`}
                    >
                      {msg.senderType !== "Client" && (
                        <p className="text-xs text-indigo-200 mb-1">
                          {msg.senderType}
                        </p>
                      )}
                      <p>{msg.content}</p>
                      <p
                        className={`text-xs mt-1 ${
                          msg.senderType === "Client"
                            ? "text-gray-400"
                            : "text-indigo-200"
                        }`}
                      >
                        {new Date(msg.createdAt).toLocaleTimeString("fr-FR", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {selected.statut === "Open" ? (
                <div className="p-3 border-t border-gray-100 flex gap-2">
                  <input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        void handleSend();
                      }
                    }}
                    placeholder="Répondre au client..."
                    className="flex-1 text-sm px-3 py-2 bg-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-[#4F46E5]"
                  />
                  <button
                    onClick={() => void handleSend()}
                    disabled={!input.trim() || sending}
                    className="p-2 bg-[#4F46E5] hover:bg-[#4338CA] text-white rounded-xl disabled:opacity-50"
                  >
                    {sending ? (
                      <Loader2 size={16} className="animate-spin" />
                    ) : (
                      <Send size={16} />
                    )}
                  </button>
                </div>
              ) : (
                <div className="p-3 border-t border-gray-100 text-center text-sm text-gray-400 flex items-center justify-center gap-2">
                  <Clock size={14} /> Conversation fermée
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}