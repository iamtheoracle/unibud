import React, { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ListChecks, Flame, TrendingUp, ChevronRight, Megaphone } from "lucide-react";
import { base44 } from "@/api/base44Client";
import OperatorTaskCard from "@/components/operator/OperatorTaskCard";

export default function OperatorHome() {
  const navigate = useNavigate();
  const { data: user } = useQuery({ queryKey: ["currentUser"], queryFn: () => base44.auth.me(), retry: false });
  const { data: tasks } = useQuery({
    queryKey: ["operatorAssignments"],
    queryFn: () => base44.entities.OperatorAssignment.filter({ assigned_to_id: user?.id }, "-created_date", 100),
    enabled: !!user?.id,
  });

  const my = tasks || [];
  const today = useMemo(() => {
    const start = new Date(); start.setHours(0, 0, 0, 0);
    const end = new Date(); end.setHours(23, 59, 59, 999);
    return my.filter((t) => t.deadline && new Date(t.deadline) >= start && new Date(t.deadline) <= end && t.status !== "completed");
  }, [my]);
  const priority = useMemo(() => my.filter((t) => ["critical", "high"].includes(t.priority) && !["completed", "rejected", "archived"].includes(t.status)), [my]);
  const active = useMemo(() => my.filter((t) => ["accepted", "in_progress", "paused"].includes(t.status)), [my]);
  const completed = useMemo(() => my.filter((t) => t.status === "completed"), [my]);
  const recent = useMemo(() => [...my].sort((a, b) => new Date(b.updated_date || 0) - new Date(a.updated_date || 0)).slice(0, 4), [my]);

  const completionRate = my.length ? Math.round((completed.length / my.length) * 100) : 0;

  const { data: announcements } = useQuery({
    queryKey: ["staffAnnouncements"],
    queryFn: () => base44.entities.StaffAnnouncement.list("-created_date", 3),
    retry: false,
  });

  return (
    <div className="space-y-5 mt-2">
      {/* Performance summary */}
      <div className="grid grid-cols-3 gap-2.5">
        <StatCard icon={ListChecks} value={active.length} label="Active" tint="bg-primary/12 text-primary" onClick={() => navigate("/operator/tasks")} />
        <StatCard icon={Flame} value={priority.length} label="Priority" tint="bg-warning/12 text-warning" onClick={() => navigate("/operator/tasks")} />
        <StatCard icon={TrendingUp} value={`${completionRate}%`} label="Completion" tint="bg-success/12 text-success" />
      </div>

      {/* Today's tasks */}
      <Section title="Today's Tasks" onMore={() => navigate("/operator/tasks")}>
        {today.length === 0 ? (
          <Empty text="No tasks due today." />
        ) : (
          <div className="space-y-2.5">{today.slice(0, 3).map((t, i) => <OperatorTaskCard key={t.id} task={t} index={i} />)}</div>
        )}
      </Section>

      {/* Priority tasks */}
      <Section title="Priority Tasks" onMore={() => navigate("/operator/tasks")}>
        {priority.length === 0 ? (
          <Empty text="No priority tasks right now." />
        ) : (
          <div className="space-y-2.5">{priority.slice(0, 3).map((t, i) => <OperatorTaskCard key={t.id} task={t} index={i} />)}</div>
        )}
      </Section>

      {/* Announcements */}
      <Section title="Announcements">
        {(announcements || []).length === 0 ? (
          <Empty text="No announcements." />
        ) : (
          <div className="space-y-2.5">
            {(announcements || []).map((a, i) => (
              <motion.div key={a.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                className="rounded-[18px] p-3.5 glass flex items-start gap-3">
                <div className="w-9 h-9 rounded-[12px] bg-info/12 text-info flex items-center justify-center flex-shrink-0">
                  <Megaphone className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-heading font-semibold text-[12.5px] text-foreground">{a.title}</p>
                  <p className="text-[11px] text-muted-foreground mt-0.5 line-clamp-2">{a.message || a.content || ""}</p>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </Section>

      {/* Recent updates */}
      <Section title="Recent Updates">
        {recent.length === 0 ? <Empty text="No recent activity." /> : (
          <div className="space-y-2.5">{recent.map((t, i) => <OperatorTaskCard key={t.id} task={t} index={i} />)}</div>
        )}
      </Section>
    </div>
  );
}

function Section({ title, onMore, children }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-2 px-1">
        <p className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground/70">{title}</p>
        {onMore && <button onClick={onMore} className="flex items-center gap-0.5 text-[11px] font-semibold text-primary spring-tap">More <ChevronRight className="w-3 h-3" /></button>}
      </div>
      {children}
    </div>
  );
}

function StatCard({ icon: Icon, value, label, tint, onClick }) {
  return (
    <button onClick={onClick} disabled={!onClick} className="rounded-[18px] p-3 glass spring-tap text-left disabled:opacity-100">
      <div className={`w-8 h-8 rounded-[10px] flex items-center justify-center ${tint} mb-2`}>
        <Icon className="w-4 h-4" />
      </div>
      <p className="font-heading font-bold text-[18px] text-foreground leading-none">{value}</p>
      <p className="text-[10px] text-muted-foreground mt-1">{label}</p>
    </button>
  );
}

function Empty({ text }) {
  return <div className="rounded-[18px] p-4 glass text-center"><p className="text-[11px] text-muted-foreground">{text}</p></div>;
}