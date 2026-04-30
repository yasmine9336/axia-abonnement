import { useState } from "react";
import { useClientChatWithSelection } from "../../../hooks/useChat";
import { useNotifications } from "../../../hooks/useNotifications";

import ClientChatButton from "./components/ClientChatButton";
import ClientChatHeader from "./components/ClientChatHeader";
import ResponsableSelector from "./components/ResponsableSelector";
import ClientMessagesPanel from "./components/ClientMessagesPanel";

import type { ResponsableChatItem } from "./types";

export default function ClientChat() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");

  const {
    responsables,
    selected,
    messages,
    sending,
    loading,
    openConversation,
    backToList,
    sendMessage,
  } = useClientChatWithSelection();

  const { unreadChat } = useNotifications();

  const handleSend = async () => {
    if (!input.trim()) return;

    await sendMessage(input);
    setInput("");
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
      {open && (
        <div
          className="w-82 bg-white rounded-2xl border border-gray-200 shadow-2xl flex flex-col overflow-hidden"
          style={{ height: "480px" }}
        >
          <ClientChatHeader
            selected={selected}
            onBack={() => void backToList()}
            onClose={() => setOpen(false)}
          />

          {!selected ? (
            <ResponsableSelector
              responsables={responsables}
              loading={loading}
              onOpenConversation={(responsable: ResponsableChatItem) =>
                void openConversation(responsable)
              }
            />
          ) : (
            <ClientMessagesPanel
              selected={selected}
              messages={messages}
              input={input}
              sending={sending}
              onInputChange={setInput}
              onSend={() => void handleSend()}
            />
          )}
        </div>
      )}

      {!open && (
        <ClientChatButton
          unreadChat={unreadChat}
          onOpen={() => setOpen(true)}
        />
      )}
    </div>
  );
}