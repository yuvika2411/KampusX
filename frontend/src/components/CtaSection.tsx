"use client";

import Link from "next/link";

import {
  ArrowRight,
  ShieldCheck,
  PlusCircle,
  Sparkles,
  Users,
  CheckCircle,
  LogIn,
} from "lucide-react";

export default function CtaSection() {
  return (
    <section className="py-20 md:py-28 bg-page relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-3xl bg-gradient-to-tr from-indigo-950 via-indigo-900 to-blue-900 text-white px-6 py-16 sm:px-12 sm:py-20 overflow-hidden shadow-2xl shadow-indigo-900/30">
          {/* Background subtle radial circles */}
          <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 rounded-full bg-blue-500/10 blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-96 h-96 rounded-full bg-indigo-500/15 blur-3xl pointer-events-none" />

          <div className="relative max-w-3xl mx-auto text-center">
            {/* Top Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-xs font-semibold text-indigo-200">
              <Sparkles className="w-3.5 h-3.5 text-indigo-300" />
              <span>Make KIET Smarter, Cleaner & Safer</span>
            </div>

            <h2 className="mt-6 text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight">
              Ready to Make Your Campus Voice Heard?
            </h2>

            <p className="mt-5 text-base sm:text-lg text-indigo-200 leading-relaxed max-w-2xl mx-auto font-normal">
              Whether it’s a hostel water cooler, a classroom projector, or library Wi-Fi,
              your report initiates collaborative action. Join students and campus members
              improving facility maintenance together.
            </p>

            {/* Buttons */}
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/login?next=/issues/new"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-xl text-base font-bold bg-white text-indigo-950 hover:bg-indigo-50 shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200"
              >
                <PlusCircle className="w-5 h-5 text-indigo-600" />
                <span>Report an Issue Today</span>
                <ArrowRight className="w-4 h-4 text-indigo-600" />
              </Link>

              <Link
                href="/login"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-4 rounded-xl text-base font-bold text-white bg-white/10 hover:bg-white/15 border border-white/20 backdrop-blur-sm transition-all duration-150"
              >
                <LogIn className="w-4 h-4 text-indigo-300" />
                <span>Login with Institutional Email</span>
              </Link>
            </div>

            {/* Feature reassurance pills */}
            <div className="mt-10 pt-8 border-t border-white/10 flex flex-wrap items-center justify-center gap-y-2 gap-x-6 text-xs text-indigo-200 font-medium">
              <div className="flex items-center gap-1.5">
                <CheckCircle className="w-4 h-4 text-emerald-400" />
                <span>Institutional email & password authentication</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle className="w-4 h-4 text-emerald-400" />
                <span>Community-backed issue prioritization</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle className="w-4 h-4 text-emerald-400" />
                <span>Transparent lifecycle tracking from report to resolution</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
