import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useAutoScroll } from "../../hooks/useAutoScroll";
import { Send, Loader2, MessageSquare, Clock } from "lucide-react";
import type { ChatMessage, Conversation } from "../../types";
import { useStaffChat } from "../../hooks/useChat";
import { useNotifications } from "../../hooks/useNotifications";
import UiCard from "../common/UiCard";

type ConversationFilter = "all" | "unread" | "read";

export default function StaffInbox() {
  const {
    conversations,
    selected,
    messages,
    sending,
    loading,
    totalUnread,
    openConversation,
    openConversationByClientId,
    sendMessage,
    hideConversation,
    closeConversation,
  } = useStaffChat();

  const { resetUnreadMessages } = useNotifications();
  const [input, setInput] = useState("");
  const [conversationFilter, setConversationFilter] =
    useState<ConversationFilter>("all");

  const bottomRef = useAutoScroll(messages);

  const [sp, setSearchParams] = useSearchParams();
  const clientId = sp.get("clientId");

  useEffect(() => {
    if (!clientId) return;

    const run = async () => {
      try {
        await openConversationByClientId(clientId);
        resetUnreadMessages();
      } catch {
        // optional
      }
    };

    run();
  }, [clientId, openConversationByClientId, resetUnreadMessages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    await sendMessage(input);
    setInput("");
  };

  const handleOpenConversation = async (conv: Conversation) => {
    await openConversation(conv);
    resetUnreadMessages();
  };

  const handleClose = async () => {
    if (!selected) return;

    const isEmpty = messages.length === 0 && !selected.lastMessage;

    if (isEmpty) {
      await closeConversation(selected);
      setSearchParams({}, { replace: true });
      return;
    }

    await hideConversation();
  };

  const formatTime = (d: string) =>
    new Date(d).toLocaleString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });

  const unreadConversationsCount = useMemo(
    () => conversations.filter((c) => (c.unreadCount ?? 0) > 0).length,
    [conversations],
  );

  const readConversationsCount =
    conversations.length - unreadConversationsCount;

  const filteredConversations = useMemo(() => {
    if (conversationFilter === "unread") {
      return conversations.filter((c) => (c.unreadCount ?? 0) > 0);
    }

    if (conversationFilter === "read") {
      return conversations.filter((c) => (c.unreadCount ?? 0) === 0);
    }

    return conversations;
  }, [conversations, conversationFilter]);

  const filterTabs: Array<{
    key: ConversationFilter;
    label: string;
    count: number;
  }> = [
    {
      key: "all",
      label: "Tous",
      count: conversations.length,
    },
    {
      key: "unread",
      label: "Non lus",
      count: unreadConversationsCount,
    },
    {
      key: "read",
      label: "Lus",
      count: readConversationsCount,
    },
  ];

  return (
    <div className="ui-page pl-4">
      <div className="mb-4">
        <h1 className="ui-title">Messages</h1>

        <p className="ui-subtitle">
          {totalUnread > 0
            ? `${totalUnread} message(s) non lu(s)`
            : `${conversations.length} conversation(s)`}
        </p>
      </div>

      <div
        className="flex gap-5 min-h-0"
        style={{ height: "calc(100vh - 215px)" }}
      >
        {/* Liste conversations */}
        <UiCard className="w-80 p-0 flex flex-col overflow-hidden">
          <div className="p-3 border-b border-gray-100 bg-white">
            <div className="flex items-center gap-1 bg-gray-100 rounded-xl p-1">
              {filterTabs.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setConversationFilter(tab.key)}
                  className={`flex-1 px-2 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                    conversationFilter === tab.key
                      ? "bg-white shadow-sm text-(--color-primary)"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  {tab.label}
                  <span className="ml-1">{tab.count}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center h-32">
                <Loader2
                  className="animate-spin text-(--color-primary)"
                  size={24}
                />
              </div>
            ) : filteredConversations.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                <MessageSquare className="mx-auto mb-2" size={28} />
                <p className="text-sm">
                  {conversationFilter === "unread"
                    ? "Aucune conversation non lue"
                    : conversationFilter === "read"
                      ? "Aucune conversation lue"
                      : "Aucune conversation"}
                </p>
              </div>
            ) : (
              filteredConversations.map((conv: Conversation) => (
                <button
                  key={conv.id}
                  onClick={() => void handleOpenConversation(conv)}
                  className={`w-full text-left p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors ${
                    selected?.id === conv.id ? "border-l-2" : ""
                  }`}
                  style={
                    selected?.id === conv.id
                      ? {
                          background: "var(--color-primary-soft)",
                          borderLeftColor: "var(--color-primary)",
                        }
                      : undefined
                  }
                >
                  <div className="flex items-start gap-3">
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0 mt-0.5"
                      style={{ background: "var(--color-primary)" }}
                    >
                      {conv.clientName.charAt(0).toUpperCase()}
                    </div>

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

                      {(conv.unreadCount ?? 0) > 0 && (
                        <span
                          className="w-5 h-5 text-white text-xs font-bold rounded-full flex items-center justify-center"
                          style={{ background: "var(--color-primary)" }}
                        >
                          {conv.unreadCount}
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
        </UiCard>

        {/* Chat */}
        <UiCard className="flex-1 p-0 flex flex-col overflow-hidden min-h-0">
          {!selected ? (
            <div className="flex items-center justify-center h-full text-gray-400">
              <div className="text-center">
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-3"
                  style={{ background: "var(--color-primary-soft)" }}
                >
                  <MessageSquare
                    size={26}
                    style={{ color: "var(--color-primary)" }}
                  />
                </div>

                <p className="text-sm font-medium text-gray-600">
                  Sélectionnez une conversation
                </p>

                <p className="text-xs text-gray-400 mt-1">
                  Les messages apparaîtront ici
                </p>
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
                    onClick={() => void handleClose()}
                    className="flex items-center gap-1.5 text-xs text-red-500 hover:bg-red-50 px-3 py-1.5 rounded-xl border border-red-200"
                  >
                    Fermer
                  </button>
                )}
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
                {messages.map((msg: ChatMessage) => {
                  const isClient = msg.senderType === "Client";

                  return (
                    <div
                      key={msg.id}
                      className={`flex items-end gap-2 ${
                        isClient ? "justify-start" : "justify-end"
                      }`}
                    >
                      {isClient && (
                        <div
                          className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0 mb-1"
                          style={{
                            background: "var(--color-primary-soft)",
                            color: "var(--color-primary)",
                          }}
                        >
                          {selected?.clientName?.charAt(0).toUpperCase() ?? "C"}
                        </div>
                      )}

                      <div
                        className={`max-w-[70%] px-3 py-2.5 text-sm ${
                          isClient
                            ? "bg-white text-gray-800 shadow-sm rounded-2xl rounded-bl-sm border border-gray-100"
                            : "text-white rounded-2xl rounded-br-sm"
                        }`}
                        style={
                          !isClient
                            ? { background: "var(--color-primary)" }
                            : undefined
                        }
                      >
                        <p className="leading-relaxed">{msg.content}</p>

                        <p
                          className={`text-[10px] mt-1.5 ${
                            isClient
                              ? "text-gray-400"
                              : "text-white/70 text-right"
                          }`}
                        >
                          {new Date(msg.createdAt).toLocaleTimeString("fr-FR", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
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
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          void handleSend();
                        }
                      }}
                      placeholder="Répondre au client..."
                      className="flex-1 bg-transparent text-sm text-gray-700 placeholder-gray-400 outline-none"
                    />

                    <button
                      onClick={() => void handleSend()}
                      disabled={!input.trim() || sending}
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-white disabled:opacity-40 transition-all shrink-0"
                      style={{ background: "var(--color-primary)" }}
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
            </>
          )}
        </UiCard>
      </div>
    </div>
  );
}
