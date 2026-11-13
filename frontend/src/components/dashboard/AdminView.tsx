"use client";

import { useEffect, useState } from "react";
import {
  Shield,
  Users,
  BarChart3,
  AlertCircle,
  Search,
  Check,
  Trash2,
  UserCheck,
  UserX,
  RefreshCw,
  FolderTree,
  Building,
} from "lucide-react";
import {
  api,
  AdminAnalyticsResponse,
  AnalyticsGroupResponse,
  AdminUserResponse,
  CategoryResponse,
  IssueResponse,
} from "@/lib/api";
import { AuthSession } from "@/lib/auth";
import RoleBadge from "./RoleBadge";

interface AdminViewProps {
  user: AuthSession;
}

export default function AdminView({ user }: AdminViewProps) {
  const [activeTab, setActiveTab] = useState<"analytics" | "users" | "categories" | "issues">("analytics");
  const [analytics, setAnalytics] = useState<AdminAnalyticsResponse | null>(null);
  const [categoryStats, setCategoryStats] = useState<AnalyticsGroupResponse[]>([]);
  const [locationStats, setLocationStats] = useState<AnalyticsGroupResponse[]>([]);
  const [users, setUsers] = useState<AdminUserResponse[]>([]);
  const [categories, setCategories] = useState<CategoryResponse[]>([]);
  const [allIssues, setAllIssues] = useState<IssueResponse[]>([]);

  const [loading, setLoading] = useState(true);
  const [actionMessage, setActionMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Search & Filter States
  const [userSearch, setUserSearch] = useState("");
  const [userRoleFilter, setUserRoleFilter] = useState("ALL");
  const [issueSearch, setIssueSearch] = useState("");
  const [issueStatusFilter, setIssueStatusFilter] = useState("ALL");

  // Category Head Assign Modal
  const [assigningCat, setAssigningCat] = useState<CategoryResponse | null>(null);
  const [selectedHeadUserId, setSelectedHeadUserId] = useState<number | "">("");

  // Role Change Modal
  const [editingUser, setEditingUser] = useState<AdminUserResponse | null>(null);
  const [targetRole, setTargetRole] = useState<string>("STUDENT");

  const loadAllData = () => {
    setLoading(true);
    setActionMessage(null);

    Promise.allSettled([
      api.admin.getAnalytics(),
      api.admin.getCategoryAnalytics(),
      api.admin.getLocationAnalytics(),
      api.admin.getUsers(),
      api.categories.getAll(),
      api.issues.getAllIssues(),
    ])
      .then(([anRes, catStatRes, locStatRes, usrRes, catRes, issRes]) => {
        if (anRes.status === "fulfilled") setAnalytics(anRes.value);
        if (catStatRes.status === "fulfilled") setCategoryStats(catStatRes.value || []);
        if (locStatRes.status === "fulfilled") setLocationStats(locStatRes.value || []);
        if (usrRes.status === "fulfilled") setUsers(usrRes.value || []);
        if (catRes.status === "fulfilled") setCategories(catRes.value || []);
        if (issRes.status === "fulfilled") setAllIssues(issRes.value || []);
      })
      .catch((err) => {
        setActionMessage({
          type: "error",
          text: err instanceof Error ? err.message : "Failed to load admin data",
        });
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    let isMounted = true;
    Promise.allSettled([
      api.admin.getAnalytics(),
      api.admin.getCategoryAnalytics(),
      api.admin.getLocationAnalytics(),
      api.admin.getUsers(),
      api.categories.getAll(),
      api.issues.getAllIssues(),
    ])
      .then(([anRes, catStatRes, locStatRes, usrRes, catRes, issRes]) => {
        if (!isMounted) return;
        if (anRes.status === "fulfilled") setAnalytics(anRes.value);
        if (catStatRes.status === "fulfilled") setCategoryStats(catStatRes.value || []);
        if (locStatRes.status === "fulfilled") setLocationStats(locStatRes.value || []);
        if (usrRes.status === "fulfilled") setUsers(usrRes.value || []);
        if (catRes.status === "fulfilled") setCategories(catRes.value || []);
        if (issRes.status === "fulfilled") setAllIssues(issRes.value || []);
      })
      .catch((err) => {
        if (!isMounted) return;
        setActionMessage({
          type: "error",
          text: err instanceof Error ? err.message : "Failed to load admin data",
        });
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  // Update user role
  const handleUpdateRole = async () => {
    if (!editingUser) return;
    try {
      await api.admin.updateRole(editingUser.id, targetRole);
      setActionMessage({
        type: "success",
        text: `Role for ${editingUser.name} successfully updated to ${targetRole}.`,
      });
      setEditingUser(null);
      // Reload users
      const updatedUsers = await api.admin.getUsers();
      setUsers(updatedUsers);
    } catch (err) {
      setActionMessage({
        type: "error",
        text: err instanceof Error ? err.message : "Failed to update user role",
      });
    }
  };

  // Toggle user activation
  const handleToggleActive = async (targetUser: AdminUserResponse) => {
    try {
      if (targetUser.active) {
        await api.admin.deactivate(targetUser.id);
        setActionMessage({
          type: "success",
          text: `User ${targetUser.name} has been deactivated.`,
        });
      } else {
        await api.admin.reactivate(targetUser.id);
        setActionMessage({
          type: "success",
          text: `User ${targetUser.name} has been reactivated.`,
        });
      }
      const updatedUsers = await api.admin.getUsers();
      setUsers(updatedUsers);
    } catch (err) {
      setActionMessage({
        type: "error",
        text: err instanceof Error ? err.message : "Failed to change user activation state",
      });
    }
  };

  // Assign Category Head
  const handleAssignHead = async () => {
    if (!assigningCat || !selectedHeadUserId) return;
    try {
      await api.categories.assignHead(assigningCat.id, Number(selectedHeadUserId));
      setActionMessage({
        type: "success",
        text: `Category Head assigned for ${assigningCat.name}.`,
      });
      setAssigningCat(null);
      setSelectedHeadUserId("");
      const updatedCats = await api.categories.getAll();
      setCategories(updatedCats);
    } catch (err) {
      setActionMessage({
        type: "error",
        text: err instanceof Error ? err.message : "Failed to assign category head",
      });
    }
  };

  // Delete Issue
  const handleDeleteIssue = async (issueId: number, title: string) => {
    if (!confirm(`Are you sure you want to permanently delete issue #${issueId}: "${title}"?`)) return;
    try {
      await api.issues.deleteIssue(issueId);
      setActionMessage({
        type: "success",
        text: `Issue #${issueId} deleted successfully.`,
      });
      setAllIssues((prev) => prev.filter((i) => i.id !== issueId));
    } catch (err) {
      setActionMessage({
        type: "error",
        text: err instanceof Error ? err.message : "Failed to delete issue",
      });
    }
  };

  // Filtered Users
  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.email.toLowerCase().includes(userSearch.toLowerCase()) ||
      String(u.id).includes(userSearch);
    const matchesRole = userRoleFilter === "ALL" || u.role.toUpperCase() === userRoleFilter;
    return matchesSearch && matchesRole;
  });

  // Filtered Issues
  const filteredIssues = allIssues.filter((i) => {
    const matchesSearch =
      i.title.toLowerCase().includes(issueSearch.toLowerCase()) ||
      i.description?.toLowerCase().includes(issueSearch.toLowerCase()) ||
      i.categoryName?.toLowerCase().includes(issueSearch.toLowerCase()) ||
      String(i.id).includes(issueSearch);
    const matchesStatus = issueStatusFilter === "ALL" || i.status === issueStatusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Top Banner / Welcome */}
      <div className="relative overflow-hidden rounded-3xl bg-card border border-line p-6 sm:p-8 shadow-sm">
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 rounded-full bg-rose-500/10 blur-3xl pointer-events-none" />
        <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2.5">
              <span className="p-2 rounded-xl bg-rose-500/10 text-rose-500 border border-rose-500/20">
                <Shield size={20} />
              </span>
              <span className="text-xs font-bold uppercase tracking-wider text-rose-500">
                Administrator Control Center
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-ink tracking-tight">
              Campus Administration & Analytics
            </h1>
            <p className="text-sm text-mute max-w-2xl leading-relaxed">
              Oversee all campus issues, monitor department resolution velocity, manage authorized user roles,
              and coordinate category dispatch across KIET campus.
            </p>
          </div>

          <button
            type="button"
            onClick={loadAllData}
            disabled={loading}
            className="inline-flex items-center gap-2 self-start md:self-auto px-4 py-2 rounded-xl text-xs font-semibold text-ink bg-soft border border-line hover:bg-soft/80 transition-colors shadow-xs"
          >
            <RefreshCw size={13} className={loading ? "animate-spin" : ""} />
            <span>Refresh System Data</span>
          </button>
        </div>

        {/* Global Action Banner */}
        {actionMessage && (
          <div
            className={`mt-4 p-3.5 rounded-xl border text-xs font-medium flex items-center justify-between gap-3 animate-in fade-in ${
              actionMessage.type === "success"
                ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-500"
                : "bg-rose-500/10 border-rose-500/30 text-rose-500"
            }`}
          >
            <div className="flex items-center gap-2">
              {actionMessage.type === "success" ? <Check size={16} /> : <AlertCircle size={16} />}
              <span>{actionMessage.text}</span>
            </div>
            <button
              onClick={() => setActionMessage(null)}
              className="text-mute hover:text-ink font-bold"
            >
              ×
            </button>
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="mt-8 flex items-center gap-2 border-b border-line overflow-x-auto pb-px">
          {[
            { id: "analytics", label: "Analytics & Trends", icon: BarChart3 },
            { id: "users", label: `Users (${users.length})`, icon: Users },
            { id: "categories", label: `Categories (${categories.length})`, icon: FolderTree },
            { id: "issues", label: `All Issues (${allIssues.length})`, icon: Shield },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={`flex items-center gap-2 px-4 py-3 text-xs sm:text-sm font-semibold whitespace-nowrap border-b-2 transition-colors ${
                  isActive
                    ? "border-indigo-500 text-indigo-500"
                    : "border-transparent text-mute hover:text-ink hover:border-line"
                }`}
              >
                <Icon size={16} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* TAB 1: ANALYTICS & TRENDS */}
      {activeTab === "analytics" && (
        <div className="space-y-6">
          {/* Key Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
            {[
              {
                label: "Total Issues",
                value: analytics?.totalIssues ?? 0,
                color: "text-ink",
                bg: "bg-card",
                border: "border-line",
              },
              {
                label: "Reported",
                value: analytics?.reported ?? 0,
                color: "text-amber-500",
                bg: "bg-amber-500/5",
                border: "border-amber-500/20",
              },
              {
                label: "Assigned",
                value: analytics?.assigned ?? 0,
                color: "text-indigo-400",
                bg: "bg-indigo-500/5",
                border: "border-indigo-500/20",
              },
              {
                label: "In Progress",
                value: analytics?.inProgress ?? 0,
                color: "text-blue-500",
                bg: "bg-blue-500/5",
                border: "border-blue-500/20",
              },
              {
                label: "Resolved",
                value: analytics?.resolved ?? 0,
                color: "text-emerald-500",
                bg: "bg-emerald-500/5",
                border: "border-emerald-500/20",
              },
              {
                label: "Closed",
                value: analytics?.closed ?? 0,
                color: "text-mute",
                bg: "bg-card",
                border: "border-line",
              },
            ].map((metric) => (
              <div
                key={metric.label}
                className={`p-4 rounded-2xl ${metric.bg} border ${metric.border} shadow-xs flex flex-col justify-between`}
              >
                <span className="text-[11px] font-semibold text-mute">{metric.label}</span>
                <span className={`text-2xl sm:text-3xl font-extrabold mt-2 ${metric.color}`}>
                  {loading ? "..." : metric.value}
                </span>
              </div>
            ))}
          </div>

          {/* Breakdown Grids */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Category Breakdown */}
            <div className="p-6 rounded-3xl bg-card border border-line shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FolderTree size={18} className="text-indigo-500" />
                  <h3 className="text-base font-bold text-ink">Issues by Department Category</h3>
                </div>
                <span className="text-xs text-mute font-medium">{categoryStats.length} Categories</span>
              </div>

              {categoryStats.length === 0 ? (
                <p className="text-xs text-mute py-8 text-center">No category distribution data recorded yet.</p>
              ) : (
                <div className="space-y-3">
                  {categoryStats.map((item) => {
                    const total = analytics?.totalIssues || 1;
                    const pct = Math.round((item.count / total) * 100);
                    return (
                      <div key={item.id} className="space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-semibold text-ink">{item.name}</span>
                          <span className="text-mute font-medium">
                            {item.count} issues ({pct}%)
                          </span>
                        </div>
                        <div className="w-full h-2 rounded-full bg-soft overflow-hidden">
                          <div
                            className="h-full bg-brand-gradient rounded-full transition-all duration-500"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Location Breakdown */}
            <div className="p-6 rounded-3xl bg-card border border-line shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Building size={18} className="text-purple-400" />
                  <h3 className="text-base font-bold text-ink">Issues by Campus Location</h3>
                </div>
                <span className="text-xs text-mute font-medium">{locationStats.length} Campus Zones</span>
              </div>

              {locationStats.length === 0 ? (
                <p className="text-xs text-mute py-8 text-center">No location distribution data recorded yet.</p>
              ) : (
                <div className="space-y-3">
                  {locationStats.map((item) => {
                    const total = analytics?.totalIssues || 1;
                    const pct = Math.round((item.count / total) * 100);
                    return (
                      <div key={item.id} className="space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-semibold text-ink">{item.name}</span>
                          <span className="text-mute font-medium">
                            {item.count} issues ({pct}%)
                          </span>
                        </div>
                        <div className="w-full h-2 rounded-full bg-soft overflow-hidden">
                          <div
                            className="h-full bg-purple-500 rounded-full transition-all duration-500"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: USER MANAGEMENT */}
      {activeTab === "users" && (
        <div className="p-6 rounded-3xl bg-card border border-line shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-bold text-ink">Campus User Accounts & Roles</h3>
              <p className="text-xs text-mute">
                Assign backend roles (Student, Category Head, Resolver) and manage account active states.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              {/* Search */}
              <div className="relative">
                <Search size={14} className="absolute left-3 top-2.5 text-mute" />
                <input
                  type="text"
                  placeholder="Search user or email..."
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  className="pl-9 pr-3 py-1.5 rounded-xl text-xs bg-soft border border-line text-ink placeholder:text-mute focus:outline-none focus:ring-2 focus:ring-[#818cf8]"
                />
              </div>

              {/* Role Filter */}
              <select
                value={userRoleFilter}
                onChange={(e) => setUserRoleFilter(e.target.value)}
                className="px-3 py-1.5 rounded-xl text-xs bg-soft border border-line text-ink font-medium focus:outline-none focus:ring-2 focus:ring-[#818cf8]"
              >
                <option value="ALL">All Roles</option>
                <option value="STUDENT">Student</option>
                <option value="CATEGORY_HEAD">Category Head</option>
                <option value="RESOLVER">Resolver</option>
                <option value="ADMIN">Administrator</option>
              </select>
            </div>
          </div>

          {/* User Table */}
          <div className="overflow-x-auto border border-line rounded-2xl">
            <table className="w-full text-left text-xs">
              <thead className="bg-soft/60 text-mute uppercase tracking-wider text-[10px] border-b border-line">
                <tr>
                  <th className="py-3 px-4 font-semibold">User ID</th>
                  <th className="py-3 px-4 font-semibold">Name & Institutional Email</th>
                  <th className="py-3 px-4 font-semibold">Assigned Role</th>
                  <th className="py-3 px-4 font-semibold">Account Status</th>
                  <th className="py-3 px-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-mute">
                      No users match the search criteria.
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((u) => {
                    const isAdmin = u.role.toUpperCase() === "ADMIN";
                    const isSelf = u.id === user.id;

                    return (
                      <tr key={u.id} className="hover:bg-soft/30 transition-colors">
                        <td className="py-3 px-4 font-mono text-mute">#{u.id}</td>
                        <td className="py-3 px-4">
                          <div className="font-bold text-ink">{u.name}</div>
                          <div className="text-[11px] text-mute">{u.email}</div>
                        </td>
                        <td className="py-3 px-4">
                          <RoleBadge role={u.role} size="sm" />
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                              u.active
                                ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20"
                                : "bg-rose-500/10 text-rose-500 border border-rose-500/20"
                            }`}
                          >
                            {u.active ? "Active" : "Deactivated"}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {/* Role change button */}
                            {!isAdmin && (
                              <button
                                type="button"
                                onClick={() => {
                                  setEditingUser(u);
                                  setTargetRole(
                                    ["STUDENT", "RESOLVER", "CATEGORY_HEAD"].includes(u.role)
                                      ? u.role
                                      : "STUDENT"
                                  );
                                }}
                                className="px-2.5 py-1 rounded-lg text-[11px] font-semibold text-indigo-500 hover:bg-indigo-500/10 border border-indigo-500/20 transition-colors"
                              >
                                Change Role
                              </button>
                            )}

                            {/* Deactivate / Reactivate button */}
                            {!isAdmin && !isSelf && (
                              <button
                                type="button"
                                onClick={() => handleToggleActive(u)}
                                className={`p-1.5 rounded-lg border transition-colors ${
                                  u.active
                                    ? "text-rose-500 hover:bg-rose-500/10 border-rose-500/20"
                                    : "text-emerald-500 hover:bg-emerald-500/10 border-emerald-500/20"
                                }`}
                                title={u.active ? "Deactivate user" : "Reactivate user"}
                              >
                                {u.active ? <UserX size={14} /> : <UserCheck size={14} />}
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: CATEGORY & HEAD ASSIGNMENT */}
      {activeTab === "categories" && (
        <div className="p-6 rounded-3xl bg-card border border-line shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-bold text-ink">Campus Categories & Department Heads</h3>
              <p className="text-xs text-mute">
                Each category routes issues to designated resolvers. Assign category heads to oversee workflows.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {categories.map((cat) => (
              <div
                key={cat.id}
                className="p-5 rounded-2xl bg-card border border-line shadow-xs hover:border-indigo-500/30 transition-all flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[10px] text-mute">CAT-{cat.id}</span>
                    <span className="p-1.5 rounded-lg bg-soft text-indigo-500">
                      <FolderTree size={15} />
                    </span>
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-ink">{cat.name}</h4>
                    <p className="text-xs text-mute mt-1">
                      {cat.categoryHeadName ? (
                        <span className="text-ink font-medium">Head: {cat.categoryHeadName}</span>
                      ) : (
                        <span className="text-amber-500 font-medium">Unassigned Head</span>
                      )}
                    </p>
                    {cat.categoryHeadEmail && (
                      <p className="text-[11px] text-mute truncate">{cat.categoryHeadEmail}</p>
                    )}
                  </div>
                </div>

                <div className="mt-5 pt-3 border-t border-line">
                  <button
                    type="button"
                    onClick={() => {
                      setAssigningCat(cat);
                      setSelectedHeadUserId(cat.categoryHeadId || "");
                    }}
                    className="w-full py-1.5 rounded-xl text-xs font-semibold text-indigo-500 hover:bg-indigo-500/10 border border-indigo-500/20 transition-colors"
                  >
                    {cat.categoryHeadName ? "Reassign Head" : "Assign Category Head"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: ALL ISSUES AUDIT */}
      {activeTab === "issues" && (
        <div className="p-6 rounded-3xl bg-card border border-line shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-bold text-ink">Campus Issue Moderation & Audit</h3>
              <p className="text-xs text-mute">
                Review, filter, and moderate all submitted campus issues.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              <div className="relative">
                <Search size={14} className="absolute left-3 top-2.5 text-mute" />
                <input
                  type="text"
                  placeholder="Search issues..."
                  value={issueSearch}
                  onChange={(e) => setIssueSearch(e.target.value)}
                  className="pl-9 pr-3 py-1.5 rounded-xl text-xs bg-soft border border-line text-ink placeholder:text-mute focus:outline-none focus:ring-2 focus:ring-[#818cf8]"
                />
              </div>

              <select
                value={issueStatusFilter}
                onChange={(e) => setIssueStatusFilter(e.target.value)}
                className="px-3 py-1.5 rounded-xl text-xs bg-soft border border-line text-ink font-medium focus:outline-none focus:ring-2 focus:ring-[#818cf8]"
              >
                <option value="ALL">All Statuses</option>
                <option value="REPORTED">Reported</option>
                <option value="ASSIGNED">Assigned</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="RESOLVED">Resolved</option>
                <option value="CLOSED">Closed</option>
                <option value="REOPENED">Reopened</option>
              </select>
            </div>
          </div>

          <div className="space-y-3">
            {filteredIssues.length === 0 ? (
              <div className="py-12 text-center text-mute text-xs">
                No issues match your current filters.
              </div>
            ) : (
              filteredIssues.map((issue) => (
                <div
                  key={issue.id}
                  className="p-4 rounded-2xl bg-card border border-line hover:border-line/80 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="space-y-1.5 max-w-3xl">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-xs font-bold text-mute">#{issue.id}</span>
                      <h4 className="text-sm font-bold text-ink">{issue.title}</h4>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-soft text-ink border border-line">
                        {issue.categoryName || "General"}
                      </span>
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

                    <p className="text-xs text-mute line-clamp-2 leading-relaxed">
                      {issue.description}
                    </p>

                    <div className="flex flex-wrap items-center gap-3 text-[11px] text-mute">
                      {issue.reporterName && <span>Reported by: {issue.reporterName}</span>}
                      {issue.locationName && <span>Location: {issue.locationName}</span>}
                      {issue.voteCount !== undefined && <span>{issue.voteCount} Votes</span>}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end md:self-center">
                    <button
                      type="button"
                      onClick={() => handleDeleteIssue(issue.id, issue.title)}
                      className="p-2 rounded-xl text-rose-500 hover:bg-rose-500/10 border border-rose-500/20 transition-colors"
                      title="Permanently Delete Issue"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* MODAL: CHANGE USER ROLE */}
      {editingUser && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="relative w-full max-w-md rounded-2xl bg-card border border-line shadow-2xl p-6 text-ink space-y-4 animate-in zoom-in-95 duration-150">
            <h3 className="text-base font-bold text-ink">Update User Role</h3>
            <p className="text-xs text-mute">
              Update access level for <strong className="text-ink">{editingUser.name}</strong> ({editingUser.email}).
            </p>

            <div className="space-y-2">
              <label className="block text-xs font-semibold text-ink">Select Role</label>
              <select
                value={targetRole}
                onChange={(e) => setTargetRole(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-soft border border-line text-xs font-medium text-ink focus:outline-none focus:ring-2 focus:ring-[#818cf8]"
              >
                <option value="STUDENT">Student (Issue reporter & community voting)</option>
                <option value="CATEGORY_HEAD">Category Head (Dispatch resolver & manage category inbox)</option>
                <option value="RESOLVER">Resolver (Field staff resolving assigned tasks)</option>
              </select>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setEditingUser(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-mute hover:text-ink hover:bg-soft transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleUpdateRole}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-brand-gradient hover:opacity-95 shadow-sm transition-opacity"
              >
                Save Role
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: ASSIGN CATEGORY HEAD */}
      {assigningCat && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="relative w-full max-w-md rounded-2xl bg-card border border-line shadow-2xl p-6 text-ink space-y-4 animate-in zoom-in-95 duration-150">
            <h3 className="text-base font-bold text-ink">Assign Category Head</h3>
            <p className="text-xs text-mute">
              Select an authorized user to supervise issues under{" "}
              <strong className="text-ink">{assigningCat.name}</strong>.
            </p>

            <div className="space-y-2">
              <label className="block text-xs font-semibold text-ink">Select Faculty / Staff User</label>
              <select
                value={selectedHeadUserId}
                onChange={(e) => setSelectedHeadUserId(Number(e.target.value) || "")}
                className="w-full px-3 py-2 rounded-xl bg-soft border border-line text-xs font-medium text-ink focus:outline-none focus:ring-2 focus:ring-[#818cf8]"
              >
                <option value="">-- Choose User --</option>
                {users.map((u) => (
                  <option key={u.id} value={u.id}>
                    #{u.id} - {u.name} ({u.role}) - {u.email}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  setAssigningCat(null);
                  setSelectedHeadUserId("");
                }}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-mute hover:text-ink hover:bg-soft transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleAssignHead}
                disabled={!selectedHeadUserId}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-brand-gradient hover:opacity-95 shadow-sm transition-opacity disabled:opacity-50"
              >
                Confirm Assignment
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
