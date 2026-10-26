"use client";

import Link from "next/link";
import {
  ArrowRight,
  Sparkles,
  Users,
  CheckCircle2,
  Clock,
  TrendingUp,
  Building,
  PlusCircle,
  Eye,
} from "lucide-react";
import DashboardMockup from "./DashboardMockup";

export default function Hero() {
  return (
    <section className="relative isolate pt-12 pb-20 md:pt-16 md:pb-28 overflow-hidden bg-page text-ink">
      {/* Background radial gradient glow effects & dotted grid */}
      <div aria-hidden="true" className="absolute inset-0 bg-hero-glow -z-10 pointer-events-none" />
      <div aria-hidden="true" className="absolute inset-0 bg-dot-pattern -z-10 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top Hero Announcement Badge */}
        <div className="flex justify-center">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-card border border-line shadow-xs hover:border-[#818cf8] transition-all cursor-default">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-600" />
            </span>
            <span className="text-xs font-semibold text-ink">
              Campus Issue Resolution Platform • Designed for KIET Students
            </span>
            <span className="hidden sm:inline-block text-line">|</span>
            <span className="hidden sm:inline-flex items-center gap-1 text-xs font-medium text-indigo-500">
              <Sparkles className="w-3.5 h-3.5" />
              Demo Preview
            </span>
          </div>
        </div>

        {/* Main Hero Header */}
        <div className="mt-8 text-center max-w-4xl mx-auto">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-ink leading-[1.12]">
            Your Campus. Your Voice.{" "}
            <span className="text-brand-gradient">
              Real Change.
            </span>
          </h1>

          <p className="mt-6 text-lg sm:text-xl text-mute leading-relaxed max-w-2xl mx-auto font-normal">
            No more buried complaint registers or unaddressed maintenance woes.
            KampusX empowers KIET students to report issues, mobilize community
            upvotes, and track transparent resolutions from dorms to laboratories.
          </p>

          {/* CTA Buttons */}
          <div className="mt-9 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/login?next=/issues/new"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-7 py-3.5 rounded-xl text-base font-semibold text-white bg-brand-gradient hover:opacity-95 shadow-lg shadow-indigo-600/25 hover:shadow-xl hover:shadow-indigo-600/35 hover:-translate-y-0.5 transition-all duration-200 group"
            >
              <PlusCircle className="w-5 h-5 text-indigo-200 group-hover:scale-110 transition-transform" />
              <span>Report an Issue</span>
              <ArrowRight className="w-4 h-4 ml-0.5 group-hover:translate-x-1 transition-transform" />
            </Link>

            <Link
              href="#live-feed"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl text-base font-semibold text-ink bg-card hover:bg-soft border border-line hover:border-[#818cf8] shadow-sm transition-all duration-150"
            >
              <Eye className="w-4 h-4 text-mute" />
              <span>Explore Demo Feed</span>
            </Link>
          </div>

          {/* Trust Highlights Strip (Demo Benchmarks) */}
          <div className="mt-10 pt-6 border-t border-line flex flex-wrap items-center justify-center gap-y-3 gap-x-8 text-xs font-semibold text-mute">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <span>90%+ Target Resolution (Demo Goal)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-indigo-500" />
              <span>&lt; 48 Hours Target Turnaround</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Users className="w-4 h-4 text-blue-500" />
              <span>Community-Driven Upvoting</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Building className="w-4 h-4 text-cyan-500" />
              <span>Multi-Department Routing</span>
            </div>
          </div>
        </div>

        {/* Dashboard Mockup Display */}
        <div id="live-feed" className="mt-12 sm:mt-16 relative">
          {/* Mockup Card */}
          <DashboardMockup />

          {/* Floating Feature Badges */}
          <div className="hidden lg:flex items-center gap-2 absolute -bottom-5 left-8 bg-card/95 backdrop-blur-md px-4 py-2.5 rounded-xl shadow-lg border border-line text-xs font-semibold text-ink">
            <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 animate-pulse" />
            <span>Interactive Demo • Sample Issue Stream</span>
          </div>

          <div className="hidden lg:flex items-center gap-2 absolute -bottom-5 right-8 bg-card/95 backdrop-blur-md px-4 py-2.5 rounded-xl shadow-lg border border-line text-xs font-semibold text-ink">
            <TrendingUp className="w-4 h-4 text-indigo-500" />
            <span>Resolution Workflow Preview (Demo Mode)</span>
          </div>
        </div>
      </div>
    </section>
  );
}
