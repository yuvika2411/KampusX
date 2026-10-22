"use client";

import { useState } from "react";
import {
  X,
  LogIn,
  ShieldCheck,
  Lock,
  Mail,
  ArrowRight,
  Sparkles,
  Info,
} from "lucide-react";

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function LoginModal({ isOpen, onClose }: LoginModalProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [demoNotice, setDemoNotice] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setDemoNotice(
      "Frontend Demo: Authentication will be processed by the Spring Boot AuthController upon backend integration. Form remains in preview mode."
    );
  };

  const handleClose = () => {
    setDemoNotice(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="relative w-full max-w-md rounded-2xl bg-card border border-line shadow-2xl p-6 sm:p-8 animate-in fade-in zoom-in-95 duration-200 text-ink">
        <button
          onClick={handleClose}
          className="absolute top-5 right-5 p-1.5 rounded-lg text-mute hover:text-ink hover:bg-soft transition-colors"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-xl bg-brand-gradient flex items-center justify-center text-white">
              <LogIn className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-ink">
                Institutional Login
              </h3>
              <p className="text-xs text-mute">
                Sign in with your institutional email and password
              </p>
            </div>
          </div>

          {/* Role note (roles come from backend, no self-selection) */}
          <div className="mt-4 p-3 rounded-xl bg-soft border border-line text-xs text-mute flex items-start gap-2">
            <ShieldCheck className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
            <span>
              User roles and access permissions (Student, Staff, or Admin) are assigned automatically by the backend upon login.
            </span>
          </div>

          {/* Inline demo notice when submitted */}
          {demoNotice && (
            <div className="mt-3 p-3 rounded-xl bg-soft border border-line text-xs text-ink flex items-start gap-2 animate-in fade-in duration-150">
              <Info className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
              <span>{demoNotice}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-4 space-y-4">
            <div>
              <label className="block text-xs font-bold text-ink mb-1">
                Institutional Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-mute absolute left-3 top-2.5" />
                <input
                  type="email"
                  required
                  placeholder="e.g. name@kiet.edu or rollno.branch@kiet.edu"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-xl border border-line bg-soft pl-9 pr-3 py-2 text-xs font-medium text-ink placeholder:text-mute focus:outline-none focus:ring-2 focus:ring-[#818cf8] focus:border-[#818cf8]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-ink mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-mute absolute left-3 top-2.5" />
                <input
                  type="password"
                  required
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-xl border border-line bg-soft pl-9 pr-3 py-2 text-xs font-medium text-ink placeholder:text-mute focus:outline-none focus:ring-2 focus:ring-[#818cf8] focus:border-[#818cf8]"
                />
              </div>
            </div>

            <div className="flex items-center justify-between text-xs text-mute">
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  defaultChecked
                  className="rounded text-indigo-600 focus:ring-[#818cf8] border-line bg-soft w-3.5 h-3.5"
                />
                <span>Remember session</span>
              </label>
              <a
                href="#faq"
                onClick={handleClose}
                className="font-medium text-indigo-500 hover:text-indigo-400"
              >
                Forgot password?
              </a>
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl text-sm font-bold text-white bg-brand-gradient hover:opacity-95 shadow-md shadow-indigo-500/25 transition-all flex items-center justify-center gap-2"
            >
              <span>Sign In with Institutional Account</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="mt-4 pt-4 border-t border-line text-center">
            <span className="text-[11px] text-mute flex items-center justify-center gap-1">
              <Sparkles className="w-3 h-3 text-indigo-500" />
              Authentication connects to the Spring Boot backend service
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
