import { useState, useEffect, useCallback } from "react";
import axiosInstance from "../api/axiosInstance";
import { useSignalR } from "./useSignalR";

export interface ChatMessage {
  id: string;
  content: string;
  senderType: string;
  senderUserId: string | null;
  createdAt: string;
  isRead: boolean;
}

export interface Conversation {
  id: string;
  clientId: string;
  clientName: string;
  clientEmail: string;
  statut: string;
  updatedAt: string;
  unreadCount: number;
  lastMessage: {
    content: string;
    senderType: string;
    createdAt: string;
  } | null;
}

// ─── Hook Client ─────────────────────────────────────────────
export function useClientChat() {
  const [conversationId, setConversationId] = useState<string | undefined>();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [unread, setUnread] = useState(0);
  const [sending, setSending] = useState(false);
  const [isOpen, setIsOpenState] = useState(false);

  useEffect(() => {
    axiosInstance.get("/chat/me").then((res) => {
      setConversationId(res.data.id);
    });
  }, []);

  useSignalR(
    {
      ReceiveMessage: (msg: unknown) => {
        const message = msg as ChatMessage;
        setMessages((prev) => [...prev, message]);
        setUnread((n) => (isOpen ? 0 : n + 1));
      },
      StaffReplied: () => {
        setUnread((n) => (isOpen ? 0 : n + 1));
      },
    },
    {
      enabled: !!conversationId,
      // ✅ Rejoindre la room dès que la connexion SignalR est établie
      onConnected: (connection) => {
        if (conversationId) {
          connection.invoke("JoinConversation", conversationId).catch(() => {});
        }
      },
    }
  );

  const loadMessages = useCallback(async () => {
    if (!conversationId) return;
    const res = await axiosInstance.get("/chat/me/messages");
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
    [sending]
  );

  const setOpen = useCallback((open: boolean) => {
    setIsOpenState(open);
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

// ─── Hook Staff ───────────────────────────────────────────────
export function useStaffChat() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selected, setSelected] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchConversations = useCallback(async () => {
    try {
      const res = await axiosInstance.get("/chat/conversations");
      setConversations(res.data);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  useSignalR({
    ReceiveMessage: (msg: unknown) => {
      setMessages((prev) => [...prev, msg as ChatMessage]);
    },
    NewConversationMessage: (data: unknown) => {
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
                unreadCount: c.unreadCount + 1,
                lastMessage: {
                  content: d.content,
                  senderType: "Client",
                  createdAt: d.createdAt,
                },
                updatedAt: d.createdAt,
              }
            : c
        )
      );
    },
  });

  const openConversation = useCallback(async (conv: Conversation) => {
    setSelected(conv);
    const res = await axiosInstance.get(
      `/chat/conversations/${conv.id}/messages`
    );
    setMessages(res.data);
    setConversations((prev) =>
      prev.map((c) => (c.id === conv.id ? { ...c, unreadCount: 0 } : c))
    );
  }, []);

  const sendMessage = useCallback(
    async (content: string) => {
      if (!content.trim() || !selected || sending) return;
      setSending(true);
      try {
        await axiosInstance.post(
          `/chat/conversations/${selected.id}/messages`,
          { content: content.trim() }
        );
      } finally {
        setSending(false);
      }
    },
    [selected, sending]
  );

  const closeConversation = useCallback(
    async (conv: Conversation) => {
      await axiosInstance.post(`/chat/conversations/${conv.id}/close`);
      setConversations((prev) =>
        prev.map((c) => (c.id === conv.id ? { ...c, statut: "Closed" } : c))
      );
      if (selected?.id === conv.id) setSelected(null);
    },
    [selected]
  );

  const totalUnread = conversations.reduce((s, c) => s + c.unreadCount, 0);

  return {
    conversations,
    selected,
    messages,
    sending,
    loading,
    totalUnread,
    openConversation,
    sendMessage,
    closeConversation,
  };
}