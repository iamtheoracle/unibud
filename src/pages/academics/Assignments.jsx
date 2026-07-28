import React, { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { base44 } from "@/api/base44Client";
import ScreenShell from "@/components/layout/ScreenShell";
import Sheet from "@/components/academics/Sheet";
import EmptyState from "@/components/academics/EmptyState";
import GlassInput from "@/components/foundation/GlassInput";
import { toast } from "@/components/ui/use-toast";

const EASE = [0.16, 1, 0.3, 1];
const STATUSES = ["all", "pending", "in_progress", "submitted", "graded", "late"];
const STATUS_LABEL = { pending: "Not Started", in_progress: "In Progress", submitted: "Submitted", graded: "Graded", late: "Overdue" };

export default function Assignments() {
  const qc = useQueryClient();
  const { data: assignments } = useQuery({ queryKey: ["assignments"], queryFn: () => base44.entities.Assignment.list("-due_date", 100) });
  const [filter, setFilter] = useState("all");
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({});
  const [uploading, setUploading] = useState(false);

  const save = useMutation({
    mutationFn: (v) => (editing?.id ? base44.entities.Assignment.update(editing.id, v) : base44.entities.Assignment.create(v)),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["assignments"] }); toast({ title: editing?.id ? "Assignment updated" : "Assignment added" }); setEditing(null); },
  });
  const del = useMutation({ mutationFn: (id) => base44.entities.Assignment.delete(id), onSuccess: () => { qc.invalidateQueries({ queryKey: ["assignments"] }); toast({ title: "Assignment deleted" }); } });

  const filtered = useMemo(() => {
    let l = assignments || [];
    if (filter !== "all") l = l.filter((a) => a.status === filter);
    return l;
  }, [assignments, filter]);

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

  const upcoming = (assignments || []).filter((a) => a.status === "pending" || a.status === "in_progress").sort((a, b) => (a.due_date || "").localeCompare(b.due_date || ""));
  const budHint = upcoming[0] ? `Bud suggests starting "${upcoming[0].title}"${upcoming[0].due_date ? ` — due ${upcoming[0].due_date.split("T")[0]}` : ""}.` : "You're on top of your assignments. Nice work.";

  return (
    <ScreenShell title="Assignments" back actions={<button onClick={openNew} className="text-[12px] font-semibold text-primary spring-tap">+ Add</button>}>
      <div className="glass-card p-3.5 mb-4 border border-primary/15 bg-primary/8"><p className="text-[13px] text-foreground/90">{budHint}</p></div>
      <div className="flex gap-2 mb-4 overflow-x-auto no-scrollbar">
        {STATUSES.map((s) => (
          <button key={s} onClick={() => setFilter(s)} className={`px-3 py-1.5 rounded-full text-[11px] font-semibold whitespace-nowrap spring-tap capitalize ${filter === s ? "bg-primary text-primary-foreground" : "glass text-muted-foreground"}`}>{s === "all" ? "All" : STATUS_LABEL[s] || s}</button>
        ))}
      </div>
      {!filtered.length ? <EmptyState message="No assignments here. Add one to start tracking." /> : (
        <div className="space-y-3">
          {filtered.map((a, i) => (
            <motion.div key={a.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04, duration: 0.4, ease: EASE }} className="glass-card p-4">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <p className="text-[14px] font-semibold text-foreground truncate">{a.title}</p>
                  <p className="text-[11px] text-muted-foreground">{a.course_code}{a.course_title ? ` · ${a.course_title}` : ""}</p>
                </div>
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full flex-shrink-0 capitalize ${a.priority === "high" ? "bg-primary/15 text-primary" : "bg-muted/60 text-muted-foreground"}`}>{a.priority}</span>
              </div>
              <div className="flex flex-wrap gap-2 mt-2.5 text-[11px]">
                <span className="text-muted-foreground">Due {a.due_date ? a.due_date.split("T")[0] : "—"}</span>
                <span className="text-muted-foreground">·</span>
                <span className="text-foreground/80">{STATUS_LABEL[a.status] || a.status}</span>
                <span className="text-muted-foreground">·</span>
                <span className="text-foreground/80 capitalize">{a.submission_type}</span>
              </div>
              {a.description && <p className="text-[12px] text-muted-foreground mt-2 leading-relaxed">{a.description}</p>}
              {a.attachments?.length > 0 && <p className="text-[11px] text-primary mt-2">{a.attachments.length} attachment{a.attachments.length !== 1 ? "s" : ""}</p>}
              <div className="flex gap-3 mt-3">
                <button onClick={() => openEdit(a)} className="text-[12px] font-semibold text-primary spring-tap">Edit</button>
                <button onClick={() => del.mutate(a.id)} className="text-[12px] font-semibold text-destructive spring-tap ml-auto">Delete</button>
              </div>
            </motion.div>
          ))}
        </div>
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
              <select value={form.status || "pending"} onChange={(e) => setForm({ ...form, status: e.target.value })} className="mt-1.5 w-full h-[52px] px-4 rounded-2xl bg-muted/50 border border-border text-[15px] text-foreground focus:outline-none focus:border-primary/60">{["pending", "in_progress", "submitted", "graded", "late"].map((p) => <option key={p} value={p}>{STATUS_LABEL[p]}</option>)}</select>
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
            <label className="mt-1.5 flex items-center gap-3 h-[48px] px-4 rounded-2xl glass cursor-pointer">
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