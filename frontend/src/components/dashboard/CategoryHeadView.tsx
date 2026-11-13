"use client";

import { useEffect, useState } from "react";
import {
  Inbox,
  UserCheck,
  CheckCircle2,
  AlertCircle,
  Clock3,
  MapPin,
  ThumbsUp,
  Loader2,
  Filter,
  Check,
} from "lucide-react";
import { api, IssueResponse, IssueStatus } from "@/lib/api";
import { AuthSession } from "@/lib/auth";

interface CategoryHeadViewProps {
  user: AuthSession;
}

export default function CategoryHeadView({ user }: CategoryHeadViewProps) {
  const [issues, setIssues] = useState<IssueResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>("ALL");
  const [assigningIssueId, setAssigningIssueId] = useState<number | null>(null);
  const [resolverInputId, setResolverInputId] = useState<string>("");
  const [submittingAssign, setSubmittingAssign] = useState(false);
  const [actionMessage, setActionMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const loadData = () => {
    setLoading(true);
    api.issues
      .getCategoryHeadIssues()
      .then((res) => {
        setIssues(res || []);
      })
      .catch((err) => {
        setActionMessage({
          type: "error",
          text: err instanceof Error ? err.message : "Failed to load category issues",
        });
        setIssues([]);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    let isMounted = true;
    api.issues
      .getCategoryHeadIssues()
      .then((res) => {
        if (isMounted) setIssues(res || []);
      })
      .catch((err) => {
        if (isMounted) {
          setActionMessage({
            type: "error",
            text: err instanceof Error ? err.message : "Failed to load category issues",
          });
          setIssues([]);
        }
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const handleAssignResolver = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!assigningIssueId || !resolverInputId.trim()) return;

    setSubmittingAssign(true);
    setActionMessage(null);

    try {
      await api.issues.assignResolver(assigningIssueId, Number(resolverInputId.trim()));
      setActionMessage({
        type: "success",
        text: `Successfully assigned Resolver #${resolverInputId} to Ticket KX-${assigningIssueId}`,
      });
      setAssigningIssueId(null);
      setResolverInputId("");
      loadData();
    } catch (err: unknown) {
      setActionMessage({
        type: "error",
        text: err instanceof Error ? err.message : "Failed to assign resolver. Ensure the user ID is an active Resolver.",
      });
    } finally {
      setSubmittingAssign(false);
    }
  };

  const unassignedCount = issues.filter((i) => i.status === "REPORTED").length;
  const inProgressCount = issues.filter(
    (i) => i.status === "IN_PROGRESS" || i.status === "ASSIGNED"
  ).length;
  const resolvedCount = issues.filter(
    (i) => i.status === "RESOLVED" || i.status === "CLOSED"
  ).length;

  const filteredIssues = issues.filter((i) => {
    if (filterStatus === "ALL") return true;
    if (filterStatus === "UNASSIGNED") return i.status === "REPORTED";
    if (filterStatus === "IN_PROGRESS") return i.status === "IN_PROGRESS" || i.status === "ASSIGNED";
    if (filterStatus === "RESOLVED") return i.status === "RESOLVED" || i.status === "CLOSED";
    return true;
  });

  const getStatusBadge = (status: IssueStatus) => {
    switch (status) {
      case "REPORTED":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold text-amber-500 bg-amber-500/10 border border-amber-500/30">
            <AlertCircle size={12} />
            Unassigned
          </span>
        );
      case "ASSIGNED":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold text-blue-500 bg-blue-500/10 border border-blue-500/30">
            <Clock3 size={12} />
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
            <CheckCircle2 size={12} />
            Resolved
          </span>
        );
      case "CLOSED":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold text-mute bg-soft border border-line">
            <Check size={12} />
            Closed
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-soft text-ink border border-line">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Greeting */}
      <div className="p-5 sm:p-6 rounded-2xl bg-card border border-line shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black text-ink tracking-tight">
              Department Operations Center
            </h1>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-purple-500/10 text-purple-400 border border-purple-500/20">
              {user.name || "Category Head"}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-mute mt-1">
            Review incoming maintenance tickets for your category and dispatch technicians to field work orders.
          </p>
        </div>

        <button
          onClick={loadData}
          className="px-4 py-2 rounded-xl text-xs font-semibold text-ink bg-soft hover:bg-card border border-line transition-colors self-start sm:self-auto"
        >
          Refresh Queue
        </button>
      </div>

      {actionMessage && (
        <div
          className={`p-4 rounded-xl border text-xs flex items-center justify-between ${
            actionMessage.type === "success"
              ? "border-emerald-500/25 bg-emerald-500/5 text-emerald-600 dark:text-emerald-400"
              : "border-rose-500/25 bg-rose-500/5 text-rose-600 dark:text-rose-400"
          }`}
        >
          <span>{actionMessage.text}</span>
          <button onClick={() => setActionMessage(null)} className="underline text-[11px]">
            Dismiss
          </button>
        </div>
      )}

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 rounded-2xl bg-card border border-line shadow-xs">
          <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-mute block">
            Category Queue
          </span>
          <span className="text-2xl sm:text-3xl font-black text-ink mt-1 block">
            {issues.length}
          </span>
          <span className="text-[11px] text-mute mt-0.5 block">Total logged in department</span>
        </div>

        <div className="p-4 rounded-2xl bg-card border border-line shadow-xs">
          <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-mute block">
            Needs Resolver
          </span>
          <span className="text-2xl sm:text-3xl font-black text-amber-500 mt-1 block">
            {unassignedCount}
          </span>
          <span className="text-[11px] text-mute mt-0.5 block">Awaiting crew dispatch</span>
        </div>

        <div className="p-4 rounded-2xl bg-card border border-line shadow-xs">
          <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-mute block">
            Under Resolution
          </span>
          <span className="text-2xl sm:text-3xl font-black text-indigo-500 mt-1 block">
            {inProgressCount}
          </span>
          <span className="text-[11px] text-mute mt-0.5 block">Active work in progress</span>
        </div>

        <div className="p-4 rounded-2xl bg-card border border-line shadow-xs">
          <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-mute block">
            Resolved / Fixed
          </span>
          <span className="text-2xl sm:text-3xl font-black text-emerald-500 mt-1 block">
            {resolvedCount}
          </span>
          <span className="text-[11px] text-mute mt-0.5 block">Successfully resolved</span>
        </div>
      </div>

      {/* Queue Filter */}
      <div className="flex items-center justify-between gap-3 p-4 rounded-2xl bg-card border border-line">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
          <span className="text-xs font-semibold text-mute flex items-center gap-1 pl-1">
            <Filter size={13} />
            Filter Queue:
          </span>
          {["ALL", "UNASSIGNED", "IN_PROGRESS", "RESOLVED"].map((statusKey) => (
            <button
              key={statusKey}
              onClick={() => setFilterStatus(statusKey)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                filterStatus === statusKey
                  ? "bg-brand-gradient text-white shadow-xs"
                  : "bg-soft text-mute hover:text-ink"
              }`}
            >
              {statusKey === "ALL"
                ? "All Tickets"
                : statusKey === "UNASSIGNED"
                ? "Unassigned"
                : statusKey === "IN_PROGRESS"
                ? "In Progress"
                : "Resolved"}
            </button>
          ))}
        </div>

        <span className="text-xs font-semibold text-mute hidden sm:inline">
          Showing {filteredIssues.length} tickets
        </span>
      </div>

      {/* Issues Queue List */}
      <div className="space-y-3">
        {loading ? (
          <div className="py-16 text-center text-mute flex flex-col items-center justify-center gap-2">
            <Loader2 className="w-7 h-7 animate-spin text-indigo-500" />
            <span className="text-xs">Loading department work queue…</span>
          </div>
        ) : filteredIssues.length === 0 ? (
          <div className="p-12 rounded-2xl bg-card border border-line text-center text-mute">
            <Inbox className="w-8 h-8 mx-auto mb-2 opacity-30 text-indigo-500" />
            <p className="text-sm font-semibold text-ink">No tickets matching this filter</p>
            <p className="text-xs mt-1">Your department queue is completely clear!</p>
          </div>
        ) : (
          filteredIssues.map((issue) => (
            <div
              key={issue.id}
              className="p-5 rounded-2xl bg-card border border-line shadow-xs hover:border-[#818cf8] transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              <div className="flex-1 space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-mono font-bold text-indigo-500">
                    KX-{issue.id}
                  </span>
                  {getStatusBadge(issue.status)}
                  <span className="text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-rose-500/10 text-rose-500 border border-rose-500/20">
                    {issue.priority} Priority
                  </span>
                  <span className="text-xs font-semibold text-mute">
                    • {issue.categoryName || "Department Ticket"}
                  </span>
                </div>

                <h3 className="text-sm font-bold text-ink">{issue.title}</h3>
                <p className="text-xs text-mute leading-relaxed line-clamp-2">
                  {issue.description}
                </p>

                <div className="flex flex-wrap items-center gap-3 pt-2 text-[11px] text-mute border-t border-line">
                  {issue.locationName && (
                    <span className="flex items-center gap-1 font-medium text-ink/80">
                      <MapPin size={12} />
                      {issue.locationName}
                    </span>
                  )}
                  <span>Reporter: {issue.reporterName || "Campus Student"}</span>
                  <span>•</span>
                  <span className="flex items-center gap-1 font-semibold text-indigo-500">
                    <ThumbsUp size={11} />
                    {issue.voteCount || 0} student votes
                  </span>
                </div>
              </div>

              {/* Assignment Action Column */}
              <div className="shrink-0 flex flex-col items-start md:items-end gap-2 pt-3 md:pt-0 border-t md:border-t-0 border-line">
                {issue.status !== "RESOLVED" && issue.status !== "CLOSED" ? (
                  <button
                    onClick={() => {
                      setAssigningIssueId(issue.id);
                      setResolverInputId("");
                    }}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-brand-gradient hover:opacity-95 shadow-xs flex items-center gap-1.5"
                  >
                    <UserCheck size={14} />
                    <span>Assign Field Resolver</span>
                  </button>
                ) : (
                  <span className="text-xs font-semibold text-emerald-500 flex items-center gap-1">
                    <CheckCircle2 size={13} />
                    Resolution Complete
                  </span>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Assign Resolver Modal */}
      {assigningIssueId && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="relative w-full max-w-md rounded-2xl bg-card border border-line shadow-2xl p-6 text-ink animate-in fade-in zoom-in-95 duration-150">
            <h3 className="text-base font-bold text-ink">Dispatch Resolver</h3>
            <p className="text-xs text-mute mt-1">
              Assign an authorized technician / maintenance resolver to Ticket KX-{assigningIssueId}.
            </p>

            <form onSubmit={handleAssignResolver} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-bold text-ink mb-1.5">
                  Resolver User ID <span className="text-rose-500">*</span>
                </label>
                <input
                  type="number"
                  required
                  placeholder="e.g. 2 (Resolver User ID)"
                  value={resolverInputId}
                  onChange={(e) => setResolverInputId(e.target.value)}
                  className="w-full rounded-xl border border-line bg-soft px-3.5 py-2 text-xs font-medium text-ink placeholder:text-mute focus:outline-none focus:ring-2 focus:ring-[#818cf8]"
                />
                <span className="text-[11px] text-mute mt-1 block">
                  The user must have the backend RESOLVER role.
                </span>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setAssigningIssueId(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-mute hover:text-ink bg-soft border border-line transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingAssign}
                  className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-brand-gradient hover:opacity-95 shadow-xs flex items-center gap-1.5 disabled:opacity-50"
                >
                  {submittingAssign ? (
                    <Loader2 size={13} className="animate-spin" />
                  ) : (
                    <UserCheck size={13} />
                  )}
                  <span>Confirm Assignment</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
