import React, { useEffect, useState } from "react";
import { ShieldCheck, ShieldAlert, Clock, XCircle, Sparkles, CheckCircle2 } from "lucide-react";
import { base44 } from "@/api/base44Client";

export default function SecurityOverview({ user, onTab }) {
  const [logins, setLogins] = useState([]);
  const [failed, setFailed] = useState([]);
  const [alerts, setAlerts] = useState([]);

  useEffect(() => {
    (async () => {
      if (!user?.id) return;
      try { const a = await base44.entities.AuditLog.filter({ actor_id: user.id }, "-created_date", 50); setLogins(a.filter((x) => (x.action || "").includes("login") && x.action !== "failed_login").slice(0, 4)); setFailed(a.filter((x) => x.action === "failed_login")); } catch {}
      try { setAlerts((await base44.entities.SecurityEvent.filter({ user_id: user.id }, "-created_date", 20)).filter((e) => !e.acknowledged && e.severity !== "info")); } catch {}
    })();
  }, [user?.id]);

  const recs = [
    { ok: !!user?.data?.mfa_enabled, label: "Enable multi-factor authentication" },
    { ok: alerts.length === 0, label: "Review security alerts" },
    { ok: false, label: "Add a recovery email or phone" },
    { ok: !!user?.data?.privacy, label: "Review your privacy controls" },
  ];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="glass-card radius-lg p-4"><ShieldCheck className="w-5 h-5 text-success mb-2" /><p className="text-[12px] text-muted-foreground">MFA Status</p><p className="text-[15px] font-heading font-semibold">{user?.data?.mfa_enabled ? "Enabled" : "Managed by provider"}</p></div>
        <div className="glass-card radius-lg p-4"><Clock className="w-5 h-5 text-primary mb-2" /><p className="text-[12px] text-muted-foreground">Recent Logins</p><p className="text-[15px] font-heading font-semibold">{logins.length}</p></div>
        <div className="glass-card radius-lg p-4"><XCircle className="w-5 h-5 text-destructive mb-2" /><p className="text-[12px] text-muted-foreground">Failed Attempts</p><p className="text-[15px] font-heading font-semibold">{failed.length}</p></div>
        <div className="glass-card radius-lg p-4"><ShieldAlert className="w-5 h-5 text-warning mb-2" /><p className="text-[12px] text-muted-foreground">Active Alerts</p><p className="text-[15px] font-heading font-semibold">{alerts.length}</p></div>
      </div>

      <div className="glass-card radius-lg p-4">
        <p className="text-[14px] font-heading font-semibold mb-3">Security recommendations</p>
        <div className="space-y-2">{recs.map((r) => (
          <div key={r.label} className="flex items-center gap-2"><CheckCircle2 className={`w-4 h-4 ${r.ok ? "text-success" : "text-muted-foreground/40"}`} /><span className="text-[13px]">{r.label}</span></div>
        ))}</div>
      </div>

      {alerts.length > 0 && (
        <div className="glass-card radius-lg p-4">
          <p className="text-[14px] font-heading font-semibold mb-2 flex items-center gap-2"><Sparkles className="w-4 h-4 text-warning" />Security alerts</p>
          <div className="space-y-2">{alerts.map((a) => (
            <div key={a.id} className="flex items-center gap-2 text-[13px]"><span className={`w-2 h-2 rounded-full ${a.severity === "critical" ? "bg-destructive" : "bg-warning"}`} /><span>{a.description || a.type.replace(/_/g, " ")}</span></div>
          ))}</div>
          <button onClick={() => onTab("activity")} className="text-[12px] text-primary font-semibold mt-2">View all activity →</button>
        </div>
      )}
    </div>
  );
}