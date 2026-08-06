import React from "react";
import { Link } from "react-router-dom";
import { Calendar, Users, AlertTriangle } from "lucide-react";
import { typeMeta, statusMeta, priorityMeta, TONE_CLASS, isOverdue, daysUntilDue } from "@/lib/tasks/constants";

export default function TaskCard({ task }) {
  const t = typeMeta(task.task_type);
  const s = statusMeta(task.status);
  const p = priorityMeta(task.priority);
  const overdue = isOverdue(task);
  const dleft = daysUntilDue(task);
  const TypeIcon = t.icon;
  const StatusIcon = s.icon;
  const PriIcon = p.icon;

  return (
    <Link to={`/tasks/${task.id}`} className="block crystal-card p-4 card-hover">
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-8 h-8 rounded-xl bg-primary/12 grid place-items-center shrink-0">
            <TypeIcon className="w-4 h-4 text-primary" />
          </div>
          <div className="min-w-0">
            <h3 className="font-heading font-semibold text-[14px] truncate">{task.title}</h3>
            <p className="text-[11px] text-muted-foreground">{t.label}</p>
          </div>
        </div>
        <span className={`shrink-0 inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-semibold ${TONE_CLASS[s.tone]}`}>
          <StatusIcon className="w-3 h-3" />{s.label}
        </span>
      </div>

      {task.description && <p className="text-[12px] text-muted-foreground line-clamp-2 mb-2">{task.description}</p>}

      {/* Progress */}
      <div className="mb-2">
        <div className="flex items-center justify-between text-[10px] text-muted-foreground mb-1">
          <span>Progress</span><span className="tabular-nums font-semibold">{task.progress_percent || 0}%</span>
        </div>
        <div className="h-1.5 rounded-full bg-muted overflow-hidden">
          <div className={`h-full rounded-full ${overdue ? "bg-destructive" : "bg-primary"}`} style={{ width: `${task.progress_percent || 0}%` }} />
        </div>
      </div>

      <div className="flex items-center gap-3 flex-wrap text-[11px] text-muted-foreground">
        <span className={`inline-flex items-center gap-1 ${p.tone === "error" ? "text-destructive" : p.tone === "warning" ? "text-warning" : ""}`}>
          <PriIcon className="w-3 h-3" />{p.label}
        </span>
        {(task.assignee_names || []).length > 0 && (
          <span className="inline-flex items-center gap-1"><Users className="w-3 h-3" />{task.assignee_names.length} assigned</span>
        )}
        {task.due_date && (
          <span className={`inline-flex items-center gap-1 ${overdue ? "text-destructive font-semibold" : dleft <= 2 ? "text-warning" : ""}`}>
            {overdue ? <AlertTriangle className="w-3 h-3" /> : <Calendar className="w-3 h-3" />}
            {overdue ? "Overdue" : dleft === 0 ? "Due today" : dleft > 0 ? `${dleft}d left` : "Due"}
          </span>
        )}
      </div>
    </Link>
  );
}