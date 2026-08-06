import React from "react";
import { cn } from "@/lib/utils";

const SIZES = {
  sm: "w-8 h-8",
  md: "w-9 h-9",
  lg: "w-11 h-11",
};

const VARIANTS = {
  default: "bg-card border border-border hover:bg-muted/30 text-muted-foreground",
  ghost: "hover:bg-muted/30 text-muted-foreground",
  primary: "bg-primary text-primary-foreground hover:bg-primary/90",
  outline: "border border-border text-foreground hover:bg-muted/30",
};

const ICON_SIZES = { sm: 14, md: 16, lg: 18 };

export default function IconButton({ icon: Icon, onClick, variant = "default", size = "md", className, ...props }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "rounded-full grid place-items-center spring-tap transition-colors shrink-0",
        SIZES[size],
        VARIANTS[variant],
        className
      )}
      style={{ minWidth: 44, minHeight: 44 }}
      {...props}
    >
      {Icon && <Icon strokeWidth={1.8} size={ICON_SIZES[size]} />}
    </button>
  );
}