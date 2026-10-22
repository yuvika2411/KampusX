"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  ShieldAlert,
  Menu,
  X,
  ChevronRight,
  PlusCircle,
  LogIn,
  Sparkles,
} from "lucide-react";

import ThemeToggle from "./ThemeToggle";

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { label: "Features", href: "#features" },
    { label: "How It Works", href: "#how-it-works" },
    { label: "Live Dashboard", href: "#live-feed" },
    { label: "Campus Impact", href: "#stats" },
    { label: "FAQs", href: "#faq" },
  ];

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 bg-navbar backdrop-blur-xl border-b border-line ${
        isScrolled ? "py-3 shadow-sm" : "py-4"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center gap-3 group focus:outline-none focus-visible:ring-2 focus-visible:ring-[#818cf8] rounded-lg"
          >
            <div className="w-10 h-10 rounded-xl bg-brand-gradient flex items-center justify-center text-white shadow-md shadow-indigo-500/20 group-hover:scale-105 transition-transform duration-200">
              <ShieldAlert className="w-5 h-5 text-white" />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-xl tracking-tight text-ink transition-colors">
                  Kampus<span className="text-brand-gradient">X</span>
                </span>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-soft text-indigo-500 border border-line">
                  KIET
                </span>
              </div>
              <span className="text-[10px] font-medium text-mute tracking-wide uppercase">
                Student Resolution Portal
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden xl:flex items-center gap-1 lg:gap-2">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="px-3.5 py-2 text-sm font-medium text-mute hover:text-ink hover:bg-soft rounded-lg transition-all duration-150"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Action CTAs */}
          <div className="hidden xl:flex items-center gap-3">
            <ThemeToggle />
            <Link
              href="/login"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-sm font-semibold text-mute hover:text-ink transition-colors"
            >
              <LogIn className="w-4 h-4 text-mute group-hover:text-ink" />
              <span>Login</span>
            </Link>
            <Link
              href="/register"
              className="inline-flex items-center gap-2 px-4.5 py-2.5 rounded-xl text-sm font-semibold text-white bg-brand-gradient hover:opacity-95 shadow-md shadow-indigo-500/25 hover:shadow-lg hover:shadow-indigo-500/35 hover:-translate-y-0.5 transition-all duration-200"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Get Started</span>
            </Link>
          </div>

          {/* Mobile Menu Toggle Button & Theme Switch */}
          <div className="flex xl:hidden items-center gap-2">
            <ThemeToggle />
            <Link
              href="/register"
              className="hidden min-[400px]:inline-flex px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-brand-gradient"
            >
              Get Started
            </Link>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              type="button"
              className="p-2 rounded-lg text-mute hover:text-ink hover:bg-soft focus:outline-none focus:ring-2 focus:ring-[#818cf8]"
              aria-label="Toggle navigation menu"
              aria-expanded={mobileMenuOpen}
              aria-controls="mobile-navigation"
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div id="mobile-navigation" className="xl:hidden border-b border-line bg-card/95 backdrop-blur-xl px-4 pt-3 pb-6 space-y-3 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-between px-3 py-2.5 rounded-lg text-base font-medium text-mute hover:text-ink hover:bg-soft"
              >
                <span>{link.label}</span>
                <ChevronRight className="w-4 h-4 text-mute" />
              </Link>
            ))}
          </div>

          <div className="pt-2">
            <ThemeToggle showLabel />
          </div>

          <div className="pt-3 border-t border-line flex flex-col gap-2.5">
            <Link
              href="/login"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-center gap-2 w-full py-2.5 text-sm font-semibold text-ink hover:bg-soft rounded-xl transition-colors"
            >
              <LogIn className="w-4 h-4 text-mute" />
              <span>Login</span>
            </Link>
            <Link
              href="/register"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-sm font-semibold text-white bg-brand-gradient shadow-md shadow-indigo-500/20"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Get Started</span>
            </Link>
          </div>

          <div className="pt-2 text-center">
            <span className="inline-flex items-center gap-1.5 text-xs text-mute font-medium">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              Platform for KIET Students & Campus Community
            </span>
          </div>
        </div>
      )}
    </header>
  );
}
