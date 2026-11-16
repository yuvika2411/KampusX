"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import {
  ThumbsUp,
  Clock,
  MapPin,
  CheckCircle2,
  AlertCircle,
  Clock3,
  Filter,
  ArrowUpRight,
  Check,
  Info,
} from "lucide-react";
import { AuthSession, getSession } from "@/lib/auth";

interface Issue {
  id: string;
  title: string;
  category: string;
  categoryLabel: string;
  location: string;
  status: "REPORTED" | "ASSIGNED" | "IN_PROGRESS" | "RESOLVED" | "CLOSED" | "REOPENED";
  priority: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  votes: number;
  reportedBy: string;
  timeAgo: string;
  assignedTo: string;
  hasUpvoted?: boolean;
}

const CATEGORY_LABELS: Record<string, string> = {
  HOSTEL: "Hostel",
  MESS: "Mess",
  CAMPUS_WIFI: "Campus Wi-Fi",
  ACADEMIC: "Academic Blocks",
  LAB: "Academic Labs",
  CLASSROOM: "Classrooms",
  WASHROOM: "Washroom",
  PARKING: "Parking",
  MEDICAL_ROOM: "Medical Room",
  LIBRARY: "Central Library",
  SPORTS: "Sports & Gym",
  CAFETERIA: "Cafeteria",
};

const INITIAL_ISSUES: Issue[] = [
  {
    id: "Example Ticket #1",
    title: "Central Library (3rd Floor) — Wi-Fi AP Dropping Connections",
    category: "CAMPUS_WIFI",
    categoryLabel: "Campus Wi-Fi",
    location: "Library",
    status: "IN_PROGRESS",
    priority: "HIGH",
    votes: 48,
    reportedBy: "Student (Example)",
    timeAgo: "Example: 2h ago",
    assignedTo: "Campus IT Resolver",
    hasUpvoted: false,
  },
  {
    id: "Example Ticket #2",
    title: "Aryabhatt Hostel — RO Water Purifier Maintenance",
    category: "HOSTEL",
    categoryLabel: "Hostels",
    location: "Aryabhatt Hostel",
    status: "ASSIGNED",
    priority: "HIGH",
    votes: 35,
    reportedBy: "Student (Example)",
    timeAgo: "Example: 5h ago",
    assignedTo: "Hostel Caretaker Resolver",
    hasUpvoted: false,
  },
  {
    id: "Example Ticket #3",
    title: "HP-Intel AI Skills Lab — Projector Display Calibration",
    category: "LAB",
    categoryLabel: "Academic Labs",
    location: "HP-Intel AI Skills Lab",
    status: "RESOLVED",
    priority: "MEDIUM",
    votes: 24,
    reportedBy: "Student (Example)",
    timeAgo: "Example: Yesterday",
    assignedTo: "Lab Coordinator Resolver",
    hasUpvoted: true,
  },
  {
    id: "Example Ticket #4",
    title: "A Block (Room 201) — Classroom Lighting Relay Check",
    category: "ACADEMIC",
    categoryLabel: "Academic Blocks",
    location: "A Block",
    status: "REPORTED",
    priority: "LOW",
    votes: 16,
    reportedBy: "Student (Example)",
    timeAgo: "Example: 1d ago",
    assignedTo: "Awaiting Resolver Assignment",
    hasUpvoted: false,
  },
];

export default function DashboardMockup() {
  const [issues, setIssues] = useState<Issue[]>(INITIAL_ISSUES);
  const [activeCategory, setActiveCategory] = useState<string>("All");
  const [selectedIssueId, setSelectedIssueId] = useState<string>("Example Ticket #1");
  const [session, setSession] = useState<AuthSession | null>(null);
  const [voteHint, setVoteHint] = useState<string | null>(null);

  useEffect(() => {
    const currentSession = getSession();
    if (currentSession) {
      setSession(currentSession);
    }
  }, []);

  const categories = [
    { key: "All", label: "All Categories" },
    { key: "CAMPUS_WIFI", label: "Campus Wi-Fi" },
    { key: "HOSTEL", label: "Hostels" },
    { key: "LAB", label: "Academic Labs" },
    { key: "ACADEMIC", label: "Academic Blocks" },
  ];

  const handleVote = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setIssues((prev) =>
      prev.map((issue) => {
        if (issue.id === id) {
          if (issue.hasUpvoted) {
            setVoteHint("You have already upvoted this ticket. Note: Real campus upvoting requires signing in with your KIET account.");
            setTimeout(() => setVoteHint(null), 4000);
            return issue;
          }
          setVoteHint("Upvote simulated! Real campus upvoting requires signing in with your KIET account.");
          setTimeout(() => setVoteHint(null), 4000);
          return {
            ...issue,
            hasUpvoted: true,
            votes: issue.votes + 1,
          };
        }
        return issue;
      })
    );
  };

  const filteredIssues =
    activeCategory === "All"
      ? issues
      : issues.filter((issue) => issue.category === activeCategory);

  const selectedIssue = issues.find((i) => i.id === selectedIssueId) || issues[0];

  const getStatusBadge = (status: Issue["status"]) => {
    switch (status) {
      case "REPORTED":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold text-amber-500 bg-amber-500/10 border border-amber-500/30">
            <AlertCircle className="w-3 h-3 text-amber-500" />
            Reported
          </span>
        );
      case "ASSIGNED":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold text-blue-500 bg-blue-500/10 border border-blue-500/30">
            <Clock3 className="w-3 h-3 text-blue-500" />
            Assigned
          </span>
        );
      case "IN_PROGRESS":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold text-indigo-500 bg-indigo-500/15 border border-indigo-500/30">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
            In Progress
          </span>
        );
      case "RESOLVED":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold text-emerald-500 bg-emerald-500/10 border border-emerald-500/30">
            <CheckCircle2 className="w-3 h-3 text-emerald-500" />
            Resolved
          </span>
        );
      case "CLOSED":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold text-mute bg-soft border border-line">
            <Check className="w-3 h-3" />
            Closed
          </span>
        );
      case "REOPENED":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold text-rose-500 bg-rose-500/10 border border-rose-500/30">
            <Clock className="w-3 h-3 text-rose-500" />
            Reopened
          </span>
        );
    }
  };

  const getPriorityBadge = (priority: Issue["priority"]) => {
    switch (priority) {
      case "CRITICAL":
      case "HIGH":
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-rose-500/15 text-rose-500 border border-rose-500/30">
            {priority}
          </span>
        );
      case "MEDIUM":
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-orange-500/15 text-orange-500 border border-orange-500/30">
            Medium
          </span>
        );
      case "LOW":
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-soft text-mute border border-line">
            Low
          </span>
        );
    }
  };

  return (
    <div className="w-full rounded-2xl bg-card border border-line shadow-2xl shadow-indigo-500/20 overflow-hidden text-left transition-all">
      {/* Top Browser/App Header */}
      <div className="bg-soft px-4 py-3 sm:px-6 flex items-center justify-between border-b border-line">
        <div className="flex items-center gap-2">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-rose-500/90" />
            <div className="w-3 h-3 rounded-full bg-amber-500/90" />
            <div className="w-3 h-3 rounded-full bg-emerald-500/90" />
          </div>
          <div className="hidden sm:flex items-center gap-2 ml-4 px-3 py-1 bg-card rounded-lg text-xs font-mono text-mute border border-line">
            <span>Workflow Preview Example</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border text-indigo-500 bg-indigo-500/10 border-indigo-500/20">
            <span className="w-2 h-2 rounded-full bg-indigo-500" />
            Interactive Workflow Example
          </span>
        </div>
      </div>

      {/* Main Dashboard Sub-header */}
      <div className="p-4 sm:p-6 bg-soft/70 border-b border-line">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-ink">
              Campus Issue Feed (Example Workflow)
            </h2>
            <p className="text-xs text-mute mt-0.5">
              Interactive preview demonstrating student reporting, department routing, and community upvoting.
            </p>
          </div>

          {/* Quick Metrics */}
          <div className="flex items-center gap-3 overflow-x-auto pb-1 sm:pb-0">
            <div className="px-3 py-1.5 rounded-xl bg-card border border-line text-center shadow-xs">
              <span className="text-[10px] uppercase font-bold text-mute block">Workflow Stages</span>
              <span className="text-xs font-bold text-indigo-500">6 Real Statuses</span>
            </div>
            <div className="px-3 py-1.5 rounded-xl bg-card border border-line text-center shadow-xs">
              <span className="text-[10px] uppercase font-bold text-mute block">Verification</span>
              <span className="text-xs font-bold text-emerald-500">Student Sign-off</span>
            </div>
            <div className="px-3 py-1.5 rounded-xl bg-card border border-line text-center shadow-xs">
              <span className="text-[10px] uppercase font-bold text-mute block">Campus Desks</span>
              <span className="text-xs font-bold text-ink">12 Real Categories</span>
            </div>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2 mt-4 overflow-x-auto pb-1 pt-1 no-scrollbar">
          <span className="text-xs font-semibold text-mute flex items-center gap-1 pl-1 pr-2">
            <Filter className="w-3.5 h-3.5 text-mute" />
            Category:
          </span>
          {categories.map((cat) => (
            <button
              key={cat.key}
              onClick={() => setActiveCategory(cat.key)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all duration-150 ${
                activeCategory === cat.key
                  ? "bg-brand-gradient text-white shadow-sm shadow-indigo-500/30"
                  : "bg-card text-mute hover:bg-soft hover:text-ink border border-line"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Hint banner for interactive upvote */}
        {voteHint && (
          <div className="mt-3 p-2.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs flex items-center gap-2 animate-in fade-in duration-150">
            <Info size={14} className="shrink-0 text-indigo-500" />
            <span>{voteHint}</span>
          </div>
        )}
      </div>

      {/* Issues Grid / Master-Detail Area */}
      <div className="grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-line bg-card">
        {/* Left: Issues List */}
        <div className="lg:col-span-7 p-4 sm:p-5 space-y-3 max-h-[480px] overflow-y-auto">
          {filteredIssues.map((issue) => {
            const isSelected = issue.id === selectedIssueId;
            return (
              <div
                key={issue.id}
                onClick={() => setSelectedIssueId(issue.id)}
                className={`group p-4 rounded-xl border transition-all duration-200 cursor-pointer ${
                  isSelected
                    ? "bg-soft/80 border-[#818cf8] shadow-sm"
                    : "bg-card hover:bg-soft/40 border-line"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2 mb-1.5">
                      <span className="text-xs font-mono font-bold text-indigo-500">
                        {issue.id}
                      </span>
                      {getStatusBadge(issue.status)}
                      {getPriorityBadge(issue.priority)}
                      <span className="text-[11px] font-medium text-mute">
                        • {issue.timeAgo}
                      </span>
                    </div>

                    <h4 className="text-sm font-semibold text-ink group-hover:text-indigo-400 transition-colors line-clamp-2">
                      {issue.title}
                    </h4>

                    <div className="flex flex-wrap items-center gap-3 mt-2.5 text-xs text-mute">
                      <span className="flex items-center gap-1 font-medium text-ink/80">
                        <MapPin className="w-3.5 h-3.5 text-mute" />
                        {issue.location}
                      </span>
                      <span className="text-line">|</span>
                      <span>By {issue.reportedBy}</span>
                    </div>
                  </div>

                  {/* Upvote Button with Interactive Feedback */}
                  <button
                    onClick={(e) => handleVote(issue.id, e)}
                    className={`flex flex-col items-center justify-center min-w-[54px] px-2.5 py-2 rounded-xl text-xs font-bold transition-all duration-150 border ${
                      issue.hasUpvoted
                        ? "bg-brand-gradient text-white border-transparent shadow-md shadow-indigo-500/25 scale-105"
                        : "bg-soft hover:bg-soft/80 text-ink border-line hover:border-[#818cf8]"
                    }`}
                    title="Click to try upvoting (Preview only)"
                  >
                    <ThumbsUp
                      className={`w-4 h-4 mb-0.5 transition-transform ${
                        issue.hasUpvoted ? "scale-110 fill-white" : "group-hover:scale-110"
                      }`}
                    />
                    <span>{issue.votes}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right: Resolution Timeline & Details for Selected Issue */}
        <div className="lg:col-span-5 p-5 sm:p-6 bg-soft/50 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-line">
              <span className="text-xs font-bold text-mute tracking-wider uppercase">
                Resolution Workflow Lifecycle
              </span>
              <span className="text-xs font-mono font-bold text-indigo-500">
                {selectedIssue.id}
              </span>
            </div>

            <div className="mt-4">
              <h4 className="text-base font-bold text-ink leading-snug">
                {selectedIssue.title}
              </h4>
              <div className="flex items-center gap-2 mt-2">
                <span className="text-xs text-mute">Assigned Resolver:</span>
                <span className="text-xs font-bold text-indigo-500 bg-card px-2 py-0.5 rounded border border-line">
                  {selectedIssue.assignedTo}
                </span>
              </div>
            </div>

            {/* Stepper Timeline based on exact backend statuses */}
            <div className="mt-5 space-y-3.5">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center text-white shrink-0 mt-0.5">
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                </div>
                <div>
                  <div className="text-xs font-bold text-ink">
                    1. REPORTED
                  </div>
                  <div className="text-[11px] text-mute">
                    Student submits issue with campus location, floor/room, and category
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-white shrink-0 mt-0.5 ${
                    selectedIssue.status !== "REPORTED" ? "bg-emerald-500" : "bg-soft border border-line text-mute"
                  }`}
                >
                  {selectedIssue.status !== "REPORTED" ? (
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  ) : (
                    <span className="text-[10px] font-bold text-mute">2</span>
                  )}
                </div>
                <div>
                  <div className="text-xs font-bold text-ink">
                    2. ASSIGNED
                  </div>
                  <div className="text-[11px] text-mute">
                    Category Head reviews queue and assigns designated resolver
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-white shrink-0 mt-0.5 ${
                    selectedIssue.status === "IN_PROGRESS"
                      ? "bg-brand-gradient"
                      : selectedIssue.status === "RESOLVED" || selectedIssue.status === "CLOSED"
                      ? "bg-emerald-500"
                      : "bg-soft border border-line text-mute"
                  }`}
                >
                  {selectedIssue.status === "RESOLVED" || selectedIssue.status === "CLOSED" ? (
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  ) : selectedIssue.status === "IN_PROGRESS" ? (
                    <Clock className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <span className="text-[10px] font-bold text-mute">3</span>
                  )}
                </div>
                <div>
                  <div className="text-xs font-bold text-ink">
                    3. IN_PROGRESS
                  </div>
                  <div className="text-[11px] text-mute">
                    Assigned resolver begins active maintenance repair on-site
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 ${
                    selectedIssue.status === "RESOLVED" || selectedIssue.status === "CLOSED"
                      ? "bg-emerald-500 text-white"
                      : "bg-soft border border-line text-mute"
                  }`}
                >
                  {selectedIssue.status === "RESOLVED" || selectedIssue.status === "CLOSED" ? (
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  ) : (
                    <span>4</span>
                  )}
                </div>
                <div>
                  <div className="text-xs font-bold text-ink">
                    4. RESOLVED & CONFIRMATION
                  </div>
                  <div className="text-[11px] text-mute">
                    Resolver marks resolved; original student confirms closure or reopens
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Action in Card */}
          <div className="mt-6 pt-4 border-t border-line flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <span className="text-xs text-mute">
              Interactive Example:{" "}
              <strong className="text-indigo-500 font-semibold">Try Upvoting above!</strong>
            </span>
            {session ? (
              session.role?.toUpperCase() === "STUDENT" ? (
                <Link
                  href="/dashboard"
                  className="inline-flex items-center gap-1 text-xs font-bold text-indigo-500 hover:text-indigo-400"
                >
                  Report a Campus Issue
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </Link>
              ) : (
                <Link
                  href="/dashboard"
                  className="inline-flex items-center gap-1 text-xs font-bold text-indigo-500 hover:text-indigo-400"
                >
                  Go to Resolution Dashboard
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </Link>
              )
            ) : (
              <Link
                href="/login?next=/dashboard"
                className="inline-flex items-center gap-1 text-xs font-bold text-indigo-500 hover:text-indigo-400"
              >
                Sign in to Report an Issue
                <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
