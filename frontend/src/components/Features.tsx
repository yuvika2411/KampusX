"use client";

import {
  ThumbsUp,
  Activity,
  ShieldCheck,
  Camera,
  Sparkles,
  Cpu,
  CheckCircle,
  Bell,
  TrendingUp,
} from "lucide-react";

export default function Features() {
  const mainFeatures = [
    {
      icon: Camera,
      tag: "Pillar 01",
      title: "Structured Issue Reporting",
      description:
        "Report campus maintenance issues with clarity. Select campus building locations, choose a department category, describe the issue, and attach photo evidence using your verified institutional account.",
      benefits: [
        "Select campus building locations (Aryabhatt, Gargi, Academic Blocks, Labs)",
        "Attach photo evidence directly with your report",
        "Verified @kiet.edu student accounts prevent spam",
      ],
      previewSnippet: {
        badge: "Example: Ticket #12",
        detail: "Projector display calibration in HP-Intel AI Skills Lab",
        status: "Category: LAB",
      },
      gradient: "from-blue-600 to-indigo-600",
    },
    {
      icon: ThumbsUp,
      tag: "Pillar 02",
      title: "Community Upvoting & Discussion",
      description:
        "Peers and hostel residents upvote common concerns and leave comments to highlight urgency on department queues and avoid duplicate tickets.",
      benefits: [
        "Crowdsourced upvotes elevate priority in Category Head triage",
        "Student comments provide real-time updates and helpful context",
        "Reduces duplicate tickets for the same facility issue",
      ],
      previewSnippet: {
        badge: "Example: Aryabhatt Hostel",
        detail: "35 students upvoted RO water purifier servicing",
        status: "Community Supported",
      },
      gradient: "from-indigo-600 to-violet-600",
    },
    {
      icon: Activity,
      tag: "Pillar 03",
      title: "Transparent Lifecycle Tracking",
      description:
        "Clear visibility on ticket lifecycles following backend statuses: REPORTED → ASSIGNED → IN_PROGRESS → RESOLVED.",
      benefits: [
        "Standardized status progression from report to fix",
        "Category Head assigns designated Resolver to ticket",
        "In-app notifications when ticket status updates",
      ],
      previewSnippet: {
        badge: "Example: Status Tracker",
        detail: "Designated resolver assigned by Category Head",
        status: "Status: IN_PROGRESS",
      },
      gradient: "from-violet-600 to-purple-600",
    },
    {
      icon: ShieldCheck,
      tag: "Pillar 04",
      title: "Student Confirmation & Reopen Flow",
      description:
        "Once a resolver marks work as RESOLVED, the original student reporter confirms resolution by closing the ticket—or reopens it if the fix is incomplete.",
      benefits: [
        "Student reporter holds authoritative closure confirmation",
        "One-click Reopen Ticket action if maintenance was unsatisfactory",
        "Full status audit trail preserved in database",
      ],
      previewSnippet: {
        badge: "Example: Verification Flow",
        detail: "Resolver marked maintenance complete",
        status: "Awaiting Student Sign-off",
      },
      gradient: "from-indigo-600 to-cyan-600",
    },
  ];

  const secondaryHighlights = [
    {
      icon: Cpu,
      title: "Departmental Categorization",
      desc: "Issues are categorized by service domain—Hostels, IT Cell, Estate Office, or Academic Labs—to streamline routing.",
    },
    {
      icon: Bell,
      title: "In-App Status Notifications",
      desc: "Receive real-time dashboard notifications when maintenance staff or wardens update your ticket.",
    },
    {
      icon: TrendingUp,
      title: "Accountability Analytics",
      desc: "Resolution metrics offer transparency across departments to help monitor maintenance performance over time.",
    },
  ];

  return (
    <section id="features" className="py-20 md:py-28 bg-page border-t border-line text-ink">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-soft text-indigo-500 border border-line">
            <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
            Core Capabilities
          </span>
          <h2 className="mt-4 text-3xl sm:text-4xl font-extrabold text-ink tracking-tight">
            Engineered for Transparency, Speed, and Community Impact
          </h2>
          <p className="mt-4 text-base sm:text-lg text-mute leading-relaxed">
            KampusX replaces slow manual complaint registers with a digital resolution
            engine built specifically around the daily needs of KIET campus life.
          </p>
        </div>

        {/* 4 Primary Feature Cards */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-2 gap-8">
          {mainFeatures.map((feature) => {
            const Icon = feature.icon;
            return (
              <div
                key={feature.title}
                className="group relative rounded-2xl bg-card border border-line card-hover p-7 sm:p-8 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <div
                      className={`w-12 h-12 rounded-xl bg-gradient-to-tr ${feature.gradient} flex items-center justify-center text-white shadow-md shadow-indigo-500/20 group-hover:scale-105 transition-transform`}
                    >
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="text-xs font-mono font-bold uppercase tracking-wider text-mute group-hover:text-indigo-400 transition-colors">
                      {feature.tag}
                    </span>
                  </div>

                  <h3 className="mt-6 text-xl font-bold text-ink group-hover:text-indigo-400 transition-colors">
                    {feature.title}
                  </h3>

                  <p className="mt-3 text-sm text-mute leading-relaxed">
                    {feature.description}
                  </p>

                  {/* Bullet points */}
                  <ul className="mt-5 space-y-2.5">
                    {feature.benefits.map((benefit, i) => (
                      <li key={i} className="flex items-start gap-2.5 text-xs text-ink/90 font-medium">
                        <CheckCircle className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
                        <span>{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Micro Visual Card Snippet */}
                <div className="mt-7 pt-4 border-t border-line">
                  <div className="bg-soft rounded-xl p-3.5 border border-line shadow-xs flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-500 bg-card px-2 py-0.5 rounded border border-line">
                        {feature.previewSnippet.badge}
                      </span>
                      <p className="text-xs font-semibold text-ink mt-1 truncate">
                        {feature.previewSnippet.detail}
                      </p>
                    </div>
                    <span className="text-[11px] font-medium text-emerald-600 whitespace-nowrap bg-emerald-500/15 px-2 py-1 rounded-md border border-emerald-500/30">
                      {feature.previewSnippet.status}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* 3 Secondary Highlights */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 pt-6">
          {secondaryHighlights.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.title}
                className="p-6 rounded-2xl bg-card border border-line card-hover flex items-start gap-4"
              >
                <div className="w-10 h-10 rounded-xl bg-soft flex items-center justify-center text-indigo-500 shrink-0 border border-line">
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-base font-bold text-ink">
                    {item.title}
                  </h4>
                  <p className="text-xs text-mute mt-1.5 leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
