import React from "react";
import { motion } from "framer-motion";
import { BadgeCheck, Eye, EyeOff, Trash2 } from "lucide-react";
import { getTypeMeta } from "@/lib/identity/timelineTypes";

const EASE = [0.16, 1, 0.3, 1];

function fmtDate(d) {
  try {
    return new Date(d).toLocaleDateString("en", { month: "short", day: "numeric", year: "numeric" });
  } catch {
    return d;
  }
}
function yearOf(d) {
  try {
    return String(new Date(d).getFullYear());
  } catch {
    return "—";
  }
}

export default function AcademicTimelineList({
  entries, ownerView = false, limit, onToggleHidden, onRemove,
}) {
  const visible = ownerView ? entries : entries.filter((e) => !e.is_hidden);
  const sorted = [...visible].sort((a, b) => new Date(a.date) - new Date(b.date));
  const list = limit ? sorted.slice(-limit) : sorted;

  const byYear = {};
  list.forEach((e) => {
    const y = yearOf(e.date);
    (byYear[y] ||= []).push(e);
  });
  const years = Object.keys(byYear).sort((a, b) => Number(a) - Number(b));

  if (list.length === 0) return null;

  return (
    <div>
      {years.map((year) => (
        <div key={year} className="mb-5">
          <div className="sticky top-0 z-10 -mx-1 px-1 py-1.5 mb-2 glass-strong rounded-full w-fit">
            <span className="text-[12px] font-bold text-foreground px-2">{year}</span>
          </div>
          <div className="space-y-0">
            {byYear[year].map((e, i) => (
              <TimelineNode
                key={e.id || i}
                entry={e}
                ownerView={ownerView}
                onToggleHidden={onToggleHidden}
                onRemove={onRemove}
                index={i}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function TimelineNode({ entry, ownerView, onToggleHidden, onRemove, index }) {
  const meta = getTypeMeta(entry.entry_type);
  const Icon = meta.icon;
  return (
    <div className="relative pl-9">
      <div className="absolute left-[11px] top-1 bottom-0 w-px bg-border/60" />
      <div className="absolute left-0 top-1 w-6 h-6 rounded-full glass-strong flex items-center justify-center ring-1 ring-primary/20 shrink-0">
        <Icon className="w-3.5 h-3.5 text-primary" strokeWidth={2} />
      </div>
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: EASE, delay: index * 0.03 }}
        className={`glass-card p-3.5 mb-3 ml-1 ${entry.is_hidden ? "opacity-55" : ""}`}
      >
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <p className="text-[13px] font-semibold text-foreground leading-tight">{entry.title}</p>
              {entry.is_verified && (
                <span className="inline-flex items-center gap-0.5 text-[9px] font-bold text-gold">
                  <BadgeCheck className="w-3 h-3" /> Verified
                </span>
              )}
            </div>
            {entry.subtitle && (
              <p className="text-[11px] text-muted-foreground mt-0.5">{entry.subtitle}</p>
            )}
          </div>
          <span className="text-[10px] text-muted-foreground shrink-0 pt-0.5">{fmtDate(entry.date)}</span>
        </div>

        {entry.organization && (
          <p className="text-[10px] text-muted-foreground/80 mt-1.5 flex items-center gap-1">
            <span className="font-medium text-foreground/70">{entry.organization}</span>
            {entry.verification_source ? ` · via ${entry.verification_source}` : ""}
          </p>
        )}
        {entry.description && (
          <p className="text-[12px] text-foreground/75 mt-1.5 leading-relaxed">{entry.description}</p>
        )}

        {ownerView && (onToggleHidden || onRemove) && (
          <div className="flex items-center gap-2 mt-2.5">
            {onToggleHidden && (
              <button
                onClick={() => onToggleHidden(entry)}
                className="inline-flex items-center gap-1 text-[10px] font-semibold text-muted-foreground px-2 py-1 rounded-full bg-muted/40 spring-tap"
              >
                {entry.is_hidden ? <><Eye className="w-3 h-3" /> Show</> : <><EyeOff className="w-3 h-3" /> Hide</>}
              </button>
            )}
            {onRemove && (
              <button
                onClick={() => onRemove(entry)}
                className="inline-flex items-center gap-1 text-[10px] font-semibold text-destructive px-2 py-1 rounded-full bg-destructive/8 spring-tap"
              >
                <Trash2 className="w-3 h-3" /> Remove
              </button>
            )}
          </div>
        )}
      </motion.div>
    </div>
  );
}