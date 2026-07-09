import React from "react";
import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, ChevronRight } from "lucide-react";

const accentMap = {
  primary: { bg: "bg-primary/10", text: "text-primary", grad: "from-primary/8 to-transparent" },
  success: { bg: "bg-success/10", text: "text-success", grad: "from-success/8 to-transparent" },
  info: { bg: "bg-info/10", text: "text-info", grad: "from-info/8 to-transparent" },
  warning: { bg: "bg-warning/10", text: "text-warning", grad: "from-warning/8 to-transparent" },
  error: { bg: "bg-error/10", text: "text-error", grad: "from-error/8 to-transparent" },
  purple: { bg: "bg-purple/10", text: "text-purple", grad: "from-purple/8 to-transparent" },
};

const EASE = [0.16, 1, 0.3, 1];

export function KpiCard({ icon: Icon, label, value, sublabel, trend, accent = "primary", delay = 0, onClick }) {
  const a = accentMap[accent] || accentMap.primary;
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay, ease: EASE }}
      whileHover={onClick ? { y: -3 } : {}}
      onClick={onClick}
      className={`relative overflow-hidden rounded-[28px] bg-card border border-border/40 elevated-shadow p-5 ${onClick ? "cursor-pointer card-hover" : ""}`}
    >
      <div className={`absolute inset-0 bg-gradient-to-br ${a.grad} pointer-events-none`} />
      <div className="relative">
        <div className="flex items-start justify-between mb-4">
          <div className={`w-12 h-12 rounded-[16px] flex items-center justify-center ${a.bg} ${a.text}`}>
            {Icon && <Icon className="w-5 h-5" strokeWidth={2.2} />}
          </div>
          {trend !== undefined && (
            <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-[11px] font-bold ${trend >= 0 ? "bg-success/10 text-success" : "bg-error/10 text-error"}`}>
              {trend >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
              {Math.abs(trend)}%
            </div>
          )}
        </div>
        <p className="text-[32px] font-heading font-extrabold text-foreground tracking-tight leading-none">{value}</p>
        <p className="text-[13px] font-semibold text-foreground mt-2">{label}</p>
        {sublabel && <p className="text-[11px] text-muted-foreground mt-0.5">{sublabel}</p>}
      </div>
    </motion.div>
  );
}

export function DashboardCard({ icon: Icon, title, value, subtitle, trend, accent = "primary", delay = 0, onClick, children, status }) {
  const a = accentMap[accent] || accentMap.primary;
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay, ease: EASE }}
      whileHover={{ y: -4 }}
      onClick={onClick}
      className={`relative overflow-hidden rounded-[28px] bg-card border border-border/40 elevated-shadow p-5 ${onClick ? "cursor-pointer" : ""}`}
    >
      <div className={`absolute inset-0 bg-gradient-to-br ${a.grad} pointer-events-none`} />
      <div className="relative">
        <div className="flex items-start justify-between mb-3">
          <div className={`w-11 h-11 rounded-[14px] flex items-center justify-center ${a.bg} ${a.text}`}>
            {Icon && <Icon className="w-5 h-5" strokeWidth={2.2} />}
          </div>
          {status && <StatusPill status={status} />}
          {trend !== undefined && !status && (
            <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-[11px] font-bold ${trend >= 0 ? "bg-success/10 text-success" : "bg-error/10 text-error"}`}>
              {trend >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
              {Math.abs(trend)}%
            </div>
          )}
        </div>
        {value !== undefined && <p className="text-[28px] font-heading font-extrabold text-foreground tracking-tight leading-none">{value}</p>}
        {title && <p className="text-[13px] font-semibold text-foreground mt-2">{title}</p>}
        {subtitle && <p className="text-[11px] text-muted-foreground mt-0.5">{subtitle}</p>}
        {children}
      </div>
    </motion.div>
  );
}

export function SectionCard({ title, description, action, children, className = "", delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay, ease: EASE }}
      className={`rounded-[28px] bg-card border border-border/40 elevated-shadow ${className}`}
    >
      {(title || action) && (
        <div className="flex items-center justify-between px-6 py-5 border-b border-border/30">
          <div>
            {title && <h3 className="font-heading font-bold text-[16px] text-foreground">{title}</h3>}
            {description && <p className="text-[12px] text-muted-foreground mt-0.5">{description}</p>}
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
      <div className="px-6 py-14 text-center">
        <p className="text-[14px] text-muted-foreground">{emptyMessage}</p>
      </div>
    );
  }
  return (
    <div className="divide-y divide-border/20">
      {items.map((item, i) => (
        <motion.div
          key={item.id || i}
          initial={{ opacity: 0, x: -8 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3, delay: i * 0.03 }}
          onClick={() => onRowClick?.(item)}
          className={`flex items-center gap-3 px-6 py-4 transition-colors hover:bg-muted/30 ${onRowClick ? "cursor-pointer" : ""}`}
        >
          {renderRow ? renderRow(item) : <span className="text-[13px] text-foreground">{JSON.stringify(item)}</span>}
        </motion.div>
      ))}
    </div>
  );
}

export function StatusPill({ status, label }) {
  const styles = {
    active: "bg-success/10 text-success",
    enabled: "bg-success/10 text-success",
    disabled: "bg-error/10 text-error",
    open: "bg-warning/10 text-warning",
    in_progress: "bg-info/10 text-info",
    resolved: "bg-success/10 text-success",
    escalated: "bg-error/10 text-error",
    info: "bg-info/10 text-info",
    warning: "bg-warning/10 text-warning",
    critical: "bg-error/10 text-error",
    operational: "bg-success/10 text-success",
    degraded: "bg-warning/10 text-warning",
    offline: "bg-error/10 text-error",
  };
  const text = label || status;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold ${styles[status] || styles.info}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current" />
      {text?.charAt(0).toUpperCase() + text?.slice(1)}
    </span>
  );
}

export function DataTable({ columns, data, emptyMessage = "No data available" }) {
  if (!data || data.length === 0) {
    return (
      <div className="px-6 py-14 text-center">
        <p className="text-[14px] text-muted-foreground">{emptyMessage}</p>
      </div>
    );
  }
  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-border/30">
            {columns.map((col) => (
              <th key={col.key} className="text-left px-6 py-3.5 text-[11px] font-semibold text-muted-foreground uppercase tracking-wide whitespace-nowrap">
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, i) => (
            <tr key={row.id || i} className="border-b border-border/20 hover:bg-muted/30 transition-colors">
              {columns.map((col) => (
                <td key={col.key} className="px-6 py-4 text-[13px] text-foreground whitespace-nowrap">
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
    oracle: "bg-primary/10 text-primary",
    executive: "bg-purple/10 text-purple",
    operations_staff: "bg-info/10 text-info",
    university_admin: "bg-success/10 text-success",
    faculty_admin: "bg-warning/10 text-warning",
    department_admin: "bg-info/10 text-info",
    lecturer: "bg-muted text-foreground",
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
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold ${styles[role] || styles.lecturer}`}>
      {labels[role] || role}
    </span>
  );
}

export function PortalPageHeader({ title, subtitle, action }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: EASE }}
      className="flex items-start justify-between gap-4 mb-6"
    >
      <div>
        <h1 className="font-heading font-extrabold text-[26px] tracking-tight text-foreground">{title}</h1>
        {subtitle && <p className="text-[13px] text-muted-foreground mt-0.5">{subtitle}</p>}
      </div>
      {action}
    </motion.div>
  );
}