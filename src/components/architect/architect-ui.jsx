import React from "react";
import { cn } from "@/lib/utils";
import { Undo2, Redo2, Save, Rocket, X, RotateCcw, Loader2 } from "lucide-react";

export { SectionHeader, Panel, StatusPill, DataTable, SearchInput, Btn, LoadingState, EmptyState, StatCard } from "@/components/oracle/oracle-ui";

export function EditorToolbar({ name, onName, onUndo, onRedo, canUndo, canRedo, onSave, saving, onPublish, onRollback, status, onClose, lastSaved }) {
  return (
    <div className="flex items-center gap-2 px-3 h-12 glass-strong rounded-xl mb-4 flex-wrap">
      <input value={name} onChange={(e) => onName(e.target.value)} placeholder="Configuration name…" className="bg-transparent text-[14px] font-heading font-semibold focus:outline-none flex-1 min-w-[140px]" />
      <span className={cn("text-[10px] px-2 py-0.5 rounded-full font-semibold", status === "published" ? "bg-success/15 text-success" : "bg-warning/15 text-warning")}>{status || "draft"}</span>
      <div className="flex items-center gap-1">
        <IconBtn onClick={onUndo} disabled={!canUndo} title="Undo ⌘Z"><Undo2 className="w-4 h-4" /></IconBtn>
        <IconBtn onClick={onRedo} disabled={!canRedo} title="Redo ⌘⇧Z"><Redo2 className="w-4 h-4" /></IconBtn>
      </div>
      <button onClick={onSave} className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-muted/50 text-[12px] font-medium hover:bg-muted/80" title="Save ⌘S">
        {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}{saving ? "Saving" : "Save"}
      </button>
      {status === "published"
        ? <button onClick={onRollback} className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-warning/15 text-warning text-[12px] font-heading font-semibold spring-tap" title="Rollback ⌘P"><RotateCcw className="w-3.5 h-3.5" />Rollback</button>
        : <button onClick={onPublish} className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-primary text-primary-foreground text-[12px] font-heading font-semibold spring-tap ice-glow" title="Publish ⌘P"><Rocket className="w-3.5 h-3.5" />Publish</button>}
      {lastSaved && <span className="text-[10px] text-muted-foreground hidden md:inline">Saved {new Date(lastSaved).toLocaleTimeString()}</span>}
      <IconBtn onClick={onClose} title="Close"><X className="w-4 h-4" /></IconBtn>
    </div>
  );
}

function IconBtn({ children, ...props }) {
  return <button {...props} className="p-1.5 rounded-lg hover:bg-muted/60 disabled:opacity-30 disabled:cursor-not-allowed">{children}</button>;
}

export function Palette({ items, onAdd, title = "Components" }) {
  return (
    <div className="glass-card radius-lg p-3 w-full lg:w-[220px] shrink-0">
      <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2 px-1">{title}</p>
      <div className="space-y-1">
        {items.map((it) => {
          const Icon = it.icon;
          return (
            <button key={it.key} onClick={() => onAdd(it)} className="w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-[12px] font-medium text-left hover:bg-primary/12 hover:text-primary spring-tap">
              <Icon className="w-3.5 h-3.5 shrink-0" /><span className="truncate">{it.label}</span>
            </button>
          );
        })}
      </div>
      <p className="text-[10px] text-muted-foreground mt-2 px-1">Click to add · drag canvas items to reorder</p>
    </div>
  );
}

export function CanvasCard({ children, className }) {
  return <div className={cn("glass-card radius-lg p-4 flex-1 min-w-0", className)}>{children}</div>;
}

export function EmptyCanvas({ label }) {
  return <div className="border-2 border-dashed border-border rounded-xl py-16 text-center text-muted-foreground text-[13px]">{label}</div>;
}