import React, { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { CalendarDays, AlertCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import OperatorTaskCard from "@/components/operator/OperatorTaskCard";
import { timeUntil } from "@/components/operator/operatorConstants";

export default function OperatorCalendar() {
  const navigate = useNavigate();
  const { data: user } = useQuery({ queryKey: ["currentUser"], queryFn: () => base44.auth.me(), retry: false });
  const { data: tasks } = useQuery({
    queryKey: ["operatorAssignments"],
    queryFn: () => base44.entities.OperatorAssignment.filter({ assigned_to_id: user?.id }, "-deadline", 200),
    enabled: !!user?.id,
  });

  const my = (tasks || []).filter((t) => t.deadline && !["completed", "rejected", "archived"].includes(t.status));
  const today = useMemo(() => {
    const s = new Date(); s.setHours(0, 0, 0, 0); const e = new Date(); e.setHours(23, 59, 59, 999);
    return my.filter((t) => { const d = new Date(t.deadline); return d >= s && d <= e; });
  }, [my]);
  const upcoming = useMemo(() => my.filter((t) => new Date(t.deadline) > new Date() && !today.includes(t)).sort((a, b) => new Date(a.deadline) - new Date(b.deadline)), [my, today]);
  const overdue = useMemo(() => my.filter((t) => new Date(t.deadline) < new Date()), [my]);

  return (
    <div className="space-y-5 mt-2">
      <div className="flex items-center gap-2 px-1">
        <CalendarDays className="w-4 h-4 text-primary" />
        <h2 className="font-heading font-bold text-[17px] text-foreground">Calendar</h2>
      </div>

      {overdue.length > 0 && (
        <div className="rounded-[18px] p-3.5 glass border-l-[3px] border-l-destructive">
          <p className="text-[11px] font-bold uppercase tracking-wide text-destructive mb-2 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> Overdue</p>
          <div className="space-y-2.5">{overdue.slice(0, 3).map((t, i) => <OperatorTaskCard key={t.id} task={t} index={i} />)}</div>
        </div>
      )}

      <div>
        <p className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground/70 mb-2 px-1">Today's Jobs</p>
        {today.length === 0 ? (
          <div className="rounded-[18px] p-4 glass text-center"><p className="text-[11px] text-muted-foreground">No jobs scheduled today.</p></div>
        ) : (
          <div className="space-y-2.5">{today.map((t, i) => <OperatorTaskCard key={t.id} task={t} index={i} />)}</div>
        )}
      </div>

      <div>
        <p className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground/70 mb-2 px-1">Upcoming Assignments</p>
        {upcoming.length === 0 ? (
          <div className="rounded-[18px] p-4 glass text-center"><p className="text-[11px] text-muted-foreground">No upcoming assignments.</p></div>
        ) : (
          <div className="space-y-2.5">{upcoming.slice(0, 8).map((t, i) => <OperatorTaskCard key={t.id} task={t} index={i} />)}</div>
        )}
      </div>
    </div>
  );
}