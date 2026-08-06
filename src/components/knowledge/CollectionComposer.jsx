import React, { useState } from "react";
import { FolderPlus, Loader2, X } from "lucide-react";

const COLORS = ["#2563EB", "#0EA5E9", "#14B8A6", "#F59E0B", "#EF4444", "#8B5CF6"];

/** CollectionComposer — create a smart folder (reuses Collection entity). */
export default function CollectionComposer({ kb }) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  const [color, setColor] = useState(COLORS[0]);
  const [busy, setBusy] = useState(false);

  const create = async () => {
    if (!name.trim()) return;
    setBusy(true);
    try {
      await kb.newCollection(name.trim(), desc.trim(), color, "Folder");
      setName(""); setDesc(""); setOpen(false);
    } finally { setBusy(false); }
  };

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="w-full glass-card p-3 flex items-center gap-3 spring-tap"
      >
        <div className="w-9 h-9 rounded-xl bg-accent/10 flex items-center justify-center text-accent">
          <FolderPlus className="w-5 h-5" />
        </div>
        <span className="text-sm font-semibold text-foreground">New smart collection</span>
      </button>
    );
  }

  return (
    <div className="glass-card p-4 space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold">New collection</h3>
        <button onClick={() => setOpen(false)} className="text-muted-foreground"><X className="w-4 h-4" /></button>
      </div>
      <input
        value={name} onChange={(e) => setName(e.target.value)}
        placeholder="Collection name"
        className="w-full bg-muted/50 rounded-xl px-3.5 py-2.5 text-sm outline-none"
      />
      <input
        value={desc} onChange={(e) => setDesc(e.target.value)}
        placeholder="Description (optional)"
        className="w-full bg-muted/50 rounded-xl px-3.5 py-2.5 text-sm outline-none"
      />
      <div className="flex items-center gap-2">
        {COLORS.map((c) => (
          <button
            key={c} onClick={() => setColor(c)}
            className={`w-7 h-7 rounded-full spring-tap ${color === c ? "ring-2 ring-offset-2 ring-offset-background" : ""}`}
            style={{ background: c, boxShadow: color === c ? `0 0 0 2px ${c}` : "none" }}
          />
        ))}
      </div>
      <button
        onClick={create} disabled={busy || !name.trim()}
        className="w-full bg-primary text-primary-foreground rounded-xl py-2.5 text-sm font-semibold spring-tap disabled:opacity-40 flex items-center justify-center gap-2"
      >
        {busy && <Loader2 className="w-4 h-4 animate-spin" />} Create collection
      </button>
    </div>
  );
}