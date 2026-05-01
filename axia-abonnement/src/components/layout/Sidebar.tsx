import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { LogOut } from "lucide-react";

import axiosInstance from "../../api/axiosInstance";
import { API_URL } from "../../services/api/config";
import LogoAxia from "../../assets/logo-axia.svg";
import { getNavItemsByRole } from "../../constants/navigation";
import { useAuth } from "../../hooks/useAuth";
import { useNotifications } from "../../hooks/useNotifications";

export default function Sidebar() {
  const { user, logout } = useAuth();
  const { unreadMessages } = useNotifications();

  const navigate = useNavigate();
  const location = useLocation();

  const [profileImageUrl, setProfileImageUrl] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfilePhoto = async () => {
      try {
        const res = await axiosInstance.get("/profile");
        setProfileImageUrl(res.data?.profileImageUrl ?? null);
      } catch {
        setProfileImageUrl(null);
      }
    };

    void fetchProfilePhoto();
  }, []);

  const getPhotoUrl = (photoPath?: string | null) => {
    if (!photoPath) return null;
    if (photoPath.startsWith("http")) return photoPath;
    return `${API_URL}${photoPath}`;
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const getInitial = () => user?.username?.charAt(0).toUpperCase() || "U";

  const getProfilePath = () => {
    if (user?.role === "Admin") return "/dashboard/admin/profile";
    if (user?.role === "Responsable") return "/dashboard/responsable/profile";
    return "/dashboard/client/profile";
  };

  const roleLabel =
    user?.role === "Admin"
      ? "Administrateur"
      : user?.role === "Responsable"
        ? "Responsable"
        : "Client";

  const navItems = getNavItemsByRole(user?.role);
  const profilePhoto = getPhotoUrl(profileImageUrl);

  return (
    <aside className="w-56 min-h-screen bg-white border-r border-gray-200 flex flex-col py-4">
      {/* Logo */}
      <button
        type="button"
        onClick={() => navigate("/")}
        className="px-4 mb-6 flex justify-center"
        aria-label="Aller à l'accueil"
      >
        <img src={LogoAxia} alt="AxiaAbonnement" className="h-10" />
      </button>

      {/* Profil utilisateur */}
      <button
        type="button"
        className="mx-4 mb-6 p-3 rounded-2xl text-left cursor-pointer"
        style={{ background: "var(--color-primary-soft)" }}
        onClick={() => navigate(getProfilePath())}
        aria-label="Voir mon profil"
      >
        <div className="flex items-center gap-3">
          {profilePhoto ? (
            <img
              src={profilePhoto}
              alt="Profil"
              className="w-9 h-9 rounded-full object-cover border-2 shrink-0"
              style={{ borderColor: "var(--color-primary)" }}
            />
          ) : (
            <div
              className="w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0"
              style={{ background: "var(--color-primary)" }}
            >
              {getInitial()}
            </div>
          )}

          <div className="min-w-0">
            <p className="text-sm font-semibold text-gray-900 truncate">
              {user?.username}
            </p>

            <p
              className="text-xs truncate"
              style={{ color: "var(--color-primary)" }}
            >
              {roleLabel}
            </p>
          </div>
        </div>
      </button>

      {/* Navigation */}
      <nav className="flex-1 flex flex-col gap-0.5 px-3 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          const isMessages = item.path.includes("messages");
          const hasUnreadMessages = isMessages && unreadMessages > 0;

          return (
            <button
              key={item.path}
              type="button"
              onClick={() => navigate(item.path)}
              className={`relative w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors text-left ${
                isActive
                  ? "text-white"
                  : "text-gray-500 hover:text-gray-800 hover:bg-gray-100"
              }`}
              style={
                isActive ? { background: "var(--color-primary)" } : undefined
              }
            >
              {item.icon}

              <span className="text-sm font-medium truncate">
                {item.label}
              </span>

              {hasUnreadMessages && (
                <span className="ml-auto min-w-5 h-5 px-1 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center shrink-0">
                  {unreadMessages > 9 ? "9+" : unreadMessages}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Déconnexion */}
      <div className="px-3 mt-3 pt-3 border-t border-gray-100">
        <button
          type="button"
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-500 hover:text-red-500 hover:bg-red-50 transition-colors"
        >
          <LogOut className="w-5 h-5 shrink-0" />

          <span className="text-sm font-medium">Déconnexion</span>
        </button>
      </div>
    </aside>
  );
}