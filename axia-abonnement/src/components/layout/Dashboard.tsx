import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import NotificationBell from "./NotificationBell";
import ClientChat from "../../features/client/chat/ClientChat";
import { useAuth } from "../../hooks/useAuth";
import { ChurnProvider } from "../../contexts/ChurnContext";

export default function DashboardLayout() {
  const { user } = useAuth();
  const needsChurn = user?.role === "Admin" || user?.role === "Responsable";

  return (
    <div className="min-h-screen flex bg-(--surface-muted)">
      <Sidebar />

      <main className="flex-1 overflow-auto min-w-0">
        <div className="h-1 bg-(--color-primary)" />

        <div className="flex justify-between items-center px-6 py-3 border-b border-gray-200 bg-white">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-gray-700">
              {user?.role === "Admin"
                ? "Portail Admin"
                : user?.role === "Responsable"
                  ? "Portail Responsable"
                  : "Portail Client"}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <NotificationBell />

            <div className="flex items-center gap-2 pl-3 border-l border-gray-200">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-semibold text-gray-800 leading-none">
                  {user?.username}
                </p>
                <p className="text-xs text-gray-400 mt-0.5">{user?.email}</p>
              </div>

              <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0 bg-(--color-primary)">
                {user?.username?.charAt(0).toUpperCase() || "U"}
              </div>
            </div>
          </div>
        </div>

        {needsChurn ? (
          <ChurnProvider>
            <Outlet />
          </ChurnProvider>
        ) : (
          <Outlet />
        )}
      </main>

      {user?.role === "Client" && <ClientChat />}
    </div>
  );
}