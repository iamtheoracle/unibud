import React, { useState } from "react";
import { Plus, Loader2, X } from "lucide-react";

const TYPES = [
  { v: "task", l: "Task", icon: "✓" }, { v: "note", l: "Note", icon: "📝" },
  { v: "document", l: "Document", icon: "📄" }, { v: "checklist", l: "Checklist", icon: "☑" },
  { v: "study_plan", l: "Study Plan", icon: "📅" }, { v: "whiteboard", l: "Whiteboard", icon: "🎨" },
];

export default function ItemComposer({ onCreated, members = [] }) {
  const [open, setOpen] = useState(false);
  const [type, setType] = useState("task");
  const [title, setTitle] = useState("");
  const [assignee, setAssignee] = useState("");
  const [due, setDue] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    if (!title.trim()) return;
    setBusy(true);
    const mem = members.find((m) => m.user_id === assignee);
    try {
      await onCreated({
        type, title: title.trim(), due_date: due || null,
        assignee_id: assignee || null, assignee_name: mem?.name || null,
        blocks: type === "checklist" ? [] : type === "whiteboard" ? [] : type === "study_plan" ? [] : null,
      });
      setTitle(""); setAssignee(""); setDue(""); setType("task"); setOpen(false);
    } finally { setBusy(false); }
  };

  if (!open) {
    return (
      <button onClick={() => setOpen(true)}
        className="w-full glass-card p-3 flex items-center justify-center gap-2 text-sm font-semibold text-accent spring-tap">
        <Plus className="w-4 h-4" /> Add item
      </button>
    );
  }

  return (
    <div className="glass-card p-3.5 space-y-2.5">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold text-muted-foreground">New item</p>
        <button onClick={() => setOpen(false)}><X className="w-4 h-4 text-muted-foreground" /></button>
      </div>
      <div className="flex gap-1.5 overflow-x-auto no-scrollbar">
        {TYPES.map((t) => (
          <button key={t.v} onClick={() => setType(t.v)}
            className={`px-2.5 py-1 rounded-full text-[11px] font-semibold whitespace-nowrap spring-tap ${
              type === t.v ? "bg-primary text-primary-foreground" : "bg-muted/50 text-foreground/70"
            }`}>{t.icon} {t.l}</button>
        ))}
      </div>
      <input autoFocus value={title} onChange={(e) => setTitle(e.target.value)}
        placeholder="Item title…" className="w-full oracle-input" />
      <div className="grid grid-cols-2 gap-2">
        <select value={assignee} onChange={(e) => setAssignee(e.target.value)} className="oracle-input">
          <option value="">Unassigned</option>
          {members.map((m) => <option key={m.user_id} value={m.user_id}>{m.name}</option>)}
        </select>
        <input type="date" value={due} onChange={(e) => setDue(e.target.value)} className="oracle-input" />
      </div>
      <button onClick={submit} disabled={busy || !title.trim()}
        className="w-full bg-accent text-accent-foreground rounded-xl py-2 text-sm font-semibold spring-tap disabled:opacity-40 flex items-center justify-center gap-2">
        {busy && <Loader2 className="w-4 h-4 animate-spin" />} Add
      </button>
    </div>
  );
}