import React from "react";

export default function LoadingState({ className = "", count = 3 }) {
  return (
    <div className={`space-y-3 ${className}`}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="bg-card rounded-[24px] p-4 soft-shadow">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl shimmer" />
            <div className="flex-1 space-y-2">
              <div className="h-3 shimmer rounded-full w-1/2" />
              <div className="h-2.5 shimmer rounded-full w-1/3" />
            </div>
          </div>
          <div className="h-2.5 shimmer rounded-full w-full mb-2" />
          <div className="h-2.5 shimmer rounded-full w-3/4" />
        </div>
      ))}
    </div>
  );
}