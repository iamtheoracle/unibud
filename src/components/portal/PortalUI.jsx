import React from "react";
import { motion } from "framer-motion";
import { TrendingUp, TrendingDown } from "lucide-react";

const accentMap = {
  primary: { ring: "text-primary", bar: "bg-primary", soft: "bg-primary/8" },
  success: { ring: "text-success", bar: "bg-success", soft: "bg-success/8" },
  info: { ring: "text-info", bar: "bg-info", soft: "bg-info/8" },
  warning: { ring: "text-warning", bar: "bg-warning", soft: "bg-warning/8" },
  error: { ring: "text-error", bar: "bg-error", soft: "bg-error/8" },
  purple: { ring: "text-purple", bar: "bg-purple", soft: "bg-purple/8" },
};

const EASE = [0.16, 1, 0.3, 1];

export function KpiCard({ icon: Icon, label, value, sublabel, trend, accent = "primary", delay = 0, onClick }) {
  const a = accentMap[accent] || accentMap.primary;
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay, ease: EASE }}
      whileHover={onClick ? { y: -2 } : {}}
      onClick={onClick}
      className={`relative overflow-hidden portal-surface rounded-[20px] p-5 ${onClick ? "cursor-pointer" : ""}`}
    >
      <span className={`absolute top-0 left-5 right-5 h-px ${a.bar} opacity-60`} />
      <div className="flex items-start justify-between mb-4">
        <div className={`w-10 h-10 rounded-[12px] flex items-center justify-center ring-1 ring-inset ring-border ${a.soft} ${a.ring}`}>
          {Icon && <Icon className="w-[18px] h-[18px]" strokeWidth={2} />}
        </div>
        {trend !== undefined && (
          <div className={`flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold console-num ${trend >= 0 ? "text-success bg-success/8" : "text-error bg-error/8"}`}>
            {trend >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
            {Math.abs(trend)}%
          </div>
        )}
      </div>
      <p className="text-[30px] font-heading font-extrabold text-foreground tracking-tight leading-none console-num">{value}</p>
      <p className="text-[13px] font-semibold text-foreground mt-2">{label}</p>
      {sublabel && <p className="text-[11px] text-muted-foreground mt-0.5">{sublabel}</p>}
    </motion.div>
  );
}

export function DashboardCard({ icon: Icon, title, value, subtitle, trend, accent = "primary", delay = 0, onClick, children, status }) {
  const a = accentMap[accent] || accentMap.primary;
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay, ease: EASE }}
      whileHover={onClick ? { y: -2 } : {}}
      onClick={onClick}
      className={`relative overflow-hidden portal-surface rounded-[20px] p-5 ${onClick ? "cursor-pointer" : ""}`}
    >
      <span className={`absolute top-0 left-5 right-5 h-px ${a.bar} opacity-60`} />
      <div className="flex items-start justify-between mb-3">
        <div className={`w-10 h-10 rounded-[12px] flex items-center justify-center ring-1 ring-inset ring-border ${a.soft} ${a.ring}`}>
          {Icon && <Icon className="w-[18px] h-[18px]" strokeWidth={2} />}
        </div>
        {status && <StatusPill status={status} />}
        {trend !== undefined && !status && (
          <div className={`flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold console-num ${trend >= 0 ? "text-success bg-success/8" : "text-error bg-error/8"}`}>
            {trend >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
            {Math.abs(trend)}%
          </div>
        )}
      </div>
      {value !== undefined && <p className="text-[26px] font-heading font-extrabold text-foreground tracking-tight leading-none console-num">{value}</p>}
      {title && <p className="text-[13px] font-semibold text-foreground mt-2">{title}</p>}
      {subtitle && <p className="text-[11px] text-muted-foreground mt-0.5">{subtitle}</p>}
      {children}
    </motion.div>
  );
}

export function SectionCard({ title, description, action, children, className = "", delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay, ease: EASE }}
      className={`relative portal-surface rounded-[20px] ${className}`}
    >
      {(title || action) && (
        <div className="flex items-center justify-between gap-3 px-5 py-4 border-b border-border/40">
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />
            <div className="min-w-0">
              {title && <h3 className="font-heading font-bold text-[14px] text-foreground leading-tight">{title}</h3>}
              {description && <p className="text-[11px] text-muted-foreground mt-0.5">{description}</p>}
            </div>
          </div>
          {action}
        </div>
      )}
      {children}
    </motion.div>
  );
}

export function SmartList({ items, renderRow, emptyMessage = "No data available", onRowClick, actionKey }) {
  if (!items || items.length === 0) {
    return (
      <div className="px-5 py-12 text-center">
        <p className="text-[13px] text-muted-foreground">{emptyMessage}</p>
      </div>
    );
  }
  return (
    <div className="divide-y divide-border/30">
      {items.map((item, i) => (
        <motion.div
          key={item.id || i}
          initial={{ opacity: 0, x: -6 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.28, delay: Math.min(i * 0.025, 0.3) }}
          onClick={() => onRowClick?.(item)}
          className={`portal-row-hover flex items-center gap-3 px-5 py-3.5 ${onRowClick ? "cursor-pointer" : ""}`}
        >
          {renderRow ? renderRow(item) : <span className="text-[13px] text-foreground">{JSON.stringify(item)}</span>}
        </motion.div>
      ))}
    </div>
  );
}

export function StatusPill({ status, label }) {
  const styles = {
    active: "text-success",
    enabled: "text-success",
    disabled: "text-error",
    open: "text-warning",
    in_progress: "text-info",
    resolved: "text-success",
    escalated: "text-error",
    info: "text-info",
    warning: "text-warning",
    critical: "text-error",
    operational: "text-success",
    degraded: "text-warning",
    offline: "text-error",
  };
  const dots = {
    active: "bg-success", enabled: "bg-success", disabled: "bg-error", open: "bg-warning",
    in_progress: "bg-info", resolved: "bg-success", escalated: "bg-error", info: "bg-info",
    warning: "bg-warning", critical: "bg-error", operational: "bg-success", degraded: "bg-warning", offline: "bg-error",
  };
  const text = label || status;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[10px] font-semibold uppercase tracking-wider bg-muted/50 ${styles[status] || styles.info}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${dots[status] || dots.info}`} />
      {text?.charAt(0).toUpperCase() + text?.slice(1)}
    </span>
  );
}

export function DataTable({ columns, data, emptyMessage = "No data available" }) {
  if (!data || data.length === 0) {
    return (
      <div className="px-5 py-12 text-center">
        <p className="text-[13px] text-muted-foreground">{emptyMessage}</p>
      </div>
    );
  }
  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-border/40">
            {columns.map((col) => (
              <th key={col.key} className="text-left px-5 py-3 console-eyebrow whitespace-nowrap">
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, i) => (
            <tr key={row.id || i} className="border-b border-border/25 hover:bg-muted/30 transition-colors">
              {columns.map((col) => (
                <td key={col.key} className="px-5 py-3.5 text-[13px] text-foreground whitespace-nowrap">
                  {col.render ? col.render(row) : row[col.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function PortalBadge({ role }) {
  const styles = {
    oracle: "text-primary bg-primary/8",
    executive: "text-purple bg-purple/8",
    operations_staff: "text-info bg-info/8",
    university_admin: "text-success bg-success/8",
    faculty_admin: "text-warning bg-warning/8",
    department_admin: "text-info bg-info/8",
    lecturer: "text-foreground bg-muted/60",
  };
  const labels = {
    oracle: "Oracle",
    executive: "Executive",
    operations_staff: "Operations",
    university_admin: "University Admin",
    faculty_admin: "Faculty Admin",
    department_admin: "Dept Admin",
    lecturer: "Lecturer",
  };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-semibold uppercase tracking-wider ${styles[role] || styles.lecturer}`}>
      {labels[role] || role}
    </span>
  );
}

export function PortalPageHeader({ title, subtitle, action }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: EASE }}
      className="flex items-end justify-between gap-4 mb-6"
    >
      <div>
        <div className="flex items-center gap-2 mb-2">
          <span className="w-6 h-px bg-primary" />
          <span className="console-eyebrow">Operations Center</span>
        </div>
        <h1 className="font-heading font-extrabold text-[24px] tracking-tight text-foreground leading-tight">{title}</h1>
        {subtitle && <p className="text-[12px] text-muted-foreground mt-1">{subtitle}</p>}
      </div>
      {action}
    </motion.div>
  );
}