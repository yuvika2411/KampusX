"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
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
  RotateCcw,
  Calendar,
  RefreshCw,
  ShieldAlert,
  Layers,
  X,
} from "lucide-react";
import Combobox, { ComboboxOption } from "@/components/ui/Combobox";
import {
  api,
  IssueResponse,
  IssueStatus,
  IssuePriority,
  CategoryResponse,
  ResolverResponse,
} from "@/lib/api";
import { AuthSession } from "@/lib/auth";

interface CategoryHeadViewProps {
  user: AuthSession;
}

function formatIssueDate(isoString?: string | null): string | null {
  if (!isoString) return null;
  try {
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return null;
    return new Intl.DateTimeFormat("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(d);
  } catch {
    return null;
  }
}

export default function CategoryHeadView({ user }: CategoryHeadViewProps) {
  // Data state
  const [issues, setIssues] = useState<IssueResponse[]>([]);
  const [categories, setCategories] = useState<CategoryResponse[]>([]);
  const [resolvers, setResolvers] = useState<ResolverResponse[]>([]);

  // Loading & error states
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [resolversLoading, setResolversLoading] = useState(false);

  // Filters & actions
  const [filterStatus, setFilterStatus] = useState<string>("ALL");
  const [assigningIssueId, setAssigningIssueId] = useState<number | null>(null);
  const [selectedResolverId, setSelectedResolverId] = useState<number | "">("");
  const [submittingAssign, setSubmittingAssign] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);
  const [actionMessage, setActionMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  // Handle 401 redirect helper
  const handleAuthRedirect = useCallback((err: unknown) => {
    const msg = err instanceof Error ? err.message : String(err);
    if (
      msg.includes("401") ||
      msg.toLowerCase().includes("authentication required") ||
      msg.toLowerCase().includes("unauthorized")
    ) {
      if (
        typeof window !== "undefined" &&
        !window.location.pathname.startsWith("/login")
      ) {
        window.location.assign(
          window.location.origin + "/login?next=/dashboard",
        );
      }
      return true;
    }
    return false;
  }, []);

  // Fetch all required data for the department view
  const loadData = useCallback(() => {
    setLoading(true);
    setError(null);

    Promise.all([
      api.categories.getAll(),
      api.issues.getCategoryHeadIssues(),
      api.users.getResolvers().catch(() => [] as ResolverResponse[]),
    ])
      .then(([cats, catIssues, resolverList]) => {
        setCategories(cats || []);
        setIssues(catIssues || []);
        setResolvers(resolverList || []);
      })
      .catch((err) => {
        if (!handleAuthRedirect(err)) {
          const message =
            err instanceof Error
              ? err.message
              : "Failed to load department data";
          setError(message);
        }
      })
      .finally(() => {
        setLoading(false);
      });
  }, [handleAuthRedirect]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Lazy-load or refresh resolvers when modal opens
  const openAssignModal = (issueId: number) => {
    setAssigningIssueId(issueId);
    setSelectedResolverId("");
    setModalError(null);

    if (resolvers.length === 0) {
      setResolversLoading(true);
      api.users
        .getResolvers()
        .then((res) => setResolvers(res || []))
        .catch((err) => {
          if (!handleAuthRedirect(err)) {
            setModalError(
              err instanceof Error
                ? err.message
                : "Failed to load available resolvers",
            );
          }
        })
        .finally(() => setResolversLoading(false));
    }
  };

  const closeAssignModal = () => {
    setAssigningIssueId(null);
    setSelectedResolverId("");
    setModalError(null);
  };

  // Find categories managed by current category head
  const managedCategories = useMemo(() => {
    return categories.filter(
      (c) =>
        c.categoryHeadId !== undefined &&
        c.categoryHeadId !== null &&
        Number(c.categoryHeadId) === Number(user.id),
    );
  }, [categories, user.id]);

  // Options for the resolver Combobox
  const resolverOptions: ComboboxOption[] = useMemo(() => {
    return resolvers.map((r) => ({
      value: r.id,
      label: r.name,
      subLabel: r.email,
    }));
  }, [resolvers]);

  // Handle assignment submission
  const handleAssignResolver = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!assigningIssueId || !selectedResolverId) return;

    setSubmittingAssign(true);
    setModalError(null);

    try {
      await api.issues.assignResolver(
        assigningIssueId,
        Number(selectedResolverId),
      );
      const chosenResolver = resolvers.find(
        (r) => r.id === Number(selectedResolverId),
      );
      const resolverName = chosenResolver
        ? chosenResolver.name
        : `#${selectedResolverId}`;

      setActionMessage({
        type: "success",
        text: `Successfully assigned ${resolverName} to Ticket KX-${assigningIssueId}`,
      });
      closeAssignModal();
      loadData();
    } catch (err: unknown) {
      if (!handleAuthRedirect(err)) {
        const rawMsg =
          err instanceof Error ? err.message : "Failed to assign resolver";
        let friendlyMsg = rawMsg;
        if (
          rawMsg.includes("403") ||
          rawMsg.toLowerCase().includes("access denied") ||
          rawMsg.toLowerCase().includes("cannot assign")
        ) {
          friendlyMsg =
            "Access Denied (403): You can only assign resolvers to tickets in your assigned department.";
        } else if (
          rawMsg.includes("404") ||
          rawMsg.toLowerCase().includes("not found")
        ) {
          friendlyMsg =
            "Not Found (404): The selected ticket or resolver was not found.";
        } else if (
          rawMsg.includes("400") ||
          rawMsg.toLowerCase().includes("bad request") ||
          rawMsg.toLowerCase().includes("inactive") ||
          rawMsg.toLowerCase().includes("not a resolver")
        ) {
          friendlyMsg = `Invalid Request (400): ${rawMsg}`;
        }
        setModalError(friendlyMsg);
      }
    } finally {
      setSubmittingAssign(false);
    }
  };

  // Metrics counts (REOPENED tickets are counted in "Needs resolver")
  const unassignedCount = issues.filter(
    (i) => i.status === "REPORTED" || i.status === "REOPENED",
  ).length;
  const inProgressCount = issues.filter(
    (i) => i.status === "IN_PROGRESS" || i.status === "ASSIGNED",
  ).length;
  const resolvedCount = issues.filter(
    (i) => i.status === "RESOLVED" || i.status === "CLOSED",
  ).length;

  // Filtered issues list
  const filteredIssues = useMemo(() => {
    return issues.filter((i) => {
      if (filterStatus === "ALL") return true;
      if (filterStatus === "UNASSIGNED")
        return i.status === "REPORTED" || i.status === "REOPENED";
      if (filterStatus === "IN_PROGRESS")
        return i.status === "IN_PROGRESS" || i.status === "ASSIGNED";
      if (filterStatus === "RESOLVED")
        return i.status === "RESOLVED" || i.status === "CLOSED";
      return true;
    });
  }, [issues, filterStatus]);

  // Status Badge UI
  const getStatusBadge = (status: IssueStatus) => {
    switch (status) {
      case "REPORTED":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold text-amber-500 bg-amber-500/10 border border-amber-500/30">
            <AlertCircle size={12} />
            Needs Resolver
          </span>
        );
      case "REOPENED":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold text-rose-500 bg-rose-500/10 border border-rose-500/30">
            <RotateCcw size={12} />
            Reopened
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

  // Priority Badge UI (Neutral for LOW, Amber for MEDIUM, Orange for HIGH, Red/Rose for CRITICAL)
  const getPriorityBadge = (priority: IssuePriority) => {
    switch (priority) {
      case "LOW":
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider bg-zinc-500/10 text-zinc-600 dark:text-zinc-400 border border-zinc-500/20">
            Low Priority
          </span>
        );
      case "MEDIUM":
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30">
            Medium Priority
          </span>
        );
      case "HIGH":
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider bg-orange-500/10 text-orange-600 dark:text-orange-400 border border-orange-500/30">
            High Priority
          </span>
        );
      case "CRITICAL":
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/30">
            Critical Priority
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider bg-soft text-mute border border-line">
            {priority}
          </span>
        );
    }
  };

  const targetAssigningIssue = useMemo(() => {
    return issues.find((i) => i.id === assigningIssueId);
  }, [issues, assigningIssueId]);

  return (
    <div className="space-y-6">
      {/* 1. TOP GREETING & DEPARTMENT HEADER */}
      <div className="p-5 sm:p-6 rounded-2xl bg-card border border-line shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black text-ink tracking-tight">
              Welcome back, {user.name || "Category Head"}!
            </h1>

            {/* Department Category Chips */}
            {managedCategories.length > 0 ? (
              <div className="flex flex-wrap items-center gap-1.5">
                {managedCategories.map((cat) => (
                  <span
                    key={cat.id}
                    className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-indigo-500/10 text-indigo-500 border border-indigo-500/25"
                  >
                    <Layers size={11} />
                    {cat.name}
                  </span>
                ))}
              </div>
            ) : (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-amber-500/10 text-amber-500 border border-amber-500/25">
                <ShieldAlert size={11} />
                No Department Assigned
              </span>
            )}
          </div>

          <p className="text-xs sm:text-sm text-mute mt-1.5">
            Review incoming maintenance tickets for your category and assign a
            resolver.
          </p>
        </div>

        <button
          onClick={loadData}
          disabled={loading}
          className="px-4 py-2 rounded-xl text-xs font-semibold text-ink bg-soft hover:bg-card border border-line transition-colors self-start sm:self-auto flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
        >
          <RefreshCw size={13} className={loading ? "animate-spin" : ""} />
          <span>Refresh Queue</span>
        </button>
      </div>

      {/* ACTION BANNER MESSAGE */}
      {actionMessage && (
        <div
          className={`p-4 rounded-xl border text-xs flex items-center justify-between ${
            actionMessage.type === "success"
              ? "border-emerald-500/25 bg-emerald-500/5 text-emerald-600 dark:text-emerald-400"
              : "border-rose-500/25 bg-rose-500/5 text-rose-600 dark:text-rose-400"
          }`}
        >
          <span>{actionMessage.text}</span>
          <button
            onClick={() => setActionMessage(null)}
            className="underline text-[11px] cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* 2. METRICS ROW */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 rounded-2xl bg-card border border-line shadow-xs">
          <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-mute block">
            Category Queue
          </span>
          <span className="text-2xl sm:text-3xl font-black text-ink mt-1 block">
            {issues.length}
          </span>
          <span className="text-[11px] text-mute mt-0.5 block">
            Total logged in department
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-card border border-line shadow-xs">
          <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-mute block">
            Needs Resolver
          </span>
          <span className="text-2xl sm:text-3xl font-black text-amber-500 mt-1 block">
            {unassignedCount}
          </span>
          <span className="text-[11px] text-mute mt-0.5 block">
            Waiting for a resolver
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-card border border-line shadow-xs">
          <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-mute block">
            Under Resolution
          </span>
          <span className="text-2xl sm:text-3xl font-black text-indigo-500 mt-1 block">
            {inProgressCount}
          </span>
          <span className="text-[11px] text-mute mt-0.5 block">
            Active work in progress
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-card border border-line shadow-xs">
          <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-mute block">
            Resolved / Fixed
          </span>
          <span className="text-2xl sm:text-3xl font-black text-emerald-500 mt-1 block">
            {resolvedCount}
          </span>
          <span className="text-[11px] text-mute mt-0.5 block">
            Successfully resolved
          </span>
        </div>
      </div>

      {/* 3. QUEUE FILTER BAR */}
      <div className="flex items-center justify-between gap-3 p-4 rounded-2xl bg-card border border-line shadow-xs">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
          <span className="text-xs font-semibold text-mute flex items-center gap-1 pl-1">
            <Filter size={13} />
            Filter Queue:
          </span>
          {[
            { key: "ALL", label: "All Tickets" },
            { key: "UNASSIGNED", label: "Needs Resolver" },
            { key: "IN_PROGRESS", label: "In Progress" },
            { key: "RESOLVED", label: "Resolved" },
          ].map((item) => (
            <button
              key={item.key}
              onClick={() => setFilterStatus(item.key)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                filterStatus === item.key
                  ? "bg-brand-gradient text-white shadow-xs"
                  : "bg-soft text-mute hover:text-ink"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        <span className="text-xs font-semibold text-mute hidden sm:inline">
          Showing {filteredIssues.length} tickets
        </span>
      </div>

      {/* 4. MAIN CONTENT AREA (Distinct States) */}
      <div className="space-y-3">
        {/* STATE A: LOADING */}
        {loading ? (
          <div className="py-20 text-center text-mute flex flex-col items-center justify-center gap-3 rounded-2xl bg-card border border-line">
            <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
            <span className="text-sm font-medium text-ink">
              Loading department queue…
            </span>
            <span className="text-xs text-mute">
              Synchronizing category maintenance tickets
            </span>
          </div>
        ) : error ? (
          /* STATE B: ERROR WITH RETRY */
          <div className="p-8 sm:p-10 rounded-2xl bg-card border border-rose-500/30 text-center space-y-3 shadow-xs">
            <AlertCircle className="w-10 h-10 mx-auto text-rose-500" />
            <h3 className="text-base font-bold text-ink">
              Failed to load department queue
            </h3>
            <p className="text-xs text-mute max-w-md mx-auto leading-relaxed">
              {error}
            </p>
            <div className="pt-2">
              <button
                onClick={loadData}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-brand-gradient hover:opacity-95 shadow-xs inline-flex items-center gap-1.5 cursor-pointer"
              >
                <RefreshCw size={13} />
                <span>Retry</span>
              </button>
            </div>
          </div>
        ) : managedCategories.length === 0 ? (
          /* STATE C: NO CATEGORY ASSIGNED (Separate state, never "queue is clear") */
          <div className="p-8 sm:p-12 rounded-2xl bg-card border border-amber-500/30 text-center space-y-3 shadow-xs">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center mx-auto">
              <ShieldAlert size={26} />
            </div>
            <h3 className="text-base font-bold text-ink">
              No category assigned. Ask an administrator.
            </h3>
            <p className="text-xs text-mute max-w-lg mx-auto leading-relaxed">
              Your account holds the Category Head role, but an administrator
              has not yet linked you to a campus department. You will see
              incoming maintenance tickets as soon as an administrator links
              your profile to a category in the Admin Categories tab.
            </p>
          </div>
        ) : filteredIssues.length === 0 ? (
          /* STATE D: GENUINELY EMPTY QUEUE */
          <div className="p-12 rounded-2xl bg-card border border-line text-center text-mute shadow-xs">
            <Inbox className="w-10 h-10 mx-auto mb-2 opacity-30 text-indigo-500" />
            <p className="text-sm font-semibold text-ink">
              {filterStatus === "ALL"
                ? "Department queue is clear"
                : "No tickets matching this filter"}
            </p>
            <p className="text-xs mt-1">
              {filterStatus === "ALL"
                ? "All maintenance tickets logged under your department have been resolved or closed."
                : "Try selecting a different filter above to review other tickets."}
            </p>
          </div>
        ) : (
          /* STATE E: TICKETS QUEUE */
          filteredIssues.map((issue) => {
            const createdDateStr = formatIssueDate(issue.createdAt);
            const isAssignable =
              issue.status === "REPORTED" ||
              issue.status === "REOPENED" ||
              issue.status === "ASSIGNED" ||
              issue.status === "IN_PROGRESS";
            const isReassign =
              issue.status === "ASSIGNED" || issue.status === "IN_PROGRESS";

            return (
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
                    {getPriorityBadge(issue.priority)}
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
                        {issue.floorRoom && ` (${issue.floorRoom})`}
                      </span>
                    )}

                    {createdDateStr && (
                      <span className="flex items-center gap-1 font-medium text-mute">
                        <Calendar size={12} />
                        {createdDateStr}
                      </span>
                    )}

                    <span>
                      Reporter: {issue.reporterName || "Campus Student"}
                    </span>

                    <span className="flex items-center gap-1 font-semibold text-indigo-500">
                      <ThumbsUp size={11} />
                      {issue.voteCount || 0} student votes
                    </span>
                  </div>
                </div>

                {/* Assignment Action Column */}
                <div className="shrink-0 flex flex-col items-start md:items-end gap-2 pt-3 md:pt-0 border-t md:border-t-0 border-line">
                  {isAssignable ? (
                    <button
                      onClick={() => openAssignModal(issue.id)}
                      className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-brand-gradient hover:opacity-95 shadow-xs flex items-center gap-1.5 cursor-pointer"
                    >
                      <UserCheck size={14} />
                      <span>
                        {isReassign ? "Reassign Resolver" : "Assign Resolver"}
                      </span>
                    </button>
                  ) : (
                    <span className="text-xs font-semibold text-emerald-500 flex items-center gap-1">
                      <CheckCircle2 size={13} />
                      Resolution Complete
                    </span>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* 5. ASSIGN RESOLVER MODAL (With Combobox Searchable Dropdown) */}
      {assigningIssueId && (
        <div
          className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150"
          onClick={closeAssignModal}
        >
          <div
            className="relative w-full max-w-md rounded-2xl bg-card border border-line shadow-2xl p-6 text-ink space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="text-base font-bold text-ink">
                  {targetAssigningIssue?.status === "ASSIGNED" ||
                  targetAssigningIssue?.status === "IN_PROGRESS"
                    ? "Reassign Resolver"
                    : "Assign Resolver"}
                </h3>
                <p className="text-xs text-mute mt-0.5">
                  Assign an authorized resolver to Ticket KX-{assigningIssueId}.
                </p>
              </div>

              <button
                type="button"
                onClick={closeAssignModal}
                className="text-mute hover:text-ink p-1 rounded-lg hover:bg-soft transition-colors cursor-pointer"
                aria-label="Close modal"
              >
                <X size={18} />
              </button>
            </div>

            {/* Error in Modal */}
            {modalError && (
              <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs flex items-start gap-2.5">
                <AlertCircle size={15} className="shrink-0 mt-0.5" />
                <span className="leading-relaxed font-medium">
                  {modalError}
                </span>
              </div>
            )}

            {/* Empty Resolvers Notice */}
            {resolvers.length === 0 && !resolversLoading && (
              <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400 text-xs flex items-start gap-2.5">
                <AlertCircle size={15} className="shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <p className="font-semibold">No active resolvers available</p>
                  <p className="text-[11px] opacity-90 leading-relaxed">
                    There are currently no active users with the Resolver role.
                    Ask a system administrator to register or activate resolvers
                    in the Admin dashboard.
                  </p>
                </div>
              </div>
            )}

            <form onSubmit={handleAssignResolver} className="space-y-4">
              <div>
                <label
                  htmlFor="resolver-select"
                  className="block text-xs font-bold text-ink mb-1.5"
                >
                  Select Resolver <span className="text-rose-500">*</span>
                </label>

                <Combobox
                  id="resolver-select"
                  value={selectedResolverId}
                  onChange={(val) => {
                    setSelectedResolverId(val ? Number(val) : "");
                    setModalError(null);
                  }}
                  options={resolverOptions}
                  placeholder="Search and select resolver…"
                  searchPlaceholder="Search by name or email…"
                  emptyText="No active resolvers found"
                  disabled={resolversLoading || resolvers.length === 0}
                  loading={resolversLoading}
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={closeAssignModal}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-mute hover:text-ink bg-soft border border-line transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={
                    submittingAssign ||
                    !selectedResolverId ||
                    resolvers.length === 0
                  }
                  className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-brand-gradient hover:opacity-95 shadow-xs flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
                >
                  {submittingAssign ? (
                    <>
                      <Loader2 size={13} className="animate-spin" />
                      <span>Assigning…</span>
                    </>
                  ) : (
                    <>
                      <UserCheck size={13} />
                      <span>
                        {targetAssigningIssue?.status === "ASSIGNED" ||
                        targetAssigningIssue?.status === "IN_PROGRESS"
                          ? "Confirm Reassignment"
                          : "Confirm Assignment"}
                      </span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
