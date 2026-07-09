import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X, Plus, TrendingUp, TrendingDown, ChevronDown, ChevronUp, Inbox } from "lucide-react";

const EASE = [0.16, 1, 0.3, 1];

const accentMap = {
  primary: { bg: "bg-primary/10", text: "text-primary", grad: "from-primary/8 to-transparent", dot: "bg-primary" },
  success: { bg: "bg-success/10", text: "text-success", grad: "from-success/8 to-transparent", dot: "bg-success" },
  info: { bg: "bg-info/10", text: "text-info", grad: "from-info/8 to-transparent", dot: "bg-info" },
  warning: { bg: "bg-warning/10", text: "text-warning", grad: "from-warning/8 to-transparent", dot: "bg-warning" },
  error: { bg: "bg-error/10", text: "text-error", grad: "from-error/8 to-transparent", dot: "bg-error" },
  purple: { bg: "bg-purple/10", text: "text-purple", grad: "from-purple/8 to-transparent", dot: "bg-purple" },
  blue: { bg: "bg-info/10", text: "text-info", grad: "from-info/8 to-transparent", dot: "bg-info" },
};

export function UniStatCard({ icon: Icon, label, value, sublabel, trend, accent = "primary", delay = 0, onClick }) {
  const a = accentMap[accent] || accentMap.primary;
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay, ease: EASE }}
      whileHover={onClick ? { y: -3 } : {}}
      onClick={onClick}
      className={`relative overflow-hidden rounded-[24px] bg-card border border-border/40 soft-shadow p-5 ${onClick ? "cursor-pointer card-hover" : ""}`}
    >
      <div className={`absolute inset-0 bg-gradient-to-br ${a.grad} pointer-events-none`} />
      <div className="relative">
        <div className="flex items-start justify-between mb-3">
          <div className={`w-11 h-11 rounded-[14px] flex items-center justify-center ${a.bg} ${a.text}`}>
            {Icon && <Icon className="w-5 h-5" strokeWidth={2.2} />}
          </div>
          {trend !== undefined && (
            <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-[11px] font-bold ${trend >= 0 ? "bg-success/10 text-success" : "bg-error/10 text-error"}`}>
              {trend >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
              {Math.abs(trend)}%
            </div>
          )}
        </div>
        <p className="text-[28px] font-heading font-extrabold text-foreground tracking-tight leading-none">{value}</p>
        <p className="text-[13px] font-semibold text-foreground mt-2">{label}</p>
        {sublabel && <p className="text-[11px] text-muted-foreground mt-0.5">{sublabel}</p>}
      </div>
    </motion.div>
  );
}

export function UniCard({ title, description, action, children, className = "", delay = 0, padding = true }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay, ease: EASE }}
      className={`rounded-[24px] bg-card border border-border/40 soft-shadow ${className}`}
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
      {padding ? <div className="p-5">{children}</div> : children}
    </motion.div>
  );
}

export function UniPageHeader({ title, subtitle, action }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: EASE }}
      className="flex items-start justify-between gap-4 mb-6 flex-wrap"
    >
      <div>
        <h1 className="font-heading font-extrabold text-[24px] tracking-tight text-foreground">{title}</h1>
        {subtitle && <p className="text-[13px] text-muted-foreground mt-0.5">{subtitle}</p>}
      </div>
      {action}
    </motion.div>
  );
}

export function UniButton({ children, onClick, variant = "primary", size = "md", icon: Icon, className = "", type = "button", disabled }) {
  const variants = {
    primary: "bg-primary text-primary-foreground hover:bg-primary/90",
    secondary: "bg-muted/60 text-foreground hover:bg-muted",
    outline: "border border-border text-foreground hover:bg-muted/40",
    ghost: "text-foreground hover:bg-muted/40",
    danger: "bg-error text-error-foreground hover:bg-error/90",
  };
  const sizes = { sm: "h-9 px-3 text-[12px]", md: "h-10 px-4 text-[13px]", lg: "h-11 px-5 text-[14px]" };
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex items-center justify-center gap-2 rounded-[14px] font-semibold spring-tap disabled:opacity-50 disabled:cursor-not-allowed transition-colors ${variants[variant]} ${sizes[size]} ${className}`}
    >
      {Icon && <Icon className="w-4 h-4" strokeWidth={2.2} />}
      {children}
    </button>
  );
}

export function UniBadge({ children, accent = "info" }) {
  const a = accentMap[accent] || accentMap.info;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold ${a.bg} ${a.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${a.dot}`} />
      {children}
    </span>
  );
}

export function UniSearch({ value, onChange, placeholder = "Search...", className = "" }) {
  return (
    <div className={`relative ${className}`}>
      <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full h-10 pl-10 pr-4 rounded-[14px] bg-muted/50 border border-border/30 text-[13px] text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:bg-card transition-all"
      />
    </div>
  );
}

export function UniTable({ columns, data, emptyMessage = "No records found", onRowClick, loading }) {
  if (loading) {
    return (
      <div className="p-10 flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }
  if (!data || data.length === 0) {
    return (
      <div className="px-6 py-14 text-center flex flex-col items-center gap-3">
        <Inbox className="w-8 h-8 text-muted-foreground/50" />
        <p className="text-[13px] text-muted-foreground">{emptyMessage}</p>
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
            <tr
              key={row.id || i}
              onClick={() => onRowClick?.(row)}
              className={`border-b border-border/20 hover:bg-muted/30 transition-colors ${onRowClick ? "cursor-pointer" : ""}`}
            >
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

export function UniModal({ open, onClose, title, children, footer, size = "md" }) {
  const widths = { sm: "max-w-md", md: "max-w-lg", lg: "max-w-2xl", xl: "max-w-3xl" };
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 z-50 backdrop-blur-sm"
          />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.96 }}
              transition={{ duration: 0.25, ease: EASE }}
              className={`w-full ${widths[size]} rounded-[24px] bg-card border border-border/40 elevated-shadow pointer-events-auto flex flex-col max-h-[90vh]`}
            >
              <div className="flex items-center justify-between px-5 py-4 border-b border-border/30">
                <h3 className="font-heading font-bold text-[16px] text-foreground">{title}</h3>
                <button onClick={onClose} className="w-9 h-9 rounded-[12px] flex items-center justify-center text-muted-foreground hover:bg-muted/50 hover:text-foreground spring-tap">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-5">{children}</div>
              {footer && <div className="px-5 py-4 border-t border-border/30 flex items-center justify-end gap-2">{footer}</div>}
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}

export function UniField({ label, children, required, hint }) {
  return (
    <div>
      <label className="text-[12px] font-semibold text-foreground mb-1.5 block">
        {label}{required && <span className="text-error"> *</span>}
      </label>
      {children}
      {hint && <p className="text-[11px] text-muted-foreground mt-1">{hint}</p>}
    </div>
  );
}

export function UniInput({ value, onChange, placeholder, type = "text", className = "" }) {
  return (
    <input
      type={type}
      value={value || ""}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className={`w-full h-10 px-3.5 rounded-[12px] bg-muted/40 border border-border/40 text-[13px] text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:bg-card transition-all ${className}`}
    />
  );
}

export function UniTextarea({ value, onChange, placeholder, rows = 3 }) {
  return (
    <textarea
      value={value || ""}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      rows={rows}
      className="w-full px-3.5 py-2.5 rounded-[12px] bg-muted/40 border border-border/40 text-[13px] text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:bg-card transition-all resize-none"
    />
  );
}

export function UniSelect({ value, onChange, options, placeholder }) {
  return (
    <select
      value={value || ""}
      onChange={(e) => onChange(e.target.value)}
      className="w-full h-10 px-3.5 rounded-[12px] bg-muted/40 border border-border/40 text-[13px] text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:bg-card transition-all"
    >
      {placeholder && <option value="">{placeholder}</option>}
      {options.map((opt) => {
        const val = typeof opt === "string" ? opt : opt.value;
        const label = typeof opt === "string" ? opt : opt.label;
        return <option key={val} value={val}>{label}</option>;
      })}
    </select>
  );
}

export function UniFilterBar({ search, setSearch, searchPlaceholder, filters = [], actions }) {
  return (
    <div className="flex flex-col sm:flex-row gap-3 mb-5">
      <div className="flex-1 max-w-sm">
        <UniSearch value={search} onChange={setSearch} placeholder={searchPlaceholder} />
      </div>
      <div className="flex items-center gap-2 flex-wrap">
        {filters.map((f, i) => (
          <UniSelect key={i} value={f.value} onChange={f.onChange} options={f.options} placeholder={f.placeholder} />
        ))}
        {actions}
      </div>
    </div>
  );
}

export function UniEmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      {Icon && (
        <div className="w-16 h-16 rounded-[20px] bg-muted/50 flex items-center justify-center mb-4">
          <Icon className="w-7 h-7 text-muted-foreground" strokeWidth={1.8} />
        </div>
      )}
      <h3 className="font-heading font-bold text-[16px] text-foreground">{title}</h3>
      {description && <p className="text-[13px] text-muted-foreground mt-1 max-w-sm">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

export function UniCreateButton({ onClick, label = "Create" }) {
  return (
    <UniButton variant="primary" icon={Plus} onClick={onClick}>
      {label}
    </UniButton>
  );
}