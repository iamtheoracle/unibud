import React from "react";
import { Link } from "react-router-dom";
import { ChevronRight, GraduationCap, Loader2, Sparkles } from "lucide-react";
import { useAcademicTimeline } from "@/lib/identity/useAcademicTimeline";
import { getTypeMeta } from "@/lib/identity/timelineTypes";

function fmtDate(d) {
  try {
    return new Date(d).toLocaleDateString("en", { month: "short", year: "numeric" });
  } catch {
    return d;
  }
}

export default function AcademicTimelinePreview({ user }) {
  const { entries, loading } = useAcademicTimeline(user?.id);
  const recent = entries.filter((e) => !e.is_hidden).slice(-2).reverse();

  return (
    <Link to="/academic-timeline" className="block glass-card p-4 spring-tap">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-[12px] bg-primary/10 flex items-center justify-center">
            <GraduationCap className="w-4 h-4 text-primary" />
          </div>
          <div>
            <h3 className="font-heading font-semibold text-[14px] text-foreground leading-tight">Academic Timeline</h3>
            <p className="text-[10px] text-muted-foreground">Your journey from admission to alumni</p>
          </div>
        </div>
        <ChevronRight className="w-4 h-4 text-muted-foreground" />
      </div>

      {loading ? (
        <div className="flex items-center gap-2 py-2">
          <Loader2 className="w-3.5 h-3.5 text-muted-foreground animate-spin" />
          <span className="text-[11px] text-muted-foreground">Loading your milestones…</span>
        </div>
      ) : recent.length === 0 ? (
        <div className="flex items-center gap-2 py-1.5">
          <Sparkles className="w-3.5 h-3.5 text-accent" />
          <span className="text-[11px] text-muted-foreground">Add your first milestone to start your journey.</span>
        </div>
      ) : (
        <div className="space-y-1.5 mt-1">
          {recent.map((e) => {
            const Icon = getTypeMeta(e.entry_type).icon;
            return (
              <div key={e.id} className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full glass flex items-center justify-center shrink-0">
                  <Icon className="w-3 h-3 text-primary" />
                </div>
                <p className="text-[12px] font-medium text-foreground truncate flex-1">{e.title}</p>
                <span className="text-[10px] text-muted-foreground shrink-0">{fmtDate(e.date)}</span>
              </div>
            );
          })}
        </div>
      )}

      <p className="text-[11px] text-primary font-semibold mt-2.5">View full journey →</p>
    </Link>
  );
}