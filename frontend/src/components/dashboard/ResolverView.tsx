"use client";

import { useEffect, useState } from "react";
import {
  Wrench,
  CheckCircle2,
  MapPin,
  Play,
  Check,
  Loader2,
  Filter,
} from "lucide-react";
import { api, IssueResponse, IssueStatus } from "@/lib/api";
import { AuthSession } from "@/lib/auth";

interface ResolverViewProps {
  user: AuthSession;
}

export default function ResolverView({ user }: ResolverViewProps) {
  const [issues, setIssues] = useState<IssueResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>("ALL");
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const [actionMessage, setActionMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const loadData = () => {
    setLoading(true);
    api.issues
      .getAssignedIssues()
      .then((res) => {
        setIssues(res || []);
      })
      .catch((err) => {
        setActionMessage({
          type: "error",
          text: err instanceof Error ? err.message : "Failed to load assigned tasks",
        });
        setIssues([]);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    let isMounted = true;
    api.issues
      .getAssignedIssues()
      .then((res) => {
        if (isMounted) setIssues(res || []);
      })
      .catch((err) => {
        if (isMounted) {
          setActionMessage({
            type: "error",
            text: err instanceof Error ? err.message : "Failed to load assigned tasks",
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

  const handleUpdateStatus = async (issueId: number, nextStatus: IssueStatus) => {
    setUpdatingId(issueId);
    setActionMessage(null);
    try {
      await api.issues.updateStatus(issueId, nextStatus);
      setActionMessage({
        type: "success",
        text: `Work order KX-${issueId} updated to ${nextStatus}`,
      });
      loadData();
    } catch (err: unknown) {
      setActionMessage({
        type: "error",
        text: err instanceof Error ? err.message : "Failed to update work order status",
      });
    } finally {
      setUpdatingId(null);
    }
  };

  const assignedCount = issues.filter((i) => i.status === "ASSIGNED").length;
  const inProgressCount = issues.filter((i) => i.status === "IN_PROGRESS").length;
  const priorityCount = issues.filter(
    (i) => i.priority === "HIGH" || i.priority === "CRITICAL"
  ).length;

  const filteredIssues = issues.filter((i) => {
    if (filterStatus === "ALL") return true;
    if (filterStatus === "ASSIGNED") return i.status === "ASSIGNED";
    if (filterStatus === "IN_PROGRESS") return i.status === "IN_PROGRESS";
    if (filterStatus === "RESOLVED") return i.status === "RESOLVED" || i.status === "CLOSED";
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Top Greeting */}
      <div className="p-5 sm:p-6 rounded-2xl bg-card border border-line shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black text-ink tracking-tight">
              Maintenance Field Queue
            </h1>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
              {user.name || "Field Resolver"}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-mute mt-1">
            Track your assigned work orders, initiate repair tasks, and submit completion updates.
          </p>
        </div>

        <button
          onClick={loadData}
          className="px-4 py-2 rounded-xl text-xs font-semibold text-ink bg-soft hover:bg-card border border-line transition-colors self-start sm:self-auto"
        >
          Refresh Tasks
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
            Assigned Work Orders
          </span>
          <span className="text-2xl sm:text-3xl font-black text-ink mt-1 block">
            {issues.length}
          </span>
          <span className="text-[11px] text-mute mt-0.5 block">Total assigned to you</span>
        </div>

        <div className="p-4 rounded-2xl bg-card border border-line shadow-xs">
          <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-mute block">
            Awaiting Start
          </span>
          <span className="text-2xl sm:text-3xl font-black text-blue-500 mt-1 block">
            {assignedCount}
          </span>
          <span className="text-[11px] text-mute mt-0.5 block">Ready to initiate work</span>
        </div>

        <div className="p-4 rounded-2xl bg-card border border-line shadow-xs">
          <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-mute block">
            In Progress
          </span>
          <span className="text-2xl sm:text-3xl font-black text-indigo-500 mt-1 block">
            {inProgressCount}
          </span>
          <span className="text-[11px] text-mute mt-0.5 block">Currently active tasks</span>
        </div>

        <div className="p-4 rounded-2xl bg-card border border-line shadow-xs">
          <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-mute block">
            High Priority
          </span>
          <span className="text-2xl sm:text-3xl font-black text-rose-500 mt-1 block">
            {priorityCount}
          </span>
          <span className="text-[11px] text-mute mt-0.5 block">Urgent or high impact</span>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex items-center justify-between gap-3 p-4 rounded-2xl bg-card border border-line">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
          <span className="text-xs font-semibold text-mute flex items-center gap-1 pl-1">
            <Filter size={13} />
            Filter Tasks:
          </span>
          {["ALL", "ASSIGNED", "IN_PROGRESS", "RESOLVED"].map((statusKey) => (
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
                ? "All Tasks"
                : statusKey === "ASSIGNED"
                ? "Pending Start"
                : statusKey === "IN_PROGRESS"
                ? "In Progress"
                : "Completed"}
            </button>
          ))}
        </div>

        <span className="text-xs font-semibold text-mute hidden sm:inline">
          Showing {filteredIssues.length} tasks
        </span>
      </div>

      {/* Assigned Tasks List */}
      <div className="space-y-3">
        {loading ? (
          <div className="py-16 text-center text-mute flex flex-col items-center justify-center gap-2">
            <Loader2 className="w-7 h-7 animate-spin text-emerald-500" />
            <span className="text-xs">Loading work orders…</span>
          </div>
        ) : filteredIssues.length === 0 ? (
          <div className="p-12 rounded-2xl bg-card border border-line text-center text-mute">
            <Wrench className="w-8 h-8 mx-auto mb-2 opacity-30 text-emerald-500" />
            <p className="text-sm font-semibold text-ink">No assigned work orders</p>
            <p className="text-xs mt-1">Check back later or refresh when tasks are dispatched.</p>
          </div>
        ) : (
          filteredIssues.map((issue) => (
            <div
              key={issue.id}
              className="p-5 rounded-2xl bg-card border border-line shadow-xs hover:border-emerald-500/40 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              <div className="flex-1 space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-mono font-bold text-emerald-500">
                    KX-{issue.id}
                  </span>
                  <span
                    className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                      issue.status === "ASSIGNED"
                        ? "text-blue-500 bg-blue-500/10 border border-blue-500/30"
                        : issue.status === "IN_PROGRESS"
                        ? "text-indigo-500 bg-indigo-500/10 border border-indigo-500/30"
                        : "text-emerald-500 bg-emerald-500/10 border border-emerald-500/30"
                    }`}
                  >
                    {issue.status === "IN_PROGRESS" && (
                      <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
                    )}
                    {issue.status}
                  </span>
                  <span className="text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-rose-500/10 text-rose-500 border border-rose-500/20">
                    {issue.priority} Priority
                  </span>
                  <span className="text-xs font-semibold text-mute">
                    • {issue.categoryName || "General Maintenance"}
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
                </div>
              </div>

              {/* Status Action Buttons for Resolver */}
              <div className="shrink-0 flex items-center gap-2 pt-3 md:pt-0 border-t md:border-t-0 border-line">
                {issue.status === "ASSIGNED" && (
                  <button
                    onClick={() => handleUpdateStatus(issue.id, "IN_PROGRESS")}
                    disabled={updatingId === issue.id}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 flex items-center gap-1.5 shadow-xs disabled:opacity-50"
                  >
                    {updatingId === issue.id ? (
                      <Loader2 size={13} className="animate-spin" />
                    ) : (
                      <Play size={13} />
                    )}
                    <span>Start Work</span>
                  </button>
                )}

                {issue.status === "IN_PROGRESS" && (
                  <button
                    onClick={() => handleUpdateStatus(issue.id, "RESOLVED")}
                    disabled={updatingId === issue.id}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 flex items-center gap-1.5 shadow-xs disabled:opacity-50"
                  >
                    {updatingId === issue.id ? (
                      <Loader2 size={13} className="animate-spin" />
                    ) : (
                      <Check size={13} />
                    )}
                    <span>Mark Resolved</span>
                  </button>
                )}

                {(issue.status === "RESOLVED" || issue.status === "CLOSED") && (
                  <span className="text-xs font-semibold text-emerald-500 flex items-center gap-1">
                    <CheckCircle2 size={14} />
                    <span>Completed</span>
                  </span>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
