import React from "react";

export default function SkeletonCard({ className = "", lines = 3 }) {
  return (
    <div className={`bg-card rounded-[20px] p-4 soft-shadow ${className}`}>
      <div className="flex items-center gap-3 mb-3">
        <div className="w-10 h-10 rounded-xl shimmer" />
        <div className="flex-1 space-y-1.5">
          <div className="h-3.5 shimmer rounded-full w-3/4" />
          <div className="h-2.5 shimmer rounded-full w-1/2" />
        </div>
      </div>
      {Array.from({ length: lines }).map((_, i) => (
        <div key={i} className={`h-2.5 shimmer rounded-full mb-2 ${i === lines - 1 ? "w-2/3" : "w-full"}`} />
      ))}
    </div>
  );
}