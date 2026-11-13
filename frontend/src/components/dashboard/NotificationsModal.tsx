"use client";

import { useEffect, useState } from "react";
import { X, Bell, Check, Loader2, Clock } from "lucide-react";
import { api, NotificationResponse } from "@/lib/api";

interface NotificationsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNotificationsChanged?: () => void;
}

export default function NotificationsModal({
  isOpen,
  onClose,
  onNotificationsChanged,
}: NotificationsModalProps) {
  const [notifications, setNotifications] = useState<NotificationResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [markingId, setMarkingId] = useState<number | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    let isMounted = true;
    api.notifications
      .getMyNotifications(0, 20)
      .then((res) => {
        if (isMounted) setNotifications(res.content || []);
      })
      .catch(() => {
        if (isMounted) setNotifications([]);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleMarkAsRead = async (id: number) => {
    setMarkingId(id);
    try {
      await api.notifications.markAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n))
      );
      onNotificationsChanged?.();
    } catch {
      // Ignore
    } finally {
      setMarkingId(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="relative w-full max-w-lg rounded-2xl bg-card border border-line shadow-2xl p-6 text-ink animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between pb-4 border-b border-line">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center">
              <Bell size={18} />
            </div>
            <div>
              <h3 className="text-base font-bold text-ink">Notifications</h3>
              <p className="text-xs text-mute">Latest campus issue updates and tickets</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-mute hover:text-ink hover:bg-soft transition-colors"
            aria-label="Close notifications"
          >
            <X size={18} />
          </button>
        </div>

        <div className="mt-4 max-h-[420px] overflow-y-auto space-y-2.5 pr-1">
          {loading ? (
            <div className="py-12 flex flex-col items-center justify-center text-mute gap-2">
              <Loader2 className="w-6 h-6 animate-spin text-indigo-500" />
              <span className="text-xs">Loading notifications…</span>
            </div>
          ) : notifications.length === 0 ? (
            <div className="py-12 text-center text-mute">
              <Bell className="w-8 h-8 mx-auto mb-2 opacity-30" />
              <p className="text-sm font-medium">No notifications yet</p>
              <p className="text-xs mt-1">You will receive alerts when your tickets are updated.</p>
            </div>
          ) : (
            notifications.map((n) => (
              <div
                key={n.id}
                className={`p-3.5 rounded-xl border text-xs transition-all flex items-start justify-between gap-3 ${
                  n.read
                    ? "bg-soft/40 border-line text-mute"
                    : "bg-indigo-500/5 border-indigo-500/25 text-ink shadow-xs"
                }`}
              >
                <div className="flex-1 space-y-1">
                  <p className={`leading-relaxed ${n.read ? "font-normal" : "font-semibold"}`}>
                    {n.message}
                  </p>
                  {n.createdAt && (
                    <div className="flex items-center gap-1 text-[11px] text-mute">
                      <Clock size={12} />
                      <span>{new Date(n.createdAt).toLocaleString()}</span>
                    </div>
                  )}
                </div>
                {!n.read && (
                  <button
                    onClick={() => handleMarkAsRead(n.id)}
                    disabled={markingId === n.id}
                    className="shrink-0 p-1 rounded-lg bg-card hover:bg-soft text-indigo-500 border border-line text-[11px] font-semibold flex items-center gap-1 transition-colors"
                    title="Mark as read"
                  >
                    {markingId === n.id ? (
                      <Loader2 size={12} className="animate-spin" />
                    ) : (
                      <Check size={12} />
                    )}
                    <span>Read</span>
                  </button>
                )}
              </div>
            ))
          )}
        </div>

        <div className="mt-4 pt-3 border-t border-line text-right">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-ink bg-soft hover:bg-card border border-line transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
