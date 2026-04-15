/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useState } from "react";
import axiosInstance from "../api/axiosInstance";
import { useAuth } from "./AuthContext";
import { useSignalR } from "../hooks/useSignalR";
import type { NotificationItem } from "../types";

interface NotificationContextType {
  notifications: NotificationItem[];
  unreadCount: number;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  unreadMessages: number;
  unreadChat: number;
  resetUnreadMessages: () => void;
  resetUnreadChat: () => void;
}

const NotificationContext = createContext<NotificationContextType>({
  notifications: [],
  unreadCount: 0,
  markAsRead: async () => {},
  markAllAsRead: async () => {},
  unreadMessages: 0,
  unreadChat: 0,
  resetUnreadMessages: () => {},
  resetUnreadChat: () => {},
});

export function NotificationProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [unreadChat, setUnreadChat] = useState(0);

  useEffect(() => {
    if (!user) return;
    axiosInstance.get("/notifications").then((r) => {
      setNotifications(r.data);
    });
  }, [user]);

  // ✅ Une seule connexion SignalR pour tout
  useSignalR(
    {
      ReceiveNotification: (notif: unknown) => {
        setNotifications((prev) => [notif as NotificationItem, ...prev]);
      },
      // ✅ Seulement pour le responsable
      NewConversationMessage: () => {
        if (user?.role === "Responsable") {
          setUnreadMessages((n) => n + 1);
        }
      },
      // ✅ Seulement pour le client
      StaffReplied: () => {
        if (user?.role === "Client") {
          setUnreadChat((n) => n + 1);
        }
      },
    },
    { enabled: !!user },
  );

  const markAsRead = async (id: string) => {
    await axiosInstance.patch(`/notifications/${id}/read`);
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)),
    );
  };

  const markAllAsRead = async () => {
    await axiosInstance.patch("/notifications/read-all");
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount: notifications.filter((n) => !n.isRead).length,
        markAsRead,
        markAllAsRead,
        unreadMessages,
        unreadChat,
        resetUnreadMessages: () => setUnreadMessages(0),
        resetUnreadChat: () => setUnreadChat(0),
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export const useNotifications = () => useContext(NotificationContext);
