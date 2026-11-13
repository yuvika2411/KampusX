"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  AuthSession,
  getSession,
  fetchCurrentUser,
  clearSession,
} from "@/lib/auth";
import { api } from "@/lib/api";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import NotificationsModal from "@/components/dashboard/NotificationsModal";
import StudentView from "@/components/dashboard/StudentView";
import CategoryHeadView from "@/components/dashboard/CategoryHeadView";
import ResolverView from "@/components/dashboard/ResolverView";
import AdminView from "@/components/dashboard/AdminView";
import DefaultRoleView from "@/components/dashboard/DefaultRoleView";
import { ShieldAlert, Loader2, LogOut, Globe } from "lucide-react";
import Link from "next/link";

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<AuthSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    let isMounted = true;

    // Check existing stored session
    const existing = getSession();
    if (!existing || !existing.token) {
      router.replace("/login?next=/dashboard");
      return;
    }

    // Concurrently verify with backend to get the freshest role & status
    fetchCurrentUser()
      .then((freshUser) => {
        if (!isMounted) return;
        if (!freshUser) {
          router.replace("/login?next=/dashboard");
          return;
        }
        setUser(freshUser);
        setLoading(false);

        // Fetch unread notifications
        api.notifications
          .getUnreadCount()
          .then((res) => {
            if (isMounted) setUnreadCount(res.unreadCount || 0);
          })
          .catch(() => {});
      })
      .catch(() => {
        if (isMounted) {
          // If network error occurred, still allow cached session
          setUser(existing);
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [router]);

  const handleSignOut = () => {
    clearSession();
    router.replace("/login");
  };

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-page flex flex-col items-center justify-center p-4">
        <div className="w-12 h-12 rounded-2xl bg-brand-gradient flex items-center justify-center text-white shadow-lg shadow-indigo-500/25 mb-4 animate-pulse">
          <ShieldAlert size={26} />
        </div>
        <div className="flex items-center gap-2 text-ink text-sm font-semibold">
          <Loader2 size={16} className="animate-spin text-indigo-500" />
          <span>Verifying campus credentials...</span>
        </div>
        <p className="text-xs text-mute mt-1">Synchronizing active role with backend</p>
      </div>
    );
  }

  const role = (user.role || "").toUpperCase();

  return (
    <div className="min-h-screen bg-page text-ink flex flex-col">
      {/* Sticky Header with active role badge and navigation */}
      <DashboardHeader
        user={user}
        onSignOut={handleSignOut}
        unreadCount={unreadCount}
        onOpenNotifications={() => setNotificationsOpen(true)}
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
      />

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="sm:hidden border-b border-line bg-card/95 backdrop-blur-xl px-4 py-4 space-y-3 animate-in slide-in-from-top-2 duration-150">
          <div className="flex items-center justify-between pb-2 border-b border-line">
            <div className="flex flex-col">
              <span className="text-xs font-bold text-ink">{user.name}</span>
              <span className="text-[11px] text-mute">{user.email}</span>
            </div>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-soft text-indigo-500 border border-line">
              {user.role}
            </span>
          </div>

          <Link
            href="/"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-mute hover:text-ink hover:bg-soft rounded-lg"
          >
            <Globe size={14} />
            <span>Public Campus Landing</span>
          </Link>

          <button
            type="button"
            onClick={() => {
              setMobileMenuOpen(false);
              setNotificationsOpen(true);
            }}
            className="w-full flex items-center justify-between px-3 py-2 text-xs font-medium text-mute hover:text-ink hover:bg-soft rounded-lg"
          >
            <span>Notifications</span>
            {unreadCount > 0 && (
              <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-indigo-600 text-white font-bold">
                {unreadCount}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={handleSignOut}
            className="w-full flex items-center justify-center gap-2 py-2 text-xs font-semibold text-rose-500 hover:bg-rose-500/10 rounded-xl border border-rose-500/20"
          >
            <LogOut size={13} />
            <span>Sign Out</span>
          </button>
        </div>
      )}

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Dynamic Role-Based View Switch */}
        {role === "STUDENT" && <StudentView user={user} />}
        {role === "CATEGORY_HEAD" && <CategoryHeadView user={user} />}
        {role === "RESOLVER" && <ResolverView user={user} />}
        {role === "ADMIN" && <AdminView user={user} />}

        {/* Dynamic Fallback: Any other / custom backend role */}
        {!["STUDENT", "CATEGORY_HEAD", "RESOLVER", "ADMIN"].includes(role) && (
          <DefaultRoleView user={user} />
        )}
      </main>

      {/* Notifications Modal */}
      <NotificationsModal
        isOpen={notificationsOpen}
        onClose={() => setNotificationsOpen(false)}
        onNotificationsChanged={() => {
          setUnreadCount((prev) => Math.max(0, prev - 1));
        }}
      />
    </div>
  );
}
