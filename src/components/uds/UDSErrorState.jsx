import React from "react";
import { cn } from "@/lib/utils";
import UDSButton from "./UDSButton";

/** UDSErrorState — friendly language, recovery suggestion, retry, support. */
export default function UDSErrorState({ title = "Something went wrong", message, onRetry, className }) {
  return (
    <div className={cn("glass-card radius-xl p-8 text-center", className)}>
      <div className="w-14 h-14 radius-pill bg-error/15 mx-auto flex items-center justify-center mb-3">
        <span className="text-error font-heading font-bold text-xl">!</span>
      </div>
      <p className="text-subtitle font-heading font-semibold text-foreground">{title}</p>
      <p className="text-body text-muted-foreground mt-1.5">{message || "Please try again in a moment."}</p>
      {onRetry && (
        <div className="mt-4 flex justify-center">
          <UDSButton variant="secondary" onClick={onRetry}>Retry</UDSButton>
        </div>
      )}
      <p className="text-caption text-muted-foreground/70 mt-3">Need help? Contact Base44 support.</p>
    </div>
  );
}