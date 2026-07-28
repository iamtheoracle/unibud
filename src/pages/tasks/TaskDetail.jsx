import React, { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowLeft, Users, Calendar, Clock, Tag, Building2, Trash2, Edit3, CheckCircle2, ThumbsDown,
  AlertTriangle, Sparkles, Loader2, Wand2,
} from "lucide-react";
import { base44 } from "@/api/base44Client";
import {
  typeMeta, statusMeta, priorityMeta, TONE_CLASS, isOverdue, daysUntilDue, TASK_STATUSES,
} from "@/lib/tasks/constants";
import { useTask, useTaskActivity, useUpdateTask, useApproveTask } from "@/lib/tasks/useTasks";
import TaskProgress from "@/components/tasks/TaskProgress";
import TaskChecklist from "@/components/tasks/TaskChecklist";
import TaskMilestones from "@/components/tasks/TaskMilestones";
import TaskComments from "@/components/tasks/TaskComments";
import TaskActivityFeed from "@/components/tasks/TaskActivityFeed";
import TaskComposer from "@/components/tasks/TaskComposer";
import { sparkTaskAssist } from "@/lib/tasks/budTaskIntent";
import { useToast } from "@/components/ui/use-toast";
import EmptyState from "@/components/ui/EmptyState";

export default function TaskDetail() {
  const { taskId } = useParams();
  const { toast } = useToast();
  const [user, setUser] = useState(null);
  const [editing, setEditing] = useState(false);
  const [aiBusy, setAiBusy] = useState(false);
  const [aiPanel, setAiPanel] = useState(null);

  useQuery({
    queryKey: ["currentUser"],
    queryFn: async () => { const u = await base44.auth.me(); setUser(u); return u; },
  });

  const { data: task, isLoading } = useTask(taskId);
  const { data: activity } = useTaskActivity(taskId);
  const update = useUpdateTask();
  const approve = useApproveTask();

  const actor = user;

  const changeStatus = async (status) => {
    const s = statusMeta(status);
    await update.mutateAsync({
      task, patch: { status }, actor,
      activity: { action: "status_changed", detail: `Status → ${s.label}` },
    });
    toast({ title: `Status: ${s.label}` });
  };

  const remove = async () => {
    if (!confirm("Delete this task? This cannot be undone.")) return;
    await base44.entities.TaskManagement.delete(task.id);
    window.location.href = "/tasks";
  };

  const runAI = async (mode) => {
    setAiBusy(true);
    try {
      const res = await sparkTaskAssist(task, mode);
      setAiPanel(mode === "subtasks" ? { type: "subtasks", items: res.checklist } : mode === "summary" ? { type: "summary", text: res.summary } : { type: "next", items: res.actions });
    } catch (e) {
      toast({ title: "Bud unavailable", description: e?.message, variant: "destructive" });
    } finally { setAiBusy(false); }
  };

  if (isLoading) return <div className="h-screen grid place-items-center"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>;
  if (!task) return (
    <div className="h-screen grid place-items-center px-6">
      <EmptyState icon={AlertTriangle} title="Task not found" description="It may have been deleted or you don't have access." action={<Link to="/tasks" className="px-5 py-2.5 rounded-full bg-primary text-primary-foreground text-[13px] font-semibold spring-tap">Back to tasks</Link>} />
    </div>
  );

  const t = typeMeta(task.task_type);
  const s = statusMeta(task.status);
  const p = priorityMeta(task.priority);
  const TypeIcon = t.icon;
  const overdue = isOverdue(task);
  const dleft = daysUntilDue(task);

  return (
    <div className="min-h-screen max-w-[640px] mx-auto px-5 pt-6 pb-32 safe-area-pt app-content">
      <div className="flex items-center gap-3 mb-4">
        <Link to="/tasks" className="w-9 h-9 rounded-xl hover:bg-muted/60 grid place-items-center spring-tap"><ArrowLeft className="w-[18px] h-[18px]" /></Link>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <TypeIcon className="w-4 h-4 text-primary shrink-0" />
            <span className="text-[11px] font-semibold text-muted-foreground">{t.label}</span>
          </div>
        </div>
        <button onClick={() => setEditing(true)} className="w-9 h-9 rounded-xl bg-muted/50 grid place-items-center spring-tap"><Edit3 className="w-4 h-4" /></button>
        <button onClick={remove} className="w-9 h-9 rounded-xl bg-destructive/10 grid place-items-center spring-tap"><Trash2 className="w-4 h-4 text-destructive" /></button>
      </div>

      <motion.h1 initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="font-heading font-bold text-[22px] leading-tight mb-2">{task.title}</motion.h1>

      {/* Status + priority pills */}
      <div className="flex items-center gap-2 flex-wrap mb-4">
        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold ${TONE_CLASS[s.tone]}`}>
          <s.icon className="w-3 h-3" />{s.label}
        </span>
        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold ${TONE_CLASS[p.tone]}`}>
          {p.label} priority
        </span>
        {overdue && <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-destructive/15 text-destructive"><AlertTriangle className="w-3 h-3" />Overdue</span>}
      </div>

      {task.description && <p className="text-[14px] text-foreground/85 leading-relaxed mb-4 whitespace-pre-wrap">{task.description}</p>}

      {/* Meta grid */}
      <div className="grid grid-cols-2 gap-2 mb-4 text-[12px]">
        <Meta icon={Users} label="Assignees" value={(task.assignee_names || []).join(", ") || "Unassigned"} />
        <Meta icon={Calendar} label="Due" value={task.due_date ? `${task.due_date}${overdue ? " (overdue)" : dleft >= 0 ? ` (${dleft}d)` : ""}` : "—"} highlight={overdue} />
        <Meta icon={Clock} label="Started" value={task.start_date || "—"} />
        <Meta icon={Building2} label="Department" value={task.department || "—"} />
        {task.team && <Meta icon={Users} label="Team" value={task.team} />}
        {task.creator_name && <Meta icon={Users} label="Created by" value={task.creator_name} />}
      </div>

      {(task.tags || []).length > 0 && (
        <div className="flex items-center gap-1.5 flex-wrap mb-4">
          <Tag className="w-3.5 h-3.5 text-muted-foreground" />
          {task.tags.map((tg) => <span key={tg} className="px-2 py-0.5 rounded-lg bg-muted/60 text-[11px] text-muted-foreground">{tg}</span>)}
        </div>
      )}

      {/* Progress */}
      <div className="crystal-card p-4 mb-4">
        <TaskProgress percent={task.progress_percent} overdue={overdue} />
      </div>

      {/* Status changer */}
      <div className="crystal-card p-4 mb-4">
        <h3 className="text-[13px] font-heading font-semibold mb-3">Update status</h3>
        <div className="flex gap-1.5 flex-wrap">
          {TASK_STATUSES.filter((st) => !["draft","archived"].includes(st.id)).map((st) => (
            <button key={st.id} onClick={() => changeStatus(st.id)}
              className={`px-3 py-1.5 rounded-lg text-[11px] font-medium spring-tap ${task.status === st.id ? TONE_CLASS[st.tone] : "bg-muted/50 text-muted-foreground"}`}>
              {st.label}
            </button>
          ))}
        </div>
        <div className="flex gap-2 mt-3">
          <button onClick={() => approve.mutateAsync({ task, actor, approved: true })} className="flex-1 h-10 rounded-xl bg-success/15 text-success font-semibold text-[12px] flex items-center justify-center gap-1.5 spring-tap"><CheckCircle2 className="w-4 h-4" />Approve</button>
          <button onClick={() => { const note = prompt("Reason for rejection:"); if (note !== null) approve.mutateAsync({ task, actor, approved: false, note }); }} className="flex-1 h-10 rounded-xl bg-destructive/12 text-destructive font-semibold text-[12px] flex items-center justify-center gap-1.5 spring-tap"><ThumbsDown className="w-4 h-4" />Reject</button>
        </div>
      </div>

      {/* Spark AI assist */}
      <div className="crystal-card p-4 mb-4">
        <div className="flex items-center gap-2 mb-3 text-primary">
          <Wand2 className="w-4 h-4" /><span className="text-[13px] font-heading font-semibold">Bud assistance</span>
        </div>
        <div className="grid grid-cols-3 gap-2 mb-3">
          <AIButton label="Subtasks" onClick={() => runAI("subtasks")} busy={aiBusy} />
          <AIButton label="Status report" onClick={() => runAI("summary")} busy={aiBusy} />
          <AIButton label="Next steps" onClick={() => runAI("next")} busy={aiBusy} />
        </div>
        {aiBusy && <div className="flex items-center gap-2 text-[12px] text-muted-foreground"><Loader2 className="w-3.5 h-3.5 animate-spin" />Bud is thinking…</div>}
        {aiPanel && !aiBusy && (
          <div className="rounded-xl bg-primary/8 p-3">
            {aiPanel.type === "summary" && <p className="text-[13px]">{aiPanel.text}</p>}
            {aiPanel.type === "subtasks" && <ul className="space-y-1">{aiPanel.items.map((it, i) => <li key={i} className="text-[13px] flex gap-2"><Sparkles className="w-3 h-3 text-primary mt-1 shrink-0" />{it}</li>)}</ul>}
            {aiPanel.type === "next" && <ul className="space-y-1">{aiPanel.items.map((it, i) => <li key={i} className="text-[13px] flex gap-2"><span className="text-primary font-bold">{i+1}.</span>{it}</li>)}</ul>}
          </div>
        )}
      </div>

      {/* Checklist + Milestones */}
      <div className="space-y-3 mb-4">
        <TaskChecklist task={task} actor={actor} />
        <TaskMilestones task={task} actor={actor} />
      </div>

      {/* Comments */}
      <div className="mb-4"><TaskComments task={task} actor={actor} /></div>

      {/* Activity */}
      <div className="mb-4"><TaskActivityFeed activity={activity} /></div>

      {(task.attachments || []).length > 0 && (
        <div className="crystal-card p-4 mb-4">
          <h3 className="text-[13px] font-heading font-semibold mb-2">Files</h3>
          <div className="space-y-1.5">
            {task.attachments.map((f, i) => (
              <a key={i} href={f.url} target="_blank" rel="noreferrer" className="block px-3 py-2 rounded-xl bg-muted/40 text-[12px] spring-tap truncate">{f.name || f.url}</a>
            ))}
          </div>
        </div>
      )}

      {editing && <TaskComposer open={editing} onClose={() => setEditing(false)} actor={actor} editTask={task} />}
    </div>
  );
}

function Meta({ icon: Icon, label, value, highlight }) {
  return (
    <div className="flex items-start gap-2">
      <Icon className="w-3.5 h-3.5 text-muted-foreground mt-0.5 shrink-0" />
      <div className="min-w-0">
        <div className="text-[10px] text-muted-foreground">{label}</div>
        <div className={`text-[12px] font-medium truncate ${highlight ? "text-destructive" : ""}`}>{value}</div>
      </div>
    </div>
  );
}

function AIButton({ label, onClick, busy }) {
  return (
    <button onClick={onClick} disabled={busy} className="h-10 rounded-xl bg-muted/50 text-[12px] font-medium spring-tap disabled:opacity-50">{label}</button>
  );
}