import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import NotificationBell from "../common/NotificationBell";
import ClientChat from "../chat/ClientChat";
import { useAuth } from "../../hooks/useAuth";

export default function DashboardLayout() {
  const { user } = useAuth();
  const roleHeaderClass =
    user?.role === "Admin"
      ? "bg-gradient-to-r from-indigo-50 via-violet-50 to-white border-indigo-100"
      : user?.role === "Responsable"
        ? "bg-gradient-to-r from-sky-50 via-cyan-50 to-white border-sky-100"
        : "bg-white border-gray-200";
  const roleMainClass =
    user?.role === "Admin"
      ? "bg-gradient-to-b from-indigo-50/30 to-transparent"
      : user?.role === "Responsable"
        ? "bg-gradient-to-b from-sky-50/30 to-transparent"
        : "";

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar />
      <main className={`flex-1 overflow-auto ${roleMainClass}`}>
        <div className={`flex justify-end items-center px-6 py-3 border-b ${roleHeaderClass}`}>
          <NotificationBell />
        </div>
        <Outlet />
      </main>
      {user?.role === "Client" && <ClientChat />}
    </div>
  );
}