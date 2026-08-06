import React, { useState, useRef } from "react";
import { motion } from "framer-motion";
import {
  Check, X, Play, Pause, RotateCcw, Send, Paperclip, MessageSquare, Sparkles, Loader2,
} from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useBudPanel } from "@/lib/BudPanelContext";
import { hapticTap } from "@/lib/haptics";

const UNAUTHORIZED_MSG = "You are not authorized to perform this operation. Please contact your immediate supervisor to complete this request.";

/**
 * Operator task workflow panel. Enforces the assignment lifecycle:
 * accept → start → (pause/resume) → submit completion → (management verifies).
 * Operators can never approve/assign/modify permissions. Every action appends
 * an immutable status_timeline entry (the per-task audit trail).
 */
export default function OperatorTaskWorkflow({ task, user, onChanged }) {
  const { openBud } = useBudPanel();
  const [busy, setBusy] = useState(false);
  const [showReject, setShowReject] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [comment, setComment] = useState("");
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef(null);

  const guard = (fn) => async (...args) => {
    if (task.assigned_to_id && user?.id && task.assigned_to_id !== user.id) {
      alert(UNAUTHORIZED_MSG);
      return;
    }
    setBusy(true);
    try {
      await fn(...args);
      onChanged?.();
    } catch {
      alert(UNAUTHORIZED_MSG);
    } finally {
      setBusy(false);
    }
  };

  const pushTimeline = (status, note = "") => [
    ...(task.status_timeline || []),
    { status, at: new Date().toISOString(), by_id: user?.id, by_name: user?.full_name || "Operator", note },
  ];

  const transition = guard(async (status, extra = {}, note = "") => {
    await base44.entities.OperatorAssignment.update(task.id, {
      status,
      status_timeline: pushTimeline(status, note),
      ...extra,
    });
  });

  const onAccept = () => transition("accepted", { accepted_at: new Date().toISOString() }, "Assignment accepted");
  const onStart = () => transition("in_progress", { started_at: new Date().toISOString(), progress_percent: 5 }, "Work started");
  const onPause = () => transition("paused", { paused_at: new Date().toISOString() }, "Work paused");
  const onResume = () => transition("in_progress", {}, "Work resumed");
  const onComplete = () => transition("waiting_review", { completion_submitted_at: new Date().toISOString(), progress_percent: 100 }, "Completion submitted for verification");

  const onReject = guard(async () => {
    if (!rejectReason.trim()) return;
    await base44.entities.OperatorAssignment.update(task.id, {
      status: "rejected",
      reject_reason: rejectReason.trim(),
      status_timeline: pushTimeline("rejected", `Rejected: ${rejectReason.trim()}`),
    });
    setShowReject(false);
    setRejectReason("");
  });

  const onUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      const kind = file.type.startsWith("image/") ? "photo"
        : file.type.startsWith("video/") ? "video"
        : file.type.startsWith("audio/") ? "voice" : "document";
      await base44.entities.OperatorAssignment.update(task.id, {
        evidence: [...(task.evidence || []), { file_url, file_name: file.name, kind, uploaded_at: new Date().toISOString() }],
        status_timeline: pushTimeline("evidence_uploaded", `Uploaded ${file.name}`),
      });
      onChanged?.();
    } catch {
      alert(UNAUTHORIZED_MSG);
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const onComment = guard(async () => {
    if (!comment.trim()) return;
    await base44.entities.OperatorAssignment.update(task.id, {
      comments: [...(task.comments || []), {
        author_id: user?.id,
        author_name: user?.full_name || "Operator",
        content: comment.trim(),
        created_at: new Date().toISOString(),
      }],
    });
    setComment("");
  });

  const askBud = () => {
    hapticTap();
    openBud(`I'm an operator working on this assignment: "${task.title}". ${task.instructions || task.description || ""} Please explain it and break the work into clear steps.`);
  };

  const s = task.status;

  return (
    <div className="space-y-3">
      {/* Bud assistant */}
      <button onClick={askBud} className="w-full flex items-center gap-2.5 rounded-[18px] p-3 glass spring-tap">
        <div className="w-9 h-9 rounded-full bg-primary/12 flex items-center justify-center">
          <Sparkles className="w-4 h-4 text-primary" />
        </div>
        <div className="text-left">
          <p className="text-[12px] font-semibold text-foreground">Ask Bud about this task</p>
          <p className="text-[10.5px] text-muted-foreground">Break work into steps · suggest faster workflow</p>
        </div>
      </button>

      {/* Workflow actions */}
      <div className="rounded-[20px] p-3.5 glass">
        <p className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground/70 mb-2.5">Workflow</p>
        <div className="flex flex-wrap gap-2">
          {s === "assigned" && (
            <>
              <WorkflowBtn onClick={onAccept} busy={busy} icon={Check} label="Accept" primary />
              <WorkflowBtn onClick={() => setShowReject((v) => !v)} busy={busy} icon={X} label="Reject" />
            </>
          )}
          {s === "accepted" && <WorkflowBtn onClick={onStart} busy={busy} icon={Play} label="Start work" primary />}
          {s === "in_progress" && (
            <>
              <WorkflowBtn onClick={onPause} busy={busy} icon={Pause} label="Pause" />
              <WorkflowBtn onClick={onComplete} busy={busy} icon={Send} label="Submit completion" primary />
            </>
          )}
          {s === "paused" && (
            <>
              <WorkflowBtn onClick={onResume} busy={busy} icon={RotateCcw} label="Resume" primary />
              <WorkflowBtn onClick={onComplete} busy={busy} icon={Send} label="Submit completion" />
            </>
          )}
          {s === "waiting_review" && (
            <p className="text-[11.5px] text-muted-foreground py-1">Submitted — waiting for Management to verify.</p>
          )}
          {s === "completed" && (
            <p className="text-[11.5px] text-success py-1 font-semibold">Verified & closed by Management.</p>
          )}
          {s === "rejected" && (
            <p className="text-[11.5px] text-destructive py-1">Assignment rejected.</p>
          )}
        </div>

        {showReject && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="mt-3 space-y-2">
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Reason for rejection (required)"
              rows={2}
              className="input-base"
            />
            <button onClick={onReject} disabled={busy || !rejectReason.trim()} className="w-full py-2 rounded-[12px] bg-destructive text-destructive-foreground text-[12px] font-semibold spring-tap disabled:opacity-50">
              Confirm rejection
            </button>
          </motion.div>
        )}
      </div>

      {/* Evidence */}
      <div className="rounded-[20px] p-3.5 glass">
        <div className="flex items-center justify-between mb-2.5">
          <p className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground/70">Evidence</p>
          <button
            onClick={() => fileRef.current?.click()}
            disabled={uploading || s === "completed" || s === "rejected"}
            className="flex items-center gap-1.5 text-[11.5px] font-semibold text-primary spring-tap disabled:opacity-50"
          >
            {uploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Paperclip className="w-3.5 h-3.5" />} Upload
          </button>
          <input ref={fileRef} type="file" className="hidden" onChange={onUpload} accept="image/*,video/*,audio/*,.pdf,.doc,.docx" />
        </div>
        {(task.evidence || []).length === 0 ? (
          <p className="text-[11px] text-muted-foreground">No evidence attached yet.</p>
        ) : (
          <div className="space-y-1.5">
            {(task.evidence || []).map((ev, i) => (
              <div key={i} className="flex items-center gap-2 text-[11px] text-muted-foreground">
                <Paperclip className="w-3 h-3" />
                <a href={ev.file_url} target="_blank" rel="noreferrer" className="truncate hover:text-primary">{ev.file_name}</a>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Comments */}
      <div className="rounded-[20px] p-3.5 glass">
        <p className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground/70 mb-2.5">Comments</p>
        <div className="space-y-2 mb-2.5 max-h-48 overflow-y-auto">
          {(task.comments || []).length === 0 ? (
            <p className="text-[11px] text-muted-foreground">No comments yet.</p>
          ) : (task.comments || []).map((c, i) => (
            <div key={i} className="text-[11.5px]">
              <span className="font-semibold text-foreground">{c.author_name}</span>
              <span className="text-muted-foreground/60 ml-1.5 text-[10px]">
                {new Date(c.created_at).toLocaleString("en", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}
              </span>
              <p className="text-muted-foreground mt-0.5">{c.content}</p>
            </div>
          ))}
        </div>
        <div className="flex gap-2">
          <input
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && onComment()}
            placeholder="Add a work comment…"
            className="input-base flex-1 h-9"
          />
          <button onClick={onComment} disabled={busy || !comment.trim()} className="w-9 h-9 rounded-[12px] bg-primary text-primary-foreground flex items-center justify-center spring-tap disabled:opacity-50">
            <MessageSquare className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

function WorkflowBtn({ onClick, busy, icon: Icon, label, primary }) {
  return (
    <button
      onClick={onClick}
      disabled={busy}
      className={`flex items-center gap-1.5 px-3.5 py-2 rounded-[12px] text-[12px] font-semibold spring-tap disabled:opacity-50 ${
        primary ? "bg-primary text-primary-foreground" : "glass text-foreground"
      }`}
    >
      {busy ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Icon className="w-3.5 h-3.5" />} {label}
    </button>
  );
}