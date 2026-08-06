import React from "react";
import { cn } from "@/lib/utils";

/** UDSSearchBar — consistent search surface across the app. */
export default function UDSSearchBar({ value, onChange, placeholder = "Search…", className }) {
  return (
    <input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className={cn("w-full h-12 px-4 bg-muted/50 border border-border radius-lg text-body text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:border-primary/60 uds-focus", className)}
    />
  );
}