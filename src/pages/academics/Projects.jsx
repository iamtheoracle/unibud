import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { base44 } from "@/api/base44Client";
import { useMockFallback } from "@/lib/mock/useMockFallback";
import { PROJECT_MOCK_ENTRIES } from "@/lib/academic/mockShapes2";
import ScreenShell from "@/components/layout/ScreenShell";
import Sheet from "@/components/academics/Sheet";
import EmptyState from "@/components/academics/EmptyState";
import GlassInput from "@/components/foundation/GlassInput";
import { toast } from "@/components/ui/use-toast";

const EASE = [0.16, 1, 0.3, 1];

export default function Projects() {
  const qc = useQueryClient();
  const pq = useQuery({ queryKey: ["projects"], queryFn: () => base44.entities.Project.list() });
  const { data: projects } = useMockFallback(pq, PROJECT_MOCK_ENTRIES);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({});
  const [uploading, setUploading] = useState(false);
  const [milestoneText, setMilestoneText] = useState("");
  const [budText, setBudText] = useState("");
  const [budLoading, setBudLoading] = useState(false);

  const save = useMutation({
    mutationFn: (v) => (editing?.id ? base44.entities.Project.update(editing.id, v) : base44.entities.Project.create(v)),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["projects"] }); toast({ title: editing?.id ? "Project saved" : "Project added" }); setEditing(null); },
  });
  const del = useMutation({ mutationFn: (id) => base44.entities.Project.delete(id), onSuccess: () => { qc.invalidateQueries({ queryKey: ["projects"] }); toast({ title: "Project deleted" }); } });

  const openNew = () => { setEditing({}); setForm({ title: "", supervisor: "", deadline: "", status: "planning", team_members: [], notes: "", references: [], files: [], milestones: [] }); setBudText(""); };
  const openEdit = (p) => { setEditing(p); setForm({ ...p, team_members: p.team_members || [], references: p.references || [], files: p.files || [], milestones: p.milestones || [] }); setBudText(""); };

  const addFile = async (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setUploading(true);
    try { const { file_url } = await base44.integrations.Core.UploadFile({ file: f }); setForm((s) => ({ ...s, files: [...(s.files || []), file_url] })); }
    catch { toast({ title: "Upload failed" }); }
    finally { setUploading(false); e.target.value = ""; }
  };
  const toggleMilestone = (i) => { const ms = [...(form.milestones || [])]; ms[i] = { ...ms[i], done: !ms[i].done }; setForm({ ...form, milestones: ms }); };
  const addMilestone = () => { if (!milestoneText.trim()) return; setForm({ ...form, milestones: [...(form.milestones || []), { title: milestoneText.trim(), done: false }] }); setMilestoneText(""); };
  const removeMilestone = (i) => { const ms = [...(form.milestones || [])]; ms.splice(i, 1); setForm({ ...form, milestones: ms }); };

  const budHelp = async (kind) => {
    if (!form.title) { toast({ title: "Add a project title first" }); return; }
    setBudLoading(true);
    try {
      const res = await base44.integrations.Core.InvokeLLM({ prompt: `You are Bud, an academic project companion. For a student project titled "${form.title}"${form.notes ? ` about ${form.notes}` : ""}, ${kind === "topics" ? "suggest 5 specific project topic ideas" : "generate a clear section-by-section outline"}. Keep it concise and encouraging.` });
      setBudText(typeof res === "string" ? res : res?.response || "Here are some ideas to get you started.");
    } catch { setBudText("I'm here — try again in a moment."); }
    finally { setBudLoading(false); }
  };

  return (
    <ScreenShell title="Projects" back actions={<button onClick={openNew} className="text-[12px] font-semibold text-primary spring-tap">+ Add</button>}>
      {!projects?.length ? <EmptyState message="No projects yet. Start a new project to plan your work with Bud." /> : (
        <div className="space-y-3">
          {projects.map((p, i) => {
            const ms = p.milestones || [];
            const done = ms.filter((m) => m.done).length;
            return (
              <motion.div key={p.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04, duration: 0.4, ease: EASE }} className="glass-card p-4">
                <p className="text-[14px] font-semibold text-foreground">{p.title}</p>
                <p className="text-[11px] text-muted-foreground">{p.supervisor ? `Supervisor: ${p.supervisor} · ` : ""}{p.deadline ? `Due ${p.deadline}` : ""}{p.status ? ` · ${p.status.replace("_", " ")}` : ""}</p>
                {(p.team_members || []).length > 0 && <p className="text-[11px] text-muted-foreground mt-1">Team: {(p.team_members || []).join(", ")}</p>}
                {ms.length > 0 && (
                  <div className="mt-2">
                    <div className="h-1.5 rounded-full bg-muted overflow-hidden"><div className="h-full bg-primary rounded-full" style={{ width: `${ms.length ? (done / ms.length) * 100 : 0}%` }} /></div>
                    <p className="text-[10px] text-muted-foreground mt-1">{done}/{ms.length} milestones</p>
                  </div>
                )}
                <div className="flex gap-3 mt-3">
                  {!p.__mock && (<>
                  <button onClick={() => openEdit(p)} className="text-[12px] font-semibold text-primary spring-tap">Open</button>
                  <button onClick={() => del.mutate(p.id)} className="text-[12px] font-semibold text-destructive spring-tap ml-auto">Delete</button>
                  </>)}
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      <Sheet open={!!editing} onClose={() => setEditing(null)} title={editing?.id ? "Project" : "New Project"}>
        <div className="space-y-3.5">
          <GlassInput label="Topic / Title" value={form.title || ""} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          <div className="grid grid-cols-2 gap-3">
            <GlassInput label="Supervisor" value={form.supervisor || ""} onChange={(e) => setForm({ ...form, supervisor: e.target.value })} />
            <GlassInput label="Deadline" type="date" value={form.deadline || ""} onChange={(e) => setForm({ ...form, deadline: e.target.value })} />
          </div>
          <div>
            <label className="text-[12px] font-semibold text-muted-foreground/90 ml-1">Status</label>
            <select value={form.status || "planning"} onChange={(e) => setForm({ ...form, status: e.target.value })} className="mt-1.5 w-full h-[52px] px-4 rounded-2xl bg-muted/50 border border-border text-[15px] text-foreground focus:outline-none focus:border-primary/60 capitalize">{["planning", "in_progress", "review", "completed"].map((s) => <option key={s} value={s}>{s.replace("_", " ")}</option>)}</select>
          </div>
          <GlassInput label="Team Members (comma separated)" value={(form.team_members || []).join(", ")} onChange={(e) => setForm({ ...form, team_members: e.target.value.split(",").map((s) => s.trim()).filter(Boolean) })} />
          <div>
            <label className="text-[12px] font-semibold text-muted-foreground/90 ml-1">Research Notes</label>
            <textarea value={form.notes || ""} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={3} className="mt-1.5 w-full p-4 rounded-2xl bg-muted/50 border border-border text-[14px] text-foreground focus:outline-none focus:border-primary/60" />
          </div>
          <GlassInput label="References (comma separated)" value={(form.references || []).join(", ")} onChange={(e) => setForm({ ...form, references: e.target.value.split(",").map((s) => s.trim()).filter(Boolean) })} />
          <div>
            <label className="text-[12px] font-semibold text-muted-foreground/90 ml-1">Uploaded Files</label>
            <label className="mt-1.5 flex items-center gap-3 h-[48px] px-4 rounded-2xl glass cursor-pointer">
              <input type="file" onChange={addFile} className="hidden" />
              <span className="text-[13px] text-muted-foreground flex-1">{uploading ? "Uploading…" : "+ Add file"}</span>
            </label>
            {(form.files || []).map((u, i) => <a key={i} href={u} target="_blank" rel="noreferrer" className="block text-[11px] text-primary mt-1 truncate">File {i + 1}</a>)}
          </div>
          <div>
            <label className="text-[12px] font-semibold text-muted-foreground/90 ml-1">Milestones</label>
            <div className="flex gap-2 mt-1.5">
              <input value={milestoneText} onChange={(e) => setMilestoneText(e.target.value)} placeholder="Add a milestone…" className="flex-1 h-[44px] px-4 rounded-2xl bg-muted/50 border border-border text-[14px] text-foreground focus:outline-none focus:border-primary/60" onKeyDown={(e) => e.key === "Enter" && addMilestone()} />
              <button onClick={addMilestone} className="px-4 rounded-2xl bg-primary text-primary-foreground font-semibold text-[13px] spring-tap">Add</button>
            </div>
            <div className="space-y-1.5 mt-2">
              {(form.milestones || []).map((m, i) => (
                <div key={i} className="flex items-center gap-2 p-2 rounded-xl bg-muted/30">
                  <button onClick={() => toggleMilestone(i)} className={`w-5 h-5 rounded-md flex items-center justify-center spring-tap ${m.done ? "bg-primary text-primary-foreground" : "bg-muted border border-border"}`}><span className="text-[10px] font-bold">{m.done ? "✓" : ""}</span></button>
                  <span className={`flex-1 text-[13px] ${m.done ? "text-muted-foreground line-through" : "text-foreground"}`}>{m.title}</span>
                  <button onClick={() => removeMilestone(i)} className="text-[11px] font-semibold text-destructive spring-tap">Remove</button>
                </div>
              ))}
            </div>
          </div>
          <div className="p-3 rounded-2xl bg-primary/8 border border-primary/15">
            <p className="text-[12px] font-semibold text-primary mb-2">Bud can help</p>
            <div className="flex gap-2 mb-2">
              <button onClick={() => budHelp("topics")} disabled={budLoading} className="px-3 py-1.5 rounded-full glass text-[11px] font-semibold text-foreground spring-tap">Brainstorm topics</button>
              <button onClick={() => budHelp("outline")} disabled={budLoading} className="px-3 py-1.5 rounded-full glass text-[11px] font-semibold text-foreground spring-tap">Generate outline</button>
            </div>
            {budLoading && <p className="text-[12px] text-muted-foreground">Bud is thinking…</p>}
            {budText && <p className="text-[13px] text-foreground/90 leading-relaxed whitespace-pre-wrap">{budText}</p>}
          </div>
        </div>
        <button onClick={() => { if (!form.title) { toast({ title: "Title required" }); return; } save.mutate(form); }} disabled={save.isPending} className="w-full h-[52px] mt-5 rounded-2xl bg-primary text-primary-foreground font-heading font-semibold text-[15px] flex items-center justify-center spring-tap disabled:opacity-50 ice-glow">{save.isPending ? "Saving…" : "Save Project"}</button>
      </Sheet>
    </ScreenShell>
  );
}