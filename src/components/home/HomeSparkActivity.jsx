import React from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Sparkles, ChevronRight, ListChecks, Users, Plus } from "lucide-react";
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
    <motion.section initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: EASE }} className="glass-card p-5">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-primary" />
          <h2 className="font-heading font-bold text-[15px] text-foreground">Spark Team Activity</h2>
        </div>
        <button onClick={() => navigate("/collaboration")} className="text-[11px] font-semibold text-primary flex items-center spring-tap">
          Open Spark <ChevronRight className="w-3 h-3" />
        </button>
      </div>

      {loading ? (
        <div className="space-y-2">{[0, 1].map((i) => <div key={i} className="h-14 rounded-xl shimmer" />)}</div>
      ) : t.length === 0 && w.length === 0 ? (
        <div className="py-6 text-center">
          <p className="text-[13px] text-muted-foreground mb-3">No team activity yet.</p>
          <button onClick={() => navigate("/tasks")} className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-primary text-primary-foreground text-[12px] font-semibold spring-tap">
            <Plus className="w-3.5 h-3.5" />Create a task
          </button>
        </div>
      ) : (
        <div className="space-y-3.5">
          {w.length > 0 && (
            <div>
              <p className="text-[10px] uppercase tracking-wide text-muted-foreground mb-1.5">Workspaces</p>
              <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
                {w.map((ws) => (
                  <button key={ws.id} onClick={() => navigate(`/collaboration/${ws.id}`)} className="flex items-center gap-2 px-3 py-2 rounded-xl glass spring-tap shrink-0 min-w-[150px]">
                    <Users className="w-3.5 h-3.5 text-primary shrink-0" />
                    <span className="text-[12px] font-semibold text-foreground truncate">{ws.title || ws.name || "Workspace"}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
          {t.length > 0 && (
            <div>
              <p className="text-[10px] uppercase tracking-wide text-muted-foreground mb-1.5">Recent tasks</p>
              <div className="space-y-2">
                {t.slice(0, 3).map((task) => (
                  <button key={task.id} onClick={() => navigate(`/tasks/${task.id}`)} className="w-full flex items-center gap-3 p-2.5 rounded-xl bg-muted/30 spring-tap text-left">
                    <ListChecks className="w-4 h-4 text-primary shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="text-[13px] font-semibold text-foreground truncate">{task.title}</p>
                      {task.assignee_names?.length ? <p className="text-[11px] text-muted-foreground truncate">{task.assignee_names.join(", ")}</p> : null}
                    </div>
                    {typeof task.progress_percent === "number" ? (
                      <div className="w-14 shrink-0">
                        <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                          <div className="h-full bg-primary rounded-full" style={{ width: `${task.progress_percent}%` }} />
                        </div>
                      </div>
                    ) : null}
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full shrink-0 ${STATUS_TONE[task.status] || "bg-muted/60 text-muted-foreground"}`}>
                      {(task.status || "").replace(/_/g, " ")}
                    </span>
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