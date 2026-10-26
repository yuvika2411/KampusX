"use client";

import {
  TrendingUp,
  Clock,
  CheckCircle2,
  Users,
  Award,
} from "lucide-react";

export default function Stats() {
  const metrics = [
    {
      value: "1,000+",
      label: "Projected Annual Issues",
      subtext: "Target capacity across hostels & labs",
      icon: CheckCircle2,
      trend: "Benchmark Target",
      color: "text-emerald-500",
      bgColor: "bg-soft",
    },
    {
      value: "< 48h",
      label: "Target Turnaround",
      subtext: "From reporting to verified resolution",
      icon: Clock,
      trend: "Target SLA",
      color: "text-indigo-500",
      bgColor: "bg-soft",
    },
    {
      value: "90%+",
      label: "Satisfaction Goal",
      subtext: "Target student confirmation rate",
      icon: Award,
      trend: "Target Benchmark",
      color: "text-blue-500",
      bgColor: "bg-soft",
    },
    {
      value: "6,000+",
      label: "Eligible Students & Staff",
      subtext: "B.Tech, MCA, Pharmacy & Faculty",
      icon: Users,
      trend: "Campus Scope",
      color: "text-purple-400",
      bgColor: "bg-soft",
    },
  ];

  const departmentPerformance = [
    {
      dept: "Hostel Wardens & Sanitation",
      covered: "Aryabhatta, Gargi, CV Raman Hostels",
      rate: "95% Target",
      avgTime: "24h Target",
      status: "Sample SLA Target",
    },
    {
      dept: "Campus IT & Network Cell",
      covered: "Library, Computer Labs, Wi-Fi Access Points",
      rate: "92% Target",
      avgTime: "12h Target",
      status: "Sample SLA Target",
    },
    {
      dept: "Estate & Civil Maintenance",
      covered: "Plumbing, Electrical, Classroom Furnishings",
      rate: "90% Target",
      avgTime: "48h Target",
      status: "Sample SLA Target",
    },
    {
      dept: "Academic Lab Coordinators",
      covered: "CSE, IT, ECE, ME, Civil Laboratories",
      rate: "95% Target",
      avgTime: "24h Target",
      status: "Sample SLA Target",
    },
  ];

  return (
    <section id="stats" className="py-20 md:py-28 bg-page border-t border-line">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-soft text-indigo-500 border border-line">
            <TrendingUp className="w-3.5 h-3.5 text-indigo-500" />
            Platform Targets (Demo Data)
          </span>
          <h2 className="mt-4 text-3xl sm:text-4xl font-extrabold text-ink tracking-tight">
            Target Benchmarks & Performance Goals
          </h2>
          <p className="mt-4 text-base sm:text-lg text-mute leading-relaxed">
            The following metrics and department response targets represent demonstration goals
            and design benchmarks prior to live Spring Boot backend integration.
          </p>
        </div>

        {/* 4 Big Metrics Grid */}
        <div className="mt-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {metrics.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.label}
                className="rounded-2xl bg-card border border-line p-6 sm:p-7 card-hover"
              >
                <div className="flex items-center justify-between">
                  <div
                    className={`w-12 h-12 rounded-xl ${item.bgColor} ${item.color} flex items-center justify-center border border-line`}
                  >
                    <Icon className="w-6 h-6" />
                  </div>
                  <span className="text-[11px] font-bold text-mute bg-soft px-2 py-0.5 rounded border border-line">
                    {item.trend}
                  </span>
                </div>

                <div className="mt-6">
                  <div className="text-3xl sm:text-4xl font-black text-ink tracking-tight">
                    {item.value}
                  </div>
                  <div className="text-sm font-bold text-ink mt-1">
                    {item.label}
                  </div>
                  <div className="text-xs text-mute mt-0.5">
                    {item.subtext}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Department SLA & Performance Breakdown */}
        <div className="mt-12 rounded-2xl bg-card border border-line overflow-hidden shadow-xs">
          <div className="p-6 bg-soft border-b border-line flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="text-base font-bold text-ink">
                Department Service Desks — SLA Target Benchmarks (Demo Preview)
              </h3>
              <p className="text-xs text-mute mt-0.5">
                Demonstration targets for ticket routing and resolution across campus units
              </p>
            </div>
            <span className="text-xs font-semibold text-amber-500 bg-amber-500/15 px-2.5 py-1 rounded-full border border-amber-500/30 self-start sm:self-auto">
              Demo Preview
            </span>
          </div>

          <div className="divide-y divide-line">
            {departmentPerformance.map((dept) => (
              <div
                key={dept.dept}
                className="p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-soft/50 transition-colors"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-ink">
                      {dept.dept}
                    </span>
                    <span className="text-[11px] font-semibold text-emerald-500 bg-emerald-500/15 px-2 py-0.5 rounded border border-emerald-500/20">
                      {dept.status}
                    </span>
                  </div>
                  <p className="text-xs text-mute">
                    Jurisdiction: {dept.covered}
                  </p>
                </div>

                <div className="flex items-center gap-6 sm:gap-8 self-end sm:self-auto">
                  <div className="text-right">
                    <span className="text-[11px] font-medium text-mute block uppercase">
                      Resolution Rate
                    </span>
                    <span className="text-sm font-bold text-ink">
                      {dept.rate}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-[11px] font-medium text-mute block uppercase">
                      Avg Response
                    </span>
                    <span className="text-sm font-bold text-indigo-500">
                      {dept.avgTime}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
