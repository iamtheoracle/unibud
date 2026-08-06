import React, { useState } from "react";
import { X, Loader2, Check } from "lucide-react";
import { TEMPLATES } from "@/lib/collaboration/templates";

/** TemplateGallery — pick a Smart Project Template to seed a workspace. */
export default function TemplateGallery({ open, onClose, onApply }) {
  const [busy, setBusy] = useState(null);
  if (!open) return null;

  const apply = async (t) => {
    setBusy(t.key);
    try { await onApply(t); onClose(); } finally { setBusy(null); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm" onClick={onClose}>
      <div className="w-full max-w-[600px] glass-strong rounded-t-3xl sm:rounded-3xl p-5 max-h-[88vh] overflow-y-auto no-scrollbar" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-1">
          <h2 className="text-base font-bold text-foreground">Smart project templates</h2>
          <button onClick={onClose}><X className="w-5 h-5 text-muted-foreground" /></button>
        </div>
        <p className="text-xs text-muted-foreground mb-4">Each template comes with ready-made notes, tasks, a timeline, milestones and suggested workflow.</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {TEMPLATES.map((t) => (
            <div key={t.key} className="glass-card p-3.5 card-hover">
              <div className="flex items-start gap-2 mb-2">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center text-lg" style={{ background: `hsl(${t.color} / 0.14)` }}>{t.icon}</div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground">{t.label}</p>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wide">{t.type.replace("_", " ")}</p>
                </div>
              </div>
              <p className="text-[11px] text-muted-foreground mb-2 line-clamp-2">{t.summary}</p>
              <div className="flex items-center gap-1.5 flex-wrap mb-2.5">
                {(t.items || []).slice(0, 4).map((it, i) => (
                  <span key={i} className="text-[9px] font-semibold px-1.5 py-0.5 rounded-full bg-muted/50 text-foreground/60">{it.type}</span>
                ))}
                <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded-full bg-accent/12 text-accent">{(t.milestones || []).length} milestones</span>
              </div>
              <div className="flex items-center justify-between">
                <p className="text-[10px] text-muted-foreground truncate flex-1 mr-2">{t.workflow}</p>
                <button onClick={() => apply(t)} disabled={busy === t.key}
                  className="px-2.5 py-1 rounded-full bg-primary text-primary-foreground text-[11px] font-semibold spring-tap disabled:opacity-40 flex items-center gap-1">
                  {busy === t.key ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />} Use
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}