import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import NotificationBell from "../common/NotificationBell";
import ClientChat from "../chat/ClientChat";
import { useAuth } from "../../hooks/useAuth";
import { ThemeProvider } from "../../context/ThemeContext";

export default function DashboardLayout() {
  const { user } = useAuth();

  return (
    <ThemeProvider>
      <div
        className="min-h-screen flex"
        style={{
          backgroundColor:
            user?.role === "Admin" ? "#f5f3ff" :
            user?.role === "Client" ? "#f0f9ff" : "#f9fafb",
        }}
      >
        <Sidebar />
        <main className="flex-1 overflow-auto">
          <div
            className={`h-1 ${
              user?.role === "Admin" ? "bg-bleu-500"
              : user?.role === "Responsable" ? "bg-[#0F6CBD]"
              : "bg-sky-400"
            }`}
          />
          <div className="flex justify-end items-center px-6 py-3 border-b border-gray-200 bg-white">
            <NotificationBell />
          </div>
          <Outlet />
        </main>
        {user?.role === "Client" && <ClientChat />}
      </div>
    </ThemeProvider>
  );
}
