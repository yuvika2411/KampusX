"use client";

import { useEffect, useState } from "react";
import { X, Bell, Check, Loader2, Clock, CheckCheck } from "lucide-react";
import { api, NotificationResponse } from "@/lib/api";
import { useWebSocketSubscription } from "@/lib/websocket";

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
  const [notifications, setNotifications] = useState<NotificationResponse[]>(
    [],
  );
  const [loading, setLoading] = useState(true);
  const [markingId, setMarkingId] = useState<number | null>(null);
  const [markingAll, setMarkingAll] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    let isMounted = true;
    setLoading(true);

    api.notifications
      .getMyNotifications(0, 50)
      .then((res) => {
        if (isMounted) {
          // Filter to only unread notifications (read notifications are removed from list)
          const unreadOnly = (res.content || []).filter((n) => !n.read);
          setNotifications(unreadOnly);
        }
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

  // Real-time subscription to receive new alerts while modal is open
  useWebSocketSubscription<NotificationResponse>(
    isOpen ? "/user/queue/notifications" : null,
    (event) => {
      if (event?.payload && !event.payload.read) {
        setNotifications((prev) => {
          if (prev.some((n) => n.id === event.payload.id)) return prev;
          return [event.payload, ...prev];
        });
      }
    },
  );

  if (!isOpen) return null;

  // Mark single notification as read -> remove from list
  const handleMarkAsRead = async (id: number) => {
    setMarkingId(id);
    try {
      await api.notifications.markAsRead(id);
      // Immediately remove from the notification list
      setNotifications((prev) => prev.filter((n) => n.id !== id));
      onNotificationsChanged?.();
    } catch {
      // Ignore network errors
    } finally {
      setMarkingId(null);
    }
  };

  // Mark all notifications as read -> clear entire list
  const handleMarkAllAsRead = async () => {
    if (notifications.length === 0) return;
    setMarkingAll(true);
    try {
      await Promise.allSettled(
        notifications.map((n) => api.notifications.markAsRead(n.id)),
      );
      setNotifications([]);
      onNotificationsChanged?.();
    } catch {
      // Ignore
    } finally {
      setMarkingAll(false);
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
              <p className="text-xs text-mute">
                Latest campus issue updates and tickets
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {notifications.length > 0 && (
              <button
                type="button"
                onClick={handleMarkAllAsRead}
                disabled={markingAll}
                className="text-[11px] font-semibold text-indigo-500 hover:text-indigo-600 transition-colors cursor-pointer flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-soft"
                title="Mark all as read and remove"
              >
                {markingAll ? (
                  <Loader2 size={12} className="animate-spin" />
                ) : (
                  <CheckCheck size={13} />
                )}
                <span>Mark all as read</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-mute hover:text-ink hover:bg-soft transition-colors cursor-pointer"
              aria-label="Close notifications"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        <div className="mt-4 max-h-[420px] overflow-y-auto space-y-2.5 pr-1">
          {loading ? (
            <div className="py-12 flex flex-col items-center justify-center text-mute gap-2">
              <Loader2 className="w-6 h-6 animate-spin text-indigo-500" />
              <span className="text-xs">Loading notifications…</span>
            </div>
          ) : notifications.length === 0 ? (
            <div className="py-12 text-center text-mute space-y-1.5">
              <Check className="w-8 h-8 mx-auto text-emerald-500 opacity-60" />
              <p className="text-sm font-semibold text-ink">All caught up!</p>
              <p className="text-xs text-mute">
                You have no unread notifications. New alerts will appear here in
                real time.
              </p>
            </div>
          ) : (
            notifications.map((n) => (
              <div
                key={n.id}
                className="p-3.5 rounded-xl border text-xs transition-all flex items-start justify-between gap-3 bg-indigo-500/5 border-indigo-500/25 text-ink shadow-xs"
              >
                <div className="flex-1 space-y-1">
                  <p className="leading-relaxed font-semibold">{n.message}</p>
                  {n.createdAt && (
                    <div className="flex items-center gap-1 text-[11px] text-mute">
                      <Clock size={12} />
                      <span>{new Date(n.createdAt).toLocaleString()}</span>
                    </div>
                  )}
                </div>
                <button
                  onClick={() => handleMarkAsRead(n.id)}
                  disabled={markingId === n.id}
                  className="shrink-0 px-2.5 py-1 rounded-lg bg-card hover:bg-soft text-indigo-500 border border-line text-[11px] font-semibold flex items-center gap-1 transition-colors cursor-pointer disabled:opacity-50"
                  title="Mark as read and remove"
                >
                  {markingId === n.id ? (
                    <Loader2 size={12} className="animate-spin" />
                  ) : (
                    <Check size={12} />
                  )}
                  <span>Read</span>
                </button>
              </div>
            ))
          )}
        </div>

        <div className="mt-4 pt-3 border-t border-line text-right">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-ink bg-soft hover:bg-card border border-line transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
