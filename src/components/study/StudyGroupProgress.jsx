import React, { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { base44 } from "@/api/base44Client";
import {
  CheckCircle2, Circle, Clock, FileText, StickyNote, TrendingUp,
  Calendar, ListTodo, Layout, Sparkles, Award, Users,
} from "lucide-react";

const EASE = [0.16, 1, 0.3, 1];

export default function StudyGroupProgress({ groupId, group }) {
  const [view, setView] = useState("board");

  const { data: tasks } = useQuery({
    queryKey: ["groupTasksProgress", groupId],
    queryFn: () => base44.entities.StudyGroupTask.filter({ group_id: groupId }, "due_date", 100),
  });

  const { data: resources } = useQuery({
    queryKey: ["groupResourcesProgress", groupId],
    queryFn: () => base44.entities.StudyGroupResource.filter({ study_group_id: groupId }, "-created_date", 200),
  });

  const { data: messages } = useQuery({
    queryKey: ["groupMessagesProgress", groupId],
    queryFn: () => base44.entities.StudyGroupMessage.filter({ group_id: groupId }, "-created_date", 50),
  });

  const { data: achievements } = useQuery({
    queryKey: ["groupAchievements", groupId],
    queryFn: () => base44.entities.StudentAchievement.filter({ related_course: group?.course_code }, "-date_earned", 20),
  });

  const metrics = useMemo(() => {
    const t = tasks || [];
    const r = resources || [];
    const m = messages || [];
    const a = achievements || [];

    const completed = t.filter((x) => x.status === "done");
    const active = t.filter((x) => x.status === "todo" || x.status === "in_progress");
    const upcoming = t.filter((x) => x.due_date && new Date(x.due_date) >= new Date()).sort((a, b) => new Date(a.due_date) - new Date(b.due_date));
    const notes = r.filter((x) => x.file_type === "notes" || x.file_type === "study_guide");
    const completionRate = t.length > 0 ? Math.round((completed.length / t.length) * 100) : 0;

    return {
      completed: completed.length,
      active: active.length,
      upcoming: upcoming.slice(0, 5),
      filesContributed: r.length,
      notesShared: notes.length,
      messagesExchanged: m.length,
      achievements: a.length,
      completionRate,
      totalTasks: t.length,
    };
  }, [tasks, resources, messages, achievements]);

  const budSummary = useMemo(() => {
    const parts = [];
    if (metrics.completionRate > 0) parts.push(`${metrics.completionRate}% of tasks completed`);
    if (metrics.active > 0) parts.push(`${metrics.active} active task${metrics.active !== 1 ? "s" : ""}`);
    if (metrics.upcoming.length > 0) {
      const next = metrics.upcoming[0];
      const days = Math.ceil((new Date(next.due_date) - new Date()) / (1000 * 60 * 60 * 24));
      parts.push(`next deadline in ${days} day${days !== 1 ? "s" : ""}`);
    }
    if (metrics.filesContributed > 0) parts.push(`${metrics.filesContributed} resources shared`);
    return parts.join(" · ") || "No progress data yet";
  }, [metrics]);

  const todoTasks = (tasks || []).filter((t) => t.status === "todo");
  const inProgressTasks = (tasks || []).filter((t) => t.status === "in_progress");
  const doneTasks = (tasks || []).filter((t) => t.status === "done");

  return (
    <div className="space-y-3">
      {/* Bud summary */}
      <div className="glass-card p-3.5 flex items-start gap-2.5">
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-chocolate flex items-center justify-center flex-shrink-0">
          <Sparkles className="w-4 h-4 text-white" />
        </div>
        <div className="flex-1">
          <p className="text-[10px] font-bold text-primary uppercase tracking-wider mb-0.5">Bud Summary</p>
          <p className="text-[11px] text-foreground/80 leading-relaxed">{budSummary}</p>
        </div>
      </div>

      {/* Completion ring */}
      <div className="glass-card p-4 flex items-center gap-4">
        <div className="relative w-16 h-16 flex-shrink-0">
          <svg className="w-16 h-16 -rotate-90" viewBox="0 0 64 64">
            <circle cx="32" cy="32" r="28" fill="none" stroke="hsl(var(--muted))" strokeWidth="6" />
            <circle cx="32" cy="32" r="28" fill="none" stroke="hsl(var(--primary))" strokeWidth="6"
              strokeDasharray={`${2 * Math.PI * 28}`} strokeDashoffset={`${2 * Math.PI * 28 * (1 - metrics.completionRate / 100)}`}
              strokeLinecap="round" className="transition-all duration-700" />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-[14px] font-bold text-foreground">{metrics.completionRate}%</span>
          </div>
        </div>
        <div className="flex-1">
          <p className="text-[12px] font-bold text-foreground">Project Completion</p>
          <p className="text-[10px] text-muted-foreground">{metrics.completed} of {metrics.totalTasks} tasks done</p>
        </div>
      </div>

      {/* Metric grid */}
      <div className="grid grid-cols-2 gap-2">
        <MetricCard icon={CheckCircle2} value={metrics.completed} label="Completed" color="text-success" />
        <MetricCard icon={Circle} value={metrics.active} label="Active" color="text-primary" />
        <MetricCard icon={FileText} value={metrics.filesContributed} label="Files Shared" color="text-chocolate" />
        <MetricCard icon={StickyNote} value={metrics.notesShared} label="Notes" color="text-info" />
        <MetricCard icon={Calendar} value={metrics.messagesExchanged} label="Messages" color="text-muted-foreground" />
        <MetricCard icon={Award} value={metrics.achievements} label="Achievements" color="text-primary" />
      </div>

      {/* Upcoming deadlines */}
      {metrics.upcoming.length > 0 && (
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground px-1 mb-1.5 flex items-center gap-1">
            <Clock className="w-3 h-3" /> Upcoming Deadlines
          </p>
          <div className="space-y-1.5">
            {metrics.upcoming.map((task) => {
              const days = Math.ceil((new Date(task.due_date) - new Date()) / (1000 * 60 * 60 * 24));
              return (
                <div key={task.id} className="glass-card p-2.5 flex items-center gap-2">
                  <div className={`w-1.5 h-1.5 rounded-full ${days <= 1 ? "bg-error" : days <= 3 ? "bg-warning" : "bg-primary"}`} />
                  <p className="text-[11px] font-medium text-foreground flex-1 truncate">{task.title}</p>
                  <span className="text-[9px] font-bold text-muted-foreground">{days <= 0 ? "Due today" : `${days}d`}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* View toggle */}
      <div className="flex gap-1 p-0.5 bg-muted/40 rounded-[10px]">
        <button onClick={() => setView("board")} className={`flex-1 py-1.5 rounded-[8px] text-[10px] font-semibold flex items-center justify-center gap-1 ${view === "board" ? "bg-card text-foreground" : "text-muted-foreground"}`}>
          <Layout className="w-3 h-3" /> Board
        </button>
        <button onClick={() => setView("timeline")} className={`flex-1 py-1.5 rounded-[8px] text-[10px] font-semibold flex items-center justify-center gap-1 ${view === "timeline" ? "bg-card text-foreground" : "text-muted-foreground"}`}>
          <ListTodo className="w-3 h-3" /> Timeline
        </button>
      </div>

      {/* Board view */}
      {view === "board" && (
        <div className="grid grid-cols-3 gap-1.5">
          <BoardColumn title="To Do" tasks={todoTasks} color="bg-muted/40" />
          <BoardColumn title="Active" tasks={inProgressTasks} color="bg-primary/10" />
          <BoardColumn title="Done" tasks={doneTasks} color="bg-success/10" />
        </div>
      )}

      {/* Timeline view */}
      {view === "timeline" && (
        <div className="space-y-1.5">
          {(tasks || []).length === 0 ? (
            <p className="text-[11px] text-muted-foreground text-center py-4">No tasks yet</p>
          ) : (
            [...(tasks || [])].sort((a, b) => new Date(b.created_date) - new Date(a.created_date)).map((task, i) => (
              <motion.div
                key={task.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.03, duration: 0.25, ease: EASE }}
                className="glass-card p-2.5 flex items-center gap-2"
              >
                <div className="flex flex-col items-center">
                  <div className={`w-2 h-2 rounded-full ${task.status === "done" ? "bg-success" : task.status === "in_progress" ? "bg-primary" : "bg-muted-foreground"}`} />
                  {i < (tasks || []).length - 1 && <div className="w-px h-6 bg-border/30 mt-1" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-[11px] font-medium truncate ${task.status === "done" ? "text-muted-foreground line-through" : "text-foreground"}`}>{task.title}</p>
                  {task.due_date && <p className="text-[9px] text-muted-foreground">{new Date(task.due_date).toLocaleDateString("en", { month: "short", day: "numeric" })}</p>}
                </div>
              </motion.div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

function MetricCard({ icon: Icon, value, label, color }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="glass-card p-2.5 flex items-center gap-2"
    >
      <Icon className={`w-4 h-4 ${color}`} strokeWidth={2} />
      <div>
        <p className="text-[14px] font-bold text-foreground tabular-nums">{value}</p>
        <p className="text-[8px] text-muted-foreground uppercase tracking-wide">{label}</p>
      </div>
    </motion.div>
  );
}

function BoardColumn({ title, tasks, color }) {
  return (
    <div className={`rounded-[12px] ${color} p-1.5 min-h-[80px]`}>
      <p className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground mb-1.5 px-1">{title} · {tasks.length}</p>
      <div className="space-y-1">
        {tasks.slice(0, 5).map((task) => (
          <div key={task.id} className="bg-card rounded-[8px] p-1.5 border border-border/20">
            <p className="text-[9px] font-medium text-foreground line-clamp-2">{task.title}</p>
            {task.due_date && <p className="text-[7px] text-muted-foreground mt-0.5">{new Date(task.due_date).toLocaleDateString("en", { month: "short", day: "numeric" })}</p>}
          </div>
        ))}
        {tasks.length === 0 && <p className="text-[8px] text-muted-foreground/50 text-center py-2">—</p>}
      </div>
    </div>
  );
}