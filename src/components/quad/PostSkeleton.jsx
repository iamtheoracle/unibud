import React from "react";

export default function PostSkeleton() {
  return (
    <div className="bg-card rounded-[20px] soft-shadow border border-border/40 overflow-hidden">
      <div className="p-4">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-full shimmer" />
          <div className="flex-1 space-y-1.5">
            <div className="h-3 w-28 rounded-full shimmer" />
            <div className="h-2.5 w-20 rounded-full shimmer" />
          </div>
          <div className="w-6 h-6 rounded-full shimmer" />
        </div>
        <div className="space-y-2">
          <div className="h-3 w-full rounded-full shimmer" />
          <div className="h-3 w-4/5 rounded-full shimmer" />
          <div className="h-3 w-3/5 rounded-full shimmer" />
        </div>
      </div>
      <div className="h-48 shimmer" />
      <div className="flex items-center gap-3 px-4 py-3 border-t border-border/30">
        <div className="h-7 w-16 rounded-lg shimmer" />
        <div className="h-7 w-16 rounded-lg shimmer" />
        <div className="h-7 w-16 rounded-lg shimmer" />
        <div className="flex-1" />
        <div className="h-7 w-7 rounded-lg shimmer" />
      </div>
    </div>
  );
}