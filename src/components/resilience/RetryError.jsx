import React from "react";
import { AlertTriangle, RotateCcw, WifiOff } from "lucide-react";
import { useOnlineStatus } from "@/hooks/useOnlineStatus";

/**
 * RetryError — calm error state with a retry button.
 * Adapts messaging when the device is offline.
 */
export default function RetryError({ onRetry, title, message, compact }) {
  const online = useOnlineStatus();
  const heading = !online ? "You're offline" : title || "Couldn't load";
  const body = !online
    ? "Check your connection and try again. Cached data may still be visible."
    : message || "Something went wrong while fetching this. Your data is safe — give it another try.";

  if (compact) {
    return (
      <div className="flex items-center gap-3 py-4 px-1">
        <AlertTriangle className="w-4 h-4 text-muted-foreground shrink-0" strokeWidth={1.8} />
        <span className="text-[13px] text-muted-foreground flex-1">{heading}</span>
        <button onClick={onRetry} className="text-[13px] font-semibold text-primary spring-tap flex items-center gap-1">
          <RotateCcw className="w-3.5 h-3.5" /> Retry
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center text-center py-12 px-6">
      <div className="w-14 h-14 rounded-[20px] bg-card border border-border/40 flex items-center justify-center mb-4 soft-shadow">
        {!online ? <WifiOff className="w-7 h-7 text-muted-foreground" strokeWidth={1.6} /> : <AlertTriangle className="w-7 h-7 text-muted-foreground" strokeWidth={1.6} />}
      </div>
      <h3 className="font-heading font-semibold text-[16px] text-foreground mb-1">{heading}</h3>
      <p className="text-[13px] text-muted-foreground leading-relaxed max-w-[260px] mb-5">{body}</p>
      <button onClick={onRetry} className="px-5 py-2.5 rounded-[16px] bg-primary text-primary-foreground text-[13px] font-semibold spring-tap flex items-center gap-1.5">
        <RotateCcw className="w-4 h-4" /> Try again
      </button>
    </div>
  );
}