import React, { useState } from "react";
import { X, Loader2 } from "lucide-react";

const TYPES = [
  { v: "study_group", l: "Study Group" }, { v: "project", l: "Project" },
  { v: "research", l: "Research" }, { v: "club", l: "Club" },
  { v: "community", l: "Community" }, { v: "department", l: "Department" },
  { v: "course", l: "Course" }, { v: "leadership", l: "Leadership" },
  { v: "personal", l: "Personal" }, { v: "team", l: "Team" },
];

export default function WorkspaceComposer({ open, onClose, onCreate }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState("study_group");
  const [due, setDue] = useState("");
  const [busy, setBusy] = useState(false);

  if (!open) return null;

  const submit = async () => {
    if (!title.trim()) return;
    setBusy(true);
    try {
      await onCreate({ title: title.trim(), description, type, due_date: due || null });
      setTitle(""); setDescription(""); setType("study_group"); setDue("");
      onClose();
    } finally { setBusy(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm" onClick={onClose}>
      <div className="w-full max-w-[520px] glass-strong rounded-t-3xl sm:rounded-3xl p-5" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-bold text-foreground">New workspace</h2>
          <button onClick={onClose}><X className="w-5 h-5 text-muted-foreground" /></button>
        </div>
        <label className="text-[11px] font-semibold text-muted-foreground">Title</label>
        <input autoFocus value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Final Year Project Team"
          className="w-full oracle-input mb-3 mt-1" />
        <label className="text-[11px] font-semibold text-muted-foreground">Description</label>
        <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="What is this workspace for?"
          className="w-full oracle-input mb-3 mt-1 min-h-[70px] resize-none" />
        <label className="text-[11px] font-semibold text-muted-foreground">Type</label>
        <select value={type} onChange={(e) => setType(e.target.value)} className="w-full oracle-input mb-3 mt-1">
          {TYPES.map((t) => <option key={t.v} value={t.v}>{t.l}</option>)}
        </select>
        <label className="text-[11px] font-semibold text-muted-foreground">Due date (optional)</label>
        <input type="date" value={due} onChange={(e) => setDue(e.target.value)} className="w-full oracle-input mb-4 mt-1" />
        <button onClick={submit} disabled={busy || !title.trim()}
          className="w-full bg-primary text-primary-foreground rounded-xl py-2.5 text-sm font-semibold spring-tap disabled:opacity-40 flex items-center justify-center gap-2">
          {busy && <Loader2 className="w-4 h-4 animate-spin" />} Create workspace
        </button>
      </div>
    </div>
  );
}