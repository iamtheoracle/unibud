import React from "react";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

export function SectionHeader({ title, desc, actions }) {
  return (
    <div className="flex items-start justify-between gap-3 flex-wrap mb-4">
      <div>
        <h1 className="text-[20px] font-heading font-bold">{title}</h1>
        {desc && <p className="text-[13px] text-muted-foreground mt-0.5">{desc}</p>}
      </div>
      {actions && <div className="flex items-center gap-2 flex-wrap">{actions}</div>}
    </div>
  );
}

export function Panel({ title, icon: Icon, actions, className, children, bodyClass }) {
  return (
    <div className={cn("glass-card radius-lg p-4", className)}>
      {(title || actions) && (
        <div className="flex items-center justify-between mb-3 gap-2">
          <div className="flex items-center gap-1.5 min-w-0">
            {Icon && <Icon className="w-4 h-4 text-primary shrink-0" />}
            {title && <p className="text-[13px] font-heading font-semibold truncate">{title}</p>}
          </div>
          {actions}
        </div>
      )}
      <div className={bodyClass}>{children}</div>
    </div>
  );
}

const TONES = { primary: "text-primary", warn: "text-warning", danger: "text-destructive", success: "text-success", info: "text-information" };

export function StatCard({ icon: Icon, label, value, sub, tone, onClick }) {
  return (
    <button onClick={onClick} disabled={!onClick} className="glass-card radius-lg p-4 text-left card-hover w-full disabled:cursor-default">
      <div className="flex items-center gap-2">
        {Icon && <Icon className={cn("w-4 h-4", TONES[tone] || "text-primary")} />}
        <span className="text-[10px] uppercase tracking-wider text-muted-foreground truncate">{label}</span>
      </div>
      <p className="text-[24px] font-heading font-bold mt-1.5 leading-none">{value}</p>
      {sub && <p className="text-[11px] text-muted-foreground mt-1.5 truncate">{sub}</p>}
    </button>
  );
}

const PILL_MAP = {
  active: "bg-success/15 text-success", online: "bg-success/15 text-success", healthy: "bg-success/15 text-success",
  operational: "bg-success/15 text-success", verified: "bg-success/15 text-success", success: "bg-success/15 text-success",
  inactive: "bg-muted/40 text-muted-foreground", suspended: "bg-warning/15 text-warning", paused: "bg-warning/15 text-warning",
  draft: "bg-muted/40 text-muted-foreground", pending: "bg-warning/15 text-warning", reviewing: "bg-information/15 text-information",
  degraded: "bg-warning/15 text-warning", warning: "bg-warning/15 text-warning",
  connected: "bg-success/15 text-success", failed: "bg-destructive/15 text-destructive", error: "bg-destructive/15 text-destructive", critical: "bg-destructive/15 text-destructive",
  offline: "bg-destructive/15 text-destructive", info: "bg-information/15 text-information",
};

export function StatusPill({ status }) {
  const s = String(status || "—").toLowerCase();
  return (
    <span className={cn("inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold capitalize whitespace-nowrap", PILL_MAP[s] || "bg-muted/40 text-muted-foreground")}>
      {status ? status.replace(/_/g, " ") : "—"}
    </span>
  );
}

export function DataTable({ columns, rows, empty, loading }) {
  if (loading) return <LoadingState />;
  if (!rows || rows.length === 0) return <EmptyState message={empty || "No records"} />;
  return (
    <div className="overflow-x-auto no-scrollbar -mx-1">
      <table className="w-full text-[12px]">
        <thead>
          <tr className="text-left text-[10px] uppercase tracking-wider text-muted-foreground border-b border-border">
            {columns.map((c) => <th key={c.key} className="px-2 py-2 font-semibold whitespace-nowrap">{c.label}</th>)}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={r.id || i} className="border-b border-border/50 hover:bg-muted/20 transition-colors">
              {columns.map((c) => (
                <td key={c.key} className="px-2 py-2.5 align-middle">{c.render ? c.render(r) : r[c.key]}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function EmptyState({ icon: Icon, title, message }) {
  return (
    <div className="py-10 text-center">
      {Icon && <div className="w-12 h-12 rounded-2xl bg-muted/40 grid place-items-center mx-auto mb-2"><Icon className="w-6 h-6 text-muted-foreground" /></div>}
      <p className="font-heading font-semibold text-[14px]">{title || "Nothing here yet"}</p>
      <p className="text-[12px] text-muted-foreground mt-1 max-w-[360px] mx-auto">{message}</p>
    </div>
  );
}

export function LoadingState({ label }) {
  return (
    <div className="py-10 flex items-center justify-center gap-2 text-muted-foreground">
      <Loader2 className="w-4 h-4 animate-spin" /><span className="text-[12px]">{label || "Loading…"}</span>
    </div>
  );
}

export function SearchInput({ value, onChange, placeholder }) {
  return (
    <div className="relative w-full sm:w-64">
      <svg className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" /></svg>
      <input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder || "Search…"} className="w-full h-9 pl-8 pr-3 rounded-lg bg-muted/40 border border-border text-[12px] focus:outline-none focus:border-primary/50" />
    </div>
  );
}

export function Btn({ children, variant = "primary", size = "sm", className, ...props }) {
  const v = { primary: "bg-primary text-primary-foreground ice-glow", ghost: "glass text-foreground", danger: "bg-destructive/15 text-destructive", soft: "bg-muted/50 text-foreground" };
  const s = { sm: "h-8 px-3 text-[12px]", md: "h-9 px-4 text-[13px]" };
  return (
    <button className={cn("inline-flex items-center justify-center gap-1.5 rounded-lg font-heading font-semibold spring-tap uds-focus disabled:opacity-50", v[variant], s[size], className)} {...props}>{children}</button>
  );
}