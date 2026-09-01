import React from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { base44 } from "@/api/base44Client";
import { ClipboardList, CalendarClock, ChevronRight } from "lucide-react";
import { UniCard } from "@/components/uni-portal/UniPortalUI";
import UniEmptyState from "@/components/uni-portal/UniEmptyState";

function formatDue(dueDate) {
  if (!dueDate) return null;
  const due = new Date(dueDate);
  const now = new Date();
  const diff = Math.ceil((due - now) / (1000 * 60 * 60 * 24));
  if (diff < 0) return "Overdue";
  if (diff === 0) return "Due today";
  if (diff === 1) return "Due tomorrow";
  return `In ${diff} days`;
}

const PRIORITY_DOT = {
  high: "bg-error",
  medium: "bg-warning",
  low: "bg-success",
};

export default function DepartmentalTasksCard({ user, delay = 0.2 }) {
  const navigate = useNavigate();
  const { data: assignments, isLoading } = useQuery({
    queryKey: ["Assignment", "dept-upcoming"],
    queryFn: () => base44.entities.Assignment.list("-created_date", 50),
  });

  const now = new Date();
  const upcoming = (assignments || [])
    .filter((a) => a.due_date && new Date(a.due_date) >= now)
    .sort((a, b) => new Date(a.due_date) - new Date(b.due_date));

  return (
    <UniCard
      title="Departmental Tasks"
      description="Upcoming assignment deadlines"
      delay={delay}
      className="lg:col-span-2"
      padding={false}
    >
      {isLoading ? (
        <div className="p-5 space-y-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-12 rounded-[12px] bg-muted/40 shimmer" />
          ))}
        </div>
      ) : upcoming.length === 0 ? (
        <UniEmptyState
          icon={ClipboardList}
          title="No upcoming tasks"
          description="Assignments with upcoming deadlines will appear here."
          actionLabel="Create Assignment"
          onAction={() => navigate("/uni-portal/assignments")}
          accent="warning"
        />
      ) : (
        <div className="divide-y divide-border/20">
          {upcoming.slice(0, 6).map((a, i) => {
            const due = formatDue(a.due_date);
            return (
              <motion.div
                key={a.id || i}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.04 }}
                className="flex items-center gap-4 px-5 py-3.5 hover:bg-muted/30 cursor-pointer"
                onClick={() => navigate("/uni-portal/assignments")}
              >
                <div className="w-10 h-10 rounded-[12px] bg-warning/10 flex items-center justify-center flex-shrink-0">
                  <ClipboardList className="w-5 h-5 text-warning" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-semibold text-foreground truncate">{a.title}</p>
                  <p className="text-[11px] text-muted-foreground truncate">
                    {a.course_code || a.course_title || "General"}
                    {a.type ? ` · ${a.type}` : ""}
                  </p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className={`w-2 h-2 rounded-full ${PRIORITY_DOT[a.priority] || PRIORITY_DOT.medium}`} />
                  {due && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-muted-foreground bg-muted/50 px-2 py-1 rounded-full">
                      <CalendarClock className="w-3 h-3" />
                      {due}
                    </span>
                  )}
                  <ChevronRight className="w-4 h-4 text-muted-foreground" />
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </UniCard>
  );
}