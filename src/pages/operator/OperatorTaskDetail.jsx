import React from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { ArrowLeft, Clock, MapPin, User, Users, FileText, History } from "lucide-react";
import { base44 } from "@/api/base44Client";
import OperatorTaskWorkflow from "@/components/operator/OperatorTaskWorkflow";
import { TASK_STATUS, TASK_PRIORITY, timeUntil } from "@/components/operator/operatorConstants";

export default function OperatorTaskDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { data: user } = useQuery({ queryKey: ["currentUser"], queryFn: () => base44.auth.me(), retry: false });
  const { data: task, isLoading } = useQuery({
    queryKey: ["operatorAssignment", id],
    queryFn: () => base44.entities.OperatorAssignment.get(id),
    enabled: !!id,
  });

  const onChanged = () => qc.invalidateQueries({ queryKey: ["operatorAssignment", id] });

  if (isLoading) return <div className="h-40 rounded-[20px] shimmer mt-2" />;
  if (!task) return <div className="mt-6 text-center text-muted-foreground text-sm">Assignment not found.</div>;

  const status = TASK_STATUS[task.status] || TASK_STATUS.assigned;
  const priority = TASK_PRIORITY[task.priority] || TASK_PRIORITY.normal;

  return (
    <div className="mt-2 space-y-4">
      <div className="flex items-center gap-2">
        <Link to="/operator/tasks" className="w-9 h-9 rounded-[12px] hover:bg-muted/60 flex items-center justify-center spring-tap">
          <ArrowLeft className="w-[18px] h-[18px]" />
        </Link>
        <p className="text-[11px] text-muted-foreground">Task Details</p>
      </div>

      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="rounded-[22px] p-4 glass">
        <div className="flex items-center gap-2 mb-2">
          <span className={`px-2 py-0.5 rounded-full text-[9.5px] font-bold ${priority.bg} ${priority.color}`}>{priority.label}</span>
          <span className={`px-2 py-0.5 rounded-full text-[9.5px] font-bold ${status.tint}`}>{status.label}</span>
        </div>
        <h2 className="font-heading font-bold text-[16px] text-foreground leading-tight">{task.title}</h2>
        {task.department && <p className="text-[11px] text-muted-foreground mt-1">{task.department}{task.operator_category ? ` · ${task.operator_category}` : ""}</p>}

        {task.description && <p className="text-[12px] text-muted-foreground mt-3 leading-relaxed">{task.description}</p>}
        {task.instructions && (
          <div className="mt-3 rounded-[14px] p-3 bg-muted/40">
            <p className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground/70 mb-1 flex items-center gap-1"><FileText className="w-3 h-3" /> Instructions</p>
            <p className="text-[11.5px] text-foreground/90 leading-relaxed whitespace-pre-wrap">{task.instructions}</p>
          </div>
        )}

        <div className="grid grid-cols-2 gap-2.5 mt-3">
          <Info icon={Clock} label="Deadline" value={task.deadline ? new Date(task.deadline).toLocaleString("en", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" }) : "—"} sub={timeUntil(task.deadline)} danger={task.deadline && new Date(task.deadline) < Date.now() && task.status !== "completed"} />
          <Info icon={MapPin} label="Location" value={task.location || "—"} />
          <Info icon={User} label="Assigned by" value={task.created_by_name || "Management"} />
          <Info icon={Users} label="Department" value={task.department || "—"} />
        </div>

        {task.related_people && task.related_people.length > 0 && (
          <div className="mt-3">
            <p className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground/70 mb-1.5">Related People</p>
            <div className="space-y-1">{task.related_people.map((p, i) => (
              <div key={i} className="flex items-center gap-2 text-[11.5px]">
                <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center text-[10px] font-bold text-muted-foreground">{(p.name || "?")[0]}</div>
                <span className="text-foreground font-medium">{p.name}</span>
                {p.role && <span className="text-muted-foreground">· {p.role}</span>}
              </div>
            ))}</div>
          </div>
        )}
      </motion.div>

      <OperatorTaskWorkflow task={task} user={user} onChanged={onChanged} />

      {/* Status timeline */}
      <div className="rounded-[20px] p-3.5 glass">
        <p className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground/70 mb-2.5 flex items-center gap-1"><History className="w-3 h-3" /> Status Timeline</p>
        {(task.status_timeline || []).length === 0 ? (
          <p className="text-[11px] text-muted-foreground">No activity yet.</p>
        ) : (
          <div className="space-y-2.5">
            {[...(task.status_timeline || [])].reverse().map((entry, i) => (
              <div key={i} className="flex gap-2.5">
                <div className="flex flex-col items-center">
                  <div className="w-2 h-2 rounded-full bg-primary mt-1" />
                  {i < (task.status_timeline || []).length - 1 && <div className="w-px flex-1 bg-border" />}
                </div>
                <div className="pb-1">
                  <p className="text-[11.5px] font-semibold text-foreground capitalize">{entry.status.replace("_", " ")}</p>
                  {entry.note && <p className="text-[11px] text-muted-foreground">{entry.note}</p>}
                  <p className="text-[10px] text-muted-foreground/70">{entry.by_name} · {new Date(entry.at).toLocaleString("en", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function Info({ icon: Icon, label, value, sub, danger }) {
  return (
    <div className="rounded-[14px] p-2.5 bg-muted/30">
      <p className="text-[9.5px] font-bold uppercase tracking-wide text-muted-foreground/70 flex items-center gap-1"><Icon className="w-3 h-3" /> {label}</p>
      <p className={`text-[12px] font-semibold mt-0.5 ${danger ? "text-destructive" : "text-foreground"}`}>{value}</p>
      {sub && <p className={`text-[10px] ${danger ? "text-destructive" : "text-muted-foreground"}`}>{sub}</p>}
    </div>
  );
}