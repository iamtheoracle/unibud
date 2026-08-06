import React, { useMemo } from "react";
import { TrendingUp, BarChart3, Users, Flame } from "lucide-react";
import { computeProgress, completionByType, completionByMember, weeklyProductivity, monthlyProductivity, semesterProgress } from "@/lib/collaboration/progress";
import { CircularProgress, CompletionBar, TaskCompletionBar } from "@/components/collaboration/VisualProgress";

/** ProgressDashboard — smart academic progress tracking for a workspace. */
export default function ProgressDashboard({ workspace, items, activity, members }) {
  const overall = useMemo(() => computeProgress(items), [items]);
  const byType = useMemo(() => completionByType(items), [items]);
  const byMember = useMemo(() => completionByMember(items, members), [items, members]);
  const weekly = useMemo(() => weeklyProductivity(activity), [activity]);
  const monthly = useMemo(() => monthlyProductivity(activity), [activity]);

  // study streak from activity consecutive active days
  const streak = useMemo(() => {
    const days = new Set((activity || []).map((a) => new Date(a.created_date).toISOString().slice(0, 10)));
    let s = 0; const d = new Date(); d.setHours(0,0,0,0);
    while (days.has(d.toISOString().slice(0, 10))) { s++; d.setDate(d.getDate() - 1); }
    return s;
  }, [activity]);

  // Semester dates from workspace due or default ~16 weeks
  const semStart = workspace?.created_date?.slice(0, 10);
  const semEnd = workspace?.due_date;
  const semPct = semesterProgress(semStart, semEnd);

  return (
    <div className="space-y-4">
      {/* Top: overall + semester + streak */}
      <div className="grid grid-cols-3 gap-2.5">
        <div className="glass-card p-3 flex flex-col items-center">
          <CircularProgress value={overall} size={50} tone="accent" />
          <p className="text-[10px] text-muted-foreground mt-1">Team progress</p>
        </div>
        <div className="glass-card p-3 flex flex-col items-center">
          <CircularProgress value={semPct} size={50} tone="information" />
          <p className="text-[10px] text-muted-foreground mt-1">Semester</p>
        </div>
        <div className="glass-card p-3 flex flex-col items-center justify-center">
          <div className="flex items-center gap-1 text-warning"><Flame className="w-5 h-5" /><span className="text-lg font-bold text-foreground">{streak}</span></div>
          <p className="text-[10px] text-muted-foreground mt-1">Day streak</p>
        </div>
      </div>

      {/* By type */}
      <div className="glass-card p-4">
        <p className="text-xs font-semibold text-foreground mb-3 flex items-center gap-1.5"><BarChart3 className="w-3.5 h-3.5 text-accent" /> Completion by type</p>
        {byType.length === 0 ? <p className="text-[11px] text-muted-foreground">No items yet.</p> : byType.map((t) => (
          <div key={t.type} className="mb-2"><TaskCompletionBar done={t.done} total={t.total} /></div>
        ))}
      </div>

      {/* By member */}
      <div className="glass-card p-4">
        <p className="text-xs font-semibold text-foreground mb-3 flex items-center gap-1.5"><Users className="w-3.5 h-3.5 text-accent" /> Individual task completion</p>
        {byMember.length === 0 ? <p className="text-[11px] text-muted-foreground">No assignments yet.</p> : byMember.map((m) => (
          <div key={m.id} className="mb-2">
            <div className="flex justify-between text-[11px] mb-1"><span className="text-foreground/80">{m.name}</span><span className="text-muted-foreground">{m.done}/{m.total}</span></div>
            <CompletionBar value={m.pct} tone={m.pct === 100 ? "success" : "accent"} />
          </div>
        ))}
      </div>

      {/* Weekly productivity */}
      <div className="glass-card p-4">
        <p className="text-xs font-semibold text-foreground mb-3 flex items-center gap-1.5"><TrendingUp className="w-3.5 h-3.5 text-accent" /> Weekly productivity</p>
        <div className="flex items-end justify-between gap-1.5 h-24">
          {weekly.buckets.map((b, i) => (
            <div key={i} className="flex-1 flex flex-col items-center justify-end">
              <div className="w-full rounded-t-md bg-accent chart-rise" style={{ height: `${(b.count / weekly.max) * 100}%`, minHeight: b.count ? "8px" : "2px", animationDelay: `${i * 60}ms` }} />
              <span className="text-[9px] text-muted-foreground mt-1">{b.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Monthly productivity */}
      <div className="glass-card p-4">
        <p className="text-xs font-semibold text-foreground mb-3">Monthly productivity</p>
        <div className="flex items-end justify-between gap-2 h-20">
          {monthly.weeks.map((w, i) => (
            <div key={i} className="flex-1 flex flex-col items-center justify-end">
              <div className="w-full rounded-t-md bg-primary chart-rise" style={{ height: `${(w.count / monthly.max) * 100}%`, minHeight: w.count ? "8px" : "2px", animationDelay: `${i * 80}ms` }} />
              <span className="text-[9px] text-muted-foreground mt-1">{w.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Goal tracking: items tagged as goals or study_plan completion */}
      <div className="glass-card p-4">
        <p className="text-xs font-semibold text-foreground mb-2">Goal tracking</p>
        {(() => {
          const goals = items.filter((i) => i.type === "study_plan" || (i.tags || []).includes("goal"));
          if (!goals.length) return <p className="text-[11px] text-muted-foreground">No study plans tagged as goals.</p>;
          return goals.map((g) => {
            const blocks = g.blocks || [];
            const totalWeeks = blocks.length;
            const doneWeeks = blocks.filter((b) => (b.items || []).every((it) => typeof it === "string" ? false : it.done)).length;
            return <div key={g.id} className="mb-2"><CompletionBar value={totalWeeks ? Math.round((doneWeeks / totalWeeks) * 100) : 0} label={g.title} tone="information" /></div>;
          });
        })()}
      </div>
    </div>
  );
}