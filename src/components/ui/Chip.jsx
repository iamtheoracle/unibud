import React from "react";

export default function Chip({
  label,
  active,
  onClick,
  icon: Icon,
  className = "",
}) {
  return (
    <button
      onClick={onClick}
      className={`px-3.5 py-1.5 rounded-full text-[12px] font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
        active
          ? "bg-foreground text-background"
          : "bg-card text-muted-foreground border border-border/50 hover:border-border"
      } ${className}`}
    >
      {Icon && <Icon className="w-3.5 h-3.5" strokeWidth={2.2} />}
      {label}
    </button>
  );
}