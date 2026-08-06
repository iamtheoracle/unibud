import React from "react";
import { cn } from "@/lib/utils";

/** Skeleton — shimmer block for loading layouts. */
export function Skeleton({ className }) {
  return <div className={cn("shimmer rounded-full", className)} />;
}

/** StreamingDots — animated dots for streaming AI responses. */
export function StreamingDots({ className }) {
  return (
    <span className={cn("inline-flex gap-1", className)}>
      <span className="stream-dot w-1.5 h-1.5 rounded-full bg-primary" />
      <span className="stream-dot w-1.5 h-1.5 rounded-full bg-primary" />
      <span className="stream-dot w-1.5 h-1.5 rounded-full bg-primary" />
    </span>
  );
}

/** UDSLoadingState — skeleton list for loading content. */
export default function UDSLoadingState({ rows = 3, className }) {
  return (
    <div className={cn("space-y-3", className)}>
      <Skeleton className="h-4 w-2/3" />
      {Array.from({ length: rows }).map((_, i) => <Skeleton key={i} className="h-4 w-full" />)}
      <Skeleton className="h-4 w-1/2" />
    </div>
  );
}