import React from "react";
import { List, Play } from "lucide-react";

function fmt(s) {
  s = Math.max(0, Math.floor(s || 0));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const r = s % 60;
  if (h > 0) return `${h}:${m < 10 ? "0" : ""}${m}:${r < 10 ? "0" : ""}${r}`;
  return `${m}:${r < 10 ? "0" : ""}${r}`;
}

/**
 * PodcastChapters — list of episode chapters with tap-to-seek.
 * Each chapter shows title and start time; the current chapter is highlighted.
 */
export default function PodcastChapters({ chapters, currentPosition, onSeek }) {
  if (!chapters || chapters.length === 0) return null;

  const activeIndex = chapters.reduce((active, ch, i) => {
    if ((ch.start_seconds || 0) <= currentPosition) return i;
    return active;
  }, 0);

  return (
    <div className="mt-3 rounded-[16px] glass-card p-3">
      <p className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground flex items-center gap-1.5 mb-2">
        <List className="w-3.5 h-3.5" /> Chapters
      </p>
      <div className="space-y-0.5">
        {chapters.map((ch, i) => {
          const isActive = i === activeIndex;
          return (
            <button
              key={i}
              onClick={() => onSeek(ch.start_seconds || 0)}
              className={`w-full flex items-center gap-2.5 px-2 py-2 rounded-[10px] text-left spring-tap transition-colors ${
                isActive ? "bg-primary/8" : ""
              }`}
            >
              <div className={`w-6 h-6 rounded-full grid place-items-center shrink-0 ${isActive ? "bg-primary text-primary-foreground" : "bg-muted/50 text-muted-foreground"}`}>
                <Play className="w-3 h-3 ml-0.5" fill="currentColor" stroke="none" />
              </div>
              <span className={`text-[12px] font-medium flex-1 truncate ${isActive ? "text-primary" : "text-foreground"}`}>
                {ch.title}
              </span>
              <span className="text-[10px] text-muted-foreground tabular-nums shrink-0">{fmt(ch.start_seconds)}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}