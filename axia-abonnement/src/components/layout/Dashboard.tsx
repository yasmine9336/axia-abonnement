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

      <main className="flex-1 overflow-auto min-w-0">
        {/* Bandeau coloré fin en haut */}
        <div className="h-1" style={{ background: "var(--color-primary)" }} />

        {/* Topbar */}
        <div className="flex justify-between items-center px-6 py-3 border-b border-gray-200 bg-white">
          {/* Nom de la page / breadcrumb optionnel */}
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-gray-700">
              {user?.role === "Admin"
                ? "Portail Admin"
                : user?.role === "Responsable"
                  ? "Portail Responsable"
                  : "Portail Client"}
            </span>
          </div>

          {/* Actions droite */}
          <div className="flex items-center gap-3">
            <NotificationBell />

            {/* Infos utilisateur */}
            <div className="flex items-center gap-2 pl-3 border-l border-gray-200">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-semibold text-gray-800 leading-none">
                  {user?.username}
                </p>
                <p className="text-xs text-gray-400 mt-0.5">{user?.email}</p>
              </div>

              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0"
                style={{ background: "var(--color-primary)" }}
              >
                {user?.username?.charAt(0).toUpperCase() || "U"}
              </div>
            </div>
          </div>
        </div>

        <Outlet />
      </main>

      {user?.role === "Client" && <ClientChat />}
    </div>
  );
}