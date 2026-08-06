import React from "react";
import { cn } from "@/lib/utils";

const VARIANTS = {
  primary: "bg-primary text-primary-foreground ice-glow",
  secondary: "glass text-foreground",
  ghost: "text-foreground/80 hover:bg-muted/50",
  danger: "bg-destructive text-destructive-foreground",
  floating: "bg-primary text-primary-foreground ice-glow elevated-shadow",
};

const SIZES = {
  sm: "h-9 px-4 radius-md text-label",
  md: "h-12 px-5 radius-lg text-body",
  lg: "h-14 px-6 radius-lg text-subtitle",
};

/** UDSButton — primary / secondary / ghost / danger / floating. */
export default function UDSButton({ variant = "primary", size = "md", className, children, ...props }) {
  return (
    <button className={cn("inline-flex items-center justify-center gap-2 font-heading font-semibold spring-tap uds-focus disabled:opacity-50", VARIANTS[variant], SIZES[size], className)} {...props}>
      {children}
    </button>
  );
}