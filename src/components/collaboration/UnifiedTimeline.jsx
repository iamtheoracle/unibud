import React, { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { AlertTriangle, Sparkles, CalendarDays } from "lucide-react";
import { fetchUnifiedTimeline } from "@/lib/collaboration/unifiedTimeline";
import { useWorkspace } from "@/lib/collaboration/useWorkspace";

const TYPE_LABEL = { assignment: "Assignment", exam: "Exam", personal: "Personal", campus: "Campus", lecture: "Lecture", tutorial: "Tutorial", lab: "Lab", team_task: "Team task", milestone: "Milestone", study_group: "Study group" };

/** UnifiedTimeline — the unified academic + collaboration timeline with
 *  conflict detection and Spark-suggested collaboration slots. */
export default function UnifiedTimeline({ workspaceId }) {
  const { user, items } = useWorkspace(workspaceId);
  const academic = useQuery({ queryKey: ["unifiedTimeline"], queryFn: () => fetchUnifiedTimeline(user), enabled: !!user, refetchInterval: 60000 });

  const events = useMemo(() => {
    const a = academic.data?.events || [];
    const collab = items.filter((i) => i.due_date && i.status !== "done" && i.status !== "approved").map((i) => ({ id: i.id, date: i.due_date, time: "23:59", title: i.title, type: "team_task", source: "Workspace", color: "221 83% 50%" }));
    return [...a, ...collab].sort((x, y) => (x.date + x.time).localeCompare(y.date + y.time)).slice(0, 60);
  }, [academic.data, items]);

  const conflicts = academic.data?.conflicts || [];
  const slots = academic.data?.slots || [];

  // group by date
  const grouped = useMemo(() => {
    const map = {};
    events.forEach((e) => { (map[e.date] = map[e.date] || []).push(e); });
    return Object.entries(map);
  }, [events]);

  return (
    <div className="space-y-3">
      {conflicts.length > 0 && (
        <div className="glass-card p-3 border border-error/20">
          <p className="text-xs font-semibold text-error flex items-center gap-1.5 mb-1"><AlertTriangle className="w-3.5 h-3.5" /> Scheduling conflicts</p>
          {conflicts.map((c, i) => (
            <p key={i} className="text-[11px] text-foreground/80">{c.date} {c.time}: {c.items.map((x) => x.title).join(" + ")}</p>
          ))}
        </div>
      )}
      {slots.length > 0 && (
        <div className="glass-card p-3">
          <p className="text-xs font-semibold text-foreground flex items-center gap-1.5 mb-1.5"><Sparkles className="w-3.5 h-3.5 text-accent" /> Suggested study/collaboration slots</p>
          <div className="flex gap-1.5 flex-wrap">
            {slots.map((s, i) => <span key={i} className="text-[10px] font-semibold px-2 py-1 rounded-full bg-accent/12 text-accent">{s.label}</span>)}
          </div>
        </div>
      )}

      <div className="glass-card p-4">
        <p className="text-xs font-semibold text-foreground flex items-center gap-1.5 mb-3"><CalendarDays className="w-3.5 h-3.5 text-accent" /> Unified academic timeline</p>
        {grouped.length === 0 ? <p className="text-[11px] text-muted-foreground">No upcoming events.</p> : grouped.map(([date, list]) => (
          <div key={date} className="mb-3">
            <p className="text-[10px] font-semibold text-muted-foreground uppercase mb-1.5">{new Date(date).toLocaleDateString(undefined, { weekday: "long", month: "short", day: "numeric" })}</p>
            <div className="space-y-1.5">
              {list.map((e) => (
                <div key={e.id} className="flex items-center gap-2.5">
                  <span className="w-2 h-2 rounded-full shrink-0" style={{ background: `hsl(${e.color})` }} />
                  <span className="text-[11px] text-muted-foreground w-12">{e.time}</span>
                  <span className="text-[11px] text-foreground/90 truncate flex-1">{e.title}</span>
                  <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded-full bg-muted/50 text-muted-foreground shrink-0">{TYPE_LABEL[e.type] || e.type}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}