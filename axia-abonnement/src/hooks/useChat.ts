import { useState, useEffect, useCallback } from "react";
import axiosInstance from "../api/axiosInstance";
import type { ChatMessage, Conversation } from "../types";

// ─── Hook Client ─────────────────────────────────────────────
export function useClientChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [sending, setSending] = useState(false);

  const loadMessages = useCallback(async () => {
    const res = await axiosInstance.get("/chat/me/messages");
    setMessages(res.data);
  }, []);

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

  return {
    messages,
    sending,
    loadMessages,
    sendMessage,
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

  const openConversation = useCallback(
    async (conv: Conversation) => {
      setSelected(conv);

      const res = await axiosInstance.get(
        `/chat/conversations/${conv.id}/messages`
      );
      setMessages(res.data);

      // UI immédiate
      setConversations((prev) =>
        prev.map((c) => (c.id === conv.id ? { ...c, unreadCount: 0 } : c))
      );

      // Sync serveur
      await fetchConversations();
    },
    [fetchConversations]
  );

  const sendMessage = useCallback(
    async (content: string) => {
      if (!content.trim() || !selected || sending) return;
      setSending(true);
      try {
        await axiosInstance.post(
          `/chat/conversations/${selected.id}/messages`,
          { content: content.trim() }
        );
        await fetchConversations();
      } finally {
        setSending(false);
      }
    },
    [selected, sending, fetchConversations]
  );

  const closeConversation = useCallback(
    async (conv: Conversation) => {
      await axiosInstance.post(`/chat/conversations/${conv.id}/close`);
      setConversations((prev) =>
        prev.map((c) => (c.id === conv.id ? { ...c, statut: "Closed" } : c))
      );
      if (selected?.id === conv.id) setSelected(null);
      await fetchConversations();
    },
    [selected, fetchConversations]
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