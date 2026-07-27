import React, { useState } from "react";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export function SectionHeader({ title, desc, actions }) {
  return (
    <div className="flex items-start justify-between gap-3 mb-4">
      <div className="min-w-0">
        <h1 className="font-heading font-bold text-[22px] leading-tight truncate">{title}</h1>
        {desc && <p className="text-[13px] text-muted-foreground mt-0.5 leading-snug">{desc}</p>}
      </div>
      {actions && <div className="flex items-center gap-2 shrink-0">{actions}</div>}
    </div>
  );
}

export function Panel({ title, icon: Icon, actions, children, className }) {
  return (
    <div className={cn("glass-card radius-lg p-4", className)}>
      {(title || actions) && (
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            {Icon && <Icon className="w-4 h-4 text-primary" />}
            {title && <h3 className="font-heading font-semibold text-[14px]">{title}</h3>}
          </div>
          {actions}
        </div>
      )}
      {children}
    </div>
  );
}

const BTN = {
  primary: "bg-primary text-primary-foreground soft-shadow hover:bg-primary/90",
  soft: "glass text-foreground hover:bg-muted/40",
  ghost: "text-foreground/70 hover:bg-muted/40",
  danger: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
};
const SZ = { sm: "h-8 px-3 text-[12px] rounded-lg", md: "h-9 px-4 text-[13px] rounded-xl", icon: "h-9 w-9 rounded-xl" };
export function Btn({ variant = "soft", size = "md", className, children, ...props }) {
  return <button className={cn("inline-flex items-center justify-center gap-1.5 font-heading font-semibold transition-all active:scale-[0.97] disabled:opacity-50", BTN[variant], SZ[size], className)} {...props}>{children}</button>;
}

const TONES = {
  primary: "text-primary", success: "text-success", warn: "text-warning", info: "text-information",
  danger: "text-destructive", muted: "text-muted-foreground",
};
export function StatCard({ icon: Icon, label, value, tone = "primary", sub }) {
  return (
    <div className="glass-card radius-lg p-4 card-hover">
      <div className="flex items-center justify-between">
        <span className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">{label}</span>
        {Icon && <Icon className={cn("w-4 h-4", TONES[tone])} />}
      </div>
      <p className={cn("font-heading font-bold text-[26px] mt-2 leading-none", TONES[tone])}>{value ?? "—"}</p>
      {sub && <p className="text-[11px] text-muted-foreground mt-1.5">{sub}</p>}
    </div>
  );
}

export function StatusPill({ status }) {
  const map = {
    pending: "bg-warning/15 text-warning", paid: "bg-success/15 text-success", approved: "bg-success/15 text-success",
    rejected: "bg-destructive/15 text-destructive", overdue: "bg-destructive/15 text-destructive", refunded: "bg-information/15 text-information",
    active: "bg-success/15 text-success", on_leave: "bg-warning/15 text-warning", suspended: "bg-destructive/15 text-destructive",
    published: "bg-success/15 text-success", draft: "bg-muted text-muted-foreground", completed: "bg-success/15 text-success",
    in_progress: "bg-information/15 text-information", admitted: "bg-success/15 text-success", offered: "bg-primary/15 text-primary",
  };
  const cls = map[status] || "bg-muted text-muted-foreground";
  return <span className={cn("px-2 py-0.5 rounded-full text-[10px] font-semibold capitalize whitespace-nowrap", cls)}>{(status || "—").replace("_", " ")}</span>;
}

export function SearchInput({ value, onChange, placeholder = "Search…" }) {
  return <input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className="oracle-input h-9 max-w-[260px]" />;
}

export function Drawer({ open, onClose, title, children, footer }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-[460px] h-full glass-strong border-l border-border flex flex-col fade-in-up">
        <div className="flex items-center justify-between px-4 h-14 border-b border-border shrink-0">
          <h3 className="font-heading font-semibold text-[15px]">{title}</h3>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-muted/50"><X className="w-4 h-4" /></button>
        </div>
        <div className="flex-1 overflow-y-auto no-scrollbar p-4 space-y-3">{children}</div>
        {footer && <div className="px-4 py-3 border-t border-border flex justify-end gap-2 shrink-0">{footer}</div>}
      </div>
    </div>
  );
}

export function EmptyState({ icon: Icon, message }) {
  return (
    <div className="py-10 text-center">
      {Icon && <Icon className="w-6 h-6 text-muted-foreground/40 mx-auto mb-2" />}
      <p className="text-[13px] text-muted-foreground">{message}</p>
    </div>
  );
}

export function LoadingState() {
  return <div className="py-10 text-center text-[13px] text-muted-foreground">Loading…</div>;
}

export function DataTable({ columns, rows, empty = "No records", onRowClick }) {
  const [page, setPage] = useState(1);
  const ps = 10;
  const pages = Math.max(1, Math.ceil(rows.length / ps));
  const cur = Math.min(page, pages);
  const slice = rows.slice((cur - 1) * ps, cur * ps);
  return (
    <div>
      <div className="overflow-x-auto no-scrollbar rounded-xl border border-border/60">
        <table className="w-full text-[13px]">
          <thead>
            <tr className="bg-muted/40 text-muted-foreground">
              {columns.map((c) => <th key={c.key} className={cn("px-3 py-2.5 text-left font-semibold text-[11px] uppercase tracking-wider", c.label ? "" : "w-10")}>{c.label}</th>)}
            </tr>
          </thead>
          <tbody>
            {slice.length === 0 ? (
              <tr><td colSpan={columns.length} className="px-3 py-8 text-center text-muted-foreground text-[13px]">{empty}</td></tr>
            ) : slice.map((r, i) => (
              <tr key={r.id || i} onClick={() => onRowClick && onRowClick(r)} className={cn("border-t border-border/40 hover:bg-muted/20 transition-colors", onRowClick && "cursor-pointer")}>
                {columns.map((c) => <td key={c.key} className="px-3 py-2.5 align-middle">{c.render ? c.render(r) : (r[c.key] ?? "—")}</td>)}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {rows.length > ps && (
        <div className="flex items-center justify-between mt-3 text-[12px] text-muted-foreground">
          <span>Showing {(cur - 1) * ps + 1}–{Math.min(cur * ps, rows.length)} of {rows.length}</span>
          <div className="flex gap-1">
            <Btn size="sm" variant="soft" disabled={cur === 1} onClick={() => setPage(cur - 1)}><ChevronLeft className="w-3.5 h-3.5" /></Btn>
            <Btn size="sm" variant="soft" disabled={cur === pages} onClick={() => setPage(cur + 1)}><ChevronRight className="w-3.5 h-3.5" /></Btn>
          </div>
        </div>
      )}
    </div>
  );
}