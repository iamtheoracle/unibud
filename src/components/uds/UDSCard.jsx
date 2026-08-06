import React from "react";
import { cn } from "@/lib/utils";

/** UDSCard — the base surface for every card in UNIBUD. */
export default function UDSCard({ interactive = false, className, children, ...props }) {
  return (
    <div className={cn("glass-card radius-lg p-4", interactive && "card-hover spring-tap cursor-pointer", className)} {...props}>
      {children}
    </div>
  );
}