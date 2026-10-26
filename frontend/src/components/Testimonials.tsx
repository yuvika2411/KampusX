"use client";

import {
  Star,
  Sparkles,
} from "lucide-react";

export default function Testimonials() {
  const testimonials = [
    {
      name: "Ananya S.",
      role: "B.Tech CSE • Student Perspective",
      badge: "Sample Student Scenario",
      avatar: "AS",
      quote:
        "When laboratory or library Wi-Fi slows down during project submissions, posting with the specific floor and wing helps batchmates upvote the issue, bringing clear visibility to the IT support queue.",
      metric: "Simulated Fast-Track Review",
    },
    {
      name: "Kartik V.",
      role: "Hostel Resident • Aryabhatta Block B",
      badge: "Sample Hostel Scenario",
      avatar: "KV",
      quote:
        "Moving past handwritten hostel complaint registers means maintenance tickets are logged directly with location tags and photos, giving caretakers clarity on which tools and parts to bring.",
      metric: "Direct Maintenance Dispatch",
    },
    {
      name: "Campus Estate Desk",
      role: "Maintenance & Civil Works Unit",
      badge: "Sample Staff Workflow",
      avatar: "ED",
      quote:
        "Having clear building coordinates, attached pictures of damaged fixtures, and community interest counts allows repair technicians to prioritize critical campus infrastructure smoothly.",
      metric: "Targeted Work Orders",
    },
    {
      name: "Student Welfare Team",
      role: "Student Body Coordination",
      badge: "Sample Council Scenario",
      avatar: "SW",
      quote:
        "The upvoting mechanism consolidates duplicate complaints across entire batches into one prominent issue ticket, enabling transparent communication between students and facility administrators.",
      metric: "Consolidated Feedback",
    },
  ];

  return (
    <section className="py-20 md:py-28 bg-page border-t border-line">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-soft text-indigo-500 border border-line">
            <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
            Sample User Scenarios (Demo Preview)
          </span>
          <h2 className="mt-4 text-3xl sm:text-4xl font-extrabold text-ink tracking-tight">
            Illustrative Campus Scenarios
          </h2>
          <p className="mt-4 text-base sm:text-lg text-mute leading-relaxed">
            Sample user experiences demonstrating how KampusX is designed to connect students,
            hostellers, and facility staff through transparent issue tracking.
          </p>
        </div>

        {/* 4 Cards Grid */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
          {testimonials.map((item) => (
            <div
              key={item.name}
              className="rounded-2xl bg-card border border-line p-7 sm:p-8 card-hover flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-xl bg-brand-gradient text-white font-bold text-sm flex items-center justify-center shadow-sm">
                      {item.avatar}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-ink">
                        {item.name}
                      </h4>
                      <p className="text-xs text-mute">{item.role}</p>
                    </div>
                  </div>

                  <span className="text-[11px] font-bold text-mute bg-soft px-2.5 py-1 rounded-full border border-line">
                    {item.badge}
                  </span>
                </div>

                {/* Stars */}
                <div className="flex items-center gap-1 mt-4 text-amber-400">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>

                <p className="mt-4 text-sm text-ink/90 leading-relaxed italic">
                  &ldquo;{item.quote}&rdquo;
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-line flex items-center justify-between text-xs">
                <span className="text-mute">Key Outcome:</span>
                <span className="font-bold text-emerald-500 bg-emerald-500/15 px-2.5 py-1 rounded-md border border-emerald-500/20">
                  {item.metric}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
