"use client";

import { useSyncExternalStore } from "react";
import { Sun, Moon } from "lucide-react";

interface ThemeToggleProps {
  showLabel?: boolean;
  className?: string;
}

function subscribe(callback: () => void) {
  window.addEventListener("storage", callback);
  const observer = new MutationObserver(callback);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
  return () => {
    window.removeEventListener("storage", callback);
    observer.disconnect();
  };
}

function getSnapshot(): "light" | "dark" {
  const currentAttr = document.documentElement.getAttribute("data-theme");
  if (currentAttr === "dark" || currentAttr === "light") return currentAttr;
  const saved = localStorage.getItem("kampusx-theme");
  if (saved === "dark" || saved === "light") return saved;
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function getServerSnapshot(): "light" | "dark" {
  return "light";
}

const emptySubscribe = () => () => {};

export default function ThemeToggle({ showLabel = false, className = "" }: ThemeToggleProps) {
  const mounted = useSyncExternalStore(emptySubscribe, () => true, () => false);
  const theme = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const toggleTheme = () => {
    const nextTheme = theme === "dark" ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", nextTheme);
    localStorage.setItem("kampusx-theme", nextTheme);
  };

  if (!mounted) {
    return (
      <div
        className={`w-9 h-9 rounded-xl border border-line bg-card flex items-center justify-center opacity-0 ${className}`}
        aria-hidden="true"
      />
    );
  }

  const isDark = theme === "dark";

  if (showLabel) {
    return (
      <button
        type="button"
        onClick={toggleTheme}
        className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium bg-soft text-ink hover:bg-card border border-line transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-[#818cf8] ${className}`}
        aria-label={`Switch to ${isDark ? "light" : "dark"} theme`}
      >
        <span className="flex items-center gap-2">
          {isDark ? (
            <Sun className="w-4 h-4 text-amber-400" />
          ) : (
            <Moon className="w-4 h-4 text-indigo-500" />
          )}
          <span>Appearance</span>
        </span>
        <span className="text-xs font-semibold uppercase tracking-wider text-mute px-2 py-0.5 rounded-md bg-card border border-line">
          {isDark ? "Dark" : "Light"}
        </span>
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={`relative p-2 rounded-xl bg-card hover:bg-soft text-mute hover:text-ink border border-line transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#818cf8] group ${className}`}
      aria-label={`Switch to ${isDark ? "light" : "dark"} mode`}
      title={`Switch to ${isDark ? "light" : "dark"} mode`}
    >
      {isDark ? (
        <Sun className="w-4 h-4 text-amber-400 transition-transform duration-300 group-hover:rotate-45" />
      ) : (
        <Moon className="w-4 h-4 text-indigo-600 transition-transform duration-300 group-hover:-rotate-12" />
      )}
    </button>
  );
}
