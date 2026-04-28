import { useState, useEffect, useCallback, useRef } from "react";
import axiosInstance from "../api/axiosInstance";
import { useNotifications } from "./useNotifications";
import type { ChatMessage, Conversation } from "../types";

export interface ResponsableWithUnread {
  id: string;
  username: string;
  email?: string;
  nomEntreprise?: string;
  abonnementsLies?: string[];
  unreadCount: number;
  conversationId?: string;
}

interface SentMessageResponse {
  id: string;
  content: string;
  createdAt: string;
}

const appendUniqueMessage = (
  messages: ChatMessage[],
  message: ChatMessage,
): ChatMessage[] => {
  if (!message.id) return messages;

  const exists = messages.some((m) => m.id === message.id);
  if (exists) return messages;

  return [...messages, message];
};

export function useClientChatWithSelection() {
  const { signalRService, consumeUnreadChat, addUnreadChat } =
    useNotifications();

  const [responsables, setResponsables] = useState<ResponsableWithUnread[]>([]);
  const [selected, setSelected] = useState<ResponsableWithUnread | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);

  const selectedRef = useRef<ResponsableWithUnread | null>(null);

  useEffect(() => {
    selectedRef.current = selected;
  }, [selected]);

  // Chargement initial : responsables + nombre de messages non lus par conversation
  useEffect(() => {
    axiosInstance
      .get<ResponsableWithUnread[]>("/chat/my-responsables")
      .then(async (r) => {
        const list = r.data ?? [];

        const withUnread = await Promise.all(
          list.map(async (resp) => {
            try {
              const convRes = await axiosInstance.get<{ id: string }>(
                `/chat/with-responsable/${resp.id}`,
              );

              const convId = convRes.data.id;

              const unreadRes = await axiosInstance.get<{
                unreadCount: number;
              }>(`/chat/conversations/${convId}/client-unread-count`);

              return {
                ...resp,
                unreadCount: unreadRes.data.unreadCount ?? 0,
                conversationId: convId,
              };
            } catch {
              return {
                ...resp,
                unreadCount: 0,
              };
            }
          }),
        );

        setResponsables(withUnread);
      })
      .catch(() => setResponsables([]))
      .finally(() => setLoading(false));
  }, []);

  // SignalR côté client
  useEffect(() => {
    if (!signalRService) return;

    const handleReceiveMessage = (msg: unknown) => {
      const message = msg as ChatMessage;

      setMessages((prev) => appendUniqueMessage(prev, message));
    };

    const handleStaffReplied = (data: unknown) => {
      const d = data as {
        conversationId: string;
        content?: string;
        createdAt?: string;
      };

      const openedConversationId = selectedRef.current?.conversationId;

      // Si la conversation du responsable est déjà ouverte,
      // le message est visible directement, donc on ne compte pas comme non lu.
      if (openedConversationId === d.conversationId) {
        return;
      }

      // Incrémenter le compteur de la conversation concernée
      setResponsables((prev) =>
        prev.map((r) =>
          r.conversationId === d.conversationId
            ? {
                ...r,
                unreadCount: r.unreadCount + 1,
              }
            : r,
        ),
      );

      // Incrémenter la bulle principale du chat
      addUnreadChat(1);
    };

    signalRService.on("ReceiveMessage", handleReceiveMessage);
    signalRService.on("StaffReplied", handleStaffReplied);

    return () => {
      signalRService.off("ReceiveMessage", handleReceiveMessage);
      signalRService.off("StaffReplied", handleStaffReplied);
    };
  }, [signalRService, addUnreadChat]);

  const openConversation = useCallback(
    async (resp: ResponsableWithUnread) => {
      if (selectedRef.current?.conversationId) {
        await signalRService?.leaveConversation(
          selectedRef.current.conversationId,
        );
      }

      let convId = resp.conversationId;

      if (!convId) {
        const convRes = await axiosInstance.get<{ id: string }>(
          `/chat/with-responsable/${resp.id}`,
        );

        convId = convRes.data.id;
      }

      await signalRService?.joinConversation(convId);

      const msgsRes = await axiosInstance.get<ChatMessage[]>(
        `/chat/conversations/${convId}/client-messages`,
      );

      setMessages(msgsRes.data ?? []);

      const unreadBefore = resp.unreadCount;

      const updated: ResponsableWithUnread = {
        ...resp,
        conversationId: convId,
        unreadCount: 0,
      };

      setSelected(updated);
      selectedRef.current = updated;

      setResponsables((prev) =>
        prev.map((r) =>
          r.id === resp.id
            ? {
                ...r,
                conversationId: convId,
                unreadCount: 0,
              }
            : r,
        ),
      );

      // Ici seulement on décrémente la bulle principale.
      // Donc ouvrir le bouton flottant ne décrémente rien.
      // Le compteur baisse uniquement quand on ouvre la conversation concernée.
      if (unreadBefore > 0) {
        consumeUnreadChat(unreadBefore);
      }
    },
    [signalRService, consumeUnreadChat],
  );

  const backToList = useCallback(async () => {
    if (selectedRef.current?.conversationId) {
      await signalRService?.leaveConversation(
        selectedRef.current.conversationId,
      );
    }

    setSelected(null);
    selectedRef.current = null;
    setMessages([]);
  }, [signalRService]);

  const sendMessage = useCallback(
    async (content: string) => {
      if (!content.trim() || !selected?.conversationId || sending) return;

      setSending(true);

      try {
        const res = await axiosInstance.post<SentMessageResponse>(
          `/chat/conversations/${selected.conversationId}/client-messages`,
          { content: content.trim() },
        );

        const message: ChatMessage = {
          id: res.data.id,
          content: res.data.content,
          createdAt: res.data.createdAt,
          senderType: "Client",
          senderUserId: null,
          isRead: false,
        };

        setMessages((prev) => appendUniqueMessage(prev, message));
      } finally {
        setSending(false);
      }
    },
    [selected, sending],
  );

  const totalUnread = responsables.reduce((s, r) => s + r.unreadCount, 0);

  return {
    responsables,
    selected,
    messages,
    sending,
    loading,
    totalUnread,
    openConversation,
    backToList,
    sendMessage,
  };
}

export function useStaffChat() {
  const { signalRService } = useNotifications();

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selected, setSelected] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);

  const selectedRef = useRef<Conversation | null>(null);

  const fetchConversations = useCallback(async () => {
    try {
      const res: { data: Conversation[] } = await axiosInstance.get(
        "/chat/conversations",
      );

      setConversations(res.data ?? []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  // SignalR côté responsable
  useEffect(() => {
    if (!signalRService) return;

    const handleMessage = (msg: unknown) => {
      const message = msg as ChatMessage;

      setMessages((prev) => appendUniqueMessage(prev, message));
    };

    const handleNewMessage = (data: unknown) => {
      const d = data as {
        conversationId: string;
        content: string;
        createdAt: string;
      };

      const isCurrentConversation =
        selectedRef.current?.id === d.conversationId;

      setConversations((prev) =>
        prev.map((c) =>
          c.id === d.conversationId
            ? {
                ...c,
                unreadCount: isCurrentConversation
                  ? 0
                  : (c.unreadCount ?? 0) + 1,
                lastMessage: {
                  content: d.content,
                  senderType: "Client",
                  createdAt: d.createdAt,
                },
                updatedAt: d.createdAt,
              }
            : c,
        ),
      );
    };

    signalRService.on("ReceiveMessage", handleMessage);
    signalRService.on("NewConversationMessage", handleNewMessage);

    return () => {
      signalRService.off("ReceiveMessage", handleMessage);
      signalRService.off("NewConversationMessage", handleNewMessage);
    };
  }, [signalRService]);

  const openConversation = useCallback(
    async (conv: Conversation) => {
      if (selectedRef.current) {
        await signalRService?.leaveConversation(selectedRef.current.id);
      }

      setSelected(conv);
      selectedRef.current = conv;

      await signalRService?.joinConversation(conv.id);

      const res: { data: ChatMessage[] } = await axiosInstance.get(
        `/chat/conversations/${conv.id}/messages`,
      );

      setMessages(res.data ?? []);

      setConversations((prev) =>
        prev.map((c) =>
          c.id === conv.id
            ? {
                ...c,
                unreadCount: 0,
              }
            : c,
        ),
      );
    },
    [signalRService],
  );

  const upsertConversation = useCallback((conv: Conversation) => {
    setConversations((prev) => {
      const exists = prev.some((c) => c.id === conv.id);

      if (exists) {
        return prev.map((c) => (c.id === conv.id ? { ...c, ...conv } : c));
      }

      return [conv, ...prev];
    });
  }, []);

  const openConversationByClientId = useCallback(
    async (clientId: string) => {
      const res: { data: Conversation } = await axiosInstance.get(
        `/chat/conversations/by-client/${clientId}`,
      );

      const conv = res.data;

      upsertConversation(conv);
      await openConversation(conv);
    },
    [openConversation, upsertConversation],
  );

  const sendMessage = useCallback(
    async (content: string) => {
      if (!content.trim() || !selected || sending) return;

      setSending(true);

      try {
        await axiosInstance.post(
          `/chat/conversations/${selected.id}/messages`,
          {
            content: content.trim(),
          },
        );
      } finally {
        setSending(false);
      }
    },
    [selected, sending],
  );

  const closeConversation = useCallback(
    async (conv: Conversation) => {
      await axiosInstance.post(`/chat/conversations/${conv.id}/close`);

      setConversations((prev) => prev.filter((c) => c.id !== conv.id));

      if (selected?.id === conv.id) {
        setSelected(null);
        selectedRef.current = null;
        setMessages([]);
      }
    },
    [selected],
  );

  const hideConversation = useCallback(async () => {
    if (selectedRef.current && signalRService) {
      await signalRService.leaveConversation(selectedRef.current.id);
    }

    setSelected(null);
    selectedRef.current = null;
    setMessages([]);
  }, [signalRService]);

  const totalUnread = conversations.reduce(
    (s, c) => s + (c.unreadCount ?? 0),
    0,
  );

  return {
    conversations,
    selected,
    messages,
    sending,
    loading,
    totalUnread,
    openConversation,
    openConversationByClientId,
    sendMessage,
    closeConversation,
    hideConversation,
    fetchConversations,
  };
}
