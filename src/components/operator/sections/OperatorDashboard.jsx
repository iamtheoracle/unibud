import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { SectionHeader, Panel, StatCard, StatusPill, EmptyState, LoadingState } from "@/components/management/management-ui";
import { CheckSquare, CalendarClock, ClipboardCheck, Flame, Bell, CalendarDays, TrendingUp, Clock } from "lucide-react";

const todayStr = () => new Date().toISOString().slice(0, 10);
const safe = async (name, instId) => { try { return (await base44.entities[name].filter({ institution_id: instId }, "-created_date", 300)) || []; } catch { try { return (await base44.entities[name].list("-created_date", 300)) || []; } catch { return []; } } };

export default function OperatorDashboard({ institutionId, user }) {
  const [data, setData] = useState(null);

  useEffect(() => {
    (async () => {
      const [tasks, notifs] = await Promise.all([safe("ManagementTask", institutionId), (async () => { try { return (await base44.entities.Notification.list("-created_date", 60)) || []; } catch { return []; } })()]);
      const me = user?.full_name;
      const mine = tasks.filter((t) => t.assignee === me || t.created_by_id === user.id);
      const dueToday = tasks.filter((t) => t.due_date === todayStr() && t.status !== "completed" && t.status !== "archived");
      const pendingApprovals = tasks.filter((t) => t.type === "approval" && t.status === "pending");
      const priority = tasks.filter((t) => ["high", "urgent"].includes(t.priority) && t.status !== "completed" && t.status !== "archived");
      const completedToday = tasks.filter((t) => t.status === "completed" && t.updated_date && t.updated_date.slice(0, 10) === todayStr());
      const upcoming = tasks.filter((t) => t.due_date && t.status !== "completed" && t.status !== "archived").sort((a, b) => new Date(a.due_date) - new Date(b.due_date)).slice(0, 6);
      setData({ mine, dueToday, pendingApprovals, priority, completedToday, notifs: notifs.slice(0, 5), upcoming });
    })();
  }, [institutionId, user]);

  if (!data) return <LoadingState />;

  return (
    <div>
      <SectionHeader title="Dashboard" desc="Your assigned work, priorities, approvals, notifications, calendar and recent completions." />

      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 mb-4">
        <StatCard icon={CheckSquare} label="Assigned Tasks" value={data.mine.length} tone="primary" />
        <StatCard icon={CalendarClock} label="Today's Work" value={data.dueToday.length} tone="info" />
        <StatCard icon={ClipboardCheck} label="Pending Approvals" value={data.pendingApprovals.length} tone="warn" />
        <StatCard icon={Flame} label="Priority Items" value={data.priority.length} tone="danger" />
        <StatCard icon={TrendingUp} label="Completed Today" value={data.completedToday.length} tone="success" />
      </div>

      <div className="grid lg:grid-cols-2 gap-4 mb-4">
        <Panel title="Today's Work & Upcoming" icon={CalendarDays}>
          {data.upcoming.length === 0 ? <EmptyState icon={CalendarDays} message="No upcoming tasks." /> : (
            <div className="space-y-2.5">{data.upcoming.map((t) => (
              <div key={t.id} className="flex items-center gap-2.5">
                <Clock className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                <div className="min-w-0 flex-1"><p className="text-[13px] font-medium truncate">{t.title}</p><p className="text-[11px] text-muted-foreground">{t.due_date} · {t.assignee || "Unassigned"}</p></div>
                <StatusPill status={t.status} />
              </div>
            ))}</div>
          )}
        </Panel>
        <Panel title="Notifications" icon={Bell}>
          {data.notifs.length === 0 ? <EmptyState icon={Bell} message="No notifications." /> : (
            <div className="space-y-2.5">{data.notifs.map((n) => (
              <div key={n.id} className="flex gap-2.5"><div className="w-1 rounded-full bg-primary shrink-0" /><div className="min-w-0"><p className="text-[13px] font-medium truncate">{n.title}</p><p className="text-[11px] text-muted-foreground truncate">{n.message}</p></div></div>
            ))}</div>
          )}
        </Panel>
      </div>

      <Panel title="Recently Completed Tasks" icon={CheckSquare}>
        {data.completedToday.length === 0 ? <EmptyState icon={CheckSquare} message="No tasks completed today." /> : (
          <div className="space-y-2">{data.completedToday.map((t) => (
            <div key={t.id} className="flex items-center gap-2.5"><CheckSquare className="w-3.5 h-3.5 text-success shrink-0" /><p className="text-[13px] flex-1 truncate">{t.title}</p><span className="text-[11px] text-muted-foreground">{t.assignee || ""}</span></div>
          ))}</div>
        )}
      </Panel>
    </div>
  );
}