import { createContext, useContext, useEffect, useRef, useState } from "react";
import * as signalR from "@microsoft/signalr";
import axiosInstance from "../api/axiosInstance";
import { useAuth } from "./AuthContext";

interface Notification {
  id: string;
  message: string;
  type: string;
  createdAt: string;
  isRead: boolean;
}

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
}

const NotificationContext = createContext<NotificationContextType>({
  notifications: [],
  unreadCount: 0,
  markAsRead: () => {},
  markAllAsRead: () => {},
});

export function NotificationProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const connectionRef = useRef<signalR.HubConnection | null>(null);

  // Charger les notifs non lues au démarrage
  useEffect(() => {
    if (!user) return;

    axiosInstance.get("/notifications").then((r) => {
      setNotifications(r.data);
    });
  }, [user]);

  // Connexion SignalR
  useEffect(() => {
    if (!user) return;

    const token =
      localStorage.getItem("accessToken") ||
      sessionStorage.getItem("accessToken");

    if (!token) return; // ← AJOUTER cette vérification

    const connection = new signalR.HubConnectionBuilder()
      .withUrl("https://localhost:7000/hubs/notifications", {
        accessTokenFactory: () => token,
      })
      .withAutomaticReconnect()
      .configureLogging(signalR.LogLevel.None) // ← supprimer les logs console
      .build();

    connection.on("ReceiveNotification", (notif: Notification) => {
      setNotifications((prev) => [notif, ...prev]);
    });

    connection.start().catch(() => {}); // ← ignorer l'erreur silencieusement

    connectionRef.current = connection;

    return () => {
      connection.stop();
    };
  }, [user]);

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
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}
/* eslint-disable react-refresh/only-export-components */

export const useNotifications = () => useContext(NotificationContext);
