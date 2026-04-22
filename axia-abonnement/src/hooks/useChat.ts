import { useState, useEffect, useCallback, useRef } from "react";
import axiosInstance from "../api/axiosInstance";
import { useNotifications } from "./useNotifications";
import type { ChatMessage, Conversation } from "../types";

export function useClientChat() {
  const { signalRService } = useNotifications();
  const [conversationId, setConversationId] = useState<string | undefined>();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [unread, setUnread] = useState(0);
  const [sending, setSending] = useState(false);
  const isOpenRef = useRef(false);

  useEffect(() => {
    axiosInstance.get("/chat/me").then((res: { data: { id: string } }) => {
      setConversationId(res.data.id);
    });
  }, []);

  useEffect(() => {
    if (!conversationId || !signalRService) return;

    const handleMessage = (msg: unknown) => {
      setMessages((prev) => [...prev, msg as ChatMessage]);
      if (!isOpenRef.current) setUnread((n) => n + 1);
    };

    signalRService.on("ReceiveMessage", handleMessage);
    signalRService.joinConversation(conversationId);

    return () => {
      signalRService.off("ReceiveMessage", handleMessage);
      signalRService.leaveConversation(conversationId);
    };
  }, [conversationId, signalRService]);

  const loadMessages = useCallback(async () => {
    if (!conversationId) return;
    const res: { data: ChatMessage[] } =
      await axiosInstance.get("/chat/me/messages");
    setMessages(res.data);
    setUnread(0);
  }, [conversationId]);

  const sendMessage = useCallback(
    async (content: string) => {
      if (!content.trim() || sending) return;
      setSending(true);
      try {
        await axiosInstance.post("/chat/me/messages", {
          content: content.trim(),
        });
      } finally {
        setSending(false);
      }
    },
    [sending],
  );

  const setOpen = useCallback((open: boolean) => {
    isOpenRef.current = open;
    if (open) setUnread(0);
  }, []);

  return {
    conversationId,
    messages,
    unread,
    sending,
    loadMessages,
    sendMessage,
    setOpen,
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

  useEffect(() => {
    if (!signalRService) return;

    const handleMessage = (msg: unknown) => {
      setMessages((prev) => [...prev, msg as ChatMessage]);
    };

    const handleNewMessage = (data: unknown) => {
      const d = data as {
        conversationId: string;
        content: string;
        createdAt: string;
      };

      setConversations((prev) =>
        prev.map((c) =>
          c.id === d.conversationId
            ? {
                ...c,
                unreadCount: (c.unreadCount ?? 0) + 1,
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
      if (selectedRef.current)
        await signalRService?.leaveConversation(selectedRef.current.id);

      setSelected(conv);
      selectedRef.current = conv;

      await signalRService?.joinConversation(conv.id);

      const res: { data: ChatMessage[] } = await axiosInstance.get(
        `/chat/conversations/${conv.id}/messages`,
      );
      setMessages(res.data ?? []);

      setConversations((prev) =>
        prev.map((c) => (c.id === conv.id ? { ...c, unreadCount: 0 } : c)),
      );
    },
    [signalRService],
  );

  const upsertConversation = useCallback((conv: Conversation) => {
    setConversations((prev) => {
      const exists = prev.some((c) => c.id === conv.id);
      if (exists)
        return prev.map((c) => (c.id === conv.id ? { ...c, ...conv } : c));
      return [conv, ...prev];
    });
  }, []);

  // ✅ la fonction qui réalise ton besoin "ouvrir même si jamais parlé"
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

      // ✅ toujours enlever de la liste (car on ne l'appelle que pour les vides)
      setConversations((prev) => prev.filter((c) => c.id !== conv.id));

      if (selected?.id === conv.id) {
        setSelected(null);
        selectedRef.current = null;
        setMessages([]);
      }
    },
    [selected],
  );

  const totalUnread = conversations.reduce(
    (s, c) => s + (c.unreadCount ?? 0),
    0,
  );

  const hideConversation = useCallback(async () => {
    if (selectedRef.current && signalRService) {
      await signalRService.leaveConversation(selectedRef.current.id);
    }
    setSelected(null);
    selectedRef.current = null;
    setMessages([]);
  }, [signalRService]);

  return {
    conversations,
    selected,
    messages,
    sending,
    loading,
    totalUnread,
    openConversation,
    openConversationByClientId, // ✅ expose
    sendMessage,
    closeConversation,
    hideConversation,
    fetchConversations,
  };
}
