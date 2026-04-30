import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import type { Conversation } from "../../../types";
import { useStaffChat } from "../../../hooks/useChat";
import { useNotifications } from "../../../hooks/useNotifications";

import ConversationsSidebar from "./components/ConversationsSidebar";
import ChatPanel from "./components/ChatPanel";
import type { ConversationFilter, ConversationFilterTab } from "./types";

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

  const [searchParams, setSearchParams] = useSearchParams();
  const clientId = searchParams.get("clientId");

  useEffect(() => {
    if (!clientId) return;

    const run = async () => {
      try {
        await openConversationByClientId(clientId);
        resetUnreadMessages();
      } catch {
        // Conversation introuvable ou client inaccessible.
      }
    };

    void run();
  }, [clientId, openConversationByClientId, resetUnreadMessages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    await sendMessage(input);
    setInput("");
  };

  const handleOpenConversation = async (conversation: Conversation) => {
    await openConversation(conversation);
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

  const unreadConversationsCount = useMemo(
    () =>
      conversations.filter(
        (conversation) => (conversation.unreadCount ?? 0) > 0,
      ).length,
    [conversations],
  );

  const readConversationsCount =
    conversations.length - unreadConversationsCount;

  const filteredConversations = useMemo(() => {
    if (conversationFilter === "unread") {
      return conversations.filter(
        (conversation) => (conversation.unreadCount ?? 0) > 0,
      );
    }

    if (conversationFilter === "read") {
      return conversations.filter(
        (conversation) => (conversation.unreadCount ?? 0) === 0,
      );
    }

    return conversations;
  }, [conversations, conversationFilter]);

  const filterTabs: ConversationFilterTab[] = [
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
        <ConversationsSidebar
          conversations={filteredConversations}
          selected={selected}
          loading={loading}
          conversationFilter={conversationFilter}
          filterTabs={filterTabs}
          onFilterChange={setConversationFilter}
          onOpenConversation={(conversation) =>
            void handleOpenConversation(conversation)
          }
        />

        <ChatPanel
          selected={selected}
          messages={messages}
          input={input}
          sending={sending}
          onInputChange={setInput}
          onSend={() => void handleSend()}
          onCloseConversation={() => void handleClose()}
        />
      </div>
    </div>
  );
}