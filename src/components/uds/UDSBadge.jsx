import React from "react";
import { cn } from "@/lib/utils";

const VARIANTS = {
  default: "bg-muted/60 text-muted-foreground",
  primary: "bg-primary/15 text-primary",
  success: "bg-success/15 text-success",
  warning: "bg-warning/15 text-warning",
  error: "bg-error/15 text-error",
  info: "bg-information/15 text-information",
  tag: "bg-muted/40 text-foreground/80 border border-border",
};

/** UDSBadge — status badges and tags (pill, semantic). */
export default function UDSBadge({ variant = "default", className, children }) {
  return (
    <span className={cn("inline-flex items-center px-2.5 py-1 radius-pill text-label font-semibold", VARIANTS[variant], className)}>
      {children}
    </span>
  );
}