import React, { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  MessagesSquare, Users, CheckCircle2, ListChecks, Send,
  FolderKanban, Activity as ActivityIcon, Ban, Eye,
} from "lucide-react";
import { base44 } from "@/api/base44Client";

const EASE = [0.16, 1, 0.3, 1];
const num = (n) => (n || 0).toLocaleString();

const CONV_TYPES = ["direct", "study_group", "course", "lecturer", "mentor", "club", "community"];
const WS_TYPES = ["study_group", "project", "research", "club", "community", "department", "course", "leadership", "personal", "team"];
const ITEM_STATUS = ["open", "in_progress", "blocked", "needs_review", "approved", "done"];
const ACT_ACTIONS = ["created", "updated", "completed", "commented", "approved", "assigned", "joined", "mentioned"];

/**
 * CollaborationIntelligence — Oracle's analytics surface for the Spark
 * collaboration layer. Aggregates conversations, messages, workspaces and
 * collaboration items so platform admins can see participation, task
 * throughput and workspace health across UNIBUD.
 */
export default function CollaborationIntelligence({ module }) {
  const { data: convs } = useQuery({ queryKey: ["oracleConvs"], queryFn: () => base44.entities.Conversation.list("-last_message_at", 200) });
  const { data: msgs } = useQuery({ queryKey: ["oracleMsgs"], queryFn: () => base44.entities.Message.list("-created_date", 200) });
  const { data: workspaces } = useQuery({ queryKey: ["oracleWs"], queryFn: () => base44.entities.Workspace.list("-created_date", 200) });
  const { data: items } = useQuery({ queryKey: ["oracleCollabItems"], queryFn: () => base44.entities.CollaborationItem.list("-created_date", 200) });
  const { data: activity } = useQuery({ queryKey: ["oracleCollabAct"], queryFn: () => base44.entities.CollaborationActivity.list("-created_date", 200) });

  const cv = convs || [], ms = msgs || [], ws = workspaces || [], it = items || [], ac = activity || [];
  const loading = convs === undefined && msgs === undefined && workspaces === undefined && items === undefined && activity === undefined;

  const stats = useMemo(() => {
    const activeWs = ws.filter((w) => w.status === "active").length;
    const archivedWs = ws.filter((w) => w.status === "archived").length;
    const completedWs = ws.filter((w) => w.status === "completed").length;
    const avgProgress = ws.length ? Math.round(ws.reduce((a, w) => a + (w.progress || 0), 0) / ws.length) : 0;
    const tasksDone = it.filter((i) => i.status === "done").length;
    const tasksOpen = it.filter((i) => i.status === "open").length;
    const tasksBlocked = it.filter((i) => i.status === "blocked").length;
    const activeUsers = new Set([...ms.map((m) => m.author_id), ...ws.flatMap((w) => w.member_ids || [])].filter(Boolean));
    return { activeWs, archivedWs, completedWs, avgProgress, tasksDone, tasksOpen, tasksBlocked, activeUsers: activeUsers.size };
  }, [cv, ms, ws, it]);

  const byConvType = useMemo(() => CONV_TYPES.map((t) => ({ label: t.replace(/_/g, " "), value: cv.filter((c) => c.type === t).length })).filter((t) => t.value > 0), [cv]);
  const byWsType = useMemo(() => WS_TYPES.map((t) => ({ label: t.replace(/_/g, " "), value: ws.filter((w) => w.type === t).length })).filter((t) => t.value > 0), [ws]);
  const byItemStatus = useMemo(() => ITEM_STATUS.map((s) => ({ label: s.replace(/_/g, " "), value: it.filter((i) => i.status === s).length })), [it]);
  const byAction = useMemo(() => ACT_ACTIONS.map((a) => ({ label: a, value: ac.filter((x) => x.action === a).length })).filter((a) => a.value > 0), [ac]);

  const maxConv = Math.max(1, ...byConvType.map((t) => t.value));
  const maxWs = Math.max(1, ...byWsType.map((t) => t.value));
  const maxStatus = Math.max(1, ...byItemStatus.map((s) => s.value));
  const maxAction = Math.max(1, ...byAction.map((a) => a.value));
  const taskCompletion = it.length ? Math.round((stats.tasksDone / it.length) * 100) : 0;

  if (loading) return <div className="space-y-3">{[1, 2, 3].map((i) => <div key={i} className="h-24 rounded-[20px] glass-card shimmer" />)}</div>;

  const empty = cv.length === 0 && ms.length === 0 && ws.length === 0;

  return (
    <div className="space-y-5">
      <header>
        <h1 className="font-heading font-extrabold text-[20px] text-foreground flex items-center gap-2"><Users className="w-5 h-5 text-primary" /> {module?.label || "Collaboration Intelligence"}</h1>
        <p className="text-[12px] text-muted-foreground mt-1">{module?.desc || "Participation, task throughput and workspace health."}</p>
      </header>

      {empty ? (
        <div className="glass-card p-8 text-center">
          <Users className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
          <p className="text-[13px] font-semibold text-foreground">No collaboration yet</p>
          <p className="text-[12px] text-muted-foreground mt-1 max-w-[280px] mx-auto">Once conversations, study groups and shared workspaces start forming, participation and task metrics will appear here.</p>
        </div>
      ) : (
        <>
          {/* Participation KPIs */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <Kpi icon={MessagesSquare} value={num(cv.length)} label="Conversations" color="text-primary" />
            <Kpi icon={Send} value={num(ms.length)} label="Messages sent" color="text-accent" />
            <Kpi icon={Users} value={num(stats.activeUsers)} label="Active collaborators" color="text-success" />
            <Kpi icon={FolderKanban} value={num(stats.activeWs)} label="Active workspaces" color="text-warning" />
          </div>

          {/* Task throughput */}
          <section className="glass-card p-4">
            <div className="flex items-center justify-between mb-3">
              <p className="text-[12px] font-semibold text-foreground">Task throughput</p>
              <span className="text-[12px] font-bold text-success">{taskCompletion}% complete</span>
            </div>
            <div className="space-y-2.5">
              {byItemStatus.map((s, i) => (
                <div key={s.label} className="flex items-center gap-3">
                  <span className="text-[11px] font-medium text-muted-foreground w-20 capitalize">{s.label}</span>
                  <div className="flex-1 h-2.5 rounded-full bg-muted/50 overflow-hidden">
                    <motion.div initial={{ width: 0 }} animate={{ width: `${(s.value / maxStatus) * 100}%` }} transition={{ delay: i * 0.05, duration: 0.6, ease: EASE }} className={`h-full rounded-full ${s.label === "done" ? "bg-success" : s.label === "blocked" ? "bg-error" : s.label === "in progress" ? "bg-primary" : s.label === "needs review" || s.label === "approved" ? "bg-accent" : "bg-muted-foreground"}`} />
                  </div>
                  <span className="text-[11px] font-semibold text-foreground tabular-nums w-8 text-right">{s.value}</span>
                </div>
              ))}
            </div>
          </section>

          <div className="grid grid-cols-3 gap-2.5">
            <Kpi icon={CheckCircle2} value={num(stats.tasksDone)} label="Tasks done" color="text-success" small />
            <Kpi icon={ListChecks} value={num(stats.tasksOpen)} label="Tasks open" color="text-primary" small />
            <Kpi icon={Ban} value={num(stats.tasksBlocked)} label="Blocked" color="text-error" small />
          </div>

          {/* Conversations by type */}
          {byConvType.length > 0 && (
            <section className="glass-card p-4">
              <p className="text-[12px] font-semibold text-foreground mb-3">Conversations by type</p>
              <div className="space-y-2.5">
                {byConvType.map((t, i) => (
                  <div key={t.label} className="flex items-center gap-3">
                    <span className="text-[11px] font-medium text-muted-foreground w-20 capitalize truncate">{t.label}</span>
                    <div className="flex-1 h-2.5 rounded-full bg-muted/50 overflow-hidden">
                      <motion.div initial={{ width: 0 }} animate={{ width: `${(t.value / maxConv) * 100}%` }} transition={{ delay: i * 0.05, duration: 0.6, ease: EASE }} className="h-full rounded-full bg-primary" />
                    </div>
                    <span className="text-[11px] font-semibold text-foreground tabular-nums w-8 text-right">{t.value}</span>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Workspaces by type */}
          {byWsType.length > 0 && (
            <section className="glass-card p-4">
              <p className="text-[12px] font-semibold text-foreground mb-3">Workspaces by type</p>
              <div className="space-y-2.5">
                {byWsType.map((t, i) => (
                  <div key={t.label} className="flex items-center gap-3">
                    <span className="text-[11px] font-medium text-muted-foreground w-20 capitalize truncate">{t.label}</span>
                    <div className="flex-1 h-2.5 rounded-full bg-muted/50 overflow-hidden">
                      <motion.div initial={{ width: 0 }} animate={{ width: `${(t.value / maxWs) * 100}%` }} transition={{ delay: i * 0.05, duration: 0.6, ease: EASE }} className="h-full rounded-full bg-accent" />
                    </div>
                    <span className="text-[11px] font-semibold text-foreground tabular-nums w-8 text-right">{t.value}</span>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Recent activity */}
          {byAction.length > 0 && (
            <section className="glass-card p-4">
              <p className="text-[12px] font-semibold text-foreground flex items-center gap-1.5 mb-3"><ActivityIcon className="w-3.5 h-3.5 text-primary" /> Recent activity</p>
              <div className="space-y-2.5">
                {byAction.map((a, i) => (
                  <div key={a.label} className="flex items-center gap-3">
                    <span className="text-[11px] font-medium text-muted-foreground w-20 capitalize">{a.label}</span>
                    <div className="flex-1 h-2.5 rounded-full bg-muted/50 overflow-hidden">
                      <motion.div initial={{ width: 0 }} animate={{ width: `${(a.value / maxAction) * 100}%` }} transition={{ delay: i * 0.05, duration: 0.6, ease: EASE }} className="h-full rounded-full bg-success" />
                    </div>
                    <span className="text-[11px] font-semibold text-foreground tabular-nums w-8 text-right">{a.value}</span>
                  </div>
                ))}
              </div>
            </section>
          )}

          <div className="grid grid-cols-2 gap-2.5">
            <Kpi icon={Eye} value={num(stats.completedWs)} label="Completed workspaces" color="text-success" small />
            <Kpi icon={CheckCircle2} value={`${stats.avgProgress}%`} label="Avg workspace progress" color="text-primary" small />
          </div>
        </>
      )}
    </div>
  );
}

function Kpi({ icon: Icon, value, label, color, small }) {
  return (
    <div className="glass-card p-3 text-center">
      <Icon className={`w-4 h-4 ${color} mx-auto`} />
      <p className={`font-heading font-extrabold tabular-nums text-foreground mt-1 ${small ? "text-[15px]" : "text-[18px]"}`}>{value}</p>
      <p className="text-[9px] text-muted-foreground mt-0.5">{label}</p>
    </div>
  );
}