import React, { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Award, Clock, CheckCircle2, TrendingUp, Shield, Smartphone } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { getRoleName } from "@/lib/portalConfig";

export default function OperatorProfile() {
  const { data: user } = useQuery({ queryKey: ["currentUser"], queryFn: () => base44.auth.me(), retry: false });
  const { data: tasks } = useQuery({
    queryKey: ["operatorAssignments"],
    queryFn: () => base44.entities.OperatorAssignment.filter({ assigned_to_id: user?.id }, "-created_date", 200),
    enabled: !!user?.id,
  });

  const my = tasks || [];
  const stats = useMemo(() => {
    const completed = my.filter((t) => t.status === "completed");
    const active = my.filter((t) => ["accepted", "in_progress", "paused"].includes(t.status));
    const rejected = my.filter((t) => t.status === "rejected");
    return {
      total: my.length,
      completed: completed.length,
      active: active.length,
      rejected: rejected.length,
      rate: my.length ? Math.round((completed.length / my.length) * 100) : 0,
    };
  }, [my]);

  const current = useMemo(() => my.find((t) => ["accepted", "in_progress", "paused"].includes(t.status)), [my]);

  return (
    <div className="space-y-5 mt-2">
      {/* Identity card */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="rounded-[22px] p-4 glass text-center">
        <div className="w-16 h-16 rounded-full bg-primary/12 text-primary flex items-center justify-center mx-auto mb-2 text-[22px] font-bold">
          {(user?.full_name || "O")[0]}
        </div>
        <h2 className="font-heading font-bold text-[16px] text-foreground">{user?.full_name || "Operator"}</h2>
        <p className="text-[11.5px] text-muted-foreground">{getRoleName(user?.role)}</p>
        <div className="flex items-center justify-center gap-2 mt-2">
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-success/12 text-success flex items-center gap-1"><Shield className="w-3 h-3" /> Active</span>
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold glass text-muted-foreground">{user?.department || "Operations"}</span>
        </div>
      </motion.div>

      {/* Current assignment */}
      <div>
        <p className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground/70 mb-2 px-1">Current Assignment</p>
        {current ? (
          <div className="rounded-[18px] p-3.5 glass">
            <p className="font-heading font-semibold text-[13px] text-foreground">{current.title}</p>
            <p className="text-[11px] text-muted-foreground mt-0.5">{current.department} · {current.status.replace("_", " ")}</p>
          </div>
        ) : (
          <div className="rounded-[18px] p-3.5 glass text-center"><p className="text-[11px] text-muted-foreground">No active assignment right now.</p></div>
        )}
      </div>

      {/* Performance */}
      <div>
        <p className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground/70 mb-2 px-1">Performance</p>
        <div className="grid grid-cols-2 gap-2.5">
          <Metric icon={CheckCircle2} value={stats.completed} label="Completed" tint="bg-success/12 text-success" />
          <Metric icon={Clock} value={stats.active} label="Active" tint="bg-primary/12 text-primary" />
          <Metric icon={TrendingUp} value={`${stats.rate}%`} label="Completion Rate" tint="bg-info/12 text-info" />
          <Metric icon={Award} value={stats.rejected} label="Rejected" tint="bg-destructive/12 text-destructive" />
        </div>
      </div>

      {/* Account */}
      <div>
        <p className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground/70 mb-2 px-1">Account</p>
        <div className="rounded-[18px] p-3.5 glass space-y-2.5 text-[12px]">
          <Row label="Operator ID" value={user?.id || "—"} />
          <Row label="Email" value={user?.email || "—"} />
          <Row label="Department" value={user?.department || "Operations"} />
          <Row label="Role" value={getRoleName(user?.role)} />
          <Row icon={Smartphone} label="Device" value="Verified · this device" />
        </div>
      </div>

      <p className="text-center text-[10px] text-muted-foreground/60 pt-2">UNIBUD Operator System · Spark RBAC protected</p>
    </div>
  );
}

function Metric({ icon: Icon, value, label, tint }) {
  return (
    <div className="rounded-[16px] p-3 glass">
      <div className={`w-8 h-8 rounded-[10px] flex items-center justify-center ${tint} mb-2`}><Icon className="w-4 h-4" /></div>
      <p className="font-heading font-bold text-[18px] text-foreground leading-none">{value}</p>
      <p className="text-[10px] text-muted-foreground mt-1">{label}</p>
    </div>
  );
}

function Row({ icon: Icon, label, value }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-muted-foreground flex items-center gap-1.5">{Icon && <Icon className="w-3 h-3" />} {label}</span>
      <span className="text-foreground font-medium text-right truncate max-w-[60%]">{value}</span>
    </div>
  );
}