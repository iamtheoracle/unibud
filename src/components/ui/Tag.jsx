import React from "react";
import { cn } from "@/lib/utils";

const VARIANTS = {
  default: "bg-muted/40 border-border text-muted-foreground",
  primary: "bg-primary/10 border-primary/20 text-primary",
  success: "bg-success/10 border-success/20 text-success",
  warning: "bg-warning/10 border-warning/20 text-warning",
  destructive: "bg-destructive/10 border-destructive/20 text-destructive",
  gold: "bg-gold/10 border-gold/20 text-gold",
};

export default function Tag({ children, variant = "default", className }) {
  return (
    <span className={cn("px-3 py-1 rounded-full text-[11px] font-medium border", VARIANTS[variant], className)}>
      {children}
    </span>
  );
}