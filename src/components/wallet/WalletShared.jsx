import React from "react";
import { cn } from "@/lib/utils";

export function formatMoney(n, currency = "₦") {
  return currency + Number(n || 0).toLocaleString();
}

export const WCOLOR = {
  primary: { text: "text-primary", bg: "bg-primary/10" },
  success: { text: "text-success", bg: "bg-success/10" },
  warning: { text: "text-warning", bg: "bg-warning/10" },
  information: { text: "text-information", bg: "bg-information/10" },
  error: { text: "text-error", bg: "bg-error/10" },
};

export function SectionCard({ title, action, children, className }) {
  return (
    <div className={cn("bg-card rounded-[24px] p-4 soft-shadow border border-border/40", className)}>
      {(title || action) && (
        <div className="flex items-center justify-between mb-3">
          {title && <h3 className="font-heading font-bold text-[15px] text-foreground">{title}</h3>}
          {action}
        </div>
      )}
      {children}
    </div>
  );
}

export function Pill({ label, tone = "muted" }) {
  const tones = {
    muted: "bg-muted text-muted-foreground",
    success: "bg-success/10 text-success",
    warning: "bg-warning/10 text-warning",
    error: "bg-error/10 text-error",
    info: "bg-information/10 text-information",
    primary: "bg-primary/10 text-primary",
  };
  return <span className={cn("px-2 py-0.5 rounded-full text-[10px] font-semibold", tones[tone] || tones.muted)}>{label}</span>;
}

export function WalletEmpty({ icon: Icon, title, desc, action }) {
  return (
    <div className="flex flex-col items-center text-center py-10 px-6">
      <div className="w-16 h-16 rounded-[24px] bg-primary/8 soft-shadow flex items-center justify-center mb-3">
        {Icon && <Icon className="w-7 h-7 text-primary" strokeWidth={1.7} />}
      </div>
      <p className="font-heading font-semibold text-[15px] text-foreground mb-1">{title}</p>
      {desc && <p className="text-[12px] text-muted-foreground max-w-[280px] leading-relaxed">{desc}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

export function AddButton({ label, onClick }) {
  return (
    <button onClick={onClick} className="w-full p-3.5 rounded-[20px] bg-primary/8 border border-primary/15 flex items-center justify-center gap-2 spring-tap text-primary text-[13px] font-semibold">
      {label}
    </button>
  );
}