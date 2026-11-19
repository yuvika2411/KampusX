"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
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
  RefreshCw,
  X,
  Upload,
  MessageSquare,
  Image as ImageIcon,
  ChevronLeft,
  ChevronRight,
  Calendar,
  AlertTriangle,
  ArrowRight,
  CheckCircle,
  Building2,
  Home,
  Coffee,
  FlaskConical,
  Wifi,
} from "lucide-react";
import Combobox, {
  ComboboxOption,
  ComboboxGroupMeta,
} from "@/components/ui/Combobox";
import {
  api,
  IssueResponse,
  CategoryResponse,
  LocationResponse,
  IssueStatus,
  IssuePriority,
  IssueCommentResponse,
  IssueImageResponse,
  PageResponse,
} from "@/lib/api";
import { AuthSession } from "@/lib/auth";
import { useWebSocketSubscription } from "@/lib/websocket";
import LiveStatusIndicator from "@/components/ui/LiveStatusIndicator";

interface StudentViewProps {
  user: AuthSession;
  initialTab?: "my" | "feed" | "report";
  activeTab?: "my" | "feed" | "report";
  onTabChange?: (tab: "my" | "feed" | "report") => void;
}

const LOCATION_TYPE_LABELS: Record<string, string> = {
  BOYS_HOSTEL: "Boys Hostels",
  GIRLS_HOSTEL: "Girls Hostels",
  BLOCK: "Academic & Administrative Blocks",
  FOOD_OUTLET: "Cafeterias & Food Outlets",
  LAB: "Laboratories & Centres of Excellence",
  WIFI: "Campus & Hostel Wi-Fi Zones",
  OTHER_FACILITY: "Campus Facilities & Amenities",
};

const LOCATION_GROUP_META: Record<string, ComboboxGroupMeta> = {
  BLOCK: {
    label: "Academic & Administrative Blocks",
    icon: Building2,
  },
  BOYS_HOSTEL: {
    label: "Boys Hostels",
    icon: Home,
  },
  GIRLS_HOSTEL: {
    label: "Girls Hostels",
    icon: Home,
  },
  FOOD_OUTLET: {
    label: "Cafeterias & Food Outlets",
    icon: Coffee,
  },
  LAB: {
    label: "Laboratories & Centres of Excellence",
    icon: FlaskConical,
  },
  WIFI: {
    label: "Campus & Hostel Wi-Fi Zones",
    icon: Wifi,
  },
  OTHER_FACILITY: {
    label: "Campus Facilities & Amenities",
    icon: MapPin,
  },
};

const WORKFLOW_STEPS: { status: IssueStatus; label: string }[] = [
  { status: "REPORTED", label: "Reported" },
  { status: "ASSIGNED", label: "Assigned" },
  { status: "IN_PROGRESS", label: "In Progress" },
  { status: "RESOLVED", label: "Resolved" },
  { status: "CLOSED", label: "Closed" },
];

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

export default function StudentView({
  user,
  initialTab = "my",
  activeTab: controlledTab,
  onTabChange,
}: StudentViewProps) {
  // Navigation tab state
  const [internalTab, setInternalTab] = useState<"my" | "feed" | "report">(
    initialTab,
  );
  const activeTab = controlledTab ?? internalTab;
  const setActiveTab = (tab: "my" | "feed" | "report") => {
    if (onTabChange) onTabChange(tab);
    setInternalTab(tab);
  };

  // Data states
  const [myIssues, setMyIssues] = useState<IssueResponse[]>([]);
  const [myIssuesLoading, setMyIssuesLoading] = useState(true);
  const [myIssuesError, setMyIssuesError] = useState<string | null>(null);

  // Campus Feed states (paginated via /api/issues/search)
  const [feedData, setFeedData] = useState<PageResponse<IssueResponse> | null>(
    null,
  );
  const [feedLoading, setFeedLoading] = useState(false);
  const [feedError, setFeedError] = useState<string | null>(null);
  const [feedSearch, setFeedSearch] = useState("");
  const [feedCategory, setFeedCategory] = useState<string>("All");
  const [feedStatus, setFeedStatus] = useState<string>("All");
  const [feedSort, setFeedSort] = useState<string>("newest");
  const [feedPage, setFeedPage] = useState<number>(0);

  // Filter & sort for "My Issues"
  const [myStatusFilter, setMyStatusFilter] = useState<string>("All");
  const [mySortOrder, setMySortOrder] = useState<
    "newest" | "oldest" | "upvotes"
  >("newest");

  // Metadata
  const [categories, setCategories] = useState<CategoryResponse[]>([]);
  const [locations, setLocations] = useState<LocationResponse[]>([]);
  const [locationsLoading, setLocationsLoading] = useState(false);
  const [locationsError, setLocationsError] = useState<string | null>(null);

  // Upvoting action state
  const [votingIssueId, setVotingIssueId] = useState<number | null>(null);
  const [actionAlert, setActionAlert] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  // Detail Modal / Drawer state
  const [selectedIssue, setSelectedIssue] = useState<IssueResponse | null>(
    null,
  );
  const [detailImages, setDetailImages] = useState<IssueImageResponse[]>([]);
  const [detailImagesLoading, setDetailImagesLoading] = useState(false);
  const [detailComments, setDetailComments] = useState<IssueCommentResponse[]>(
    [],
  );
  const [detailCommentsLoading, setDetailCommentsLoading] = useState(false);
  const [newCommentText, setNewCommentText] = useState("");
  const [submittingComment, setSubmittingComment] = useState(false);
  const [commentError, setCommentError] = useState<string | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);

  // Confirmation Modals (Confirm & Close, Reopen)
  const [confirmCloseTarget, setConfirmCloseTarget] =
    useState<IssueResponse | null>(null);
  const [confirmReopenTarget, setConfirmReopenTarget] =
    useState<IssueResponse | null>(null);
  const [confirmSubmitting, setConfirmSubmitting] = useState(false);

  // Form states for creating an issue
  const [formTitle, setFormTitle] = useState("");
  const [formCategoryId, setFormCategoryId] = useState<number | "">("");
  const [formLocationId, setFormLocationId] = useState<number | "">("");
  const [formFloorRoom, setFormFloorRoom] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [formError, setFormError] = useState("");
  const [formSuccess, setFormSuccess] = useState("");
  const [fieldErrors, setFieldErrors] = useState<{
    title?: string;
    category?: string;
    location?: string;
    floorRoom?: string;
    description?: string;
  }>({});

  // Optional image attachment state for new issue reporting
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [filePreviews, setFilePreviews] = useState<string[]>([]);
  const [uploadProgress, setUploadProgress] = useState<string | null>(null);

  const handleFilesSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const allowed = ["image/jpeg", "image/png", "image/webp"];
    const validFiles: File[] = [];

    Array.from(e.target.files).forEach((file) => {
      if (!allowed.includes(file.type)) {
        setFormError("Only JPG, JPEG, PNG, and WebP images are supported.");
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setFormError(`Image "${file.name}" exceeds the 5 MB size limit.`);
        return;
      }
      validFiles.push(file);
    });

    const updated = [...selectedFiles, ...validFiles].slice(0, 5);
    setSelectedFiles(updated);
    setFilePreviews(updated.map((f) => URL.createObjectURL(f)));
  };

  const handleRemoveFile = (index: number) => {
    const updated = selectedFiles.filter((_, i) => i !== index);
    setSelectedFiles(updated);
    setFilePreviews(updated.map((f) => URL.createObjectURL(f)));
  };

  // Fetch My Issues
  const loadMyIssues = useCallback(() => {
    setMyIssuesLoading(true);
    setMyIssuesError(null);
    api.issues
      .getMyIssues()
      .then((data) => {
        setMyIssues(data || []);
      })
      .catch((err) => {
        setMyIssuesError(
          err instanceof Error ? err.message : "Failed to load your issues.",
        );
      })
      .finally(() => {
        setMyIssuesLoading(false);
      });
  }, []);

  // Fetch Campus Feed (using /api/issues/search)
  const loadFeed = useCallback(() => {
    setFeedLoading(true);
    setFeedError(null);

    const categoryObj = categories.find((c) => c.name === feedCategory);
    const categoryId = categoryObj ? categoryObj.id : undefined;

    api.issues
      .searchIssues({
        search: feedSearch.trim() || undefined,
        status: feedStatus !== "All" ? feedStatus : undefined,
        categoryId,
        sort: feedSort,
        page: feedPage,
        size: 10,
      })
      .then((res) => {
        setFeedData(res);
      })
      .catch((err) => {
        setFeedError(
          err instanceof Error ? err.message : "Failed to load campus feed.",
        );
      })
      .finally(() => {
        setFeedLoading(false);
      });
  }, [categories, feedSearch, feedStatus, feedCategory, feedSort, feedPage]);

  // Load locations
  const loadLocations = useCallback(() => {
    setLocationsLoading(true);
    setLocationsError(null);
    api.locations
      .getAll()
      .then((data) => {
        setLocations(data || []);
      })
      .catch((err) => {
        setLocationsError(
          err instanceof Error
            ? err.message
            : "Failed to load campus locations.",
        );
      })
      .finally(() => {
        setLocationsLoading(false);
      });
  }, []);

  // Initial load on mount
  useEffect(() => {
    let isMounted = true;

    api.issues
      .getMyIssues()
      .then((data) => {
        if (isMounted) setMyIssues(data || []);
      })
      .catch((err) => {
        if (isMounted)
          setMyIssuesError(
            err instanceof Error ? err.message : "Failed to load your issues.",
          );
      })
      .finally(() => {
        if (isMounted) setMyIssuesLoading(false);
      });

    api.locations
      .getAll()
      .then((data) => {
        if (isMounted) setLocations(data || []);
      })
      .catch((err) => {
        if (isMounted)
          setLocationsError(
            err instanceof Error
              ? err.message
              : "Failed to load campus locations.",
          );
      })
      .finally(() => {
        if (isMounted) setLocationsLoading(false);
      });

    api.categories
      .getAll()
      .then((cats) => {
        if (isMounted) setCategories(cats || []);
      })
      .catch(() => {});

    return () => {
      isMounted = false;
    };
  }, []);

  // When feed filters change or tab is feed, trigger search
  useEffect(() => {
    if (activeTab !== "feed") return;
    let isMounted = true;

    const categoryObj = categories.find((c) => c.name === feedCategory);
    const categoryId = categoryObj ? categoryObj.id : undefined;

    api.issues
      .searchIssues({
        search: feedSearch.trim() || undefined,
        status: feedStatus !== "All" ? feedStatus : undefined,
        categoryId,
        sort: feedSort,
        page: feedPage,
        size: 10,
      })
      .then((res) => {
        if (isMounted) setFeedData(res);
      })
      .catch((err) => {
        if (isMounted)
          setFeedError(
            err instanceof Error ? err.message : "Failed to load campus feed.",
          );
      })
      .finally(() => {
        if (isMounted) setFeedLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [
    activeTab,
    categories,
    feedSearch,
    feedStatus,
    feedCategory,
    feedSort,
    feedPage,
  ]);

  // Options for modern Combobox components
  const categoryOptions: ComboboxOption[] = useMemo(() => {
    return categories.map((c) => ({
      value: c.id,
      label: c.name,
    }));
  }, [categories]);

  const locationOptions: ComboboxOption[] = useMemo(() => {
    return locations.map((loc) => ({
      value: loc.id,
      label: loc.name,
      group: loc.locationType || "OTHER_FACILITY",
    }));
  }, [locations]);

  // Real-time WebSocket subscription to Campus Feed
  useWebSocketSubscription<IssueResponse>("/topic/feed", (event) => {
    if (!event?.payload) return;
    const issue = event.payload;
    setFeedData((prev) => {
      if (!prev) return prev;
      const idx = prev.content.findIndex((i) => i.id === issue.id);
      if (idx !== -1) {
        const copy = [...prev.content];
        copy[idx] = { ...copy[idx], ...issue };
        return { ...prev, content: copy };
      }
      if (event.type === "ISSUE_CREATED") {
        return {
          ...prev,
          content: [issue, ...prev.content],
          totalElements: prev.totalElements + 1,
        };
      }
      return prev;
    });
  });

  // Real-time WebSocket subscription to Student's Queue
  useWebSocketSubscription<IssueResponse>("/user/queue/issues", (event) => {
    if (!event?.payload) return;
    const issue = event.payload;
    setMyIssues((prev) => {
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

    setSelectedIssue((prev) =>
      prev && prev.id === issue.id ? { ...prev, ...issue } : prev,
    );
  });

  // Real-time WebSocket subscription to comments on the active issue
  useWebSocketSubscription<IssueCommentResponse>(
    selectedIssue ? `/topic/issues/${selectedIssue.id}/comments` : null,
    (event) => {
      if (event?.payload) {
        setDetailComments((prev) => {
          if (prev.some((c) => c.id === event.payload.id)) return prev;
          return [...prev, event.payload];
        });
      }
    },
  );

  // Load issue detail extras (images & comments) when an issue is selected
  const openIssueDetail = (issue: IssueResponse) => {
    setSelectedIssue(issue);
    setCommentError(null);
    setNewCommentText("");

    // Load images
    setDetailImagesLoading(true);
    api.issues
      .getImages(issue.id)
      .then((imgs) => {
        setDetailImages(imgs || []);
      })
      .catch(() => {
        setDetailImages([]);
      })
      .finally(() => {
        setDetailImagesLoading(false);
      });

    // Load comments
    setDetailCommentsLoading(true);
    api.issues
      .getComments(issue.id)
      .then((cmts) => {
        setDetailComments(cmts || []);
      })
      .catch(() => {
        setDetailComments([]);
      })
      .finally(() => {
        setDetailCommentsLoading(false);
      });
  };

  const closeIssueDetail = () => {
    setSelectedIssue(null);
    setDetailImages([]);
    setDetailComments([]);
  };

  // Upvote an issue (Optimistic update with rollback)
  const handleVote = async (
    targetIssue: IssueResponse,
    e?: React.MouseEvent,
  ) => {
    if (e) e.stopPropagation();

    if (targetIssue.hasVoted) {
      setActionAlert({
        type: "error",
        message: "You have already upvoted this issue. Upvotes are permanent.",
      });
      return;
    }

    if (votingIssueId !== null) return; // Prevent double-clicks

    setVotingIssueId(targetIssue.id);

    // Save previous state for rollback
    const prevVoteCount = targetIssue.voteCount || 0;
    const prevHasVoted = !!targetIssue.hasVoted;

    // Optimistically update
    const applyOptimistic = (current: IssueResponse): IssueResponse => {
      if (current.id !== targetIssue.id) return current;
      return {
        ...current,
        voteCount: prevVoteCount + 1,
        hasVoted: true,
      };
    };

    setMyIssues((prev) => prev.map(applyOptimistic));
    if (feedData) {
      setFeedData({
        ...feedData,
        content: feedData.content.map(applyOptimistic),
      });
    }
    if (selectedIssue && selectedIssue.id === targetIssue.id) {
      setSelectedIssue({
        ...selectedIssue,
        voteCount: prevVoteCount + 1,
        hasVoted: true,
      });
    }

    try {
      await api.issues.vote(targetIssue.id);
      setActionAlert({
        type: "success",
        message: `Upvote recorded for ticket KX-${targetIssue.id}.`,
      });
    } catch (err: unknown) {
      // Rollback on failure
      const rollback = (current: IssueResponse): IssueResponse => {
        if (current.id !== targetIssue.id) return current;
        return {
          ...current,
          voteCount: prevVoteCount,
          hasVoted: prevHasVoted,
        };
      };
      setMyIssues((prev) => prev.map(rollback));
      if (feedData) {
        setFeedData({
          ...feedData,
          content: feedData.content.map(rollback),
        });
      }
      if (selectedIssue && selectedIssue.id === targetIssue.id) {
        setSelectedIssue({
          ...selectedIssue,
          voteCount: prevVoteCount,
          hasVoted: prevHasVoted,
        });
      }

      const msg =
        err instanceof Error ? err.message : "Failed to record upvote.";
      setActionAlert({ type: "error", message: msg });
    } finally {
      setVotingIssueId(null);
    }
  };

  // Add Comment inside Detail Drawer
  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedIssue || !newCommentText.trim()) return;

    setSubmittingComment(true);
    setCommentError(null);

    try {
      const added = await api.issues.addComment(
        selectedIssue.id,
        newCommentText.trim(),
      );
      setDetailComments((prev) => [...prev, added]);
      setNewCommentText("");

      // Update commentCount on the issue
      const updatedIssue = {
        ...selectedIssue,
        commentCount: (selectedIssue.commentCount || 0) + 1,
      };
      setSelectedIssue(updatedIssue);
      setMyIssues((prev) =>
        prev.map((i) => (i.id === selectedIssue.id ? updatedIssue : i)),
      );
      if (feedData) {
        setFeedData({
          ...feedData,
          content: feedData.content.map((i) =>
            i.id === selectedIssue.id ? updatedIssue : i,
          ),
        });
      }
    } catch (err: unknown) {
      setCommentError(
        err instanceof Error ? err.message : "Failed to post comment.",
      );
    } finally {
      setSubmittingComment(false);
    }
  };

  // Confirm & Close Issue
  const handleConfirmClose = async () => {
    if (!confirmCloseTarget) return;
    setConfirmSubmitting(true);
    try {
      const updated = await api.issues.closeIssue(confirmCloseTarget.id);
      setActionAlert({
        type: "success",
        message: `Ticket KX-${confirmCloseTarget.id} confirmed and marked closed.`,
      });
      setConfirmCloseTarget(null);
      loadMyIssues();
      if (selectedIssue && selectedIssue.id === updated.id) {
        setSelectedIssue(updated);
      }
    } catch (err: unknown) {
      setActionAlert({
        type: "error",
        message: err instanceof Error ? err.message : "Failed to close issue.",
      });
    } finally {
      setConfirmSubmitting(false);
    }
  };

  // Confirm Reopen Issue
  const handleConfirmReopen = async () => {
    if (!confirmReopenTarget) return;
    setConfirmSubmitting(true);
    try {
      const updated = await api.issues.reopenIssue(confirmReopenTarget.id);
      setActionAlert({
        type: "success",
        message: `Ticket KX-${confirmReopenTarget.id} reopened for further maintenance.`,
      });
      setConfirmReopenTarget(null);
      loadMyIssues();
      if (selectedIssue && selectedIssue.id === updated.id) {
        setSelectedIssue(updated);
      }
    } catch (err: unknown) {
      setActionAlert({
        type: "error",
        message: err instanceof Error ? err.message : "Failed to reopen issue.",
      });
    } finally {
      setConfirmSubmitting(false);
    }
  };

  // Submit New Issue
  const handleCreateIssue = async (e: React.FormEvent) => {
    e.preventDefault();
    const errors: typeof fieldErrors = {};

    if (!formTitle.trim()) {
      errors.title = "Issue title is required";
    } else if (formTitle.trim().length > 255) {
      errors.title = "Title must not exceed 255 characters";
    }

    if (!formCategoryId) {
      errors.category = "Please select a category";
    }

    if (!formLocationId) {
      errors.location = "Please select a campus location";
    }

    if (!formFloorRoom.trim()) {
      errors.floorRoom = "Floor / Room is required (e.g. 2nd Floor, Room 204)";
    } else if (formFloorRoom.trim().length > 100) {
      errors.floorRoom = "Floor / Room must not exceed 100 characters";
    }

    if (!formDescription.trim()) {
      errors.description = "Detailed description is required";
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setFormError("Please fix the highlighted errors before submitting.");
      return;
    }

    setFieldErrors({});
    setFormSubmitting(true);
    setFormError("");
    setFormSuccess("");

    try {
      const created = await api.issues.createIssue({
        title: formTitle.trim(),
        description: formDescription.trim(),
        categoryId: Number(formCategoryId),
        locationId: Number(formLocationId),
        floorRoom: formFloorRoom.trim(),
      });

      if (selectedFiles.length > 0) {
        for (let i = 0; i < selectedFiles.length; i++) {
          setUploadProgress(
            `Uploading attachment ${i + 1} of ${selectedFiles.length}...`,
          );
          try {
            await api.issues.uploadImage(
              created.id,
              selectedFiles[i],
              "REPORTED",
            );
          } catch (uploadErr) {
            console.warn("Failed to upload image", uploadErr);
          }
        }
      }

      setFormSuccess(
        "Issue submitted successfully! Your campus desk has been notified.",
      );
      setFormTitle("");
      setFormDescription("");
      setFormCategoryId("");
      setFormLocationId("");
      setFormFloorRoom("");
      setSelectedFiles([]);
      setFilePreviews([]);
      setUploadProgress(null);
      setFieldErrors({});
      loadMyIssues();
      setTimeout(() => {
        setActiveTab("my");
        setFormSuccess("");
      }, 1500);
    } catch (err: unknown) {
      setFormError(
        err instanceof Error
          ? err.message
          : "Failed to create issue. Please try again.",
      );
    } finally {
      setFormSubmitting(false);
    }
  };

  // Calculate real stat card values
  const beingWorkedOnCount = myIssues.filter(
    (i) => i.status === "ASSIGNED" || i.status === "IN_PROGRESS",
  ).length;

  const resolvedOrClosedCount = myIssues.filter(
    (i) => i.status === "RESOLVED" || i.status === "CLOSED",
  ).length;

  const totalMyVotes = myIssues.reduce(
    (acc, curr) => acc + (curr.voteCount || 0),
    0,
  );

  const awaitingConfirmationCount = myIssues.filter(
    (i) => i.status === "RESOLVED",
  ).length;

  // Filtered & Sorted "My Issues"
  const filteredMyIssues = useMemo(() => {
    let list = [...myIssues];
    if (myStatusFilter !== "All") {
      list = list.filter((i) => i.status === myStatusFilter);
    }
    list.sort((a, b) => {
      if (mySortOrder === "newest") return b.id - a.id;
      if (mySortOrder === "oldest") return a.id - b.id;
      if (mySortOrder === "upvotes")
        return (b.voteCount || 0) - (a.voteCount || 0);
      return 0;
    });
    return list;
  }, [myIssues, myStatusFilter, mySortOrder]);

  // Status Badge Component
  const renderStatusBadge = (status: IssueStatus) => {
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

  // Priority Badge Component
  const renderPriorityBadge = (priority?: IssuePriority) => {
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
      default:
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-soft text-mute border border-line">
            Low
          </span>
        );
    }
  };

  // Progress Stepper Tracker
  const renderWorkflowStepper = (status: IssueStatus) => {
    if (status === "REOPENED") {
      return (
        <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs font-semibold">
          <RotateCcw
            size={14}
            className="animate-spin text-rose-500"
            style={{ animationDuration: "3s" }}
          />
          <span>
            Ticket Reopened — Awaiting resolver re-engagement & revised
            maintenance.
          </span>
        </div>
      );
    }

    const currentStepIndex = WORKFLOW_STEPS.findIndex(
      (s) => s.status === status,
    );

    return (
      <div className="w-full pt-1 pb-1">
        <div className="flex items-center justify-between relative">
          {/* Background Connector Bar */}
          <div className="absolute left-2.5 right-2.5 top-2.5 -translate-y-1/2 h-0.5 bg-line -z-0" />
          {/* Active Connector Progress */}
          <div
            className="absolute left-2.5 top-2.5 -translate-y-1/2 h-0.5 bg-indigo-500 transition-all duration-300 -z-0"
            style={{
              width: `${Math.max(0, (currentStepIndex / (WORKFLOW_STEPS.length - 1)) * 100)}%`,
            }}
          />

          {WORKFLOW_STEPS.map((step, idx) => {
            const isCompleted = idx <= currentStepIndex;
            const isCurrent = idx === currentStepIndex;
            return (
              <div
                key={step.status}
                className="flex flex-col items-center relative z-10"
              >
                <div
                  className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold transition-all ${
                    isCurrent
                      ? "bg-indigo-600 text-white ring-4 ring-indigo-500/20"
                      : isCompleted
                        ? "bg-indigo-500 text-white"
                        : "bg-card border border-line text-mute"
                  }`}
                >
                  {isCompleted ? <Check size={11} strokeWidth={3} /> : idx + 1}
                </div>
                <span
                  className={`text-[10px] mt-1 font-medium ${
                    isCurrent
                      ? "font-bold text-indigo-500"
                      : isCompleted
                        ? "text-ink"
                        : "text-mute"
                  }`}
                >
                  {step.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* 1. Welcome Hero Section with Real Next-Step Hint */}
      <div className="p-5 sm:p-6 rounded-2xl bg-card border border-line shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-5">
        <div className="space-y-1.5 max-w-2xl">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black text-ink tracking-tight">
              Welcome back, {user.name || "Student"}!
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-indigo-500/10 text-indigo-500 border border-indigo-500/20">
              Student Reporter
            </span>
          </div>

          {/* Real Dynamic Next-Step Hint */}
          <div className="text-xs sm:text-sm text-mute flex items-center gap-2">
            {awaitingConfirmationCount > 0 ? (
              <div className="inline-flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-semibold bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20">
                <AlertTriangle
                  size={14}
                  className="shrink-0 text-emerald-500"
                />
                <span>
                  {awaitingConfirmationCount === 1
                    ? "1 issue is waiting for your confirmation & closure."
                    : `${awaitingConfirmationCount} issues are waiting for your confirmation & closure.`}
                </span>
              </div>
            ) : beingWorkedOnCount > 0 ? (
              <div className="inline-flex items-center gap-1.5 text-indigo-600 dark:text-indigo-400 font-medium">
                <Clock3 size={14} className="shrink-0" />
                <span>
                  {beingWorkedOnCount === 1
                    ? "1 issue is currently assigned and being resolved."
                    : `${beingWorkedOnCount} issues are currently assigned and being resolved.`}
                </span>
              </div>
            ) : myIssues.length > 0 ? (
              <span>All reported issues are currently tracked or closed.</span>
            ) : (
              <span>
                No active reports logged yet. Spotted an issue on campus? Report
                it below.
              </span>
            )}
          </div>
        </div>

        {/* Primary CTA (Button 1 of at most 2 entry points) */}
        <button
          type="button"
          onClick={() => setActiveTab("report")}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-white bg-brand-gradient hover:opacity-95 shadow-md shadow-indigo-500/25 transition-all shrink-0 cursor-pointer"
        >
          <PlusCircle size={16} />
          <span>Report an Issue</span>
        </button>
      </div>

      {/* Global Action Alerts */}
      {actionAlert && (
        <div
          className={`p-3.5 rounded-xl border text-xs flex items-center justify-between ${
            actionAlert.type === "success"
              ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
              : "border-rose-500/30 bg-rose-500/10 text-rose-600 dark:text-rose-400"
          }`}
        >
          <div className="flex items-center gap-2">
            {actionAlert.type === "success" ? (
              <CheckCircle size={15} />
            ) : (
              <AlertCircle size={15} />
            )}
            <span>{actionAlert.message}</span>
          </div>
          <button
            type="button"
            onClick={() => setActionAlert(null)}
            className="p-1 hover:opacity-75 cursor-pointer"
          >
            <X size={14} />
          </button>
        </div>
      )}

      {/* 2. Stat Cards Based Exclusively on Real Backend Data */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 rounded-2xl bg-card border border-line shadow-xs">
          <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-mute block">
            My Reported Issues
          </span>
          <span className="text-2xl sm:text-3xl font-black text-ink mt-1 block">
            {myIssuesLoading ? "…" : myIssues.length}
          </span>
          <span className="text-[11px] text-mute mt-0.5 block">
            Tickets logged by your account
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-card border border-line shadow-xs">
          <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-mute block">
            Being Worked On
          </span>
          <span className="text-2xl sm:text-3xl font-black text-indigo-500 mt-1 block">
            {myIssuesLoading ? "…" : beingWorkedOnCount}
          </span>
          <span className="text-[11px] text-mute mt-0.5 block">
            Assigned & in-progress tickets
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-card border border-line shadow-xs">
          <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-mute block">
            Resolved or Closed
          </span>
          <span className="text-2xl sm:text-3xl font-black text-emerald-500 mt-1 block">
            {myIssuesLoading ? "…" : resolvedOrClosedCount}
          </span>
          <span className="text-[11px] text-mute mt-0.5 block">
            Verified resolutions & closures
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-card border border-line shadow-xs">
          <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-mute block">
            Community Upvotes
          </span>
          <span className="text-2xl sm:text-3xl font-black text-blue-500 mt-1 block">
            {myIssuesLoading ? "…" : totalMyVotes}
          </span>
          <span className="text-[11px] text-mute mt-0.5 block">
            Peers backing your reports
          </span>
        </div>
      </div>

      {/* Navigation Tabs Header */}
      <div className="flex items-center justify-between border-b border-line gap-2 overflow-x-auto pb-1">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveTab("my")}
            className={`px-4 py-2.5 text-xs sm:text-sm font-bold border-b-2 whitespace-nowrap transition-colors flex items-center gap-2 cursor-pointer ${
              activeTab === "my"
                ? "border-indigo-500 text-indigo-500"
                : "border-transparent text-mute hover:text-ink"
            }`}
          >
            <FolderOpen size={16} />
            <span>My Issues ({myIssues.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("feed")}
            className={`px-4 py-2.5 text-xs sm:text-sm font-bold border-b-2 whitespace-nowrap transition-colors flex items-center gap-2 cursor-pointer ${
              activeTab === "feed"
                ? "border-indigo-500 text-indigo-500"
                : "border-transparent text-mute hover:text-ink"
            }`}
          >
            <Sparkles size={16} />
            <span>Campus Feed</span>
          </button>

          {/* Tab Header (Button 2 of at most 2 entry points) */}
          <button
            type="button"
            onClick={() => setActiveTab("report")}
            className={`px-4 py-2.5 text-xs sm:text-sm font-bold border-b-2 whitespace-nowrap transition-colors flex items-center gap-2 cursor-pointer ${
              activeTab === "report"
                ? "border-indigo-500 text-indigo-500"
                : "border-transparent text-mute hover:text-ink"
            }`}
          >
            <PlusCircle size={16} />
            <span>Report an Issue</span>
          </button>
        </div>

        <div className="hidden sm:flex items-center shrink-0 pr-1">
          <LiveStatusIndicator />
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. TAB 1: MY ISSUES */}
      {/* ========================================================================= */}
      {activeTab === "my" && (
        <div className="space-y-4">
          {/* Filter and Sort Toolbar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3.5 rounded-2xl bg-card border border-line">
            <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
              <span className="text-xs font-semibold text-mute flex items-center gap-1 shrink-0">
                <Filter size={13} />
                Status:
              </span>
              <select
                value={myStatusFilter}
                onChange={(e) => setMyStatusFilter(e.target.value)}
                className="rounded-xl border border-line bg-soft px-3 py-1.5 text-xs font-semibold text-ink focus:outline-none focus:ring-2 focus:ring-[#818cf8]"
              >
                <option value="All">All Statuses ({myIssues.length})</option>
                <option value="REPORTED">Reported</option>
                <option value="ASSIGNED">Assigned</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="RESOLVED">Resolved (Needs Confirmation)</option>
                <option value="CLOSED">Closed</option>
                <option value="REOPENED">Reopened</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-mute shrink-0">
                Sort:
              </span>
              <select
                value={mySortOrder}
                onChange={(e) =>
                  setMySortOrder(
                    e.target.value as "newest" | "oldest" | "upvotes",
                  )
                }
                className="rounded-xl border border-line bg-soft px-3 py-1.5 text-xs font-semibold text-ink focus:outline-none focus:ring-2 focus:ring-[#818cf8]"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="upvotes">Most Upvoted</option>
              </select>
              <button
                type="button"
                onClick={loadMyIssues}
                title="Refresh issues"
                className="p-1.5 rounded-xl border border-line bg-soft text-mute hover:text-ink transition-colors cursor-pointer"
              >
                <RefreshCw
                  size={14}
                  className={myIssuesLoading ? "animate-spin" : ""}
                />
              </button>
            </div>
          </div>

          {/* Loading Skeletons */}
          {myIssuesLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[1, 2, 3, 4].map((n) => (
                <div
                  key={n}
                  className="p-5 rounded-2xl bg-card border border-line space-y-3 animate-pulse"
                >
                  <div className="flex items-center justify-between">
                    <div className="h-4 w-16 bg-soft rounded" />
                    <div className="h-4 w-20 bg-soft rounded" />
                  </div>
                  <div className="h-5 w-3/4 bg-soft rounded" />
                  <div className="h-10 w-full bg-soft rounded" />
                  <div className="h-6 w-full bg-soft rounded" />
                </div>
              ))}
            </div>
          ) : myIssuesError ? (
            /* Error State with Retry */
            <div className="p-8 rounded-2xl bg-card border border-rose-500/20 text-center space-y-3">
              <AlertCircle className="w-8 h-8 mx-auto text-rose-500" />
              <h3 className="text-sm font-bold text-ink">
                Failed to load your issues
              </h3>
              <p className="text-xs text-mute max-w-md mx-auto">
                {myIssuesError}
              </p>
              <button
                type="button"
                onClick={loadMyIssues}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-brand-gradient hover:opacity-90 cursor-pointer"
              >
                <RefreshCw size={13} />
                <span>Retry</span>
              </button>
            </div>
          ) : filteredMyIssues.length === 0 ? (
            /* Empty State */
            <div className="p-10 rounded-2xl bg-card border border-line text-center text-mute space-y-3">
              <FolderOpen className="w-10 h-10 mx-auto opacity-30 text-indigo-500" />
              <h3 className="text-base font-bold text-ink">
                {myStatusFilter === "All"
                  ? "You haven't reported any issues yet"
                  : `No tickets found with status: ${myStatusFilter}`}
              </h3>
              <p className="text-xs max-w-md mx-auto">
                {myStatusFilter === "All"
                  ? "Spotted a damaged facility or malfunctioning equipment? Submit a report so campus resolvers can fix it."
                  : "Change the status filter above to view your other tickets."}
              </p>
              {myStatusFilter === "All" && (
                <button
                  type="button"
                  onClick={() => setActiveTab("report")}
                  className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-brand-gradient cursor-pointer"
                >
                  <PlusCircle size={14} />
                  <span>Submit Your First Report</span>
                </button>
              )}
            </div>
          ) : (
            /* Cards Grid */
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredMyIssues.map((issue) => {
                const isResolved = issue.status === "RESOLVED";
                const isClosed = issue.status === "CLOSED";
                const createdDateFormatted = formatIssueDate(issue.createdAt);

                return (
                  <div
                    key={issue.id}
                    onClick={() => openIssueDetail(issue)}
                    className={`p-5 rounded-2xl bg-card border shadow-xs transition-all flex flex-col justify-between gap-4 cursor-pointer hover:border-indigo-500 ${
                      isResolved
                        ? "border-emerald-500/50 ring-1 ring-emerald-500/30 bg-emerald-500/[0.02]"
                        : "border-line"
                    }`}
                  >
                    <div className="space-y-3">
                      {/* Top Meta Header */}
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-mono font-bold text-indigo-500">
                          KX-{issue.id}
                        </span>
                        <div className="flex items-center gap-1.5">
                          {renderStatusBadge(issue.status)}
                          {renderPriorityBadge(issue.priority)}
                        </div>
                      </div>

                      {/* Title & Description Snippet */}
                      <div>
                        <h3 className="text-sm font-bold text-ink line-clamp-2">
                          {issue.title}
                        </h3>
                        <p className="text-xs text-mute line-clamp-2 leading-relaxed mt-1">
                          {issue.description}
                        </p>
                      </div>

                      {/* Location & Floor/Room, Category, Date */}
                      <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px] text-mute border-t border-line">
                        <span className="font-medium text-ink/80 bg-soft px-2 py-0.5 rounded border border-line">
                          {issue.categoryName || "General"}
                        </span>
                        {issue.locationName && (
                          <span className="flex items-center gap-1 text-ink/70">
                            <MapPin size={12} />
                            <span>
                              {issue.locationName}
                              {issue.floorRoom ? ` • ${issue.floorRoom}` : ""}
                            </span>
                          </span>
                        )}
                        {createdDateFormatted && (
                          <span className="flex items-center gap-1 text-mute">
                            <Calendar size={11} />
                            {createdDateFormatted}
                          </span>
                        )}
                      </div>

                      {/* Workflow Stepper Tracker */}
                      <div className="pt-2">
                        {renderWorkflowStepper(issue.status)}
                      </div>

                      {/* Special Banner if RESOLVED: Needs confirmation */}
                      {isResolved && (
                        <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 text-xs space-y-1">
                          <div className="font-bold flex items-center gap-1.5">
                            <CheckCircle2
                              size={14}
                              className="text-emerald-500"
                            />
                            <span>Needs your confirmation</span>
                          </div>
                          <p className="text-[11px] text-mute">
                            Maintenance has marked this resolved. Please verify
                            the fix.
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Bottom Actions Row */}
                    <div className="pt-3 border-t border-line flex items-center justify-between text-xs">
                      {/* Interactive Upvote Button */}
                      <button
                        type="button"
                        onClick={(e) => handleVote(issue, e)}
                        disabled={issue.hasVoted || votingIssueId === issue.id}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                          issue.hasVoted
                            ? "bg-indigo-500/10 border-indigo-500/30 text-indigo-500"
                            : "bg-soft border-line text-mute hover:text-ink hover:border-indigo-500"
                        }`}
                        title={
                          issue.hasVoted
                            ? "You have upvoted this issue"
                            : "Upvote ticket"
                        }
                      >
                        <ThumbsUp
                          size={12}
                          className={
                            issue.hasVoted
                              ? "fill-indigo-500 text-indigo-500"
                              : ""
                          }
                        />
                        <span>{issue.voteCount || 0}</span>
                      </button>

                      {/* Student Confirmation Buttons */}
                      <div
                        className="flex items-center gap-2"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {isResolved && (
                          <>
                            <button
                              type="button"
                              onClick={() => setConfirmReopenTarget(issue)}
                              className="px-2.5 py-1.5 rounded-lg text-xs font-bold text-rose-500 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 flex items-center gap-1 transition-colors cursor-pointer"
                            >
                              <RotateCcw size={12} />
                              <span>Reopen</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => setConfirmCloseTarget(issue)}
                              className="px-3 py-1.5 rounded-lg text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 flex items-center gap-1 shadow-xs transition-colors cursor-pointer"
                            >
                              <Check size={13} strokeWidth={3} />
                              <span>Confirm & Close</span>
                            </button>
                          </>
                        )}

                        {isClosed && (
                          <button
                            type="button"
                            onClick={() => setConfirmReopenTarget(issue)}
                            className="px-3 py-1.5 rounded-lg text-xs font-bold text-ink bg-soft hover:bg-card border border-line flex items-center gap-1 transition-colors cursor-pointer"
                          >
                            <RotateCcw size={12} />
                            <span>Reopen Ticket</span>
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            openIssueDetail(issue);
                          }}
                          className="text-[11px] font-semibold text-indigo-500 
             flex items-center gap-0.5 ml-1
             hover:text-indigo-700 transition-colors cursor-pointer"
                        >
                          <span>Details</span>
                          <ChevronRight size={13} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. TAB 2: CAMPUS FEED (Paginated & Filterable via /api/issues/search) */}
      {/* ========================================================================= */}
      {activeTab === "feed" && (
        <div className="space-y-4">
          {/* Search & Filter Bar */}
          <div className="p-4 rounded-2xl bg-card border border-line space-y-3">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              {/* Search input */}
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-mute absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Search campus issues by keyword or location…"
                  value={feedSearch}
                  onChange={(e) => {
                    setFeedSearch(e.target.value);
                    setFeedPage(0);
                  }}
                  className="w-full rounded-xl border border-line bg-soft pl-9 pr-3 py-2 text-xs font-medium text-ink placeholder:text-mute focus:outline-none focus:ring-2 focus:ring-[#818cf8]"
                />
              </div>

              {/* Category Filter */}
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-mute flex items-center gap-1 shrink-0">
                  <Filter size={13} />
                  Category:
                </span>
                <select
                  value={feedCategory}
                  onChange={(e) => {
                    setFeedCategory(e.target.value);
                    setFeedPage(0);
                  }}
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

              {/* Status Filter */}
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-mute shrink-0">
                  Status:
                </span>
                <select
                  value={feedStatus}
                  onChange={(e) => {
                    setFeedStatus(e.target.value);
                    setFeedPage(0);
                  }}
                  className="rounded-xl border border-line bg-soft px-3 py-2 text-xs font-semibold text-ink focus:outline-none focus:ring-2 focus:ring-[#818cf8]"
                >
                  <option value="All">All Statuses</option>
                  <option value="REPORTED">Reported</option>
                  <option value="ASSIGNED">Assigned</option>
                  <option value="IN_PROGRESS">In Progress</option>
                  <option value="RESOLVED">Resolved</option>
                  <option value="CLOSED">Closed</option>
                </select>
              </div>

              {/* Sort Order */}
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-mute shrink-0">
                  Sort:
                </span>
                <select
                  value={feedSort}
                  onChange={(e) => {
                    setFeedSort(e.target.value);
                    setFeedPage(0);
                  }}
                  className="rounded-xl border border-line bg-soft px-3 py-2 text-xs font-semibold text-ink focus:outline-none focus:ring-2 focus:ring-[#818cf8]"
                >
                  <option value="newest">Newest</option>
                  <option value="oldest">Oldest</option>
                  <option value="priority">Priority</option>
                </select>
              </div>
            </div>
          </div>

          {/* Feed Content */}
          {feedLoading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4].map((n) => (
                <div
                  key={n}
                  className="p-4 sm:p-5 rounded-2xl bg-card border border-line flex items-start justify-between gap-4 animate-pulse"
                >
                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-28 bg-soft rounded" />
                    <div className="h-5 w-3/4 bg-soft rounded" />
                    <div className="h-8 w-full bg-soft rounded" />
                  </div>
                  <div className="w-14 h-14 bg-soft rounded-xl shrink-0" />
                </div>
              ))}
            </div>
          ) : feedError ? (
            <div className="p-8 rounded-2xl bg-card border border-rose-500/20 text-center space-y-3">
              <AlertCircle className="w-8 h-8 mx-auto text-rose-500" />
              <h3 className="text-sm font-bold text-ink">
                Failed to load campus feed
              </h3>
              <p className="text-xs text-mute max-w-md mx-auto">{feedError}</p>
              <button
                type="button"
                onClick={loadFeed}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-brand-gradient hover:opacity-90 cursor-pointer"
              >
                <RefreshCw size={13} />
                <span>Retry</span>
              </button>
            </div>
          ) : !feedData || feedData.content.length === 0 ? (
            <div className="p-12 rounded-2xl bg-card border border-line text-center text-mute space-y-2">
              <Search className="w-8 h-8 mx-auto opacity-30 text-indigo-500" />
              <p className="text-sm font-semibold text-ink">
                No matching campus issues found
              </p>
              <p className="text-xs">
                Try adjusting your keyword, category, or status filters.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {feedData.content.map((issue) => {
                const isReporterSelf =
                  (user.id && issue.reporterId === user.id) ||
                  myIssues.some((m) => m.id === issue.id);
                const createdDateFormatted = formatIssueDate(issue.createdAt);

                return (
                  <div
                    key={issue.id}
                    onClick={() => openIssueDetail(issue)}
                    className="p-4 sm:p-5 rounded-2xl bg-card border border-line shadow-xs hover:border-[#818cf8] transition-all flex items-start justify-between gap-4 cursor-pointer"
                  >
                    <div className="flex-1 space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xs font-mono font-bold text-indigo-500">
                          KX-{issue.id}
                        </span>
                        {renderStatusBadge(issue.status)}
                        {renderPriorityBadge(issue.priority)}
                        <span className="text-xs font-semibold text-ink/80 bg-soft px-2 py-0.5 rounded-md border border-line">
                          {issue.categoryName || "General"}
                        </span>
                      </div>

                      <h4 className="text-sm font-bold text-ink leading-snug">
                        {issue.title}
                      </h4>
                      <p className="text-xs text-mute leading-relaxed line-clamp-2">
                        {issue.description}
                      </p>

                      <div className="flex flex-wrap items-center gap-3 pt-2 text-[11px] text-mute border-t border-line">
                        {issue.locationName && (
                          <span className="flex items-center gap-1 font-medium text-ink/80">
                            <MapPin size={12} />
                            <span>
                              {issue.locationName}
                              {issue.floorRoom ? ` • ${issue.floorRoom}` : ""}
                            </span>
                          </span>
                        )}
                        {createdDateFormatted && (
                          <span className="flex items-center gap-1 text-mute">
                            <Calendar size={11} />
                            {createdDateFormatted}
                          </span>
                        )}
                        <span className="text-mute">
                          {isReporterSelf ? (
                            <strong className="text-indigo-500 font-semibold">
                              Reported by you
                            </strong>
                          ) : (
                            "Reported by a student"
                          )}
                        </span>
                        {issue.commentCount !== undefined &&
                          issue.commentCount > 0 && (
                            <span className="flex items-center gap-1 text-mute">
                              <MessageSquare size={11} />
                              {issue.commentCount}{" "}
                              {issue.commentCount === 1
                                ? "comment"
                                : "comments"}
                            </span>
                          )}
                      </div>
                    </div>

                    {/* Upvote Button on Feed Card */}
                    <button
                      type="button"
                      onClick={(e) => handleVote(issue, e)}
                      disabled={issue.hasVoted || votingIssueId === issue.id}
                      className={`flex flex-col items-center justify-center min-w-[56px] px-3 py-2.5 rounded-xl border transition-all text-xs font-bold shrink-0 cursor-pointer ${
                        issue.hasVoted
                          ? "bg-indigo-500/10 border-indigo-500/40 text-indigo-500 ring-1 ring-indigo-500/20"
                          : "bg-soft border-line text-ink hover:border-indigo-500 hover:text-indigo-500"
                      }`}
                      title={
                        issue.hasVoted
                          ? "You have upvoted this issue"
                          : "Upvote if this affects you"
                      }
                    >
                      <ThumbsUp
                        size={16}
                        className={`mb-1 transition-transform ${
                          issue.hasVoted
                            ? "fill-indigo-500 text-indigo-500"
                            : "text-mute hover:scale-110"
                        }`}
                      />
                      <span>{issue.voteCount || 0}</span>
                    </button>
                  </div>
                );
              })}

              {/* Feed Pagination Bar */}
              {feedData.totalPages > 1 && (
                <div className="flex items-center justify-between p-4 rounded-2xl bg-card border border-line text-xs">
                  <span className="text-mute">
                    Page <strong>{feedData.number + 1}</strong> of{" "}
                    <strong>{feedData.totalPages}</strong> (
                    {feedData.totalElements} issues)
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      disabled={feedData.number <= 0 || feedLoading}
                      onClick={() => setFeedPage((p) => Math.max(0, p - 1))}
                      className="px-3 py-1.5 rounded-lg border border-line bg-soft text-ink font-semibold disabled:opacity-40 flex items-center gap-1 cursor-pointer"
                    >
                      <ChevronLeft size={14} />
                      <span>Prev</span>
                    </button>
                    <button
                      type="button"
                      disabled={
                        feedData.number + 1 >= feedData.totalPages ||
                        feedLoading
                      }
                      onClick={() => setFeedPage((p) => p + 1)}
                      className="px-3 py-1.5 rounded-lg border border-line bg-soft text-ink font-semibold disabled:opacity-40 flex items-center gap-1 cursor-pointer"
                    >
                      <span>Next</span>
                      <ChevronRight size={14} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 5. TAB 3: REPORT AN ISSUE FORM */}
      {/* ========================================================================= */}
      {activeTab === "report" && (
        <div className="max-w-2xl mx-auto rounded-2xl bg-card border border-line p-6 sm:p-8 shadow-sm">
          <div className="mb-6">
            <h2 className="text-lg font-bold text-ink">
              Submit a Campus Maintenance Ticket
            </h2>
            <p className="text-xs text-mute mt-1">
              Your issue will be categorized and routed to the assigned
              department head immediately.
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
                maxLength={255}
                placeholder="e.g. Central Library 3rd Floor Wi-Fi AP Dropping Connections"
                value={formTitle}
                onChange={(e) => {
                  setFormTitle(e.target.value);
                  setFieldErrors((prev) => ({ ...prev, title: undefined }));
                }}
                className={`w-full rounded-xl border ${
                  fieldErrors.title ? "border-rose-500" : "border-line"
                } bg-soft px-3.5 py-2.5 text-xs font-medium text-ink placeholder:text-mute focus:outline-none focus:ring-2 focus:ring-[#818cf8]`}
              />
              {fieldErrors.title && (
                <p className="text-[11px] text-rose-500 mt-1">
                  {fieldErrors.title}
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Combobox
                  id="form-category"
                  label="Category"
                  required
                  value={formCategoryId}
                  onChange={(val) => {
                    setFormCategoryId(val === "" ? "" : Number(val));
                    setFieldErrors((prev) => ({
                      ...prev,
                      category: undefined,
                    }));
                  }}
                  options={categoryOptions}
                  placeholder="Select a Category"
                  searchPlaceholder="Search categories..."
                  emptyText="No categories found"
                  error={fieldErrors.category}
                />
              </div>

              <div>
                <Combobox
                  id="form-location"
                  label="Campus Location"
                  required
                  value={formLocationId}
                  onChange={(val) => {
                    setFormLocationId(val === "" ? "" : Number(val));
                    setFieldErrors((prev) => ({
                      ...prev,
                      location: undefined,
                    }));
                  }}
                  options={locationOptions}
                  groupMeta={LOCATION_GROUP_META}
                  placeholder="-- Choose Building / Facility --"
                  searchPlaceholder="Search building, hostel, or facility..."
                  emptyText="No campus locations found"
                  loading={locationsLoading}
                  errorMessage={locationsError || undefined}
                  onRetry={loadLocations}
                  error={fieldErrors.location}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-ink mb-1.5">
                Floor / Room <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                maxLength={100}
                placeholder="e.g. 2nd Floor, Room 204"
                value={formFloorRoom}
                onChange={(e) => {
                  setFormFloorRoom(e.target.value);
                  setFieldErrors((prev) => ({ ...prev, floorRoom: undefined }));
                }}
                className={`w-full rounded-xl border ${
                  fieldErrors.floorRoom ? "border-rose-500" : "border-line"
                } bg-soft px-3.5 py-2.5 text-xs font-medium text-ink placeholder:text-mute focus:outline-none focus:ring-2 focus:ring-[#818cf8]`}
              />
              {fieldErrors.floorRoom && (
                <p className="text-[11px] text-rose-500 mt-1">
                  {fieldErrors.floorRoom}
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-ink mb-1.5">
                Detailed Description <span className="text-rose-500">*</span>
              </label>
              <textarea
                rows={4}
                placeholder="Describe the issue, recurrence, and impact so the assigned resolver understands the problem…"
                value={formDescription}
                onChange={(e) => {
                  setFormDescription(e.target.value);
                  setFieldErrors((prev) => ({
                    ...prev,
                    description: undefined,
                  }));
                }}
                className={`w-full rounded-xl border ${
                  fieldErrors.description ? "border-rose-500" : "border-line"
                } bg-soft px-3.5 py-2.5 text-xs font-medium text-ink placeholder:text-mute focus:outline-none focus:ring-2 focus:ring-[#818cf8] resize-none`}
              />
              {fieldErrors.description && (
                <p className="text-[11px] text-rose-500 mt-1">
                  {fieldErrors.description}
                </p>
              )}
            </div>

            {/* Optional Image Attachments */}
            <div className="space-y-2 pt-1">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold text-ink">
                  Attach Images <span className="text-mute font-normal">(Optional)</span>
                </label>
                <span className="text-[11px] text-mute">
                  {selectedFiles.length}/5 selected
                </span>
              </div>

              {/* Upload Dropzone */}
              <div className="border border-dashed border-line hover:border-[#818cf8] rounded-xl p-4 bg-soft/50 text-center transition-colors">
                <input
                  type="file"
                  id="student-image-upload"
                  multiple
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleFilesSelect}
                  className="hidden"
                  disabled={formSubmitting || selectedFiles.length >= 5}
                />
                <label
                  htmlFor="student-image-upload"
                  className={`inline-flex flex-col items-center gap-1.5 cursor-pointer ${
                    formSubmitting || selectedFiles.length >= 5
                      ? "opacity-50 cursor-not-allowed"
                      : ""
                  }`}
                >
                  <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-500 flex items-center justify-center">
                    <Upload size={16} />
                  </div>
                  <span className="text-xs font-semibold text-ink">
                    Click to browse photos
                  </span>
                  <span className="text-[11px] text-mute">
                    Supports JPG, PNG, WebP (max 5 MB each, up to 5 photos)
                  </span>
                </label>
              </div>

              {/* Preview thumbnails */}
              {filePreviews.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
                  {filePreviews.map((preview, idx) => (
                    <div
                      key={idx}
                      className="relative rounded-xl overflow-hidden border border-line aspect-video group bg-black/5"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={preview}
                        alt={`Preview ${idx + 1}`}
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveFile(idx)}
                        disabled={formSubmitting}
                        className="absolute top-1 right-1 p-1 rounded-full bg-black/75 hover:bg-black text-white transition-opacity shadow-xs cursor-pointer"
                        title="Remove photo"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Upload progress message */}
              {uploadProgress && (
                <div className="pt-1 text-xs font-semibold text-indigo-500 flex items-center gap-1.5 animate-pulse">
                  <Loader2 size={13} className="animate-spin" />
                  <span>{uploadProgress}</span>
                </div>
              )}
            </div>

            <div className="pt-2 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => {
                  setActiveTab("my");
                  setFieldErrors({});
                  setFormError("");
                }}
                className="px-4 py-2.5 rounded-xl text-xs font-semibold text-mute hover:text-ink bg-soft border border-line transition-colors cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={formSubmitting}
                className="px-6 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-white bg-brand-gradient hover:opacity-95 shadow-md shadow-indigo-500/25 flex items-center gap-2 disabled:opacity-50 cursor-pointer"
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

      {/* ========================================================================= */}
      {/* 6. ISSUE DETAIL DRAWER / MODAL */}
      {/* ========================================================================= */}
      {selectedIssue && (
        <div className="fixed inset-0 z-50 flex items-center justify-end bg-black/60 backdrop-blur-xs p-0 sm:p-4">
          <div
            className="w-full max-w-xl h-full sm:h-auto sm:max-h-[90vh] bg-card border-l sm:border border-line sm:rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-right duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Drawer Header */}
            <div className="p-5 border-b border-line flex items-center justify-between bg-card shrink-0">
              <div className="flex items-center gap-2.5">
                <span className="text-sm font-mono font-black text-indigo-500">
                  KX-{selectedIssue.id}
                </span>
                {renderStatusBadge(selectedIssue.status)}
                {renderPriorityBadge(selectedIssue.priority)}
              </div>
              <button
                type="button"
                onClick={closeIssueDetail}
                className="p-1.5 rounded-lg text-mute hover:text-ink hover:bg-soft transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Drawer Scrollable Body */}
            <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
              {/* Title & Description */}
              <div className="space-y-2">
                <h2 className="text-base sm:text-lg font-bold text-ink leading-snug">
                  {selectedIssue.title}
                </h2>
                <p className="text-xs sm:text-sm text-mute whitespace-pre-wrap leading-relaxed">
                  {selectedIssue.description}
                </p>
              </div>

              {/* Status Stepper Progression */}
              <div className="p-4 rounded-xl bg-soft border border-line space-y-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-mute block">
                  Workflow Status
                </span>
                {renderWorkflowStepper(selectedIssue.status)}
                {selectedIssue.status === "RESOLVED" && (
                  <p className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-2 font-medium">
                    Resolver has completed work. As the reporting student, you
                    may confirm and close this ticket or reopen it if
                    incomplete.
                  </p>
                )}
              </div>

              {/* Meta details list */}
              <div className="grid grid-cols-2 gap-3 p-4 rounded-xl bg-soft border border-line text-xs">
                <div>
                  <span className="text-mute block text-[11px]">Category</span>
                  <span className="font-semibold text-ink">
                    {selectedIssue.categoryName || "General"}
                  </span>
                </div>
                <div>
                  <span className="text-mute block text-[11px]">Location</span>
                  <span className="font-semibold text-ink">
                    {selectedIssue.locationName || "Campus Facility"}
                  </span>
                </div>
                <div>
                  <span className="text-mute block text-[11px]">
                    Floor / Room
                  </span>
                  <span className="font-semibold text-ink">
                    {selectedIssue.floorRoom || "Unspecified"}
                  </span>
                </div>
                <div>
                  <span className="text-mute block text-[11px]">
                    Reported On
                  </span>
                  <span className="font-semibold text-ink">
                    {formatIssueDate(selectedIssue.createdAt) || "Recorded"}
                  </span>
                </div>
              </div>

              {/* Upvote Banner */}
              <div className="flex items-center justify-between p-3.5 rounded-xl border border-line bg-card">
                <div className="flex items-center gap-2">
                  <ThumbsUp size={16} className="text-indigo-500" />
                  <span className="text-xs text-ink font-semibold">
                    {selectedIssue.voteCount || 0}{" "}
                    {selectedIssue.voteCount === 1
                      ? "student affected"
                      : "students affected"}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => handleVote(selectedIssue)}
                  disabled={
                    selectedIssue.hasVoted || votingIssueId === selectedIssue.id
                  }
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold border flex items-center gap-1.5 transition-colors cursor-pointer ${
                    selectedIssue.hasVoted
                      ? "bg-indigo-500/10 border-indigo-500/40 text-indigo-500"
                      : "bg-soft border-line text-ink hover:border-indigo-500 hover:text-indigo-500"
                  }`}
                >
                  <ThumbsUp
                    size={13}
                    className={
                      selectedIssue.hasVoted
                        ? "fill-indigo-500 text-indigo-500"
                        : ""
                    }
                  />
                  <span>
                    {selectedIssue.hasVoted ? "Upvoted" : "Upvote Ticket"}
                  </span>
                </button>
              </div>

              {/* Photos / Images Section (GET /api/issues/{id}/images) */}
              <div className="space-y-3 pt-1">
                {/* 1. Reported Photos */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-mute flex items-center gap-1.5">
                      <ImageIcon size={14} />
                      Reported Photos ({detailImages.filter((i) => !i.imageType || i.imageType === "REPORTED").length})
                    </span>
                    {detailImagesLoading && (
                      <Loader2
                        size={13}
                        className="animate-spin text-indigo-500"
                      />
                    )}
                  </div>

                  {detailImagesLoading ? (
                    <div className="h-16 rounded-xl bg-soft animate-pulse" />
                  ) : detailImages.filter((i) => !i.imageType || i.imageType === "REPORTED").length === 0 ? (
                    <p className="text-xs text-mute italic bg-soft/50 p-2.5 rounded-xl border border-line">
                      No photos attached with initial report.
                    </p>
                  ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {detailImages
                        .filter((i) => !i.imageType || i.imageType === "REPORTED")
                        .map((img) => (
                          <div
                            key={img.id}
                            onClick={() => setImagePreviewUrl(img.imageUrl)}
                            className="aspect-video relative rounded-lg overflow-hidden border border-line bg-black/10 hover:opacity-90 transition-opacity cursor-pointer group"
                          >
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={img.imageUrl}
                              alt="Issue attachment"
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-white text-[10px] font-bold">
                              View
                            </div>
                          </div>
                        ))}
                    </div>
                  )}
                </div>

                {/* 2. Resolution Evidence (Uploaded by Resolver) */}
                {detailImages.some((i) => i.imageType === "RESOLUTION") && (
                  <div className="space-y-2 p-3 rounded-xl border border-emerald-500/30 bg-emerald-500/5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                        <CheckCircle2 size={14} />
                        Resolution Evidence ({detailImages.filter((i) => i.imageType === "RESOLUTION").length})
                      </span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {detailImages
                        .filter((i) => i.imageType === "RESOLUTION")
                        .map((img) => (
                          <div
                            key={img.id}
                            onClick={() => setImagePreviewUrl(img.imageUrl)}
                            className="aspect-video relative rounded-lg overflow-hidden border border-emerald-500/40 bg-black/10 hover:opacity-90 transition-opacity cursor-pointer group"
                          >
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={img.imageUrl}
                              alt="Resolution evidence"
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-white text-[10px] font-bold">
                              View Proof
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Comments Section (GET & POST /api/issues/{id}/comments) */}
              <div className="space-y-3 pt-2 border-t border-line">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-mute flex items-center gap-1.5">
                    <MessageSquare size={14} />
                    Comments ({detailComments.length})
                  </span>
                  {detailCommentsLoading && (
                    <Loader2
                      size={13}
                      className="animate-spin text-indigo-500"
                    />
                  )}
                </div>

                {/* Add Comment Box */}
                <form onSubmit={handleAddComment} className="space-y-2">
                  <textarea
                    rows={2}
                    value={newCommentText}
                    onChange={(e) => setNewCommentText(e.target.value)}
                    placeholder="Add an update or question for campus staff…"
                    className="w-full rounded-xl border border-line bg-soft px-3 py-2 text-xs font-medium text-ink placeholder:text-mute focus:outline-none focus:ring-2 focus:ring-[#818cf8] resize-none"
                  />
                  {commentError && (
                    <p className="text-[11px] text-rose-500">{commentError}</p>
                  )}
                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={submittingComment || !newCommentText.trim()}
                      className="px-3.5 py-1.5 rounded-lg text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 flex items-center gap-1.5 cursor-pointer"
                    >
                      {submittingComment ? (
                        <>
                          <Loader2 size={12} className="animate-spin" />
                          <span>Posting…</span>
                        </>
                      ) : (
                        <>
                          <ArrowRight size={12} />
                          <span>Post Comment</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>

                {/* Comment List */}
                {detailCommentsLoading ? (
                  <div className="space-y-2">
                    <div className="h-12 bg-soft rounded-xl animate-pulse" />
                    <div className="h-12 bg-soft rounded-xl animate-pulse" />
                  </div>
                ) : detailComments.length === 0 ? (
                  <p className="text-xs text-mute italic bg-soft/50 p-3 rounded-xl border border-line">
                    No comments yet. Start the conversation.
                  </p>
                ) : (
                  <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                    {detailComments.map((c) => (
                      <div
                        key={c.id}
                        className="p-3 rounded-xl bg-soft border border-line text-xs space-y-1"
                      >
                        <div className="flex items-center justify-between text-[11px] text-mute">
                          <span className="font-bold text-ink">
                            {c.userName || "Campus Student"}
                          </span>
                        </div>
                        <p className="text-ink text-xs leading-relaxed">
                          {c.comment}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Drawer Footer Actions */}
            <div className="p-4 border-t border-line bg-card flex items-center justify-between shrink-0">
              <button
                type="button"
                onClick={closeIssueDetail}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-mute hover:text-ink bg-soft border border-line cursor-pointer"
              >
                Close Drawer
              </button>

              {/* Student Resolution Actions (if it's the reporter's issue) */}
              {selectedIssue.status === "RESOLVED" && (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setConfirmReopenTarget(selectedIssue);
                    }}
                    className="px-3 py-2 rounded-xl text-xs font-bold text-rose-500 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 flex items-center gap-1.5 cursor-pointer"
                  >
                    <RotateCcw size={13} />
                    <span>Reopen</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setConfirmCloseTarget(selectedIssue);
                    }}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 flex items-center gap-1.5 shadow-sm cursor-pointer"
                  >
                    <Check size={14} strokeWidth={3} />
                    <span>Confirm & Close</span>
                  </button>
                </div>
              )}

              {selectedIssue.status === "CLOSED" && (
                <button
                  type="button"
                  onClick={() => {
                    setConfirmReopenTarget(selectedIssue);
                  }}
                  className="px-3 py-2 rounded-xl text-xs font-bold text-ink bg-soft hover:bg-card border border-line flex items-center gap-1.5 cursor-pointer"
                >
                  <RotateCcw size={13} />
                  <span>Reopen Ticket</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 7. CONFIRM & CLOSE MODAL DIALOG */}
      {/* ========================================================================= */}
      {confirmCloseTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div
            className="w-full max-w-md bg-card border border-line rounded-2xl p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center mx-auto">
              <CheckCircle2 size={24} />
            </div>

            <div className="text-center space-y-1">
              <h3 className="text-base font-bold text-ink">
                Confirm Issue Resolution?
              </h3>
              <p className="text-xs text-mute leading-relaxed">
                Are you satisfied with the maintenance fix for ticket{" "}
                <strong className="text-indigo-500">
                  KX-{confirmCloseTarget.id}
                </strong>{" "}
                ({confirmCloseTarget.title})? This will mark the issue
                permanently closed.
              </p>
            </div>

            <div className="pt-2 flex items-center justify-end gap-3">
              <button
                type="button"
                disabled={confirmSubmitting}
                onClick={() => setConfirmCloseTarget(null)}
                className="flex-1 px-4 py-2.5 rounded-xl text-xs font-semibold text-mute hover:text-ink bg-soft border border-line transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={confirmSubmitting}
                onClick={handleConfirmClose}
                className="flex-1 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 shadow-md flex items-center justify-center gap-1.5 disabled:opacity-50 cursor-pointer"
              >
                {confirmSubmitting ? (
                  <>
                    <Loader2 size={13} className="animate-spin" />
                    <span>Closing…</span>
                  </>
                ) : (
                  <>
                    <Check size={14} strokeWidth={3} />
                    <span>Confirm & Close</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 8. CONFIRM REOPEN MODAL DIALOG */}
      {/* ========================================================================= */}
      {confirmReopenTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div
            className="w-full max-w-md bg-card border border-line rounded-2xl p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-12 h-12 rounded-2xl bg-rose-500/10 text-rose-500 flex items-center justify-center mx-auto">
              <RotateCcw size={24} />
            </div>

            <div className="text-center space-y-1">
              <h3 className="text-base font-bold text-ink">
                Reopen Maintenance Ticket?
              </h3>
              <p className="text-xs text-mute leading-relaxed">
                Is ticket{" "}
                <strong className="text-indigo-500">
                  KX-{confirmReopenTarget.id}
                </strong>{" "}
                still malfunctioning or unresolved? Reopening will notify campus
                maintenance to re-inspect the issue.
              </p>
            </div>

            <div className="pt-2 flex items-center justify-end gap-3">
              <button
                type="button"
                disabled={confirmSubmitting}
                onClick={() => setConfirmReopenTarget(null)}
                className="flex-1 px-4 py-2.5 rounded-xl text-xs font-semibold text-mute hover:text-ink bg-soft border border-line transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={confirmSubmitting}
                onClick={handleConfirmReopen}
                className="flex-1 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-500 shadow-md flex items-center justify-center gap-1.5 disabled:opacity-50 cursor-pointer"
              >
                {confirmSubmitting ? (
                  <>
                    <Loader2 size={13} className="animate-spin" />
                    <span>Reopening…</span>
                  </>
                ) : (
                  <>
                    <RotateCcw size={14} />
                    <span>Reopen Ticket</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 9. IMAGE PREVIEW MODAL */}
      {/* ========================================================================= */}
      {imagePreviewUrl && (
        <div
          className="fixed inset-0 z-60 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
          onClick={() => setImagePreviewUrl(null)}
        >
          <div className="relative max-w-4xl max-h-[90vh]">
            <button
              type="button"
              onClick={() => setImagePreviewUrl(null)}
              className="absolute -top-10 right-0 p-1.5 text-white hover:opacity-75 cursor-pointer"
            >
              <X size={22} />
            </button>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={imagePreviewUrl}
              alt="Preview"
              className="max-h-[85vh] max-w-full rounded-xl object-contain shadow-2xl border border-white/20"
            />
          </div>
        </div>
      )}
    </div>
  );
}
