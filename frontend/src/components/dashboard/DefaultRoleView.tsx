"use client";

import { useEffect, useState } from "react";
import {
  Search,
  MapPin,
  ThumbsUp,
  Loader2,
  Globe,
} from "lucide-react";
import { api, IssueResponse } from "@/lib/api";
import { AuthSession } from "@/lib/auth";
import RoleBadge, { formatRoleName } from "./RoleBadge";

interface DefaultRoleViewProps {
  user: AuthSession;
}

export default function DefaultRoleView({ user }: DefaultRoleViewProps) {
  const [issues, setIssues] = useState<IssueResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("ALL");

  useEffect(() => {
    let isMounted = true;
    api.issues
      .getAllIssues()
      .then((res) => {
        if (isMounted) setIssues(res || []);
      })
      .catch(() => {
        if (isMounted) setIssues([]);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const filteredIssues = issues.filter((i) => {
    const matchesSearch =
      i.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      i.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      i.categoryName?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === "ALL" || i.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Top Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-card border border-line p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="flex items-center gap-2.5">
              <RoleBadge role={user.role} size="md" />
              <span className="text-xs text-mute font-medium">Assigned via Backend</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-ink tracking-tight">
              Welcome, {user.name || "KampusX Member"}
            </h1>
            <p className="text-sm text-mute max-w-2xl leading-relaxed">
              You are signed in as an authenticated <strong className="text-ink">{formatRoleName(user.role)}</strong> ({user.email}).
              Explore campus issues, track live resolution updates, and participate across KIET campus departments.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-soft border border-line text-xs space-y-1 self-start md:self-auto min-w-[220px]">
            <div className="text-mute font-medium">Session Identity</div>
            <div className="font-bold text-ink">{user.name}</div>
            <div className="text-[11px] font-mono text-mute">{user.email}</div>
            <div className="text-[10px] text-mute pt-1">User ID: #{user.id}</div>
          </div>
        </div>
      </div>

      {/* Campus Feed Section */}
      <div className="p-6 rounded-3xl bg-card border border-line shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Globe size={18} className="text-indigo-500" />
              <h3 className="text-base font-bold text-ink">Campus Community Issue Feed</h3>
            </div>
            <p className="text-xs text-mute mt-0.5">
              Live campus issue submissions, community upvotes, and resolution statuses.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <div className="relative">
              <Search size={14} className="absolute left-3 top-2.5 text-mute" />
              <input
                type="text"
                placeholder="Search issues..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 pr-3 py-1.5 rounded-xl text-xs bg-soft border border-line text-ink placeholder:text-mute focus:outline-none focus:ring-2 focus:ring-[#818cf8]"
              />
            </div>

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-1.5 rounded-xl text-xs bg-soft border border-line text-ink font-medium focus:outline-none focus:ring-2 focus:ring-[#818cf8]"
            >
              <option value="ALL">All Statuses</option>
              <option value="REPORTED">Reported</option>
              <option value="ASSIGNED">Assigned</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="RESOLVED">Resolved</option>
              <option value="CLOSED">Closed</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="py-16 flex flex-col items-center justify-center gap-2 text-mute">
            <Loader2 size={24} className="animate-spin text-indigo-500" />
            <span className="text-xs font-medium">Loading campus issues...</span>
          </div>
        ) : filteredIssues.length === 0 ? (
          <div className="py-12 text-center text-mute text-xs">
            No campus issues found matching your filters.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredIssues.map((issue) => (
              <div
                key={issue.id}
                className="p-5 rounded-2xl bg-card border border-line hover:border-indigo-500/30 transition-all flex flex-col justify-between space-y-3"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="font-mono text-[10px] text-mute">#{issue.id}</span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                        issue.status === "RESOLVED" || issue.status === "CLOSED"
                          ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20"
                          : issue.status === "IN_PROGRESS"
                          ? "bg-blue-500/10 text-blue-500 border border-blue-500/20"
                          : "bg-amber-500/10 text-amber-500 border border-amber-500/20"
                      }`}
                    >
                      {issue.status}
                    </span>
                  </div>

                  <h4 className="text-sm font-bold text-ink">{issue.title}</h4>
                  <p className="text-xs text-mute mt-1 line-clamp-2 leading-relaxed">
                    {issue.description}
                  </p>
                </div>

                <div className="pt-3 border-t border-line flex items-center justify-between text-[11px] text-mute">
                  <span className="font-semibold text-ink">{issue.categoryName || "General"}</span>
                  <div className="flex items-center gap-3">
                    {issue.locationName && (
                      <span className="flex items-center gap-1">
                        <MapPin size={11} />
                        {issue.locationName}
                      </span>
                    )}
                    <span className="flex items-center gap-1">
                      <ThumbsUp size={11} />
                      {issue.voteCount || 0}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
