"use client";

import { useEffect, useState } from "react";
import {
  PlusCircle,
  ThumbsUp,
  MapPin,
  CheckCircle2,
  AlertCircle,
  Clock3,
  Search,
  Filter,
  Check,
  RotateCcw,
  Sparkles,
  Loader2,
  FolderOpen,
} from "lucide-react";
import { api, IssueResponse, CategoryResponse, IssueStatus, IssuePriority } from "@/lib/api";
import { AuthSession } from "@/lib/auth";

interface StudentViewProps {
  user: AuthSession;
  initialTab?: "my" | "feed" | "report";
}

export default function StudentView({ user, initialTab = "my" }: StudentViewProps) {
  const [activeTab, setActiveTab] = useState<"my" | "feed" | "report">(initialTab);
  const [myIssues, setMyIssues] = useState<IssueResponse[]>([]);
  const [allIssues, setAllIssues] = useState<IssueResponse[]>([]);
  const [categories, setCategories] = useState<CategoryResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");

  // Form states for creating an issue
  const [formTitle, setFormTitle] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formCategoryId, setFormCategoryId] = useState<number | "">("");
  const [formLocation, setFormLocation] = useState("");
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [formError, setFormError] = useState("");
  const [formSuccess, setFormSuccess] = useState("");
  const [actionError, setActionError] = useState("");

  const loadData = () => {
    setLoading(true);
    setActionError("");
    Promise.allSettled([
      api.issues.getMyIssues(),
      api.issues.getAllIssues(),
      api.categories.getAll(),
    ]).then(([myRes, allRes, catRes]) => {
      if (myRes.status === "fulfilled") setMyIssues(myRes.value || []);
      if (allRes.status === "fulfilled") setAllIssues(allRes.value || []);
      if (catRes.status === "fulfilled") setCategories(catRes.value || []);
      setLoading(false);
    });
  };

  useEffect(() => {
    let isMounted = true;
    Promise.allSettled([
      api.issues.getMyIssues(),
      api.issues.getAllIssues(),
      api.categories.getAll(),
    ]).then(([myRes, allRes, catRes]) => {
      if (!isMounted) return;
      if (myRes.status === "fulfilled") setMyIssues(myRes.value || []);
      if (allRes.status === "fulfilled") setAllIssues(allRes.value || []);
      if (catRes.status === "fulfilled") setCategories(catRes.value || []);
      setLoading(false);
    });
    return () => {
      isMounted = false;
    };
  }, []);

  const handleVote = async (issueId: number) => {
    try {
      await api.issues.vote(issueId);
      // Refresh feed
      const refreshed = await api.issues.getAllIssues();
      setAllIssues(refreshed);
    } catch (e: unknown) {
      setActionError(e instanceof Error ? e.message : "Failed to record vote");
    }
  };

  const handleCloseIssue = async (issueId: number) => {
    try {
      await api.issues.closeIssue(issueId);
      loadData();
    } catch (e: unknown) {
      setActionError(e instanceof Error ? e.message : "Failed to close issue");
    }
  };

  const handleReopenIssue = async (issueId: number) => {
    try {
      await api.issues.reopenIssue(issueId);
      loadData();
    } catch (e: unknown) {
      setActionError(e instanceof Error ? e.message : "Failed to reopen issue");
    }
  };

  const handleCreateIssue = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) {
      setFormError("Issue title is required");
      return;
    }
    if (!formDescription.trim()) {
      setFormError("Issue description is required");
      return;
    }
    if (!formCategoryId) {
      setFormError("Please select a category");
      return;
    }

    setFormSubmitting(true);
    setFormError("");
    setFormSuccess("");

    try {
      await api.issues.createIssue({
        title: formTitle.trim(),
        description: formDescription.trim(),
        categoryId: Number(formCategoryId),
        locationId: 1, // Default campus zone id if location endpoint is unset
      });

      setFormSuccess("Issue submitted successfully! Your campus desk has been notified.");
      setFormTitle("");
      setFormDescription("");
      setFormCategoryId("");
      setFormLocation("");
      loadData();
      setTimeout(() => {
        setActiveTab("my");
        setFormSuccess("");
      }, 1500);
    } catch (err: unknown) {
      setFormError(err instanceof Error ? err.message : "Failed to create issue. Please try again.");
    } finally {
      setFormSubmitting(false);
    }
  };

  const filteredFeed = allIssues.filter((item) => {
    const matchesSearch =
      searchTerm === "" ||
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.categoryName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.locationName?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory =
      selectedCategory === "All" || item.categoryName === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  const resolvedCount = myIssues.filter(
    (i) => i.status === "RESOLVED" || i.status === "CLOSED"
  ).length;
  const inProgressCount = myIssues.filter(
    (i) => i.status === "IN_PROGRESS" || i.status === "ASSIGNED"
  ).length;
  const totalVotes = myIssues.reduce((acc, curr) => acc + (curr.voteCount || 0), 0);

  const getStatusBadge = (status: IssueStatus) => {
    switch (status) {
      case "REPORTED":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold text-amber-500 bg-amber-500/10 border border-amber-500/30">
            <AlertCircle size={12} />
            Reported
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
      case "REOPENED":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold text-rose-500 bg-rose-500/10 border border-rose-500/30">
            <RotateCcw size={12} />
            Reopened
          </span>
        );
    }
  };

  const getPriorityBadge = (priority: IssuePriority) => {
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
    <div className="space-y-6">
      {/* Top Banner Greeting */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 sm:p-6 rounded-2xl bg-card border border-line shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black text-ink tracking-tight">
              Welcome back, {user.name || "Student"}!
            </h1>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-indigo-500/10 text-indigo-500 border border-indigo-500/20">
              Student Reporter
            </span>
          </div>
          <p className="text-xs sm:text-sm text-mute mt-1">
            Report maintenance issues, mobilize community upvotes, and track verified fixes across campus.
          </p>
        </div>

        <button
          onClick={() => setActiveTab("report")}
          className="inline-flex items-center justify-center gap-2 px-4.5 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-white bg-brand-gradient hover:opacity-95 shadow-md shadow-indigo-500/25 transition-all"
        >
          <PlusCircle size={16} />
          <span>Report New Issue</span>
        </button>
      </div>

      {actionError && (
        <div className="p-3.5 rounded-xl border border-rose-500/25 bg-rose-500/5 text-rose-600 dark:text-rose-400 text-xs flex items-center justify-between">
          <span>{actionError}</span>
          <button onClick={() => setActionError("")} className="underline text-[11px]">
            Dismiss
          </button>
        </div>
      )}

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 rounded-2xl bg-card border border-line shadow-xs">
          <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-mute block">
            My Reported Issues
          </span>
          <span className="text-2xl sm:text-3xl font-black text-ink mt-1 block">
            {myIssues.length}
          </span>
          <span className="text-[11px] text-mute mt-0.5 block">Logged by your KIET ID</span>
        </div>

        <div className="p-4 rounded-2xl bg-card border border-line shadow-xs">
          <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-mute block">
            In Progress
          </span>
          <span className="text-2xl sm:text-3xl font-black text-indigo-500 mt-1 block">
            {inProgressCount}
          </span>
          <span className="text-[11px] text-mute mt-0.5 block">Field crew dispatched</span>
        </div>

        <div className="p-4 rounded-2xl bg-card border border-line shadow-xs">
          <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-mute block">
            Resolved / Closed
          </span>
          <span className="text-2xl sm:text-3xl font-black text-emerald-500 mt-1 block">
            {resolvedCount}
          </span>
          <span className="text-[11px] text-mute mt-0.5 block">Repairs completed</span>
        </div>

        <div className="p-4 rounded-2xl bg-card border border-line shadow-xs">
          <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-mute block">
            Community Upvotes
          </span>
          <span className="text-2xl sm:text-3xl font-black text-blue-500 mt-1 block">
            {totalVotes}
          </span>
          <span className="text-[11px] text-mute mt-0.5 block">Peers backing your reports</span>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-line gap-2 overflow-x-auto pb-1">
        <button
          onClick={() => setActiveTab("my")}
          className={`px-4 py-2.5 text-xs sm:text-sm font-bold border-b-2 whitespace-nowrap transition-colors flex items-center gap-2 ${
            activeTab === "my"
              ? "border-indigo-500 text-indigo-500"
              : "border-transparent text-mute hover:text-ink"
          }`}
        >
          <FolderOpen size={16} />
          <span>My Issues ({myIssues.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("feed")}
          className={`px-4 py-2.5 text-xs sm:text-sm font-bold border-b-2 whitespace-nowrap transition-colors flex items-center gap-2 ${
            activeTab === "feed"
              ? "border-indigo-500 text-indigo-500"
              : "border-transparent text-mute hover:text-ink"
          }`}
        >
          <Sparkles size={16} />
          <span>Campus Feed ({allIssues.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("report")}
          className={`px-4 py-2.5 text-xs sm:text-sm font-bold border-b-2 whitespace-nowrap transition-colors flex items-center gap-2 ${
            activeTab === "report"
              ? "border-indigo-500 text-indigo-500"
              : "border-transparent text-mute hover:text-ink"
          }`}
        >
          <PlusCircle size={16} />
          <span>Report an Issue</span>
        </button>
      </div>

      {/* Tab 1: My Reported Issues */}
      {activeTab === "my" && (
        <div className="space-y-4">
          {loading ? (
            <div className="py-16 text-center text-mute flex flex-col items-center justify-center gap-2">
              <Loader2 className="w-7 h-7 animate-spin text-indigo-500" />
              <span className="text-xs">Fetching your reported tickets…</span>
            </div>
          ) : myIssues.length === 0 ? (
            <div className="p-10 rounded-2xl bg-card border border-line text-center text-mute space-y-3">
              <FolderOpen className="w-10 h-10 mx-auto opacity-30 text-indigo-500" />
              <h3 className="text-base font-bold text-ink">You haven’t reported any issues yet</h3>
              <p className="text-xs max-w-md mx-auto">
                Spotted a damaged facility or equipment on campus? Submit a report to have maintenance attend to it.
              </p>
              <button
                onClick={() => setActiveTab("report")}
                className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-brand-gradient"
              >
                <PlusCircle size={14} />
                <span>Submit Your First Report</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {myIssues.map((issue) => (
                <div
                  key={issue.id}
                  className="p-5 rounded-2xl bg-card border border-line shadow-xs hover:border-[#818cf8] transition-all flex flex-col justify-between gap-4"
                >
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-mono font-bold text-indigo-500">
                        KX-{issue.id}
                      </span>
                      <div className="flex items-center gap-1.5">
                        {getStatusBadge(issue.status)}
                        {getPriorityBadge(issue.priority)}
                      </div>
                    </div>

                    <h3 className="text-sm font-bold text-ink line-clamp-2">{issue.title}</h3>
                    <p className="text-xs text-mute line-clamp-3 leading-relaxed">
                      {issue.description}
                    </p>

                    <div className="flex flex-wrap items-center gap-3 pt-2 text-[11px] text-mute border-t border-line">
                      <span className="font-medium text-ink/80">
                        {issue.categoryName || "General Category"}
                      </span>
                      {issue.locationName && (
                        <>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <MapPin size={12} />
                            {issue.locationName}
                          </span>
                        </>
                      )}
                      <span>•</span>
                      <span className="flex items-center gap-1 font-semibold text-indigo-500">
                        <ThumbsUp size={11} />
                        {issue.voteCount || 0} upvotes
                      </span>
                    </div>
                  </div>

                  {/* Student Action Buttons */}
                  <div className="pt-3 border-t border-line flex items-center justify-between text-xs">
                    <span className="text-[11px] text-mute">
                      Status: <strong className="text-ink">{issue.status}</strong>
                    </span>

                    <div className="flex items-center gap-2">
                      {issue.status === "RESOLVED" && (
                        <button
                          onClick={() => handleCloseIssue(issue.id)}
                          className="px-3 py-1.5 rounded-lg text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 flex items-center gap-1 shadow-xs"
                        >
                          <Check size={13} />
                          <span>Confirm & Close</span>
                        </button>
                      )}

                      {issue.status === "CLOSED" && (
                        <button
                          onClick={() => handleReopenIssue(issue.id)}
                          className="px-3 py-1.5 rounded-lg text-xs font-bold text-ink bg-soft hover:bg-card border border-line flex items-center gap-1"
                        >
                          <RotateCcw size={13} />
                          <span>Reopen Ticket</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Campus Feed & Upvoting */}
      {activeTab === "feed" && (
        <div className="space-y-4">
          {/* Filter Bar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-4 rounded-2xl bg-card border border-line">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-mute absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search campus issues by keyword or location…"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded-xl border border-line bg-soft pl-9 pr-3 py-2 text-xs font-medium text-ink placeholder:text-mute focus:outline-none focus:ring-2 focus:ring-[#818cf8]"
              />
            </div>

            <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
              <span className="text-xs font-semibold text-mute flex items-center gap-1 pl-1">
                <Filter size={13} />
                Category:
              </span>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="rounded-xl border border-line bg-soft px-3 py-2 text-xs font-semibold text-ink focus:outline-none focus:ring-2 focus:ring-[#818cf8]"
              >
                <option value="All">All Categories</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.name}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {loading ? (
            <div className="py-16 text-center text-mute flex flex-col items-center justify-center gap-2">
              <Loader2 className="w-7 h-7 animate-spin text-indigo-500" />
              <span className="text-xs">Loading campus issues…</span>
            </div>
          ) : filteredFeed.length === 0 ? (
            <div className="p-12 rounded-2xl bg-card border border-line text-center text-mute">
              <Search className="w-8 h-8 mx-auto mb-2 opacity-30" />
              <p className="text-sm font-semibold text-ink">No matching issues found</p>
              <p className="text-xs mt-1">Try refining your search terms or category filter.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredFeed.map((issue) => (
                <div
                  key={issue.id}
                  className="p-4 sm:p-5 rounded-2xl bg-card border border-line shadow-xs hover:border-[#818cf8] transition-all flex items-start justify-between gap-4"
                >
                  <div className="flex-1 space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs font-mono font-bold text-indigo-500">
                        KX-{issue.id}
                      </span>
                      {getStatusBadge(issue.status)}
                      {getPriorityBadge(issue.priority)}
                      <span className="text-xs font-semibold text-ink/80 bg-soft px-2 py-0.5 rounded-md border border-line">
                        {issue.categoryName || "General"}
                      </span>
                    </div>

                    <h4 className="text-sm font-bold text-ink">{issue.title}</h4>
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
                      <span>Reported by: {issue.reporterName || "Campus Student"}</span>
                    </div>
                  </div>

                  {/* Interactive Upvote Button */}
                  <button
                    onClick={() => handleVote(issue.id)}
                    className="flex flex-col items-center justify-center min-w-[56px] px-3 py-2.5 rounded-xl border border-line bg-soft hover:border-indigo-500 hover:text-indigo-500 transition-all text-xs font-bold text-ink shrink-0 group"
                    title="Upvote if this issue affects you too"
                  >
                    <ThumbsUp
                      size={16}
                      className="mb-1 text-mute group-hover:text-indigo-500 transition-transform group-hover:scale-110"
                    />
                    <span>{issue.voteCount || 0}</span>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Report an Issue */}
      {activeTab === "report" && (
        <div className="max-w-2xl mx-auto rounded-2xl bg-card border border-line p-6 sm:p-8 shadow-sm">
          <div className="mb-6">
            <h2 className="text-lg font-bold text-ink">Submit a Campus Maintenance Ticket</h2>
            <p className="text-xs text-mute mt-1">
              Your issue will be categorized and routed to the assigned department head immediately.
            </p>
          </div>

          {formSuccess && (
            <div className="mb-5 p-4 rounded-xl border border-emerald-500/25 bg-emerald-500/5 text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-2">
              <CheckCircle2 size={16} />
              <span>{formSuccess}</span>
            </div>
          )}

          {formError && (
            <div className="mb-5 p-4 rounded-xl border border-rose-500/25 bg-rose-500/5 text-xs text-rose-600 dark:text-rose-400 flex items-center gap-2">
              <AlertCircle size={16} />
              <span>{formError}</span>
            </div>
          )}

          <form onSubmit={handleCreateIssue} className="space-y-4.5">
            <div>
              <label className="block text-xs font-bold text-ink mb-1.5">
                Issue Title <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                maxLength={150}
                placeholder="e.g. Central Library 3rd Floor Wi-Fi AP Dropping Connections"
                value={formTitle}
                onChange={(e) => setFormTitle(e.target.value)}
                className="w-full rounded-xl border border-line bg-soft px-3.5 py-2.5 text-xs font-medium text-ink placeholder:text-mute focus:outline-none focus:ring-2 focus:ring-[#818cf8]"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-ink mb-1.5">
                  Category <span className="text-rose-500">*</span>
                </label>
                <select
                  required
                  value={formCategoryId}
                  onChange={(e) => setFormCategoryId(Number(e.target.value) || "")}
                  className="w-full rounded-xl border border-line bg-soft px-3.5 py-2.5 text-xs font-medium text-ink focus:outline-none focus:ring-2 focus:ring-[#818cf8]"
                >
                  <option value="">Select a Category</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-ink mb-1.5">
                  Location / Floor / Room
                </label>
                <input
                  type="text"
                  placeholder="e.g. Aryabhatta Block B, 2nd Floor"
                  value={formLocation}
                  onChange={(e) => setFormLocation(e.target.value)}
                  className="w-full rounded-xl border border-line bg-soft px-3.5 py-2.5 text-xs font-medium text-ink placeholder:text-mute focus:outline-none focus:ring-2 focus:ring-[#818cf8]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-ink mb-1.5">
                Detailed Description <span className="text-rose-500">*</span>
              </label>
              <textarea
                required
                rows={4}
                placeholder="Describe the issue, recurrence, and impact so technicians can prepare the right tools and replacement parts…"
                value={formDescription}
                onChange={(e) => setFormDescription(e.target.value)}
                className="w-full rounded-xl border border-line bg-soft px-3.5 py-2.5 text-xs font-medium text-ink placeholder:text-mute focus:outline-none focus:ring-2 focus:ring-[#818cf8] resize-none"
              />
            </div>

            <div className="pt-2 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setActiveTab("my")}
                className="px-4 py-2.5 rounded-xl text-xs font-semibold text-mute hover:text-ink bg-soft border border-line transition-colors"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={formSubmitting}
                className="px-6 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-white bg-brand-gradient hover:opacity-95 shadow-md shadow-indigo-500/25 flex items-center gap-2 disabled:opacity-50"
              >
                {formSubmitting ? (
                  <>
                    <Loader2 size={15} className="animate-spin" />
                    <span>Submitting Ticket…</span>
                  </>
                ) : (
                  <>
                    <PlusCircle size={15} />
                    <span>Submit Campus Issue</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
