"use client";

import Link from "next/link";

import { useState } from "react";
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
} from "lucide-react";

interface Issue {
  id: string;
  title: string;
  category: "Hostels" | "Academic Labs" | "Wi-Fi & IT" | "Estate & Maintenance";
  location: string;
  status: "In Progress" | "Scheduled" | "Resolved" | "Under Review";
  priority: "Urgent" | "High" | "Normal";
  votes: number;
  reportedBy: string;
  timeAgo: string;
  assignedTo: string;
  hasUpvoted?: boolean;
}

const INITIAL_ISSUES: Issue[] = [
  {
    id: "KX-1048",
    title: "Central Library (3rd Floor) — Wi-Fi AP Dropping Connections During Peak Hours",
    category: "Wi-Fi & IT",
    location: "Library East Wing, 3rd Floor",
    status: "In Progress",
    priority: "Urgent",
    votes: 186,
    reportedBy: "Aarav S. (CSE-3rd Yr)",
    timeAgo: "2 hours ago",
    assignedTo: "Campus IT Network Cell",
    hasUpvoted: false,
  },
  {
    id: "KX-1042",
    title: "Aryabhatta Hostel Block B — 2nd Floor RO Water Purifier Filter Service Needed",
    category: "Hostels",
    location: "Aryabhatta Hostel, Block B",
    status: "Scheduled",
    priority: "High",
    votes: 142,
    reportedBy: "Dev P. (ECE-2nd Yr)",
    timeAgo: "5 hours ago",
    assignedTo: "Estate & Sanitation Desk",
    hasUpvoted: false,
  },
  {
    id: "KX-1037",
    title: "Academic Block A (Lab 402) — Projector Lamp Replaced & Tested for Seminars",
    category: "Academic Labs",
    location: "Block A, Room 402",
    status: "Resolved",
    priority: "High",
    votes: 94,
    reportedBy: "Neha K. (IT-4th Yr)",
    timeAgo: "Yesterday",
    assignedTo: "Audio-Visual Maintenance",
    hasUpvoted: true,
  },
  {
    id: "KX-1031",
    title: "Sports Complex — Basketball Court Floodlights 3 & 4 Power Relay Repair",
    category: "Estate & Maintenance",
    location: "Outdoor Sports Arena",
    status: "Under Review",
    priority: "Normal",
    votes: 78,
    reportedBy: "Rohit M. (ME-3rd Yr)",
    timeAgo: "1 day ago",
    assignedTo: "Electrical Works Unit",
    hasUpvoted: false,
  },
];

export default function DashboardMockup() {
  const [issues, setIssues] = useState<Issue[]>(INITIAL_ISSUES);
  const [activeCategory, setActiveCategory] = useState<string>("All");
  const [selectedIssueId, setSelectedIssueId] = useState<string>("KX-1048");

  const categories = ["All", "Hostels", "Academic Labs", "Wi-Fi & IT", "Estate & Maintenance"];

  const handleVote = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setIssues((prev) =>
      prev.map((issue) => {
        if (issue.id === id) {
          const isUpvoted = !!issue.hasUpvoted;
          return {
            ...issue,
            hasUpvoted: !isUpvoted,
            votes: isUpvoted ? issue.votes - 1 : issue.votes + 1,
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
      case "In Progress":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold text-indigo-600 bg-indigo-500/15 border border-indigo-500/30">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
            In Progress
          </span>
        );
      case "Scheduled":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold text-indigo-600 bg-indigo-500/15 border border-indigo-500/30">
            <Clock3 className="w-3 h-3 text-indigo-500" />
            Scheduled
          </span>
        );
      case "Resolved":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold text-emerald-600 bg-emerald-500/15 border border-emerald-500/30">
            <CheckCircle2 className="w-3 h-3 text-emerald-500" />
            Resolved
          </span>
        );
      case "Under Review":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold text-amber-600 bg-amber-500/15 border border-amber-500/30">
            <AlertCircle className="w-3 h-3 text-amber-500" />
            Under Review
          </span>
        );
    }
  };

  const getPriorityBadge = (priority: Issue["priority"]) => {
    switch (priority) {
      case "Urgent":
        return (
          <span className="px-2 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider bg-rose-500/15 text-rose-500 border border-rose-500/30">
            Urgent
          </span>
        );
      case "High":
        return (
          <span className="px-2 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider bg-orange-500/15 text-orange-500 border border-orange-500/30">
            High
          </span>
        );
      case "Normal":
        return (
          <span className="px-2 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider bg-soft text-mute border border-line">
            Normal
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
            <span className="opacity-60">https://</span>
            <span>kampusx.kiet.edu/demo-feed</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium text-amber-600 bg-amber-500/15 border border-amber-500/30">
            <span className="w-2 h-2 rounded-full bg-amber-500" />
            Demo Preview (Sample Data)
          </span>
          <span className="text-xs text-mute hidden sm:inline">
            Backend Integration Pending
          </span>
        </div>
      </div>

      {/* Main Dashboard Sub-header */}
      <div className="p-4 sm:p-6 bg-soft/70 border-b border-line">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-ink">
                Campus Issue Feed (Demo Preview)
              </h2>
              <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-soft text-indigo-500 border border-line">
                4 Sample Issues (Demo Data)
              </span>
            </div>
            <p className="text-xs text-mute mt-0.5">
              Sample campus issue stream demonstrating upcoming workflow before backend connection
            </p>
          </div>

          {/* Quick Metrics (Demo Targets) */}
          <div className="flex items-center gap-3 overflow-x-auto pb-1 sm:pb-0">
            <div className="px-3 py-1.5 rounded-xl bg-card border border-line text-center shadow-xs">
              <span className="text-[10px] uppercase font-bold text-mute block">Avg Response (Target)</span>
              <span className="text-xs font-bold text-indigo-500">4-12 Hours</span>
            </div>
            <div className="px-3 py-1.5 rounded-xl bg-card border border-line text-center shadow-xs">
              <span className="text-[10px] uppercase font-bold text-mute block">Sample Loaded</span>
              <span className="text-xs font-bold text-emerald-500">4 Issues</span>
            </div>
            <div className="px-3 py-1.5 rounded-xl bg-card border border-line text-center shadow-xs">
              <span className="text-[10px] uppercase font-bold text-mute block">Campus Desks</span>
              <span className="text-xs font-bold text-ink">4 Mapped</span>
            </div>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2 mt-4 overflow-x-auto pb-1 pt-1 no-scrollbar">
          <span className="text-xs font-semibold text-mute flex items-center gap-1 pl-1 pr-2">
            <Filter className="w-3.5 h-3.5 text-mute" />
            Filter:
          </span>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all duration-150 ${
                activeCategory === cat
                  ? "bg-brand-gradient text-white shadow-sm shadow-indigo-500/30"
                  : "bg-card text-mute hover:bg-soft hover:text-ink border border-line"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
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
                    title="Click to support/upvote this issue"
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

        {/* Right: Live Resolution Timeline & Details for Selected Issue (Sidebar) */}
        <div className="lg:col-span-5 p-5 sm:p-6 bg-soft/50 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-line">
              <span className="text-xs font-bold text-mute tracking-wider uppercase">
                Sample Resolution Workflow
              </span>
              <span className="text-xs font-mono font-bold text-indigo-500">
                Ticket {selectedIssue.id}
              </span>
            </div>

            <div className="mt-4">
              <h4 className="text-base font-bold text-ink leading-snug">
                {selectedIssue.title}
              </h4>
              <div className="flex items-center gap-2 mt-2">
                <span className="text-xs text-mute">Assigned Department:</span>
                <span className="text-xs font-bold text-indigo-500 bg-card px-2 py-0.5 rounded border border-line">
                  {selectedIssue.assignedTo}
                </span>
              </div>
            </div>

            {/* Stepper Timeline */}
            <div className="mt-5 space-y-3.5">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center text-white shrink-0 mt-0.5">
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                </div>
                <div>
                  <div className="text-xs font-bold text-ink">
                    Issue Submitted & Categorized
                  </div>
                  <div className="text-[11px] text-mute">
                    Logged with photos and location details
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center text-white shrink-0 mt-0.5">
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                </div>
                <div>
                  <div className="text-xs font-bold text-ink">
                    Community Verification Milestone
                  </div>
                  <div className="text-[11px] text-mute">
                    {selectedIssue.votes}+ student upvotes recorded in preview
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-white shrink-0 mt-0.5 ${
                    selectedIssue.status === "In Progress" || selectedIssue.status === "Resolved"
                      ? "bg-brand-gradient"
                      : "bg-amber-500"
                  }`}
                >
                  {selectedIssue.status === "Resolved" ? (
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  ) : (
                    <Clock className="w-3.5 h-3.5 animate-spin" />
                  )}
                </div>
                <div>
                  <div className="text-xs font-bold text-ink">
                    Work Order Dispatched to Field Crew
                  </div>
                  <div className="text-[11px] text-mute">
                    Assigned to {selectedIssue.assignedTo}
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 ${
                    selectedIssue.status === "Resolved"
                      ? "bg-emerald-500 text-white"
                      : "bg-line text-mute"
                  }`}
                >
                  {selectedIssue.status === "Resolved" ? (
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  ) : (
                    "4"
                  )}
                </div>
                <div>
                  <div className="text-xs font-bold text-ink">
                    Fix Verification & Student Sign-off
                  </div>
                  <div className="text-[11px] text-mute">
                    {selectedIssue.status === "Resolved"
                      ? "Confirmed resolved with photo proof"
                      : "Awaiting technician completion log"}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Action in Card */}
          <div className="mt-6 pt-4 border-t border-line flex items-center justify-between">
            <span className="text-xs text-mute">
              Interactive Preview:{" "}
              <strong className="text-indigo-500 font-semibold">Try Upvoting!</strong>
            </span>
            <Link
              href="/login?next=/issues/new"
              className="inline-flex items-center gap-1 text-xs font-bold text-indigo-500 hover:text-indigo-400"
            >
              Report a Similar Issue
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
