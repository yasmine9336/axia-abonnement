/* eslint-disable react-refresh/only-export-components */
import { createContext, useEffect, useState } from "react";
import axiosInstance from "../api/axiosInstance";
import { useAuth } from "../hooks/useAuth";
import { SignalRService } from "../services/SignalRService";
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
  badgeCount: number;
  dismissBadge: () => void;
  signalRService: SignalRService | null;
}

export const NotificationContext = createContext<NotificationContextType>({
  notifications: [],
  unreadCount: 0,
  markAsRead: async () => {},
  markAllAsRead: async () => {},
  unreadMessages: 0,
  unreadChat: 0,
  resetUnreadMessages: () => {},
  resetUnreadChat: () => {},
  badgeCount: 0,
  dismissBadge: () => {},
  signalRService: null,
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
  const [badgeCount, setBadgeCount] = useState(0);
  const [signalRService, setSignalRService] = useState<SignalRService | null>(
    null,
  );

  // Charger les notifications
  useEffect(() => {
    if (!user) return;
    axiosInstance
      .get("/notifications")
      .then((r) => {
        const data = (r.data ?? []) as NotificationItem[];
        setNotifications(data);
        setBadgeCount(data.filter((n) => !n.isRead).length);
      })
      .catch(() => {
        setNotifications([]);
        setBadgeCount(0);
      });
  }, [user]);

  // Initialiser le compteur "Messages" pour le responsable
  useEffect(() => {
    if (!user || user.role !== "Responsable") return;
    axiosInstance
      .get("/chat/conversations")
      .then((r) => {
        const total = (r.data as Array<{ unreadCount: number }>).reduce(
          (sum, c) => sum + (c.unreadCount ?? 0),
          0,
        );
        setUnreadMessages(total);
      })
      .catch(() => setUnreadMessages(0));
  }, [user]);

  // Démarrer SignalR après login (comme le tutoriel : startSignalRConnection après login)
  useEffect(() => {
    if (!user) return;

    const service = new SignalRService();

    service.createConnection({
      onNotification: (notif) => {
        setNotifications((prev) => [notif, ...prev]);
        setBadgeCount((c) => c + 1);
      },
      onNewMessage: () => {
        if (user.role === "Responsable") setUnreadMessages((n) => n + 1);
      },
      onStaffReplied: () => {
        if (user.role === "Client") setUnreadChat((n) => n + 1);
      },
    });

    service.startConnection().then(() => {
      setSignalRService(service);
    });

    // Arrêter la connexion au logout
    return () => {
      service.stopConnection();
      setSignalRService(null);
    };
  }, [user]);

  const markAsRead = async (id: string) => {
    await axiosInstance.patch(`/notifications/${id}/read`);
    setNotifications((prev) => {
      const target = prev.find((n) => n.id === id);
      if (target && !target.isRead) setBadgeCount((c) => Math.max(0, c - 1));
      return prev.map((n) => (n.id === id ? { ...n, isRead: true } : n));
    });
  };

  const markAllAsRead = async () => {
    await axiosInstance.patch("/notifications/read-all");
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    setBadgeCount(0);
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
        badgeCount,
        dismissBadge: () => setBadgeCount(0),
        signalRService,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}
