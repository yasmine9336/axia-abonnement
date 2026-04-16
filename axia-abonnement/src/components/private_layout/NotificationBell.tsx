import { useState, useRef, useEffect } from "react";
import { useNotifications } from "../../context/useNotifications";

export default function NotificationBell() {
  const { notifications, unreadCount, markAllAsRead } = useNotifications();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleToggle = async () => {
    const next = !open;
    setOpen(next);

    // ✅ ouverture du panneau => tout marquer comme lu
    if (next && unreadCount > 0) {
      await markAllAsRead();
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
    if (type === "success") return "bg-green-50 border-l-4 border-green-400";
    if (type === "warning") return "bg-orange-50 border-l-4 border-orange-400";
    return "bg-blue-50 border-l-4 border-blue-400";
  };

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => void handleToggle()}
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
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
            {unreadCount > 9 ? "9+" : unreadCount}
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
                  className={`px-4 py-3 mx-2 my-1 rounded-xl ${
                    n.isRead ? "bg-gray-50 opacity-60" : typeColor(n.type)
                  }`}
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