import React from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { ListChecks, CheckCircle2, AlertTriangle, Clock, Users, TrendingUp, Loader2, Activity } from "lucide-react";
import EmptyState from "@/components/ui/EmptyState";
import { isOverdue, daysUntilDue } from "@/lib/tasks/constants";

export default function TaskIntelligence({ module }) {
  const { data: tasks, isLoading } = useQuery({
    queryKey: ["oracle-tasks"],
    queryFn: () => base44.entities.TaskManagement.list("-updated_date", 500),
  });

  const list = tasks || [];
  const total = list.length;
  const completed = list.filter((t) => ["completed", "approved"].includes(t.status)).length;
  const overdue = list.filter(isOverdue).length;
  const inProgress = list.filter((t) => t.status === "in_progress").length;
  const underReview = list.filter((t) => t.status === "under_review").length;
  const blocked = list.filter((t) => t.status === "blocked").length;
  const completionRate = total ? Math.round((completed / total) * 100) : 0;

  // workload distribution by assignee
  const workload = {};
  list.forEach((t) => (t.assignee_names || []).forEach((n) => {
    if (!workload[n]) workload[n] = { total: 0, open: 0 };
    workload[n].total++;
    if (!["completed", "approved", "archived"].includes(t.status)) workload[n].open++;
  }));
  const topWorkload = Object.entries(workload).sort((a, b) => b[1].open - a[1].open).slice(0, 6);

  // by department
  const dept = {};
  list.forEach((t) => { const d = t.department || "Unspecified"; dept[d] = (dept[d] || 0) + 1; });
  const deptRows = Object.entries(dept).sort((a, b) => b[1] - a[1]);

  // by type
  const byType = {};
  list.forEach((t) => { byType[t.task_type] = (byType[t.task_type] || 0) + 1; });
  const typeRows = Object.entries(byType).sort((a, b) => b[1] - a[1]);

  // upcoming deadlines
  const upcoming = list
    .filter((t) => t.due_date && !["completed", "approved", "archived"].includes(t.status))
    .sort((a, b) => new Date(a.due_date) - new Date(b.due_date))
    .slice(0, 6);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-[22px] font-heading font-bold tracking-tight flex items-center gap-2"><ListChecks className="w-5 h-5 text-primary" />Task Intelligence</h1>
        <p className="text-[13px] text-muted-foreground mt-1">Team productivity, completion rates, workload distribution and project health across the Spark task system.</p>
      </div>

      {isLoading ? (
        <div className="grid place-items-center py-16"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
      ) : total === 0 ? (
        <EmptyState icon={ListChecks} title="No tasks yet" description="Task analytics will populate once teams start creating and completing tasks in Spark." />
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Kpi icon={Activity} label="Total Tasks" value={total} />
            <Kpi icon={CheckCircle2} label="Completion" value={`${completionRate}%`} tone="success" />
            <Kpi icon={AlertTriangle} label="Overdue" value={overdue} tone={overdue ? "error" : "muted"} />
            <Kpi icon={Clock} label="In Progress" value={inProgress} tone="primary" />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            <Kpi icon={Users} label="Under Review" value={underReview} tone="warning" small />
            <Kpi icon={TrendingUp} label="Blocked" value={blocked} tone={blocked ? "error" : "muted"} small />
            <Kpi icon={CheckCircle2} label="Completed" value={completed} tone="success" small />
          </div>

          {/* Workload distribution */}
          <div className="crystal-card p-4">
            <h3 className="text-[13px] font-heading font-semibold mb-3 flex items-center gap-2"><Users className="w-4 h-4 text-primary" />Workload Distribution (open tasks)</h3>
            {topWorkload.length === 0 ? (
              <p className="text-[12px] text-muted-foreground">No assigned tasks.</p>
            ) : (
              <div className="space-y-2">
                {topWorkload.map(([name, w]) => (
                  <div key={name} className="flex items-center justify-between text-[12px]">
                    <span className="truncate flex-1">{name}</span>
                    <div className="flex items-center gap-2 w-[140px] ml-3">
                      <div className="h-1.5 rounded-full bg-muted flex-1 overflow-hidden">
                        <div className="h-full bg-primary rounded-full" style={{ width: `${topWorkload[0][1].open ? (w.open / topWorkload[0][1].open) * 100 : 0}%` }} />
                      </div>
                      <span className="text-muted-foreground tabular-nums w-10 text-right">{w.open}/{w.total}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="grid md:grid-cols-2 gap-3">
            {/* Department performance */}
            <div className="crystal-card p-4">
              <h3 className="text-[13px] font-heading font-semibold mb-3">By Department</h3>
              <div className="space-y-1.5">
                {deptRows.map(([d, c]) => (
                  <div key={d} className="flex items-center justify-between text-[12px]">
                    <span className="text-muted-foreground">{d}</span><span className="font-semibold tabular-nums">{c}</span>
                  </div>
                ))}
              </div>
            </div>
            {/* By type */}
            <div className="crystal-card p-4">
              <h3 className="text-[13px] font-heading font-semibold mb-3">By Task Type</h3>
              <div className="space-y-1.5">
                {typeRows.map(([d, c]) => (
                  <div key={d} className="flex items-center justify-between text-[12px]">
                    <span className="text-muted-foreground capitalize">{d.replace(/_/g, " ")}</span><span className="font-semibold tabular-nums">{c}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Upcoming deadlines / bottlenecks */}
          <div className="crystal-card p-4">
            <h3 className="text-[13px] font-heading font-semibold mb-3 flex items-center gap-2"><AlertTriangle className="w-4 h-4 text-warning" />Upcoming & Bottlenecks</h3>
            {upcoming.length === 0 ? (
              <p className="text-[12px] text-muted-foreground">No upcoming deadlines.</p>
            ) : (
              <div className="space-y-2">
                {upcoming.map((t) => {
                  const d = daysUntilDue(t);
                  return (
                    <div key={t.id} className="flex items-center justify-between text-[12px] rounded-xl border border-border/50 px-3 py-2">
                      <span className="truncate flex-1">{t.title}</span>
                      <span className={`font-semibold ${d < 0 ? "text-destructive" : d <= 2 ? "text-warning" : "text-muted-foreground"}`}>
                        {d < 0 ? "Overdue" : d === 0 ? "Today" : `${d}d`}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

function Kpi({ icon: Icon, label, value, tone = "muted", small }) {
  const c = tone === "success" ? "text-success" : tone === "error" ? "text-destructive" : tone === "warning" ? "text-warning" : tone === "primary" ? "text-primary" : "text-foreground";
  return (
    <div className="crystal-card p-4">
      <Icon className={`w-4 h-4 mb-2 ${c}`} />
      <div className={`font-heading font-bold tabular-nums ${c} ${small ? "text-[16px]" : "text-[20px]"}`}>{value}</div>
      <div className="text-[11px] text-muted-foreground mt-0.5">{label}</div>
    </div>
  );
}