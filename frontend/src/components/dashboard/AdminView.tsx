"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
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
  X,
  Image as ImageIcon,
} from "lucide-react";
import Combobox, { ComboboxOption } from "@/components/ui/Combobox";
import {
  api,
  AdminAnalyticsResponse,
  AnalyticsGroupResponse,
  AdminUserResponse,
  CategoryResponse,
  LocationResponse,
  IssueResponse,
  IssueImageResponse,
} from "@/lib/api";
import { AuthSession } from "@/lib/auth";
import { useWebSocketSubscription } from "@/lib/websocket";
import LiveStatusIndicator from "@/components/ui/LiveStatusIndicator";
import RoleBadge from "./RoleBadge";

interface AdminViewProps {
  user: AuthSession;
}

// Safe percentage calculation to prevent NaN%, undefined, or Infinity
function calculatePercentage(count: number, total: number): number {
  if (!total || total <= 0 || !count || count <= 0) return 0;
  const pct = (count / total) * 100;
  if (!isFinite(pct) || isNaN(pct)) return 0;
  return Math.min(100, Math.max(0, Math.round(pct)));
}

export default function AdminView({ user }: AdminViewProps) {
  const [activeTab, setActiveTab] = useState<
    "analytics" | "users" | "categories" | "issues"
  >("analytics");
  const [analytics, setAnalytics] = useState<AdminAnalyticsResponse | null>(
    null,
  );
  const [categoryStats, setCategoryStats] = useState<AnalyticsGroupResponse[]>(
    [],
  );
  const [locationStats, setLocationStats] = useState<AnalyticsGroupResponse[]>(
    [],
  );
  const [users, setUsers] = useState<AdminUserResponse[]>([]);
  const [categories, setCategories] = useState<CategoryResponse[]>([]);
  const [locations, setLocations] = useState<LocationResponse[]>([]);
  const [allIssues, setAllIssues] = useState<IssueResponse[]>([]);

  const [loading, setLoading] = useState(true);
  const [actionMessage, setActionMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  // Search & Filter States
  const [userSearch, setUserSearch] = useState("");
  const [userRoleFilter, setUserRoleFilter] = useState("ALL");
  const [issueSearch, setIssueSearch] = useState("");
  const [issueStatusFilter, setIssueStatusFilter] = useState("ALL");

  // Category Head Assign Modal
  const [assigningCat, setAssigningCat] = useState<CategoryResponse | null>(
    null,
  );
  const [selectedHeadUserId, setSelectedHeadUserId] = useState<number | string>(
    "",
  );
  const [assignModalError, setAssignModalError] = useState<string | null>(null);
  const [assigningLoading, setAssigningLoading] = useState<boolean>(false);

  // Role Change Modal
  const [editingUser, setEditingUser] = useState<AdminUserResponse | null>(
    null,
  );
  const [targetRole, setTargetRole] = useState<string>("STUDENT");

  // Issue inspect & attachments viewer
  const [inspectingIssue, setInspectingIssue] = useState<IssueResponse | null>(null);
  const [adminIssueImages, setAdminIssueImages] = useState<IssueImageResponse[]>([]);
  const [adminImagesLoading, setAdminImagesLoading] = useState(false);
  const [previewImageUrl, setPreviewImageUrl] = useState<string | null>(null);

  const openInspectModal = (issue: IssueResponse) => {
    setInspectingIssue(issue);
    setAdminImagesLoading(true);
    api.issues
      .getImages(issue.id)
      .then((imgs) => setAdminIssueImages(imgs || []))
      .catch(() => setAdminIssueImages([]))
      .finally(() => setAdminImagesLoading(false));
  };

  const closeInspectModal = () => {
    setInspectingIssue(null);
    setAdminIssueImages([]);
  };

  // Real-time WebSocket subscription for administrator topics
  useWebSocketSubscription<IssueResponse>("/topic/admin/issues", (event) => {
    if (!event?.payload) return;
    const issue = event.payload;
    setAllIssues((prev) => {
      const list = Array.isArray(prev) ? prev : [];
      const idx = list.findIndex((i) => i.id === issue.id);
      if (idx !== -1) {
        const copy = [...list];
        copy[idx] = { ...copy[idx], ...issue };
        return copy;
      }
      if (event.type === "ISSUE_CREATED") {
        return [issue, ...list];
      }
      return list;
    });

    // Silently refresh analytics counters
    api.admin.getAnalytics().then((res) => setAnalytics(res)).catch(() => {});
    api.admin.getCategoryAnalytics().then((res) => setCategoryStats(res || [])).catch(() => {});
    api.admin.getLocationAnalytics().then((res) => setLocationStats(res || [])).catch(() => {});
  });

  // Load all admin system data
  const loadAllData = useCallback(() => {
    setLoading(true);
    setActionMessage(null);

    Promise.allSettled([
      api.admin.getAnalytics(),
      api.admin.getCategoryAnalytics(),
      api.admin.getLocationAnalytics(),
      api.admin.getUsers(),
      api.categories.getAll(),
      api.issues.getAllIssues(),
      api.locations.getAll(),
    ])
      .then(
        ([anRes, catStatRes, locStatRes, usrRes, catRes, issRes, locsRes]) => {
          if (anRes.status === "fulfilled") setAnalytics(anRes.value);
          if (catStatRes.status === "fulfilled")
            setCategoryStats(catStatRes.value || []);
          if (locStatRes.status === "fulfilled")
            setLocationStats(locStatRes.value || []);
          if (usrRes.status === "fulfilled") setUsers(usrRes.value || []);
          if (catRes.status === "fulfilled") setCategories(catRes.value || []);
          if (issRes.status === "fulfilled") setAllIssues(issRes.value || []);
          if (locsRes.status === "fulfilled") setLocations(locsRes.value || []);
        },
      )
      .catch((err) => {
        setActionMessage({
          type: "error",
          text:
            err instanceof Error ? err.message : "Failed to load admin data",
        });
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    loadAllData();
  }, [loadAllData]);

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
        text:
          err instanceof Error
            ? err.message
            : "Failed to change user activation state",
      });
    }
  };

  // Open Assign Modal with selected value
  const handleOpenAssignModal = (cat: CategoryResponse) => {
    setAssigningCat(cat);
    // If category already has a head, default to their user ID; otherwise "NONE"
    setSelectedHeadUserId(cat.categoryHeadId ? cat.categoryHeadId : "NONE");
    setAssignModalError(null);
  };

  // Assign or Unassign Category Head
  const handleAssignHead = async () => {
    if (!assigningCat) return;
    setAssignModalError(null);
    setAssigningLoading(true);

    try {
      let updatedCat: CategoryResponse;
      if (selectedHeadUserId === "NONE" || !selectedHeadUserId) {
        // Remove Category Head assignment
        updatedCat = await api.categories.removeHead(assigningCat.id);
        setActionMessage({
          type: "success",
          text: `Category Head assignment removed for ${assigningCat.name}. Category is now unassigned.`,
        });
      } else {
        // Assign selected Category Head
        const headUserId = Number(selectedHeadUserId);
        updatedCat = await api.categories.assignHead(
          assigningCat.id,
          headUserId,
        );
        const assignedUser = users.find((u) => u.id === headUserId);
        const headDisplayName =
          assignedUser?.name || updatedCat.categoryHeadName || "Category Head";
        setActionMessage({
          type: "success",
          text: `${headDisplayName} successfully assigned as Category Head for ${assigningCat.name}.`,
        });
      }

      // Immediately update local categories state with real response
      setCategories((prev) =>
        prev.map((c) => (c.id === updatedCat.id ? updatedCat : c)),
      );

      setAssigningCat(null);
      setSelectedHeadUserId("");

      // Background refresh to ensure fresh state
      api.categories.getAll().then((fresh) => {
        if (fresh) setCategories(fresh);
      });
    } catch (err) {
      const errMsg =
        err instanceof Error ? err.message : "Failed to update category head";
      setAssignModalError(errMsg);
      setActionMessage({
        type: "error",
        text: errMsg,
      });
    } finally {
      setAssigningLoading(false);
    }
  };

  // Delete Issue
  const handleDeleteIssue = async (issueId: number, title: string) => {
    if (
      !confirm(
        `Are you sure you want to permanently delete issue #${issueId}: "${title}"?`,
      )
    )
      return;
    try {
      await api.issues.deleteIssue(issueId);
      setActionMessage({
        type: "success",
        text: `Issue #${issueId} deleted successfully.`,
      });
      setAllIssues((prev) => prev.filter((i) => i.id !== issueId));
      // Refresh analytics in background
      api.admin.getAnalytics().then((an) => an && setAnalytics(an));
    } catch (err) {
      setActionMessage({
        type: "error",
        text: err instanceof Error ? err.message : "Failed to delete issue",
      });
    }
  };

  // Filtered Users (Search by Name and Email, User ID removed from display & search)
  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const q = userSearch.trim().toLowerCase();
      const matchesSearch =
        !q ||
        u.name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q);
      const matchesRole =
        userRoleFilter === "ALL" || u.role.toUpperCase() === userRoleFilter;
      return matchesSearch && matchesRole;
    });
  }, [users, userSearch, userRoleFilter]);

  // Eligible Category Heads (Only users with CATEGORY_HEAD role)
  const eligibleCategoryHeads = useMemo(() => {
    return users.filter((u) => u.role.toUpperCase() === "CATEGORY_HEAD");
  }, [users]);

  // Options for the Category Head Combobox
  const categoryHeadOptions: ComboboxOption[] = useMemo(() => {
    const list: ComboboxOption[] = [
      {
        value: "NONE",
        label: "No One",
        subLabel: "Leave category unassigned",
      },
    ];

    for (const u of eligibleCategoryHeads) {
      list.push({
        value: u.id,
        label: u.name,
        subLabel: `${u.email}${!u.active ? " (Inactive)" : ""}`,
      });
    }

    return list;
  }, [eligibleCategoryHeads]);

  // Filtered Issues
  const filteredIssues = useMemo(() => {
    return allIssues.filter((i) => {
      const q = issueSearch.trim().toLowerCase();
      const matchesSearch =
        !q ||
        i.title.toLowerCase().includes(q) ||
        (i.description && i.description.toLowerCase().includes(q)) ||
        (i.categoryName && i.categoryName.toLowerCase().includes(q)) ||
        String(i.id).includes(q);
      const matchesStatus =
        issueStatusFilter === "ALL" || i.status === issueStatusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [allIssues, issueSearch, issueStatusFilter]);

  // Accurate Metrics Counts from Backend API response (with fallback to allIssues)
  const totalIssuesCount =
    analytics?.totalIssues ?? (allIssues.length > 0 ? allIssues.length : 0);

  const reportedCount =
    analytics?.reportedIssues ??
    analytics?.reported ??
    allIssues.filter((i) => i.status === "REPORTED").length;

  const assignedCount =
    analytics?.assignedIssues ??
    analytics?.assigned ??
    allIssues.filter((i) => i.status === "ASSIGNED").length;

  const inProgressCount =
    analytics?.inProgressIssues ??
    analytics?.inProgress ??
    allIssues.filter((i) => i.status === "IN_PROGRESS").length;

  const resolvedCount =
    analytics?.resolvedIssues ??
    analytics?.resolved ??
    allIssues.filter((i) => i.status === "RESOLVED").length;

  const closedCount =
    analytics?.closedIssues ??
    analytics?.closed ??
    allIssues.filter((i) => i.status === "CLOSED").length;

  // Category statistics dynamically computed from real categories & real issues
  const computedCategoryStats = useMemo(() => {
    // Tally issues by categoryId and normalized categoryName
    const countsByCatId = new Map<number, number>();
    const countsByCatName = new Map<string, number>();

    for (const issue of allIssues) {
      if (issue.categoryId) {
        countsByCatId.set(
          issue.categoryId,
          (countsByCatId.get(issue.categoryId) || 0) + 1,
        );
      }
      if (issue.categoryName) {
        const norm = issue.categoryName.trim().toUpperCase();
        countsByCatName.set(norm, (countsByCatName.get(norm) || 0) + 1);
      }
    }

    // Also factor in counts from categoryStats if backend provides aggregate counts
    for (const stat of categoryStats) {
      if (stat.id && !countsByCatId.has(stat.id)) {
        countsByCatId.set(stat.id, stat.issueCount ?? stat.count ?? 0);
      }
      if (stat.name) {
        const norm = stat.name.trim().toUpperCase();
        if (!countsByCatName.has(norm)) {
          countsByCatName.set(norm, stat.issueCount ?? stat.count ?? 0);
        }
      }
    }

    // If real categories are loaded from GET /api/categories, build stats for every real category
    if (categories.length > 0) {
      const list: AnalyticsGroupResponse[] = categories.map((cat) => {
        const norm = cat.name.trim().toUpperCase();
        const count =
          countsByCatId.get(cat.id) ?? countsByCatName.get(norm) ?? 0;
        return {
          id: cat.id,
          name: cat.name,
          issueCount: count,
        };
      });

      // Also append any extra categories from issues if not already in categories table
      for (const issue of allIssues) {
        if (
          issue.categoryName &&
          !list.some(
            (c) =>
              c.name.trim().toUpperCase() ===
              issue.categoryName!.trim().toUpperCase(),
          )
        ) {
          const norm = issue.categoryName.trim().toUpperCase();
          const count = countsByCatName.get(norm) || 0;
          list.push({
            id: issue.categoryId || list.length + 1,
            name: issue.categoryName,
            issueCount: count,
          });
        }
      }

      // Sort: highest issues first, then alphabetical by name
      return list.sort(
        (a, b) => b.issueCount - a.issueCount || a.name.localeCompare(b.name),
      );
    }

    // Fallback: If categories haven't loaded yet, build directly from categoryStats or allIssues
    if (categoryStats.length > 0) {
      return [...categoryStats].sort(
        (a, b) => (b.issueCount ?? 0) - (a.issueCount ?? 0),
      );
    }

    if (allIssues.length > 0) {
      const map = new Map<string, AnalyticsGroupResponse>();
      for (const issue of allIssues) {
        const catId = issue.categoryId || 0;
        const catName = issue.categoryName || "Uncategorized";
        const existing = map.get(catName);
        if (existing) {
          existing.issueCount += 1;
        } else {
          map.set(catName, { id: catId, name: catName, issueCount: 1 });
        }
      }
      return Array.from(map.values()).sort(
        (a, b) => b.issueCount - a.issueCount,
      );
    }

    return [];
  }, [categories, allIssues, categoryStats]);

  // Location statistics dynamically computed from real campus locations & real issues
  const computedLocationStats = useMemo(() => {
    // Tally issues by locationId and normalized locationName
    const countsByLocId = new Map<number, number>();
    const countsByLocName = new Map<string, number>();

    for (const issue of allIssues) {
      if (issue.locationId) {
        countsByLocId.set(
          issue.locationId,
          (countsByLocId.get(issue.locationId) || 0) + 1,
        );
      }
      if (issue.locationName) {
        const norm = issue.locationName.trim().toUpperCase();
        countsByLocName.set(norm, (countsByLocName.get(norm) || 0) + 1);
      }
    }

    // Also factor in counts from locationStats if backend provides aggregate counts
    for (const stat of locationStats) {
      if (stat.id && !countsByLocId.has(stat.id)) {
        countsByLocId.set(stat.id, stat.issueCount ?? stat.count ?? 0);
      }
      if (stat.name) {
        const norm = stat.name.trim().toUpperCase();
        if (!countsByLocName.has(norm)) {
          countsByLocName.set(norm, stat.issueCount ?? stat.count ?? 0);
        }
      }
    }

    // If real locations are loaded from GET /api/locations, build stats for every real location
    if (locations.length > 0) {
      const list: AnalyticsGroupResponse[] = locations.map((loc) => {
        const norm = loc.name.trim().toUpperCase();
        const count =
          countsByLocId.get(loc.id) ?? countsByLocName.get(norm) ?? 0;
        return {
          id: loc.id,
          name: loc.name,
          issueCount: count,
        };
      });

      // Also append any extra locations from issues if not already in locations table
      for (const issue of allIssues) {
        if (
          issue.locationName &&
          !list.some(
            (l) =>
              l.name.trim().toUpperCase() ===
              issue.locationName!.trim().toUpperCase(),
          )
        ) {
          const norm = issue.locationName.trim().toUpperCase();
          const count = countsByLocName.get(norm) || 0;
          list.push({
            id: issue.locationId || list.length + 1,
            name: issue.locationName,
            issueCount: count,
          });
        }
      }

      // Sort: highest issues first, then alphabetical by name
      return list.sort(
        (a, b) => b.issueCount - a.issueCount || a.name.localeCompare(b.name),
      );
    }

    // Fallback: If locations haven't loaded yet, build directly from locationStats or allIssues
    if (locationStats.length > 0) {
      return [...locationStats].sort(
        (a, b) => (b.issueCount ?? 0) - (a.issueCount ?? 0),
      );
    }

    if (allIssues.length > 0) {
      const map = new Map<string, AnalyticsGroupResponse>();
      for (const issue of allIssues) {
        const locId = issue.locationId || 0;
        const locName = issue.locationName || "Unspecified Location";
        const existing = map.get(locName);
        if (existing) {
          existing.issueCount += 1;
        } else {
          map.set(locName, { id: locId, name: locName, issueCount: 1 });
        }
      }
      return Array.from(map.values()).sort(
        (a, b) => b.issueCount - a.issueCount,
      );
    }

    return [];
  }, [locations, allIssues, locationStats]);

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
              Oversee all campus issues, monitor department resolution velocity,
              manage authorized user roles, and coordinate category dispatch
              across KIET campus.
            </p>
          </div>

          <div className="self-start md:self-auto">
            <LiveStatusIndicator />
          </div>
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
              {actionMessage.type === "success" ? (
                <Check size={16} />
              ) : (
                <AlertCircle size={16} />
              )}
              <span>{actionMessage.text}</span>
            </div>
            <button
              onClick={() => setActionMessage(null)}
              className="text-mute hover:text-ink font-bold cursor-pointer"
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
            {
              id: "categories",
              label: `Categories (${categories.length})`,
              icon: FolderTree,
            },
            {
              id: "issues",
              label: `All Issues (${allIssues.length})`,
              icon: Shield,
            },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={`flex items-center gap-2 px-4 py-3 text-xs sm:text-sm font-semibold whitespace-nowrap border-b-2 transition-colors cursor-pointer ${
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
                value: totalIssuesCount,
                color: "text-ink",
                bg: "bg-card",
                border: "border-line",
              },
              {
                label: "Reported",
                value: reportedCount,
                color: "text-amber-500",
                bg: "bg-amber-500/5",
                border: "border-amber-500/20",
              },
              {
                label: "Assigned",
                value: assignedCount,
                color: "text-indigo-400",
                bg: "bg-indigo-500/5",
                border: "border-indigo-500/20",
              },
              {
                label: "In Progress",
                value: inProgressCount,
                color: "text-blue-500",
                bg: "bg-blue-500/5",
                border: "border-blue-500/20",
              },
              {
                label: "Resolved",
                value: resolvedCount,
                color: "text-emerald-500",
                bg: "bg-emerald-500/5",
                border: "border-emerald-500/20",
              },
              {
                label: "Closed",
                value: closedCount,
                color: "text-mute",
                bg: "bg-card",
                border: "border-line",
              },
            ].map((metric) => (
              <div
                key={metric.label}
                className={`p-4 rounded-2xl ${metric.bg} border ${metric.border} shadow-xs flex flex-col justify-between`}
              >
                <span className="text-[11px] font-semibold text-mute">
                  {metric.label}
                </span>
                <span
                  className={`text-2xl sm:text-3xl font-extrabold mt-2 ${metric.color}`}
                >
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
                  <h3 className="text-base font-bold text-ink">
                    Issues by Category
                  </h3>
                </div>
                <span className="text-xs text-mute font-medium">
                  {computedCategoryStats.length} Categories
                </span>
              </div>

              {computedCategoryStats.length === 0 ? (
                <p className="text-xs text-mute py-8 text-center">
                  No category distribution data recorded yet.
                </p>
              ) : (
                <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
                  {computedCategoryStats.map((item) => {
                    const count = item.issueCount ?? item.count ?? 0;
                    const pct = calculatePercentage(count, totalIssuesCount);

                    return (
                      <div key={item.id} className="space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-semibold text-ink">
                            {item.name}
                          </span>
                          <span className="text-mute font-medium">
                            {count} {count === 1 ? "issue" : "issues"} ({pct}%)
                          </span>
                        </div>
                        <div className="w-full h-2 rounded-full bg-soft overflow-hidden">
                          <div
                            className="h-full bg-brand-gradient rounded-full transition-all duration-500"
                            style={{ width: `${pct}%` }}
                            role="progressbar"
                            aria-valuenow={pct}
                            aria-valuemin={0}
                            aria-valuemax={100}
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
                  <h3 className="text-base font-bold text-ink">
                    Issues by Campus Location
                  </h3>
                </div>
                <span className="text-xs text-mute font-medium">
                  {computedLocationStats.length} Campus Zones
                </span>
              </div>

              {computedLocationStats.length === 0 ? (
                <p className="text-xs text-mute py-8 text-center">
                  No location distribution data recorded yet.
                </p>
              ) : (
                <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
                  {computedLocationStats.map((item) => {
                    const count = item.issueCount ?? item.count ?? 0;
                    const pct = calculatePercentage(count, totalIssuesCount);

                    return (
                      <div key={item.id} className="space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-semibold text-ink">
                            {item.name}
                          </span>
                          <span className="text-mute font-medium">
                            {count} {count === 1 ? "issue" : "issues"} ({pct}%)
                          </span>
                        </div>
                        <div className="w-full h-2 rounded-full bg-soft overflow-hidden">
                          <div
                            className="h-full bg-purple-500 rounded-full transition-all duration-500"
                            style={{ width: `${pct}%` }}
                            role="progressbar"
                            aria-valuenow={pct}
                            aria-valuemin={0}
                            aria-valuemax={100}
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

      {/* TAB 2: USER MANAGEMENT (User IDs removed, balanced columns) */}
      {activeTab === "users" && (
        <div className="p-6 rounded-3xl bg-card border border-line shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-bold text-ink">
                Campus User Accounts & Roles
              </h3>
              <p className="text-xs text-mute">
                Assign backend roles (Student, Category Head, Resolver) and
                manage account active states.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              {/* Search */}
              <div className="relative">
                <Search
                  size={14}
                  className="absolute left-3 top-2.5 text-mute"
                />
                <input
                  type="text"
                  placeholder="Search name or email..."
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

          {/* User Table without User ID column */}
          <div className="overflow-x-auto border border-line rounded-2xl">
            <table className="w-full text-left text-xs">
              <thead className="bg-soft/60 text-mute uppercase tracking-wider text-[10px] border-b border-line">
                <tr>
                  <th className="py-3 px-5 font-semibold">
                    Name & Institutional Email
                  </th>
                  <th className="py-3 px-5 font-semibold">Assigned Role</th>
                  <th className="py-3 px-5 font-semibold">Account Status</th>
                  <th className="py-3 px-5 font-semibold text-right">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-mute">
                      No users match the search criteria.
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((u) => {
                    const isAdmin = u.role.toUpperCase() === "ADMIN";
                    const isSelf = u.id === user.id;

                    return (
                      <tr
                        key={u.id}
                        className="hover:bg-soft/30 transition-colors"
                      >
                        <td className="py-3.5 px-5">
                          <div className="font-bold text-ink text-xs">
                            {u.name}
                          </div>
                          <div className="text-[11px] text-mute">{u.email}</div>
                        </td>
                        <td className="py-3.5 px-5">
                          <RoleBadge role={u.role} size="sm" />
                        </td>
                        <td className="py-3.5 px-5">
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold ${
                              u.active
                                ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20"
                                : "bg-rose-500/10 text-rose-500 border border-rose-500/20"
                            }`}
                          >
                            {u.active ? "Active" : "Deactivated"}
                          </span>
                        </td>
                        <td className="py-3.5 px-5 text-right">
                          <div className="flex items-center justify-end gap-2">
                            {/* Role change button */}
                            {!isAdmin && (
                              <button
                                type="button"
                                onClick={() => {
                                  setEditingUser(u);
                                  setTargetRole(
                                    [
                                      "STUDENT",
                                      "RESOLVER",
                                      "CATEGORY_HEAD",
                                    ].includes(u.role)
                                      ? u.role
                                      : "STUDENT",
                                  );
                                }}
                                className="px-3 py-1 rounded-lg text-[11px] font-semibold text-indigo-500 hover:bg-indigo-500/10 border border-indigo-500/20 transition-colors cursor-pointer"
                              >
                                Change Role
                              </button>
                            )}

                            {/* Deactivate / Reactivate button */}
                            {!isAdmin && !isSelf && (
                              <button
                                type="button"
                                onClick={() => handleToggleActive(u)}
                                className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                                  u.active
                                    ? "text-rose-500 hover:bg-rose-500/10 border-rose-500/20"
                                    : "text-emerald-500 hover:bg-emerald-500/10 border-emerald-500/20"
                                }`}
                                title={
                                  u.active
                                    ? "Deactivate user"
                                    : "Reactivate user"
                                }
                              >
                                {u.active ? (
                                  <UserX size={14} />
                                ) : (
                                  <UserCheck size={14} />
                                )}
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
              <h3 className="text-base font-bold text-ink">
                Campus Categories & Department Heads
              </h3>
              <p className="text-xs text-mute">
                Each category routes issues to designated resolvers. Assign
                category heads to oversee workflows.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {categories.map((cat) => (
              <div
                key={cat.id}
                className="p-5 rounded-2xl bg-card border border-line shadow-xs hover:border-indigo-500/30 transition-all flex flex-col justify-between"
              >
                <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[10px] text-mute">
                      CAT-{cat.id}
                    </span>
                    <span className="p-1.5 rounded-lg bg-soft text-indigo-500">
                      <FolderTree size={15} />
                    </span>
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-ink">{cat.name}</h4>
                    <p className="text-xs text-mute mt-1">
                      {cat.categoryHeadName ? (
                        <span className="text-ink font-medium">
                          Head: {cat.categoryHeadName}
                        </span>
                      ) : (
                        <span className="text-amber-500 font-medium">
                          Unassigned Head
                        </span>
                      )}
                    </p>
                    {cat.categoryHeadEmail && (
                      <p className="text-[11px] text-mute truncate">
                        {cat.categoryHeadEmail}
                      </p>
                    )}
                  </div>
                </div>

                <div className="mt-5 pt-3 border-t border-line">
                  <button
                    type="button"
                    onClick={() => handleOpenAssignModal(cat)}
                    className="w-full py-1.5 rounded-xl text-xs font-semibold text-indigo-500 hover:bg-indigo-500/10 border border-indigo-500/20 transition-colors cursor-pointer"
                  >
                    {cat.categoryHeadName
                      ? "Reassign Head"
                      : "Assign Category Head"}
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
              <h3 className="text-base font-bold text-ink">
                Campus Issue Moderation & Audit
              </h3>
              <p className="text-xs text-mute">
                Review, filter, and moderate all submitted campus issues.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              <div className="relative">
                <Search
                  size={14}
                  className="absolute left-3 top-2.5 text-mute"
                />
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
                      <span className="font-mono text-xs font-bold text-mute">
                        #{issue.id}
                      </span>
                      <h4 className="text-sm font-bold text-ink">
                        {issue.title}
                      </h4>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-soft text-ink border border-line">
                        {issue.categoryName || "General"}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                          issue.status === "RESOLVED" ||
                          issue.status === "CLOSED"
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
                      {issue.reporterName && (
                        <span>Reported by: {issue.reporterName}</span>
                      )}
                      {issue.locationName && (
                        <span>Location: {issue.locationName}</span>
                      )}
                      {issue.voteCount !== undefined && (
                        <span>{issue.voteCount} Votes</span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end md:self-center">
                    <button
                      type="button"
                      onClick={() => openInspectModal(issue)}
                      className="px-3 py-1.5 rounded-xl text-xs font-semibold text-ink bg-soft hover:bg-card border border-line flex items-center gap-1.5 transition-colors cursor-pointer"
                      title="Inspect Ticket Photos & Evidence"
                    >
                      <ImageIcon size={14} />
                      <span>Photos</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteIssue(issue.id, issue.title)}
                      className="p-2 rounded-xl text-rose-500 hover:bg-rose-500/10 border border-rose-500/20 transition-colors cursor-pointer"
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
              Update access level for{" "}
              <strong className="text-ink">{editingUser.name}</strong> (
              {editingUser.email}).
            </p>

            <div className="space-y-2">
              <label className="block text-xs font-semibold text-ink">
                Select Role
              </label>
              <select
                value={targetRole}
                onChange={(e) => setTargetRole(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-soft border border-line text-xs font-medium text-ink focus:outline-none focus:ring-2 focus:ring-[#818cf8]"
              >
                <option value="STUDENT">
                  Student (Issue reporter & community voting)
                </option>
                <option value="CATEGORY_HEAD">
                  Category Head (Dispatch resolver & manage category inbox)
                </option>
                <option value="RESOLVER">
                  Resolver (Field staff resolving assigned tasks)
                </option>
              </select>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setEditingUser(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-mute hover:text-ink hover:bg-soft transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleUpdateRole}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-brand-gradient hover:opacity-95 shadow-sm transition-opacity cursor-pointer"
              >
                Save Role
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: ASSIGN CATEGORY HEAD (Modern Combobox with 'No One' option and eligible CATEGORY_HEAD users only) */}
      {assigningCat && (
        <div
          className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => {
            setAssigningCat(null);
            setSelectedHeadUserId("");
            setAssignModalError(null);
          }}
        >
          <div
            className="relative w-full max-w-md rounded-2xl bg-card border border-line shadow-2xl p-6 text-ink space-y-4 animate-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="text-base font-bold text-ink">
                  Assign Category Head
                </h3>
                <p className="text-xs text-mute mt-0.5">
                  Select an authorized Category Head for{" "}
                  <strong className="text-ink">{assigningCat.name}</strong>, or
                  select &apos;No One&apos; to unassign.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setAssigningCat(null);
                  setSelectedHeadUserId("");
                  setAssignModalError(null);
                }}
                className="text-mute hover:text-ink p-1 rounded-lg hover:bg-soft transition-colors cursor-pointer"
                aria-label="Close modal"
              >
                <X size={18} />
              </button>
            </div>

            {assignModalError && (
              <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-500 text-xs flex items-start gap-2.5">
                <AlertCircle size={15} className="shrink-0 mt-0.5" />
                <span>{assignModalError}</span>
              </div>
            )}

            {eligibleCategoryHeads.length === 0 && (
              <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 text-xs flex items-start gap-2.5">
                <AlertCircle size={15} className="shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <p className="font-semibold">
                    No Category Head users available
                  </p>
                  <p className="text-[11px] opacity-90 leading-relaxed">
                    There are currently no users with the CATEGORY_HEAD role.
                    You can promote eligible users in the Users tab.
                  </p>
                </div>
              </div>
            )}

            <div className="space-y-2">
              <label
                htmlFor="category-head-select"
                className="block text-xs font-semibold text-ink"
              >
                Select Category Head <span className="text-rose-500">*</span>
              </label>

              <Combobox
                id="category-head-select"
                value={selectedHeadUserId}
                onChange={(val) => {
                  setSelectedHeadUserId(val || "NONE");
                  setAssignModalError(null);
                }}
                options={categoryHeadOptions}
                placeholder="Search Category Head or select 'No One'..."
                searchPlaceholder="Search by name or email..."
                emptyText="No matching users found"
              />
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => {
                  setAssigningCat(null);
                  setSelectedHeadUserId("");
                  setAssignModalError(null);
                }}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-mute hover:text-ink hover:bg-soft transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleAssignHead}
                disabled={assigningLoading || selectedHeadUserId === ""}
                className="px-5 py-2 rounded-xl text-xs font-semibold text-white bg-brand-gradient hover:opacity-95 shadow-sm transition-opacity disabled:opacity-50 flex items-center gap-1.5 cursor-pointer"
              >
                {assigningLoading && (
                  <RefreshCw size={13} className="animate-spin" />
                )}
                <span>
                  {assigningLoading
                    ? "Saving..."
                    : selectedHeadUserId === "NONE"
                      ? "Remove Assignment"
                      : "Confirm Assignment"}
                </span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: INSPECT ISSUE PHOTOS & EVIDENCE */}
      {inspectingIssue && (
        <div
          className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150"
          onClick={closeInspectModal}
        >
          <div
            className="w-full max-w-xl bg-card border border-line rounded-2xl shadow-2xl p-6 space-y-5"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-line">
              <div className="flex items-center gap-2">
                <span className="font-mono text-sm font-black text-indigo-500">
                  #{inspectingIssue.id}
                </span>
                <span className="text-xs font-bold px-2 py-0.5 rounded bg-soft text-ink border border-line">
                  {inspectingIssue.status}
                </span>
                <span className="text-xs font-bold px-2 py-0.5 rounded bg-rose-500/10 text-rose-500 border border-rose-500/20">
                  {inspectingIssue.priority}
                </span>
              </div>
              <button
                type="button"
                onClick={closeInspectModal}
                className="p-1 rounded-lg text-mute hover:text-ink cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-1.5">
              <h3 className="text-sm font-bold text-ink">
                {inspectingIssue.title}
              </h3>
              <p className="text-xs text-mute whitespace-pre-wrap leading-relaxed">
                {inspectingIssue.description}
              </p>
              <div className="flex flex-wrap items-center gap-3 text-xs text-mute pt-1">
                {inspectingIssue.locationName && (
                  <span>
                    Location: {inspectingIssue.locationName}
                    {inspectingIssue.floorRoom && ` (${inspectingIssue.floorRoom})`}
                  </span>
                )}
                {inspectingIssue.reporterName && (
                  <span>Reported by: {inspectingIssue.reporterName}</span>
                )}
              </div>
            </div>

            {/* Photos & Evidence Sections */}
            <div className="space-y-4 pt-1">
              {/* Reported Photos */}
              <div className="space-y-2">
                <span className="text-xs font-bold uppercase tracking-wider text-mute flex items-center gap-1.5">
                  <ImageIcon size={14} />
                  Reported Photos ({adminIssueImages.filter((i) => !i.imageType || i.imageType === "REPORTED").length})
                </span>

                {adminImagesLoading ? (
                  <div className="h-16 rounded-xl bg-soft animate-pulse" />
                ) : adminIssueImages.filter((i) => !i.imageType || i.imageType === "REPORTED").length === 0 ? (
                  <p className="text-xs text-mute italic bg-soft/50 p-2.5 rounded-xl border border-line">
                    No photos submitted with initial report.
                  </p>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {adminIssueImages
                      .filter((i) => !i.imageType || i.imageType === "REPORTED")
                      .map((img) => (
                        <div
                          key={img.id}
                          onClick={() => setPreviewImageUrl(img.imageUrl)}
                          className="aspect-video relative rounded-lg overflow-hidden border border-line bg-black/10 hover:opacity-90 transition-opacity cursor-pointer group"
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={img.imageUrl}
                            alt="Reported photo"
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-white text-[10px] font-bold">
                            View Fullscreen
                          </div>
                        </div>
                      ))}
                  </div>
                )}
              </div>

              {/* Resolution Evidence */}
              {adminIssueImages.some((i) => i.imageType === "RESOLUTION") && (
                <div className="space-y-2 p-3 rounded-xl border border-emerald-500/30 bg-emerald-500/5">
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                    <Check size={14} />
                    Resolution Evidence ({adminIssueImages.filter((i) => i.imageType === "RESOLUTION").length})
                  </span>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {adminIssueImages
                      .filter((i) => i.imageType === "RESOLUTION")
                      .map((img) => (
                        <div
                          key={img.id}
                          onClick={() => setPreviewImageUrl(img.imageUrl)}
                          className="aspect-video relative rounded-lg overflow-hidden border border-emerald-500/40 bg-black/10 hover:opacity-90 transition-opacity cursor-pointer group"
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={img.imageUrl}
                            alt="Resolution evidence"
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-white text-[10px] font-bold">
                            View Evidence
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              )}
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={closeInspectModal}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-ink bg-soft border border-line hover:bg-card transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* FULLSCREEN IMAGE LIGHTBOX */}
      {previewImageUrl && (
        <div
          className="fixed inset-0 z-60 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-150"
          onClick={() => setPreviewImageUrl(null)}
        >
          <button
            type="button"
            onClick={() => setPreviewImageUrl(null)}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
          >
            <X size={20} />
          </button>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={previewImageUrl}
            alt="Fullscreen Preview"
            className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
}
