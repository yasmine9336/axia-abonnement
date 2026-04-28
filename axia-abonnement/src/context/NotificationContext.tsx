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
  deleteNotification: (id: string) => Promise<void>;
  deleteAll: () => Promise<void>;
  unreadMessages: number;
  unreadChat: number;
  resetUnreadMessages: () => void;
  resetUnreadChat: () => void;
  badgeCount: number;
  dismissBadge: () => void;
  signalRService: SignalRService | null;
  consumeUnreadChat: (count?: number) => void;
}

export const NotificationContext = createContext<NotificationContextType>({
  notifications: [],
  unreadCount: 0,
  markAsRead: async () => {},
  markAllAsRead: async () => {},
  deleteNotification: async () => {},
  deleteAll: async () => {},
  unreadMessages: 0,
  unreadChat: 0,
  resetUnreadMessages: () => {},
  resetUnreadChat: () => {},
  badgeCount: 0,
  dismissBadge: () => {},
  signalRService: null,
  consumeUnreadChat: () => {},
});

// ---- Helpers persistants (hors composant) ----
const getSeenKey = (userId?: string) =>
  userId ? `notif:lastSeenAt:${userId}` : null;

const getLastSeenAt = (userId?: string) => {
  const key = getSeenKey(userId);
  if (!key) return 0;
  const raw = localStorage.getItem(key);
  return raw ? Number(raw) : 0;
};

const setLastSeenAtNow = (userId?: string) => {
  const key = getSeenKey(userId);
  if (!key) return;
  localStorage.setItem(key, String(Date.now()));
};

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

  // ----- Helpers de recalcul -----
  const recomputeBadgeCount = (list: NotificationItem[], userId?: string) => {
    const lastSeenAt = getLastSeenAt(userId);
    return list.filter(
      (n) => !n.isRead && new Date(n.createdAt).getTime() > lastSeenAt,
    ).length;
  };

  const refreshClientUnreadChat = async () => {
    if (!user || user.role !== "Client") return;

    try {
      const { data: responsables } = await axiosInstance.get<
        Array<{ id: string }>
      >("/chat/my-responsables");

      let totalUnread = 0;

      for (const r of responsables ?? []) {
        const convRes = await axiosInstance.get<{ id: string }>(
          `/chat/with-responsable/${r.id}`,
        );
        const convId = convRes.data.id;

        const msgsRes = await axiosInstance.get<
          Array<{ senderType: string; isRead: boolean }>
        >(`/chat/conversations/${convId}/client-messages`);

        totalUnread += (msgsRes.data ?? []).filter(
          (m) => m.senderType === "Responsable" && !m.isRead,
        ).length;
      }

      setUnreadChat(totalUnread);
    } catch {
      setUnreadChat(0);
    }
  };

  // ----- Chargement initial notifications -----
  useEffect(() => {
    if (!user) return;

    axiosInstance
      .get("/notifications")
      .then((r) => {
        const data = (r.data ?? []) as NotificationItem[];
        setNotifications(data);
        setBadgeCount(recomputeBadgeCount(data, user.id));
      })
      .catch(() => {
        setNotifications([]);
        setBadgeCount(0);
      });
  }, [user]);

  // ----- Compteur non lus responsable (messages) -----
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

  // ----- Fallback unread chat client (reconnexion / refresh) -----
  useEffect(() => {
    if (!user || user.role !== "Client") return;

    void refreshClientUnreadChat();

    const id = window.setInterval(() => {
      void refreshClientUnreadChat();
    }, 15000);

    return () => window.clearInterval(id);
  }, [user]);

  // ----- SignalR -----
  useEffect(() => {
    if (!user) return;

    const service = new SignalRService();

    service.createConnection({
      onNotification: (notif) => {
        setNotifications((prev) => {
          const next = [notif, ...prev];
          setBadgeCount(recomputeBadgeCount(next, user.id));
          return next;
        });
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

    return () => {
      service.stopConnection();
      setSignalRService(null);
    };
  }, [user]);

  const markAsRead = async (id: string) => {
    await axiosInstance.patch(`/notifications/${id}/read`);
    setNotifications((prev) => {
      const next = prev.map((n) => (n.id === id ? { ...n, isRead: true } : n));
      setBadgeCount(recomputeBadgeCount(next, user?.id));
      return next;
    });
  };

  const markAllAsRead = async () => {
    await axiosInstance.patch("/notifications/read-all");
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    if (user) setLastSeenAtNow(user.id);
    setBadgeCount(0);
  };

  const deleteNotification = async (id: string) => {
    await axiosInstance.delete(`/notifications/${id}`);
    setNotifications((prev) => {
      const next = prev.filter((n) => n.id !== id);
      setBadgeCount(recomputeBadgeCount(next, user?.id));
      return next;
    });
  };

  const deleteAll = async () => {
    await axiosInstance.delete("/notifications");
    setNotifications([]);
    if (user) setLastSeenAtNow(user.id);
    setBadgeCount(0);
  };

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount: notifications.filter((n) => !n.isRead).length,
        markAsRead,
        markAllAsRead,
        deleteNotification,
        deleteAll,
        unreadMessages,
        unreadChat,
        resetUnreadMessages: () => setUnreadMessages(0),
        resetUnreadChat: () => setUnreadChat(0),
        badgeCount,
        dismissBadge: () => {
          if (user) setLastSeenAtNow(user.id);
          setBadgeCount(0);
        },
        signalRService,
        consumeUnreadChat: (count = 1) =>
          setUnreadChat((n) => Math.max(0, n - Math.max(0, count))),
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}
