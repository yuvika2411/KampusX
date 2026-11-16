"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  ShieldAlert,
  MapPin,
  Mail,
  Heart,
  ExternalLink,
  ShieldCheck,
  Phone,
} from "lucide-react";
import { AuthSession, getSession } from "@/lib/auth";

export default function Footer() {
  const [session, setSession] = useState<AuthSession | null>(null);

  useEffect(() => {
    const active = getSession();
    if (active) setSession(active);
  }, []);

  return (
    <footer className="bg-card text-mute border-t border-line">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 lg:gap-8">
          {/* Brand Info (2 cols on lg) */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-brand-gradient flex items-center justify-center text-white shadow-md">
                <ShieldAlert className="w-5 h-5 text-white" />
              </div>
              <div className="flex items-center gap-2">
                <span className="font-black text-2xl text-ink tracking-tight">
                  Kampus<span className="text-brand-gradient">X</span>
                </span>
                <span className="text-xs font-bold text-indigo-500 bg-soft px-2 py-0.5 rounded border border-line">
                  KIET
                </span>
              </div>
            </div>

            <p className="text-sm text-mute leading-relaxed max-w-sm">
              An institutional campus issue reporting and resolution platform for
              the KIET community. Designed for accountability, speed, and collaborative
              campus maintenance improvements.
            </p>

            <div className="pt-2 space-y-2 text-xs text-mute">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
                <span>
                  KIET Group of Institutions, Delhi-NCR, NH-58, Ghaziabad, UP 201206
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-indigo-500 shrink-0" />
                <a
                  href="mailto:support@kampusx.kiet.edu"
                  className="hover:text-ink transition-colors"
                >
                  support@kampusx.kiet.edu
                </a>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-indigo-500 shrink-0" />
                <span>Campus Intercom: Ext. 4100 / Estate Office</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-ink">
              Platform
            </h4>
            <ul className="mt-4 space-y-2.5 text-xs sm:text-sm">
              <li>
                <Link
                  href={session ? "/dashboard" : "/login?next=/dashboard"}
                  className="hover:text-ink transition-colors flex items-center gap-1.5"
                >
                  {session && session.role?.toUpperCase() !== "STUDENT"
                    ? "Resolution Dashboard"
                    : "Report an Issue"}
                </Link>
              </li>
              <li>
                <Link
                  href="#live-feed"
                  className="hover:text-ink transition-colors"
                >
                  Campus Workflow
                </Link>
              </li>
              <li>
                <Link
                  href="#how-it-works"
                  className="hover:text-ink transition-colors"
                >
                  How It Works
                </Link>
              </li>
              <li>
                <Link href="#roles" className="hover:text-ink transition-colors">
                  Who Uses KampusX
                </Link>
              </li>
              <li>
                <Link href="#faq" className="hover:text-ink transition-colors">
                  Help & FAQs
                </Link>
              </li>
            </ul>
          </div>

          {/* Campus Zones */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-ink">
              Campus Zones
            </h4>
            <ul className="mt-4 space-y-2.5 text-xs sm:text-sm">
              <li>
                <span className="hover:text-ink transition-colors cursor-pointer">
                  Hostels (Aryabhatt & Gargi)
                </span>
              </li>
              <li>
                <span className="hover:text-ink transition-colors cursor-pointer">
                  Academic Blocks (A through H)
                </span>
              </li>
              <li>
                <span className="hover:text-ink transition-colors cursor-pointer">
                  Central Library & Study Halls
                </span>
              </li>
              <li>
                <span className="hover:text-ink transition-colors cursor-pointer">
                  AI Labs & Computer Centers
                </span>
              </li>
              <li>
                <span className="hover:text-ink transition-colors cursor-pointer">
                  Cafeteria & Sports Complex
                </span>
              </li>
            </ul>
          </div>

          {/* Administration & Guidelines */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-ink">
              Administration
            </h4>
            <ul className="mt-4 space-y-2.5 text-xs sm:text-sm">
              <li>
                <span className="hover:text-ink transition-colors cursor-pointer">
                  Chief Warden Office
                </span>
              </li>
              <li>
                <span className="hover:text-ink transition-colors cursor-pointer">
                  Campus IT Cell
                </span>
              </li>
              <li>
                <span className="hover:text-ink transition-colors cursor-pointer">
                  Estate Maintenance Office
                </span>
              </li>
              <li>
                <span className="hover:text-ink transition-colors cursor-pointer">
                  Dean of Student Welfare
                </span>
              </li>
              <li>
                <a
                  href="https://www.kiet.edu"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-indigo-500 hover:text-indigo-400 transition-colors"
                >
                  <span>kiet.edu Portal</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Institutional Privacy & Security Notice Banner */}
        <div className="mt-12 p-4 rounded-xl bg-soft/70 border border-line text-xs text-mute flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <div className="p-2 rounded-lg bg-card border border-line text-indigo-500 shrink-0">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div className="flex-1">
            <p className="font-semibold text-ink">Institutional Privacy & Security Notice</p>
            <p className="text-[11px] text-mute mt-0.5">
              All accounts are verified via official KIET institutional email (@kiet.edu). Reporter personal details
              remain strictly confidential and are not exposed in public previews or community aggregate views.
              Ticket data is processed solely for campus facility administration and department workflow tracking.
            </p>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-8 pt-8 border-t border-line flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-mute">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-soft text-mute border border-line font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              KIET Student Resolution Platform
            </span>
            <span>• Official Campus Portal</span>
          </div>

          <div className="flex items-center gap-1 text-mute">
            <span>Built with</span>
            <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500 inline" />
            <span>by the KampusX Student Engineering Team for KIET © {new Date().getFullYear()}</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
