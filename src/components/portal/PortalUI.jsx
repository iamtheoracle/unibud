import React from "react";
import { motion } from "framer-motion";
import { TrendingUp, TrendingDown } from "lucide-react";

export function KpiCard({ icon: Icon, label, value, sublabel, trend, accent = "primary", delay = 0 }) {
  const accentMap = {
    primary: "bg-primary/10 text-primary",
    success: "bg-success/10 text-success",
    info: "bg-info/10 text-info",
    warning: "bg-warning/10 text-warning",
    error: "bg-error/10 text-error",
    purple: "bg-purple/10 text-purple",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay, ease: [0.16, 1, 0.3, 1] }}
      className="bg-card rounded-2xl p-5 border border-border/40 soft-shadow"
    >
      <div className="flex items-start justify-between mb-3">
        <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${accentMap[accent]}`}>
          {Icon && <Icon className="w-5 h-5" strokeWidth={2} />}
        </div>
        {trend !== undefined && (
          <div className={`flex items-center gap-1 text-[12px] font-semibold ${trend >= 0 ? "text-success" : "text-error"}`}>
            {trend >= 0 ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
            {Math.abs(trend)}%
          </div>
        )}
      </div>
      <p className="text-[28px] font-heading font-extrabold text-foreground tracking-tight leading-none">{value}</p>
      <p className="text-[13px] font-medium text-foreground mt-1.5">{label}</p>
      {sublabel && <p className="text-[11px] text-muted-foreground mt-0.5">{sublabel}</p>}
    </motion.div>
  );
}

export function SectionCard({ title, description, action, children, className = "", delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay, ease: [0.16, 1, 0.3, 1] }}
      className={`bg-card rounded-2xl border border-border/40 soft-shadow ${className}`}
    >
      {(title || action) && (
        <div className="flex items-center justify-between px-5 py-4 border-b border-border/30">
          <div>
            {title && <h3 className="font-heading font-bold text-[15px] text-foreground">{title}</h3>}
            {description && <p className="text-[12px] text-muted-foreground mt-0.5">{description}</p>}
          </div>
          {action}
        </div>
      )}
      {children}
    </motion.div>
  );
}

export function StatusPill({ status, label }) {
  const styles = {
    active: "bg-success/10 text-success border-success/20",
    enabled: "bg-success/10 text-success border-success/20",
    disabled: "bg-error/10 text-error border-error/20",
    open: "bg-warning/10 text-warning border-warning/20",
    in_progress: "bg-info/10 text-info border-info/20",
    resolved: "bg-success/10 text-success border-success/20",
    escalated: "bg-error/10 text-error border-error/20",
    info: "bg-info/10 text-info border-info/20",
    warning: "bg-warning/10 text-warning border-warning/20",
    critical: "bg-error/10 text-error border-error/20",
    operational: "bg-success/10 text-success border-success/20",
    degraded: "bg-warning/10 text-warning border-warning/20",
    offline: "bg-error/10 text-error border-error/20",
  };
  const text = label || status;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border ${styles[status] || styles.info}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current" />
      {text?.charAt(0).toUpperCase() + text?.slice(1)}
    </span>
  );
}

export function DataTable({ columns, data, emptyMessage = "No data available" }) {
  if (!data || data.length === 0) {
    return (
      <div className="px-5 py-12 text-center">
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
              <th key={col.key} className="text-left px-5 py-3 text-[11px] font-semibold text-muted-foreground uppercase tracking-wide whitespace-nowrap">
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, i) => (
            <tr key={row.id || i} className="border-b border-border/20 hover:bg-muted/30 transition-colors">
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
    oracle: "bg-primary/10 text-primary border-primary/20",
    executive: "bg-purple/10 text-purple border-purple/20",
    operations_staff: "bg-info/10 text-info border-info/20",
    university_admin: "bg-success/10 text-success border-success/20",
    faculty_admin: "bg-warning/10 text-warning border-warning/20",
    department_admin: "bg-blue/10 text-blue border-blue/20",
    lecturer: "bg-muted text-foreground border-border/40",
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
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold border ${styles[role] || styles.lecturer}`}>
      {labels[role] || role}
    </span>
  );
}