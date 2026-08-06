import React, { useState } from "react";
import { motion } from "framer-motion";
import { X, Sparkles, Loader2, Plus } from "lucide-react";
import { TASK_TYPES, TASK_PRIORITIES } from "@/lib/tasks/constants";
import { useCreateTask, useUpdateTask } from "@/lib/tasks/useTasks";
import { parseTaskFromText } from "@/lib/tasks/budTaskIntent";
import { useToast } from "@/components/ui/use-toast";

export default function TaskComposer({ open, onClose, actor, editTask, workspaceId }) {
  const { toast } = useToast();
  const create = useCreateTask();
  const update = useUpdateTask();
  const [nl, setNl] = useState("");
  const [parsing, setParsing] = useState(false);
  const [form, setForm] = useState(() => initForm(editTask, workspaceId));

  function initForm(t, ws) {
    if (t) return { ...t, checklist: (t.checklist || []).map((c) => c.text || c), milestoneInput: "" };
    return {
      title: "", description: "", task_type: "custom", category: "", priority: "medium",
      assignee_names: "", team: "", workspace_id: ws || "", department: "", institution_id: "",
      due_date: "", start_date: "", estimated_duration_minutes: 0, tags: "",
      checklist: [], milestones: [], dependencies: "",
      required_approvals: [], description_long: "",
    };
  }

  if (!open) return null;

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const handleParse = async () => {
    if (!nl.trim()) return;
    setParsing(true);
    try {
      const parsed = await parseTaskFromText(nl);
      setForm((f) => ({
        ...f,
        title: parsed.title || f.title,
        description: parsed.description || f.description,
        task_type: parsed.task_type || f.task_type,
        priority: parsed.priority || f.priority,
        due_date: parsed.due_date || f.due_date,
        tags: parsed.tags ? parsed.tags.join(", ") : f.tags,
        checklist: parsed.checklist && parsed.checklist.length ? parsed.checklist : f.checklist,
      }));
      toast({ title: "Spark drafted your task", description: "Review and refine before saving." });
    } catch (e) {
      toast({ title: "Could not parse task", description: e?.message, variant: "destructive" });
    } finally {
      setParsing(false);
    }
  };

  const submit = async () => {
    if (!form.title.trim()) { toast({ title: "Title is required", variant: "destructive" }); return; }
    const assignee_names = form.assignee_names.split(",").map((s) => s.trim()).filter(Boolean);
    const tags = form.tags.split(",").map((s) => s.trim()).filter(Boolean);
    const checklist = (form.checklist || []).filter(Boolean).map((c) => (typeof c === "string" ? { text: c, done: false } : c));
    const milestones = form.milestones || [];
    const payload = {
      title: form.title.trim(),
      description: form.description,
      task_type: form.task_type,
      category: form.category,
      priority: form.priority,
      assignee_ids: [], // assignee_names denormalized; ids resolved by invitation flow
      assignee_names,
      team: form.team,
      workspace_id: form.workspace_id || undefined,
      department: form.department,
      institution_id: form.institution_id,
      due_date: form.due_date || undefined,
      start_date: form.start_date || undefined,
      estimated_duration_minutes: Number(form.estimated_duration_minutes) || 0,
      tags,
      checklist,
      milestones,
      dependencies: form.dependencies ? form.dependencies.split(",").map((s) => s.trim()).filter(Boolean) : [],
      required_approvals: form.required_approvals || [],
    };
    try {
      if (editTask) {
        await update.mutateAsync({ task: editTask, patch: payload, actor });
        toast({ title: "Task updated" });
      } else {
        await create.mutateAsync({ task: payload, actor });
        toast({ title: "Task created", description: assignee_names.length ? "Assignees notified." : "Saved as draft." });
      }
      onClose();
    } catch (e) {
      toast({ title: "Save failed", description: e?.message, variant: "destructive" });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm" onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 40 }}
        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
        className="glass-strong w-full sm:max-w-lg max-h-[90vh] overflow-y-auto rounded-t-[28px] sm:rounded-[28px] p-5 safe-area-pb"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-heading font-bold text-[18px]">{editTask ? "Edit task" : "New task"}</h2>
          <button onClick={onClose} className="w-9 h-9 rounded-full bg-muted/50 grid place-items-center spring-tap"><X className="w-4 h-4" /></button>
        </div>

        {/* Bud natural-language */}
        <div className="crystal-card p-3 mb-4">
          <div className="flex items-center gap-2 mb-2 text-primary">
            <Sparkles className="w-4 h-4" />
            <span className="text-[12px] font-semibold">Describe it to Bud</span>
          </div>
          <textarea
            value={nl} onChange={(e) => setNl(e.target.value)}
            placeholder="e.g. Prepare a group presentation on renewable energy for next Friday, assign to Ada and Tunde"
            className="w-full bg-muted/40 rounded-xl p-3 text-[13px] min-h-[64px] resize-none focus:outline-none focus:ring-2 focus:ring-primary/40"
          />
          <button
            onClick={handleParse} disabled={parsing || !nl.trim()}
            className="mt-2 w-full h-10 rounded-xl bg-primary text-primary-foreground font-semibold text-[13px] spring-tap disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {parsing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            {parsing ? "Drafting…" : "Draft with Bud"}
          </button>
        </div>

        <Field label="Title">
          <input value={form.title} onChange={(e) => set("title", e.target.value)} placeholder="Task title" className="task-input" />
        </Field>
        <Field label="Description">
          <textarea value={form.description} onChange={(e) => set("description", e.target.value)} placeholder="Brief / details" className="task-input min-h-[72px] resize-none" />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Type">
            <select value={form.task_type} onChange={(e) => set("task_type", e.target.value)} className="task-input">
              {TASK_TYPES.map((t) => <option key={t.id} value={t.id}>{t.label}</option>)}
            </select>
          </Field>
          <Field label="Priority">
            <select value={form.priority} onChange={(e) => set("priority", e.target.value)} className="task-input">
              {TASK_PRIORITIES.map((p) => <option key={p.id} value={p.id}>{p.label}</option>)}
            </select>
          </Field>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Start date"><input type="date" value={form.start_date} onChange={(e) => set("start_date", e.target.value)} className="task-input" /></Field>
          <Field label="Due date"><input type="date" value={form.due_date} onChange={(e) => set("due_date", e.target.value)} className="task-input" /></Field>
        </div>
        <Field label="Assignees (comma-separated names)">
          <input value={form.assignee_names} onChange={(e) => set("assignee_names", e.target.value)} placeholder="Ada Okafor, Tunde Bello" className="task-input" />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Team"><input value={form.team} onChange={(e) => set("team", e.target.value)} className="task-input" /></Field>
          <Field label="Department"><input value={form.department} onChange={(e) => set("department", e.target.value)} className="task-input" /></Field>
        </div>
        <Field label="Tags (comma-separated)">
          <input value={form.tags} onChange={(e) => set("tags", e.target.value)} placeholder="research, energy" className="task-input" />
        </Field>
        <Field label="Checklist (one per line)">
          <textarea
            value={(form.checklist || []).map((c) => (typeof c === "string" ? c : c.text)).join("\n")}
            onChange={(e) => set("checklist", e.target.value.split("\n").filter(Boolean))}
            className="task-input min-h-[72px] resize-none"
            placeholder="Research sources&#10;Draft outline&#10;Build slides"
          />
        </Field>

        <div className="flex gap-2 mt-5">
          <button onClick={onClose} className="flex-1 h-11 rounded-xl bg-muted/60 font-semibold text-[13px] spring-tap">Cancel</button>
          <button onClick={submit} disabled={create.isPending || update.isPending} className="flex-1 h-11 rounded-xl bg-primary text-primary-foreground font-semibold text-[13px] spring-tap disabled:opacity-50 flex items-center justify-center gap-2">
            {(create.isPending || update.isPending) ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
            {editTask ? "Save changes" : "Create task"}
          </button>
        </div>
      </motion.div>
      <style>{`.task-input{width:100%;height:40px;padding:0 12px;border-radius:12px;background:hsl(var(--muted)/0.4);border:1px solid hsl(var(--border));font-size:13px;color:hsl(var(--foreground))}textarea.task-input{height:auto;padding:10px 12px}select.task-input{appearance:none}`}</style>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <label className="block mb-3">
      <span className="text-[11px] font-semibold text-muted-foreground mb-1 block">{label}</span>
      {children}
    </label>
  );
}