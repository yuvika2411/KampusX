"use client";

import Link from "next/link";
import {
  ShieldAlert,
  Bell,
  LogOut,
  Globe,
  Menu,
  X,
  User as UserIcon,
} from "lucide-react";
import ThemeToggle from "@/components/ThemeToggle";
import RoleBadge from "./RoleBadge";
import { AuthSession } from "@/lib/auth";

interface DashboardHeaderProps {
  user: AuthSession;
  onSignOut: () => void;
  unreadCount: number;
  onOpenNotifications: () => void;
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (open: boolean) => void;
}

export default function DashboardHeader({
  user,
  onSignOut,
  unreadCount,
  onOpenNotifications,
  mobileMenuOpen,
  setMobileMenuOpen,
}: DashboardHeaderProps) {
  const initials = user.name
    ? user.name
        .split(" ")
        .map((p) => p[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : user.email.slice(0, 2).toUpperCase();

  return (
    <header className="sticky top-0 z-40 bg-navbar backdrop-blur-xl border-b border-line py-3 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Brand Logo & Context */}
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard"
            className="flex items-center gap-2.5 group focus:outline-none focus-visible:ring-2 focus-visible:ring-[#818cf8] rounded-lg"
          >
            <div className="w-9 h-9 rounded-xl bg-brand-gradient flex items-center justify-center text-white shadow-md shadow-indigo-500/20 group-hover:scale-105 transition-transform">
              <ShieldAlert size={20} />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-lg tracking-tight text-ink">
                  Kampus<span className="text-brand-gradient">X</span>
                </span>
                <span className="px-1.5 py-0.2 rounded-md text-[10px] font-semibold bg-soft text-indigo-500 border border-line">
                  KIET
                </span>
              </div>
              <span className="text-[10px] font-medium text-mute tracking-wide uppercase">
                Portal
              </span>
            </div>
          </Link>

          {/* Active Role Badge in Header */}
          <div className="hidden sm:block pl-2 border-l border-line">
            <RoleBadge role={user.role} size="sm" />
          </div>
        </div>

        {/* Right Action Bar */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Link back to public landing page */}
          <Link
            href="/"
            className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-mute hover:text-ink bg-soft/60 hover:bg-soft border border-line rounded-xl transition-colors"
            title="View public landing page"
          >
            <Globe size={13} />
            <span>Campus Feed</span>
          </Link>

          {/* Notifications Button */}
          <button
            type="button"
            onClick={onOpenNotifications}
            className="relative p-2 rounded-xl text-mute hover:text-ink hover:bg-soft border border-line bg-card transition-colors focus:outline-none focus:ring-2 focus:ring-[#818cf8]"
            aria-label="View notifications"
            title="Notifications"
          >
            <Bell size={17} />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 min-w-4 px-1 items-center justify-center rounded-full bg-indigo-600 text-[10px] font-bold text-white ring-2 ring-card">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </button>

          {/* Theme Switch */}
          <ThemeToggle />

          {/* User Profile Pill */}
          <div className="hidden lg:flex items-center gap-2.5 pl-2.5 border-l border-line">
            <div className="w-8 h-8 rounded-xl bg-brand-gradient flex items-center justify-center text-white text-xs font-bold shadow-xs">
              {initials || <UserIcon size={14} />}
            </div>
            <div className="flex flex-col text-left text-xs">
              <span className="font-bold text-ink max-w-[130px] truncate" title={user.name}>
                {user.name || "KampusX User"}
              </span>
              <span className="text-[11px] text-mute max-w-[130px] truncate" title={user.email}>
                {user.email}
              </span>
            </div>
          </div>

          {/* Sign Out Button */}
          <button
            type="button"
            onClick={onSignOut}
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-rose-500 hover:text-white hover:bg-rose-500/90 border border-rose-500/20 transition-all duration-150"
            title="Sign out of KampusX"
          >
            <LogOut size={13} />
            <span>Sign Out</span>
          </button>

          {/* Mobile Menu Toggle */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="sm:hidden p-2 rounded-xl text-mute hover:text-ink hover:bg-soft border border-line focus:outline-none focus:ring-2 focus:ring-[#818cf8]"
            aria-label="Toggle dashboard menu"
          >
            {mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>
    </header>
  );
}
