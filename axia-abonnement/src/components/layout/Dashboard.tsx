import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import NotificationBell from "../common/NotificationBell";
import ClientChat from "../chat/ClientChat";
import { useAuth } from "../../hooks/useAuth";

export default function DashboardLayout() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen flex bg-(--surface-muted)">
      <Sidebar />

      <main className="flex-1 overflow-auto">
        <div className="h-1 bg-(--color-primary)" />

        <div className="flex justify-end items-center px-6 py-3 border-b border-gray-200 bg-white">
          <NotificationBell />
        </div>

        <Outlet />
      </main>

      {user?.role === "Client" && <ClientChat />}
    </div>
  );
}