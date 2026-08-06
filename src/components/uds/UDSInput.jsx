import React from "react";
import { cn } from "@/lib/utils";

/** UDSInput — labeled input bound to the type + radius tokens. */
export default function UDSInput({ label, className, inputClassName, ...props }) {
  return (
    <label className="block">
      {label && <span className="text-label font-semibold text-muted-foreground/90 ml-1 block mb-1.5">{label}</span>}
      <input className={cn("w-full h-12 px-4 bg-muted/50 border border-border radius-lg text-body text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:border-primary/60 uds-focus", inputClassName)} {...props} />
    </label>
  );
}