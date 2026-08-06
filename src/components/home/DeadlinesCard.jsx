import React from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { AlertCircle, FileText, Inbox } from "lucide-react";
import { Link } from "react-router-dom";
import GlassCard from "@/components/ui/GlassCard";
import SectionHeader from "@/components/ui/SectionHeader";
import StatusBadge from "@/components/ui/StatusBadge";
import EmptyState from "@/components/ui/EmptyState";
import { addDays, formatDistanceToNow, differenceInDays } from "date-fns";
import { useDemoMode } from "@/lib/DemoModeContext";

const DEMO_DEADLINES = [
  { id: "d1", title: "Data Structures Assignment 3", course_code: "CSC 301", due_date: addDays(new Date(), 1).toISOString(), status: "pending", priority: "high" },
  { id: "d2", title: "Linear Algebra Problem Set", course_code: "MTH 201", due_date: addDays(new Date(), 3).toISOString(), status: "pending", priority: "medium" },
  { id: "d3", title: "Physics Lab Report", course_code: "PHY 203", due_date: addDays(new Date(), 5).toISOString(), status: "pending", priority: "low" },
];

export default function DeadlinesCard() {
  const { isDemoMode } = useDemoMode();

  const { data: assignments, isLoading } = useQuery({
    queryKey: ["deadlineAssignments"],
    queryFn: () => base44.entities.Assignment.list("-due_date", 10),
    enabled: !isDemoMode,
  });

  const deadlines = isDemoMode
    ? DEMO_DEADLINES
    : (assignments || []).filter((a) => a.status === "pending").slice(0, 3);

  if (isLoading && !isDemoMode) {
    return (
      <div>
        <SectionHeader title="Upcoming Deadlines" icon={AlertCircle} />
        <div className="space-y-2">
          {[1, 2, 3].map((i) => <div key={i} className="h-[60px] rounded-[20px] shimmer" />)}
        </div>
      </div>
    );
  }

  if (deadlines.length === 0) {
    return (
      <div>
        <SectionHeader title="Upcoming Deadlines" icon={AlertCircle} />
        <div className="bg-card rounded-[20px] soft-shadow border border-border/40">
          <EmptyState
            icon={Inbox}
            title="No deadlines"
            description="Your upcoming assignments will appear here"
            action={<Link to="/assignments" className="inline-flex items-center gap-1.5 px-4 py-2 rounded-[14px] bg-primary text-primary-foreground text-[12px] font-semibold spring-tap">View Assignments</Link>}
          />
        </div>
      </div>
    );
  }

  return (
    <div>
      <SectionHeader title="Upcoming Deadlines" subtitle={deadlines.length + " due"} icon={AlertCircle} action="All" actionLink="/academics" />
      <div className="space-y-2">
        {deadlines.map((d, i) => (
          <GlassCard key={d.id || i} variant="solid" className="p-3" delay={0.2 + i * 0.05}>
            <div className="flex items-center gap-3">
              <div className={"w-9 h-9 rounded-xl flex items-center justify-center " + (d.priority === "high" ? "bg-destructive/10" : d.priority === "medium" ? "bg-warning/10" : "bg-info/10")}>
                <FileText className={"w-4 h-4 " + (d.priority === "high" ? "text-destructive" : d.priority === "medium" ? "text-warning" : "text-info")} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-heading font-semibold text-[12px] truncate">{d.title}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-[10px] text-muted-foreground">{d.course_code}</span>
                  {d.due_date && (
                    <>
                      <span className="text-[10px] text-muted-foreground">·</span>
                      <span className={"text-[10px] font-medium " + (differenceInDays(new Date(d.due_date), new Date()) <= 1 ? "text-destructive" : "text-muted-foreground")}>
                        {formatDistanceToNow(new Date(d.due_date), { addSuffix: true })}
                      </span>
                    </>
                  )}
                </div>
              </div>
              <StatusBadge status={d.priority} />
            </div>
          </GlassCard>
        ))}
      </div>
    </div>
  );
}