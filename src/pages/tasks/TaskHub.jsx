import React, { useState } from "react";
import { motion } from "framer-motion";
import { Plus, Search, Filter, ListChecks } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import TaskCard from "@/components/tasks/TaskCard";
import TaskComposer from "@/components/tasks/TaskComposer";
import EmptyState from "@/components/ui/EmptyState";
import { TASK_STATUSES, TASK_PRIORITIES, TONE_CLASS, statusMeta } from "@/lib/tasks/constants";
import { useTasks } from "@/lib/tasks/useTasks";
import { isOverdue, daysUntilDue } from "@/lib/tasks/constants";

const STATUS_TABS = [
  { id: "all", label: "All" },
  { id: "in_progress", label: "In Progress" },
  { id: "under_review", label: "In Review" },
  { id: "waiting", label: "Waiting" },
  { id: "completed", label: "Done" },
  { id: "overdue", label: "Overdue" },
];

export default function TaskHub() {
  const [user, setUser] = useState(null);
  const [tab, setTab] = useState("all");
  const [search, setSearch] = useState("");
  const [priority, setPriority] = useState("");
  const [composing, setComposing] = useState(false);

  useQuery({
    queryKey: ["currentUser"],
    queryFn: async () => { const u = await base44.auth.me(); setUser(u); return u; },
  });

  const filters = {};
  if (tab !== "all" && tab !== "overdue") filters.status = tab;
  if (priority) filters.priority = priority;
  if (search) filters.search = search;
  const { data: tasks, isLoading } = useTasks(filters);

  const visible = tab === "overdue" ? (tasks || []).filter(isOverdue) : (tasks || []);

  return (
    <div className="min-h-screen max-w-[640px] mx-auto px-5 pt-6 pb-32 safe-area-pt app-content">
      <div className="flex items-center justify-between mb-1">
        <div>
          <h1 className="font-heading font-bold text-[22px] flex items-center gap-2"><ListChecks className="w-5 h-5 text-primary" />Tasks</h1>
          <p className="text-[12px] text-muted-foreground">Assign, track and complete work across your team.</p>
        </div>
        <button onClick={() => setComposing(true)} className="w-10 h-10 rounded-xl bg-primary text-primary-foreground grid place-items-center spring-tap soft-shadow">
          <Plus className="w-5 h-5" />
        </button>
      </div>

      {/* Search */}
      <div className="relative mt-4 mb-3">
        <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
        <input
          value={search} onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by title, assignee, tag, department…"
          className="w-full h-11 pl-10 pr-4 rounded-xl bg-muted/40 border border-border text-[13px] focus:outline-none focus:ring-2 focus:ring-primary/40"
        />
      </div>

      {/* Status tabs */}
      <div className="flex gap-1.5 mb-3 overflow-x-auto no-scrollbar">
        {STATUS_TABS.map((t) => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`px-3 py-1.5 rounded-full text-[12px] font-semibold whitespace-nowrap spring-tap ${tab === t.id ? "bg-primary text-primary-foreground" : "bg-muted/50 text-muted-foreground"}`}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Priority filter */}
      <div className="flex items-center gap-1.5 mb-4 overflow-x-auto no-scrollbar">
        <Filter className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
        <button onClick={() => setPriority("")} className={`px-2.5 py-1 rounded-lg text-[11px] font-medium spring-tap ${!priority ? "bg-foreground text-background" : "bg-muted/50 text-muted-foreground"}`}>Any</button>
        {TASK_PRIORITIES.map((p) => (
          <button key={p.id} onClick={() => setPriority(p.id)} className={`px-2.5 py-1 rounded-lg text-[11px] font-medium spring-tap ${priority === p.id ? TONE_CLASS[p.tone] : "bg-muted/50 text-muted-foreground"}`}>{p.label}</button>
        ))}
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[0,1,2].map((i) => <div key={i} className="h-28 rounded-[28px] shimmer" />)}
        </div>
      ) : visible.length === 0 ? (
        <EmptyState icon={ListChecks} title="No tasks here yet" description={search ? "Try a different search." : "Create your first task — or ask Bud to draft one for you."}
          action={<button onClick={() => setComposing(true)} className="px-5 py-2.5 rounded-full bg-primary text-primary-foreground text-[13px] font-semibold spring-tap">New task</button>} />
      ) : (
        <motion.div layout className="space-y-3">
          {visible.map((t) => <TaskCard key={t.id} task={t} />)}
        </motion.div>
      )}

      <TaskComposer open={composing} onClose={() => setComposing(false)} actor={user} />
    </div>
  );
}