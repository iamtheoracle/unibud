import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Clock, CheckSquare, Users, CalendarDays, BookUser, LifeBuoy, X } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useToast } from "@/components/ui/use-toast";
import { hapticTap } from "@/lib/haptics";
import { useQuery } from "@tanstack/react-query";

const CREAM = "#F7F0E8";
const CREAM_MUTED = "rgba(247, 240, 232, 0.50)";
const ORANGE = "#FF8A2A";

const ACTIONS = [
  { id: "study", icon: Clock, label: "Log Study Hour" },
  { id: "task", icon: CheckSquare, label: "Create Task" },
  { id: "group", icon: Users, label: "Join Group" },
  { id: "plan", icon: CalendarDays, label: "Today's Plan", to: "/timetable" },
  { id: "directory", icon: BookUser, label: "Directory", to: "/directory" },
  { id: "help", icon: LifeBuoy, label: "Help", to: "/help" },
];

export default function QuickActionStrip() {
  const [sheet, setSheet] = useState(null);

  return (
    <>
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar -mx-5 px-5">
        {ACTIONS.map((a) => {
          const Icon = a.icon;
          return (
            <button
              key={a.id}
              onClick={() => {
                hapticTap();
                if (a.to) window.location.href = a.to;
                else setSheet(a.id);
              }}
              className="flex items-center gap-2 h-[44px] px-4 rounded-[16px] shrink-0 spring-tap"
              style={{
                background: "rgba(44, 33, 26, 0.6)",
                border: "1px solid rgba(255,255,255,0.05)",
              }}
            >
              <Icon className="w-[16px] h-[16px]" strokeWidth={2} style={{ color: ORANGE }} />
              <span className="text-[13px] font-semibold whitespace-nowrap" style={{ color: CREAM }}>{a.label}</span>
            </button>
          );
        })}
      </div>

      <AnimatePresence>
        {sheet && <ActionSheet sheet={sheet} onClose={() => setSheet(null)} />}
      </AnimatePresence>
    </>
  );
}

function ActionSheet({ sheet, onClose }) {
  const { toast } = useToast();
  const { data: user } = useQuery({ queryKey: ["currentUser"], queryFn: () => base44.auth.me() });

  const titles = { study: "Log Study Hour", task: "Create Task", group: "Join Group" };

  return (
    <motion.div
      className="fixed inset-0 z-[60] flex items-end justify-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="absolute inset-0 bg-black/60" style={{ backdropFilter: "blur(4px)" }} onClick={onClose} />
      <motion.div
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", stiffness: 360, damping: 36 }}
        className="relative w-full max-w-[520px] rounded-t-[28px] p-5 pb-8 safe-area-pb"
        style={{ background: "rgba(44, 33, 26, 0.95)", backdropFilter: "blur(40px)", border: "1px solid rgba(255,255,255,0.06)", borderBottom: "none" }}
      >
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-[18px] font-bold" style={{ color: CREAM }}>{titles[sheet]}</h2>
          <button onClick={onClose} className="w-8 h-8 rounded-full grid place-items-center" style={{ background: "rgba(255,255,255,0.04)" }}>
            <X className="w-4 h-4" strokeWidth={2} style={{ color: CREAM_MUTED }} />
          </button>
        </div>
        {sheet === "study" && <StudyForm onClose={onClose} toast={toast} />}
        {sheet === "task" && <TaskForm onClose={onClose} toast={toast} user={user} />}
        {sheet === "group" && <GroupForm onClose={onClose} />}
      </motion.div>
    </motion.div>
  );
}

function Field({ label, ...props }) {
  return (
    <div>
      <label className="text-[12px] font-medium mb-1.5 block" style={{ color: CREAM_MUTED }}>{label}</label>
      <input {...props} className="w-full h-[48px] px-4 rounded-[14px] text-[15px] outline-none" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)", color: CREAM }} />
    </div>
  );
}

function PrimaryButton({ children, onClick, disabled }) {
  return (
    <button onClick={onClick} disabled={disabled} className="w-full h-[52px] rounded-[16px] text-[15px] font-semibold spring-tap disabled:opacity-50" style={{ background: ORANGE, color: "#1A1006" }}>
      {children}
    </button>
  );
}

function StudyForm({ onClose, toast }) {
  const [course, setCourse] = useState("");
  const [duration, setDuration] = useState(60);
  const [saving, setSaving] = useState(false);

  const save = async () => {
    if (!course.trim()) return toast({ title: "Enter a course", variant: "destructive" });
    setSaving(true);
    try {
      await base44.entities.StudySession.create({ title: `Study: ${course}`, course_code: course, duration_minutes: parseInt(duration), started_at: new Date().toISOString() });
      toast({ title: "Study hour logged ✓" });
      onClose();
    } catch { toast({ title: "Could not save", variant: "destructive" }); }
    setSaving(false);
  };

  return (
    <div className="space-y-4">
      <Field label="Course" placeholder="e.g. CSC 301" value={course} onChange={(e) => setCourse(e.target.value)} />
      <div>
        <label className="text-[12px] font-medium mb-1.5 block" style={{ color: CREAM_MUTED }}>Duration (minutes)</label>
        <div className="flex items-center gap-3">
          <button onClick={() => setDuration((d) => Math.max(15, d - 15))} className="w-12 h-12 rounded-[14px] grid place-items-center text-xl font-bold" style={{ background: "rgba(255,255,255,0.04)", color: CREAM }}>−</button>
          <div className="flex-1 text-center text-[28px] font-bold tabular-nums" style={{ color: CREAM }}>{duration}</div>
          <button onClick={() => setDuration((d) => d + 15)} className="w-12 h-12 rounded-[14px] grid place-items-center text-xl font-bold" style={{ background: "rgba(255,255,255,0.04)", color: CREAM }}>+</button>
        </div>
      </div>
      <PrimaryButton onClick={save} disabled={saving}>{saving ? "Saving…" : "Log Study Hour"}</PrimaryButton>
    </div>
  );
}

function TaskForm({ onClose, toast, user }) {
  const [title, setTitle] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [priority, setPriority] = useState("medium");
  const [saving, setSaving] = useState(false);
  const priorities = [{ k: "low", l: "Low" }, { k: "medium", l: "Medium" }, { k: "high", l: "High" }, { k: "urgent", l: "Urgent" }];

  const save = async () => {
    if (!title.trim()) return toast({ title: "Enter a title", variant: "destructive" });
    setSaving(true);
    try {
      await base44.entities.TaskManagement.create({ title, task_type: "custom", status: "draft", priority, due_date: dueDate || undefined, member_ids: user?.id ? [user.id] : [] });
      toast({ title: "Task created ✓" });
      onClose();
    } catch { toast({ title: "Could not create task", variant: "destructive" }); }
    setSaving(false);
  };

  return (
    <div className="space-y-4">
      <Field label="Title" placeholder="Task title" value={title} onChange={(e) => setTitle(e.target.value)} />
      <Field label="Due Date" type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
      <div>
        <label className="text-[12px] font-medium mb-1.5 block" style={{ color: CREAM_MUTED }}>Priority</label>
        <div className="flex gap-2">
          {priorities.map((p) => (
            <button key={p.k} onClick={() => setPriority(p.k)} className="flex-1 h-[44px] rounded-[12px] text-[13px] font-semibold spring-tap" style={priority === p.k ? { background: ORANGE, color: "#1A1006" } : { background: "rgba(255,255,255,0.04)", color: CREAM_MUTED }}>{p.l}</button>
          ))}
        </div>
      </div>
      <PrimaryButton onClick={save} disabled={saving}>{saving ? "Creating…" : "Create Task"}</PrimaryButton>
    </div>
  );
}

function GroupForm({ onClose }) {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const { data: groups, isLoading } = useQuery({ queryKey: ["quick-groups"], queryFn: () => base44.entities.StudyGroup.list("-created_date", 10) });
  const filtered = (groups || []).filter((g) => !query || (g.name || g.title || "").toLowerCase().includes(query.toLowerCase()));

  return (
    <div className="space-y-4">
      <Field label="Search" placeholder="Search by name or invite code" value={query} onChange={(e) => setQuery(e.target.value)} />
      <div className="space-y-2 max-h-[320px] overflow-y-auto no-scrollbar">
        {isLoading ? [0, 1, 2].map((i) => <div key={i} className="h-16 rounded-[14px] shimmer" style={{ background: "rgba(255,255,255,0.03)" }} />) :
         filtered.length > 0 ? filtered.map((g) => (
          <div key={g.id} className="flex items-center gap-3 p-3 rounded-[14px]" style={{ background: "rgba(255,255,255,0.03)" }}>
            <div className="w-10 h-10 rounded-[12px] grid place-items-center" style={{ background: "rgba(255,138,42,0.10)" }}>
              <Users className="w-5 h-5" style={{ color: ORANGE }} strokeWidth={2} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[14px] font-semibold truncate" style={{ color: CREAM }}>{g.name || g.title}</p>
              <p className="text-[12px]" style={{ color: CREAM_MUTED }}>{g.members_count || 0} members</p>
            </div>
            <button onClick={() => { onClose(); navigate(`/study-groups/${g.id}`); }} className="px-4 h-9 rounded-full text-[13px] font-bold spring-tap" style={{ background: ORANGE, color: "#1A1006" }}>Join</button>
          </div>
        )) : <p className="text-center py-8 text-[14px]" style={{ color: CREAM_MUTED }}>No groups found</p>}
      </div>
    </div>
  );
}