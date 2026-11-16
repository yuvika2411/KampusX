"use client";

import {
  GraduationCap,
  Wrench,
  Briefcase,
  Shield,
  Users,
  CheckCircle,
} from "lucide-react";

export default function Testimonials() {
  const roles = [
    {
      role: "Student",
      roleCode: "ROLE_STUDENT",
      tag: "Reporting & Verification",
      icon: GraduationCap,
      color: "text-indigo-500",
      bgColor: "bg-indigo-500/10 border-indigo-500/20",
      description:
        "The primary reporters on campus. Students identify maintenance needs across hostels, labs, and classrooms, mobilize peer backing, and hold authoritative closure confirmation.",
      permissions: [
        "Submit tickets with location, category & photo evidence",
        "Upvote existing issues to elevate community priority",
        "Add comments to ongoing ticket discussions",
        "Confirm resolution to close ticket, or reopen if unresolved",
      ],
    },
    {
      role: "Field Resolver",
      roleCode: "ROLE_RESOLVER",
      tag: "Field Maintenance",
      icon: Wrench,
      color: "text-emerald-500",
      bgColor: "bg-emerald-500/10 border-emerald-500/20",
      description:
        "Technicians and campus repair crews assigned by Category Heads to resolve specific physical and infrastructural issues across campus facilities.",
      permissions: [
        "Access personalized queue of assigned maintenance tasks",
        "Update progress status to IN_PROGRESS upon dispatch",
        "Mark repairs as RESOLVED once field work is completed",
        "Respond to student reopen requests if repairs require follow-up",
      ],
    },
    {
      role: "Category Head",
      roleCode: "ROLE_CATEGORY_HEAD",
      tag: "Departmental Triage",
      icon: Briefcase,
      color: "text-purple-400",
      bgColor: "bg-purple-500/10 border-purple-500/20",
      description:
        "Departmental leads (Hostels, IT Cell, Estate, Labs) overseeing maintenance queues within their service domain and delegating tasks to staff.",
      permissions: [
        "Monitor all incoming tickets categorized in their department",
        "Assign designated field resolvers to specific tickets",
        "Track departmental repair velocity and unresolved bottlenecks",
        "Ensure prompt handover between students and technicians",
      ],
    },
    {
      role: "Administrator",
      roleCode: "ROLE_ADMIN",
      tag: "System Governance",
      icon: Shield,
      color: "text-rose-500",
      bgColor: "bg-rose-500/10 border-rose-500/20",
      description:
        "Institutional leadership and system administrators managing campus-wide infrastructure operations, user roles, and department assignments.",
      permissions: [
        "System-wide analytics across statuses, categories & locations",
        "Manage user permissions (Student, Resolver, Category Head)",
        "Assign and reassign Category Heads to departments",
        "Moderate issues and manage account activation states",
      ],
    },
  ];

  return (
    <section id="roles" className="py-20 md:py-28 bg-page border-t border-line text-ink">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-soft text-indigo-500 border border-line">
            <Users className="w-3.5 h-3.5 text-indigo-500" />
            Role-Based Campus Collaboration
          </span>
          <h2 className="mt-4 text-3xl sm:text-4xl font-extrabold text-ink tracking-tight">
            Who Uses KampusX?
          </h2>
          <p className="mt-4 text-base sm:text-lg text-mute leading-relaxed">
            KampusX connects four distinct campus roles into a unified resolution pipeline,
            each backed by strict server-side permissions and workflows.
          </p>
        </div>

        {/* 4 Role Cards Grid */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
          {roles.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.role}
                className="rounded-2xl bg-card border border-line p-7 sm:p-8 card-hover flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-11 h-11 rounded-xl flex items-center justify-center border ${item.bgColor} ${item.color}`}
                      >
                        <Icon className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-base font-bold text-ink">
                          {item.role}
                        </h4>
                        <span className="text-[11px] font-mono text-mute">
                          {item.roleCode}
                        </span>
                      </div>
                    </div>

                    <span className="text-[11px] font-semibold text-mute bg-soft px-2.5 py-1 rounded-full border border-line">
                      {item.tag}
                    </span>
                  </div>

                  <p className="mt-4 text-sm text-mute leading-relaxed">
                    {item.description}
                  </p>

                  <div className="mt-5 pt-4 border-t border-line">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-mute block mb-2.5">
                      Key Capabilities:
                    </span>
                    <ul className="space-y-2">
                      {item.permissions.map((perm, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-xs text-ink/90">
                          <CheckCircle className="w-3.5 h-3.5 text-indigo-500 shrink-0 mt-0.5" />
                          <span>{perm}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
