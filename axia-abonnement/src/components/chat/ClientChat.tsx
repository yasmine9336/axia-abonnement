import { useEffect, useState } from "react";
import axiosInstance from "../../api/axiosInstance";
import { useAutoScroll } from "../../hooks/useAutoScroll";
import { useClientChatWithSelection } from "../../hooks/useChat";
import { useNotifications } from "../../hooks/useNotifications";
import { MessageCircle, X, Send, Loader2, ChevronLeft } from "lucide-react";

export default function ClientChat() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [conversationByResponsable, setConversationByResponsable] = useState<
    Record<string, string>
  >({});
  const [responsableByConversation, setResponsableByConversation] = useState<
    Record<string, string>
  >({});
  const [unreadByResponsable, setUnreadByResponsable] = useState<
    Record<string, number>
  >({});

  const {
    responsables,
    selected,
    messages,
    sending,
    loading,
    selectResponsable,
    sendMessage,
    back,
  } = useClientChatWithSelection();
  const { unreadChat, consumeUnreadChat, signalRService } = useNotifications();
  const bottomRef = useAutoScroll(messages);

  useEffect(() => {
    if (responsables.length === 0) return;

    let cancelled = false;

    const loadConversationMaps = async () => {
      const byResp: Record<string, string> = {};
      const byConv: Record<string, string> = {};
      const unreadInit: Record<string, number> = {};

      for (const resp of responsables) {
        try {
          const convRes = await axiosInstance.get<{ id: string }>(
            `/chat/with-responsable/${resp.id}`,
          );
          const convId = convRes.data.id;
          byResp[resp.id] = convId;
          byConv[convId] = resp.id;
          unreadInit[resp.id] = unreadInit[resp.id] ?? 0;
        } catch {
          unreadInit[resp.id] = 0;
        }
      }

      if (cancelled) return;
      setConversationByResponsable(byResp);
      setResponsableByConversation(byConv);
      setUnreadByResponsable(unreadInit);
    };

    void loadConversationMaps();

    return () => {
      cancelled = true;
    };
  }, [responsables]);

  useEffect(() => {
    if (!signalRService) return;

    const handleStaffReplied = (payload: unknown) => {
      const data = payload as { conversationId?: string };
      if (!data.conversationId) return;

      const responsableId = responsableByConversation[data.conversationId];
      if (!responsableId) return;

      const activeConversationId = selected
        ? conversationByResponsable[selected.id]
        : null;
      const isActiveConversation = open && activeConversationId === data.conversationId;

      if (isActiveConversation) return;

      setUnreadByResponsable((prev) => ({
        ...prev,
        [responsableId]: (prev[responsableId] ?? 0) + 1,
      }));
    };

    signalRService.on("StaffReplied", handleStaffReplied);

    return () => {
      signalRService.off("StaffReplied", handleStaffReplied);
    };
  }, [
    signalRService,
    responsableByConversation,
    selected,
    conversationByResponsable,
    open,
  ]);

  const handleToggle = () => {
    setOpen((v) => !v);
  };

  const clearLineUnread = (responsableId: string) => {
    const lineUnread = unreadByResponsable[responsableId] ?? 0;
    if (lineUnread <= 0) return;

    setUnreadByResponsable((prev) => ({
      ...prev,
      [responsableId]: 0,
    }));
    consumeUnreadChat(lineUnread);
  };

  const handleSelectResponsable = async (
    resp: (typeof responsables)[number],
  ) => {
    await selectResponsable(resp);
    clearLineUnread(resp.id);
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
        <div
          className="w-82 bg-white rounded-2xl border border-gray-200 shadow-2xl flex flex-col overflow-hidden"
          style={{ height: "480px" }}
        >
          {/* Header */}
          <div
            className="px-4 py-3 flex items-center gap-3"
            style={{ background: "var(--color-primary)" }}
          >
            {selected ? (
              <button
                onClick={() => void back()}
                className="w-7 h-7 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors shrink-0"
              >
                <ChevronLeft size={16} className="text-white" />
              </button>
            ) : (
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                <MessageCircle size={16} className="text-white" />
              </div>
            )}

            <div className="flex-1 min-w-0">
              <p className="text-white font-semibold text-sm leading-none">
                {selected ? selected.username : "Support Axia"}
              </p>
              <p className="text-white/80 text-xs mt-0.5">
                {selected ? selected.email : "Choisissez un responsable"}
              </p>
            </div>

            <button
              onClick={handleToggle}
              className="w-7 h-7 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors shrink-0"
            >
              <X size={16} className="text-white" />
            </button>
          </div>

          {!selected ? (
            <div className="flex-1 overflow-y-auto">
              {responsables.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center p-6">
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
                    Aucun responsable disponible
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    Vous n&apos;avez pas d&apos;abonnement actif
                  </p>
                </div>
              ) : (
                <div className="p-3 space-y-1">
                  <p className="text-xs text-gray-400 font-medium px-2 py-1 uppercase tracking-wide">
                    Vos responsables
                  </p>
                  {responsables.map((resp) => {
                    const lineUnread = unreadByResponsable[resp.id] ?? 0;

                    return (
                      <button
                        key={resp.id}
                        onClick={() => void handleSelectResponsable(resp)}
                        className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors text-left"
                      >
                        <div
                          className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0"
                          style={{ background: "var(--color-primary)" }}
                        >
                          {resp.username.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <p className="font-semibold text-gray-900 text-sm truncate">
                              {resp.username}
                            </p>
                            {lineUnread > 0 && (
                              <span className="min-w-5 h-5 px-1 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center shrink-0">
                                {lineUnread > 9 ? "9+" : lineUnread}
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-gray-400 truncate">
                            {resp.email}
                          </p>
                          {resp.abonnementsLies.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-1">
                              {resp.abonnementsLies.map((nom) => (
                                <span
                                  key={nom}
                                  className="px-1.5 py-0.5 rounded text-[10px] font-medium"
                                  style={{
                                    background: "var(--color-primary-soft)",
                                    color: "var(--color-primary)",
                                  }}
                                >
                                  {nom}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          ) : loading ? (
            <div className="flex-1 flex items-center justify-center">
              <Loader2
                size={24}
                className="animate-spin"
                style={{ color: "var(--color-primary)" }}
              />
            </div>
          ) : (
            <>
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
                      Démarrez la conversation
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      Envoyez un message à {selected.username}
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
                      {!isClient && (
                        <div
                          className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0 mb-1"
                          style={{ background: "var(--color-primary)" }}
                        >
                          {selected.username.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div
                        className={`max-w-[75%] px-3 py-2.5 text-sm ${
                          isClient
                            ? "text-white rounded-2xl rounded-br-sm"
                            : "bg-white text-gray-800 shadow-sm rounded-2xl rounded-bl-sm border border-gray-100"
                        }`}
                        style={
                          isClient
                            ? { background: "var(--color-primary)" }
                            : undefined
                        }
                      >
                        <p className="leading-relaxed">{msg.content}</p>
                        <p
                          className={`text-[10px] mt-1.5 ${
                            isClient
                              ? "text-white/70 text-right"
                              : "text-gray-400"
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
                    placeholder={`Message à ${selected.username}...`}
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
            </>
          )}
        </div>
      )}

      <button
        onClick={handleToggle}
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