"use client";

import Link from "next/link";

import { useState } from "react";
import {
  Users2,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  Camera,
  ShieldCheck,
  Check,
} from "lucide-react";

export default function HowItWorks() {
  const [activeStep, setActiveStep] = useState(0);

  const steps = [
    {
      step: "01",
      title: "Report an Issue",
      subtitle: "Submit with category and campus location",
      description:
        "Spotted a leaking faucet in Aryabhatt Hostel, a display issue in the HP-Intel Lab, or Wi-Fi drops in the Library? Attach photo evidence, specify your building location, and submit via your verified @kiet.edu account.",
      bullets: [
        "Select real campus locations (Aryabhatt, Gargi, Academic Blocks, Labs)",
        "Attach supporting photo evidence",
        "Categorized by department for direct Category Head triage",
      ],
      icon: Camera,
      badge: "Step 1: Submission",
      cardVisual: {
        title: "Example Issue Submission",
        field1: "Location: Aryabhatt Hostel",
        field2: "Category: HOSTEL • RO Purifier Maintenance",
        statusBadge: "Status: REPORTED",
      },
    },
    {
      step: "02",
      title: "Gain Community Support",
      subtitle: "Collective upvotes and comments highlight urgency",
      description:
        "Once posted, batchmates and hostel residents can upvote the ticket and leave comments. Community support elevates urgent concerns on department triage queues without creating duplicate tickets.",
      bullets: [
        "Prevents duplicate tickets for the same facility issue",
        "Community upvotes highlight urgency on departmental queues",
        "Student comments provide ongoing context",
      ],
      icon: Users2,
      badge: "Step 2: Amplification",
      cardVisual: {
        title: "Example Community Backing",
        field1: "35 Students Upvoted This Request",
        field2: "Comments active with hostel updates",
        statusBadge: "Milestone: Elevated Priority",
      },
    },
    {
      step: "03",
      title: "Track & Confirm Resolution",
      subtitle: "Transparent resolver workflow and student sign-off",
      description:
        "Track the ticket as the Category Head assigns a dedicated Resolver. When the resolver marks the repair as RESOLVED, the reporting student confirms closure or reopens the ticket if needed.",
      bullets: [
        "Lifecycle: REPORTED → ASSIGNED → IN_PROGRESS → RESOLVED",
        "Resolver updates status when maintenance begins",
        "Student reporter confirms closure or reopens the issue",
      ],
      icon: CheckCircle2,
      badge: "Step 3: Verification",
      cardVisual: {
        title: "Example Resolution",
        field1: "Resolver: Assigned Department Resolver",
        field2: "Status: Marked RESOLVED by Field Resolver",
        statusBadge: "Action: Student Confirmed & Closed",
      },
    },
  ];

  return (
    <section id="how-it-works" className="py-20 md:py-28 bg-page border-t border-line text-ink">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-soft text-indigo-500 border border-line">
            <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
            Simple 3-Step Process
          </span>
          <h2 className="mt-4 text-3xl sm:text-4xl font-extrabold text-ink tracking-tight">
            How KampusX Resolves Campus Issues
          </h2>
          <p className="mt-4 text-base sm:text-lg text-mute leading-relaxed">
            From the moment you spot a problem to the final technician sign-off,
            every step is transparent, crowdsourced, and accountable.
          </p>
        </div>

        {/* 3 Step Cards Grid */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
          {steps.map((item, index) => {
            const Icon = item.icon;
            const isHovered = activeStep === index;
            return (
              <div
                key={item.step}
                onMouseEnter={() => setActiveStep(index)}
                className={`relative rounded-2xl bg-card border card-hover p-6 sm:p-7 flex flex-col justify-between ${
                  isHovered ? "border-[#818cf8]" : "border-line"
                }`}
              >
                <div>
                  {/* Step header */}
                  <div className="flex items-center justify-between">
                    <span className="text-3xl font-black text-indigo-500 tracking-tight">
                      {item.step}
                    </span>
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors border border-line ${
                        isHovered
                          ? "bg-brand-gradient text-white border-transparent"
                          : "bg-soft text-indigo-500"
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                  </div>

                  <span className="inline-block mt-4 text-[11px] font-bold uppercase tracking-wider text-mute font-mono">
                    {item.badge}
                  </span>

                  <h3 className="mt-1 text-xl font-bold text-ink">
                    {item.title}
                  </h3>
                  <p className="text-xs font-semibold text-indigo-400 mt-0.5">
                    {item.subtitle}
                  </p>

                  <p className="mt-3.5 text-sm text-mute leading-relaxed">
                    {item.description}
                  </p>

                  <ul className="mt-4 space-y-2 border-t border-line pt-3">
                    {item.bullets.map((bullet, idx) => (
                      <li
                        key={idx}
                        className="flex items-start gap-2 text-xs text-mute"
                      >
                        <Check className="w-3.5 h-3.5 text-indigo-500 shrink-0 mt-0.5" />
                        <span>{bullet}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Step interactive visual mock preview */}
                <div className="mt-6 pt-4 border-t border-line">
                  <div className="rounded-xl bg-soft border border-line p-3.5 text-left">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[11px] font-bold text-ink">
                        {item.cardVisual.title}
                      </span>
                      <span className="text-[10px] font-semibold text-indigo-400 bg-card px-1.5 py-0.5 rounded border border-line">
                        Example
                      </span>
                    </div>
                    <div className="text-[11px] font-medium text-mute truncate">
                      {item.cardVisual.field1}
                    </div>
                    <div className="text-[11px] text-mute/80 truncate mt-0.5">
                      {item.cardVisual.field2}
                    </div>
                    <div className="mt-2 flex items-center justify-between gap-1 text-[10px]">
                      <span className="font-semibold text-indigo-400 bg-card px-2 py-0.5 rounded border border-line truncate">
                        {item.cardVisual.statusBadge}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Process Flow Banner */}
        <div className="mt-12 rounded-2xl bg-gradient-to-r from-indigo-950 via-indigo-900 to-blue-900 text-white p-6 sm:p-8 shadow-xl border border-indigo-500/20 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-white/10 backdrop-blur-sm flex items-center justify-center text-white shrink-0 border border-white/10">
              <ShieldCheck className="w-6 h-6 text-indigo-300" />
            </div>
            <div>
              <h4 className="text-base sm:text-lg font-bold text-white">
                Transparent Resolution Lifecycle
              </h4>
              <p className="text-xs sm:text-sm text-indigo-200 mt-0.5">
                Every ticket is timestamped, visible on the student dashboard, and tracked until resolution.
              </p>
            </div>
          </div>

          <Link
            href="/login?next=/issues/new"
            className="shrink-0 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold bg-white text-indigo-950 hover:bg-indigo-50 transition-colors shadow-md"
          >
            <span>See How Easy It Is to Report</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
