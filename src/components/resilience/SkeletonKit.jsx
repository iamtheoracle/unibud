import React from "react";

/** Shimmer block — the atomic skeleton unit. */
export function Shimmer({ className = "" }) {
  return <div className={`shimmer rounded-lg ${className}`} />;
}

/** Card skeleton — for content cards, stat tiles, recommendation blocks. */
export function CardSkeleton({ lines = 3 }) {
  return (
    <div className="bg-card border border-border rounded-2xl p-5">
      <Shimmer className="h-4 w-1/3 mb-3" />
      {Array.from({ length: lines }).map((_, i) => (
        <Shimmer key={i} className={`h-3 mb-2 ${i === lines - 1 ? "w-2/3" : "w-full"}`} />
      ))}
    </div>
  );
}

/** List skeleton — for feed rows, task lists, timetable entries. */
export function ListSkeleton({ rows = 4 }) {
  return (
    <div className="divide-y divide-border border-t border-b border-border">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 py-4">
          <Shimmer className="w-14 h-4 shrink-0" />
          <div className="flex-1">
            <Shimmer className="h-4 w-3/4 mb-2" />
            <Shimmer className="h-3 w-1/2" />
          </div>
        </div>
      ))}
    </div>
  );
}

/** Stats skeleton — for the three-tile stat row on dashboards. */
export function StatsSkeleton() {
  return (
    <div className="flex">
      {[0, 1, 2].map((i) => (
        <React.Fragment key={i}>
          <div className="flex-1 px-4 first:pl-0 last:pr-0">
            <Shimmer className="h-3 w-16 mb-2" />
            <Shimmer className="h-6 w-12 mb-1" />
            <Shimmer className="h-3 w-10" />
          </div>
          {i < 2 && <div className="w-px bg-border shrink-0" />}
        </React.Fragment>
      ))}
    </div>
  );
}

/** Generic skeleton — picks the right shape by `variant`. */
export default function SmartSkeleton({ variant = "list", rows, lines }) {
  if (variant === "card") return <CardSkeleton lines={lines} />;
  if (variant === "stats") return <StatsSkeleton />;
  return <ListSkeleton rows={rows} />;
}