import React from "react";
import { Link } from "react-router-dom";
import { AlertCircle, ClipboardList } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { ListSkeleton } from "@/components/resilience/SkeletonKit";

function dueLabel(days) {
  if (days < 0) return "Overdue";
  if (days === 0) return "Due today";
  if (days === 1) return "Due tomorrow";
  return `Due in ${days} days`;
}

export default function AssignmentsCard() {
  const { data: assignments, isLoading } = useQuery({
    queryKey: ["card-assignments"],
    queryFn: () => base44.entities.Assignment.list("-due_date", 8),
    staleTime: 60000,
  });

  if (isLoading) return <ListSkeleton rows={3} />;

  const pending = (assignments || []).filter((a) => a.status === "pending" || a.status === "in_progress");

  if (pending.length === 0) {
    return (
      <div className="flex items-center gap-2 py-2">
        <ClipboardList className="w-4 h-4 text-muted-foreground" />
        <p className="text-[12px] text-muted-foreground">All caught up — no pending assignments.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {pending.slice(0, 4).map((a) => {
        const days = a.due_date ? Math.ceil((new Date(a.due_date) - Date.now()) / (1000 * 60 * 60 * 24)) : 0;
        const urgent = days <= 1;
        return (
          <Link key={a.id} to="/assignments" className="block spring-tap">
            <div className="flex items-start gap-2.5">
              <AlertCircle className={`w-4 h-4 mt-0.5 shrink-0 ${urgent ? "text-destructive" : "text-muted-foreground"}`} />
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-medium text-foreground truncate">{a.title}</p>
                <p className={`text-[11px] ${urgent ? "text-destructive font-semibold" : "text-muted-foreground"}`}>
                  {a.course_code ? `${a.course_code} · ` : ""}{dueLabel(days)}
                </p>
              </div>
            </div>
          </Link>
        );
      })}
      <Link to="/assignments" className="block text-[12px] font-medium text-primary pt-1">
        View all assignments →
      </Link>
    </div>
  );
}