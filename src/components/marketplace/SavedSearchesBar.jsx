import React from "react";
import { BookmarkPlus, X, Clock } from "lucide-react";

export default function SavedSearchesBar({ savedSearches, onSave, onApply, onDelete, hasActiveSearch }) {
  if (savedSearches.length === 0 && !hasActiveSearch) return null;

  return (
    <div className="flex gap-1.5 overflow-x-auto no-scrollbar mb-3">
      {hasActiveSearch && (
        <button
          onClick={onSave}
          className="px-3 py-1.5 rounded-full bg-primary/10 text-primary text-[11px] font-medium shrink-0 spring-tap flex items-center gap-1 border border-primary/20"
        >
          <BookmarkPlus className="w-3 h-3" /> Save search
        </button>
      )}
      {savedSearches.map((s) => (
        <div key={s.name} className="flex items-center gap-0.5 shrink-0">
          <button
            onClick={() => onApply(s)}
            className="px-3 py-1.5 rounded-full bg-muted/30 text-muted-foreground text-[11px] font-medium spring-tap border border-border/20 flex items-center gap-1"
          >
            <Clock className="w-2.5 h-2.5" />
            {s.name}
          </button>
          <button
            onClick={() => onDelete(s.name)}
            className="w-4 h-4 -ml-1 flex items-center justify-center text-muted-foreground/40 hover:text-destructive spring-tap"
          >
            <X className="w-2.5 h-2.5" />
          </button>
        </div>
      ))}
    </div>
  );
}