import React from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ChevronRight, Users, Plus } from "lucide-react";
import { base44 } from "@/api/base44Client";

const EASE = [0.16, 1, 0.3, 1];

const STATUS_TONE = {
  completed: "bg-success/15 text-success",
  approved: "bg-success/15 text-success",
  in_progress: "bg-primary/15 text-primary",
  under_review: "bg-warning/15 text-warning",
  blocked: "bg-destructive/15 text-destructive",
  draft: "bg-muted/60 text-muted-foreground",
};

export default function HomeSparkActivity() {
  const navigate = useNavigate();
  const tasks = useQuery({ queryKey: ["homeSparkTasks"], queryFn: () => base44.entities.TaskManagement.list("-updated_date", 6) });
  const workspaces = useQuery({ queryKey: ["homeSparkWorkspaces"], queryFn: () => base44.entities.Workspace.list("-updated_date", 4) });

  const t = tasks.data || [];
  const w = workspaces.data || [];
  const loading = tasks.isLoading || workspaces.isLoading;

  return (
    <motion.section initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: EASE }}>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/50">Team Activity</h2>
        <button onClick={() => navigate("/collaboration")} className="text-[12px] font-medium text-foreground/60 flex items-center spring-tap hover:text-foreground transition-colors">
          Open <ChevronRight className="w-3 h-3" />
        </button>
      </div>

      {loading ? (
        <div className="space-y-0">{[0, 1].map((i) => <div key={i} className="h-[48px] rounded-lg shimmer" />)}</div>
      ) : t.length === 0 && w.length === 0 ? (
        <div className="py-4">
          <p className="text-[14px] text-muted-foreground mb-3">No team activity yet.</p>
          <button onClick={() => navigate("/tasks")} className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-primary text-primary-foreground text-[12px] font-semibold spring-tap">
            <Plus className="w-3.5 h-3.5" />Create a task
          </button>
        </div>
      ) : (
        <div className="space-y-5">
          {w.length > 0 && (
            <div>
              <p className="text-[11px] text-muted-foreground/60 mb-2">Workspaces</p>
              <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
                {w.map((ws) => (
                  <button key={ws.id} onClick={() => navigate(`/collaboration/${ws.id}`)} className="flex items-center gap-2 px-3.5 py-2 rounded-full bg-muted/30 border border-border/20 spring-tap shrink-0 min-w-[140px]">
                    <Users className="w-3.5 h-3.5 text-muted-foreground shrink-0" strokeWidth={1.7} />
                    <span className="text-[12px] font-medium text-foreground truncate">{ws.title || ws.name || "Workspace"}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
          {t.length > 0 && (
            <div>
              <p className="text-[11px] text-muted-foreground/60 mb-2">Recent tasks</p>
              <div className="divide-y divide-border/25">
                {t.slice(0, 3).map((task) => (
                  <button key={task.id} onClick={() => navigate(`/tasks/${task.id}`)} className="w-full flex items-center gap-3 py-3 spring-tap text-left">
                    <div className="min-w-0 flex-1">
                      <p className="text-[14px] font-medium text-foreground truncate">{task.title}</p>
                      {task.assignee_names?.length ? <p className="text-[12px] text-muted-foreground truncate mt-0.5">{task.assignee_names.join(", ")}</p> : null}
                    </div>
                    {typeof task.progress_percent === "number" ? (
                      <div className="w-12 shrink-0">
                        <div className="h-1 rounded-full bg-muted overflow-hidden">
                          <div className="h-full bg-foreground/40 rounded-full" style={{ width: `${task.progress_percent}%` }} />
                        </div>
                      </div>
                    ) : null}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </motion.section>
  );
}