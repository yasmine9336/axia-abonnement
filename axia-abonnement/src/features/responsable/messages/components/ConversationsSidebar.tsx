import { MessageSquare } from "lucide-react";
import UiCard from "../../../../components/common/UiCard";
import LoadingState from "../../../../components/common/LoadingState";
import type { Conversation } from "../../../../types";
import type { ConversationFilter, ConversationFilterTab } from "../types";
import { formatConversationTime } from "../utils";

interface ConversationsSidebarProps {
  conversations: Conversation[];
  selected: Conversation | null;
  loading: boolean;
  conversationFilter: ConversationFilter;
  filterTabs: ConversationFilterTab[];
  onFilterChange: (value: ConversationFilter) => void;
  onOpenConversation: (conversation: Conversation) => void;
}

export default function ConversationsSidebar({
  conversations,
  selected,
  loading,
  conversationFilter,
  filterTabs,
  onFilterChange,
  onOpenConversation,
}: ConversationsSidebarProps) {
  const emptyMessage =
    conversationFilter === "unread"
      ? "Aucune conversation non lue"
      : conversationFilter === "read"
        ? "Aucune conversation lue"
        : "Aucune conversation";

  return (
    <UiCard className="w-80 p-0 flex flex-col overflow-hidden">
      <div className="p-3 border-b border-gray-100 bg-white">
        <div className="flex items-center gap-1 bg-gray-100 rounded-xl p-1">
          {filterTabs.map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => onFilterChange(tab.key)}
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
          <LoadingState heightClassName="h-32" />
        ) : conversations.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <MessageSquare className="mx-auto mb-2" size={28} />
            <p className="text-sm">{emptyMessage}</p>
          </div>
        ) : (
          conversations.map((conversation) => (
            <button
              key={conversation.id}
              type="button"
              onClick={() => onOpenConversation(conversation)}
              className={`w-full text-left p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors ${
                selected?.id === conversation.id ? "border-l-2" : ""
              }`}
              style={
                selected?.id === conversation.id
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
                  {conversation.clientName.charAt(0).toUpperCase()}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-gray-900 truncate">
                      {conversation.clientName}
                    </p>

                    {conversation.statut === "Closed" && (
                      <span className="text-xs bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded-full shrink-0">
                        Fermé
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-gray-400 truncate mt-0.5">
                    {conversation.lastMessage?.content ?? "Aucun message"}
                  </p>
                </div>

                <div className="flex flex-col items-end gap-1 shrink-0">
                  <span className="text-xs text-gray-400">
                    {formatConversationTime(conversation.updatedAt)}
                  </span>

                  {(conversation.unreadCount ?? 0) > 0 && (
                    <span
                      className="w-5 h-5 text-white text-xs font-bold rounded-full flex items-center justify-center"
                      style={{ background: "var(--color-primary)" }}
                    >
                      {conversation.unreadCount}
                    </span>
                  )}
                </div>
              </div>
            </button>
          ))
        )}
      </div>
    </UiCard>
  );
}