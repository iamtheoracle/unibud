import React, { useState, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { useMockFallback } from "@/lib/mock/useMockFallback";
import { ASSIGNMENT_MOCK_ENTRIES } from "@/lib/academic/mockShapes";
import ScreenShell from "@/components/layout/ScreenShell";
import Sheet from "@/components/academics/Sheet";
import GlassInput from "@/components/foundation/GlassInput";
import SmartTaskSections from "@/components/academics/SmartTaskSections";
import TaskProgressPanel from "@/components/academics/TaskProgressPanel";
import TaskEmptyState from "@/components/academics/TaskEmptyState";
import { toast } from "@/components/ui/use-toast";
import { hapticImpact } from "@/lib/haptics";

export default function Assignments() {
  const qc = useQueryClient();
  const aq = useQuery({ queryKey: ["assignments"], queryFn: () => base44.entities.Assignment.list("-due_date", 100) });
  const { data: assignments } = useMockFallback(aq, ASSIGNMENT_MOCK_ENTRIES);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({});
  const [uploading, setUploading] = useState(false);

  const save = useMutation({
    mutationFn: (v) => (editing?.id ? base44.entities.Assignment.update(editing.id, v) : base44.entities.Assignment.create(v)),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["assignments"] }); toast({ title: editing?.id ? "Assignment updated" : "Assignment added" }); setEditing(null); },
  });
  const del = useMutation({ mutationFn: (id) => base44.entities.Assignment.delete(id), onSuccess: () => { qc.invalidateQueries({ queryKey: ["assignments"] }); toast({ title: "Assignment deleted" }); } });

  const [completedIds, setCompletedIds] = useState([]);
  const undoTimer = useRef(null);

  const openNew = () => { setEditing({}); setForm({ title: "", course_code: "", course_title: "", due_date: "", status: "pending", priority: "medium", submission_type: "file", description: "", attachments: [] }); };
  const openEdit = (a) => { setEditing(a); setForm({ ...a, attachments: a.attachments || [] }); };
  const submit = () => { if (!form.title || !form.course_code) { toast({ title: "Title and course required" }); return; } save.mutate({ ...form, due_date: form.due_date ? new Date(form.due_date).toISOString() : undefined }); };

  const addFile = async (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file: f });
      setForm((s) => ({ ...s, attachments: [...(s.attachments || []), file_url] }));
    } catch { toast({ title: "Upload failed" }); }
    finally { setUploading(false); e.target.value = ""; }
  };

  const handleAction = (action, task) => {
    if (action === "complete") {
      hapticImpact(30);
      setCompletedIds((prev) => [...prev, task.id]);
      const label = task.__mock ? "Assignment" : (task.submission_type === "presentation" ? "Study session" : task.task_type === "reminder" ? "Reminder" : "Assignment");
      toast({
        title: `${label} completed`,
        action: { label: "Undo", onClick: () => {
          setCompletedIds((prev) => prev.filter((id) => id !== task.id));
          clearTimeout(undoTimer.current);
        }},
        duration: 5000,
      });
      if (!task.__mock) {
        base44.entities.Assignment.update(task.id, { status: "submitted" }).catch(() => {});
      }
    } else if (action === "edit") {
      openEdit(task);
    } else if (action === "delete") {
      if (!task.__mock) del.mutate(task.id);
    } else if (action === "pin") {
      toast({ title: "Pinned", description: task.title });
    } else if (action === "reschedule") {
      openEdit(task);
    } else {
      toast({ title: action.charAt(0).toUpperCase() + action.slice(1), description: task.title });
    }
  };

  const handleContextMenu = (actionId, task) => {
    handleAction(actionId, task);
  };

  const upcoming = (assignments || []).filter((a) => a.status === "pending" || a.status === "in_progress").sort((a, b) => (a.due_date || "").localeCompare(b.due_date || ""));
  const budHint = upcoming[0] ? `Bud suggests starting "${upcoming[0].title}"${upcoming[0].due_date ? ` — due ${upcoming[0].due_date.split("T")[0]}` : ""}.` : "You're on top of your assignments. Nice work.";
  const hasAny = (assignments || []).length > 0;

  return (
    <ScreenShell title="Assignments" back actions={<button onClick={openNew} className="text-[12px] font-semibold text-primary spring-tap">+ Add</button>}>
      {/* Progress panel */}
      {hasAny && <TaskProgressPanel tasks={assignments} completedIds={completedIds} />}

      {/* Bud hint */}
      <p className="text-[13px] text-muted-foreground/70 px-1 mb-4 leading-relaxed">{budHint}</p>

      {/* Smart sections with swipe */}
      {hasAny ? (
        <SmartTaskSections
          tasks={assignments}
          onAction={handleAction}
          onContextMenu={handleContextMenu}
          completedIds={completedIds}
        />
      ) : (
        <TaskEmptyState />
      )}

      <Sheet open={!!editing} onClose={() => setEditing(null)} title={editing?.id ? "Edit Assignment" : "Add Assignment"}>
        <div className="space-y-3.5">
          <GlassInput label="Title" value={form.title || ""} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          <div className="grid grid-cols-2 gap-3">
            <GlassInput label="Course Code" value={form.course_code || ""} onChange={(e) => setForm({ ...form, course_code: e.target.value })} />
            <GlassInput label="Course Title" value={form.course_title || ""} onChange={(e) => setForm({ ...form, course_title: e.target.value })} />
          </div>
          <GlassInput label="Due Date" type="datetime-local" value={form.due_date ? String(form.due_date).slice(0, 16) : ""} onChange={(e) => setForm({ ...form, due_date: e.target.value })} />
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[12px] font-semibold text-muted-foreground/90 ml-1">Priority</label>
              <select value={form.priority || "medium"} onChange={(e) => setForm({ ...form, priority: e.target.value })} className="mt-1.5 w-full h-[52px] px-4 rounded-2xl bg-muted/50 border border-border text-[15px] text-foreground focus:outline-none focus:border-primary/60 capitalize">{["low", "medium", "high"].map((p) => <option key={p} value={p}>{p}</option>)}</select>
            </div>
            <div>
              <label className="text-[12px] font-semibold text-muted-foreground/90 ml-1">Status</label>
              <select value={form.status || "pending"} onChange={(e) => setForm({ ...form, status: e.target.value })} className="mt-1.5 w-full h-[52px] px-4 rounded-2xl bg-muted/50 border border-border text-[15px] text-foreground focus:outline-none focus:border-primary/60 capitalize">{["pending", "in_progress", "submitted", "graded", "late"].map((p) => <option key={p} value={p}>{p.replace("_", " ")}</option>)}</select>
            </div>
          </div>
          <div>
            <label className="text-[12px] font-semibold text-muted-foreground/90 ml-1">Submission Type</label>
            <select value={form.submission_type || "file"} onChange={(e) => setForm({ ...form, submission_type: e.target.value })} className="mt-1.5 w-full h-[52px] px-4 rounded-2xl bg-muted/50 border border-border text-[15px] text-foreground focus:outline-none focus:border-primary/60 capitalize">{["file", "online", "in_person", "presentation"].map((p) => <option key={p} value={p}>{p}</option>)}</select>
          </div>
          <div>
            <label className="text-[12px] font-semibold text-muted-foreground/90 ml-1">Lecturer Instructions</label>
            <textarea value={form.description || ""} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} className="mt-1.5 w-full p-4 rounded-2xl bg-muted/50 border border-border text-[14px] text-foreground focus:outline-none focus:border-primary/60" placeholder="Instructions…" />
          </div>
          <div>
            <label className="text-[12px] font-semibold text-muted-foreground/90 ml-1">Attachments</label>
            <label className="mt-1.5 flex items-center gap-3 h-[48px] px-4 rounded-2xl bg-muted/40 border border-border cursor-pointer">
              <input type="file" onChange={addFile} className="hidden" />
              <span className="text-[13px] text-muted-foreground flex-1">{uploading ? "Uploading…" : "+ Add file"}</span>
            </label>
            {(form.attachments || []).map((u, i) => <a key={i} href={u} target="_blank" rel="noreferrer" className="block text-[11px] text-primary mt-1 truncate">Attachment {i + 1}</a>)}
          </div>
        </div>
        <button onClick={submit} disabled={save.isPending} className="w-full h-[52px] mt-5 rounded-2xl bg-primary text-primary-foreground font-heading font-semibold text-[15px] flex items-center justify-center spring-tap disabled:opacity-50 ice-glow">{save.isPending ? "Saving…" : "Save"}</button>
      </Sheet>
    </ScreenShell>
  );
}