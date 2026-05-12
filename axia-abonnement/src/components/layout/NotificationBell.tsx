import { useState, useRef } from "react";
import { useClickOutside } from "../../hooks/useClickOutside";
import { useNavigate } from "react-router-dom";
import { useNotifications } from "../../hooks/useNotifications";
import type { NotificationItem } from "../../types";

export default function NotificationBell() {
  const { notifications, badgeCount, dismissBadge, markAsRead } =
    useNotifications();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useClickOutside(ref, () => setOpen(false));

  const handleToggle = () => {
    const next = !open;
    setOpen(next);
    if (next && badgeCount > 0) {
      dismissBadge();
    }
  };

  const formatDate = (d: string) =>
    new Date(d).toLocaleString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });

  const typeColor = (type: string) => {
    if (type === "success") return "bg-blue-50 border-l-4 border-green-400";
    if (type === "warning") return "bg-blue-50 border-l-4 border-orange-400";
    return "bg-(--color-primary-soft) border-l-4 border-(--color-primary)";
  };

  const handleNotificationClick = async (n: NotificationItem) => {
    if (!n.isRead) await markAsRead(n.id);
    if (n.route) {
      navigate(n.route);
      setOpen(false);
    }
  };

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        aria-label="Ouvrir les notifications"
        onClick={handleToggle}
        className="relative p-2 rounded-xl hover:bg-gray-100 transition-colors"
      >
        <svg
          className="w-5 h-5 text-gray-600"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
          />
        </svg>

        {badgeCount > 0 && (
          <span className="absolute top-1 right-1 w-4 h-4 bg-blue-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
            {badgeCount > 9 ? "9+" : badgeCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl border border-gray-200 shadow-lg z-50">
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
            <span className="font-semibold text-gray-900 text-sm">
              Notifications
            </span>
          </div>

          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <p className="text-center text-sm text-gray-400 py-8">
                Aucune notification
              </p>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.id}
                  role={n.route ? "button" : undefined}
                  tabIndex={n.route ? 0 : -1}
                  onClick={() => void handleNotificationClick(n)}
                  onKeyDown={(e) => {
                    if (!n.route) return;
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      void handleNotificationClick(n);
                    }
                  }}
                  className={`px-4 py-3 mx-2 my-1 rounded-xl ${
                    n.route ? "cursor-pointer" : "cursor-default"
                  } ${n.isRead ? "bg-gray-50 opacity-60" : typeColor(n.type)}`}
                >
                  <p className="text-sm text-gray-800">{n.message}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    {formatDate(n.createdAt)}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
