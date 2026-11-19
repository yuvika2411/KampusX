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
  Image as ImageIcon,
  X,
  Upload,
  Calendar,
  AlertCircle,
} from "lucide-react";
import { api, IssueResponse, IssueStatus, IssueImageResponse } from "@/lib/api";
import { AuthSession } from "@/lib/auth";
import { useWebSocketSubscription } from "@/lib/websocket";
import LiveStatusIndicator from "@/components/ui/LiveStatusIndicator";

interface ResolverViewProps {
  user: AuthSession;
}

export default function ResolverView({ user }: ResolverViewProps) {
  const [issues, setIssues] = useState<IssueResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>("ALL");
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const [actionMessage, setActionMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  // Resolution modal with optional resolution evidence
  const [resolvingIssue, setResolvingIssue] = useState<IssueResponse | null>(null);
  const [resolutionFiles, setResolutionFiles] = useState<File[]>([]);
  const [resolutionPreviews, setResolutionPreviews] = useState<string[]>([]);
  const [resolutionUploading, setResolutionUploading] = useState(false);
  const [resolutionProgress, setResolutionProgress] = useState<string | null>(null);

  // Inspect task modal (viewing student reported photos + resolver evidence)
  const [inspectingIssue, setInspectingIssue] = useState<IssueResponse | null>(null);
  const [taskImages, setTaskImages] = useState<IssueImageResponse[]>([]);
  const [taskImagesLoading, setTaskImagesLoading] = useState(false);
  const [previewImageUrl, setPreviewImageUrl] = useState<string | null>(null);

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
          text:
            err instanceof Error
              ? err.message
              : "Failed to load assigned tasks",
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
            text:
              err instanceof Error
                ? err.message
                : "Failed to load assigned tasks",
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

  // Real-time WebSocket subscription for resolver's queue
  useWebSocketSubscription<IssueResponse>("/user/queue/issues", (event) => {
    if (!event?.payload) return;
    const issue = event.payload;
    setIssues((prev) => {
      const list = Array.isArray(prev) ? prev : [];
      const idx = list.findIndex((i) => i.id === issue.id);
      if (idx !== -1) {
        const copy = [...list];
        copy[idx] = { ...copy[idx], ...issue };
        return copy;
      }
      if (event.type === "ISSUE_ASSIGNED") {
        return [issue, ...list];
      }
      return list;
    });
  });

  const openResolveModal = (issue: IssueResponse) => {
    setResolvingIssue(issue);
    setResolutionFiles([]);
    setResolutionPreviews([]);
    setResolutionProgress(null);
  };

  const closeResolveModal = () => {
    setResolvingIssue(null);
    setResolutionFiles([]);
    setResolutionPreviews([]);
    setResolutionProgress(null);
  };

  const handleResolutionFilesSelect = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    if (!e.target.files) return;
    const allowed = ["image/jpeg", "image/png", "image/webp"];
    const valid: File[] = [];
    Array.from(e.target.files).forEach((file) => {
      if (allowed.includes(file.type) && file.size <= 5 * 1024 * 1024) {
        valid.push(file);
      }
    });
    const updated = [...resolutionFiles, ...valid].slice(0, 5);
    setResolutionFiles(updated);
    setResolutionPreviews(updated.map((f) => URL.createObjectURL(f)));
  };

  const handleRemoveResolutionFile = (idx: number) => {
    const updated = resolutionFiles.filter((_, i) => i !== idx);
    setResolutionFiles(updated);
    setResolutionPreviews(updated.map((f) => URL.createObjectURL(f)));
  };

  const handleConfirmResolution = async () => {
    if (!resolvingIssue) return;
    setResolutionUploading(true);
    setResolutionProgress(null);

    try {
      if (resolutionFiles.length > 0) {
        for (let i = 0; i < resolutionFiles.length; i++) {
          setResolutionProgress(
            `Uploading proof photo ${i + 1} of ${resolutionFiles.length}...`,
          );
          try {
            await api.issues.uploadImage(
              resolvingIssue.id,
              resolutionFiles[i],
              "RESOLUTION",
            );
          } catch (uploadErr) {
            console.warn("Evidence upload warning:", uploadErr);
          }
        }
      }

      await api.issues.updateStatus(resolvingIssue.id, "RESOLVED");
      setActionMessage({
        type: "success",
        text: `Work order KX-${resolvingIssue.id} marked as RESOLVED`,
      });
      closeResolveModal();
      loadData();
    } catch (err: unknown) {
      setActionMessage({
        type: "error",
        text:
          err instanceof Error
            ? err.message
            : "Failed to update work order to RESOLVED",
      });
    } finally {
      setResolutionUploading(false);
      setResolutionProgress(null);
    }
  };

  const openInspectModal = (issue: IssueResponse) => {
    setInspectingIssue(issue);
    setTaskImagesLoading(true);
    api.issues
      .getImages(issue.id)
      .then((imgs) => setTaskImages(imgs || []))
      .catch(() => setTaskImages([]))
      .finally(() => setTaskImagesLoading(false));
  };

  const closeInspectModal = () => {
    setInspectingIssue(null);
    setTaskImages([]);
  };

  const handleUpdateStatus = async (
    issueId: number,
    nextStatus: IssueStatus,
  ) => {
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
        text:
          err instanceof Error
            ? err.message
            : "Failed to update work order status",
      });
    } finally {
      setUpdatingId(null);
    }
  };

  const assignedCount = issues.filter((i) => i.status === "ASSIGNED").length;
  const inProgressCount = issues.filter(
    (i) => i.status === "IN_PROGRESS",
  ).length;
  const priorityCount = issues.filter(
    (i) => i.priority === "HIGH" || i.priority === "CRITICAL",
  ).length;

  const filteredIssues = issues.filter((i) => {
    if (filterStatus === "ALL") return true;
    if (filterStatus === "ASSIGNED") return i.status === "ASSIGNED";
    if (filterStatus === "IN_PROGRESS") return i.status === "IN_PROGRESS";
    if (filterStatus === "RESOLVED")
      return i.status === "RESOLVED" || i.status === "CLOSED";
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Top Greeting */}
      <div className="p-5 sm:p-6 rounded-2xl bg-card border border-line shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black text-ink tracking-tight">
              Welcome back, {user.name}
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-mute mt-1">
            Track your assigned work orders, initiate repair tasks, and submit
            completion updates.
          </p>
        </div>

        <div className="self-start sm:self-auto">
          <LiveStatusIndicator />
        </div>
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
          <button
            onClick={() => setActionMessage(null)}
            className="underline text-[11px]"
          >
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
          <span className="text-[11px] text-mute mt-0.5 block">
            Total assigned to you
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-card border border-line shadow-xs">
          <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-mute block">
            Awaiting Start
          </span>
          <span className="text-2xl sm:text-3xl font-black text-blue-500 mt-1 block">
            {assignedCount}
          </span>
          <span className="text-[11px] text-mute mt-0.5 block">
            Ready to initiate work
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-card border border-line shadow-xs">
          <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-mute block">
            In Progress
          </span>
          <span className="text-2xl sm:text-3xl font-black text-indigo-500 mt-1 block">
            {inProgressCount}
          </span>
          <span className="text-[11px] text-mute mt-0.5 block">
            Currently active tasks
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-card border border-line shadow-xs">
          <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-mute block">
            High Priority
          </span>
          <span className="text-2xl sm:text-3xl font-black text-rose-500 mt-1 block">
            {priorityCount}
          </span>
          <span className="text-[11px] text-mute mt-0.5 block">
            Urgent or high impact
          </span>
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
            <p className="text-sm font-semibold text-ink">
              No assigned work orders
            </p>
            <p className="text-xs mt-1">
              Check back later or refresh when tasks are dispatched.
            </p>
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
                  <span>
                    Reporter: {issue.reporterName || "Campus Student"}
                  </span>
                </div>
              </div>

              {/* Status Action Buttons for Resolver */}
              <div className="shrink-0 flex flex-wrap items-center gap-2 pt-3 md:pt-0 border-t md:border-t-0 border-line">
                <button
                  type="button"
                  onClick={() => openInspectModal(issue)}
                  className="px-3 py-2 rounded-xl text-xs font-semibold text-ink bg-soft hover:bg-card border border-line flex items-center gap-1.5 cursor-pointer"
                >
                  <ImageIcon size={13} />
                  <span>Photos</span>
                </button>

                {issue.status === "ASSIGNED" && (
                  <button
                    onClick={() => handleUpdateStatus(issue.id, "IN_PROGRESS")}
                    disabled={updatingId === issue.id}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 flex items-center gap-1.5 shadow-xs disabled:opacity-50 cursor-pointer"
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
                    onClick={() => openResolveModal(issue)}
                    disabled={updatingId === issue.id}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 flex items-center gap-1.5 shadow-xs disabled:opacity-50 cursor-pointer"
                  >
                    <Check size={13} />
                    <span>Mark Resolved</span>
                  </button>
                )}

                {(issue.status === "RESOLVED" || issue.status === "CLOSED") && (
                  <span className="text-xs font-semibold text-emerald-500 flex items-center gap-1 px-2 py-1 bg-emerald-500/10 rounded-lg border border-emerald-500/20">
                    <CheckCircle2 size={14} />
                    <span>Completed</span>
                  </span>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* RESOLVE MODAL WITH OPTIONAL RESOLUTION EVIDENCE */}
      {resolvingIssue && (
        <div
          className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150"
          onClick={closeResolveModal}
        >
          <div
            className="w-full max-w-lg bg-card border border-line rounded-2xl shadow-2xl p-6 space-y-5"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-line">
              <div className="flex items-center gap-2">
                <span className="font-mono text-sm font-black text-indigo-500">
                  KX-{resolvingIssue.id}
                </span>
                <span className="text-xs font-bold text-ink">
                  Complete & Resolve Task
                </span>
              </div>
              <button
                type="button"
                onClick={closeResolveModal}
                disabled={resolutionUploading}
                className="p-1 rounded-lg text-mute hover:text-ink cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-1">
              <h4 className="text-sm font-bold text-ink">
                {resolvingIssue.title}
              </h4>
              <p className="text-xs text-mute line-clamp-2">
                {resolvingIssue.description}
              </p>
            </div>

            {/* Optional Resolution Evidence Section */}
            <div className="space-y-2 pt-1 border-t border-line">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold text-ink">
                  Resolution Proof / Photos{" "}
                  <span className="text-mute font-normal">(Optional)</span>
                </label>
                <span className="text-[11px] text-mute">
                  {resolutionFiles.length}/5 photos
                </span>
              </div>

              <div className="border border-dashed border-line hover:border-emerald-500/50 rounded-xl p-4 bg-soft/50 text-center transition-colors">
                <input
                  type="file"
                  id="resolver-evidence-input"
                  multiple
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleResolutionFilesSelect}
                  className="hidden"
                  disabled={resolutionUploading || resolutionFiles.length >= 5}
                />
                <label
                  htmlFor="resolver-evidence-input"
                  className={`inline-flex flex-col items-center gap-1.5 cursor-pointer ${
                    resolutionUploading || resolutionFiles.length >= 5
                      ? "opacity-50 cursor-not-allowed"
                      : ""
                  }`}
                >
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                    <Upload size={16} />
                  </div>
                  <span className="text-xs font-semibold text-ink">
                    Take photo or browse files
                  </span>
                  <span className="text-[11px] text-mute">
                    Attach physical repair verification (JPG, PNG, WebP)
                  </span>
                </label>
              </div>

              {/* Previews */}
              {resolutionPreviews.length > 0 && (
                <div className="grid grid-cols-3 gap-2 pt-1">
                  {resolutionPreviews.map((preview, idx) => (
                    <div
                      key={idx}
                      className="relative rounded-xl overflow-hidden border border-line aspect-video group bg-black/5"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={preview}
                        alt={`Evidence ${idx + 1}`}
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveResolutionFile(idx)}
                        disabled={resolutionUploading}
                        className="absolute top-1 right-1 p-1 rounded-full bg-black/75 hover:bg-black text-white cursor-pointer shadow-xs"
                      >
                        <X size={11} />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {resolutionProgress && (
                <div className="text-xs text-emerald-500 font-semibold flex items-center gap-1.5 pt-1 animate-pulse">
                  <Loader2 size={13} className="animate-spin" />
                  <span>{resolutionProgress}</span>
                </div>
              )}
            </div>

            <div className="pt-2 flex items-center justify-end gap-2.5 border-t border-line">
              <button
                type="button"
                onClick={closeResolveModal}
                disabled={resolutionUploading}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-mute hover:text-ink bg-soft border border-line transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmResolution}
                disabled={resolutionUploading}
                className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 shadow-xs flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
              >
                {resolutionUploading ? (
                  <>
                    <Loader2 size={13} className="animate-spin" />
                    <span>Resolving Work Order…</span>
                  </>
                ) : (
                  <>
                    <Check size={13} />
                    <span>Confirm Resolution</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* INSPECT TASK DETAILS & PHOTOS MODAL */}
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
                  KX-{inspectingIssue.id}
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
              {inspectingIssue.locationName && (
                <div className="flex items-center gap-1 text-xs text-mute font-medium pt-1">
                  <MapPin size={12} className="text-indigo-500" />
                  <span>
                    {inspectingIssue.locationName}
                    {inspectingIssue.floorRoom && ` (${inspectingIssue.floorRoom})`}
                  </span>
                </div>
              )}
            </div>

            {/* Photos & Evidence Sections */}
            <div className="space-y-4 pt-1">
              {/* Reported Photos */}
              <div className="space-y-2">
                <span className="text-xs font-bold uppercase tracking-wider text-mute flex items-center gap-1.5">
                  <ImageIcon size={14} />
                  Student Reported Photos ({taskImages.filter((i) => !i.imageType || i.imageType === "REPORTED").length})
                </span>

                {taskImagesLoading ? (
                  <div className="h-16 rounded-xl bg-soft animate-pulse" />
                ) : taskImages.filter((i) => !i.imageType || i.imageType === "REPORTED").length === 0 ? (
                  <p className="text-xs text-mute italic bg-soft/50 p-2.5 rounded-xl border border-line">
                    No photos submitted with initial report.
                  </p>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {taskImages
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
                            alt="Student report photo"
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
              {taskImages.some((i) => i.imageType === "RESOLUTION") && (
                <div className="space-y-2 p-3 rounded-xl border border-emerald-500/30 bg-emerald-500/5">
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                    <CheckCircle2 size={14} />
                    Resolution Evidence ({taskImages.filter((i) => i.imageType === "RESOLUTION").length})
                  </span>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {taskImages
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
