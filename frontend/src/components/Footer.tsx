"use client";

import Link from "next/link";
import {
  ShieldAlert,
  MapPin,
  Mail,
  Phone,
  Heart,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
} from "lucide-react";

export default function Footer() {
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
              A student-developed campus issue reporting and resolution platform for
              the KIET campus community. Designed for transparency, speed, and collaborative
              facility improvements.
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
                <span>support@kampusx.kiet.edu</span>
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
                  href="/login?next=/issues/new"
                  className="hover:text-ink transition-colors flex items-center gap-1.5"
                >
                  Report an Issue
                </Link>
              </li>
              <li>
                <Link
                  href="#live-feed"
                  className="hover:text-ink transition-colors"
                >
                  Demo Campus Feed
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
                <Link href="#stats" className="hover:text-ink transition-colors">
                  Resolution Targets (Demo)
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
                  Aryabhatta & Gargi Hostels
                </span>
              </li>
              <li>
                <span className="hover:text-ink transition-colors cursor-pointer">
                  Academic Blocks (A, B, C)
                </span>
              </li>
              <li>
                <span className="hover:text-ink transition-colors cursor-pointer">
                  Central Library & Study Halls
                </span>
              </li>
              <li>
                <span className="hover:text-ink transition-colors cursor-pointer">
                  Computer Labs & Wi-Fi Zones
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

        {/* Bottom Bar */}
        <div className="mt-14 pt-8 border-t border-line flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-mute">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-soft text-mute border border-line font-medium">
              <span className="w-2 h-2 rounded-full bg-amber-400" />
              Demo Mode (Ready for Backend Integration)
            </span>
            <span>• KIET Campus Initiative</span>
          </div>

          <div className="flex items-center gap-1 text-mute">
            <span>Built with</span>
            <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500 inline" />
            <span>for the KIET Student Community © {new Date().getFullYear()}</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
