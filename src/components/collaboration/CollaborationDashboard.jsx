import React, { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { Clock, AlertTriangle, CalendarDays, TrendingUp, Sparkles, ChevronRight } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useCollaboration } from "@/lib/collaboration/useCollaboration";
import { computeProgress, overdueCount, countdown, fetchAcademicProgress } from "@/lib/collaboration/progress";
import { fetchUnifiedTimeline } from "@/lib/collaboration/unifiedTimeline";
import { CircularProgress, Countdown } from "@/components/collaboration/VisualProgress";

/** CollaborationDashboard — the shared productivity overview:
 *  active projects, deadlines, team activity, upcoming timeline and health. */
export default function CollaborationDashboard() {
  const { workspaces, user } = useCollaboration();

  const academic = useQuery({ queryKey: ["academicProgress"], queryFn: () => fetchAcademicProgress(user), enabled: !!user });
  const timeline = useQuery({ queryKey: ["unifiedTimeline"], queryFn: () => fetchUnifiedTimeline(user), enabled: !!user, refetchInterval: 60000 });

  const allItems = useMemo(() => workspaces.flatMap((w) => w._items || []), [workspaces]);
  const overallProgress = useMemo(() => {
    if (!workspaces.length) return 0;
    const sum = workspaces.reduce((acc, w) => acc + (w._progress || 0), 0);
    return Math.round(sum / workspaces.length);
  }, [workspaces]);

  const upcomingDeadlines = useMemo(() => {
    const list = [];
    workspaces.forEach((w) => (w._items || []).forEach((i) => { if (i.due_date && i.status !== "done" && i.status !== "approved") list.push({ ...i, workspace_title: w.title, workspace_id: w.id }); }));
    list.sort((a, b) => a.due_date.localeCompare(b.due_date));
    return list.slice(0, 4);
  }, [workspaces]);

  const conflicts = timeline.data?.conflicts || [];
  const slots = timeline.data?.slots || [];
  const nextEvents = (timeline.data?.events || []).slice(0, 5);

  const health = (w) => {
    const items = w._items || [];
    const overdue = overdueCount(items);
    if (overdue > 2) return { label: "Needs attention", tone: "error" };
    if (overdue > 0) return { label: "At risk", tone: "warning" };
    if ((w._progress || 0) > 70) return { label: "On track", tone: "success" };
    return { label: "Active", tone: "information" };
  };

  return (
    <div className="space-y-4">
      {/* Top KPIs */}
      <div className="grid grid-cols-3 gap-2.5">
        <div className="glass-card p-3 flex flex-col items-center">
          <CircularProgress value={overallProgress} size={52} tone="accent" />
          <p className="text-[10px] text-muted-foreground mt-1">Overall</p>
        </div>
        <div className="glass-card p-3 flex flex-col items-center">
          <span className="text-xl font-bold text-foreground">{workspaces.length}</span>
          <p className="text-[10px] text-muted-foreground">Workspaces</p>
        </div>
        <div className="glass-card p-3 flex flex-col items-center">
          <span className="text-xl font-bold text-error">{overdueCount(allItems)}</span>
          <p className="text-[10px] text-muted-foreground">Overdue</p>
        </div>
      </div>

      {/* Academic progress */}
      {academic.data && (
        <div className="glass-card p-4">
          <p className="text-xs font-semibold text-foreground mb-3 flex items-center gap-1.5"><TrendingUp className="w-3.5 h-3.5 text-accent" /> Academic progress</p>
          <div className="grid grid-cols-3 gap-3">
            <ProgressStat label="Assignments" pct={academic.data.assignments.pct} done={academic.data.assignments.done} total={academic.data.assignments.total} />
            <ProgressStat label="Projects" pct={academic.data.projects.pct} done={academic.data.projects.done} total={academic.data.projects.total} />
            <ProgressStat label="Exams" pct={academic.data.exams.total ? Math.round((academic.data.exams.done / academic.data.exams.total) * 100) : 0} done={academic.data.exams.done} total={academic.data.exams.total} />
          </div>
        </div>
      )}

      {/* Active workspaces */}
      <div>
        <p className="text-xs font-semibold text-foreground mb-2">Active workspaces</p>
        <div className="space-y-2">
          {workspaces.slice(0, 5).map((w) => {
            const h = health(w);
            const toneClass = { error: "text-error bg-error/12", warning: "text-warning bg-warning/12", success: "text-success bg-success/12", information: "text-information bg-information/12" }[h.tone];
            return (
              <Link key={w.id} to={`/collaboration/${w.id}`} className="glass-card p-3 flex items-center gap-3 card-hover">
                <CircularProgress value={w._progress || 0} size={40} tone={h.tone === "error" ? "error" : "accent"} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground truncate">{w.title}</p>
                  <p className="text-[10px] text-muted-foreground">{(w._items || []).length} items · {(w.members || []).length} members</p>
                </div>
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${toneClass}`}>{h.label}</span>
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
              </Link>
            );
          })}
        </div>
      </div>

      {/* Upcoming deadlines */}
      {upcomingDeadlines.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-foreground mb-2 flex items-center gap-1.5"><Clock className="w-3.5 h-3.5 text-warning" /> Upcoming deadlines</p>
          <div className="grid grid-cols-2 gap-2">
            {upcomingDeadlines.map((d) => <Countdown key={d.id} target={d.due_date} label={`${d.title} · ${d.workspace_title}`} tone="warning" />)}
          </div>
        </div>
      )}

      {/* Unified timeline preview */}
      <div className="glass-card p-4">
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs font-semibold text-foreground flex items-center gap-1.5"><CalendarDays className="w-3.5 h-3.5 text-accent" /> Unified timeline</p>
          <Link to="/calendar" className="text-[10px] text-accent font-semibold">Full calendar</Link>
        </div>
        {nextEvents.length === 0 ? <p className="text-[11px] text-muted-foreground">No upcoming academic events.</p> : (
          <div className="space-y-1.5">
            {nextEvents.map((e) => (
              <div key={e.id} className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full shrink-0" style={{ background: `hsl(${e.color})` }} />
                <span className="text-[11px] text-foreground/80 truncate flex-1">{e.title}</span>
                <span className="text-[10px] text-muted-foreground">{e.date}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Conflict warnings + suggested slots */}
      {conflicts.length > 0 && (
        <div className="glass-card p-3 border border-error/20">
          <p className="text-xs font-semibold text-error flex items-center gap-1.5 mb-1"><AlertTriangle className="w-3.5 h-3.5" /> Scheduling conflicts</p>
          {conflicts.slice(0, 3).map((c, i) => (
            <p key={i} className="text-[11px] text-foreground/80">{c.date} {c.time}: {c.items.map((x) => x.title).join(" + ")}</p>
          ))}
        </div>
      )}
      {slots.length > 0 && (
        <div className="glass-card p-3">
          <p className="text-xs font-semibold text-foreground flex items-center gap-1.5 mb-1.5"><Sparkles className="w-3.5 h-3.5 text-accent" /> Suggested collaboration slots</p>
          <div className="flex gap-1.5 flex-wrap">
            {slots.map((s, i) => <span key={i} className="text-[10px] font-semibold px-2 py-1 rounded-full bg-accent/12 text-accent">{s.label}</span>)}
          </div>
        </div>
      )}
    </div>
  );
}

function ProgressStat({ label, pct, done, total }) {
  return (
    <div className="text-center">
      <div className="text-lg font-bold text-foreground">{pct}%</div>
      <div className="text-[10px] text-muted-foreground">{done}/{total}</div>
      <div className="text-[10px] text-muted-foreground mt-0.5">{label}</div>
    </div>
  );
}