import React, { useState, useEffect } from "react";
import { Clock, X } from "lucide-react";

const STORAGE_KEY = "unibud:recent-searches";
const MAX_RECENT = 5;

export function saveRecentSearch(term) {
  if (!term || term.trim().length < 2) return;
  try {
    const existing = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    const filtered = existing.filter((s) => s.toLowerCase() !== term.toLowerCase());
    const updated = [term.trim(), ...filtered].slice(0, MAX_RECENT);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch {}
}

export function getRecentSearches() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
  } catch {
    return [];
  }
}

export function clearRecentSearches() {
  localStorage.removeItem(STORAGE_KEY);
}

/**
 * RecentSearches — quick-tap chips of past search terms.
 * Shown when the search input is focused and empty.
 */
export default function RecentSearches({ onSelect, onClear }) {
  const [searches, setSearches] = useState([]);

  useEffect(() => {
    setSearches(getRecentSearches());
  }, []);

  const handleClear = () => {
    clearRecentSearches();
    setSearches([]);
    onClear?.();
  };

  if (searches.length === 0) return null;

  return (
    <div className="mb-4">
      <div className="flex items-center justify-between mb-2 px-1">
        <div className="flex items-center gap-1.5">
          <Clock className="w-3 h-3 text-muted-foreground" />
          <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">Recent</span>
        </div>
        <button onClick={handleClear} className="text-[11px] text-muted-foreground/60 hover:text-foreground spring-tap">
          Clear
        </button>
      </div>
      <div className="flex gap-2 flex-wrap">
        {searches.map((s) => (
          <button
            key={s}
            onClick={() => onSelect(s)}
            className="px-3 py-1.5 rounded-full glass text-[12px] text-foreground/80 spring-tap flex items-center gap-1.5"
          >
            {s}
            <X className="w-2.5 h-2.5 text-muted-foreground/40" />
          </button>
        ))}
      </div>
    </div>
  );
}